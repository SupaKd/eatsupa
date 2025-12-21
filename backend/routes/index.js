const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const restaurantRoutes = require('./restaurants');
const categoryRoutes = require('./categories');
const platRoutes = require('./plats');
const commandeRoutes = require('./commandes');
const adminRoutes = require('./admin');

// Routes de base
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Restaurant App',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      categories: '/api/restaurants/:restaurantId/categories',
      plats: '/api/restaurants/:restaurantId/plats',
      commandes: '/api/commandes',
      admin: '/api/admin'
    }
  });
});

// Routes principales
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/restaurants/:restaurantId/categories', categoryRoutes);
router.use('/restaurants/:restaurantId/plats', platRoutes);
router.use('/commandes', commandeRoutes);
router.use('/admin', adminRoutes);

module.exports = router;