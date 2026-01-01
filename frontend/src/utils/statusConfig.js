// src/utils/statusConfig.js
// Configuration centralisée des statuts de commande
import { Clock, CheckCircle, ChefHat, Truck, PartyPopper, XCircle, AlertCircle } from 'lucide-react';

export const ORDER_STATUS = {
  en_attente: {
    label: 'En attente',
    color: 'yellow',
    icon: Clock,
    step: 1,
    message: 'Votre commande a été reçue et attend la confirmation du restaurant.',
    next: 'confirmee',
    nextLabel: 'Confirmer',
  },
  confirmee: {
    label: 'Confirmée',
    color: 'blue',
    icon: CheckCircle,
    step: 2,
    message: 'Le restaurant a confirmé votre commande. La préparation va bientôt commencer.',
    next: 'en_preparation',
    nextLabel: 'Préparer',
  },
  en_preparation: {
    label: 'En préparation',
    color: 'orange',
    icon: ChefHat,
    step: 3,
    message: 'Votre commande est en cours de préparation par le chef.',
    next: 'prete',
    nextLabel: 'Préparer',
  },
  prete: {
    label: 'Prête',
    color: 'green',
    icon: CheckCircle,
    step: 4,
    message: 'Votre commande est prête ! Vous pouvez venir la récupérer.',
    next: 'recuperee',
    nextLabel: 'Récupérée',
  },
  livree: {
    label: 'Livrée',
    color: 'green',
    icon: Truck,
    step: 5,
    message: 'Votre commande a été livrée. Bon appétit !',
    next: null,
    nextLabel: null,
  },
  recuperee: {
    label: 'Récupérée',
    color: 'green',
    icon: PartyPopper,
    step: 5,
    message: 'Merci pour votre commande. Bon appétit !',
    next: null,
    nextLabel: null,
  },
  annulee: {
    label: 'Annulée',
    color: 'red',
    icon: XCircle,
    step: 0,
    message: 'Cette commande a été annulée.',
    next: null,
    nextLabel: null,
  },
};

export const PAYMENT_STATUS = {
  en_attente: { label: 'En attente', color: 'yellow' },
  paye: { label: 'Payé', color: 'green' },
  echoue: { label: 'Échoué', color: 'red' },
  rembourse: { label: 'Remboursé', color: 'blue' },
};

export const USER_ROLES = {
  admin: { label: 'Administrateur', color: 'red' },
  restaurateur: { label: 'Restaurateur', color: 'orange' },
  client: { label: 'Client', color: 'blue' },
};

/**
 * Récupère les infos d'un statut de commande
 * @param {string} status - Le statut
 * @returns {object} Les infos du statut
 */
export const getOrderStatus = (status) => {
  return ORDER_STATUS[status] || {
    label: status,
    color: 'gray',
    icon: AlertCircle,
    step: 0,
    message: '',
    next: null,
    nextLabel: null,
  };
};

/**
 * Récupère les infos d'un statut de paiement
 * @param {string} status - Le statut
 * @returns {object} Les infos du statut
 */
export const getPaymentStatus = (status) => {
  return PAYMENT_STATUS[status] || { label: status, color: 'gray' };
};

/**
 * Récupère les infos d'un rôle utilisateur
 * @param {string} role - Le rôle
 * @returns {object} Les infos du rôle
 */
export const getUserRole = (role) => {
  return USER_ROLES[role] || { label: role, color: 'gray' };
};

/**
 * Vérifie si une commande est active
 * @param {string} status - Le statut
 * @returns {boolean}
 */
export const isOrderActive = (status) => {
  return !['recuperee', 'livree', 'annulee'].includes(status);
};

/**
 * Vérifie si une commande est terminée
 * @param {string} status - Le statut
 * @returns {boolean}
 */
export const isOrderCompleted = (status) => {
  return ['recuperee', 'livree'].includes(status);
};

// Étapes du suivi de commande
export const ORDER_STEPS = [
  { id: 1, label: 'Reçue' },
  { id: 2, label: 'Confirmée' },
  { id: 3, label: 'En préparation' },
  { id: 4, label: 'Prête' },
];