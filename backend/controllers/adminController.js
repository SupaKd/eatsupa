const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/helpers');

// ========== GESTION DES UTILISATEURS ==========

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      whereClause += ' AND (email LIKE ? OR nom LIKE ? OR prenom LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM utilisateurs ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [users] = await pool.query(
      `SELECT id, email, role, nom, prenom, telephone, photo_url, created_at, updated_at
       FROM utilisateurs ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    res.json({
      success: true,
      ...paginatedResponse(users, page, queryLimit, total)
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs.'
    });
  }
};

// Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT id, email, role, nom, prenom, telephone, photo_url, created_at, updated_at
       FROM utilisateurs WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    let restaurant = null;
    if (users[0].role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT * FROM restaurants WHERE utilisateur_id = ?',
        [id]
      );
      restaurant = restaurants[0] || null;
    }

    let stats = null;
    if (users[0].role === 'client') {
      const [commandeStats] = await pool.query(
        `SELECT COUNT(*) as total_commandes, COALESCE(SUM(montant_total), 0) as total_depense
         FROM commandes WHERE utilisateur_id = ?`,
        [id]
      );
      stats = commandeStats[0];
    }

    res.json({
      success: true,
      data: { user: users[0], restaurant, stats }
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur.'
    });
  }
};

// Créer un utilisateur
const createUser = async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, role = 'client' } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO utilisateurs (email, password, nom, prenom, telephone, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nom, prenom, telephone || null, role]
    );

    const [newUser] = await pool.query(
      `SELECT id, email, role, nom, prenom, telephone, created_at
       FROM utilisateurs WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé.',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur.'
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nom, prenom, telephone, role, password } = req.body;

    const updates = [];
    const values = [];

    if (email) {
      const [existing] = await pool.query(
        'SELECT id FROM utilisateurs WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé.'
        });
      }
      updates.push('email = ?');
      values.push(email);
    }

    if (nom) { updates.push('nom = ?'); values.push(nom); }
    if (prenom) { updates.push('prenom = ?'); values.push(prenom); }
    if (telephone !== undefined) { updates.push('telephone = ?'); values.push(telephone); }
    if (role) { updates.push('role = ?'); values.push(role); }

    if (password) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour.' });
    }

    values.push(id);
    await pool.query(`UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedUser] = await pool.query(
      `SELECT id, email, role, nom, prenom, telephone, created_at, updated_at FROM utilisateurs WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Utilisateur mis à jour.', data: updatedUser[0] });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte.'
      });
    }

    await pool.query('DELETE FROM utilisateurs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression.' });
  }
};

// ========== GESTION DES RESTAURANTS ==========

const getAllRestaurantsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, actif, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (actif !== undefined && actif !== '') {
      whereClause += ' AND r.actif = ?';
      params.push(actif === 'true' ? 1 : 0);
    }

    if (search) {
      whereClause += ' AND (r.nom LIKE ? OR r.ville LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM restaurants r ${whereClause}`,
      params
    );

    const [restaurants] = await pool.query(
      `SELECT r.*, u.nom as proprietaire_nom, u.prenom as proprietaire_prenom, u.email as proprietaire_email,
              (SELECT COUNT(*) FROM commandes WHERE restaurant_id = r.id) as total_commandes,
              (SELECT COALESCE(SUM(montant_total), 0) FROM commandes WHERE restaurant_id = r.id) as ca_total
       FROM restaurants r
       LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    res.json({
      success: true,
      ...paginatedResponse(restaurants, page, queryLimit, countResult[0].total)
    });
  } catch (error) {
    console.error('Erreur récupération restaurants admin:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération.' });
  }
};

const toggleRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [restaurants] = await pool.query('SELECT actif FROM restaurants WHERE id = ?', [id]);

    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant non trouvé.' });
    }

    const newStatus = restaurants[0].actif ? 0 : 1;
    await pool.query('UPDATE restaurants SET actif = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: newStatus ? 'Restaurant activé.' : 'Restaurant désactivé.',
      data: { actif: Boolean(newStatus) }
    });
  } catch (error) {
    console.error('Erreur toggle statut:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la modification.' });
  }
};

// ========== GESTION DES COMMANDES (ADMIN) ==========

const getAllCommandesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, statut, paiement_statut, restaurant_id, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (statut) {
      whereClause += ' AND c.statut = ?';
      params.push(statut);
    }

    if (paiement_statut) {
      whereClause += ' AND c.paiement_statut = ?';
      params.push(paiement_statut);
    }

    if (restaurant_id) {
      whereClause += ' AND c.restaurant_id = ?';
      params.push(restaurant_id);
    }

    if (search) {
      whereClause += ' AND (c.numero_commande LIKE ? OR c.telephone_client LIKE ? OR c.email_client LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM commandes c 
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [commandes] = await pool.query(
      `SELECT c.*, 
              r.nom as restaurant_nom,
              u.nom as client_nom, 
              u.prenom as client_prenom, 
              u.email as client_email
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
       ${whereClause}
       ORDER BY c.date_commande DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    res.json({
      success: true,
      ...paginatedResponse(commandes, page, queryLimit, total)
    });
  } catch (error) {
    console.error('Erreur récupération commandes admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes.'
    });
  }
};

// ========== STATISTIQUES GLOBALES ==========

const getDashboardStats = async (req, res) => {
  try {
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_utilisateurs,
        SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as total_clients,
        SUM(CASE WHEN role = 'restaurateur' THEN 1 ELSE 0 END) as total_restaurateurs,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as nouveaux_aujourd_hui
      FROM utilisateurs
    `);

    const [restaurantStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_restaurants,
        SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) as restaurants_actifs,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as nouveaux_aujourd_hui
      FROM restaurants
    `);

    const [commandeStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_commandes,
        COALESCE(SUM(montant_total), 0) as ca_total,
        COALESCE(AVG(montant_total), 0) as panier_moyen,
        SUM(CASE WHEN DATE(date_commande) = CURDATE() THEN 1 ELSE 0 END) as commandes_aujourd_hui,
        COALESCE(SUM(CASE WHEN DATE(date_commande) = CURDATE() THEN montant_total ELSE 0 END), 0) as ca_aujourd_hui,
        COALESCE(SUM(CASE WHEN date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN montant_total ELSE 0 END), 0) as ca_semaine,
        COALESCE(SUM(CASE WHEN date_commande >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN montant_total ELSE 0 END), 0) as ca_mois
      FROM commandes
    `);

    const [parStatut] = await pool.query(`
      SELECT statut, COUNT(*) as count FROM commandes GROUP BY statut
    `);

    const [topRestaurants] = await pool.query(`
      SELECT r.id, r.nom, r.ville, COUNT(c.id) as nb_commandes, COALESCE(SUM(c.montant_total), 0) as ca
      FROM restaurants r
      LEFT JOIN commandes c ON r.id = c.restaurant_id
      GROUP BY r.id
      ORDER BY ca DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        utilisateurs: userStats[0],
        restaurants: restaurantStats[0],
        commandes: commandeStats[0],
        commandes_par_statut: parStatut,
        top_restaurants: topRestaurants
      }
    });
  } catch (error) {
    console.error('Erreur dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRestaurantsAdmin,
  toggleRestaurantStatus,
  getAllCommandesAdmin,
  getDashboardStats
};