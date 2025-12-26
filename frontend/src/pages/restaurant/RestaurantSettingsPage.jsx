import { useState, useEffect } from 'react';
import { restaurantAPI } from '@services/api';

function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Formulaire général
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type_cuisine: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    image: '',
    delai_preparation: 30,
  });

  // Horaires
  const [horaires, setHoraires] = useState({
    lundi: { ouvert: false, horaires: [{ debut: '11:30', fin: '14:30' }, { debut: '18:30', fin: '22:00' }] },
    mardi: { ouvert: true, horaires: [{ debut: '11:30', fin: '14:30' }, { debut: '18:30', fin: '22:00' }] },
    mercredi: { ouvert: true, horaires: [{ debut: '11:30', fin: '14:30' }, { debut: '18:30', fin: '22:00' }] },
    jeudi: { ouvert: true, horaires: [{ debut: '11:30', fin: '14:30' }, { debut: '18:30', fin: '22:00' }] },
    vendredi: { ouvert: true, horaires: [{ debut: '11:30', fin: '14:30' }, { debut: '18:30', fin: '23:00' }] },
    samedi: { ouvert: true, horaires: [{ debut: '11:30', fin: '14:30' }, { debut: '18:30', fin: '23:00' }] },
    dimanche: { ouvert: false, horaires: [{ debut: '11:30', fin: '14:30' }] },
  });

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await restaurantAPI.getMyRestaurant();
      if (response.data.success && response.data.data.restaurant) {
        const resto = response.data.data.restaurant;
        setRestaurant(resto);
        
        setFormData({
          nom: resto.nom || '',
          description: resto.description || '',
          type_cuisine: resto.type_cuisine || '',
          adresse: resto.adresse || '',
          code_postal: resto.code_postal || '',
          ville: resto.ville || '',
          telephone: resto.telephone || '',
          email: resto.email || '',
          image: resto.image || '',
          delai_preparation: resto.delai_preparation || 30,
        });

        if (resto.horaires_ouverture) {
          const h = typeof resto.horaires_ouverture === 'string' 
            ? JSON.parse(resto.horaires_ouverture) 
            : resto.horaires_ouverture;
          setHoraires(h);
        }
      }
    } catch (err) {
      console.error('Erreur chargement restaurant:', err);
      if (err.response?.data?.code === 'NO_RESTAURANT') {
        setError('no_restaurant');
      } else {
        setError('Impossible de charger les informations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(null);
  };

  const handleHoraireChange = (jour, field, value, index = null) => {
    setHoraires(prev => {
      const newHoraires = { ...prev };
      if (field === 'ouvert') {
        newHoraires[jour] = { ...newHoraires[jour], ouvert: value };
      } else if (index !== null) {
        newHoraires[jour].horaires[index] = {
          ...newHoraires[jour].horaires[index],
          [field]: value
        };
      }
      return newHoraires;
    });
    setSuccess(null);
  };

  const handleSubmitGeneral = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      if (restaurant) {
        await restaurantAPI.update(restaurant.id, formData);
      } else {
        await restaurantAPI.create(formData);
      }
      setSuccess('Informations enregistrées avec succès');
      await fetchRestaurant();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitHoraires = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await restaurantAPI.update(restaurant.id, {
        horaires_ouverture: horaires
      });
      setSuccess('Horaires enregistrés avec succès');
      await fetchRestaurant();
    } catch (err) {
      console.error('Erreur sauvegarde horaires:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const typesCuisine = [
    'Français', 'Italien', 'Asiatique', 'Japonais', 'Chinois', 'Thaï',
    'Mexicain', 'Indien', 'Libanais', 'Burgers', 'Pizza', 'Sushi',
    'Healthy', 'Végétarien', 'Fast-food', 'Autre'
  ];

  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  if (loading) {
    return (
      <div className="settings-page__loading">
        <div className="settings-page__loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-page__header">
        <h1>{restaurant ? 'Paramètres du restaurant' : 'Créer mon restaurant'}</h1>
        <p>{restaurant ? 'Gérez les informations de votre établissement' : 'Configurez votre restaurant pour commencer à recevoir des commandes'}</p>
      </div>

      {/* Tabs */}
      <div className="settings-page__tabs">
        <button
          className={`settings-page__tab ${activeTab === 'general' ? 'settings-page__tab--active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Informations générales
        </button>
        {restaurant && (
          <button
            className={`settings-page__tab ${activeTab === 'horaires' ? 'settings-page__tab--active' : ''}`}
            onClick={() => setActiveTab('horaires')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Horaires d'ouverture
          </button>
        )}
      </div>

      {/* Messages */}
      {error && error !== 'no_restaurant' && (
        <div className="settings-page__message settings-page__message--error">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="settings-page__message settings-page__message--success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}

      {/* Contenu */}
      <div className="settings-page__content">
        {/* Tab Général */}
        {activeTab === 'general' && (
          <form onSubmit={handleSubmitGeneral} className="settings-form">
            <div className="settings-form__section">
              <h2>Identité du restaurant</h2>
              
              <div className="settings-form__row">
                <div className="settings-form__field">
                  <label>Nom du restaurant *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Le nom de votre établissement"
                    required
                  />
                </div>
                <div className="settings-form__field">
                  <label>Type de cuisine</label>
                  <select
                    name="type_cuisine"
                    value={formData.type_cuisine}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner...</option>
                    {typesCuisine.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="settings-form__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre restaurant en quelques mots..."
                  rows={3}
                />
              </div>

              <div className="settings-form__field">
                <label>URL de l'image de couverture</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://exemple.com/image.jpg"
                />
                {formData.image && (
                  <div className="settings-form__image-preview">
                    <img src={formData.image} alt="Aperçu" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
            </div>

            <div className="settings-form__section">
              <h2>Adresse</h2>
              
              <div className="settings-form__field">
                <label>Adresse *</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Numéro et nom de rue"
                  required
                />
              </div>

              <div className="settings-form__row">
                <div className="settings-form__field settings-form__field--small">
                  <label>Code postal *</label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleChange}
                    placeholder="75001"
                    required
                  />
                </div>
                <div className="settings-form__field">
                  <label>Ville *</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    placeholder="Paris"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="settings-form__section">
              <h2>Contact</h2>
              
              <div className="settings-form__row">
                <div className="settings-form__field">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div className="settings-form__field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@restaurant.fr"
                  />
                </div>
              </div>
            </div>

            <div className="settings-form__section">
              <h2>Paramètres de commande</h2>
              
              <div className="settings-form__field settings-form__field--small">
                <label>Délai de préparation moyen (minutes)</label>
                <input
                  type="number"
                  name="delai_preparation"
                  value={formData.delai_preparation}
                  onChange={handleChange}
                  min="5"
                  max="120"
                />
                <span className="settings-form__hint">Temps estimé pour préparer une commande</span>
              </div>
            </div>

            <div className="settings-form__actions">
              <button type="submit" className="settings-form__submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="settings-form__spinner"></span>
                    Enregistrement...
                  </>
                ) : (
                  restaurant ? 'Enregistrer les modifications' : 'Créer mon restaurant'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab Horaires */}
        {activeTab === 'horaires' && restaurant && (
          <form onSubmit={handleSubmitHoraires} className="settings-form">
            <div className="settings-form__section">
              <h2>Horaires d'ouverture</h2>
              <p className="settings-form__section-desc">
                Configurez les horaires pendant lesquels votre restaurant accepte les commandes
              </p>

              <div className="horaires-grid">
                {jours.map((jour) => (
                  <div key={jour} className="horaire-row">
                    <div className="horaire-row__day">
                      <label className="horaire-row__toggle">
                        <input
                          type="checkbox"
                          checked={horaires[jour]?.ouvert || false}
                          onChange={(e) => handleHoraireChange(jour, 'ouvert', e.target.checked)}
                        />
                        <span className="horaire-row__toggle-slider"></span>
                      </label>
                      <span className="horaire-row__day-name">
                        {jour.charAt(0).toUpperCase() + jour.slice(1)}
                      </span>
                    </div>

                    {horaires[jour]?.ouvert ? (
                      <div className="horaire-row__slots">
                        {horaires[jour]?.horaires?.map((slot, index) => (
                          <div key={index} className="horaire-slot">
                            <input
                              type="time"
                              value={slot.debut}
                              onChange={(e) => handleHoraireChange(jour, 'debut', e.target.value, index)}
                            />
                            <span>à</span>
                            <input
                              type="time"
                              value={slot.fin}
                              onChange={(e) => handleHoraireChange(jour, 'fin', e.target.value, index)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="horaire-row__closed">Fermé</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-form__actions">
              <button type="submit" className="settings-form__submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="settings-form__spinner"></span>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les horaires'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestaurantSettingsPage;