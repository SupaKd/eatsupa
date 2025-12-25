const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const paiementController = require('../controllers/paiementController');
const { auth, authorize, isRestaurantOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// ========== CONFIGURATION PAIEMENT RESTAURANT ==========

// Récupérer les paramètres de paiement d'un restaurant (public - pour afficher les options au client)
router.get(
  '/restaurants/:restaurantId/settings',
  [
    param('restaurantId').isInt({ min: 1 }).withMessage('ID de restaurant invalide.')
  ],
  validate,
  paiementController.getPaymentSettings
);

// Mettre à jour les paramètres de paiement (restaurateur uniquement)
router.put(
  '/restaurants/:restaurantId/settings',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('restaurantId').isInt({ min: 1 }).withMessage('ID de restaurant invalide.'),
    body('paiement_sur_place').optional().isBoolean().withMessage('paiement_sur_place doit être un booléen.'),
    body('paiement_en_ligne').optional().isBoolean().withMessage('paiement_en_ligne doit être un booléen.')
  ],
  validate,
  paiementController.updatePaymentSettings
);

// ========== STRIPE CONNECT (ONBOARDING RESTAURATEUR) ==========

// Créer un compte Stripe Connect
router.post(
  '/restaurants/:restaurantId/stripe/connect',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('restaurantId').isInt({ min: 1 }).withMessage('ID de restaurant invalide.')
  ],
  validate,
  paiementController.createStripeAccount
);

// Compléter l'onboarding Stripe (callback après inscription Stripe)
router.post(
  '/restaurants/:restaurantId/stripe/complete-onboarding',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('restaurantId').isInt({ min: 1 }).withMessage('ID de restaurant invalide.')
  ],
  validate,
  paiementController.completeStripeOnboarding
);

// Obtenir le lien vers le dashboard Stripe
router.get(
  '/restaurants/:restaurantId/stripe/dashboard',
  auth,
  authorize('restaurateur', 'admin'),
  isRestaurantOwner,
  [
    param('restaurantId').isInt({ min: 1 }).withMessage('ID de restaurant invalide.')
  ],
  validate,
  paiementController.getStripeDashboardLink
);

// ========== PAIEMENT CLIENT ==========

// Créer une session de paiement Stripe
router.post(
  '/create-session',
  [
    body('commande_id').isInt({ min: 1 }).withMessage('ID de commande invalide.')
  ],
  validate,
  paiementController.createPaymentSession
);

// Vérifier le statut d'un paiement
router.get(
  '/status/:commande_id',
  [
    param('commande_id').isInt({ min: 1 }).withMessage('ID de commande invalide.')
  ],
  validate,
  paiementController.checkPaymentStatus
);

// Simuler un paiement réussi (mode démo uniquement)
router.post(
  '/demo/success/:commande_id',
  [
    param('commande_id').isInt({ min: 1 }).withMessage('ID de commande invalide.')
  ],
  validate,
  paiementController.simulatePaymentSuccess
);

// ========== GESTION RESTAURATEUR ==========

// Marquer une commande comme payée (paiement en face à face)
router.post(
  '/commandes/:commande_id/mark-paid',
  auth,
  authorize('restaurateur', 'admin'),
  [
    param('commande_id').isInt({ min: 1 }).withMessage('ID de commande invalide.')
  ],
  validate,
  paiementController.markAsPaidInPerson
);

// ========== WEBHOOK STRIPE ==========

// Webhook pour recevoir les événements Stripe
// Note: Ce endpoint doit recevoir le body brut (raw), pas JSON parsé
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paiementController.handleStripeWebhook
);

module.exports = router;