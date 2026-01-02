// src/components/ScrollToTop.jsx
// Composant pour remonter en haut de page lors des changements de route

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant qui scroll automatiquement en haut de la page
 * lors d'un changement de route
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll en haut de la page à chaque changement de route
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'smooth' pour une animation, 'instant' pour immédiat
    });
  }, [pathname]);

  return null; // Ce composant ne rend rien
}

export default ScrollToTop;