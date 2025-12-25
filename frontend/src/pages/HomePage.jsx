import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantAPI } from '@services/api';
import RestaurantCard from '../components/client/RestaurantCard';

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filtres
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ville, setVille] = useState(searchParams.get('ville') || '');
  const [typeCuisine, setTypeCuisine] = useState(searchParams.get('type') || '');

  // Charger les restaurants
  const fetchRestaurants = async (params = {}) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll({
        page: params.page || 1,
        limit: 12,
        search: params.search || undefined,
        ville: params.ville || undefined,
        type_cuisine: params.type_cuisine || undefined,
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

  useEffect(() => {
    fetchRestaurants({
      search: searchParams.get('search'),
      ville: searchParams.get('ville'),
      type_cuisine: searchParams.get('type'),
      page: searchParams.get('page') || 1,
    });
  }, [searchParams]);

  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (ville) params.set('ville', ville);
    if (typeCuisine) params.set('type', typeCuisine);
    setSearchParams(params);
  };

  // Effacer les filtres
  const clearFilters = () => {
    setSearch('');
    setVille('');
    setTypeCuisine('');
    setSearchParams({});
  };

  // Pagination
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <h1 className="hero__title">
            Vos plats préférés,<br />
            <span>livrés chez vous</span>
          </h1>
          <p className="hero__subtitle">
            Découvrez les meilleurs restaurants près de chez vous et commandez en quelques clics
          </p>

          {/* Barre de recherche */}
          <form className="hero__search" onSubmit={handleSearch}>
            <div className="hero__search-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hero__search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Rechercher un restaurant, une cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="hero__search-input"
              />
            </div>
            <input
              type="text"
              placeholder="Ville"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="hero__search-city"
            />
            <button type="submit" className="hero__search-btn">
              Rechercher
            </button>
          </form>

          {/* Filtres rapides */}
          <div className="hero__filters">
            <button 
              className={`hero__filter ${typeCuisine === 'Burgers' ? 'hero__filter--active' : ''}`}
              onClick={() => setTypeCuisine(typeCuisine === 'Burgers' ? '' : 'Burgers')}
            >
              🍔 Burgers
            </button>
            <button 
              className={`hero__filter ${typeCuisine === 'Italien' ? 'hero__filter--active' : ''}`}
              onClick={() => setTypeCuisine(typeCuisine === 'Italien' ? '' : 'Italien')}
            >
              🍕 Pizza
            </button>
            <button 
              className={`hero__filter ${typeCuisine === 'Asiatique' ? 'hero__filter--active' : ''}`}
              onClick={() => setTypeCuisine(typeCuisine === 'Asiatique' ? '' : 'Asiatique')}
            >
              🍜 Asiatique
            </button>
            <button 
              className={`hero__filter ${typeCuisine === 'Mexicain' ? 'hero__filter--active' : ''}`}
              onClick={() => setTypeCuisine(typeCuisine === 'Mexicain' ? '' : 'Mexicain')}
            >
              🌮 Mexicain
            </button>
            <button 
              className={`hero__filter ${typeCuisine === 'Healthy' ? 'hero__filter--active' : ''}`}
              onClick={() => setTypeCuisine(typeCuisine === 'Healthy' ? '' : 'Healthy')}
            >
              🥗 Healthy
            </button>
          </div>
        </div>
      </section>

      {/* Liste des restaurants */}
      <section className="restaurants">
        <div className="restaurants__container">
          <div className="restaurants__header">
            <h2 className="restaurants__title">
              {searchParams.toString() ? 'Résultats de recherche' : 'Restaurants près de vous'}
              {pagination.total > 0 && (
                <span className="restaurants__count">({pagination.total})</span>
              )}
            </h2>
            {searchParams.toString() && (
              <button className="restaurants__clear" onClick={clearFilters}>
                Effacer les filtres
              </button>
            )}
          </div>

          {loading ? (
            <div className="restaurants__loading">
              <div className="restaurants__loading-spinner"></div>
              <p>Chargement des restaurants...</p>
            </div>
          ) : error ? (
            <div className="restaurants__error">
              <p>{error}</p>
              <button onClick={() => fetchRestaurants()}>Réessayer</button>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="restaurants__empty">
              <div className="restaurants__empty-icon">🍽️</div>
              <h3>Aucun restaurant trouvé</h3>
              <p>Essayez de modifier vos critères de recherche</p>
              <button onClick={clearFilters}>Voir tous les restaurants</button>
            </div>
          ) : (
            <>
              <div className="restaurants__grid">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="restaurants__pagination">
                  <button
                    className="restaurants__pagination-btn"
                    disabled={!pagination.hasPrev}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Précédent
                  </button>
                  
                  <span className="restaurants__pagination-info">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  
                  <button
                    className="restaurants__pagination-btn"
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Suivant
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;