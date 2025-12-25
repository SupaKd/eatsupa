const { pool } = require('../config/database');

// Note: Pour la production, installer stripe avec: npm install stripe
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ========== CONFIGURATION PAIEMENT RESTAURANT ==========

// Récupérer les paramètres de paiement du restaurant
const getPaymentSettings = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.restaurantId;

    const [restaurants] = await pool.query(
      `SELECT id, nom, paiement_sur_place, paiement_en_ligne, 
              stripe_account_id, stripe_onboarding_complete
       FROM restaurants WHERE id = ?`,
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    const restaurant = restaurants[0];

    res.json({
      success: true,
      data: {
        paiement_sur_place: Boolean(restaurant.paiement_sur_place),
        paiement_en_ligne: Boolean(restaurant.paiement_en_ligne),
        stripe_connecte: Boolean(restaurant.stripe_account_id),
        stripe_onboarding_complete: Boolean(restaurant.stripe_onboarding_complete)
      }
    });
  } catch (error) {
    console.error('Erreur récupération paramètres paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres de paiement.'
    });
  }
};

// Mettre à jour les paramètres de paiement du restaurant
const updatePaymentSettings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { paiement_sur_place, paiement_en_ligne } = req.body;

    // Vérifier qu'au moins un mode de paiement est activé
    if (paiement_sur_place === false && paiement_en_ligne === false) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un mode de paiement doit être activé.'
      });
    }

    // Si paiement en ligne demandé, vérifier que Stripe est configuré
    if (paiement_en_ligne === true) {
      const [restaurants] = await pool.query(
        'SELECT stripe_account_id, stripe_onboarding_complete FROM restaurants WHERE id = ?',
        [restaurantId]
      );

      if (restaurants.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant non trouvé.'
        });
      }

      const restaurant = restaurants[0];

      if (!restaurant.stripe_account_id || !restaurant.stripe_onboarding_complete) {
        return res.status(400).json({
          success: false,
          message: 'Vous devez d\'abord configurer votre compte Stripe pour activer le paiement en ligne.',
          code: 'STRIPE_NOT_CONFIGURED'
        });
      }
    }

    const updates = [];
    const values = [];

    if (paiement_sur_place !== undefined) {
      updates.push('paiement_sur_place = ?');
      values.push(paiement_sur_place ? 1 : 0);
    }

    if (paiement_en_ligne !== undefined) {
      updates.push('paiement_en_ligne = ?');
      values.push(paiement_en_ligne ? 1 : 0);
    }

    values.push(restaurantId);

    await pool.query(
      `UPDATE restaurants SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Paramètres de paiement mis à jour.',
      data: {
        paiement_sur_place: Boolean(paiement_sur_place),
        paiement_en_ligne: Boolean(paiement_en_ligne)
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour paramètres paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres de paiement.'
    });
  }
};

// ========== STRIPE CONNECT (ONBOARDING) ==========

// Créer un compte Stripe Connect pour le restaurant
const createStripeAccount = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Vérifier si le restaurant existe
    const [restaurants] = await pool.query(
      'SELECT id, nom, email, stripe_account_id FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    const restaurant = restaurants[0];

    // Si déjà un compte Stripe
    if (restaurant.stripe_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Un compte Stripe est déjà associé à ce restaurant.',
        data: { stripe_account_id: restaurant.stripe_account_id }
      });
    }

    // NOTE: Code Stripe commenté - à décommenter en production avec npm install stripe
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Créer le compte Stripe Connect (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: restaurant.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company',
      company: {
        name: restaurant.nom,
      },
      metadata: {
        restaurant_id: restaurantId
      }
    });

    // Sauvegarder l'ID du compte
    await pool.query(
      'UPDATE restaurants SET stripe_account_id = ? WHERE id = ?',
      [account.id, restaurantId]
    );

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/restaurant/paiement/refresh`,
      return_url: `${process.env.FRONTEND_URL}/restaurant/paiement/success`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      message: 'Compte Stripe créé. Veuillez compléter l\'inscription.',
      data: {
        stripe_account_id: account.id,
        onboarding_url: accountLink.url
      }
    });
    */

    // Version de démonstration (sans Stripe réel)
    const fakeAccountId = `acct_demo_${Date.now()}`;
    
    await pool.query(
      'UPDATE restaurants SET stripe_account_id = ? WHERE id = ?',
      [fakeAccountId, restaurantId]
    );

    res.json({
      success: true,
      message: 'Compte Stripe créé (mode démo). En production, vous seriez redirigé vers Stripe.',
      data: {
        stripe_account_id: fakeAccountId,
        onboarding_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/restaurant/paiement/demo-onboarding`,
        demo_mode: true
      }
    });

  } catch (error) {
    console.error('Erreur création compte Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte Stripe.'
    });
  }
};

// Compléter l'onboarding Stripe (simulé pour la démo)
const completeStripeOnboarding = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const [restaurants] = await pool.query(
      'SELECT stripe_account_id FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    if (!restaurants[0].stripe_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Aucun compte Stripe associé. Veuillez d\'abord créer un compte.'
      });
    }

    // Marquer l'onboarding comme complété
    await pool.query(
      'UPDATE restaurants SET stripe_onboarding_complete = 1 WHERE id = ?',
      [restaurantId]
    );

    res.json({
      success: true,
      message: 'Configuration Stripe terminée. Vous pouvez maintenant activer le paiement en ligne.'
    });

  } catch (error) {
    console.error('Erreur complétion onboarding Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la finalisation de la configuration Stripe.'
    });
  }
};

// Obtenir le lien du dashboard Stripe
const getStripeDashboardLink = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const [restaurants] = await pool.query(
      'SELECT stripe_account_id, stripe_onboarding_complete FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    const restaurant = restaurants[0];

    if (!restaurant.stripe_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Aucun compte Stripe associé.'
      });
    }

    // NOTE: En production avec Stripe
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const loginLink = await stripe.accounts.createLoginLink(restaurant.stripe_account_id);
    
    res.json({
      success: true,
      data: { dashboard_url: loginLink.url }
    });
    */

    // Version démo
    res.json({
      success: true,
      data: {
        dashboard_url: 'https://dashboard.stripe.com/test/dashboard',
        demo_mode: true
      }
    });

  } catch (error) {
    console.error('Erreur génération lien dashboard Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du lien.'
    });
  }
};

// ========== PAIEMENT CLIENT ==========

// Créer une session de paiement pour une commande
const createPaymentSession = async (req, res) => {
  try {
    const { commande_id } = req.body;

    // Récupérer la commande
    const [commandes] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom, r.stripe_account_id, r.paiement_en_ligne
       FROM commandes c
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ?`,
      [commande_id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Vérifier que le paiement en ligne est activé
    if (!commande.paiement_en_ligne) {
      return res.status(400).json({
        success: false,
        message: 'Le paiement en ligne n\'est pas activé pour ce restaurant.'
      });
    }

    // Vérifier que la commande n'est pas déjà payée
    if (commande.paiement_statut === 'paye') {
      return res.status(400).json({
        success: false,
        message: 'Cette commande a déjà été payée.'
      });
    }

    // NOTE: En production avec Stripe
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Parser les items de la commande
    const items = typeof commande.items_json === 'string' 
      ? JSON.parse(commande.items_json) 
      : commande.items_json;

    // Créer les line items pour Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nom_plat,
        },
        unit_amount: Math.round(item.prix_unitaire * 100), // En centimes
      },
      quantity: item.quantite,
    }));

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/commande/${commande.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/commande/${commande.id}/cancel`,
      metadata: {
        commande_id: commande.id,
        restaurant_id: commande.restaurant_id
      },
      // Pour Stripe Connect (paiement au restaurant)
      payment_intent_data: {
        application_fee_amount: Math.round(commande.montant_total * 0.02 * 100), // 2% de commission
        transfer_data: {
          destination: commande.stripe_account_id,
        },
      },
    });

    // Sauvegarder l'ID de session
    await pool.query(
      'UPDATE commandes SET stripe_session_id = ? WHERE id = ?',
      [session.id, commande_id]
    );

    res.json({
      success: true,
      data: {
        session_id: session.id,
        checkout_url: session.url
      }
    });
    */

    // Version démo
    const fakeSessionId = `cs_demo_${Date.now()}`;
    
    await pool.query(
      'UPDATE commandes SET stripe_session_id = ? WHERE id = ?',
      [fakeSessionId, commande_id]
    );

    res.json({
      success: true,
      message: 'Session de paiement créée (mode démo).',
      data: {
        session_id: fakeSessionId,
        checkout_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/paiement/demo/${commande_id}`,
        demo_mode: true
      }
    });

  } catch (error) {
    console.error('Erreur création session paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session de paiement.'
    });
  }
};

