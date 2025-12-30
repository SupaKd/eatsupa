import { useState, useEffect } from 'react';
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
import { commandeAPI, paiementAPI, restaurantAPI } from '@services/api';

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const items = useSelector(selectCartItems);
  const restaurant = useSelector(selectCartRestaurant);
  const cartTotal = useSelector(selectCartTotal);
  const isEmpty = useSelector(selectIsCartEmpty);

  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  const [formData, setFormData] = useState({
    telephone: user?.telephone || '',
    email: user?.email || '',
    notes: '',
    mode_paiement: 'sur_place',
    mode_retrait: 'a_emporter',
    adresse_livraison: '',
    code_postal_livraison: '',
    ville_livraison: '',
    instructions_livraison: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier si le restaurant est ouvert - CORRIGÉ: maintenant dans useEffect
  useEffect(() => {
    if (restaurantDetails && !restaurantDetails.est_ouvert) {
      setError('Ce restaurant est actuellement fermé. Vous ne pouvez pas passer commande.');
    } else if (restaurantDetails && restaurantDetails.est_ouvert && error === 'Ce restaurant est actuellement fermé. Vous ne pouvez pas passer commande.') {
      // Effacer l'erreur si le restaurant est maintenant ouvert
      setError(null);
    }
  }, [restaurantDetails]);

  // Charger les détails du restaurant pour avoir les modes de retrait disponibles
  useEffect(() => {
    if (restaurant?.id) {
      fetchRestaurantDetails();
    }
  }, [restaurant?.id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoadingRestaurant(true);
      const response = await restaurantAPI.getById(restaurant.id);
      if (response.data.success) {
        setRestaurantDetails(response.data.data);
        // Si le restaurant ne fait que la livraison, la sélectionner par défaut
        const resto = response.data.data;
        if (resto.livraison_active && !resto.a_emporter_active) {
          setFormData(prev => ({ ...prev, mode_retrait: 'livraison' }));
        }
      }
    } catch (err) {
      console.error('Erreur chargement restaurant:', err);
    } finally {
      setLoadingRestaurant(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Calculer les frais de livraison et le total
  const fraisLivraison = formData.mode_retrait === 'livraison' 
    ? (parseFloat(restaurantDetails?.frais_livraison) || 0) 
    : 0;
  const total = cartTotal + fraisLivraison;
  const minimumLivraison = parseFloat(restaurantDetails?.minimum_livraison) || 0;
  const estSousMinimum = formData.mode_retrait === 'livraison' && cartTotal < minimumLivraison;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleModeRetraitChange = (mode) => {
    setFormData(prev => ({ ...prev, mode_retrait: mode }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // CORRIGÉ: Validation du restaurant ouvert dans handleSubmit
    if (restaurantDetails && !restaurantDetails.est_ouvert) {
      setError('Ce restaurant est actuellement fermé. Vous ne pouvez pas passer commande.');
      return;
    }

    if (!formData.telephone) {
      setError('Le numéro de téléphone est requis');
      return;
    }

    // Validation pour la livraison
    if (formData.mode_retrait === 'livraison') {
      if (!formData.adresse_livraison) {
        setError('L\'adresse de livraison est requise');
        return;
      }
      if (!formData.ville_livraison) {
        setError('La ville de livraison est requise');
        return;
      }
      if (estSousMinimum) {
        setError(`Le montant minimum pour la livraison est de ${formatPrice(minimumLivraison)}`);
        return;
      }
    }

    try {
      setLoading(true);

      // Préparer les items pour l'API
      const commandeItems = items.map(item => ({
        plat_id: item.id,
        quantite: item.quantite,
      }));

      // Créer la commande (toujours en mode sur_place pour l'instant)
      const response = await commandeAPI.create({
        restaurant_id: restaurant.id,
        items: commandeItems,
        telephone_client: formData.telephone,
        email_client: formData.email || undefined,
        notes: formData.notes || undefined,
        mode_paiement: 'sur_place', // Forcé à sur_place pour l'instant
        mode_retrait: formData.mode_retrait,
        adresse_livraison: formData.mode_retrait === 'livraison' ? formData.adresse_livraison : undefined,
        code_postal_livraison: formData.mode_retrait === 'livraison' ? formData.code_postal_livraison : undefined,
        ville_livraison: formData.mode_retrait === 'livraison' ? formData.ville_livraison : undefined,
        instructions_livraison: formData.mode_retrait === 'livraison' ? formData.instructions_livraison : undefined,
      });

      if (response.data.success) {
        const commande = response.data.data;

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

  // Les modes de retrait disponibles
  const modesRetrait = restaurantDetails?.modes_retrait || [];
  const livraisonDisponible = modesRetrait.some(m => m.id === 'livraison');
  const aEmporterDisponible = modesRetrait.some(m => m.id === 'a_emporter');

  // Vérifier si le restaurant est fermé pour afficher un message d'alerte
  const isRestaurantClosed = restaurantDetails && !restaurantDetails.est_ouvert;

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

        {/* Alerte restaurant fermé */}
        {isRestaurantClosed && (
          <div className="checkout-page__closed-alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <strong>Restaurant fermé</strong>
              <p>
                Ce restaurant est actuellement fermé. 
                {restaurantDetails?.prochaine_ouverture && (
                  <> Prochaine ouverture : {restaurantDetails.prochaine_ouverture.estAujourdHui 
                    ? `aujourd'hui à ${restaurantDetails.prochaine_ouverture.heure}`
                    : restaurantDetails.prochaine_ouverture.estDemain
                    ? `demain à ${restaurantDetails.prochaine_ouverture.heure}`
                    : `${restaurantDetails.prochaine_ouverture.jourCapitalized} à ${restaurantDetails.prochaine_ouverture.heure}`
                  }</>
                )}
              </p>
            </div>
          </div>
        )}

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

              {/* Mode de retrait */}
              {!loadingRestaurant && (livraisonDisponible || aEmporterDisponible) && (
                <div className="checkout-form__section">
                  <h3 className="checkout-form__section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    Mode de retrait
                  </h3>

                  <div className="checkout-form__retrait-options">
                    {aEmporterDisponible && (
                      <label 
                        className={`checkout-form__retrait-option ${formData.mode_retrait === 'a_emporter' ? 'checkout-form__retrait-option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="mode_retrait"
                          value="a_emporter"
                          checked={formData.mode_retrait === 'a_emporter'}
                          onChange={() => handleModeRetraitChange('a_emporter')}
                        />
                        <div className="checkout-form__retrait-content">
                          <span className="checkout-form__retrait-icon">🏃</span>
                          <div className="checkout-form__retrait-text">
                            <span className="checkout-form__retrait-label">À emporter</span>
                            <span className="checkout-form__retrait-desc">
                              Récupérez votre commande au restaurant
                            </span>
                            <span className="checkout-form__retrait-time">
                              ⏱️ Prêt en ~{restaurantDetails?.delai_preparation || 30} min
                            </span>
                          </div>
                          <span className="checkout-form__retrait-price">Gratuit</span>
                        </div>
                      </label>
                    )}

                    {livraisonDisponible && (
                      <label 
                        className={`checkout-form__retrait-option ${formData.mode_retrait === 'livraison' ? 'checkout-form__retrait-option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="mode_retrait"
                          value="livraison"
                          checked={formData.mode_retrait === 'livraison'}
                          onChange={() => handleModeRetraitChange('livraison')}
                        />
                        <div className="checkout-form__retrait-content">
                          <span className="checkout-form__retrait-icon">🚗</span>
                          <div className="checkout-form__retrait-text">
                            <span className="checkout-form__retrait-label">Livraison</span>
                            <span className="checkout-form__retrait-desc">
                              Livré à votre adresse
                            </span>
                            <span className="checkout-form__retrait-time">
                              ⏱️ Livré en ~{restaurantDetails?.delai_livraison || 45} min
                            </span>
                            {minimumLivraison > 0 && (
                              <span className="checkout-form__retrait-minimum">
                                Minimum de commande: {formatPrice(minimumLivraison)}
                              </span>
                            )}
                          </div>
                          <span className="checkout-form__retrait-price">
                            {fraisLivraison > 0 ? `+${formatPrice(fraisLivraison)}` : 'Gratuit'}
                          </span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Alerte si sous le minimum */}
                  {estSousMinimum && (
                    <div className="checkout-form__warning">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <span>
                        Ajoutez encore <strong>{formatPrice(minimumLivraison - cartTotal)}</strong> pour pouvoir commander en livraison
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Adresse de livraison */}
              {formData.mode_retrait === 'livraison' && (
                <div className="checkout-form__section">
                  <h3 className="checkout-form__section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Adresse de livraison
                  </h3>

                  <div className="checkout-form__group">
                    <label htmlFor="adresse_livraison">Adresse *</label>
                    <input
                      type="text"
                      id="adresse_livraison"
                      name="adresse_livraison"
                      value={formData.adresse_livraison}
                      onChange={handleChange}
                      placeholder="12 rue de la Paix"
                      required={formData.mode_retrait === 'livraison'}
                      disabled={isRestaurantClosed}
                    />
                  </div>

                  <div className="checkout-form__row">
                    <div className="checkout-form__group checkout-form__group--small">
                      <label htmlFor="code_postal_livraison">Code postal</label>
                      <input
                        type="text"
                        id="code_postal_livraison"
                        name="code_postal_livraison"
                        value={formData.code_postal_livraison}
                        onChange={handleChange}
                        placeholder="75001"
                        disabled={isRestaurantClosed}
                      />
                    </div>
                    <div className="checkout-form__group">
                      <label htmlFor="ville_livraison">Ville *</label>
                      <input
                        type="text"
                        id="ville_livraison"
                        name="ville_livraison"
                        value={formData.ville_livraison}
                        onChange={handleChange}
                        placeholder="Paris"
                        required={formData.mode_retrait === 'livraison'}
                        disabled={isRestaurantClosed}
                      />
                    </div>
                  </div>

                  <div className="checkout-form__group">
                    <label htmlFor="instructions_livraison">Instructions pour le livreur</label>
                    <textarea
                      id="instructions_livraison"
                      name="instructions_livraison"
                      value={formData.instructions_livraison}
                      onChange={handleChange}
                      placeholder="Code d'entrée, étage, digicode..."
                      rows={2}
                      disabled={isRestaurantClosed}
                    />
                  </div>
                </div>
              )}

              {/* Coordonnées */}
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
                    disabled={isRestaurantClosed}
                  />
                  <span className="checkout-form__hint">Pour vous contacter en cas de besoin</span>
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
                    disabled={isRestaurantClosed}
                  />
                </div>
              </div>

              {/* Mode de paiement */}
              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Mode de paiement
                </h3>

                <div className="checkout-form__payment-options">
                  <label className="checkout-form__payment-option checkout-form__payment-option--selected">
                    <input
                      type="radio"
                      name="mode_paiement"
                      value="sur_place"
                      checked={true}
                      readOnly
                    />
                    <div className="checkout-form__payment-content">
                      <span className="checkout-form__payment-icon">💵</span>
                      <div>
                        <span className="checkout-form__payment-label">
                          {formData.mode_retrait === 'livraison' ? 'Paiement à la livraison' : 'Paiement sur place'}
                        </span>
                        <span className="checkout-form__payment-desc">
                          {formData.mode_retrait === 'livraison' 
                            ? 'Espèces ou carte à la réception' 
                            : 'Espèces ou carte à la récupération'}
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* TODO: Paiement en ligne - À développer ultérieurement */}
                </div>
              </div>

              {/* Notes */}
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
                    placeholder="Allergies, préférences de cuisson..."
                    rows={3}
                    disabled={isRestaurantClosed}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="checkout-form__submit"
                disabled={loading || estSousMinimum || isRestaurantClosed}
              >
                {loading ? (
                  <>
                    <span className="checkout-form__submit-spinner"></span>
                    Traitement en cours...
                  </>
                ) : isRestaurantClosed ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    Restaurant fermé
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
                        <button 
                          onClick={() => dispatch(decrementQuantity(item.id))}
                          disabled={isRestaurantClosed}
                        >
                          -
                        </button>
                        <span>{item.quantite}</span>
                        <button 
                          onClick={() => dispatch(incrementQuantity(item.id))}
                          disabled={isRestaurantClosed}
                        >
                          +
                        </button>
                      </div>
                      <span className="checkout-summary__item-price">
                        {formatPrice(item.prix * item.quantite)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-summary__subtotals">
                <div className="checkout-summary__subtotal">
                  <span>Sous-total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {formData.mode_retrait === 'livraison' && (
                  <div className="checkout-summary__subtotal">
                    <span>Frais de livraison</span>
                    <span>{fraisLivraison > 0 ? formatPrice(fraisLivraison) : 'Gratuit'}</span>
                  </div>
                )}
              </div>

              <div className="checkout-summary__total">
                <span>Total</span>
                <span className="checkout-summary__total-amount">{formatPrice(total)}</span>
              </div>

              {/* Badge mode de retrait */}
              <div className="checkout-summary__mode">
                {formData.mode_retrait === 'livraison' ? (
                  <span className="checkout-summary__mode-badge checkout-summary__mode-badge--delivery">
                    🚗 Livraison
                  </span>
                ) : (
                  <span className="checkout-summary__mode-badge checkout-summary__mode-badge--pickup">
                    🏃 À emporter
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;