import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/main.scss';

// Layout
import Header from '@components/Header';
import Footer from '@components/Footer';
import CartSidebar from '@components/CartSidebar';

// Pages publiques
import HomePage from '@pages/HomePage';
import RestaurantPage from '@pages/RestaurantPage';
import CheckoutPage from '@pages/CheckoutPage';
import OrderConfirmationPage from '@pages/OrderConfirmationPage';
import OrderTrackingPage from '@pages/OrderTrackingPage';

// Auth
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';

// Pages utilisateur
import MyOrdersPage from '@pages/MyOrdersPage';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <div className="app">
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
          
          {/* Pages utilisateur */}
          <Route path="/mes-commandes" element={<MyOrdersPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
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