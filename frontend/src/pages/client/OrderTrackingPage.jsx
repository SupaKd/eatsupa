import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { commandeAPI } from '@services/api';

function OrderTrackingPage() {
  const { token } = useParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommande();
    // Polling toutes les 30 secondes pour mise à jour en temps réel
    const interval = setInterval(fetchCommande, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchCommande = async () => {
    try {
      const response = await commandeAPI.getByToken(token);
      if (response.data.success) {
        setCommande(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      setError('Commande non trouvée ou lien invalide');
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
      en_attente: { 
        label: 'En attente de confirmation', 
        color: 'yellow', 
        icon: '⏳',
        step: 1,
        message: 'Votre commande a été reçue et attend la confirmation du restaurant.'
      },
      confirmee: { 
        label: 'Confirmée', 
        color: 'blue', 
        icon: '✓',
        step: 2,
        message: 'Le restaurant a confirmé votre commande. La préparation va bientôt commencer.'
      },
      en_preparation: { 
        label: 'En préparation', 
        color: 'orange', 
        icon: '👨‍🍳',
        step: 3,
        message: 'Votre commande est en cours de préparation par le chef.'
      },
      prete: { 
        label: 'Prête !', 
        color: 'green', 
        icon: '✅',
        step: 4,
        message: 'Votre commande est prête ! Vous pouvez venir la récupérer.'
      },
      recuperee: { 
        label: 'Récupérée', 
        color: 'green', 
        icon: '🎉',
        step: 5,
        message: 'Merci pour votre commande. Bon appétit !'
      },
      annulee: { 
        label: 'Annulée', 
        color: 'red', 
        icon: '❌',
        step: 0,
        message: 'Cette commande a été annulée.'
      },
    };
    return statusMap[status] || { label: status, color: 'gray', icon: '?', step: 0, message: '' };
  };

  const steps = [
    { id: 1, label: 'Reçue' },
    { id: 2, label: 'Confirmée' },
    { id: 3, label: 'En préparation' },
    { id: 4, label: 'Prête' },
  ];

  if (loading) {
    return (
      <div className="tracking-page__loading">
        <div className="tracking-page__loading-spinner"></div>
        <p>Chargement de votre commande...</p>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="tracking-page__error">
        <div className="tracking-page__error-icon">🔍</div>
        <h2>Commande non trouvée</h2>
        <p>{error || 'Le lien de suivi est invalide ou a expiré.'}</p>
        <Link to="/" className="tracking-page__error-btn">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(commande.statut);
  const isActive = !['recuperee', 'annulee'].includes(commande.statut);

  return (
    <div className="tracking-page">
      <div className="tracking-page__container">
        {/* Header */}
        <div className="tracking-page__header">
          <Link to="/" className="tracking-page__back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour
          </Link>
          <h1>Suivi de commande</h1>
          <span className="tracking-page__order-number">{commande.numero_commande}</span>
        </div>

        {/* Status actuel */}
        <div className={`tracking-status tracking-status--${statusInfo.color}`}>
          <div className="tracking-status__icon">{statusInfo.icon}</div>
          <div className="tracking-status__info">
            <h2>{statusInfo.label}</h2>
            <p>{statusInfo.message}</p>
          </div>
          {isActive && (
            <div className="tracking-status__refresh">
              <button onClick={fetchCommande} title="Actualiser">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Timeline des étapes */}
        {commande.statut !== 'annulee' && (
          <div className="tracking-timeline">
            {steps.map((step, index) => {
              const isCompleted = statusInfo.step >= step.id;
              const isCurrent = statusInfo.step === step.id;
              return (
                <div
                  key={step.id}
                  className={`tracking-timeline__step ${isCompleted ? 'tracking-timeline__step--completed' : ''} ${isCurrent ? 'tracking-timeline__step--current' : ''}`}
                >
                  <div className="tracking-timeline__dot">
                    {isCompleted && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`tracking-timeline__line ${isCompleted && statusInfo.step > step.id ? 'tracking-timeline__line--completed' : ''}`}></div>
                  )}
                  <span className="tracking-timeline__label">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Infos restaurant */}
        <div className="tracking-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Restaurant
          </h3>
          <p className="tracking-card__restaurant-name">{commande.restaurant_nom}</p>
          {commande.restaurant_adresse && (
            <p className="tracking-card__restaurant-address">{commande.restaurant_adresse}</p>
          )}
          {commande.restaurant_telephone && (
            <a href={`tel:${commande.restaurant_telephone}`} className="tracking-card__phone">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Appeler le restaurant
            </a>
          )}
        </div>

        {/* Détails commande */}
        <div className="tracking-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            Votre commande
          </h3>
          
          <div className="tracking-card__date">
            Commandé le {formatDate(commande.date_commande)}
          </div>

          <div className="tracking-card__items">
            {commande.items && commande.items.map((item, idx) => (
              <div key={idx} className="tracking-card__item">
                <span className="tracking-card__item-qty">{item.quantite}x</span>
                <span className="tracking-card__item-name">{item.nom_plat}</span>
                <span className="tracking-card__item-price">{formatPrice(item.sous_total)}</span>
              </div>
            ))}
          </div>

          <div className="tracking-card__total">
            <span>Total</span>
            <span>{formatPrice(commande.montant_total)}</span>
          </div>

          <div className="tracking-card__payment">
            {commande.mode_paiement === 'sur_place' ? (
              <span>💵 Paiement sur place</span>
            ) : (
              <span>💳 Paiement en ligne {commande.paiement_statut === 'paye' && '(Payé ✓)'}</span>
            )}
          </div>
        </div>

        {/* Message si prête */}
        {commande.statut === 'prete' && (
          <div className="tracking-page__ready-alert">
            <span className="tracking-page__ready-alert-icon">🎉</span>
            <div>
              <strong>Votre commande vous attend !</strong>
              <p>Présentez ce numéro de commande au restaurant : <code>{commande.numero_commande}</code></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTrackingPage;