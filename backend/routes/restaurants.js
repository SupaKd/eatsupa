const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const restaurantController = require('../controllers/restaurantController');
const { auth, authorize, isRestaurantOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload } = require('../utils/upload');

// Validation pour la création/mise à jour d'un restaurant
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
    .withMessage('L\'adresse est requise.'),
  body('ville')
    .trim()
    .notEmpty()
    .withMessage('La ville est requise.'),
  body('code_postal')
    .matches(/^[0-9]{5}$/)
    .withMessage('Code postal invalide (5 chiffres).'),
  body('telephone')
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('email')
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('type_cuisine')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le type de cuisine ne peut pas dépasser 100 caractères.'),
  body('delai_preparation')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Le délai de préparation doit être entre 5 et 120 minutes.'),
  body('frais_livraison')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Les frais de livraison doivent être positifs.')
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
    .withMessage('Code postal invalide (5 chiffres).'),
  body('telephone')
    .optional()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalide.')
];

// Routes publiques
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// Routes protégées - Restaurateur
router.get('/me/restaurant', auth, authorize('restaurateur'), restaurantController.getMyRestaurant);
router.post('/', auth, authorize('restaurateur'), restaurantValidation, validate, restaurantController.createRestaurant);

// Routes protégées - Propriétaire ou Admin
router.put('/:id', auth, authorize('restaurateur', 'admin'), isRestaurantOwner, updateValidation, validate, restaurantController.updateRestaurant);
router.delete('/:id', auth, authorize('restaurateur', 'admin'), isRestaurantOwner, restaurantController.deleteRestaurant);
router.put('/:id/image', auth, authorize('restaurateur', 'admin'), isRestaurantOwner, upload.single('image'), restaurantController.updateImage);

module.exports = router;