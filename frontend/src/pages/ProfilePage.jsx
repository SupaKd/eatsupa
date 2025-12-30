import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile, logout } from '@store/slices/authSlice';
import { authAPI } from '@services/api';
import {
  ArrowLeft,
  User,
  Lock,
  Settings,
  LogOut,
  AlertCircle,
  CheckCircle,
  Edit3
} from 'lucide-react';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('infos');
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  // Formulaire infos personnelles
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
  });

  // Formulaire changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: user.telephone || '',
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);
      await dispatch(updateProfile(formData)).unwrap();
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (err) {
      setError(err || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Vérifier la longueur du mot de passe
    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      telephone: user.telephone || '',
    });
    setError(null);
    setSuccess(null);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-page__container">
        {/* Header */}
        <div className="profile-page__header">
          <Link to="/" className="profile-page__back">
            <ArrowLeft size={20} />
            Retour
          </Link>
          <h1>Mon profil</h1>
        </div>

        <div className="profile-page__content">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-sidebar__user">
              <div className="profile-sidebar__avatar">
                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
              </div>
              <div className="profile-sidebar__info">
                <h3>{user.prenom} {user.nom}</h3>
                <p>{user.email}</p>
                <span className="profile-sidebar__role">
                  {user.role === 'client' ? 'Client' : user.role === 'restaurateur' ? 'Restaurateur' : 'Administrateur'}
                </span>
              </div>
            </div>

            <nav className="profile-sidebar__nav">
              <button
                className={`profile-sidebar__nav-item ${activeTab === 'infos' ? 'profile-sidebar__nav-item--active' : ''}`}
                onClick={() => setActiveTab('infos')}
              >
                <User size={18} />
                Informations personnelles
              </button>
              <button
                className={`profile-sidebar__nav-item ${activeTab === 'security' ? 'profile-sidebar__nav-item--active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Lock size={18} />
                Sécurité
              </button>
            </nav>

            <div className="profile-sidebar__footer">
              {user.role === 'admin' && (
                <Link to="/admin" className="profile-sidebar__footer-btn">
                  <Settings size={18} />
                  Administration
                </Link>
              )}
              <button onClick={handleLogout} className="profile-sidebar__footer-btn profile-sidebar__footer-btn--danger">
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="profile-main">
            {/* Messages */}
            {error && (
              <div className="profile-main__message profile-main__message--error">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {success && (
              <div className="profile-main__message profile-main__message--success">
                <CheckCircle size={20} />
                {success}
              </div>
            )}

            {/* Informations personnelles */}
            {activeTab === 'infos' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2>Informations personnelles</h2>
                  {!editMode && (
                    <button
                      className="profile-section__edit-btn"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit3 size={18} />
                      Modifier
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitProfile} className="profile-form">
                  <div className="profile-form__group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="profile-form__input--disabled"
                    />
                    <span className="profile-form__hint">
                      L'email ne peut pas être modifié
                    </span>
                  </div>

                  <div className="profile-form__row">
                    <div className="profile-form__group">
                      <label htmlFor="nom">Nom</label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                      />
                    </div>

                    <div className="profile-form__group">
                      <label htmlFor="prenom">Prénom</label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  {editMode && (
                    <div className="profile-form__actions">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="profile-form__btn profile-form__btn--secondary"
                        disabled={saving}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="profile-form__btn profile-form__btn--primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="profile-form__btn-spinner"></span>
                            Enregistrement...
                          </>
                        ) : (
                          'Enregistrer les modifications'
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Sécurité */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2>Changer le mot de passe</h2>
                </div>

                <form onSubmit={handleSubmitPassword} className="profile-form">
                  <div className="profile-form__group">
                    <label htmlFor="currentPassword">Mot de passe actuel</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="newPassword">Nouveau mot de passe</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <span className="profile-form__hint">
                      Au moins 6 caractères
                    </span>
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="profile-form__actions">
                    <button
                      type="submit"
                      className="profile-form__btn profile-form__btn--primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="profile-form__btn-spinner"></span>
                          Enregistrement...
                        </>
                      ) : (
                        'Changer le mot de passe'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;