// Simuler un paiement réussi (pour la démo)
const simulatePaymentSuccess = async (req, res) => {
  try {
    const { commande_id } = req.params;

    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE id = ?',
      [commande_id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    if (commande.paiement_statut === 'paye') {
      return res.status(400).json({
        success: false,
        message: 'Cette commande a déjà été payée.'
      });
    }

    // Mettre à jour le statut de paiement
    await pool.query(
      `UPDATE commandes 
       SET paiement_statut = 'paye', 
           stripe_payment_intent_id = ?,
           statut = 'confirmee'
       WHERE id = ?`,
      [`pi_demo_${Date.now()}`, commande_id]
    );

    // Émettre un événement WebSocket si disponible
    if (req.io) {
      req.io.to(`restaurant_${commande.restaurant_id}`).emit('paiement_recu', {
        commande_id: commande.id,
        numero_commande: commande.numero_commande,
        montant: commande.montant_total
      });
    }

    res.json({
      success: true,
      message: 'Paiement simulé avec succès.',
      data: {
        commande_id,
        paiement_statut: 'paye'
      }
    });

  } catch (error) {
    console.error('Erreur simulation paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la simulation du paiement.'
    });
  }
};

// Webhook Stripe (pour recevoir les événements de paiement)
const handleStripeWebhook = async (req, res) => {
  // NOTE: En production
  /*
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents événements
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Mettre à jour la commande
      await pool.query(
        `UPDATE commandes 
         SET paiement_statut = 'paye',
             stripe_payment_intent_id = ?,
             statut = 'confirmee'
         WHERE stripe_session_id = ?`,
        [session.payment_intent, session.id]
      );
      
      console.log('Paiement réussi pour la session:', session.id);
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      
      await pool.query(
        `UPDATE commandes 
         SET paiement_statut = 'echoue'
         WHERE stripe_payment_intent_id = ?`,
        [paymentIntent.id]
      );
      
      console.log('Paiement échoué:', paymentIntent.id);
      break;

    default:
      console.log(`Événement non géré: ${event.type}`);
  }
  */

  res.json({ received: true });
};

// Vérifier le statut d'un paiement
const checkPaymentStatus = async (req, res) => {
  try {
    const { commande_id } = req.params;

    const [commandes] = await pool.query(
      `SELECT id, numero_commande, montant_total, mode_paiement, paiement_statut, statut
       FROM commandes WHERE id = ?`,
      [commande_id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    res.json({
      success: true,
      data: commandes[0]
    });

  } catch (error) {
    console.error('Erreur vérification statut paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut de paiement.'
    });
  }
};

// Marquer une commande comme payée en face à face
const markAsPaidInPerson = async (req, res) => {
  try {
    const { commande_id } = req.params;

    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE id = ?',
      [commande_id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Vérifier les droits (restaurateur du restaurant concerné ou admin)
    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE id = ? AND utilisateur_id = ?',
        [commande.restaurant_id, req.user.id]
      );
      
      if (restaurants.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier cette commande.'
        });
      }
    }

    // Mettre à jour le statut de paiement
    await pool.query(
      `UPDATE commandes SET paiement_statut = 'paye' WHERE id = ?`,
      [commande_id]
    );

    res.json({
      success: true,
      message: 'Commande marquée comme payée.',
      data: {
        commande_id,
        paiement_statut: 'paye'
      }
    });

  } catch (error) {
    console.error('Erreur marquage paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du paiement.'
    });
  }
};

module.exports = {
  // Configuration restaurant
  getPaymentSettings,
  updatePaymentSettings,
  
  // Stripe Connect
  createStripeAccount,
  completeStripeOnboarding,
  getStripeDashboardLink,
  
  // Paiement client
  createPaymentSession,
  simulatePaymentSuccess,
  handleStripeWebhook,
  checkPaymentStatus,
  markAsPaidInPerson
};