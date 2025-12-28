import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '@services/api';
import RestaurantCard from '../../components/client/RestaurantCard';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les restaurants d'Oyonnax
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll({
        page: 1,
        limit: 12,
        ville: 'Oyonnax',
      });

      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (err) {
      console.error('Erreur chargement restaurants:', err);
      setError('Impossible de charger les restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const stats = [
    { value: '0%', label: 'Commission' },
    { value: '100%', label: 'Local'},
    { value: '∞', label: 'Passion'},
  ];

  const values = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: 'Zéro Commission',
      description: 'Contrairement aux géants de la livraison, nous ne prenons aucune commission sur vos ventes. Un simple abonnement mensuel, c\'est tout.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      title: 'Fait avec Amour',
      description: 'Créé par des passionnés pour soutenir l\'économie locale d\'Oyonnax. Votre ville, vos restaurants, votre plateforme.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Communauté',
      description: 'Ensemble, redonnons le pouvoir aux restaurateurs locaux. Chaque commande renforce notre économie locale.',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1"></div>
          <div className="hero__blob hero__blob--2"></div>
          <div className="hero__blob hero__blob--3"></div>
          <div className="hero__grid"></div>
        </div>

        <div className="hero__container">
          

          <h1 className="hero__title">
            <span className="hero__title-line">Soutenez vos</span>
            <span className="hero__title-line hero__title-line--accent">restaurants locaux</span>
            <span className="hero__title-line hero__title-line--small">sans intermédiaire gourmand</span>
          </h1>

          <p className="hero__subtitle">
            SupaFood connecte directement les Oyonnaxiens à leurs restaurants préférés.
            <strong> Sans commission, sans compromis.</strong>
          </p>

          <div className="hero__cta">
            <a href="#restaurants" className="hero__btn hero__btn--primary">
              <span>Découvrir les restaurants</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <Link to="/register?role=restaurateur" className="hero__btn hero__btn--secondary">
              <span>Vous êtes restaurateur ?</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            {stats.map((stat, index) => (
              <div key={index} className="hero__stat">
                <span className="hero__stat-icon">{stat.icon}</span>
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Manifesto Section */}
      <section className="manifesto">
        <div className="manifesto__container">
          <div className="manifesto__header">
            <span className="manifesto__label">Notre mission</span>
            <h2 className="manifesto__title">
              Les plateformes prennent jusqu'à <span className="manifesto__highlight">30%</span> de commission.
              <br />
              <span className="manifesto__accent">Nous, zéro.</span>
            </h2>
          </div>

          <div className="manifesto__content">
            <p className="manifesto__text">
              Chaque jour, les restaurants d'Oyonnax perdent une part importante de leurs revenus
              au profit des grandes plateformes. Nous avons décidé de changer ça.
            </p>
            <p className="manifesto__text manifesto__text--highlight">
              SupaFood est une initiative locale, créée pour et par les Oyonnaxiens.
              Notre objectif : redonner aux restaurateurs ce qui leur appartient.
            </p>
          </div>

          <div className="manifesto__values">
            {values.map((value, index) => (
              <div key={index} className="manifesto__value">
                <div className="manifesto__value-icon">{value.icon}</div>
                <h3 className="manifesto__value-title">{value.title}</h3>
                <p className="manifesto__value-desc">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="restaurants" id="restaurants">
        <div className="restaurants__container">
          <div className="restaurants__header">
            <span className="restaurants__label">Découvrir</span>
            <h2 className="restaurants__title">
              Les restaurants d'
              <span className="restaurants__title-city">Oyonnax</span>
            </h2>
            <p className="restaurants__subtitle">
              Tous ces établissements ont fait le choix d'une plateforme éthique et locale
            </p>
          </div>

          {loading ? (
            <div className="restaurants__loading">
              <div className="restaurants__loading-spinner"></div>
              <p>Chargement des pépites locales...</p>
            </div>
          ) : error ? (
            <div className="restaurants__error">
              <p>{error}</p>
              <button onClick={() => fetchRestaurants()}>Réessayer</button>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="restaurants__empty">
              <div className="restaurants__empty-visual">
                <span>🍽️</span>
              </div>
              <h3>Bientôt disponible</h3>
              <p>Les premiers restaurants arrivent très bientôt sur SupaFood !</p>
              <Link to="/register?role=restaurateur" className="restaurants__empty-btn">
                Être le premier restaurant
              </Link>
            </div>
          ) : (
            <>
              <div className="restaurants__grid">
                {restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="restaurants__card-wrapper"
                    style={{ '--delay': `${index * 0.1}s` }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta__container">
          <div className="cta__content">
            <span className="cta__label">Rejoignez le mouvement</span>
            <h2 className="cta__title">
              Vous êtes restaurateur à Oyonnax ?
            </h2>
            <p className="cta__text">
              Rejoignez SupaFood et gardez 100% de vos revenus.
              Un abonnement simple et transparent, sans commission sur vos ventes.
            </p>
            <div className="cta__features">
              <div className="cta__feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>0% de commission</span>
              </div>
              <div className="cta__feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Abonnement fixe</span>
              </div>
              <div className="cta__feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Dashboard complet</span>
              </div>
              <div className="cta__feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Support local dédié</span>
              </div>
            </div>
            
            {/* Pricing hint */}
            <div className="cta__pricing">
              <span className="cta__pricing-label">À partir de</span> 
              
              <span className="cta__pricing-value">29€<small>/mois</small></span>
            
              <span className="cta__pricing-note">1er mois offert • Sans engagement</span>
            </div>

            <Link to="/register?role=restaurateur" className="cta__btn">
              <span>Inscrire mon restaurant</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          <div className="cta__visual">
            <div className="cta__card cta__card--1">
              <span className="cta__card-emoji">📊</span>
              <span className="cta__card-text">Dashboard temps réel</span>
            </div>
            <div className="cta__card cta__card--2">
              <span className="cta__card-emoji">💸</span>
              <span className="cta__card-text">0% commission</span>
            </div>
            <div className="cta__card cta__card--3">
              <span className="cta__card-emoji">📱</span>
              <span className="cta__card-text">Gestion simplifiée</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="banner">
        <div className="banner__marquee">
          <div className="banner__track">
            <span>OYONNAX</span>
            <span>•</span>
            <span>0% COMMISSION</span>
            <span>•</span>
            <span>100% LOCAL</span>
            <span>•</span>
            <span>SUPAFOOD</span>
            <span>•</span>
            <span>OYONNAX</span>
            <span>•</span>
            <span>0% COMMISSION</span>
            <span>•</span>
            <span>100% LOCAL</span>
            <span>•</span>
            <span>SUPAFOOD</span>
            <span>•</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;