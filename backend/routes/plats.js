const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router({ mergeParams: true });

const platController = require('../controllers/platController');
const { auth, authorize, isRestaurantOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload } = require('../utils/upload');

// Validation pour les plats
const platValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis.')
    .isLength({ max: 150 })
    .withMessage('Le nom ne peut pas dépasser 150 caractères.'),
  body('prix')
    .isFloat({ min: 0.01 })
    .withMessage('Le prix doit être supérieur à 0.'),
  body('description')
    .optional()
    .trim(),
  body('categorie_id')
    .optional()
    .isInt()
    .withMessage('ID de catégorie invalide.'),
  body('allergenes')
    .optional()
    .isArray()
    .withMessage('Les allergènes doivent être un tableau.'),
  body('ordre')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'ordre doit être un entier positif.'),
  body('disponible')
    .optional()
    .isBoolean()
    .withMessage('Disponible doit être un booléen.')
];

const updateValidation = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Le nom doit contenir entre 1 et 150 caractères.'),
  body('prix')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Le prix doit être supérieur à 0.'),
  body('categorie_id')
    .optional()
    .isInt()
    .withMessage('ID de catégorie invalide.'),
  body('disponible')
    .optional()
    .isBoolean()
    .withMessage('Disponible doit être un booléen.')
];

// Routes publiques
router.get('/', platController.getPlatsByRestaurant);
router.get('/:id', platController.getPlatById);

// Routes protégées
router.post(
  '/',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  platValidation,
  validate,
  platController.createPlat
);

router.put(
  '/:id',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  updateValidation,
  validate,
  platController.updatePlat
);

router.delete(
  '/:id',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  platController.deletePlat
);

router.put(
  '/:id/image',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  upload.single('image'),
  platController.updatePlatImage
);

router.patch(
  '/:id/disponibilite',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  platController.toggleDisponibilite
);

module.exports = router;