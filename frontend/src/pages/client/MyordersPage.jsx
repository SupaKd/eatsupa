import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { commandeAPI } from '@services/api';

function MyOrdersPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const response = await commandeAPI.getAll();
      if (response.data.success) {
        setCommandes(response.data.data);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError('Impossible de charger vos commandes');
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  // Filtrer les commandes
  const filteredCommandes = commandes.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['livree', 'recuperee', 'annulee'].includes(c.statut);
    if (filter === 'completed') return ['livree', 'recuperee'].includes(c.statut);
    if (filter === 'cancelled') return c.statut === 'annulee';
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="my-orders-page__auth-required">
        <div className="my-orders-page__auth-required-icon">🔒</div>
        <h2>Connexion requise</h2>
        <p>Connectez-vous pour voir vos commandes</p>
        <Link to="/login" className="my-orders-page__auth-required-btn">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-page__container">
        <div className="my-orders-page__header">
          <h1>Mes commandes</h1>
          <div className="my-orders-page__filters">
            <button
              className={`my-orders-page__filter ${filter === 'all' ? 'my-orders-page__filter--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Toutes
            </button>
            <button
              className={`my-orders-page__filter ${filter === 'active' ? 'my-orders-page__filter--active' : ''}`}
              onClick={() => setFilter('active')}
            >
              En cours
            </button>
            <button
              className={`my-orders-page__filter ${filter === 'completed' ? 'my-orders-page__filter--active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Terminées
            </button>
            <button
              className={`my-orders-page__filter ${filter === 'cancelled' ? 'my-orders-page__filter--active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Annulées
            </button>
          </div>
        </div>

        {loading ? (
          <div className="my-orders-page__loading">
            <div className="my-orders-page__loading-spinner"></div>
            <p>Chargement de vos commandes...</p>
          </div>
        ) : error ? (
          <div className="my-orders-page__error">
            <p>{error}</p>
            <button onClick={fetchCommandes}>Réessayer</button>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="my-orders-page__empty">
            <div className="my-orders-page__empty-icon">📦</div>
            <h3>Aucune commande</h3>
            <p>
              {filter === 'all'
                ? "Vous n'avez pas encore passé de commande"
                : 'Aucune commande dans cette catégorie'}
            </p>
            <Link to="/" className="my-orders-page__empty-btn">
              Découvrir les restaurants
            </Link>
          </div>
        ) : (
          <div className="my-orders-page__list">
            {filteredCommandes.map((commande) => {
              const statusInfo = getStatusInfo(commande.statut);
              return (
                <Link
                  key={commande.id}
                  to={`/commande/${commande.id}/confirmation`}
                  className="order-card"
                >
                  <div className="order-card__header">
                    <div>
                      <span className="order-card__number">{commande.numero_commande}</span>
                      <span className="order-card__date">{formatDate(commande.date_commande)}</span>
                    </div>
                    <div className={`order-card__status order-card__status--${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                  </div>

                  <div className="order-card__restaurant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    {commande.restaurant_nom}
                  </div>

                  <div className="order-card__items">
                    {commande.items && commande.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="order-card__item">
                        {item.quantite}x {item.nom_plat}
                      </span>
                    ))}
                    {commande.items && commande.items.length > 3 && (
                      <span className="order-card__more">
                        +{commande.items.length - 3} autre(s)
                      </span>
                    )}
                  </div>

                  <div className="order-card__footer">
                    <span className="order-card__total">
                      {formatPrice(commande.montant_total)}
                    </span>
                    <span className="order-card__view">
                      Voir détails
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;