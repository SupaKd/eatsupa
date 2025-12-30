// src/utils/formatters.js
// Utilitaires de formatage centralisés - évite la duplication dans 15+ fichiers

/**
 * Formate un prix en euros
 * @param {number} price - Le prix à formater
 * @returns {string} Prix formaté (ex: "12,50 €")
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };
  
  /**
   * Formate une date complète
   * @param {string|Date} dateString - La date à formater
   * @returns {string} Date formatée (ex: "15 janvier 2025 à 14:30")
   */
  export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };
  
  /**
   * Formate une date courte
   * @param {string|Date} dateString - La date à formater
   * @returns {string} Date formatée (ex: "15 janv. 2025")
   */
  export const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  /**
   * Formate une heure
   * @param {string|Date} dateString - La date/heure à formater
   * @returns {string} Heure formatée (ex: "14:30")
   */
  export const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  /**
   * Formate une date avec heure courte
   * @param {string|Date} dateString - La date à formater
   * @returns {string} Date formatée (ex: "15 janv., 14:30")
   */
  export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };