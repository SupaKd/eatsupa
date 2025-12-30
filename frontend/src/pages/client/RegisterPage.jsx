import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@store/slices/authSlice';
import { useToast } from '@/contexts/ToastContext';
import { Info } from 'lucide-react';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  const [activeRole, setActiveRole] = useState('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'client',
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
    
    try {
      const result = await dispatch(register(formData)).unwrap();
      toast.success('Votre compte a été créé avec succès !', {
        title: 'Bienvenue sur Yumioo',
      });
      
      // Rediriger vers le dashboard approprié selon le rôle
      if (formData.role === 'restaurateur') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err || 'Erreur lors de l\'inscription');
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

          {/* Message d'information pour les restaurateurs */}
          {activeRole === 'restaurateur' && (
            <div className="info-banner">
              <Info size={20} />
              <span>Vous pourrez configurer votre restaurant après l'inscription</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Champs communs - Information personnelle uniquement */}
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
              <span className="form-hint">Minimum 6 caractères</span>
            </div>

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