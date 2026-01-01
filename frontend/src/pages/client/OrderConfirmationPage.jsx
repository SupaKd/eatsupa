// src/pages/client/OrderConfirmationPage.jsx - Version corrigée
import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { commandeAPI } from '@services/api';
import { formatPrice, formatDateTime, getOrderStatus } from '@/utils';
import {
  CheckCircle,
  Home,
  Calendar,
  CreditCard,
  Search,
  Copy
} from 'lucide-react';

function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [commande, setCommande] = useState(location.state?.commande || null);
  const [loading, setLoading] = useState(!commande);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!commande && id) {
      fetchCommande();
    }
  }, [id, commande]);

  const fetchCommande = async () => {
    try {
      setLoading(true);
      const response = await commandeAPI.getById(id);
      if (response.data.success) {
        setCommande(response.data.data);
      }
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      setError('Commande non trouvée');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="confirmation-page__loading">
        <div className="confirmation-page__loading-spinner"></div>
        <p>Chargement de votre commande...</p>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="confirmation-page__error">
        <h2>Commande non trouvée</h2>
        <p>Cette commande n'existe pas ou vous n'y avez pas accès.</p>
        <Link to="/" className="confirmation-page__error-btn">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const statusInfo = getOrderStatus(commande.statut);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="confirmation-page">
      <div className="confirmation-page__container">
        {/* Success header */}
        <div className="confirmation-page__header">
          <div className="confirmation-page__success-icon">
            <CheckCircle size={48} strokeWidth={2} />
          </div>
          <h1 className="confirmation-page__title">Commande confirmée !</h1>
          <p className="confirmation-page__subtitle">
            Merci pour votre commande. Vous recevrez bientôt des nouvelles du restaurant.
          </p>
        </div>

        {/* Commande details */}
        <div className="confirmation-card">
          <div className="confirmation-card__header">
            <div>
              <span className="confirmation-card__label">Numéro de commande</span>
              <span className="confirmation-card__order-number">{commande.numero_commande}</span>
            </div>
            <div className={`confirmation-card__status confirmation-card__status--${statusInfo.color}`}>
              <StatusIcon size={16} strokeWidth={2} />
              Commande {statusInfo.label.toLowerCase()}
            </div>
          </div>

          <div className="confirmation-card__info">
            <div className="confirmation-card__info-item">
              <Home size={18} />
              <span>{commande.restaurant_nom}</span>
            </div>
            <div className="confirmation-card__info-item">
              <Calendar size={18} />
              <span>{formatDateTime(commande.date_commande)}</span>
            </div>
            <div className="confirmation-card__info-item">
              <CreditCard size={18} />
              <span>
                {commande.mode_paiement === 'sur_place' ? 'Paiement sur place' : 'Paiement en ligne'}
                {commande.paiement_statut === 'paye' && ' (Payé ✓)'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="confirmation-card__items">
            <h3>Détail de la commande</h3>
            {commande.items?.map((item, index) => (
              <div key={index} className="confirmation-card__item">
                <span className="confirmation-card__item-qty">{item.quantite}x</span>
                <span className="confirmation-card__item-name">{item.nom_plat}</span>
                <span className="confirmation-card__item-price">{formatPrice(item.sous_total)}</span>
              </div>
            ))}
          </div>

          <div className="confirmation-card__total">
            <span>Total</span>
            <span className="confirmation-card__total-amount">{formatPrice(commande.montant_total)}</span>
          </div>
        </div>

        {/* Token de suivi */}
        {location.state?.token && (
          <div className="confirmation-page__tracking">
            <h3><Search size={20} /> Suivez votre commande</h3>
            <p>Conservez ce lien pour suivre l'état de votre commande :</p>
            <div className="confirmation-page__tracking-link">
              <code>{window.location.origin}/suivi/{location.state.token}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/suivi/${location.state.token}`);
                }}
              >
                <Copy size={16} />
                Copier
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="confirmation-page__actions">
          <Link to="/" className="confirmation-page__btn confirmation-page__btn--secondary">
            Retour à l'accueil
          </Link>
          <Link to="/mes-commandes" className="confirmation-page__btn confirmation-page__btn--primary">
            Voir mes commandes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;