const { pool } = require('../config/database');
const { generateOrderNumber, generateTrackingToken, paginate, paginatedResponse } = require('../utils/helpers');

// Récupérer les commandes (selon le rôle)
const getCommandes = async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, restaurant_id, date_debut, date_fin, paiement_statut, mode_retrait } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filtrer selon le rôle
    if (req.user.role === 'client') {
      whereClause += ' AND c.utilisateur_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'restaurateur') {
      // Récupérer le restaurant du restaurateur
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ?',
        [req.user.id]
      );
      if (restaurants.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: queryLimit, total: 0, totalPages: 0 }
        });
      }
      whereClause += ' AND c.restaurant_id = ?';
      params.push(restaurants[0].id);
    } else if (restaurant_id) {
      // Admin peut filtrer par restaurant
      whereClause += ' AND c.restaurant_id = ?';
      params.push(restaurant_id);
    }

    if (statut) {
      whereClause += ' AND c.statut = ?';
      params.push(statut);
    }

    if (paiement_statut) {
      whereClause += ' AND c.paiement_statut = ?';
      params.push(paiement_statut);
    }

    if (mode_retrait) {
      whereClause += ' AND c.mode_retrait = ?';
      params.push(mode_retrait);
    }

    if (date_debut) {
      whereClause += ' AND DATE(c.date_commande) >= ?';
      params.push(date_debut);
    }

    if (date_fin) {
      whereClause += ' AND DATE(c.date_commande) <= ?';
      params.push(date_fin);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM commandes c ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Récupérer les commandes
    const [commandes] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom, 
              u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
       ${whereClause}
       ORDER BY c.date_commande DESC
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    // Parser les items JSON
    const commandesFormatted = commandes.map(cmd => {
      let items = [];
      try {
        items = typeof cmd.items_json === 'string' ? JSON.parse(cmd.items_json) : (cmd.items_json || []);
      } catch (e) {
        console.error('Erreur parsing items_json:', e);
        items = [];
      }
      return {
        ...cmd,
        items,
        items_json: undefined // Ne pas renvoyer le JSON brut
      };
    });

    res.json({
      success: true,
      ...paginatedResponse(commandesFormatted, page, queryLimit, total)
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes.'
    });
  }
};

// Récupérer une commande par ID
const getCommandeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [commandes] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom, r.telephone as restaurant_telephone,
              r.adresse as restaurant_adresse, r.ville as restaurant_ville,
              u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Vérifier les droits d'accès
    if (req.user.role === 'client' && commande.utilisateur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé.'
      });
    }

    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ? AND id = ?',
        [req.user.id, commande.restaurant_id]
      );
      if (restaurants.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé.'
        });
      }
    }

    // Parser les items
    let items = [];
    try {
      items = typeof commande.items_json === 'string' 
        ? JSON.parse(commande.items_json) 
        : (commande.items_json || []);
    } catch (e) {
      console.error('Erreur parsing items_json:', e);
      items = [];
    }

    res.json({
      success: true,
      data: {
        ...commande,
        items,
        items_json: undefined
      }
    });
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande.'
    });
  }
};

