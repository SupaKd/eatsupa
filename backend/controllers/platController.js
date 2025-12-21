const { pool } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/helpers');

// Récupérer les plats d'un restaurant
const getPlatsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 50, categorie_id, disponible, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE p.restaurant_id = ?';
    const params = [restaurantId];

    if (categorie_id) {
      whereClause += ' AND p.categorie_id = ?';
      params.push(categorie_id);
    }

    if (disponible !== undefined) {
      whereClause += ' AND p.disponible = ?';
      params.push(disponible === 'true' ? 1 : 0);
    }

    if (search) {
      whereClause += ' AND (p.nom LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM plats p ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Récupérer les plats
    const [plats] = await pool.query(
      `SELECT p.*, c.nom as categorie_nom
       FROM plats p
       LEFT JOIN categories c ON p.categorie_id = c.id
       ${whereClause}
       ORDER BY p.categorie_id, p.ordre ASC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    res.json({
      success: true,
      ...paginatedResponse(plats, page, queryLimit, total)
    });
  } catch (error) {
    console.error('Erreur récupération plats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plats.'
    });
  }
};

// Récupérer un plat par ID
const getPlatById = async (req, res) => {
  try {
    const { id } = req.params;

    const [plats] = await pool.query(
      `SELECT p.*, c.nom as categorie_nom, r.nom as restaurant_nom
       FROM plats p
       LEFT JOIN categories c ON p.categorie_id = c.id
       LEFT JOIN restaurants r ON p.restaurant_id = r.id
       WHERE p.id = ?`,
      [id]
    );

    if (plats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plat non trouvé.'
      });
    }

    res.json({
      success: true,
      data: plats[0]
    });
  } catch (error) {
    console.error('Erreur récupération plat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du plat.'
    });
  }
};

// Créer un plat
const createPlat = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const {
      nom, description, prix, categorie_id,
      allergenes, ordre, disponible = true
    } = req.body;

    // Vérifier que la catégorie appartient au restaurant
    if (categorie_id) {
      const [categories] = await pool.query(
        'SELECT id FROM categories WHERE id = ? AND restaurant_id = ?',
        [categorie_id, restaurantId]
      );

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie invalide pour ce restaurant.'
        });
      }
    }

    // Déterminer l'ordre si non fourni
    let platOrder = ordre;
    if (platOrder === undefined) {
      const [maxOrder] = await pool.query(
        'SELECT MAX(ordre) as max_ordre FROM plats WHERE restaurant_id = ? AND categorie_id = ?',
        [restaurantId, categorie_id || null]
      );
      platOrder = (maxOrder[0].max_ordre || 0) + 1;
    }

    const [result] = await pool.query(
      `INSERT INTO plats (restaurant_id, categorie_id, nom, description, prix, allergenes, ordre, disponible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantId,
        categorie_id || null,
        nom,
        description || null,
        prix,
        allergenes ? JSON.stringify(allergenes) : null,
        platOrder,
        disponible ? 1 : 0
      ]
    );

    const [newPlat] = await pool.query(
      `SELECT p.*, c.nom as categorie_nom
       FROM plats p
       LEFT JOIN categories c ON p.categorie_id = c.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Plat créé.',
      data: newPlat[0]
    });
  } catch (error) {
    console.error('Erreur création plat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du plat.'
    });
  }
};

// Mettre à jour un plat
const updatePlat = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'nom', 'description', 'prix', 'categorie_id',
      'allergenes', 'ordre', 'disponible'
    ];

    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'allergenes' && typeof updates[field] === 'object') {
          values.push(JSON.stringify(updates[field]));
        } else if (field === 'disponible') {
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
      `UPDATE plats SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedPlat] = await pool.query(
      `SELECT p.*, c.nom as categorie_nom
       FROM plats p
       LEFT JOIN categories c ON p.categorie_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Plat mis à jour.',
      data: updatedPlat[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour plat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du plat.'
    });
  }
};

// Supprimer un plat
const deletePlat = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM plats WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Plat supprimé.'
    });
  } catch (error) {
    console.error('Erreur suppression plat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du plat.'
    });
  }
};

// Mettre à jour l'image d'un plat
const updatePlatImage = async (req, res) => {
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
      'UPDATE plats SET image_url = ? WHERE id = ?',
      [imageUrl, id]
    );

    res.json({
      success: true,
      message: 'Image mise à jour.',
      data: { image_url: imageUrl }
    });
  } catch (error) {
    console.error('Erreur mise à jour image plat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'image.'
    });
  }
};

// Basculer la disponibilité d'un plat
const toggleDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;

    const [plat] = await pool.query(
      'SELECT disponible FROM plats WHERE id = ?',
      [id]
    );

    if (plat.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plat non trouvé.'
      });
    }

    const newDisponibilite = plat[0].disponible ? 0 : 1;

    await pool.query(
      'UPDATE plats SET disponible = ? WHERE id = ?',
      [newDisponibilite, id]
    );

    res.json({
      success: true,
      message: newDisponibilite ? 'Plat disponible.' : 'Plat indisponible.',
      data: { disponible: Boolean(newDisponibilite) }
    });
  } catch (error) {
    console.error('Erreur toggle disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la disponibilité.'
    });
  }
};

module.exports = {
  getPlatsByRestaurant,
  getPlatById,
  createPlat,
  updatePlat,
  deletePlat,
  updatePlatImage,
  toggleDisponibilite
};