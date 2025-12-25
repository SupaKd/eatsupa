import { useState, useEffect } from 'react';
import { adminAPI } from '@services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit | view
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users.getAll({
        page: pagination.page,
        limit: 20,
        ...filters,
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleViewUser = async (user) => {
    try {
      const response = await adminAPI.users.getById(user.id);
      if (response.data.success) {
        setSelectedUser(response.data.data.user);
        setModalMode('view');
        setShowModal(true);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await adminAPI.users.delete(userId);
      fetchUsers();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowModal(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'red',
      restaurateur: 'orange',
      client: 'blue',
    };
    return colors[role] || 'gray';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      restaurateur: 'Restaurateur',
      client: 'Client',
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Gestion des utilisateurs</h1>
          <p className="admin-page-header__subtitle">
            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleCreateUser} className="admin-page-header__action">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filters__search">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="admin-filters__select"
        >
          <option value="">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="restaurateur">Restaurateurs</option>
          <option value="admin">Administrateurs</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading__spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={fetchUsers}>Réessayer</button>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>Aucun utilisateur trouvé</h3>
          <p>Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Téléphone</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table__user">
                        <div className="admin-table__user-avatar">
                          {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                        </div>
                        <div>
                          <div className="admin-table__user-name">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="admin-table__user-id">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>{user.telephone || '-'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="admin-table__action"
                          title="Voir détails"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="admin-table__action"
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="admin-table__action admin-table__action--danger"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="admin-pagination__btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Précédent
              </button>
              <span className="admin-pagination__info">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
                className="admin-pagination__btn"
              >
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Modal Component
function UserModal({ mode, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    role: user?.role || 'client',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'create') {
        await adminAPI.users.create(formData);
      } else if (mode === 'edit') {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await adminAPI.users.update(user.id, updateData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2>
            {mode === 'create' ? 'Nouvel utilisateur' : 
             mode === 'edit' ? 'Modifier l\'utilisateur' : 
             'Détails de l\'utilisateur'}
          </h2>
          <button onClick={onClose} className="admin-modal__close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && (
          <div className="admin-modal__error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <div className="admin-modal__field">
              <label>Prénom *</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                disabled={isViewMode}
              />
            </div>
            <div className="admin-modal__field">
              <label>Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="admin-modal__field">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isViewMode}
            />
          </div>

          <div className="admin-modal__field">
            <label>Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              disabled={isViewMode}
            />
          </div>

          <div className="admin-modal__field">
            <label>Rôle *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              disabled={isViewMode}
            >
              <option value="client">Client</option>
              <option value="restaurateur">Restaurateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          {!isViewMode && (
            <div className="admin-modal__field">
              <label>
                {mode === 'create' ? 'Mot de passe *' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={mode === 'create'}
                minLength={6}
              />
            </div>
          )}

          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__btn admin-modal__btn--secondary">
              {isViewMode ? 'Fermer' : 'Annuler'}
            </button>
            {!isViewMode && (
              <button type="submit" className="admin-modal__btn admin-modal__btn--primary" disabled={loading}>
                {loading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUsersPage;