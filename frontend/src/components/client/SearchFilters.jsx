import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";

function SearchFilters({ onFilterChange, restaurantsCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Liste des cuisines disponibles (à adapter selon vos besoins)
  const cuisineTypes = [
    "Tous",
    "Français",
    "Italien",
    "Japonais",
    "Burger",
    "Pizza",
    "Kebab",
    "Asiatique",
    "Végétarien",
    "Chinois",
    "Indien",
    "Mexicain"
  ];

  // Appliquer les filtres avec un léger délai pour la recherche (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        search: searchTerm,
        type_cuisine: selectedCuisine,
        openOnly: showOpenOnly
      });
    }, 300); // Délai de 300ms pour éviter trop d'appels API

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCuisine, showOpenOnly, onFilterChange]);

  // Effacer tous les filtres
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("");
    setShowOpenOnly(false);
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm || selectedCuisine || showOpenOnly;

  return (
    <div className="search-filters">
      {/* Barre de recherche principale */}
      <div className="search-filters__main">
        <div className="search-filters__search-box">
          <Search className="search-filters__search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher un restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-filters__search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="search-filters__clear-btn"
              aria-label="Effacer la recherche"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`search-filters__filter-toggle ${showFilters ? 'active' : ''}`}
        >
          <Filter size={18} />
          <span>Filtres</span>
          {hasActiveFilters && <span className="search-filters__badge" />}
        </button>
      </div>

      {/* Panel de filtres avancés */}
      {showFilters && (
        <div className="search-filters__panel">
          {/* Filtre par type de cuisine */}
          <div className="search-filters__group">
            <label className="search-filters__label">Type de cuisine</label>
            <div className="search-filters__cuisine-grid">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine === "Tous" ? "" : cuisine)}
                  className={`search-filters__cuisine-btn ${
                    (cuisine === "Tous" && !selectedCuisine) || selectedCuisine === cuisine
                      ? 'active'
                      : ''
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre ouvert maintenant */}
          <div className="search-filters__group">
            <label className="search-filters__checkbox">
              <input
                type="checkbox"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
              />
              <span className="search-filters__checkbox-mark" />
              <span className="search-filters__checkbox-label">
                Ouvert maintenant
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="search-filters__actions">
            <button
              onClick={clearFilters}
              className="search-filters__clear-all"
              disabled={!hasActiveFilters}
            >
              Effacer tout
            </button>
            <div className="search-filters__results">
              {restaurantsCount} restaurant{restaurantsCount > 1 ? 's' : ''} trouvé{restaurantsCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFilters;