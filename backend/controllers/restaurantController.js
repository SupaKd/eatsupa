const { pool } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/helpers');

// Récupérer tous les restaurants (public)
const getAllRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 10, ville, type_cuisine, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE r.actif = 1';
    const params = [];

    if (ville) {
      whereClause += ' AND r.ville LIKE ?';
      params.push(`%${ville}%`);
    }

    if (type_cuisine) {
      whereClause += ' AND r.type_cuisine LIKE ?';
      params.push(`%${type_cuisine}%`);
    }

    if (search) {
      whereClause += ' AND (r.nom LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM restaurants r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Récupérer les restaurants
    const [restaurants] = await pool.query(
      `SELECT r.*, u.nom as proprietaire_nom, u.prenom as proprietaire_prenom
       FROM restaurants r
       LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    res.json({
      success: true,
      ...paginatedResponse(restaurants, page, queryLimit, total)
    });
  } catch (error) {
    console.error('Erreur récupération restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des restaurants.'
    });
  }
};

// Récupérer un restaurant par ID (public)
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const [restaurants] = await pool.query(
      `SELECT r.*, u.nom as proprietaire_nom, u.prenom as proprietaire_prenom
       FROM restaurants r
       LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    // Récupérer les catégories avec les plats
    const [categories] = await pool.query(
      `SELECT * FROM categories WHERE restaurant_id = ? AND actif = 1 ORDER BY ordre ASC`,
      [id]
    );

    const [plats] = await pool.query(
      `SELECT * FROM plats WHERE restaurant_id = ? AND disponible = 1 ORDER BY categorie_id, ordre ASC`,
      [id]
    );

    // Organiser les plats par catégorie
    const categoriesWithPlats = categories.map(cat => ({
      ...cat,
      plats: plats.filter(p => p.categorie_id === cat.id)
    }));

    res.json({
      success: true,
      data: {
        ...restaurants[0],
        categories: categoriesWithPlats
      }
    });
  } catch (error) {
    console.error('Erreur récupération restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du restaurant.'
    });
  }
};

// Créer un restaurant (restaurateur uniquement)
const createRestaurant = async (req, res) => {
  try {
    const {
      nom, description, adresse, ville, code_postal,
      telephone, email, type_cuisine, delai_preparation,
      frais_livraison, horaires_ouverture
    } = req.body;

    // Vérifier si l'utilisateur a déjà un restaurant
    const [existing] = await pool.query(
      'SELECT id FROM restaurants WHERE utilisateur_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà un restaurant.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO restaurants 
       (utilisateur_id, nom, description, adresse, ville, code_postal, 
        telephone, email, type_cuisine, delai_preparation, frais_livraison, horaires_ouverture)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, nom, description || null, adresse, ville, code_postal,
        telephone, email, type_cuisine || null, delai_preparation || 30,
        frais_livraison || 0, horaires_ouverture ? JSON.stringify(horaires_ouverture) : null
      ]
    );

    const [newRestaurant] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Restaurant créé avec succès.',
      data: newRestaurant[0]
    });
  } catch (error) {
    console.error('Erreur création restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du restaurant.'
    });
  }
};

// Mettre à jour un restaurant
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Construire la requête de mise à jour dynamiquement
    const allowedFields = [
      'nom', 'description', 'adresse', 'ville', 'code_postal',
      'telephone', 'email', 'type_cuisine', 'delai_preparation',
      'frais_livraison', 'horaires_ouverture', 'actif'
    ];

    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'horaires_ouverture' && typeof updates[field] === 'object') {
          values.push(JSON.stringify(updates[field]));
        } else {
          values.push(updates[field]);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour.'
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE restaurants SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedRestaurant] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Restaurant mis à jour.',
      data: updatedRestaurant[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du restaurant.'
    });
  }
};

// Supprimer un restaurant
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM restaurants WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Restaurant supprimé.'
    });
  } catch (error) {
    console.error('Erreur suppression restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du restaurant.'
    });
  }
};

// Mettre à jour l'image du restaurant
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie.'
      });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;

    await pool.query(
      'UPDATE restaurants SET image = ? WHERE id = ?',
      [imageUrl, id]
    );

    res.json({
      success: true,
      message: 'Image mise à jour.',
      data: { image: imageUrl }
    });
  } catch (error) {
    console.error('Erreur mise à jour image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'image.'
    });
  }
};

// Récupérer le restaurant du restaurateur connecté
const getMyRestaurant = async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE utilisateur_id = ?',
      [req.user.id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vous n\'avez pas encore de restaurant.'
      });
    }

    // Récupérer les statistiques
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_commandes,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as commandes_en_attente,
        SUM(CASE WHEN statut = 'en_preparation' THEN 1 ELSE 0 END) as commandes_en_preparation,
        SUM(CASE WHEN DATE(date_commande) = CURDATE() THEN montant_total ELSE 0 END) as ca_jour,
        SUM(montant_total) as ca_total
       FROM commandes WHERE restaurant_id = ?`,
      [restaurants[0].id]
    );

    res.json({
      success: true,
      data: {
        restaurant: restaurants[0],
        stats: stats[0]
      }
    });
  } catch (error) {
    console.error('Erreur récupération mon restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du restaurant.'
    });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateImage,
  getMyRestaurant
};