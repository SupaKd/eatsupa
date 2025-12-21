const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router({ mergeParams: true });

const categoryController = require('../controllers/categoryController');
const { auth, authorize, isRestaurantOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Validation pour les catégories
const categoryValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis.')
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères.'),
  body('description')
    .optional()
    .trim(),
  body('ordre')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'ordre doit être un entier positif.')
];

const updateValidation = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom doit contenir entre 1 et 100 caractères.'),
  body('ordre')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'ordre doit être un entier positif.'),
  body('actif')
    .optional()
    .isBoolean()
    .withMessage('Actif doit être un booléen.')
];

// Routes publiques
router.get('/', categoryController.getCategoriesByRestaurant);

// Routes protégées
router.post(
  '/',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  categoryValidation,
  validate,
  categoryController.createCategory
);

router.put(
  '/:id',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  updateValidation,
  validate,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  categoryController.deleteCategory
);

router.put(
  '/reorder',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  categoryController.reorderCategories
);

module.exports = router;