const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const commandeController = require('../controllers/commandeController');
const { auth, optionalAuth, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Validation pour la création de commande
const commandeValidation = [
  body('restaurant_id')
    .isInt()
    .withMessage('ID du restaurant invalide.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('La commande doit contenir au moins un article.'),
  body('items.*.plat_id')
    .isInt()
    .withMessage('ID de plat invalide.'),
  body('items.*.quantite')
    .isInt({ min: 1 })
    .withMessage('La quantité doit être au moins 1.'),
  body('telephone_client')
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères.')
];

// Validation pour la mise à jour du statut
const statutValidation = [
  body('statut')
    .isIn(['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'recuperee', 'annulee'])
    .withMessage('Statut invalide.')
];

// Route de création (avec auth optionnelle pour permettre les commandes invité)
router.post(
  '/',
  optionalAuth,
  commandeValidation,
  validate,
  commandeController.createCommande
);

// Routes protégées
router.get('/', auth, commandeController.getCommandes);
router.get('/statistiques', auth, authorize('restaurateur', 'admin'), commandeController.getStatistiques);
router.get('/:id', auth, commandeController.getCommandeById);

router.put(
  '/:id/statut',
  auth,
  authorize('restaurateur', 'admin'),
  statutValidation,
  validate,
  commandeController.updateStatut
);

router.post(
  '/:id/annuler',
  auth,
  commandeController.annulerCommande
);

module.exports = router;