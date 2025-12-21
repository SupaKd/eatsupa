const { pool } = require('../config/database');
const { generateOrderNumber, paginate, paginatedResponse, calculateOrderTotal } = require('../utils/helpers');

// Récupérer les commandes (selon le rôle)
const getCommandes = async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, restaurant_id, date_debut, date_fin } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filtrer selon le rôle
    if (req.user.role === 'client') {
      whereClause += ' AND c.utilisateur_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'restaurateur') {
      // Récupérer le restaurant du restaurateur
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ?',
        [req.user.id]
      );
      if (restaurants.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: queryLimit, total: 0, totalPages: 0 }
        });
      }
      whereClause += ' AND c.restaurant_id = ?';
      params.push(restaurants[0].id);
    } else if (restaurant_id) {
      // Admin peut filtrer par restaurant
      whereClause += ' AND c.restaurant_id = ?';
      params.push(restaurant_id);
    }

    if (statut) {
      whereClause += ' AND c.statut = ?';
      params.push(statut);
    }

    if (date_debut) {
      whereClause += ' AND c.date_commande >= ?';
      params.push(date_debut);
    }

    if (date_fin) {
      whereClause += ' AND c.date_commande <= ?';
      params.push(date_fin);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM commandes c ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Récupérer les commandes
    const [commandes] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom, 
              u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
       ${whereClause}
       ORDER BY c.date_commande DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    // Parser les items JSON
    const commandesFormatted = commandes.map(cmd => ({
      ...cmd,
      items: typeof cmd.items_json === 'string' ? JSON.parse(cmd.items_json) : cmd.items_json
    }));

    res.json({
      success: true,
      ...paginatedResponse(commandesFormatted, page, queryLimit, total)
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes.'
    });
  }
};

// Récupérer une commande par ID
const getCommandeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [commandes] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom, r.telephone as restaurant_telephone,
              r.adresse as restaurant_adresse, r.ville as restaurant_ville,
              u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    // Vérifier les droits d'accès
    const commande = commandes[0];
    if (req.user.role === 'client' && commande.utilisateur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé.'
      });
    }

    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ? AND id = ?',
        [req.user.id, commande.restaurant_id]
      );
      if (restaurants.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé.'
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...commande,
        items: typeof commande.items_json === 'string' 
          ? JSON.parse(commande.items_json) 
          : commande.items_json
      }
    });
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande.'
    });
  }
};

// Créer une commande
const createCommande = async (req, res) => {
  try {
    const { restaurant_id, items, telephone_client, notes } = req.body;

    // Vérifier que le restaurant existe et est actif
    const [restaurants] = await pool.query(
      'SELECT id, nom FROM restaurants WHERE id = ? AND actif = 1',
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé ou inactif.'
      });
    }

    // Vérifier et récupérer les plats
    const platIds = items.map(item => item.plat_id);
    const [plats] = await pool.query(
      'SELECT id, nom, prix, disponible FROM plats WHERE id IN (?) AND restaurant_id = ?',
      [platIds, restaurant_id]
    );

    if (plats.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'Un ou plusieurs plats sont invalides.'
      });
    }

    // Vérifier la disponibilité et construire les items
    const itemsJson = [];
    let montantTotal = 0;

    for (const item of items) {
      const plat = plats.find(p => p.id === item.plat_id);
      
      if (!plat.disponible) {
        return res.status(400).json({
          success: false,
          message: `Le plat "${plat.nom}" n'est plus disponible.`
        });
      }

      const sousTotal = parseFloat(plat.prix) * item.quantite;
      montantTotal += sousTotal;

      itemsJson.push({
        plat_id: plat.id,
        nom_plat: plat.nom,
        prix_unitaire: parseFloat(plat.prix),
        quantite: item.quantite,
        sous_total: sousTotal
      });
    }

    // Générer le numéro de commande
    const numeroCommande = generateOrderNumber();

    // Créer la commande
    const [result] = await pool.query(
      `INSERT INTO commandes 
       (restaurant_id, utilisateur_id, numero_commande, montant_total, 
        telephone_client, notes, items_json, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente')`,
      [
        restaurant_id,
        req.user?.id || null,
        numeroCommande,
        montantTotal,
        telephone_client,
        notes || null,
        JSON.stringify(itemsJson)
      ]
    );

    // Récupérer la commande créée
    const [newCommande] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    // Émettre un événement WebSocket si disponible
    if (req.io) {
      req.io.to(`restaurant_${restaurant_id}`).emit('nouvelle_commande', {
        ...newCommande[0],
        items: itemsJson
      });
    }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      data: {
        ...newCommande[0],
        items: itemsJson
      }
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande.'
    });
  }
};

