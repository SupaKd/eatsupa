import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@store/slices/authSlice';
import { useToast } from '@/contexts/ToastContext';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      toast.success(`Bienvenue ${result.user.prenom} !`, {
        title: 'Connexion réussie',
      });
      navigate('/');
    } catch (err) {
      toast.error(err || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Connexion</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-link">
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;