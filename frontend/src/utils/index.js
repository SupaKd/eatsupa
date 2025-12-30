// src/utils/index.js
// Point d'entrée unique pour tous les utilitaires

export * from './formatters';
export * from './statusConfig';

// Re-export des services d'image
export { getImageUrl, DEFAULT_RESTAURANT_IMAGE, DEFAULT_PLAT_IMAGE } from '@services/imageUtils';