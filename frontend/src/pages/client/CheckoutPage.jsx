// src/pages/client/CheckoutPage.jsx - Version optimisée
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
import { commandeAPI, restaurantAPI } from '@services/api';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/utils';  // ✅ Import centralisé
import { 
  ArrowLeft, 
  AlertCircle, 
  Truck, 
  MapPin, 
  User, 
  CreditCard, 
  MessageSquare,
  ShoppingBag,
  Minus,
  Plus,
  AlertTriangle,
  Clock,
  XCircle,
  Package,
  Wallet
} from 'lucide-react';

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
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

  // ❌ SUPPRIMÉ - formatPrice local (maintenant importé de @/utils)
  // const formatPrice = (price) => { ... }

  // Vérifier si le restaurant est ouvert
  useEffect(() => {
    if (restaurantDetails && !restaurantDetails.est_ouvert) {
      setError('Ce restaurant est actuellement fermé. Vous ne pouvez pas passer commande.');
    } else if (restaurantDetails && restaurantDetails.est_ouvert && error === 'Ce restaurant est actuellement fermé. Vous ne pouvez pas passer commande.') {
      setError(null);
    }
  }, [restaurantDetails, error]);

  // Charger les détails du restaurant
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
        const resto = response.data.data;
        if (resto.livraison_active && !resto.a_emporter_active) {
          setFormData(prev => ({ ...prev, mode_retrait: 'livraison' }));
        }
      }
    } catch (err) {
      console.error('Erreur chargement restaurant:', err);
      toast.error('Impossible de charger les informations du restaurant');
    } finally {
      setLoadingRestaurant(false);
    }
  };

  // Calculs
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

    if (restaurantDetails && !restaurantDetails.est_ouvert) {
      toast.error('Ce restaurant est actuellement fermé');
      return;
    }

    if (!formData.telephone) {
      toast.error('Le numéro de téléphone est requis');
      return;
    }

    if (formData.mode_retrait === 'livraison') {
      if (!formData.adresse_livraison) {
        toast.error('L\'adresse de livraison est requise');
        return;
      }
      if (!formData.ville_livraison) {
        toast.error('La ville de livraison est requise');
        return;
      }
      if (estSousMinimum) {
        toast.warning(`Ajoutez encore ${formatPrice(minimumLivraison - cartTotal)} pour la livraison`);
        return;
      }
    }

    try {
      setLoading(true);

      const commandeItems = items.map(item => ({
        plat_id: item.id,
        quantite: item.quantite,
      }));

      const response = await commandeAPI.create({
        restaurant_id: restaurant.id,
        items: commandeItems,
        telephone_client: formData.telephone,
        email_client: formData.email || undefined,
        notes: formData.notes || undefined,
        mode_paiement: 'sur_place',
        mode_retrait: formData.mode_retrait,
        adresse_livraison: formData.mode_retrait === 'livraison' ? formData.adresse_livraison : undefined,
        code_postal_livraison: formData.mode_retrait === 'livraison' ? formData.code_postal_livraison : undefined,
        ville_livraison: formData.mode_retrait === 'livraison' ? formData.ville_livraison : undefined,
        instructions_livraison: formData.mode_retrait === 'livraison' ? formData.instructions_livraison : undefined,
      });

      if (response.data.success) {
        const commande = response.data.data;
        dispatch(clearCart());
        toast.success('Votre commande a été envoyée au restaurant !', {
          title: 'Commande confirmée',
        });
        navigate(`/commande/${commande.id}/confirmation`, {
          state: { commande, token: commande.token_suivi },
        });
      }
    } catch (err) {
      console.error('Erreur création commande:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création de la commande';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Si panier vide
  if (isEmpty) {
    return (
      <div className="checkout-page__empty">
        <div className="checkout-page__empty-icon">
          <ShoppingBag size={64} strokeWidth={1.5} />
        </div>
        <h2>Votre panier est vide</h2>
        <p>Ajoutez des plats pour passer commande</p>
        <Link to="/" className="checkout-page__empty-btn">
          Voir les restaurants
        </Link>
      </div>
    );
  }

  const modesRetrait = restaurantDetails?.modes_retrait || [];
  const livraisonDisponible = modesRetrait.some(m => m.id === 'livraison');
  const aEmporterDisponible = modesRetrait.some(m => m.id === 'a_emporter');
  const isRestaurantClosed = restaurantDetails && !restaurantDetails.est_ouvert;

  return (
    <div className="checkout-page">
      <div className="checkout-page__container">
        {/* Header */}
        <div className="checkout-page__header">
          <Link to={`/restaurant/${restaurant.id}`} className="checkout-page__back">
            <ArrowLeft size={20} />
            Retour au menu
          </Link>
          <h1 className="checkout-page__title">Finaliser la commande</h1>
        </div>

        {/* Alerte restaurant fermé */}
        {isRestaurantClosed && (
          <div className="checkout-page__closed-alert">
            <AlertCircle size={24} />
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
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              {/* Mode de retrait */}
              {!loadingRestaurant && (livraisonDisponible || aEmporterDisponible) && (
                <div className="checkout-form__section">
                  <h3 className="checkout-form__section-title">
                    <Truck size={20} />
                    Mode de retrait
                  </h3>

                  <div className="checkout-form__retrait-options">
                    {aEmporterDisponible && (
                      <label className={`checkout-form__retrait-option ${formData.mode_retrait === 'a_emporter' ? 'checkout-form__retrait-option--selected' : ''}`}>
                        <input
                          type="radio"
                          name="mode_retrait"
                          value="a_emporter"
                          checked={formData.mode_retrait === 'a_emporter'}
                          onChange={() => handleModeRetraitChange('a_emporter')}
                        />
                        <div className="checkout-form__retrait-content">
                          <span className="checkout-form__retrait-icon"><Package size={24} /></span>
                          <div className="checkout-form__retrait-text">
                            <span className="checkout-form__retrait-label">À emporter</span>
                            <span className="checkout-form__retrait-desc">Récupérez votre commande au restaurant</span>
                            <span className="checkout-form__retrait-time">
                              <Clock size={14} /> Prêt en ~{restaurantDetails?.delai_preparation || 30} min
                            </span>
                          </div>
                          <span className="checkout-form__retrait-price">Gratuit</span>
                        </div>
                      </label>
                    )}

                    {livraisonDisponible && (
                      <label className={`checkout-form__retrait-option ${formData.mode_retrait === 'livraison' ? 'checkout-form__retrait-option--selected' : ''}`}>
                        <input
                          type="radio"
                          name="mode_retrait"
                          value="livraison"
                          checked={formData.mode_retrait === 'livraison'}
                          onChange={() => handleModeRetraitChange('livraison')}
                        />
                        <div className="checkout-form__retrait-content">
                          <span className="checkout-form__retrait-icon"><Truck size={24} /></span>
                          <div className="checkout-form__retrait-text">
                            <span className="checkout-form__retrait-label">Livraison</span>
                            <span className="checkout-form__retrait-desc">Livré à votre adresse</span>
                            <span className="checkout-form__retrait-time">
                              <Clock size={14} /> Livré en ~{restaurantDetails?.delai_livraison || 45} min
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

                  {estSousMinimum && (
                    <div className="checkout-form__warning">
                      <AlertTriangle size={20} />
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
                  <h3 className="checkout-form__section-title"><MapPin size={20} />Adresse de livraison</h3>
                  <div className="checkout-form__group">
                    <label htmlFor="adresse_livraison">Adresse *</label>
                    <input type="text" id="adresse_livraison" name="adresse_livraison" value={formData.adresse_livraison} onChange={handleChange} placeholder="12 rue de la Paix" required disabled={isRestaurantClosed} />
                  </div>
                  <div className="checkout-form__row">
                    <div className="checkout-form__group checkout-form__group--small">
                      <label htmlFor="code_postal_livraison">Code postal</label>
                      <input type="text" id="code_postal_livraison" name="code_postal_livraison" value={formData.code_postal_livraison} onChange={handleChange} placeholder="01100" disabled={isRestaurantClosed} />
                    </div>
                    <div className="checkout-form__group">
                      <label htmlFor="ville_livraison">Ville *</label>
                      <input type="text" id="ville_livraison" name="ville_livraison" value={formData.ville_livraison} onChange={handleChange} placeholder="Oyonnax" required disabled={isRestaurantClosed} />
                    </div>
                  </div>
                  <div className="checkout-form__group">
                    <label htmlFor="instructions_livraison">Instructions pour le livreur</label>
                    <textarea id="instructions_livraison" name="instructions_livraison" value={formData.instructions_livraison} onChange={handleChange} placeholder="Code d'entrée, étage, digicode..." rows={2} disabled={isRestaurantClosed} />
                  </div>
                </div>
              )}

              {/* Coordonnées */}
              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title"><User size={20} />Vos coordonnées</h3>
                <div className="checkout-form__group">
                  <label htmlFor="telephone">Téléphone *</label>
                  <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="06 12 34 56 78" required disabled={isRestaurantClosed} />
                  <span className="checkout-form__hint">Pour vous contacter en cas de besoin</span>
                </div>
                <div className="checkout-form__group">
                  <label htmlFor="email">Email (optionnel)</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" disabled={isRestaurantClosed} />
                </div>
              </div>

              {/* Mode de paiement */}
              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title"><CreditCard size={20} />Mode de paiement</h3>
                <div className="checkout-form__payment-options">
                  <label className="checkout-form__payment-option checkout-form__payment-option--selected">
                    <input type="radio" name="mode_paiement" value="sur_place" checked readOnly />
                    <div className="checkout-form__payment-content">
                      <span className="checkout-form__payment-icon"><Wallet size={24} /></span>
                      <div>
                        <span className="checkout-form__payment-label">
                          {formData.mode_retrait === 'livraison' ? 'Paiement à la livraison' : 'Paiement sur place'}
                        </span>
                        <span className="checkout-form__payment-desc">
                          {formData.mode_retrait === 'livraison' ? 'Espèces ou carte à la réception' : 'Espèces ou carte à la récupération'}
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="checkout-form__section">
                <h3 className="checkout-form__section-title"><MessageSquare size={20} />Instructions spéciales</h3>
                <div className="checkout-form__group">
                  <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Allergies, préférences de cuisson..." rows={3} disabled={isRestaurantClosed} />
                </div>
              </div>

              <button type="submit" className="checkout-form__submit" disabled={loading || estSousMinimum || isRestaurantClosed}>
                {loading ? (
                  <><span className="checkout-form__submit-spinner"></span>Traitement en cours...</>
                ) : isRestaurantClosed ? (
                  <><XCircle size={20} />Restaurant fermé</>
                ) : (
                  <>Confirmer la commande<span className="checkout-form__submit-price">{formatPrice(total)}</span></>
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
                        <button onClick={() => dispatch(decrementQuantity(item.id))} disabled={isRestaurantClosed}><Minus size={16} /></button>
                        <span>{item.quantite}</span>
                        <button onClick={() => dispatch(incrementQuantity(item.id))} disabled={isRestaurantClosed}><Plus size={16} /></button>
                      </div>
                      <span className="checkout-summary__item-price">{formatPrice(item.prix * item.quantite)}</span>
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

              <div className="checkout-summary__mode">
                {formData.mode_retrait === 'livraison' ? (
                  <span className="checkout-summary__mode-badge checkout-summary__mode-badge--delivery"><Truck size={16} /> Livraison</span>
                ) : (
                  <span className="checkout-summary__mode-badge checkout-summary__mode-badge--pickup"><Package size={16} /> À emporter</span>
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