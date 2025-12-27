const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ========== CONSTANTES ==========

// Jours en français (index 0 = dimanche en JS)
const JOURS_SEMAINE = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// ========== GÉNÉRATION ==========

// Générer un numéro de commande unique
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CMD-${timestamp}-${random}`;
};

// Générer un token unique
const generateToken = () => {
  return uuidv4();
};

// Générer un token de suivi sécurisé pour les commandes invité
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ========== DATES ET FORMATAGE ==========

// Formater une date pour MySQL
const formatDateMySQL = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Formater un prix
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// Slugify une chaîne
const slugify = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// ========== PAGINATION ==========

// Paginer les résultats
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

// Construire la réponse paginée
const paginatedResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// ========== UTILITAIRES ==========

// Nettoyer un objet des propriétés undefined/null
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
};

// Calculer le montant total d'une commande
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.prix_unitaire * item.quantite);
  }, 0);
};

// ========== VALIDATION ==========

// Valider un numéro de téléphone français
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

// Valider un code postal français
const isValidPostalCode = (code) => {
  const postalRegex = /^[0-9]{5}$/;
  return postalRegex.test(code);
};

// Valider un email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ========== GESTION DES HORAIRES D'OUVERTURE ==========

/**
 * Convertit une heure "HH:MM" en minutes depuis minuit
 * @param {string} time - Heure au format "HH:MM"
 * @returns {number} Minutes depuis minuit
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Vérifie si le restaurant est actuellement ouvert
 * Prend en compte:
 * - Les horaires d'ouverture configurés
 * - La fermeture exceptionnelle (toggle manuel du restaurateur)
 * 
 * @param {string|object|null} horairesJson - Les horaires d'ouverture (JSON string ou objet)
 * @param {boolean} [fermetureExceptionnelle=false] - Si true, le restaurant est fermé manuellement
 * @param {Date} [date] - Date à vérifier (par défaut: maintenant)
 * @returns {boolean} true si ouvert, false sinon
 */
const isRestaurantOpen = (horairesJson, fermetureExceptionnelle = false, date = new Date()) => {
  // Si fermeture exceptionnelle activée, le restaurant est fermé
  if (fermetureExceptionnelle) {
    return false;
  }

  // Si pas d'horaires définis, on considère ouvert 24/7
  if (!horairesJson) {
    return true;
  }

  try {
    const horaires = typeof horairesJson === 'string' 
      ? JSON.parse(horairesJson) 
      : horairesJson;

    const jourActuel = JOURS_SEMAINE[date.getDay()];
    const heureActuelle = date.getHours() * 60 + date.getMinutes();

    const jourConfig = horaires[jourActuel];

    // Jour non défini ou fermé
    if (!jourConfig || !jourConfig.ouvert || !jourConfig.horaires || jourConfig.horaires.length === 0) {
      return false;
    }

    // Vérifier chaque créneau horaire
    for (const creneau of jourConfig.horaires) {
      if (!creneau.debut || !creneau.fin) continue;

      const debut = timeToMinutes(creneau.debut);
      const fin = timeToMinutes(creneau.fin);

      // Gestion du passage à minuit (ex: 22:00 - 02:00)
      if (fin < debut) {
        // Le créneau passe minuit
        if (heureActuelle >= debut || heureActuelle <= fin) {
          return true;
        }
      } else {
        // Créneau normal
        if (heureActuelle >= debut && heureActuelle <= fin) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Erreur parsing horaires:', error);
    // En cas d'erreur de parsing, on laisse passer pour ne pas bloquer les commandes
    return true;
  }
};

/**
 * Retourne les prochaines heures d'ouverture
 * @param {string|object|null} horairesJson - Les horaires d'ouverture
 * @param {boolean} [fermetureExceptionnelle=false] - Si true, retourne null (fermeture manuelle)
 * @param {Date} [fromDate] - Date de départ (par défaut: maintenant)
 * @returns {object|null} Informations sur la prochaine ouverture ou null
 */
const getNextOpeningTime = (horairesJson, fermetureExceptionnelle = false, fromDate = new Date()) => {
  // Si fermeture exceptionnelle, pas de prochaine ouverture automatique
  if (fermetureExceptionnelle) {
    return { fermetureManuelle: true };
  }

  if (!horairesJson) {
    return null;
  }

  try {
    const horaires = typeof horairesJson === 'string' 
      ? JSON.parse(horairesJson) 
      : horairesJson;

    const heureActuelle = fromDate.getHours() * 60 + fromDate.getMinutes();

    // Chercher dans les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + i);
      const jour = JOURS_SEMAINE[date.getDay()];
      const jourConfig = horaires[jour];

      if (jourConfig && jourConfig.ouvert && jourConfig.horaires && jourConfig.horaires.length > 0) {
        for (const creneau of jourConfig.horaires) {
          if (!creneau.debut) continue;

          const debut = timeToMinutes(creneau.debut);

          // Si c'est aujourd'hui, vérifier que le créneau n'est pas déjà passé
          if (i === 0 && debut <= heureActuelle) {
            continue;
          }

          // Construire la date/heure de prochaine ouverture
          const [heures, minutes] = creneau.debut.split(':').map(Number);
          const prochaineOuverture = new Date(date);
          prochaineOuverture.setHours(heures, minutes, 0, 0);

          return {
            jour: jour,
            jourCapitalized: jour.charAt(0).toUpperCase() + jour.slice(1),
            date: date.toISOString().split('T')[0],
            heure: creneau.debut,
            datetime: prochaineOuverture.toISOString(),
            estAujourdHui: i === 0,
            estDemain: i === 1,
            dansJours: i
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Erreur calcul prochaine ouverture:', error);
    return null;
  }
};

/**
 * Retourne l'heure de fermeture du créneau actuel
 * @param {string|object|null} horairesJson - Les horaires d'ouverture
 * @param {Date} [date] - Date à vérifier (par défaut: maintenant)
 * @returns {string|null} Heure de fermeture "HH:MM" ou null si fermé
 */
const getClosingTime = (horairesJson, date = new Date()) => {
  if (!horairesJson) {
    return null;
  }

  try {
    const horaires = typeof horairesJson === 'string' 
      ? JSON.parse(horairesJson) 
      : horairesJson;

    const jourActuel = JOURS_SEMAINE[date.getDay()];
    const heureActuelle = date.getHours() * 60 + date.getMinutes();

    const jourConfig = horaires[jourActuel];

    if (!jourConfig || !jourConfig.ouvert || !jourConfig.horaires) {
      return null;
    }

    for (const creneau of jourConfig.horaires) {
      if (!creneau.debut || !creneau.fin) continue;

      const debut = timeToMinutes(creneau.debut);
      const fin = timeToMinutes(creneau.fin);

      // Vérifier si on est dans ce créneau
      if (fin < debut) {
        // Créneau passant minuit
        if (heureActuelle >= debut || heureActuelle <= fin) {
          return creneau.fin;
        }
      } else {
        if (heureActuelle >= debut && heureActuelle <= fin) {
          return creneau.fin;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Erreur calcul heure fermeture:', error);
    return null;
  }
};

/**
 * Formate les horaires pour l'affichage (commence par lundi)
 * @param {string|object|null} horairesJson - Les horaires d'ouverture
 * @returns {array} Tableau des horaires formatés par jour
 */
const formatHorairesAffichage = (horairesJson) => {
  if (!horairesJson) {
    return [];
  }

  try {
    const horaires = typeof horairesJson === 'string' 
      ? JSON.parse(horairesJson) 
      : horairesJson;

    // Réorganiser pour commencer par lundi (lundi à samedi, puis dimanche)
    const joursOrdonnes = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

    return joursOrdonnes.map(jour => {
      const config = horaires[jour];
      
      if (!config || !config.ouvert || !config.horaires || config.horaires.length === 0) {
        return { 
          jour, 
          jourCapitalized: jour.charAt(0).toUpperCase() + jour.slice(1),
          ouvert: false,
          statut: 'Fermé', 
          creneaux: [],
          creneauxFormates: 'Fermé'
        };
      }

      const creneaux = config.horaires
        .filter(c => c.debut && c.fin)
        .map(c => ({
          debut: c.debut,
          fin: c.fin,
          formate: `${c.debut} - ${c.fin}`
        }));

      return {
        jour,
        jourCapitalized: jour.charAt(0).toUpperCase() + jour.slice(1),
        ouvert: true,
        statut: 'Ouvert',
        creneaux: creneaux,
        creneauxFormates: creneaux.map(c => c.formate).join(', ')
      };
    });
  } catch (error) {
    console.error('Erreur formatage horaires:', error);
    return [];
  }
};

/**
 * Vérifie si les horaires sont valides (format correct)
 * @param {object} horaires - Objet horaires à valider
 * @returns {object} { valid: boolean, errors: string[] }
 */
const validateHoraires = (horaires) => {
  const errors = [];
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (typeof horaires !== 'object' || horaires === null) {
    return { valid: false, errors: ['Les horaires doivent être un objet.'] };
  }

  for (const jour of JOURS_SEMAINE) {
    const config = horaires[jour];
    
    if (!config) continue;

    if (typeof config.ouvert !== 'boolean') {
      errors.push(`${jour}: "ouvert" doit être un booléen.`);
      continue;
    }

    if (config.ouvert && config.horaires) {
      if (!Array.isArray(config.horaires)) {
        errors.push(`${jour}: "horaires" doit être un tableau.`);
        continue;
      }

      for (let i = 0; i < config.horaires.length; i++) {
        const creneau = config.horaires[i];
        
        if (!creneau.debut || !timeRegex.test(creneau.debut)) {
          errors.push(`${jour}, créneau ${i + 1}: "debut" invalide (format HH:MM attendu).`);
        }
        
        if (!creneau.fin || !timeRegex.test(creneau.fin)) {
          errors.push(`${jour}, créneau ${i + 1}: "fin" invalide (format HH:MM attendu).`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Génère un objet horaires par défaut (ouvert tous les jours)
 * @param {string} [debutMidi='11:30'] - Heure début service midi
 * @param {string} [finMidi='14:30'] - Heure fin service midi
 * @param {string} [debutSoir='18:00'] - Heure début service soir
 * @param {string} [finSoir='22:30'] - Heure fin service soir
 * @returns {object} Objet horaires
 */
const generateDefaultHoraires = (
  debutMidi = '11:30',
  finMidi = '14:30',
  debutSoir = '18:00',
  finSoir = '22:30'
) => {
  const horaires = {};
  
  for (const jour of JOURS_SEMAINE) {
    horaires[jour] = {
      ouvert: true,
      horaires: [
        { debut: debutMidi, fin: finMidi },
        { debut: debutSoir, fin: finSoir }
      ]
    };
  }

  return horaires;
};

// ========== EXPORTS ==========

module.exports = {
  // Constantes
  JOURS_SEMAINE,
  
  // Génération
  generateOrderNumber,
  generateToken,
  generateTrackingToken,
  
  // Dates et formatage
  formatDateMySQL,
  formatPrice,
  slugify,
  
  // Pagination
  paginate,
  paginatedResponse,
  
  // Utilitaires
  cleanObject,
  calculateOrderTotal,
  
  // Validation
  isValidPhoneNumber,
  isValidPostalCode,
  isValidEmail,
  
  // Horaires d'ouverture
  timeToMinutes,
  isRestaurantOpen,
  getNextOpeningTime,
  getClosingTime,
  formatHorairesAffichage,
  validateHoraires,
  generateDefaultHoraires
};