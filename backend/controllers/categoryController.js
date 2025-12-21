const { pool } = require('../config/database');

// Récupérer les catégories d'un restaurant
const getCategoriesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const [categories] = await pool.query(
      `SELECT c.*, COUNT(p.id) as nb_plats
       FROM categories c
       LEFT JOIN plats p ON c.id = p.categorie_id AND p.disponible = 1
       WHERE c.restaurant_id = ?
       GROUP BY c.id
       ORDER BY c.ordre ASC`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories.'
    });
  }
};

// Créer une catégorie
const createCategory = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { nom, description, ordre } = req.body;

    // Déterminer l'ordre si non fourni
    let categoryOrder = ordre;
    if (categoryOrder === undefined) {
      const [maxOrder] = await pool.query(
        'SELECT MAX(ordre) as max_ordre FROM categories WHERE restaurant_id = ?',
        [restaurantId]
      );
      categoryOrder = (maxOrder[0].max_ordre || 0) + 1;
    }

    const [result] = await pool.query(
      `INSERT INTO categories (restaurant_id, nom, description, ordre)
       VALUES (?, ?, ?, ?)`,
      [restaurantId, nom, description || null, categoryOrder]
    );

    const [newCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Catégorie créée.',
      data: newCategory[0]
    });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie.'
    });
  }
};

// Mettre à jour une catégorie
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, ordre, actif } = req.body;

    const updates = [];
    const values = [];

    if (nom !== undefined) {
      updates.push('nom = ?');
      values.push(nom);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (ordre !== undefined) {
      updates.push('ordre = ?');
      values.push(ordre);
    }
    if (actif !== undefined) {
      updates.push('actif = ?');
      values.push(actif);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour.'
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Catégorie mise à jour.',
      data: updatedCategory[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie.'
    });
  }
};

// Supprimer une catégorie
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des plats dans cette catégorie
    const [plats] = await pool.query(
      'SELECT COUNT(*) as count FROM plats WHERE categorie_id = ?',
      [id]
    );

    if (plats[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${plats[0].count} plat(s) sont dans cette catégorie.`
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Catégorie supprimée.'
    });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie.'
    });
  }
};

// Réorganiser les catégories
const reorderCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { categories } = req.body; // Array de { id, ordre }

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Format invalide. Attendu: { categories: [{ id, ordre }] }'
      });
    }

    // Mettre à jour l'ordre de chaque catégorie
    for (const cat of categories) {
      await pool.query(
        'UPDATE categories SET ordre = ? WHERE id = ? AND restaurant_id = ?',
        [cat.ordre, cat.id, restaurantId]
      );
    }

    // Récupérer les catégories mises à jour
    const [updatedCategories] = await pool.query(
      'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY ordre ASC',
      [restaurantId]
    );

    res.json({
      success: true,
      message: 'Ordre des catégories mis à jour.',
      data: updatedCategories
    });
  } catch (error) {
    console.error('Erreur réorganisation catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réorganisation des catégories.'
    });
  }
};

module.exports = {
  getCategoriesByRestaurant,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};