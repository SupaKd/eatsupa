// src/components/ProtectedRoute.jsx
// Composant pour protéger les routes - Utilise Redux

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectUser, 
  selectSessionChecked,
  selectAuthLoading 
} from '@/store/slices/authSlice';

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
  
  // Sélecteurs Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const sessionChecked = useSelector(selectSessionChecked);
  const loading = useSelector(selectAuthLoading);

  // Attendre que la session soit vérifiée
  if (!sessionChecked || loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⏳</div>
          <div>Vérification de la session...</div>
        </div>
      </div>
    );
  }

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