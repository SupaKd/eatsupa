import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI, commandeAPI } from '@services/api';

function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données du restaurant avec stats
      const restaurantResponse = await restaurantAPI.getMyRestaurant();
      
      if (restaurantResponse.data.success) {
        const data = restaurantResponse.data.data;
        setRestaurant(data.restaurant);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      if (err.response?.data?.code === 'NO_RESTAURANT') {
        setError('no_restaurant');
      } else {
        setError('Impossible de charger les données');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="dashboard-page__loading">
        <div className="dashboard-page__loading-spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error === 'no_restaurant') {
    return (
      <div className="dashboard-page__no-restaurant">
        <div className="dashboard-page__no-restaurant-icon">🏪</div>
        <h2>Créez votre restaurant</h2>
        <p>Vous n'avez pas encore de restaurant. Commencez par créer votre établissement pour recevoir des commandes.</p>
        <Link to="/dashboard/restaurant" className="dashboard-page__no-restaurant-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Créer mon restaurant
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page__error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard">
      {/* Header */}
      <div className="restaurant-dashboard__header">
        <div>
          <h1 className="restaurant-dashboard__title">Tableau de bord</h1>
          <p className="restaurant-dashboard__subtitle">
            {restaurant?.nom}
          </p>
        </div>
        <div className="restaurant-dashboard__header-actions">
          <Link to={`/restaurant/${restaurant?.id}`} className="restaurant-dashboard__view-btn" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Voir ma page
          </Link>
          <button onClick={fetchDashboardData} className="restaurant-dashboard__refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {/* Statut du restaurant */}
      <div className={`restaurant-status ${restaurant?.est_ouvert ? 'restaurant-status--open' : 'restaurant-status--closed'}`}>
        <div className="restaurant-status__icon">
          {restaurant?.est_ouvert ? '🟢' : '🔴'}
        </div>
        <div className="restaurant-status__info">
          <h3>
            {restaurant?.est_ouvert ? 'Votre restaurant est ouvert' : 'Votre restaurant est fermé'}
          </h3>
          <p>
            {restaurant?.est_ouvert 
              ? `Fermeture prévue à ${restaurant.heure_fermeture}`
              : restaurant?.prochaine_ouverture 
                ? `Prochaine ouverture: ${restaurant.prochaine_ouverture.jourCapitalized} à ${restaurant.prochaine_ouverture.heure}`
                : 'Configurez vos horaires d\'ouverture'
            }
          </p>
        </div>
        <Link to="/dashboard/restaurant" className="restaurant-status__action">
          Gérer les horaires
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats-grid">
        {/* Commandes en attente */}
        <div className="dashboard-stat-card dashboard-stat-card--yellow">
          <div className="dashboard-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="dashboard-stat-card__content">
            <p className="dashboard-stat-card__label">En attente</p>
            <h3 className="dashboard-stat-card__value">{stats?.commandes_en_attente || 0}</h3>
            <Link to="/dashboard/commandes?statut=en_attente" className="dashboard-stat-card__link">
              Voir les commandes →
            </Link>
          </div>
        </div>

        {/* Commandes en préparation */}
        <div className="dashboard-stat-card dashboard-stat-card--orange">
          <div className="dashboard-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="dashboard-stat-card__content">
            <p className="dashboard-stat-card__label">En préparation</p>
            <h3 className="dashboard-stat-card__value">{stats?.commandes_en_preparation || 0}</h3>
            <Link to="/dashboard/commandes?statut=en_preparation" className="dashboard-stat-card__link">
              Voir les commandes →
            </Link>
          </div>
        </div>

        {/* Total commandes */}
        <div className="dashboard-stat-card dashboard-stat-card--blue">
          <div className="dashboard-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="dashboard-stat-card__content">
            <p className="dashboard-stat-card__label">Commandes totales</p>
            <h3 className="dashboard-stat-card__value">{stats?.total_commandes || 0}</h3>
            <Link to="/dashboard/commandes" className="dashboard-stat-card__link">
              Historique →
            </Link>
          </div>
        </div>

        {/* CA du jour */}
        <div className="dashboard-stat-card dashboard-stat-card--green">
          <div className="dashboard-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="dashboard-stat-card__content">
            <p className="dashboard-stat-card__label">CA aujourd'hui</p>
            <h3 className="dashboard-stat-card__value">{formatPrice(stats?.ca_jour)}</h3>
            <p className="dashboard-stat-card__details">
              Semaine: {formatPrice(stats?.ca_semaine)} • Mois: {formatPrice(stats?.ca_mois)}
            </p>
          </div>
        </div>
      </div>

      {/* Section principale */}
      <div className="restaurant-dashboard__content">
        {/* Commandes récentes */}
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Commandes récentes
            </h2>
            <Link to="/dashboard/commandes" className="dashboard-section__link">
              Tout voir →
            </Link>
          </div>

          {!stats?.commandes_recentes || stats.commandes_recentes.length === 0 ? (
            <div className="dashboard-empty">
              <p>Aucune commande récente</p>
            </div>
          ) : (
            <div className="dashboard-orders">
              {stats.commandes_recentes.map((commande) => {
                const statusInfo = getStatusInfo(commande.statut);
                const paymentInfo = getPaymentInfo(commande.paiement_statut);
                
                return (
                  <div key={commande.id} className="dashboard-order">
                    <div className="dashboard-order__header">
                      <code className="dashboard-order__number">{commande.numero_commande}</code>
                      <span className={`dashboard-order__status dashboard-order__status--${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <div className="dashboard-order__details">
                      <span className="dashboard-order__detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {new Date(commande.date_commande).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="dashboard-order__detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        {commande.telephone_client}
                      </span>
                    </div>
                    <div className="dashboard-order__footer">
                      <div className="dashboard-order__payment">
                        <span className={`dashboard-order__payment-badge dashboard-order__payment-badge--${commande.mode_paiement === 'en_ligne' ? 'purple' : 'gray'}`}>
                          {commande.mode_paiement === 'en_ligne' ? '💳' : '💵'} {commande.mode_paiement === 'en_ligne' ? 'En ligne' : 'Sur place'}
                        </span>
                        <span className={`dashboard-order__payment-status dashboard-order__payment-status--${paymentInfo.color}`}>
                          {paymentInfo.label}
                        </span>
                      </div>
                      <span className="dashboard-order__amount">{formatPrice(commande.montant_total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informations restaurant */}
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Informations
            </h2>
            <Link to="/dashboard/restaurant" className="dashboard-section__link">
              Gérer →
            </Link>
          </div>

          <div className="dashboard-info-grid">
            <div className="dashboard-info-item">
              <div className="dashboard-info-item__label">Catégories</div>
              <div className="dashboard-info-item__value">{stats?.nb_categories || 0}</div>
            </div>
            <div className="dashboard-info-item">
              <div className="dashboard-info-item__label">Plats actifs</div>
              <div className="dashboard-info-item__value">{stats?.nb_plats_actifs || 0}</div>
            </div>
            <div className="dashboard-info-item">
              <div className="dashboard-info-item__label">Total plats</div>
              <div className="dashboard-info-item__value">{stats?.nb_plats_total || 0}</div>
            </div>
            <div className="dashboard-info-item">
              <div className="dashboard-info-item__label">CA total</div>
              <div className="dashboard-info-item__value">{formatPrice(stats?.ca_total)}</div>
            </div>
          </div>

          {/* Modes de paiement */}
          <div className="dashboard-payment-info">
            <h3>Modes de paiement acceptés</h3>
            <div className="dashboard-payment-modes">
              {restaurant?.paiement_sur_place && (
                <div className="dashboard-payment-mode dashboard-payment-mode--active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  💵 Paiement sur place
                </div>
              )}
              {restaurant?.paiement_en_ligne && restaurant?.stripe_configure ? (
                <div className="dashboard-payment-mode dashboard-payment-mode--active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  💳 Paiement en ligne
                </div>
              ) : (
                <div className="dashboard-payment-mode dashboard-payment-mode--inactive">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  💳 Paiement en ligne (non configuré)
                </div>
              )}
            </div>
            <Link to="/dashboard/paiement" className="dashboard-payment-info__link">
              Configurer les paiements →
            </Link>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="dashboard-quick-actions">
        <h2>Actions rapides</h2>
        <div className="dashboard-quick-actions__grid">
          <Link to="/dashboard/commandes" className="dashboard-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Gérer les commandes</span>
          </Link>
          <Link to="/dashboard/menu" className="dashboard-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Modifier le menu</span>
          </Link>
          <Link to="/dashboard/restaurant" className="dashboard-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Paramètres du restaurant</span>
          </Link>
          <Link to={`/restaurant/${restaurant?.id}`} className="dashboard-quick-action" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Voir ma page publique</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusInfo(status) {
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
}

function getPaymentInfo(status) {
  const statusMap = {
    en_attente: { label: 'En attente', color: 'yellow' },
    paye: { label: 'Payé', color: 'green' },
    echoue: { label: 'Échoué', color: 'red' },
    rembourse: { label: 'Remboursé', color: 'blue' },
  };
  return statusMap[status] || { label: status, color: 'gray' };
}

export default RestaurantDashboardPage;