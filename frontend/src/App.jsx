// src/App.jsx
// Version mise à jour - Utilise uniquement Redux (plus de Context API)

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
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminServiceHours = lazy(() => import('./pages/admin/AdminServiceHours'));

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
      {/* ✅ Plus besoin de Provider ici - il est dans main.jsx */}
      {/* ✅ Plus besoin de AuthProvider - remplacé par Redux */}
      {/* ✅ Plus besoin de ServiceStatusProvider - remplacé par Redux */}
      
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
                {/* Routes Client */}
                <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
                <Route path="/cart" element={<><Navbar /><Cart /><Footer /></>} />
                <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />
                <Route path="/checkout/success" element={<><Navbar /><CheckoutSuccess /><Footer /></>} /> 
                <Route path="/cgv" element={<><Navbar /><Cgv /><Footer /></>}/>
                <Route path="/politique" element={<><Navbar /><Politique /><Footer /></>} />
                <Route path="/mention" element={<><Navbar /><Mention /><Footer /></>} />

                {/* Routes Admin (pas de footer ici) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/horaires" element={<ProtectedRoute><AdminServiceHours /></ProtectedRoute>} />

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