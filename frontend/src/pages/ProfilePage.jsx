import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile, logout } from '@store/slices/authSlice';
import { authAPI } from '@services/api';

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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Informations personnelles
              </button>
              <button
                className={`profile-sidebar__nav-item ${activeTab === 'security' ? 'profile-sidebar__nav-item--active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Sécurité
              </button>
            </nav>

            <div className="profile-sidebar__footer">
              {user.role === 'admin' && (
                <Link to="/admin" className="profile-sidebar__footer-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Administration
                </Link>
              )}
              <button onClick={handleLogout} className="profile-sidebar__footer-btn profile-sidebar__footer-btn--danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="profile-main">
            {/* Messages */}
            {error && (
              <div className="profile-main__message profile-main__message--error">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="profile-main__message profile-main__message--success">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
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