// Récupérer une commande par token de suivi (pour les invités)
const getCommandeByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const [commandes] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom, r.telephone as restaurant_telephone,
              r.adresse as restaurant_adresse, r.ville as restaurant_ville
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.token_suivi = ?`,
      [token]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Parser les items
    let items = [];
    try {
      items = typeof commande.items_json === 'string' 
        ? JSON.parse(commande.items_json) 
        : (commande.items_json || []);
    } catch (e) {
      items = [];
    }

    res.json({
      success: true,
      data: {
        id: commande.id,
        numero_commande: commande.numero_commande,
        montant_total: commande.montant_total,
        statut: commande.statut,
        mode_paiement: commande.mode_paiement,
        paiement_statut: commande.paiement_statut,
        mode_retrait: commande.mode_retrait,
        adresse_livraison: commande.adresse_livraison,
        ville_livraison: commande.ville_livraison,
        frais_livraison_appliques: commande.frais_livraison_appliques,
        date_commande: commande.date_commande,
        restaurant_nom: commande.restaurant_nom,
        restaurant_telephone: commande.restaurant_telephone,
        items
      }
    });
  } catch (error) {
    console.error('Erreur récupération commande par token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande.'
    });
  }
};

// Créer une commande
const createCommande = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      items, 
      telephone_client, 
      email_client, 
      notes, 
      mode_paiement = 'sur_place',
      mode_retrait = 'a_emporter',
      adresse_livraison,
      code_postal_livraison,
      ville_livraison,
      instructions_livraison
    } = req.body;

    // Validation des items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un article.'
      });
    }

    // Vérifier que le restaurant existe et est actif
    const [restaurants] = await pool.query(
      `SELECT id, nom, actif, paiement_sur_place, paiement_en_ligne, 
              stripe_account_id, stripe_onboarding_complete,
              livraison_active, a_emporter_active, frais_livraison,
              minimum_livraison, zone_livraison_km
       FROM restaurants WHERE id = ?`,
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé.'
      });
    }

    const restaurant = restaurants[0];

    if (!restaurant.actif) {
      return res.status(400).json({
        success: false,
        message: 'Ce restaurant n\'accepte pas de commandes actuellement.'
      });
    }

    // Vérifier le mode de retrait
    if (mode_retrait === 'a_emporter' && !restaurant.a_emporter_active) {
      return res.status(400).json({
        success: false,
        message: 'Ce restaurant ne propose pas le retrait sur place.'
      });
    }

    if (mode_retrait === 'livraison') {
      if (!restaurant.livraison_active) {
        return res.status(400).json({
          success: false,
          message: 'Ce restaurant ne propose pas la livraison.'
        });
      }

      // Vérifier que l'adresse de livraison est fournie
      if (!adresse_livraison || !ville_livraison) {
        return res.status(400).json({
          success: false,
          message: 'L\'adresse de livraison est requise.'
        });
      }
    }

    // Vérifier le mode de paiement demandé
    if (mode_paiement === 'sur_place' && !restaurant.paiement_sur_place) {
      return res.status(400).json({
        success: false,
        message: 'Ce restaurant n\'accepte pas le paiement sur place.'
      });
    }

    if (mode_paiement === 'en_ligne') {
      if (!restaurant.paiement_en_ligne) {
        return res.status(400).json({
          success: false,
          message: 'Ce restaurant n\'accepte pas le paiement en ligne.'
        });
      }
      
      if (!restaurant.stripe_account_id || !restaurant.stripe_onboarding_complete) {
        return res.status(400).json({
          success: false,
          message: 'Le paiement en ligne n\'est pas encore configuré pour ce restaurant.'
        });
      }
    }

    // Vérifier et récupérer les plats
    const platIds = items.map(item => item.plat_id);
    const [plats] = await pool.query(
      'SELECT id, nom, prix, disponible FROM plats WHERE id IN (?) AND restaurant_id = ?',
      [platIds, restaurant_id]
    );

    // Vérifier que tous les plats existent
    const platIdsFound = plats.map(p => p.id);
    const missingPlats = platIds.filter(id => !platIdsFound.includes(id));
    
    if (missingPlats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Plat(s) invalide(s) ou n'appartenant pas à ce restaurant.`
      });
    }

    // Vérifier la disponibilité et construire les items
    const itemsJson = [];
    let montantArticles = 0;

    for (const item of items) {
      const plat = plats.find(p => p.id === item.plat_id);
      
      if (!plat) {
        return res.status(400).json({
          success: false,
          message: `Le plat avec l'ID ${item.plat_id} n'existe pas.`
        });
      }

      if (!plat.disponible) {
        return res.status(400).json({
          success: false,
          message: `Le plat "${plat.nom}" n'est plus disponible.`
        });
      }

      const quantite = parseInt(item.quantite) || 1;
      if (quantite < 1) {
        return res.status(400).json({
          success: false,
          message: 'La quantité doit être au moins 1.'
        });
      }

      const sousTotal = parseFloat(plat.prix) * quantite;
      montantArticles += sousTotal;

      itemsJson.push({
        plat_id: plat.id,
        nom_plat: plat.nom,
        prix_unitaire: parseFloat(plat.prix),
        quantite: quantite,
        sous_total: parseFloat(sousTotal.toFixed(2))
      });
    }

    // Calculer les frais de livraison
    let fraisLivraison = 0;
    if (mode_retrait === 'livraison') {
      fraisLivraison = parseFloat(restaurant.frais_livraison) || 0;

      // Vérifier le montant minimum pour la livraison
      const minimumLivraison = parseFloat(restaurant.minimum_livraison) || 0;
      if (montantArticles < minimumLivraison) {
        return res.status(400).json({
          success: false,
          message: `Le montant minimum pour la livraison est de ${minimumLivraison.toFixed(2)}€. Montant actuel: ${montantArticles.toFixed(2)}€`
        });
      }
    }

    // Calculer le montant total
    const montantTotal = parseFloat((montantArticles + fraisLivraison).toFixed(2));

    // Générer le numéro de commande et le token de suivi
    const numeroCommande = generateOrderNumber();
    const tokenSuivi = !req.user ? generateTrackingToken() : null;

    // Déterminer le statut initial selon le mode de paiement
    const statutInitial = 'en_attente';
    const paiementStatut = 'en_attente';

    // Créer la commande
    const [result] = await pool.query(
      `INSERT INTO commandes 
       (restaurant_id, utilisateur_id, numero_commande, montant_total, 
        telephone_client, email_client, token_suivi, notes, items_json, 
        statut, mode_paiement, paiement_statut,
        mode_retrait, adresse_livraison, code_postal_livraison, ville_livraison,
        instructions_livraison, frais_livraison_appliques)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant_id,
        req.user?.id || null,
        numeroCommande,
        montantTotal,
        telephone_client,
        email_client || null,
        tokenSuivi,
        notes || null,
        JSON.stringify(itemsJson),
        statutInitial,
        mode_paiement,
        paiementStatut,
        mode_retrait,
        mode_retrait === 'livraison' ? adresse_livraison : null,
        mode_retrait === 'livraison' ? code_postal_livraison : null,
        mode_retrait === 'livraison' ? ville_livraison : null,
        mode_retrait === 'livraison' ? (instructions_livraison || null) : null,
        fraisLivraison
      ]
    );

    // Récupérer la commande créée
    const [newCommande] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    // Émettre un événement WebSocket si disponible
    if (req.io) {
      req.io.to(`restaurant_${restaurant_id}`).emit('nouvelle_commande', {
        id: newCommande[0].id,
        numero_commande: newCommande[0].numero_commande,
        montant_total: newCommande[0].montant_total,
        statut: newCommande[0].statut,
        mode_paiement: newCommande[0].mode_paiement,
        paiement_statut: newCommande[0].paiement_statut,
        mode_retrait: newCommande[0].mode_retrait,
        adresse_livraison: newCommande[0].adresse_livraison,
        ville_livraison: newCommande[0].ville_livraison,
        telephone_client: newCommande[0].telephone_client,
        items: itemsJson,
        date_commande: newCommande[0].date_commande
      });
    }

    // Préparer la réponse
    const responseData = {
      id: newCommande[0].id,
      numero_commande: newCommande[0].numero_commande,
      montant_articles: montantArticles,
      frais_livraison: fraisLivraison,
      montant_total: newCommande[0].montant_total,
      statut: newCommande[0].statut,
      mode_paiement: newCommande[0].mode_paiement,
      paiement_statut: newCommande[0].paiement_statut,
      mode_retrait: newCommande[0].mode_retrait,
      adresse_livraison: newCommande[0].adresse_livraison,
      ville_livraison: newCommande[0].ville_livraison,
      restaurant_nom: newCommande[0].restaurant_nom,
      items: itemsJson,
      date_commande: newCommande[0].date_commande
    };

    // Ajouter le token de suivi pour les commandes invité
    if (tokenSuivi) {
      responseData.token_suivi = tokenSuivi;
    }

    // Si paiement en ligne, indiquer qu'il faut procéder au paiement
    if (mode_paiement === 'en_ligne') {
      responseData.requires_payment = true;
      responseData.payment_url = `/api/paiement/create-session`;
    }

    res.status(201).json({
      success: true,
      message: mode_paiement === 'en_ligne' 
        ? 'Commande créée. Veuillez procéder au paiement.' 
        : 'Commande créée avec succès.',
      data: responseData
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande.'
    });
  }
};

// Mettre à jour le statut d'une commande
const updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const validStatuts = [
      'en_attente', 'confirmee', 'en_preparation', 
      'prete', 'livree', 'recuperee', 'annulee'
    ];

    if (!validStatuts.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide.',
        statuts_valides: validStatuts
      });
    }

    // Vérifier que la commande existe
    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE id = ?',
      [id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Vérifier les droits pour les restaurateurs
    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ? AND id = ?',
        [req.user.id, commande.restaurant_id]
      );
      if (restaurants.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier cette commande.'
        });
      }
    }

    // Vérifier les transitions de statut valides
    const currentStatut = commande.statut;
    const invalidTransitions = {
      'livree': ['en_attente', 'confirmee', 'en_preparation', 'prete'],
      'recuperee': ['en_attente', 'confirmee', 'en_preparation', 'prete'],
      'annulee': ['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'recuperee']
    };

    if (invalidTransitions[currentStatut] && invalidTransitions[currentStatut].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Impossible de passer du statut "${currentStatut}" à "${statut}".`
      });
    }

    // Mettre à jour les heures selon le statut
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let heureField = null;

    switch (statut) {
      case 'confirmee':
        heureField = 'heure_confirmation';
        break;
      case 'en_preparation':
        heureField = 'heure_preparation';
        break;
      case 'prete':
        heureField = 'heure_prete';
        break;
      case 'livree':
      case 'recuperee':
        heureField = 'heure_livraison';
        break;
    }

    let query = 'UPDATE commandes SET statut = ?';
    const params = [statut];

    if (heureField && !commande[heureField]) {
      query += `, ${heureField} = ?`;
      params.push(now);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);

    // Récupérer la commande mise à jour
    const [updatedCommande] = await pool.query(
      `SELECT c.*, r.nom as restaurant_nom
       FROM commandes c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ?`,
      [id]
    );

    // Parser les items
    let items = [];
    try {
      items = typeof updatedCommande[0].items_json === 'string'
        ? JSON.parse(updatedCommande[0].items_json)
        : (updatedCommande[0].items_json || []);
    } catch (e) {
      items = [];
    }

    // Émettre un événement WebSocket
    if (req.io) {
      const eventData = {
        id: updatedCommande[0].id,
        numero_commande: updatedCommande[0].numero_commande,
        statut: updatedCommande[0].statut,
        ancien_statut: currentStatut,
        mode_retrait: updatedCommande[0].mode_retrait
      };

      req.io.to(`restaurant_${commande.restaurant_id}`).emit('statut_commande', eventData);
      
      // Notifier le client si connecté
      if (commande.utilisateur_id) {
        req.io.to(`user_${commande.utilisateur_id}`).emit('statut_commande', eventData);
      }
    }

    res.json({
      success: true,
      message: `Commande ${statut.replace('_', ' ')}.`,
      data: {
        ...updatedCommande[0],
        items,
        items_json: undefined
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut.'
    });
  }
};