// Mettre à jour le statut d'une commande
const updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const validStatuts = [
      'en_attente', 'confirmee', 'en_preparation', 
      'prete', 'livree', 'recuperee', 'annulee'
    ];

    if (!validStatuts.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide.'
      });
    }

    // Vérifier que la commande existe
    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE id = ?',
      [id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    // Mettre à jour les heures selon le statut
    let heureField = null;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    switch (statut) {
      case 'confirmee':
        heureField = 'heure_confirmation';
        break;
      case 'en_preparation':
        heureField = 'heure_preparation';
        break;
      case 'prete':
        heureField = 'heure_prete';
        break;
      case 'livree':
      case 'recuperee':
        heureField = 'heure_livraison';
        break;
    }

    let query = 'UPDATE commandes SET statut = ?';
    const params = [statut];

    if (heureField) {
      query += `, ${heureField} = ?`;
      params.push(now);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);

    // Récupérer la commande mise à jour
    const [updatedCommande] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ?`,
      [id]
    );

    // Émettre un événement WebSocket
    if (req.io) {
      const commande = updatedCommande[0];
      req.io.to(`restaurant_${commande.restaurant_id}`).emit('statut_commande', {
        id: commande.id,
        numero_commande: commande.numero_commande,
        statut: commande.statut
      });
      
      // Notifier le client si connecté
      if (commande.utilisateur_id) {
        req.io.to(`user_${commande.utilisateur_id}`).emit('statut_commande', {
          id: commande.id,
          numero_commande: commande.numero_commande,
          statut: commande.statut
        });
      }
    }

    res.json({
      success: true,
      message: `Commande ${statut.replace('_', ' ')}.`,
      data: {
        ...updatedCommande[0],
        items: typeof updatedCommande[0].items_json === 'string'
          ? JSON.parse(updatedCommande[0].items_json)
          : updatedCommande[0].items_json
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut.'
    });
  }
};

// Annuler une commande
const annulerCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE id = ?',
      [id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Vérifier si la commande peut être annulée
    if (['livree', 'recuperee', 'annulee'].includes(commande.statut)) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut plus être annulée.'
      });
    }

    // Vérifier les droits
    if (req.user.role === 'client' && commande.utilisateur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé.'
      });
    }

    await pool.query(
      'UPDATE commandes SET statut = ? WHERE id = ?',
      ['annulee', id]
    );

    // Émettre un événement WebSocket
    if (req.io) {
      req.io.to(`restaurant_${commande.restaurant_id}`).emit('commande_annulee', {
        id: commande.id,
        numero_commande: commande.numero_commande
      });
    }

    res.json({
      success: true,
      message: 'Commande annulée.'
    });
  } catch (error) {
    console.error('Erreur annulation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la commande.'
    });
  }
};

// Statistiques des commandes (restaurateur/admin)
const getStatistiques = async (req, res) => {
  try {
    let restaurantId = req.query.restaurant_id;

    // Si restaurateur, utiliser son restaurant
    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ?',
        [req.user.id]
      );
      if (restaurants.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant non trouvé.'
        });
      }
      restaurantId = restaurants[0].id;
    }

    let whereClause = '';
    const params = [];

    if (restaurantId) {
      whereClause = 'WHERE restaurant_id = ?';
      params.push(restaurantId);
    }

    // Statistiques générales
    const [general] = await pool.query(
      `SELECT 
        COUNT(*) as total_commandes,
        SUM(montant_total) as ca_total,
        AVG(montant_total) as panier_moyen,
        SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as commandes_annulees
       FROM commandes ${whereClause}`,
      params
    );

    // Statistiques du jour
    const [jour] = await pool.query(
      `SELECT 
        COUNT(*) as commandes_jour,
        SUM(montant_total) as ca_jour
       FROM commandes 
       ${whereClause ? whereClause + ' AND' : 'WHERE'} DATE(date_commande) = CURDATE()`,
      params
    );

    // Statistiques de la semaine
    const [semaine] = await pool.query(
      `SELECT 
        COUNT(*) as commandes_semaine,
        SUM(montant_total) as ca_semaine
       FROM commandes 
       ${whereClause ? whereClause + ' AND' : 'WHERE'} 
       date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      params
    );

    // Répartition par statut
    const [parStatut] = await pool.query(
      `SELECT statut, COUNT(*) as count
       FROM commandes ${whereClause}
       GROUP BY statut`,
      params
    );

    res.json({
      success: true,
      data: {
        general: general[0],
        jour: jour[0],
        semaine: semaine[0],
        par_statut: parStatut
      }
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques.'
    });
  }
};

module.exports = {
  getCommandes,
  getCommandeById,
  createCommande,
  updateStatut,
  annulerCommande,
  getStatistiques
};