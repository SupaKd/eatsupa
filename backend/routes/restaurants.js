const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const restaurantController = require('../controllers/restaurantController');
const { auth, optionalAuth, authorize, isRestaurantOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload } = require('../utils/upload');

// Validation pour la création d'un restaurant
const restaurantValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis.')
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères.'),
  body('adresse')
    .trim()
    .notEmpty()
    .withMessage('L\'adresse est requise.')
    .isLength({ max: 255 })
    .withMessage('L\'adresse ne peut pas dépasser 255 caractères.'),
  body('ville')
    .trim()
    .notEmpty()
    .withMessage('La ville est requise.')
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas dépasser 100 caractères.'),
  body('code_postal')
    .matches(/^[0-9]{5}$/)
    .withMessage('Code postal invalide (5 chiffres attendus).'),
  body('telephone')
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Numéro de téléphone invalide (format français attendu).'),
  body('email')
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères.'),
  body('type_cuisine')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le type de cuisine ne peut pas dépasser 100 caractères.'),
  body('delai_preparation')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Le délai de préparation doit être entre 5 et 120 minutes.'),
  body('frais_livraison')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Les frais de livraison doivent être entre 0 et 50€.')
];

// Validation mise à jour partielle
const updateValidation = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom doit contenir entre 1 et 100 caractères.'),
  body('code_postal')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Code postal invalide (5 chiffres attendus).'),
  body('telephone')
    .optional()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('delai_preparation')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Le délai de préparation doit être entre 5 et 120 minutes.'),
  body('frais_livraison')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Les frais de livraison doivent être entre 0 et 50€.'),
  body('actif')
    .optional()
    .isBoolean()
    .withMessage('Le champ actif doit être un booléen.')
];

// ========== ROUTES PROTÉGÉES SPÉCIFIQUES (avant les routes avec :id) ==========

// IMPORTANT: Cette route doit être AVANT la route /:id pour éviter que "me" soit interprété comme un ID
router.get(
  '/me/restaurant',
  auth,
  authorize('restaurateur'),
  restaurantController.getMyRestaurant
);

// Créer un restaurant (restaurateur uniquement)
router.post(
  '/',
  auth,
  authorize('restaurateur'),
  restaurantValidation,
  validate,
  restaurantController.createRestaurant
);

// ========== ROUTES PUBLIQUES ==========

// Liste des restaurants
router.get('/', optionalAuth, restaurantController.getAllRestaurants);

// Détail d'un restaurant
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de restaurant invalide.')
  ],
  validate,
  restaurantController.getRestaurantById
);

// ========== ROUTES PROTÉGÉES - Propriétaire ou Admin ==========

// Mettre à jour un restaurant
router.put(
  '/:id',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de restaurant invalide.')
  ],
  updateValidation,
  validate,
  restaurantController.updateRestaurant
);

// Supprimer un restaurant
router.delete(
  '/:id',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de restaurant invalide.')
  ],
  validate,
  restaurantController.deleteRestaurant
);

// Mettre à jour l'image d'un restaurant
router.put(
  '/:id/image',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de restaurant invalide.')
  ],
  validate,
  upload.single('image'),
  restaurantController.updateImage
);

module.exports = router;