// Annuler une commande
const annulerCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE id = ?',
      [id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée.'
      });
    }

    const commande = commandes[0];

    // Vérifier si la commande peut être annulée
    const statutsNonAnnulables = ['livree', 'recuperee', 'annulee'];
    if (statutsNonAnnulables.includes(commande.statut)) {
      return res.status(400).json({
        success: false,
        message: `Cette commande ne peut plus être annulée (statut: ${commande.statut}).`
      });
    }

    // Vérifier les droits
    if (req.user.role === 'client' && commande.utilisateur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas annuler cette commande.'
      });
    }

    // Vérifier pour les restaurateurs
    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ? AND id = ?',
        [req.user.id, commande.restaurant_id]
      );
      if (restaurants.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez pas annuler cette commande.'
        });
      }
    }

    // Si la commande a été payée en ligne, il faudrait initier un remboursement
    let paiementStatut = commande.paiement_statut;
    if (commande.mode_paiement === 'en_ligne' && commande.paiement_statut === 'paye') {
      paiementStatut = 'rembourse';
    }

    await pool.query(
      'UPDATE commandes SET statut = ?, paiement_statut = ? WHERE id = ?',
      ['annulee', paiementStatut, id]
    );

    // Émettre un événement WebSocket
    if (req.io) {
      req.io.to(`restaurant_${commande.restaurant_id}`).emit('commande_annulee', {
        id: commande.id,
        numero_commande: commande.numero_commande
      });

      if (commande.utilisateur_id) {
        req.io.to(`user_${commande.utilisateur_id}`).emit('commande_annulee', {
          id: commande.id,
          numero_commande: commande.numero_commande
        });
      }
    }

    res.json({
      success: true,
      message: 'Commande annulée avec succès.'
    });
  } catch (error) {
    console.error('Erreur annulation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la commande.'
    });
  }
};

// Statistiques des commandes (restaurateur/admin)
const getStatistiques = async (req, res) => {
  try {
    let restaurantId = req.query.restaurant_id;

    // Si restaurateur, utiliser son restaurant
    if (req.user.role === 'restaurateur') {
      const [restaurants] = await pool.query(
        'SELECT id FROM restaurants WHERE utilisateur_id = ?',
        [req.user.id]
      );
      if (restaurants.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Vous n\'avez pas de restaurant.'
        });
      }
      restaurantId = restaurants[0].id;
    }

    let whereClause = '';
    const params = [];

    if (restaurantId) {
      whereClause = 'WHERE restaurant_id = ?';
      params.push(restaurantId);
    }

    // Statistiques générales
    const [general] = await pool.query(
      `SELECT 
        COUNT(*) as total_commandes,
        COALESCE(SUM(montant_total), 0) as ca_total,
        COALESCE(AVG(montant_total), 0) as panier_moyen,
        SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as commandes_annulees
       FROM commandes ${whereClause}`,
      params
    );

    // Statistiques par mode de paiement
    const [parModePaiement] = await pool.query(
      `SELECT 
        mode_paiement,
        COUNT(*) as count,
        SUM(montant_total) as total
       FROM commandes ${whereClause}
       GROUP BY mode_paiement`,
      params
    );

    // Statistiques par mode de retrait
    const [parModeRetrait] = await pool.query(
      `SELECT 
        mode_retrait,
        COUNT(*) as count,
        SUM(montant_total) as total
       FROM commandes ${whereClause}
       GROUP BY mode_retrait`,
      params
    );

    // Statistiques par statut de paiement
    const [parPaiementStatut] = await pool.query(
      `SELECT 
        paiement_statut,
        COUNT(*) as count,
        SUM(montant_total) as total
       FROM commandes ${whereClause}
       GROUP BY paiement_statut`,
      params
    );

    // Statistiques du jour
    const [jour] = await pool.query(
      `SELECT 
        COUNT(*) as commandes_jour,
        COALESCE(SUM(montant_total), 0) as ca_jour
       FROM commandes 
       ${whereClause ? whereClause + ' AND' : 'WHERE'} DATE(date_commande) = CURDATE()`,
      params
    );

    // Statistiques de la semaine
    const [semaine] = await pool.query(
      `SELECT 
        COUNT(*) as commandes_semaine,
        COALESCE(SUM(montant_total), 0) as ca_semaine
       FROM commandes 
       ${whereClause ? whereClause + ' AND' : 'WHERE'} 
       date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      params
    );

    // Statistiques du mois
    const [mois] = await pool.query(
      `SELECT 
        COUNT(*) as commandes_mois,
        COALESCE(SUM(montant_total), 0) as ca_mois
       FROM commandes 
       ${whereClause ? whereClause + ' AND' : 'WHERE'} 
       date_commande >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      params
    );

    // Répartition par statut
    const [parStatut] = await pool.query(
      `SELECT statut, COUNT(*) as count
       FROM commandes ${whereClause}
       GROUP BY statut
       ORDER BY FIELD(statut, 'en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'recuperee', 'annulee')`,
      params
    );

    // Commandes récentes
    const [commandesRecentes] = await pool.query(
      `SELECT id, numero_commande, montant_total, statut, mode_paiement, paiement_statut, 
              mode_retrait, date_commande, telephone_client
       FROM commandes 
       ${whereClause}
       ORDER BY date_commande DESC
       LIMIT 5`,
      params
    );

    res.json({
      success: true,
      data: {
        general: {
          ...general[0],
          ca_total: parseFloat(general[0].ca_total) || 0,
          panier_moyen: parseFloat(general[0].panier_moyen) || 0
        },
        jour: {
          ...jour[0],
          ca_jour: parseFloat(jour[0].ca_jour) || 0
        },
        semaine: {
          ...semaine[0],
          ca_semaine: parseFloat(semaine[0].ca_semaine) || 0
        },
        mois: {
          ...mois[0],
          ca_mois: parseFloat(mois[0].ca_mois) || 0
        },
        par_statut: parStatut,
        par_mode_paiement: parModePaiement,
        par_mode_retrait: parModeRetrait,
        par_paiement_statut: parPaiementStatut,
        commandes_recentes: commandesRecentes
      }
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques.'
    });
  }
};

module.exports = {
  getCommandes,
  getCommandeById,
  getCommandeByToken,
  createCommande,
  updateStatut,
  annulerCommande,
  getStatistiques
};