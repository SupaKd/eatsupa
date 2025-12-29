import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@store/slices/authSlice';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [activeRole, setActiveRole] = useState('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'client',
    // Champs spécifiques restaurateur
    nomRestaurant: '',
    adresse: '',
    ville: '',
    codePostal: '',
    siret: '',
  });

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setFormData({
      ...formData,
      role: role,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Préparer les données selon le rôle
    const dataToSend = {
      email: formData.email,
      password: formData.password,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      role: formData.role,
    };

    // Ajouter les champs spécifiques si restaurateur
    if (formData.role === 'restaurateur') {
      dataToSend.nomRestaurant = formData.nomRestaurant;
      dataToSend.adresse = formData.adresse;
      dataToSend.ville = formData.ville;
      dataToSend.codePostal = formData.codePostal;
      dataToSend.siret = formData.siret;
    }
    
    try {
      await dispatch(register(dataToSend)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Inscription</h1>
          
          {/* Onglets de sélection du rôle */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab ${activeRole === 'client' ? 'active' : ''}`}
              onClick={() => handleRoleChange('client')}
            >
              Client
            </button>
            <button
              type="button"
              className={`role-tab ${activeRole === 'restaurateur' ? 'active' : ''}`}
              onClick={() => handleRoleChange('restaurateur')}
            >
              Restaurateur
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Champs communs */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* Champs spécifiques au restaurateur */}
            {activeRole === 'restaurateur' && (
              <>
                <div className="form-group">
                  <label htmlFor="nomRestaurant">Nom du restaurant</label>
                  <input
                    type="text"
                    id="nomRestaurant"
                    name="nomRestaurant"
                    value={formData.nomRestaurant}
                    onChange={handleChange}
                    placeholder="Le Petit Bistrot"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adresse">Adresse</label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="12 rue de la Paix"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="codePostal">Code postal</label>
                    <input
                      type="text"
                      id="codePostal"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleChange}
                      placeholder="01100"
                      required
                      pattern="[0-9]{5}"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ville">Ville</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      placeholder="Oyonnax"
                      required
                    />
                  </div>
                </div>

               
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          <p className="auth-link">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;