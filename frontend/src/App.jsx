// src/App.jsx
// Version corrigée - Utilise uniquement Redux (plus de Context API)

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkSession, selectSessionChecked, selectAuthLoading } from '@/store/slices/authSlice';
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/Toast";

// Client pages - chargement immédiat (pages principales)
import Home from './pages/client/HomePage';
import Checkout from './pages/client/CheckoutPage';

// ✅ LAZY LOADING - Pages client secondaires
const RestaurantPage = lazy(() => import('./pages/client/RestaurantPage'));
const OrderConfirmationPage = lazy(() => import('./pages/client/OrderConfirmationPage'));
const OrderTrackingPage = lazy(() => import('./pages/client/OrderTrackingPage'));
const MyOrdersPage = lazy(() => import('./pages/client/MyOrdersPage'));
const LoginPage = lazy(() => import('./pages/client/LoginPage'));
const RegisterPage = lazy(() => import('./pages/client/RegisterPage'));
const Restaurateur = lazy(() => import('./pages/client/Restaurateur'));
const Cgv = lazy(() => import('./pages/client/Cgv'));
const Politique = lazy(() => import('./pages/client/Politique'));
const Mention = lazy(() => import('./pages/client/Mention'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ✅ LAZY LOADING - Admin pages (code splitting)
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminRestaurants = lazy(() => import('./pages/admin/AdminRestaurantsPage'));

// ✅ LAZY LOADING - Restaurant dashboard pages
const RestaurantDashboardPage = lazy(() => import('./pages/restaurant/RestaurantDashboardPage'));
const RestaurantMenuPage = lazy(() => import('./pages/restaurant/RestaurantMenuPage'));
const RestaurantOrdersPage = lazy(() => import('./pages/restaurant/RestaurantOrdersPage'));
const RestaurantSettingsPage = lazy(() => import('./pages/restaurant/RestaurantSettingsPage'));
const RestaurantPaymentPage = lazy(() => import('./pages/restaurant/RestaurantPaymentPage'));

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import RestaurantLayout from './components/RestaurantLayout';
import AdminLayout from './components/AdminLayout';

// ✅ Composant de fallback pour le lazy loading
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '1.5rem',
    color: '#666'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        marginBottom: '1rem',
        fontSize: '3rem'
      }}>⏳</div>
      <div>Chargement...</div>
    </div>
  </div>
);

// Composant pour initialiser la session au démarrage
function SessionInitializer({ children }) {
  const dispatch = useDispatch();
  const sessionChecked = useSelector(selectSessionChecked);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Vérifier la session au démarrage si pas encore fait
    if (!sessionChecked) {
      dispatch(checkSession());
    }
  }, [dispatch, sessionChecked]);

  // Optionnel: afficher un loader pendant la vérification initiale
  if (!sessionChecked && loading) {
    return <LoadingFallback />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      {/* Toast de react-hot-toast (garde pour compatibilité) */}
      <Toaster position="bottom-right" />
      
      {/* Toast Redux */}
      <ToastContainer />
      
      <Router>
        <SessionInitializer>
          <ScrollToTop />
          <div className="app">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* ========== Routes Client Public ========== */}
                <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
                <Route path="/restaurant/:id" element={<><Navbar /><RestaurantPage /><Footer /></>} />
                <Route path="/commander" element={<><Navbar /><Checkout /><Footer /></>} />
                <Route path="/commande/:id/confirmation" element={<><Navbar /><OrderConfirmationPage /><Footer /></>} />
                <Route path="/suivi/:token" element={<><Navbar /><OrderTrackingPage /><Footer /></>} />
                
                {/* Auth */}
                <Route path="/login" element={<><Navbar /><LoginPage /><Footer /></>} />
                <Route path="/register" element={<><Navbar /><RegisterPage /><Footer /></>} />
                
                {/* Pages client authentifié */}
                <Route path="/mes-commandes" element={<><Navbar /><MyOrdersPage /><Footer /></>} />
                <Route path="/profil" element={<ProtectedRoute><><Navbar /><ProfilePage /><Footer /></></ProtectedRoute>} />
                
                {/* Pages info */}
                <Route path="/devenir-restaurateur" element={<><Navbar /><Restaurateur /><Footer /></>} />
                <Route path="/cgv" element={<><Navbar /><Cgv /><Footer /></>} />
                <Route path="/politique" element={<><Navbar /><Politique /><Footer /></>} />
                <Route path="/mention" element={<><Navbar /><Mention /><Footer /></>} />
                <Route path="/mentions-legales" element={<><Navbar /><Mention /><Footer /></>} />
                <Route path="/confidentialite" element={<><Navbar /><Politique /><Footer /></>} />

                {/* ========== Routes Restaurant Dashboard ========== */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['restaurateur', 'admin']}>
                    <RestaurantLayout><RestaurantDashboardPage /></RestaurantLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/commandes" element={
                  <ProtectedRoute allowedRoles={['restaurateur', 'admin']}>
                    <RestaurantLayout><RestaurantOrdersPage /></RestaurantLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/menu" element={
                  <ProtectedRoute allowedRoles={['restaurateur', 'admin']}>
                    <RestaurantLayout><RestaurantMenuPage /></RestaurantLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/restaurant" element={
                  <ProtectedRoute allowedRoles={['restaurateur', 'admin']}>
                    <RestaurantLayout><RestaurantSettingsPage /></RestaurantLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/paiement" element={
                  <ProtectedRoute allowedRoles={['restaurateur', 'admin']}>
                    <RestaurantLayout><RestaurantPaymentPage /></RestaurantLayout>
                  </ProtectedRoute>
                } />

                {/* ========== Routes Admin ========== */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminDashboard /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminOrders /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminUsers /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/restaurants" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminRestaurants /></AdminLayout>
                  </ProtectedRoute>
                } />

                {/* 404 - Doit être en dernier */}
                <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />
              </Routes>
            </Suspense>
          </div>
        </SessionInitializer>
      </Router>
    </ErrorBoundary>
  );
}

export default App;