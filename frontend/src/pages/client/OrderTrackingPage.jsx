import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { commandeAPI } from '@services/api';
import {
  ArrowLeft,
  RefreshCw,
  Check,
  Home,
  Phone,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChefHat,
  Search,
  PartyPopper,
  Wallet,
  CreditCard
} from 'lucide-react';

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
      // CORRECTION: Utiliser trackByToken au lieu de getByToken
      const response = await commandeAPI.trackByToken(token);
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
        icon: <Clock size={32} />,
        step: 1,
        message: 'Votre commande a été reçue et attend la confirmation du restaurant.'
      },
      confirmee: { 
        label: 'Confirmée', 
        color: 'blue', 
        icon: <CheckCircle size={32} />,
        step: 2,
        message: 'Le restaurant a confirmé votre commande. La préparation va bientôt commencer.'
      },
      en_preparation: { 
        label: 'En préparation', 
        color: 'orange', 
        icon: <ChefHat size={32} />,
        step: 3,
        message: 'Votre commande est en cours de préparation par le chef.'
      },
      prete: { 
        label: 'Prête !', 
        color: 'green', 
        icon: <CheckCircle size={32} />,
        step: 4,
        message: 'Votre commande est prête ! Vous pouvez venir la récupérer.'
      },
      recuperee: { 
        label: 'Récupérée', 
        color: 'green', 
        icon: <PartyPopper size={32} />,
        step: 5,
        message: 'Merci pour votre commande. Bon appétit !'
      },
      annulee: { 
        label: 'Annulée', 
        color: 'red', 
        icon: <XCircle size={32} />,
        step: 0,
        message: 'Cette commande a été annulée.'
      },
    };
    return statusMap[status] || { label: status, color: 'gray', icon: <AlertCircle size={32} />, step: 0, message: '' };
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
        <div className="tracking-page__error-icon">
          <Search size={64} strokeWidth={1.5} />
        </div>
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
            <ArrowLeft size={20} />
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
                <RefreshCw size={20} />
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
                      <Check size={14} strokeWidth={3} />
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
            <Home size={18} />
            Restaurant
          </h3>
          <p className="tracking-card__restaurant-name">{commande.restaurant_nom}</p>
          {commande.restaurant_adresse && (
            <p className="tracking-card__restaurant-address">{commande.restaurant_adresse}</p>
          )}
          {commande.restaurant_telephone && (
            <a href={`tel:${commande.restaurant_telephone}`} className="tracking-card__phone">
              <Phone size={16} />
              Appeler le restaurant
            </a>
          )}
        </div>

        {/* Détails commande */}
        <div className="tracking-card">
          <h3>
            <ShoppingBag size={18} />
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
              <span>
                <Wallet size={16} /> Paiement sur place
              </span>
            ) : (
              <span>
                <CreditCard size={16} /> Paiement en ligne {commande.paiement_statut === 'paye' && '(Payé ✓)'}
              </span>
            )}
          </div>
        </div>

        {/* Message si prête */}
        {commande.statut === 'prete' && (
          <div className="tracking-page__ready-alert">
            <span className="tracking-page__ready-alert-icon">
              <PartyPopper size={28} />
            </span>
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