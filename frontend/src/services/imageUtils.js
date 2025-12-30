/**
 * Helper pour construire l'URL complète d'une image
 * Gère les URLs relatives (/uploads/...) et les URLs absolues (https://...)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SERVER_URL = API_BASE_URL.replace('/api', '');

/**
 * Construit l'URL complète d'une image
 * @param {string} imageUrl - L'URL de l'image (relative ou absolue)
 * @param {string} defaultImage - Image par défaut si imageUrl est vide
 * @returns {string} - L'URL complète de l'image
 */
export const getImageUrl = (imageUrl, defaultImage = null) => {
  if (!imageUrl) {
    return defaultImage;
  }

  // Si c'est déjà une URL absolue, la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si c'est une URL relative commençant par /uploads, construire l'URL complète
  if (imageUrl.startsWith('/uploads')) {
    return `${SERVER_URL}${imageUrl}`;
  }

  // Sinon, retourner l'URL telle quelle
  return imageUrl;
};

/**
 * Image par défaut pour les restaurants
 */
export const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop';

/**
 * Image par défaut pour les plats
 */
export const DEFAULT_PLAT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

export default getImageUrl;