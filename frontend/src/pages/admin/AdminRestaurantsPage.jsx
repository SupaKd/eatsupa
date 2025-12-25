import { useState, useEffect } from 'react';
import { adminAPI } from '@services/api';
import { Link } from 'react-router-dom';

function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    actif: '',
  });

  useEffect(() => {
    fetchRestaurants();
  }, [pagination.page, filters]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.restaurants.getAll({
        page: pagination.page,
        limit: 20,
        ...filters,
      });
      if (response.data.success) {
        setRestaurants(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Erreur chargement restaurants:', err);
      setError('Impossible de charger les restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleToggleStatus = async (restaurantId) => {
    try {
      await adminAPI.restaurants.toggleStatus(restaurantId);
      fetchRestaurants();
    } catch (err) {
      console.error('Erreur toggle statut:', err);
      alert('Erreur lors de la modification du statut');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-restaurants-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Gestion des restaurants</h1>
          <p className="admin-page-header__subtitle">
            {pagination.total} restaurant{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filters__search">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, ville..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <select
          value={filters.actif}
          onChange={(e) => handleFilterChange('actif', e.target.value)}
          className="admin-filters__select"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading__spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={fetchRestaurants}>Réessayer</button>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="admin-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h3>Aucun restaurant trouvé</h3>
          <p>Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Propriétaire</th>
                  <th>Ville</th>
                  <th>Type cuisine</th>
                  <th>Commandes</th>
                  <th>CA Total</th>
                  <th>Statut</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td>
                      <div className="admin-table__restaurant">
                        <div className="admin-table__restaurant-name">
                          {restaurant.nom}
                        </div>
                        <div className="admin-table__restaurant-id">
                          ID: {restaurant.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__owner">
                        <div>{restaurant.proprietaire_prenom} {restaurant.proprietaire_nom}</div>
                        <div className="admin-table__owner-email">{restaurant.proprietaire_email}</div>
                      </div>
                    </td>
                    <td>{restaurant.ville}</td>
                    <td>{restaurant.type_cuisine || '-'}</td>
                    <td>
                      <span className="admin-table__stat">{restaurant.total_commandes || 0}</span>
                    </td>
                    <td>
                      <span className="admin-table__stat admin-table__stat--price">
                        {formatPrice(restaurant.ca_total)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--${restaurant.actif ? 'green' : 'gray'}`}>
                        {restaurant.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>{formatDate(restaurant.created_at)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/restaurant/${restaurant.id}`}
                          className="admin-table__action"
                          title="Voir le restaurant"
                          target="_blank"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(restaurant.id)}
                          className={`admin-table__action ${!restaurant.actif ? 'admin-table__action--success' : ''}`}
                          title={restaurant.actif ? 'Désactiver' : 'Activer'}
                        >
                          {restaurant.actif ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="admin-pagination__btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Précédent
              </button>
              <span className="admin-pagination__info">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
                className="admin-pagination__btn"
              >
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminRestaurantsPage;