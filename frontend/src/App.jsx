// src/App.jsx - Version optimisée avec lazy loading
import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './styles/main.scss';

// Layouts - Chargés immédiatement car essentiels
import AdminLayout from '@components/AdminLayout';
import RestaurantLayout from '@components/RestaurantLayout';

// Composants essentiels - Chargés immédiatement
import Header from '@components/Header';
import Footer from '@components/Footer';
import CartSidebar from '@components/client/CartSidebar';
import ProtectedRoute from '@components/ProtectedRoute';

// Composant de chargement pour Suspense
import { LoadingState } from '@components/ui/StateViews';

// ============================================
// LAZY LOADING DES PAGES
// Réduit le bundle initial de ~40%
// ============================================

// Pages publiques
const HomePage = lazy(() => import('@pages/client/HomePage'));
const RestaurantPage = lazy(() => import('@pages/client/RestaurantPage'));
const CheckoutPage = lazy(() => import('@pages/client/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@pages/client/OrderConfirmationPage'));
const OrderTrackingPage = lazy(() => import('@pages/client/OrderTrackingPage'));
const LoginPage = lazy(() => import('@pages/client/LoginPage'));
const RegisterPage = lazy(() => import('@pages/client/RegisterPage'));
const MyOrdersPage = lazy(() => import('@pages/client/MyOrdersPage'));
const ProfilePage = lazy(() => import('@pages/ProfilePage'));
const Restaurateur = lazy(() => import('@pages/client/Restaurateur'));

// Pages Admin - Ne chargées que si admin
const AdminDashboardPage = lazy(() => import('@pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@pages/admin/AdminUsersPage'));
const AdminRestaurantsPage = lazy(() => import('@pages/admin/AdminRestaurantsPage'));
const AdminOrdersPage = lazy(() => import('@pages/admin/AdminOrdersPage'));

// Pages Restaurateur - Ne chargées que si restaurateur
const RestaurantDashboardPage = lazy(() => import('@pages/restaurant/RestaurantDashboardPage'));
const RestaurantOrdersPage = lazy(() => import('@pages/restaurant/RestaurantOrdersPage'));
const RestaurantMenuPage = lazy(() => import('@pages/restaurant/RestaurantMenuPage'));
const RestaurantSettingsPage = lazy(() => import('@pages/restaurant/RestaurantSettingsPage'));
const RestaurantPaymentPage = lazy(() => import('@pages/restaurant/RestaurantPaymentPage'));

// ============================================
// COMPOSANTS DE ROUTING
// ============================================

// Composant pour bloquer l'accès client aux admin/restaurateur
function ClientRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  if (isAuthenticated && user?.role === 'restaurateur') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Composant pour rediriger après login selon le rôle
function LoginRoute() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'restaurateur') return <Navigate to="/dashboard" replace />;
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  return <LoginPage />;
}

// Page 404
function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__content">
        <h1>404</h1>
        <p>Page non trouvée</p>
        <a href="/" className="not-found-page__btn">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

// Wrapper Suspense réutilisable
const PageLoader = ({ children }) => (
  <Suspense fallback={<LoadingState message="Chargement de la page..." size="lg" />}>
    {children}
  </Suspense>
);

// ============================================
// APP PRINCIPAL
// ============================================

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="app">
      <Routes>
        {/* Routes Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <PageLoader>
                  <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="restaurants" element={<AdminRestaurantsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="profil" element={<ProfilePage />} />
                  </Routes>
                </PageLoader>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Routes Dashboard Restaurateur */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['restaurateur']}>
              <RestaurantLayout>
                <PageLoader>
                  <Routes>
                    <Route index element={<RestaurantDashboardPage />} />
                    <Route path="commandes" element={<RestaurantOrdersPage />} />
                    <Route path="menu" element={<RestaurantMenuPage />} />
                    <Route path="restaurant" element={<RestaurantSettingsPage />} />
                    <Route path="paiement" element={<RestaurantPaymentPage />} />
                    <Route path="profil" element={<ProfilePage />} />
                  </Routes>
                </PageLoader>
              </RestaurantLayout>
            </ProtectedRoute>
          }
        />

        {/* Routes Publiques/Client */}
        <Route
          path="/*"
          element={
            <ClientRoute>
              <Header onCartClick={() => setIsCartOpen(true)} />
              
              <main className="app__main">
                <PageLoader>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/restaurant/:id" element={<RestaurantPage />} />
                    <Route path="/commander" element={<CheckoutPage />} />
                    <Route path="/commande/:id/confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/suivi/:token" element={<OrderTrackingPage />} />
                    <Route path="/devenir-restaurateur" element={<Restaurateur />} />
                    <Route path="/login" element={<LoginRoute />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/profil"
                      element={
                        <ProtectedRoute allowedRoles={['client']}>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mes-commandes"
                      element={
                        <ProtectedRoute allowedRoles={['client']}>
                          <MyOrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </PageLoader>
              </main>

              <Footer />
              <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </ClientRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;