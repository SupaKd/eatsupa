import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { restaurantAPI } from '@services/api';
import { selectCartItemsCount, selectCartRestaurant } from '@store/slices/cartSlice';
import PlatCard from '@components/client/PlatCard';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  ArrowRight,
  Lock
} from 'lucide-react';

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
      <div className="restaurant-header">
        <img src={imageUrl} alt={restaurant.nom} className="restaurant-header__image"/>
        <div className="restaurant-header__overlay"></div>
        <div className="restaurant-header__content">
          <Link to="/" className="restaurant-header__back">
            <ArrowLeft size={20}/>
            Retour
          </Link>
        </div>
      </div>

      <div className="restaurant-info">

        {!restaurant.est_ouvert && (
          <div className="restaurant-closed-banner">
            <div className="restaurant-closed-banner__container">
              <div className="restaurant-closed-banner__icon">
                <Lock size={18}/>
              </div>
              <div className="restaurant-closed-banner__content">
                <h3>Restaurant actuellement fermé</h3>
                <p>
                  {restaurant.prochaine_ouverture ? (
                    <>
                      Prochaine ouverture :{' '}
                      <strong>
                        {restaurant.prochaine_ouverture.estAujourdHui
                          ? `Aujourd'hui à ${restaurant.prochaine_ouverture.heure}`
                          : restaurant.prochaine_ouverture.estDemain
                          ? `Demain à ${restaurant.prochaine_ouverture.heure}`
                          : `${restaurant.prochaine_ouverture.jourCapitalized} à ${restaurant.prochaine_ouverture.heure}`
                        }
                      </strong>
                    </>
                  ) : (
                    'Horaires non disponibles'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

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
                <MapPin size={18}/>
                <span>{restaurant.adresse}, {restaurant.code_postal} {restaurant.ville}</span>
              </div>

              <div className="restaurant-info__detail">
                <Clock size={18}/>
                <span>Préparation: ~{restaurant.delai_preparation} min</span>
              </div>

              {restaurant.telephone && (
                <div className="restaurant-info__detail">
                  <Phone size={18}/>
                  <a href={`tel:${restaurant.telephone}`}>{restaurant.telephone}</a>
                </div>
              )}
            </div>

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

          <div className="restaurant-info__horaires">
            <button
              className="restaurant-info__horaires-toggle"
              onClick={() => setShowHoraires(!showHoraires)}
            >
              <Clock size={18}/>
              Horaires d'ouverture
              <ChevronDown size={16} className={showHoraires ? 'rotate' : ''}/>
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
                        restaurantOuvert={restaurant.est_ouvert}
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

      {cartItemsCount > 0 && cartRestaurant.id === parseInt(id) && (
        <Link to="/commander" className="restaurant-page__cart-btn">
          <span className="restaurant-page__cart-count">{cartItemsCount}</span>
          <span>Voir le panier</span>
          <ArrowRight size={20}/>
        </Link>
      )}
    </div>
  );
}

export default RestaurantPage;
