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
      <div className="admin-dashboard">
        <div className="admin-dashboard__loading">
          <div className="admin-dashboard__spinner"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__error">
          <span className="admin-dashboard__error-icon">⚠️</span>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardStats} className="admin-dashboard__btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { restaurants, top_restaurants, revenus, general } = stats || {};

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__header-content">
          <h1 className="admin-dashboard__title">Tableau de bord</h1>
          <p className="admin-dashboard__subtitle">
            Bienvenue, {user?.prenom || 'Admin'}
          </p>
        </div>
        <button onClick={fetchDashboardStats} className="admin-dashboard__refresh">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Actualiser
        </button>
      </header>

      {/* Revenus Application - Section principale */}
      <section className="admin-dashboard__revenue">
        <div className="admin-dashboard__revenue-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Revenus de l'application
          </h2>
          <span className="admin-dashboard__revenue-badge">
            Abonnement : {formatPrice(revenus?.prix_abonnement || 50)}/mois
          </span>
        </div>
        
        <div className="admin-dashboard__revenue-cards">
          <div className="revenue-card revenue-card--primary">
            <div className="revenue-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="revenue-card__content">
              <span className="revenue-card__label">Revenu mensuel</span>
              <span className="revenue-card__value">{formatPrice(revenus?.revenu_mensuel)}</span>
              <span className="revenue-card__detail">
                {revenus?.nb_abonnements_actifs} abonnement{revenus?.nb_abonnements_actifs > 1 ? 's' : ''} actif{revenus?.nb_abonnements_actifs > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="revenue-card revenue-card--secondary">
            <div className="revenue-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className="revenue-card__content">
              <span className="revenue-card__label">Revenu annuel estimé</span>
              <span className="revenue-card__value">{formatPrice(revenus?.revenu_annuel_estime)}</span>
              <span className="revenue-card__detail">Projection sur 12 mois</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grille principale */}
      <div className="admin-dashboard__grid">
        {/* Aperçu Restaurants */}
        <section className="admin-dashboard__section admin-dashboard__section--restaurants">
          <div className="admin-dashboard__section-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Aperçu des restaurants
            </h2>
            <Link to="/admin/restaurants" className="admin-dashboard__link">
              Voir tout →
            </Link>
          </div>

          <div className="restaurant-stats">
            <div className="restaurant-stats__item restaurant-stats__item--total">
              <span className="restaurant-stats__number">{restaurants?.total || 0}</span>
              <span className="restaurant-stats__label">Total</span>
            </div>
            <div className="restaurant-stats__item restaurant-stats__item--active">
              <span className="restaurant-stats__number">{restaurants?.actifs || 0}</span>
              <span className="restaurant-stats__label">Actifs</span>
            </div>
            <div className="restaurant-stats__item restaurant-stats__item--inactive">
              <span className="restaurant-stats__number">{restaurants?.inactifs || 0}</span>
              <span className="restaurant-stats__label">Inactifs</span>
            </div>
          </div>

          {/* Liste des restaurants actifs */}
          <div className="restaurants-list">
            <h3 className="restaurants-list__title">Restaurants actifs</h3>
            {restaurants?.liste_actifs?.length === 0 ? (
              <p className="restaurants-list__empty">Aucun restaurant actif</p>
            ) : (
              <div className="restaurants-list__items">
                {restaurants?.liste_actifs?.slice(0, 5).map((resto) => (
                  <div key={resto.id} className="restaurant-item">
                    <div className="restaurant-item__info">
                      <span className="restaurant-item__name">{resto.nom}</span>
                      <span className="restaurant-item__meta">
                        {resto.ville} • {resto.type_cuisine || 'Non défini'}
                      </span>
                    </div>
                    <div className="restaurant-item__stats">
                      <span className="restaurant-item__orders">
                        {resto.total_commandes} cmd{resto.total_commandes > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Top 5 Restaurants */}
        <section className="admin-dashboard__section admin-dashboard__section--top">
          <div className="admin-dashboard__section-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Top 5 Restaurants
            </h2>
          </div>

          {top_restaurants?.length === 0 ? (
            <p className="admin-dashboard__empty">Aucune donnée disponible</p>
          ) : (
            <div className="top-restaurants">
              {top_restaurants?.map((resto, index) => (
                <div key={resto.id} className="top-restaurant">
                  <div className={`top-restaurant__rank top-restaurant__rank--${index + 1}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="top-restaurant__info">
                    <span className="top-restaurant__name">{resto.nom}</span>
                    <span className="top-restaurant__location">
                      {resto.ville} {resto.type_cuisine && `• ${resto.type_cuisine}`}
                    </span>
                  </div>
                  <div className="top-restaurant__metrics">
                    <div className="top-restaurant__metric">
                      <span className="top-restaurant__metric-value">{resto.nb_commandes}</span>
                      <span className="top-restaurant__metric-label">commandes</span>
                    </div>
                    <div className="top-restaurant__metric top-restaurant__metric--revenue">
                      <span className="top-restaurant__metric-value">{formatPrice(resto.ca)}</span>
                      <span className="top-restaurant__metric-label">CA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Stats générales secondaires */}
      <section className="admin-dashboard__secondary-stats">
        <div className="secondary-stat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <div className="secondary-stat__content">
            <span className="secondary-stat__value">{general?.total_restaurateurs || 0}</span>
            <span className="secondary-stat__label">Restaurateurs</span>
          </div>
        </div>
        <div className="secondary-stat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div className="secondary-stat__content">
            <span className="secondary-stat__value">{general?.total_clients || 0}</span>
            <span className="secondary-stat__label">Clients</span>
          </div>
        </div>
        <div className="secondary-stat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <div className="secondary-stat__content">
            <span className="secondary-stat__value">{general?.total_commandes || 0}</span>
            <span className="secondary-stat__label">Commandes totales</span>
          </div>
        </div>
        <div className="secondary-stat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          <div className="secondary-stat__content">
            <span className="secondary-stat__value">{formatPrice(general?.volume_commandes)}</span>
            <span className="secondary-stat__label">Volume traité</span>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <section className="admin-dashboard__actions">
        <h2>Actions rapides</h2>
        <div className="admin-dashboard__actions-grid">
          <Link to="/admin/restaurants" className="quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Gérer les restaurants</span>
          </Link>
          <Link to="/admin/users" className="quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Gérer les utilisateurs</span>
          </Link>
          <Link to="/admin/orders" className="quick-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Voir les commandes</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;