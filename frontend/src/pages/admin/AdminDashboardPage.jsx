import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { adminAPI } from '@services/api';
import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboard();
      console.log('Dashboard response:', response.data);
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError(err.response?.data?.message || 'Impossible de charger les statistiques');
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
      <div className="admin-page__loading">
        <div className="admin-page__loading-spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page__error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardStats}>Réessayer</button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-page__error">
        <h2>Aucune donnée</h2>
        <p>Les statistiques ne sont pas disponibles pour le moment.</p>
        <button onClick={fetchDashboardStats}>Réessayer</button>
      </div>
    );
  }

  const { utilisateurs, restaurants, commandes, commandes_par_statut, top_restaurants } = stats;

  // Valeurs par défaut si les données sont null/undefined
  const safeUtilisateurs = utilisateurs || { total_utilisateurs: 0, total_clients: 0, total_restaurateurs: 0, nouveaux_aujourd_hui: 0 };
  const safeRestaurants = restaurants || { total_restaurants: 0, restaurants_actifs: 0, nouveaux_aujourd_hui: 0 };
  const safeCommandes = commandes || { total_commandes: 0, panier_moyen: 0, ca_total: 0, ca_semaine: 0, ca_mois: 0, commandes_aujourd_hui: 0, ca_aujourd_hui: 0 };
  const safeCommandesParStatut = commandes_par_statut || [];
  const safeTopRestaurants = top_restaurants || [];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Tableau de bord</h1>
          <p className="admin-dashboard__subtitle">
            Bienvenue, {user?.prenom || 'Admin'} {user?.nom || ''}
          </p>
        </div>
        <button onClick={fetchDashboardStats} className="admin-dashboard__refresh">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Actualiser
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="admin-stats-grid">
        {/* Utilisateurs */}
        <div className="admin-stat-card admin-stat-card--blue">
          <div className="admin-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Utilisateurs</p>
            <h3 className="admin-stat-card__value">{safeUtilisateurs.total_utilisateurs}</h3>
            <div className="admin-stat-card__details">
              <span>{safeUtilisateurs.total_clients} clients</span>
              <span>{safeUtilisateurs.total_restaurateurs} restaurateurs</span>
            </div>
            {safeUtilisateurs.nouveaux_aujourd_hui > 0 && (
              <span className="admin-stat-card__badge">
                +{safeUtilisateurs.nouveaux_aujourd_hui} aujourd'hui
              </span>
            )}
          </div>
        </div>

        {/* Restaurants */}
        <div className="admin-stat-card admin-stat-card--orange">
          <div className="admin-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Restaurants</p>
            <h3 className="admin-stat-card__value">{safeRestaurants.total_restaurants}</h3>
            <div className="admin-stat-card__details">
              <span>{safeRestaurants.restaurants_actifs} actifs</span>
            </div>
            {safeRestaurants.nouveaux_aujourd_hui > 0 && (
              <span className="admin-stat-card__badge">
                +{safeRestaurants.nouveaux_aujourd_hui} aujourd'hui
              </span>
            )}
          </div>
        </div>

        {/* Commandes */}
        <div className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Commandes</p>
            <h3 className="admin-stat-card__value">{safeCommandes.total_commandes}</h3>
            <div className="admin-stat-card__details">
              <span>Panier moyen: {formatPrice(safeCommandes.panier_moyen)}</span>
            </div>
            {safeCommandes.commandes_aujourd_hui > 0 && (
              <span className="admin-stat-card__badge">
                +{safeCommandes.commandes_aujourd_hui} aujourd'hui
              </span>
            )}
          </div>
        </div>

        {/* Chiffre d'affaires */}
        <div className="admin-stat-card admin-stat-card--purple">
          <div className="admin-stat-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">CA Total</p>
            <h3 className="admin-stat-card__value">{formatPrice(safeCommandes.ca_total)}</h3>
            <div className="admin-stat-card__details">
              <span>Semaine: {formatPrice(safeCommandes.ca_semaine)}</span>
              <span>Mois: {formatPrice(safeCommandes.ca_mois)}</span>
            </div>
            {safeCommandes.ca_aujourd_hui > 0 && (
              <span className="admin-stat-card__badge">
                {formatPrice(safeCommandes.ca_aujourd_hui)} aujourd'hui
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="admin-dashboard__content">
        {/* Statut des commandes */}
        <div className="admin-dashboard__section">
          <h2 className="admin-dashboard__section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Répartition des commandes
          </h2>
          {safeCommandesParStatut.length === 0 ? (
            <div className="admin-empty-section">
              <p>Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="admin-orders-status">
              {safeCommandesParStatut.map((item) => {
                const statusInfo = getStatusInfo(item.statut);
                const total = safeCommandes.total_commandes || 1;
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={item.statut} className={`admin-orders-status__item admin-orders-status__item--${statusInfo.color}`}>
                    <div className="admin-orders-status__header">
                      <span className="admin-orders-status__icon">{statusInfo.icon}</span>
                      <span className="admin-orders-status__label">{statusInfo.label}</span>
                    </div>
                    <div className="admin-orders-status__value">{item.count}</div>
                    <div className="admin-orders-status__bar">
                      <div 
                        className="admin-orders-status__bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="admin-orders-status__percentage">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top restaurants */}
        <div className="admin-dashboard__section">
          <h2 className="admin-dashboard__section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Top 5 Restaurants
          </h2>
          {safeTopRestaurants.length === 0 ? (
            <div className="admin-empty-section">
              <p>Aucun restaurant pour le moment</p>
            </div>
          ) : (
            <div className="admin-top-restaurants">
              {safeTopRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="admin-top-restaurant">
                  <div className="admin-top-restaurant__rank">#{index + 1}</div>
                  <div className="admin-top-restaurant__info">
                    <h4 className="admin-top-restaurant__name">{restaurant.nom}</h4>
                    <p className="admin-top-restaurant__location">{restaurant.ville}</p>
                  </div>
                  <div className="admin-top-restaurant__stats">
                    <div className="admin-top-restaurant__stat">
                      <span className="admin-top-restaurant__stat-label">Commandes</span>
                      <span className="admin-top-restaurant__stat-value">{restaurant.nb_commandes || 0}</span>
                    </div>
                    <div className="admin-top-restaurant__stat">
                      <span className="admin-top-restaurant__stat-label">CA</span>
                      <span className="admin-top-restaurant__stat-value">{formatPrice(restaurant.ca)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h2 className="admin-quick-actions__title">Actions rapides</h2>
        <div className="admin-quick-actions__grid">
          <Link to="/admin/users" className="admin-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Gérer les utilisateurs</span>
          </Link>
          <Link to="/admin/restaurants" className="admin-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Gérer les restaurants</span>
          </Link>
          <Link to="/admin/orders" className="admin-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Voir toutes les commandes</span>
          </Link>
          <button onClick={fetchDashboardStats} className="admin-quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Actualiser les données</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function
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

export default AdminDashboardPage;