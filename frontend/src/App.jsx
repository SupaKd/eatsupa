import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './styles/main.scss';

// Layouts
import AdminLayout from '@components/AdminLayout';
import RestaurantLayout from '@components/RestaurantLayout';

// Pages publiques
import Header from '@components/Header';
import Footer from '@components/Footer';
import CartSidebar from '@components/client/CartSidebar';
import HomePage from '@pages/client/HomePage';
import RestaurantPage from '@pages/client/RestaurantPage';
import CheckoutPage from '@pages/client/CheckoutPage';
import OrderConfirmationPage from '@pages/client/OrderConfirmationPage';
import OrderTrackingPage from '@pages/client/OrderTrackingPage';
import LoginPage from '@pages/client/LoginPage';
import RegisterPage from '@pages/client/RegisterPage';
import MyOrdersPage from '@pages/client/MyOrdersPage';
import ProfilePage from '@pages/ProfilePage';

// Pages Admin
import AdminDashboardPage from '@pages/admin/AdminDashboardPage';
import AdminUsersPage from '@pages/admin/AdminUsersPage';
import AdminRestaurantsPage from '@pages/admin/AdminRestaurantsPage';
import AdminOrdersPage from '@pages/admin/AdminOrdersPage';

// Pages Restaurateur
import RestaurantDashboardPage from '@pages/restaurant/RestaurantDashboardPage';
import RestaurantOrdersPage from '@pages/restaurant/RestaurantOrdersPage';
import RestaurantMenuPage from '@pages/restaurant/RestaurantMenuPage';
import RestaurantSettingsPage from '@pages/restaurant/RestaurantSettingsPage';
import RestaurantPaymentPage from '@pages/restaurant/RestaurantPaymentPage';

// Protection des routes
import ProtectedRoute from '@components/ProtectedRoute';

// Composant pour bloquer l'accès client aux admin/restaurateur
function ClientRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Si l'utilisateur est admin, rediriger vers /admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Si l'utilisateur est restaurateur, rediriger vers /dashboard
  if (isAuthenticated && user?.role === 'restaurateur') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Composant pour rediriger après login selon le rôle
function LoginRoute() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Si déjà connecté, rediriger selon le rôle
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'restaurateur') {
      return <Navigate to="/dashboard" replace />;
    }
    // Client : rediriger vers la page demandée ou l'accueil
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  return <LoginPage />;
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <div className="app">
      <Routes>
        {/* Routes Admin - Sans Header/Footer, avec AdminLayout */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="restaurants" element={<AdminRestaurantsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="profil" element={<ProfilePage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Routes Dashboard Restaurateur - Sans Header/Footer, avec RestaurantLayout */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['restaurateur']}>
              <RestaurantLayout>
                <Routes>
                  <Route index element={<RestaurantDashboardPage />} />
                  <Route path="commandes" element={<RestaurantOrdersPage />} />
                  <Route path="menu" element={<RestaurantMenuPage />} />
                  <Route path="restaurant" element={<RestaurantSettingsPage />} />
                  <Route path="paiement" element={<RestaurantPaymentPage />} />
                  <Route path="profil" element={<ProfilePage />} />
                </Routes>
              </RestaurantLayout>
            </ProtectedRoute>
          }
        />

        {/* Routes Publiques/Client - Avec Header/Footer */}
        <Route
          path="/*"
          element={
            <ClientRoute>
              <Header onCartClick={openCart} />
              
              <main className="app__main">
                <Routes>
                  {/* Pages publiques */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurant/:id" element={<RestaurantPage />} />
                  <Route path="/commander" element={<CheckoutPage />} />
                  <Route path="/commande/:id/confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/suivi/:token" element={<OrderTrackingPage />} />
                  
                  {/* Authentification avec redirection automatique */}
                  <Route path="/login" element={<LoginRoute />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Pages utilisateur protégées - Client uniquement */}
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
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />
              
              <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
            </ClientRoute>
          }
        />
      </Routes>
    </div>
  );
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

export default App;