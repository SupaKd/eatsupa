import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { restaurantAPI } from '@services/api';
import { selectCartItemsCount, selectCartRestaurant } from '@store/slices/cartSlice';
import PlatCard from '@components/PlatCard';

function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showHoraires, setShowHoraires] = useState(false);
  
  const cartItemsCount = useSelector(selectCartItemsCount);
  const cartRestaurant = useSelector(selectCartRestaurant);
  
  const categoriesRef = useRef({});

  // Charger le restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await restaurantAPI.getById(id);
        
        if (response.data.success) {
          setRestaurant(response.data.data);
          if (response.data.data.categories?.length > 0) {
            setActiveCategory(response.data.data.categories[0].id);
          }
        }
      } catch (err) {
        console.error('Erreur chargement restaurant:', err);
        setError('Restaurant non trouvé');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  // Scroll vers une catégorie
  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const element = categoriesRef.current[categoryId];
    if (element) {
      const headerHeight = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Formater les horaires
  const formatHoraires = (horaires) => {
    if (!horaires) return null;
    const parsed = typeof horaires === 'string' ? JSON.parse(horaires) : horaires;
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    
    return jours.map(jour => {
      const config = parsed[jour];
      if (!config?.ouvert || !config.horaires?.length) {
        return { jour: jour.charAt(0).toUpperCase() + jour.slice(1), horaires: 'Fermé' };
      }
      const creneaux = config.horaires
        .filter(c => c.debut && c.fin)
        .map(c => `${c.debut} - ${c.fin}`)
        .join(', ');
      return { jour: jour.charAt(0).toUpperCase() + jour.slice(1), horaires: creneaux || 'Fermé' };
    });
  };

  if (loading) {
    return (
      <div className="restaurant-page__loading">
        <div className="restaurant-page__loading-spinner"></div>
        <p>Chargement du restaurant...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-page__error">
        <h2>Restaurant non trouvé</h2>
        <p>Ce restaurant n'existe pas ou n'est plus disponible.</p>
        <Link to="/" className="restaurant-page__error-btn">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const horaires = formatHoraires(restaurant.horaires_ouverture);
  const imageUrl = restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop';

  return (
    <div className="restaurant-page">
      {/* Header avec image */}
      <div className="restaurant-header">
        <img 
          src={imageUrl} 
          alt={restaurant.nom} 
          className="restaurant-header__image"
        />
        <div className="restaurant-header__overlay"></div>
        <div className="restaurant-header__content">
          <Link to="/" className="restaurant-header__back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour
          </Link>
        </div>
      </div>

      {/* Infos restaurant */}
      <div className="restaurant-info">
        <div className="restaurant-info__container">
          <div className="restaurant-info__main">
            <div className="restaurant-info__header">
              <h1 className="restaurant-info__name">{restaurant.nom}</h1>
              <div className={`restaurant-info__status ${restaurant.est_ouvert ? 'restaurant-info__status--open' : 'restaurant-info__status--closed'}`}>
                {restaurant.est_ouvert ? 'Ouvert' : 'Fermé'}
              </div>
            </div>
            
            {restaurant.type_cuisine && (
              <span className="restaurant-info__cuisine">{restaurant.type_cuisine}</span>
            )}
            
            {restaurant.description && (
              <p className="restaurant-info__description">{restaurant.description}</p>
            )}

            <div className="restaurant-info__details">
              <div className="restaurant-info__detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{restaurant.adresse}, {restaurant.code_postal} {restaurant.ville}</span>
              </div>
              
              <div className="restaurant-info__detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Préparation: ~{restaurant.delai_preparation} min</span>
              </div>

              {restaurant.telephone && (
                <div className="restaurant-info__detail">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href={`tel:${restaurant.telephone}`}>{restaurant.telephone}</a>
                </div>
              )}
            </div>

            {/* Modes de paiement */}
            {restaurant.modes_paiement && restaurant.modes_paiement.length > 0 && (
              <div className="restaurant-info__payment">
                <span className="restaurant-info__payment-label">Paiement:</span>
                {restaurant.modes_paiement.map((mode) => (
                  <span key={mode.id} className="restaurant-info__payment-mode">
                    {mode.id === 'sur_place' ? '💵' : '💳'} {mode.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Horaires */}
          <div className="restaurant-info__horaires">
            <button 
              className="restaurant-info__horaires-toggle"
              onClick={() => setShowHoraires(!showHoraires)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Horaires d'ouverture
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showHoraires ? 'rotate' : ''}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {showHoraires && horaires && (
              <div className="restaurant-info__horaires-list">
                {horaires.map(({ jour, horaires: h }) => (
                  <div key={jour} className="restaurant-info__horaire">
                    <span className="restaurant-info__horaire-jour">{jour}</span>
                    <span className={`restaurant-info__horaire-heures ${h === 'Fermé' ? 'restaurant-info__horaire-heures--closed' : ''}`}>
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation catégories sticky */}
      {restaurant.categories && restaurant.categories.length > 0 && (
        <nav className="restaurant-nav">
          <div className="restaurant-nav__container">
            {restaurant.categories.map((category) => (
              <button
                key={category.id}
                className={`restaurant-nav__item ${activeCategory === category.id ? 'restaurant-nav__item--active' : ''}`}
                onClick={() => scrollToCategory(category.id)}
              >
                {category.nom}
                {category.plats && (
                  <span className="restaurant-nav__count">{category.plats.length}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Menu */}
      <div className="restaurant-menu">
        <div className="restaurant-menu__container">
          {restaurant.categories && restaurant.categories.length > 0 ? (
            restaurant.categories.map((category) => (
              <section
                key={category.id}
                ref={(el) => (categoriesRef.current[category.id] = el)}
                className="restaurant-menu__section"
              >
                <h2 className="restaurant-menu__section-title">{category.nom}</h2>
                {category.description && (
                  <p className="restaurant-menu__section-description">{category.description}</p>
                )}
                
                {category.plats && category.plats.length > 0 ? (
                  <div className="restaurant-menu__grid">
                    {category.plats.map((plat) => (
                      <PlatCard
                        key={plat.id}
                        plat={plat}
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.nom}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="restaurant-menu__empty">Aucun plat dans cette catégorie</p>
                )}
              </section>
            ))
          ) : (
            <div className="restaurant-menu__no-menu">
              <p>Le menu de ce restaurant n'est pas encore disponible.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bouton panier flottant */}
      {cartItemsCount > 0 && cartRestaurant.id === parseInt(id) && (
        <Link to="/commander" className="restaurant-page__cart-btn">
          <span className="restaurant-page__cart-count">{cartItemsCount}</span>
          <span>Voir le panier</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      )}
    </div>
  );
}

export default RestaurantPage;