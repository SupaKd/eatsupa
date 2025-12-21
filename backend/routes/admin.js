const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Toutes les routes admin nécessitent une authentification admin
router.use(auth);
router.use(authorize('admin'));

// ========== DASHBOARD ==========
router.get('/dashboard', adminController.getDashboardStats);

// ========== UTILISATEURS ==========
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);

router.post(
  '/users',
  [
    body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe: minimum 6 caractères.'),
    body('nom').trim().notEmpty().withMessage('Nom requis.'),
    body('prenom').trim().notEmpty().withMessage('Prénom requis.'),
    body('role').optional().isIn(['client', 'restaurateur', 'admin']).withMessage('Rôle invalide.')
  ],
  validate,
  adminController.createUser
);

router.put(
  '/users/:id',
  [
    body('email').optional().isEmail().withMessage('Email invalide.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Mot de passe: minimum 6 caractères.'),
    body('role').optional().isIn(['client', 'restaurateur', 'admin']).withMessage('Rôle invalide.')
  ],
  validate,
  adminController.updateUser
);

router.delete('/users/:id', adminController.deleteUser);

// ========== RESTAURANTS ==========
router.get('/restaurants', adminController.getAllRestaurantsAdmin);
router.patch('/restaurants/:id/toggle-status', adminController.toggleRestaurantStatus);

module.exports = router;