const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès refusé. Token manquant.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier que l'utilisateur existe toujours
      const [users] = await pool.query(
        'SELECT id, email, role, nom, prenom, telephone FROM utilisateurs WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Utilisateur non trouvé.' 
        });
      }

      req.user = users[0];
      req.token = token;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expiré. Veuillez vous reconnecter.' 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide.' 
      });
    }
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'authentification.' 
    });
  }
};

// Middleware optionnel (ne bloque pas si pas de token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await pool.query(
        'SELECT id, email, role, nom, prenom, telephone FROM utilisateurs WHERE id = ?',
        [decoded.id]
      );

      req.user = users.length > 0 ? users[0] : null;
      req.token = token;
    } catch {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Middleware de vérification des rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Accès refusé. Rôle requis: ${roles.join(' ou ')}.` 
      });
    }

    next();
  };
};

// Middleware pour vérifier que l'utilisateur est le propriétaire du restaurant
const isRestaurantOwner = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurant_id;
    
    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID du restaurant requis.' 
      });
    }

    // Les admins ont accès à tout
    if (req.user.role === 'admin') {
      return next();
    }

    const [restaurants] = await pool.query(
      'SELECT id FROM restaurants WHERE id = ? AND utilisateur_id = ?',
      [restaurantId, req.user.id]
    );

    if (restaurants.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous n\'êtes pas le propriétaire de ce restaurant.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erreur vérification propriétaire:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur.' 
    });
  }
};

module.exports = { auth, optionalAuth, authorize, isRestaurantOwner };