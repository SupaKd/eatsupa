import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Check, 
  Lock, 
  DollarSign, 
  Activity,
  Sparkles
} from 'lucide-react';
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
        <div className="payment-page__no-restaurant-icon">
          <CreditCard size={64} />
        </div>
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
                <div className="payment-option__icon">
                  <Banknote size={32} />
                </div>
                <div className="payment-option__content">
                  <div className="payment-option__header">
                    <h3>Paiement sur place</h3>
                    <span className="payment-option__status payment-option__status--active">
                      <Check size={16} />
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
                <div className="payment-coming-soon__icon">
                  <CreditCard size={32} />
                </div>
                <div className="payment-coming-soon__badge">
                  <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Bientôt disponible
                </div>
              </div>
              <h3>Paiement en ligne</h3>
              <p>
                Le paiement en ligne par carte bancaire sera bientôt disponible. 
                Vos clients pourront payer directement lors de la commande via une solution sécurisée.
              </p>
              <div className="payment-coming-soon__features">
                <div className="payment-coming-soon__feature">
                  <Lock size={18} />
                  <span>Paiements sécurisés et cryptés</span>
                </div>
                <div className="payment-coming-soon__feature">
                  <CreditCard size={18} />
                  <span>Visa, Mastercard, Apple Pay</span>
                </div>
                <div className="payment-coming-soon__feature">
                  <DollarSign size={18} />
                  <span>Virements automatiques sur votre compte</span>
                </div>
                <div className="payment-coming-soon__feature">
                  <Activity size={18} />
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
                <Check size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Activé
              </span>
            </div>
            <div className="payment-summary__item">
              <span className="payment-summary__label">Paiement en ligne</span>
              <span className="payment-summary__value payment-summary__value--coming">
                <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Bientôt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantPaymentPage;