import { useState, useEffect } from 'react';
import { restaurantAPI } from '@services/api';

function RestaurantPaymentPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantAPI.getMyRestaurant();
      if (response.data.success && response.data.data.restaurant) {
        setRestaurant(response.data.data.restaurant);
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
      if (err.response?.data?.code === 'NO_RESTAURANT') {
        setError('no_restaurant');
      } else {
        setError('Impossible de charger les informations');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page__loading">
        <div className="payment-page__loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error === 'no_restaurant') {
    return (
      <div className="payment-page__no-restaurant">
        <div className="payment-page__no-restaurant-icon">💳</div>
        <h2>Créez d'abord votre restaurant</h2>
        <p>Vous devez créer votre restaurant avant de configurer les paiements.</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-page__header">
        <h1>Configuration des paiements</h1>
        <p>Gérez les modes de paiement acceptés par votre restaurant</p>
      </div>

      <div className="payment-page__content">
        {/* Mode de paiement actif */}
        <div className="payment-form">
          <div className="payment-form__section">
            <h2>Mode de paiement actif</h2>
            <p className="payment-form__section-desc">
              Voici le mode de paiement actuellement disponible pour vos clients
            </p>

            <div className="payment-options">
              {/* Paiement sur place */}
              <div className="payment-option payment-option--active">
                <div className="payment-option__icon">💵</div>
                <div className="payment-option__content">
                  <div className="payment-option__header">
                    <h3>Paiement sur place</h3>
                    <span className="payment-option__status payment-option__status--active">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Activé
                    </span>
                  </div>
                  <p className="payment-option__desc">
                    Les clients paient en espèces ou par carte bancaire lors de la récupération ou livraison de leur commande.
                  </p>
                  <div className="payment-option__badges">
                    <span className="payment-option__badge">Espèces</span>
                    <span className="payment-option__badge">CB</span>
                    <span className="payment-option__badge">Sans contact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paiement en ligne - Bientôt disponible */}
          <div className="payment-form__section">
            <div className="payment-coming-soon">
              <div className="payment-coming-soon__header">
                <div className="payment-coming-soon__icon">💳</div>
                <div className="payment-coming-soon__badge">Bientôt disponible</div>
              </div>
              <h3>Paiement en ligne</h3>
              <p>
                Le paiement en ligne par carte bancaire sera bientôt disponible. 
                Vos clients pourront payer directement lors de la commande via une solution sécurisée.
              </p>
              <div className="payment-coming-soon__features">
                <div className="payment-coming-soon__feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Paiements sécurisés et cryptés</span>
                </div>
                <div className="payment-coming-soon__feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <span>Visa, Mastercard, Apple Pay</span>
                </div>
                <div className="payment-coming-soon__feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>Virements automatiques sur votre compte</span>
                </div>
                <div className="payment-coming-soon__feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  <span>Tableau de bord pour suivre vos revenus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="payment-summary">
          <h2>Récapitulatif</h2>
          <div className="payment-summary__items">
            <div className="payment-summary__item">
              <span className="payment-summary__label">Paiement sur place</span>
              <span className="payment-summary__value payment-summary__value--active">
                ✓ Activé
              </span>
            </div>
            <div className="payment-summary__item">
              <span className="payment-summary__label">Paiement en ligne</span>
              <span className="payment-summary__value payment-summary__value--coming">
                🔜 Bientôt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantPaymentPage;