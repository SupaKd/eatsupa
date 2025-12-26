import { useState, useEffect } from 'react';
import { restaurantAPI, paiementAPI } from '@services/api';

function RestaurantPaymentPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    paiement_sur_place: true,
    paiement_en_ligne: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantAPI.getMyRestaurant();
      if (response.data.success && response.data.data.restaurant) {
        const resto = response.data.data.restaurant;
        setRestaurant(resto);

        setFormData({
          paiement_sur_place: resto.paiement_sur_place ?? true,
          paiement_en_ligne: resto.paiement_en_ligne ?? false,
        });

        // Charger les paramètres de paiement
        try {
          const paymentResponse = await paiementAPI.getSettings(resto.id);
          if (paymentResponse.data.success) {
            setSettings(paymentResponse.data.data);
          }
        } catch (payErr) {
          console.log('Pas de paramètres de paiement:', payErr);
        }
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

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await paiementAPI.updateSettings(restaurant.id, formData);
      setSuccess('Paramètres de paiement enregistrés');
      await fetchData();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setSaving(true);
      const response = await paiementAPI.createStripeAccount(restaurant.id);
      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      console.error('Erreur connexion Stripe:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion à Stripe');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const response = await paiementAPI.getStripeDashboard(restaurant.id);
      if (response.data.success && response.data.data.url) {
        window.open(response.data.data.url, '_blank');
      }
    } catch (err) {
      console.error('Erreur dashboard Stripe:', err);
      setError('Impossible d\'ouvrir le tableau de bord Stripe');
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

      {/* Messages */}
      {error && error !== 'no_restaurant' && (
        <div className="payment-page__message payment-page__message--error">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="payment-page__message payment-page__message--success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}

      <div className="payment-page__content">
        {/* Modes de paiement */}
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="payment-form__section">
            <h2>Modes de paiement acceptés</h2>
            <p className="payment-form__section-desc">
              Choisissez comment vos clients peuvent payer leurs commandes
            </p>

            <div className="payment-options">
              {/* Paiement sur place */}
              <div className={`payment-option ${formData.paiement_sur_place ? 'payment-option--active' : ''}`}>
                <div className="payment-option__icon">💵</div>
                <div className="payment-option__content">
                  <div className="payment-option__header">
                    <h3>Paiement sur place</h3>
                    <label className="payment-option__toggle">
                      <input
                        type="checkbox"
                        name="paiement_sur_place"
                        checked={formData.paiement_sur_place}
                        onChange={handleChange}
                      />
                      <span className="payment-option__toggle-slider"></span>
                    </label>
                  </div>
                  <p className="payment-option__desc">
                    Les clients paient en espèces ou par carte bancaire lors de la récupération de leur commande.
                  </p>
                  <div className="payment-option__badges">
                    <span className="payment-option__badge">Espèces</span>
                    <span className="payment-option__badge">CB</span>
                    <span className="payment-option__badge">Sans contact</span>
                  </div>
                </div>
              </div>

              {/* Paiement en ligne */}
              <div className={`payment-option ${formData.paiement_en_ligne ? 'payment-option--active' : ''}`}>
                <div className="payment-option__icon">💳</div>
                <div className="payment-option__content">
                  <div className="payment-option__header">
                    <h3>Paiement en ligne</h3>
                    <label className="payment-option__toggle">
                      <input
                        type="checkbox"
                        name="paiement_en_ligne"
                        checked={formData.paiement_en_ligne}
                        onChange={handleChange}
                      />
                      <span className="payment-option__toggle-slider"></span>
                    </label>
                  </div>
                  <p className="payment-option__desc">
                    Les clients paient par carte bancaire au moment de la commande via Stripe.
                  </p>
                  <div className="payment-option__badges">
                    <span className="payment-option__badge">Visa</span>
                    <span className="payment-option__badge">Mastercard</span>
                    <span className="payment-option__badge">Apple Pay</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-form__actions">
              <button type="submit" className="payment-form__submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </button>
            </div>
          </div>
        </form>

        {/* Configuration Stripe */}
        {formData.paiement_en_ligne && (
          <div className="stripe-section">
            <h2>Configuration Stripe</h2>
            <p className="stripe-section__desc">
              Pour accepter les paiements en ligne, vous devez connecter votre compte Stripe.
            </p>

            {settings?.stripe_configure ? (
              <div className="stripe-status stripe-status--connected">
                <div className="stripe-status__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="stripe-status__content">
                  <h3>Compte Stripe connecté</h3>
                  <p>Votre compte Stripe est configuré et prêt à recevoir des paiements.</p>
                </div>
                <button 
                  className="stripe-status__btn"
                  onClick={handleOpenStripeDashboard}
                >
                  Ouvrir le tableau de bord Stripe
                </button>
              </div>
            ) : (
              <div className="stripe-status stripe-status--disconnected">
                <div className="stripe-status__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="stripe-status__content">
                  <h3>Compte Stripe non connecté</h3>
                  <p>Connectez votre compte Stripe pour commencer à accepter les paiements en ligne.</p>
                </div>
                <button 
                  className="stripe-status__btn stripe-status__btn--primary"
                  onClick={handleConnectStripe}
                  disabled={saving}
                >
                  {saving ? 'Connexion...' : 'Connecter avec Stripe'}
                </button>
              </div>
            )}

            <div className="stripe-info">
              <h4>Pourquoi Stripe ?</h4>
              <ul>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Paiements sécurisés et cryptés
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Virements automatiques sur votre compte
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tableau de bord pour suivre vos revenus
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Support Apple Pay et Google Pay
                </li>
              </ul>
              <p className="stripe-info__fees">
                <strong>Frais:</strong> 1.4% + 0.25€ par transaction (cartes européennes)
              </p>
            </div>
          </div>
        )}

        {/* Résumé */}
        <div className="payment-summary">
          <h2>Récapitulatif</h2>
          <div className="payment-summary__items">
            <div className="payment-summary__item">
              <span className="payment-summary__label">Paiement sur place</span>
              <span className={`payment-summary__value ${formData.paiement_sur_place ? 'payment-summary__value--active' : ''}`}>
                {formData.paiement_sur_place ? '✓ Activé' : '✗ Désactivé'}
              </span>
            </div>
            <div className="payment-summary__item">
              <span className="payment-summary__label">Paiement en ligne</span>
              <span className={`payment-summary__value ${formData.paiement_en_ligne && settings?.stripe_configure ? 'payment-summary__value--active' : ''}`}>
                {formData.paiement_en_ligne 
                  ? settings?.stripe_configure 
                    ? '✓ Activé et configuré'
                    : '⚠️ Activé mais Stripe non connecté'
                  : '✗ Désactivé'
                }
              </span>
            </div>
          </div>

          {!formData.paiement_sur_place && !formData.paiement_en_ligne && (
            <div className="payment-summary__warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Attention : vous devez activer au moins un mode de paiement pour recevoir des commandes.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantPaymentPage;