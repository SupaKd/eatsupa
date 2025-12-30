import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Euro,
  Heart,
  Users,
  Check,
} from "lucide-react";
import { restaurantAPI } from "@services/api";
import RestaurantCard from "../../components/client/RestaurantCard";
import SearchFilters from "../../components/client/SearchFilters";

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type_cuisine: "",
    openOnly: false
  });

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de requête
      const params = {
        page: 1,
        limit: 50, // Augmenté pour avoir tous les restaurants
      };

      // Ajouter les filtres actifs
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.type_cuisine) {
        params.type_cuisine = filters.type_cuisine;
      }
      if (filters.openOnly) {
        params.ouvert = 'true'; // Nouveau paramètre backend
      }

      const response = await restaurantAPI.getAll(params);

      if (response.data.success && Array.isArray(response.data.data)) {
        setRestaurants(response.data.data);
      } else {
        setRestaurants([]);
        setError("Erreur lors du chargement des restaurants");
      }
    } catch (err) {
      if (err.response) {
        setError(
          `Erreur serveur ${err.response.status} : ${
            err.response.data?.message || "Erreur inconnue"
          }`
        );
      } else {
        setError("Impossible de contacter le serveur");
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const stats = [
    { value: "0%", label: "Commission" },
    { value: "100%", label: "Local" },
    { value: "∞", label: "Passion" },
  ];

  return (
    <div className="home-page">
      {/* HERO */}
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
            <span className="hero__title-line hero__title-line--accent">
              restaurants locaux
            </span>
            <span className="hero__title-line hero__title-line--small">
              sans intermédiaire gourmand
            </span>
          </h1>

          <p className="hero__subtitle">
            Yumioo connecte directement les Oyonnaxiens à leurs restaurants
            préférés.
            <strong> Sans commission, sans compromis.</strong>
          </p>

          <div className="hero__cta">
            <a href="#restaurants" className="hero__btn hero__btn--primary">
              <span>Découvrir les restaurants</span>
              <ArrowRight size={20} />
            </a>
            <Link
              to="/devenir-restaurateur"
              className="hero__btn hero__btn--secondary"
            >
              <span>Vous êtes restaurateur ?</span>
            </Link>
          </div>

          <div className="hero__stats">
            {stats.map((stat, index) => (
              <div key={index} className="hero__stat">
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="restaurants" id="restaurants">
        <div className="restaurants__container">
          <div className="restaurants__header">
            <span className="restaurants__label">Découvrir</span>
            <h2 className="restaurants__title">Les restaurants</h2>
            <p className="restaurants__subtitle">
              Une sélection d'établissements locaux engagés
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <SearchFilters 
            onFilterChange={handleFilterChange}
            restaurantsCount={restaurants.length}
          />

          {loading ? (
            <div className="restaurants__loading">
              <div className="restaurants__loading-spinner"></div>
              <p>Chargement des pépites locales...</p>
            </div>
          ) : error ? (
            <div className="restaurants__error">
              <h3>Erreur de chargement</h3>
              <p>{error}</p>
              <button
                onClick={fetchRestaurants}
                className="restaurants__error-btn"
              >
                Réessayer
              </button>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="restaurants__empty">
              <h3>Aucun restaurant trouvé</h3>
              <p>
                {filters.search || filters.type_cuisine || filters.openOnly 
                  ? "Essayez de modifier vos critères de recherche."
                  : "Les premiers restaurants arrivent très bientôt sur Yumioo !"}
              </p>
              {(filters.search || filters.type_cuisine || filters.openOnly) && (
                <button
                  onClick={() => setFilters({ search: "", type_cuisine: "", openOnly: false })}
                  className="restaurants__empty-btn"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="restaurants__grid">
                {restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="restaurants__card-wrapper"
                    style={{ "--delay": `${index * 0.1}s` }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta__container">
          <div className="cta__content">
            <span className="cta__label">Rejoignez le mouvement</span>
            <h2 className="cta__title">Vous êtes restaurateur ?</h2>

            <p className="cta__text">
              Rejoignez Yumioo et gardez 100% de vos revenus.
            </p>

            <div className="cta__features">
              <div className="cta__feature">
                <Check size={20} />
                <span>0% de commission</span>
              </div>
              <div className="cta__feature">
                <Check size={20} />
                <span>Abonnement fixe</span>
              </div>
              <div className="cta__feature">
                <Check size={20} />
                <span>Dashboard complet</span>
              </div>
              <div className="cta__feature">
                <Check size={20} />
                <span>Support local dédié</span>
              </div>
            </div>

            <Link
              to="/register?role=restaurateur"
              className="cta__btn"
            >
              <span>Inscrire mon restaurant</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="banner">
        <div className="banner__marquee">
          <div className="banner__track">
            <span>OYONNAX</span>
            <span>•</span>
            <span>0% COMMISSION</span>
            <span>•</span>
            <span>100% LOCAL</span>
            <span>•</span>
            <span>YUMIOO</span>
            <span>•</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;