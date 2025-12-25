const { pool } = require('../config/database');
const { paginate, paginatedResponse, isRestaurantOpen, getNextOpeningTime, getClosingTime } = require('../utils/helpers');

// Récupérer tous les restaurants (public)
const getAllRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 10, ville, type_cuisine, search, actif } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE r.actif = 1';
    const params = [];

    // Pour les admins, permettre de voir les inactifs aussi
    if (req.user && req.user.role === 'admin' && actif !== undefined) {
      whereClause = 'WHERE r.actif = ?';
      params.push(actif === 'true' ? 1 : 0);
    }

    if (ville) {
      whereClause += ' AND r.ville LIKE ?';
      params.push(`%${ville}%`);
    }

    if (type_cuisine) {
      whereClause += ' AND r.type_cuisine LIKE ?';
      params.push(`%${type_cuisine}%`);
    }

    if (search) {
      whereClause += ' AND (r.nom LIKE ? OR r.description LIKE ? OR r.type_cuisine LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM restaurants r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Récupérer les restaurants avec les infos de paiement
    const [restaurants] = await pool.query(
      `SELECT r.id, r.nom, r.description, r.adresse, r.ville, r.code_postal,
              r.telephone, r.email, r.type_cuisine, r.horaires_ouverture,
              r.image, r.delai_preparation, r.frais_livraison, r.actif,
              r.paiement_sur_place, r.paiement_en_ligne,
              r.created_at, r.updated_at,
              u.nom as proprietaire_nom, u.prenom as proprietaire_prenom
       FROM restaurants r
       LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    // Ajouter le statut d'ouverture pour chaque restaurant
    const restaurantsWithStatus = restaurants.map(r => {
      const estOuvert = isRestaurantOpen(r.horaires_ouverture);
      return {
        ...r,
        paiement_sur_place: Boolean(r.paiement_sur_place),
        paiement_en_ligne: Boolean(r.paiement_en_ligne),
        est_ouvert: estOuvert,
        prochaine_ouverture: !estOuvert ? getNextOpeningTime(r.horaires_ouverture) : null,
        heure_fermeture: estOuvert ? getClosingTime(r.horaires_ouverture) : null
      };
    });

    res.json({
      success: true,
      ...paginatedResponse(restaurantsWithStatus, page, queryLimit, total)
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

    const restaurant = restaurants[0];

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

    // Ajouter les plats sans catégorie
    const platsSansCategorie = plats.filter(p => p.categorie_id === null);
    if (platsSansCategorie.length > 0) {
      categoriesWithPlats.push({
        id: null,
        nom: 'Autres',
        description: null,
        ordre: 999,
        plats: platsSansCategorie
      });
    }

    // Statut d'ouverture
    const estOuvert = isRestaurantOpen(restaurant.horaires_ouverture);

    // Modes de paiement disponibles
    const modesPaiement = [];
    if (restaurant.paiement_sur_place) {
      modesPaiement.push({
        id: 'sur_place',
        label: 'Paiement sur place',
        description: 'Payez en espèces ou par carte à la récupération'
      });
    }
    if (restaurant.paiement_en_ligne && restaurant.stripe_onboarding_complete) {
      modesPaiement.push({
        id: 'en_ligne',
        label: 'Paiement en ligne',
        description: 'Payez maintenant par carte bancaire'
      });
    }

    res.json({
      success: true,
      data: {
        ...restaurant,
        paiement_sur_place: Boolean(restaurant.paiement_sur_place),
        paiement_en_ligne: Boolean(restaurant.paiement_en_ligne && restaurant.stripe_onboarding_complete),
        modes_paiement: modesPaiement,
        categories: categoriesWithPlats,
        est_ouvert: estOuvert,
        prochaine_ouverture: !estOuvert ? getNextOpeningTime(restaurant.horaires_ouverture) : null,
        heure_fermeture: estOuvert ? getClosingTime(restaurant.horaires_ouverture) : null
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
      frais_livraison, horaires_ouverture,
      paiement_sur_place = true, paiement_en_ligne = false
    } = req.body;

    // Vérifier si l'utilisateur a déjà un restaurant
    const [existing] = await pool.query(
      'SELECT id FROM restaurants WHERE utilisateur_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà un restaurant. Un compte restaurateur ne peut avoir qu\'un seul restaurant.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO restaurants 
       (utilisateur_id, nom, description, adresse, ville, code_postal, 
        telephone, email, type_cuisine, delai_preparation, frais_livraison, 
        horaires_ouverture, paiement_sur_place, paiement_en_ligne)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        nom,
        description || null,
        adresse,
        ville,
        code_postal,
        telephone,
        email,
        type_cuisine || null,
        delai_preparation || 30,
        frais_livraison || 0,
        horaires_ouverture ? JSON.stringify(horaires_ouverture) : null,
        paiement_sur_place ? 1 : 0,
        paiement_en_ligne ? 1 : 0
      ]
    );

    const [newRestaurant] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Restaurant créé avec succès.',
      data: {
        ...newRestaurant[0],
        paiement_sur_place: Boolean(newRestaurant[0].paiement_sur_place),
        paiement_en_ligne: Boolean(newRestaurant[0].paiement_en_ligne)
      }
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

    // Vérifier que le restaurant existe
    const [existing] = await pool.query('SELECT id FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    // Construire la requête de mise à jour dynamiquement
    const allowedFields = [
      'nom', 'description', 'adresse', 'ville', 'code_postal',
      'telephone', 'email', 'type_cuisine', 'delai_preparation',
      'frais_livraison', 'horaires_ouverture', 'actif',
      'paiement_sur_place', 'paiement_en_ligne'
    ];

    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'horaires_ouverture' && typeof updates[field] === 'object') {
          values.push(JSON.stringify(updates[field]));
        } else if (['actif', 'paiement_sur_place', 'paiement_en_ligne'].includes(field)) {
          values.push(updates[field] ? 1 : 0);
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
      message: 'Restaurant mis à jour avec succès.',
      data: {
        ...updatedRestaurant[0],
        paiement_sur_place: Boolean(updatedRestaurant[0].paiement_sur_place),
        paiement_en_ligne: Boolean(updatedRestaurant[0].paiement_en_ligne)
      }
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

    // Vérifier que le restaurant existe
    const [existing] = await pool.query('SELECT id, nom FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    // Vérifier s'il y a des commandes en cours
    const [commandesEnCours] = await pool.query(
      `SELECT COUNT(*) as count FROM commandes 
       WHERE restaurant_id = ? AND statut NOT IN ('livree', 'recuperee', 'annulee')`,
      [id]
    );

    if (commandesEnCours[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce restaurant. ${commandesEnCours[0].count} commande(s) en cours.`
      });
    }

    await pool.query('DELETE FROM restaurants WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Restaurant "${existing[0].nom}" supprimé avec succès.`
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
      message: 'Image mise à jour avec succès.',
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
        message: 'Vous n\'avez pas encore de restaurant.',
        code: 'NO_RESTAURANT'
      });
    }

    const restaurant = restaurants[0];

    // Récupérer les statistiques
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_commandes,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as commandes_en_attente,
        SUM(CASE WHEN statut = 'confirmee' THEN 1 ELSE 0 END) as commandes_confirmees,
        SUM(CASE WHEN statut = 'en_preparation' THEN 1 ELSE 0 END) as commandes_en_preparation,
        SUM(CASE WHEN statut = 'prete' THEN 1 ELSE 0 END) as commandes_pretes,
        SUM(CASE WHEN DATE(date_commande) = CURDATE() THEN montant_total ELSE 0 END) as ca_jour,
        SUM(CASE WHEN date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN montant_total ELSE 0 END) as ca_semaine,
        SUM(CASE WHEN date_commande >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN montant_total ELSE 0 END) as ca_mois,
        SUM(montant_total) as ca_total,
        SUM(CASE WHEN paiement_statut = 'paye' THEN montant_total ELSE 0 END) as total_paye,
        SUM(CASE WHEN paiement_statut = 'en_attente' AND mode_paiement = 'sur_place' THEN montant_total ELSE 0 END) as en_attente_sur_place,
        SUM(CASE WHEN paiement_statut = 'en_attente' AND mode_paiement = 'en_ligne' THEN montant_total ELSE 0 END) as en_attente_en_ligne
       FROM commandes WHERE restaurant_id = ?`,
      [restaurant.id]
    );

    // Compter les catégories et plats
    const [counts] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM categories WHERE restaurant_id = ? AND actif = 1) as nb_categories,
        (SELECT COUNT(*) FROM plats WHERE restaurant_id = ? AND disponible = 1) as nb_plats_actifs,
        (SELECT COUNT(*) FROM plats WHERE restaurant_id = ?) as nb_plats_total`,
      [restaurant.id, restaurant.id, restaurant.id]
    );

    // Commandes récentes
    const [commandesRecentes] = await pool.query(
      `SELECT id, numero_commande, montant_total, statut, mode_paiement, paiement_statut, date_commande, telephone_client
       FROM commandes 
       WHERE restaurant_id = ?
       ORDER BY date_commande DESC
       LIMIT 5`,
      [restaurant.id]
    );

    // Statut d'ouverture
    const estOuvert = isRestaurantOpen(restaurant.horaires_ouverture);

    res.json({
      success: true,
      data: {
        restaurant: {
          ...restaurant,
          paiement_sur_place: Boolean(restaurant.paiement_sur_place),
          paiement_en_ligne: Boolean(restaurant.paiement_en_ligne),
          stripe_configure: Boolean(restaurant.stripe_account_id && restaurant.stripe_onboarding_complete),
          est_ouvert: estOuvert,
          prochaine_ouverture: !estOuvert ? getNextOpeningTime(restaurant.horaires_ouverture) : null,
          heure_fermeture: estOuvert ? getClosingTime(restaurant.horaires_ouverture) : null
        },
        stats: {
          ...stats[0],
          ca_jour: parseFloat(stats[0].ca_jour) || 0,
          ca_semaine: parseFloat(stats[0].ca_semaine) || 0,
          ca_mois: parseFloat(stats[0].ca_mois) || 0,
          ca_total: parseFloat(stats[0].ca_total) || 0,
          total_paye: parseFloat(stats[0].total_paye) || 0,
          en_attente_sur_place: parseFloat(stats[0].en_attente_sur_place) || 0,
          en_attente_en_ligne: parseFloat(stats[0].en_attente_en_ligne) || 0,
          ...counts[0]
        },
        commandes_recentes: commandesRecentes
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