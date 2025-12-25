import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { commandeAPI } from '@services/api';

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      en_attente: { label: 'En attente', color: 'yellow', icon: '⏳' },
      confirmee: { label: 'Confirmée', color: 'blue', icon: '✓' },
      en_preparation: { label: 'En préparation', color: 'orange', icon: '👨‍🍳' },
      prete: { label: 'Prête', color: 'green', icon: '✅' },
      livree: { label: 'Livrée', color: 'green', icon: '🚗' },
      recuperee: { label: 'Récupérée', color: 'green', icon: '🎉' },
      annulee: { label: 'Annulée', color: 'red', icon: '❌' },
    };
    return statusMap[status] || { label: status, color: 'gray', icon: '?' };
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

  const statusInfo = getStatusInfo(commande.statut);

  return (
    <div className="confirmation-page">
      <div className="confirmation-page__container">
        {/* Success header */}
        <div className="confirmation-page__header">
          <div className="confirmation-page__success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
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
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </div>
          </div>

          <div className="confirmation-card__info">
            <div className="confirmation-card__info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>{commande.restaurant_nom}</span>
            </div>
            <div className="confirmation-card__info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{formatDate(commande.date_commande)}</span>
            </div>
            <div className="confirmation-card__info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>
                {commande.mode_paiement === 'sur_place' ? 'Paiement sur place' : 'Paiement en ligne'}
                {commande.paiement_statut === 'paye' && ' (Payé ✓)'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="confirmation-card__items">
            <h3>Détail de la commande</h3>
            {commande.items && commande.items.map((item, index) => (
              <div key={index} className="confirmation-card__item">
                <span className="confirmation-card__item-qty">{item.quantite}x</span>
                <span className="confirmation-card__item-name">{item.nom_plat}</span>
                <span className="confirmation-card__item-price">
                  {formatPrice(item.sous_total)}
                </span>
              </div>
            ))}
          </div>

          <div className="confirmation-card__total">
            <span>Total</span>
            <span className="confirmation-card__total-amount">
              {formatPrice(commande.montant_total)}
            </span>
          </div>
        </div>

        {/* Token de suivi */}
        {location.state?.token && (
          <div className="confirmation-page__tracking">
            <h3>🔍 Suivez votre commande</h3>
            <p>
              Conservez ce lien pour suivre l'état de votre commande :
            </p>
            <div className="confirmation-page__tracking-link">
              <code>{window.location.origin}/suivi/{location.state.token}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/suivi/${location.state.token}`);
                }}
              >
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