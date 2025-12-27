const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const commandeController = require('../controllers/commandeController');
const { auth, optionalAuth, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Validation pour la création de commande
const commandeValidation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('L\'ID du restaurant est requis.')
    .isInt({ min: 1 })
    .withMessage('ID du restaurant invalide.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('La commande doit contenir au moins un article.'),
  body('items.*.plat_id')
    .notEmpty()
    .withMessage('L\'ID du plat est requis.')
    .isInt({ min: 1 })
    .withMessage('ID de plat invalide.'),
  body('items.*.quantite')
    .notEmpty()
    .withMessage('La quantité est requise.')
    .isInt({ min: 1, max: 99 })
    .withMessage('La quantité doit être entre 1 et 99.'),
  body('telephone_client')
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis.')
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Numéro de téléphone invalide (format français attendu).'),
  body('email_client')
    .optional()
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères.'),
  body('mode_paiement')
    .optional()
    .isIn(['sur_place', 'en_ligne'])
    .withMessage('Mode de paiement invalide. Valeurs acceptées: sur_place, en_ligne'),
  body('mode_retrait')
    .optional()
    .isIn(['a_emporter', 'livraison'])
    .withMessage('Mode de retrait invalide. Valeurs acceptées: a_emporter, livraison'),
  body('adresse_livraison')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('L\'adresse ne peut pas dépasser 255 caractères.'),
  body('code_postal_livraison')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Code postal invalide (5 chiffres attendus).'),
  body('ville_livraison')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas dépasser 100 caractères.'),
  body('instructions_livraison')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les instructions ne peuvent pas dépasser 500 caractères.')
];

// Validation conditionnelle pour la livraison
const validateLivraison = (req, res, next) => {
  if (req.body.mode_retrait === 'livraison') {
    if (!req.body.adresse_livraison) {
      return res.status(400).json({
        success: false,
        message: 'L\'adresse de livraison est requise pour la livraison.'
      });
    }
    if (!req.body.ville_livraison) {
      return res.status(400).json({
        success: false,
        message: 'La ville de livraison est requise pour la livraison.'
      });
    }
  }
  next();
};

// Validation pour la mise à jour du statut
const statutValidation = [
  body('statut')
    .notEmpty()
    .withMessage('Le statut est requis.')
    .isIn(['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'recuperee', 'annulee'])
    .withMessage('Statut invalide. Valeurs acceptées: en_attente, confirmee, en_preparation, prete, livree, recuperee, annulee')
];

// ========== ROUTES PUBLIQUES ==========

// Créer une commande (avec auth optionnelle pour permettre les commandes invité)
router.post(
  '/',
  optionalAuth,
  commandeValidation,
  validate,
  validateLivraison,
  commandeController.createCommande
);

// Suivre une commande par token (pour les invités)
router.get(
  '/suivi/:token',
  [
    param('token')
      .isLength({ min: 64, max: 64 })
      .withMessage('Token de suivi invalide.')
  ],
  validate,
  commandeController.getCommandeByToken
);

// ========== ROUTES PROTÉGÉES ==========

// Liste des commandes (filtré par rôle)
router.get('/', auth, commandeController.getCommandes);

// Statistiques (restaurateur et admin uniquement)
router.get(
  '/statistiques',
  auth,
  authorize('restaurateur', 'admin'),
  commandeController.getStatistiques
);

// Détail d'une commande
router.get(
  '/:id',
  auth,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de commande invalide.')
  ],
  validate,
  commandeController.getCommandeById
);

// Mettre à jour le statut (restaurateur et admin uniquement)
router.put(
  '/:id/statut',
  auth,
  authorize('restaurateur', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de commande invalide.')
  ],
  statutValidation,
  validate,
  commandeController.updateStatut
);

// Annuler une commande
router.post(
  '/:id/annuler',
  auth,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de commande invalide.')
  ],
  validate,
  commandeController.annulerCommande
);

module.exports = router;