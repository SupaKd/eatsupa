import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commandeAPI } from '@services/api';

function AdminOrdersPage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    statut: '',
    paiement_statut: '',
    restaurant_id: '',
    search: '',
  });

  useEffect(() => {
    fetchCommandes();
  }, [pagination.page, filters]);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      };

      const response = await commandeAPI.getAll(params);
      if (response.data.success) {
        setCommandes(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      statut: '',
      paiement_statut: '',
      restaurant_id: '',
      search: '',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      en_attente: { label: 'En attente', color: 'yellow', icon: '⏳' },
      confirmee: { label: 'Confirmée', color: 'blue', icon: '✓' },
      en_preparation: { label: 'En préparation', color: 'orange', icon: '👨‍🍳' },
      prete: { label: 'Prête', color: 'green', icon: '✅' },
      livree: { label: 'Livrée', color: 'green', icon: '🚗' },
      recuperee: { label: 'Récupérée', color: 'green', icon: '🎉' },
      annulee: { label: 'Annulée', color: 'red', icon: '❌' },
    };
    return statusMap[status] || { label: status, color: 'gray', icon: '?' };
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      en_attente: { label: 'En attente', color: 'yellow' },
      paye: { label: 'Payé', color: 'green' },
      echoue: { label: 'Échoué', color: 'red' },
      rembourse: { label: 'Remboursé', color: 'blue' },
    };
    return statusMap[status] || { label: status, color: 'gray' };
  };

  return (
    <div className="admin-orders">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Gestion des commandes</h1>
          <p className="admin-page__subtitle">
            {pagination.total} commande{pagination.total > 1 ? 's' : ''} au total
          </p>
        </div>
        <button onClick={fetchCommandes} className="admin-btn admin-btn--secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="admin-filters">
        <div className="admin-filters__row">
          <div className="admin-filter">
            <label>Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="en_preparation">En préparation</option>
              <option value="prete">Prête</option>
              <option value="livree">Livrée</option>
              <option value="recuperee">Récupérée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>

          <div className="admin-filter">
            <label>Paiement</label>
            <select
              value={filters.paiement_statut}
              onChange={(e) => handleFilterChange('paiement_statut', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="paye">Payé</option>
              <option value="echoue">Échoué</option>
              <option value="rembourse">Remboursé</option>
            </select>
          </div>

          <div className="admin-filter admin-filter--grow">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="N° commande, email, téléphone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {(filters.statut || filters.paiement_statut || filters.search) && (
            <button onClick={clearFilters} className="admin-filter__clear">
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-page__loading">
          <div className="admin-page__loading-spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      ) : error ? (
        <div className="admin-page__error">
          <p>{error}</p>
          <button onClick={fetchCommandes}>Réessayer</button>
        </div>
      ) : commandes.length === 0 ? (
        <div className="admin-page__empty">
          <div className="admin-page__empty-icon">📦</div>
          <h3>Aucune commande</h3>
          <p>Aucune commande ne correspond aux critères</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Restaurant</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Mode</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((commande) => {
                  const statusInfo = getStatusInfo(commande.statut);
                  const paymentStatus = getPaymentStatusBadge(commande.paiement_statut);
                  
                  return (
                    <tr key={commande.id}>
                      <td>
                        <code className="admin-table__code">{commande.numero_commande}</code>
                      </td>
                      <td>
                        <div className="admin-table__restaurant">
                          {commande.restaurant_nom}
                        </div>
                      </td>
                      <td>
                        <div className="admin-table__client">
                          {commande.client_nom && commande.client_prenom ? (
                            <>
                              <div className="admin-table__client-name">
                                {commande.client_prenom} {commande.client_nom}
                              </div>
                              <div className="admin-table__client-email">
                                {commande.client_email}
                              </div>
                            </>
                          ) : (
                            <div className="admin-table__client-guest">
                              Client invité
                              <br />
                              {commande.telephone_client}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="admin-table__date">
                        {formatDate(commande.date_commande)}
                      </td>
                      <td className="admin-table__price">
                        {formatPrice(commande.montant_total)}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${commande.mode_paiement === 'en_ligne' ? 'purple' : 'gray'}`}>
                          {commande.mode_paiement === 'en_ligne' ? '💳 En ligne' : '💵 Sur place'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <Link
                            to={`/commande/${commande.id}/confirmation`}
                            className="admin-table__action"
                            title="Voir les détails"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-pagination__btn"
                disabled={!pagination.hasPrev}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Précédent
              </button>

              <div className="admin-pagination__info">
                Page {pagination.page} sur {pagination.totalPages}
              </div>

              <button
                className="admin-pagination__btn"
                disabled={!pagination.hasNext}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminOrdersPage;