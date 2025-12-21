const { v4: uuidv4 } = require('uuid');

// Générer un numéro de commande unique
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CMD-${timestamp}-${random}`;
};

// Formater une date pour MySQL
const formatDateMySQL = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Générer un token unique
const generateToken = () => {
  return uuidv4();
};

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

module.exports = {
  generateOrderNumber,
  formatDateMySQL,
  generateToken,
  paginate,
  paginatedResponse,
  cleanObject,
  calculateOrderTotal,
  isValidPhoneNumber,
  isValidPostalCode,
  formatPrice,
  slugify
};