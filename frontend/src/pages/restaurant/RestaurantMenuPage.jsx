import { useState, useEffect } from 'react';
import { restaurantAPI, categoryAPI, platAPI } from '@services/api';

function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPlatModal, setShowPlatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPlat, setEditingPlat] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await restaurantAPI.getMyRestaurant();
      if (response.data.success) {
        const data = response.data.data;
        setRestaurant(data.restaurant);
        
        // Charger les catégories avec les plats
        if (data.restaurant?.id) {
          const catResponse = await categoryAPI.getByRestaurant(data.restaurant.id);
          if (catResponse.data.success) {
            setCategories(catResponse.data.data);
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement menu:', err);
      if (err.response?.data?.code === 'NO_RESTAURANT') {
        setError('no_restaurant');
      } else {
        setError('Impossible de charger le menu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers Catégories
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Supprimer cette catégorie et tous ses plats ?')) return;
    
    try {
      await categoryAPI.delete(restaurant.id, categoryId);
      await fetchData();
    } catch (err) {
      console.error('Erreur suppression catégorie:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await categoryAPI.update(restaurant.id, editingCategory.id, categoryData);
      } else {
        await categoryAPI.create(restaurant.id, categoryData);
      }
      setShowCategoryModal(false);
      await fetchData();
    } catch (err) {
      console.error('Erreur sauvegarde catégorie:', err);
      throw err;
    }
  };

  // Handlers Plats
  const handleAddPlat = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditingPlat(null);
    setShowPlatModal(true);
  };

  const handleEditPlat = (plat, categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditingPlat(plat);
    setShowPlatModal(true);
  };

  const handleDeletePlat = async (platId) => {
    if (!confirm('Supprimer ce plat ?')) return;
    
    try {
      await platAPI.delete(restaurant.id, platId);
      await fetchData();
    } catch (err) {
      console.error('Erreur suppression plat:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleDisponibilite = async (platId) => {
    try {
      await platAPI.toggleDisponibilite(restaurant.id, platId);
      await fetchData();
    } catch (err) {
      console.error('Erreur toggle disponibilité:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleSavePlat = async (platData) => {
    try {
      if (editingPlat) {
        await platAPI.update(restaurant.id, editingPlat.id, platData);
      } else {
        await platAPI.create(restaurant.id, { ...platData, categorie_id: selectedCategoryId });
      }
      setShowPlatModal(false);
      await fetchData();
    } catch (err) {
      console.error('Erreur sauvegarde plat:', err);
      throw err;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="menu-page__loading">
        <div className="menu-page__loading-spinner"></div>
        <p>Chargement du menu...</p>
      </div>
    );
  }

  if (error === 'no_restaurant') {
    return (
      <div className="menu-page__no-restaurant">
        <div className="menu-page__no-restaurant-icon">🍽️</div>
        <h2>Créez d'abord votre restaurant</h2>
        <p>Vous devez créer votre restaurant avant de pouvoir gérer votre menu.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page__error">
        <p>{error}</p>
        <button onClick={fetchData}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-page__header">
        <div>
          <h1>Gestion du menu</h1>
          <p>{categories.length} catégorie{categories.length > 1 ? 's' : ''} • {categories.reduce((acc, cat) => acc + (cat.plats?.length || 0), 0)} plat{categories.reduce((acc, cat) => acc + (cat.plats?.length || 0), 0) > 1 ? 's' : ''}</p>
        </div>
        <button className="menu-page__add-btn" onClick={handleAddCategory}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nouvelle catégorie
        </button>
      </div>

      {/* Liste des catégories */}
      {categories.length === 0 ? (
        <div className="menu-page__empty">
          <div className="menu-page__empty-icon">📋</div>
          <h3>Votre menu est vide</h3>
          <p>Commencez par créer une catégorie pour organiser vos plats</p>
          <button className="menu-page__empty-btn" onClick={handleAddCategory}>
            Créer une catégorie
          </button>
        </div>
      ) : (
        <div className="menu-page__categories">
          {categories.map((category) => (
            <div key={category.id} className="menu-category">
              <div className="menu-category__header">
                <div className="menu-category__info">
                  <h2 className="menu-category__name">{category.nom}</h2>
                  {category.description && (
                    <p className="menu-category__description">{category.description}</p>
                  )}
                  <span className="menu-category__count">
                    {category.plats?.length || 0} plat{(category.plats?.length || 0) > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="menu-category__actions">
                  <button
                    className="menu-category__action"
                    onClick={() => handleAddPlat(category.id)}
                    title="Ajouter un plat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button
                    className="menu-category__action"
                    onClick={() => handleEditCategory(category)}
                    title="Modifier la catégorie"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className="menu-category__action menu-category__action--danger"
                    onClick={() => handleDeleteCategory(category.id)}
                    title="Supprimer la catégorie"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Liste des plats */}
              <div className="menu-category__plats">
                {!category.plats || category.plats.length === 0 ? (
                  <div className="menu-category__plats-empty">
                    <p>Aucun plat dans cette catégorie</p>
                    <button onClick={() => handleAddPlat(category.id)}>
                      + Ajouter un plat
                    </button>
                  </div>
                ) : (
                  category.plats.map((plat) => (
                    <div key={plat.id} className={`menu-plat ${!plat.disponible ? 'menu-plat--unavailable' : ''}`}>
                      {plat.image_url && (
                        <div className="menu-plat__image">
                          <img src={plat.image_url} alt={plat.nom} />
                        </div>
                      )}
                      <div className="menu-plat__content">
                        <div className="menu-plat__header">
                          <h3 className="menu-plat__name">{plat.nom}</h3>
                          <span className="menu-plat__price">{formatPrice(plat.prix)}</span>
                        </div>
                        {plat.description && (
                          <p className="menu-plat__description">{plat.description}</p>
                        )}
                        <div className="menu-plat__footer">
                          <button
                            className={`menu-plat__toggle ${plat.disponible ? 'menu-plat__toggle--active' : ''}`}
                            onClick={() => handleToggleDisponibilite(plat.id)}
                          >
                            {plat.disponible ? '✓ Disponible' : '✗ Indisponible'}
                          </button>
                          <div className="menu-plat__actions">
                            <button
                              className="menu-plat__action"
                              onClick={() => handleEditPlat(plat, category.id)}
                              title="Modifier"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="menu-plat__action menu-plat__action--danger"
                              onClick={() => handleDeletePlat(plat.id)}
                              title="Supprimer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Catégorie */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowCategoryModal(false)}
          onSave={handleSaveCategory}
        />
      )}

      {/* Modal Plat */}
      {showPlatModal && (
        <PlatModal
          plat={editingPlat}
          onClose={() => setShowPlatModal(false)}
          onSave={handleSavePlat}
        />
      )}
    </div>
  );
}

// Modal Catégorie
function CategoryModal({ category, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: category?.nom || '',
    description: category?.description || '',
    ordre: category?.ordre || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          <button onClick={onClose} className="modal__close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="modal__error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field">
            <label>Nom de la catégorie *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Entrées, Plats, Desserts..."
              required
            />
          </div>

          <div className="modal__field">
            <label>Description (optionnel)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Une courte description de la catégorie"
              rows={3}
            />
          </div>

          <div className="modal__actions">
            <button type="button" onClick={onClose} className="modal__btn modal__btn--secondary">
              Annuler
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : category ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Plat
function PlatModal({ plat, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: plat?.nom || '',
    description: plat?.description || '',
    prix: plat?.prix || '',
    image_url: plat?.image_url || '',
    disponible: plat?.disponible ?? true,
    allergenes: plat?.allergenes || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allergenesInput, setAllergenesInput] = useState(
    Array.isArray(plat?.allergenes) ? plat.allergenes.join(', ') : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        prix: parseFloat(formData.prix),
        allergenes: allergenesInput.split(',').map(a => a.trim()).filter(a => a),
      };
      await onSave(dataToSave);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{plat ? 'Modifier le plat' : 'Nouveau plat'}</h2>
          <button onClick={onClose} className="modal__close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="modal__error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__row">
            <div className="modal__field">
              <label>Nom du plat *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Burger Classic"
                required
              />
            </div>
            <div className="modal__field modal__field--small">
              <label>Prix (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                placeholder="12.90"
                required
              />
            </div>
          </div>

          <div className="modal__field">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre plat..."
              rows={3}
            />
          </div>

          <div className="modal__field">
            <label>URL de l'image</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://exemple.com/image.jpg"
            />
            {formData.image_url && (
              <div className="modal__image-preview">
                <img src={formData.image_url} alt="Aperçu" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="modal__field">
            <label>Allergènes (séparés par des virgules)</label>
            <input
              type="text"
              value={allergenesInput}
              onChange={(e) => setAllergenesInput(e.target.value)}
              placeholder="Ex: Gluten, Lactose, Arachides"
            />
          </div>

          <div className="modal__field modal__field--checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.disponible}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
              />
              <span>Disponible à la commande</span>
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" onClick={onClose} className="modal__btn modal__btn--secondary">
              Annuler
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : plat ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestaurantMenuPage;