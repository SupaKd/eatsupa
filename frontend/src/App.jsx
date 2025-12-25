import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/main.scss';

// Layouts
import AdminLayout from '@components/AdminLayout';

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

// Protection des routes
import ProtectedRoute from '@components/ProtectedRoute';

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
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Routes Publiques - Avec Header/Footer */}
        <Route
          path="/*"
          element={
            <>
              <Header onCartClick={openCart} />
              
              <main className="app__main">
                <Routes>
                  {/* Pages publiques */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurant/:id" element={<RestaurantPage />} />
                  <Route path="/commander" element={<CheckoutPage />} />
                  <Route path="/commande/:id/confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/suivi/:token" element={<OrderTrackingPage />} />
                  
                  {/* Authentification */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Pages utilisateur protégées */}
                  <Route
                    path="/profil"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'restaurateur', 'admin']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mes-commandes"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'admin']}>
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
            </>
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