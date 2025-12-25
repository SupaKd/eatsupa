import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * et/ou un rôle spécifique
 * 
 * @param {ReactNode} children - Le composant enfant à afficher si autorisé
 * @param {string[]} allowedRoles - Tableau des rôles autorisés (optionnel)
 * @param {boolean} requireAuth - Si true, nécessite une authentification (par défaut: true)
 * 
 * @example
 * // Route accessible uniquement aux admins
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Route accessible à tous les utilisateurs authentifiés
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 * 
 * @example
 * // Route accessible aux restaurateurs et admins
 * <ProtectedRoute allowedRoles={['restaurateur', 'admin']}>
 *   <RestaurantDashboard />
 * </ProtectedRoute>
 */
function ProtectedRoute({ children, allowedRoles = [], requireAuth = true }) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    // Rediriger vers login en sauvegardant la location d'origine
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles spécifiques sont requis
  if (allowedRoles.length > 0) {
    // Vérifier si l'utilisateur a un des rôles autorisés
    const hasRequiredRole = allowedRoles.includes(user?.role);
    
    if (!hasRequiredRole) {
      // Rediriger vers la page d'accueil si le rôle n'est pas autorisé
      return <Navigate to="/" replace />;
    }
  }

  // Si toutes les conditions sont remplies, afficher le composant enfant
  return children;
}

export default ProtectedRoute;