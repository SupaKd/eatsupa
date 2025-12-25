import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  selectCartItems,
  selectCartRestaurant,
  selectCartTotal,
  selectIsCartEmpty,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} from '@store/slices/cartSlice';
import { commandeAPI, paiementAPI } from '@services/api';

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const items = useSelector(selectCartItems);
  const restaurant = useSelector(selectCartRestaurant);
  const total = useSelector(selectCartTotal);
  const isEmpty = useSelector(selectIsCartEmpty);

  const [formData, setFormData] = useState({
    telephone: user?.telephone || '',
    email: user?.email || '',
    notes: '',
    mode_paiement: 'sur_place',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.telephone) {
      setError('Le numéro de téléphone est requis');
      return;
    }

    try {
      setLoading(true);

      // Préparer les items pour l'API
      const commandeItems = items.map(item => ({
        plat_id: item.id,
        quantite: item.quantite,
      }));

      // Créer la commande
      const response = await commandeAPI.create({
        restaurant_id: restaurant.id,
        items: commandeItems,
        telephone_client: formData.telephone,
        email_client: formData.email || undefined,
        notes: formData.notes || undefined,
        mode_paiement: formData.mode_paiement,
      });

      if (response.data.success) {
        const commande = response.data.data;

        // Si paiement en ligne, rediriger vers la page de paiement
        if (formData.mode_paiement === 'en_ligne' && commande.requires_payment) {
          // Simuler le paiement en mode démo
          try {
            await paiementAPI.simulatePayment(commande.id);
          } catch (payErr) {
            console.error('Erreur paiement:', payErr);
          }
        }

        // Vider le panier
        dispatch(clearCart());

        // Rediriger vers la page de confirmation
        navigate(`/commande/${commande.id}/confirmation`, {
          state: {
            commande,
            token: commande.token_suivi,
          },
        });
      }
    } catch (err) {
      console.error('Erreur création commande:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  // Si panier vide, rediriger
  if (isEmpty) {
    return (
      <div className="checkout-page__empty">
        <div className="checkout-page__empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Ajoutez des plats pour passer commande</p>
        <Link to="/" className="checkout-page__empty-btn">
          Voir les restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__container">
        {/* Header */}
        <div className="checkout-page__header">
          <Link to={`/restaurant/${restaurant.id}`} className="checkout-page__back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour au menu
          </Link>
          <h1 className="checkout-page__title">Finaliser la commande</h1>
        </div>

        <div className="checkout-page__content">
          {/* Formulaire */}
          <div className="checkout-page__form-wrapper">
            <form onSubmit={handleSubmit} className="checkout-form">
              {error && (
                <div className="checkout-form__error">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}

              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Vos coordonnées
                </h3>

                <div className="checkout-form__group">
                  <label htmlFor="telephone">Téléphone *</label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="06 12 34 56 78"
                    required
                  />
                  <span className="checkout-form__hint">
                    Pour vous contacter en cas de besoin
                  </span>
                </div>

                <div className="checkout-form__group">
                  <label htmlFor="email">Email (optionnel)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                  />
                  <span className="checkout-form__hint">
                    Pour recevoir la confirmation de commande
                  </span>
                </div>
              </div>

              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Mode de paiement
                </h3>

                <div className="checkout-form__payment-options">
                  <label className={`checkout-form__payment-option ${formData.mode_paiement === 'sur_place' ? 'checkout-form__payment-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="mode_paiement"
                      value="sur_place"
                      checked={formData.mode_paiement === 'sur_place'}
                      onChange={handleChange}
                    />
                    <div className="checkout-form__payment-content">
                      <span className="checkout-form__payment-icon">💵</span>
                      <div>
                        <span className="checkout-form__payment-label">Paiement sur place</span>
                        <span className="checkout-form__payment-desc">Espèces ou carte à la récupération</span>
                      </div>
                    </div>
                  </label>

                  <label className={`checkout-form__payment-option ${formData.mode_paiement === 'en_ligne' ? 'checkout-form__payment-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="mode_paiement"
                      value="en_ligne"
                      checked={formData.mode_paiement === 'en_ligne'}
                      onChange={handleChange}
                    />
                    <div className="checkout-form__payment-content">
                      <span className="checkout-form__payment-icon">💳</span>
                      <div>
                        <span className="checkout-form__payment-label">Paiement en ligne</span>
                        <span className="checkout-form__payment-desc">Carte bancaire sécurisée</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Instructions spéciales
                </h3>

                <div className="checkout-form__group">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Allergies, préférences de cuisson, instructions particulières..."
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="checkout-form__submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="checkout-form__submit-spinner"></span>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    Confirmer la commande
                    <span className="checkout-form__submit-price">{formatPrice(total)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="checkout-page__summary">
            <div className="checkout-summary">
              <h3 className="checkout-summary__title">
                Récapitulatif
                <span className="checkout-summary__restaurant">{restaurant.name}</span>
              </h3>

              <div className="checkout-summary__items">
                {items.map((item) => (
                  <div key={item.id} className="checkout-summary__item">
                    <div className="checkout-summary__item-info">
                      <span className="checkout-summary__item-qty">{item.quantite}x</span>
                      <span className="checkout-summary__item-name">{item.nom}</span>
                    </div>
                    <div className="checkout-summary__item-actions">
                      <div className="checkout-summary__item-controls">
                        <button onClick={() => dispatch(decrementQuantity(item.id))}>-</button>
                        <span>{item.quantite}</span>
                        <button onClick={() => dispatch(incrementQuantity(item.id))}>+</button>
                      </div>
                      <span className="checkout-summary__item-price">
                        {formatPrice(item.prix * item.quantite)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-summary__total">
                <span>Total</span>
                <span className="checkout-summary__total-amount">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;