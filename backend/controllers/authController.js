const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Inscription
const register = async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, role = 'client' } = req.body;

    // Vérifier si l'email existe déjà
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

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const [result] = await pool.query(
      `INSERT INTO utilisateurs (email, password, nom, prenom, telephone, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nom, prenom, telephone || null, role]
    );

    // Générer le token
    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie.',
      data: {
        user: {
          id: result.insertId,
          email,
          nom,
          prenom,
          telephone,
          role
        },
        token
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription.'
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Supprimer le mot de passe de la réponse
    delete user.password;

    res.json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.'
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, role, nom, prenom, telephone, photo_url, created_at, updated_at
       FROM utilisateurs WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    // Si l'utilisateur est un restaurateur, récupérer son restaurant
    let restaurant = null;
    if (users[0].role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT * FROM restaurants WHERE utilisateur_id = ?',
        [req.user.id]
      );
      restaurant = restaurants[0] || null;
    }

    res.json({
      success: true,
      data: {
        user: users[0],
        restaurant
      }
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil.'
    });
  }
};

// Mettre à jour le profil
const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];

    if (nom) {
      updates.push('nom = ?');
      values.push(nom);
    }
    if (prenom) {
      updates.push('prenom = ?');
      values.push(prenom);
    }
    if (telephone !== undefined) {
      updates.push('telephone = ?');
      values.push(telephone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour.'
      });
    }

    values.push(userId);

    await pool.query(
      `UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Récupérer l'utilisateur mis à jour
    const [users] = await pool.query(
      `SELECT id, email, role, nom, prenom, telephone, photo_url, created_at, updated_at
       FROM utilisateurs WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profil mis à jour.',
      data: users[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil.'
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Récupérer le mot de passe actuel
    const [users] = await pool.query(
      'SELECT password FROM utilisateurs WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect.'
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour
    await pool.query(
      'UPDATE utilisateurs SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe.'
    });
  }
};

// Mettre à jour la photo de profil
const updatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie.'
      });
    }

    const photoUrl = `/uploads/images/${req.file.filename}`;

    await pool.query(
      'UPDATE utilisateurs SET photo_url = ? WHERE id = ?',
      [photoUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Photo de profil mise à jour.',
      data: { photo_url: photoUrl }
    });
  } catch (error) {
    console.error('Erreur mise à jour photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la photo.'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updatePhoto
};