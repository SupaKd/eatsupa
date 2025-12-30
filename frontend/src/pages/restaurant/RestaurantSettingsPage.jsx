import { useState, useEffect } from 'react';
import { 
  Home, 
  Truck, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Check, 
  Info,
  UserRound,
  Car
} from 'lucide-react';
import { restaurantAPI } from '../../services/api';
import uploadService from '../../services/uploadService';
import ImageUpload from '../../components/ImageUpload';

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

  // Paramètres de livraison
  const [livraisonData, setLivraisonData] = useState({
    livraison_active: false,
    a_emporter_active: true,
    frais_livraison: 2.50,
    zone_livraison_km: 5,
    minimum_livraison: 15,
    delai_livraison: 45,
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

        setLivraisonData({
          livraison_active: resto.livraison_active || false,
          a_emporter_active: resto.a_emporter_active !== false,
          frais_livraison: parseFloat(resto.frais_livraison) || 2.50,
          zone_livraison_km: parseFloat(resto.zone_livraison_km) || 5,
          minimum_livraison: parseFloat(resto.minimum_livraison) || 15,
          delai_livraison: resto.delai_livraison || 45,
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

  const handleImageChange = (imageUrl) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setSuccess(null);
  };

  const handleImageUpload = async (file) => {
    try {
      const imageUrl = await uploadService.uploadImage(file);
      return imageUrl;
    } catch (err) {
      console.error('Erreur upload image:', err);
      throw new Error("Impossible d'uploader l'image. Veuillez réessayer.");
    }
  };

  const handleLivraisonChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLivraisonData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

    console.log('Données à sauvegarder:', formData);
    console.log('Image URL:', formData.image);

    try {
      if (restaurant) {
        const response = await restaurantAPI.update(restaurant.id, formData);
        console.log('Réponse update:', response);
      } else {
        const response = await restaurantAPI.create(formData);
        console.log('Réponse create:', response);
      }
      setSuccess('Informations enregistrées avec succès');
      await fetchRestaurant();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      console.error('Détails:', err.response?.data);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitLivraison = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!livraisonData.livraison_active && !livraisonData.a_emporter_active) {
      setError('Vous devez activer au moins un mode de retrait (à emporter ou livraison)');
      return;
    }

    setSaving(true);

    try {
      await restaurantAPI.update(restaurant.id, {
        livraison_active: livraisonData.livraison_active,
        a_emporter_active: livraisonData.a_emporter_active,
        frais_livraison: parseFloat(livraisonData.frais_livraison) || 0,
        zone_livraison_km: parseFloat(livraisonData.zone_livraison_km) || 5,
        minimum_livraison: parseFloat(livraisonData.minimum_livraison) || 0,
        delai_livraison: parseInt(livraisonData.delai_livraison) || 45,
      });
      setSuccess('Paramètres de livraison enregistrés avec succès');
      await fetchRestaurant();
    } catch (err) {
      console.error('Erreur sauvegarde livraison:', err);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
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
          <Home size={18} />
          Informations générales
        </button>
        {restaurant && (
          <>
            <button
              className={`settings-page__tab ${activeTab === 'livraison' ? 'settings-page__tab--active' : ''}`}
              onClick={() => setActiveTab('livraison')}
            >
              <Truck size={18} />
              Livraison
            </button>
            <button
              className={`settings-page__tab ${activeTab === 'horaires' ? 'settings-page__tab--active' : ''}`}
              onClick={() => setActiveTab('horaires')}
            >
              <Clock size={18} />
              Horaires
            </button>
          </>
        )}
      </div>

      {/* Messages */}
      {error && error !== 'no_restaurant' && (
        <div className="settings-page__message settings-page__message--error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="settings-page__message settings-page__message--success">
          <CheckCircle size={20} />
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
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Le nom de votre établissement" required />
                </div>
                <div className="settings-form__field">
                  <label>Type de cuisine</label>
                  <select name="type_cuisine" value={formData.type_cuisine} onChange={handleChange}>
                    <option value="">Sélectionner...</option>
                    {typesCuisine.map(type => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
              </div>

              <div className="settings-form__field">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Décrivez votre restaurant..." rows={3} />
              </div>

              <div className="settings-form__field">
                <label>Photo de couverture</label>
                <ImageUpload
                  value={formData.image}
                  onChange={handleImageChange}
                  onUpload={handleImageUpload}
                  placeholder="Glissez-déposez une photo ou cliquez pour sélectionner"
                  maxSize={5}
                />
                <span className="settings-form__hint">
                  Cette image sera affichée sur la page de votre restaurant
                </span>
              </div>
            </div>

            <div className="settings-form__section">
              <h2>Adresse</h2>
              <div className="settings-form__field">
                <label>Adresse *</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Numéro et nom de rue" required />
              </div>
              <div className="settings-form__row">
                <div className="settings-form__field settings-form__field--small">
                  <label>Code postal *</label>
                  <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} placeholder="75001" required />
                </div>
                <div className="settings-form__field">
                  <label>Ville *</label>
                  <input type="text" name="ville" value={formData.ville} onChange={handleChange} placeholder="Paris" required />
                </div>
              </div>
            </div>

            <div className="settings-form__section">
              <h2>Contact</h2>
              <div className="settings-form__row">
                <div className="settings-form__field">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="01 23 45 67 89" />
                </div>
                <div className="settings-form__field">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@restaurant.fr" />
                </div>
              </div>
            </div>

            <div className="settings-form__section">
              <h2>Préparation</h2>
              <div className="settings-form__field settings-form__field--small">
                <label>Délai de préparation (minutes)</label>
                <input type="number" name="delai_preparation" value={formData.delai_preparation} onChange={handleChange} min="5" max="120" />
                <span className="settings-form__hint">Temps estimé pour préparer une commande</span>
              </div>
            </div>

            <div className="settings-form__actions">
              <button type="submit" className="settings-form__submit" disabled={saving}>
                {saving ? 'Enregistrement...' : (restaurant ? 'Enregistrer' : 'Créer mon restaurant')}
              </button>
            </div>
          </form>
        )}

        {/* Tab Livraison */}
        {activeTab === 'livraison' && restaurant && (
          <form onSubmit={handleSubmitLivraison} className="settings-form">
            <div className="settings-form__section">
              <h2>Modes de retrait</h2>
              <p className="settings-form__section-desc">Choisissez comment vos clients peuvent récupérer leurs commandes</p>

              <div className="settings-form__toggle-group">
                <label className={`settings-form__toggle-card ${livraisonData.a_emporter_active ? 'settings-form__toggle-card--active' : ''}`}>
                  <input type="checkbox" name="a_emporter_active" checked={livraisonData.a_emporter_active} onChange={handleLivraisonChange} />
                  <div className="settings-form__toggle-card-content">
                    <span className="settings-form__toggle-card-icon">
                      <UserRound size={24} />
                    </span>
                    <div className="settings-form__toggle-card-text">
                      <strong>À emporter</strong>
                      <span>Les clients récupèrent leur commande au restaurant</span>
                    </div>
                    <div className={`settings-form__toggle-card-check ${livraisonData.a_emporter_active ? 'active' : ''}`}>
                      <Check size={20} strokeWidth={3} />
                    </div>
                  </div>
                </label>

                <label className={`settings-form__toggle-card ${livraisonData.livraison_active ? 'settings-form__toggle-card--active' : ''}`}>
                  <input type="checkbox" name="livraison_active" checked={livraisonData.livraison_active} onChange={handleLivraisonChange} />
                  <div className="settings-form__toggle-card-content">
                    <span className="settings-form__toggle-card-icon">
                      <Car size={24} />
                    </span>
                    <div className="settings-form__toggle-card-text">
                      <strong>Livraison</strong>
                      <span>Vous livrez les commandes à l'adresse du client</span>
                    </div>
                    <div className={`settings-form__toggle-card-check ${livraisonData.livraison_active ? 'active' : ''}`}>
                      <Check size={20} strokeWidth={3} />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {livraisonData.livraison_active && (
              <div className="settings-form__section">
                <h2>Paramètres de livraison</h2>

                <div className="settings-form__row">
                  <div className="settings-form__field">
                    <label>Frais de livraison (€)</label>
                    <input
                      type="number"
                      name="frais_livraison"
                      value={livraisonData.frais_livraison}
                      onChange={handleLivraisonChange}
                      min="0"
                      max="20"
                      step="0.50"
                    />
                    <span className="settings-form__hint">Frais facturés au client pour la livraison</span>
                  </div>
                  <div className="settings-form__field">
                    <label>Zone de livraison (km)</label>
                    <input
                      type="number"
                      name="zone_livraison_km"
                      value={livraisonData.zone_livraison_km}
                      onChange={handleLivraisonChange}
                      min="1"
                      max="50"
                      step="0.5"
                    />
                    <span className="settings-form__hint">Rayon maximum de livraison autour du restaurant</span>
                  </div>
                </div>

                <div className="settings-form__row">
                  <div className="settings-form__field">
                    <label>Commande minimum (€)</label>
                    <input
                      type="number"
                      name="minimum_livraison"
                      value={livraisonData.minimum_livraison}
                      onChange={handleLivraisonChange}
                      min="0"
                      max="100"
                      step="1"
                    />
                    <span className="settings-form__hint">Montant minimum pour pouvoir commander en livraison (0 = pas de minimum)</span>
                  </div>
                  <div className="settings-form__field">
                    <label>Délai de livraison (minutes)</label>
                    <input
                      type="number"
                      name="delai_livraison"
                      value={livraisonData.delai_livraison}
                      onChange={handleLivraisonChange}
                      min="15"
                      max="120"
                    />
                    <span className="settings-form__hint">Temps estimé entre la commande et la livraison</span>
                  </div>
                </div>

                <div className="settings-form__info-box">
                  <Info size={20} />
                  <div>
                    <strong>Résumé de votre configuration</strong>
                    <p>
                      Livraison dans un rayon de <strong>{livraisonData.zone_livraison_km} km</strong> • 
                      Frais de <strong>{formatPrice(livraisonData.frais_livraison)}</strong> • 
                      Minimum de commande: <strong>{formatPrice(livraisonData.minimum_livraison)}</strong> • 
                      Délai estimé: <strong>{livraisonData.delai_livraison} min</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-form__actions">
              <button type="submit" className="settings-form__submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les paramètres de livraison'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Horaires */}
        {activeTab === 'horaires' && restaurant && (
          <form onSubmit={handleSubmitHoraires} className="settings-form">
            <div className="settings-form__section">
              <h2>Horaires d'ouverture</h2>
              <p className="settings-form__section-desc">Configurez les horaires pendant lesquels votre restaurant accepte les commandes</p>

              <div className="horaires-grid">
                {jours.map((jour) => (
                  <div key={jour} className="horaire-row">
                    <div className="horaire-row__day">
                      <label className="horaire-row__toggle">
                        <input type="checkbox" checked={horaires[jour]?.ouvert || false} onChange={(e) => handleHoraireChange(jour, 'ouvert', e.target.checked)} />
                        <span className="horaire-row__toggle-slider"></span>
                      </label>
                      <span className="horaire-row__day-name">{jour.charAt(0).toUpperCase() + jour.slice(1)}</span>
                    </div>

                    {horaires[jour]?.ouvert ? (
                      <div className="horaire-row__slots">
                        {horaires[jour]?.horaires?.map((slot, index) => (
                          <div key={index} className="horaire-slot">
                            <input type="time" value={slot.debut} onChange={(e) => handleHoraireChange(jour, 'debut', e.target.value, index)} />
                            <span>à</span>
                            <input type="time" value={slot.fin} onChange={(e) => handleHoraireChange(jour, 'fin', e.target.value, index)} />
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
                {saving ? 'Enregistrement...' : 'Enregistrer les horaires'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestaurantSettingsPage;