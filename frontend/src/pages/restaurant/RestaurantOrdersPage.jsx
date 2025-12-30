import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  RefreshCw, 
  Flame, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Package, 
  Phone, 
  CreditCard, 
  Banknote, 
  X, 
  Mail,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { commandeAPI } from '@services/api';

function RestaurantOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [selectedCommande, setSelectedCommande] = useState(null);

  const [filter, setFilter] = useState(searchParams.get('statut') || 'actives');

  const fetchCommandes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commandeAPI.getAll();
      if (response.data.success) {
        setCommandes(response.data.data);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchCommandes, 30000);
    return () => clearInterval(interval);
  }, [fetchCommandes]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'actives') {
      searchParams.delete('statut');
    } else {
      searchParams.set('statut', newFilter);
    }
    setSearchParams(searchParams);
  };

  const handleUpdateStatus = async (commandeId, newStatus) => {
    try {
      setUpdating(commandeId);
      await commandeAPI.updateStatus(commandeId, newStatus);
      await fetchCommandes();
      setSelectedCommande(null);
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      en_attente: { label: 'En attente', color: 'yellow', icon: Clock, next: 'confirmee' },
      confirmee: { label: 'Confirmée', color: 'blue', icon: CheckCircle2, next: 'en_preparation' },
      en_preparation: { label: 'En préparation', color: 'orange', icon: ChefHat, next: 'prete' },
      prete: { label: 'Prête', color: 'green', icon: CheckCircle, next: 'recuperee' },
      recuperee: { label: 'Récupérée', color: 'green', icon: Sparkles, next: null },
      annulee: { label: 'Annulée', color: 'red', icon: XCircle, next: null },
    };
    return statusMap[status] || { label: status, color: 'gray', icon: AlertCircle, next: null };
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      en_attente: 'Confirmer',
      confirmee: 'Commencer préparation',
      en_preparation: 'Marquer prête',
      prete: 'Marquer récupérée',
    };
    return labels[currentStatus] || null;
  };

  // Filtrer les commandes
  const filteredCommandes = commandes.filter((c) => {
    if (filter === 'actives') {
      return !['recuperee', 'annulee'].includes(c.statut);
    }
    if (filter === 'terminees') {
      return ['recuperee', 'annulee'].includes(c.statut);
    }
    return c.statut === filter;
  });

  // Grouper par statut pour la vue kanban
  const commandesByStatus = {
    en_attente: filteredCommandes.filter(c => c.statut === 'en_attente'),
    confirmee: filteredCommandes.filter(c => c.statut === 'confirmee'),
    en_preparation: filteredCommandes.filter(c => c.statut === 'en_preparation'),
    prete: filteredCommandes.filter(c => c.statut === 'prete'),
  };

  if (loading && commandes.length === 0) {
    return (
      <div className="restaurant-orders__loading">
        <div className="restaurant-orders__loading-spinner"></div>
        <p>Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-orders">
      {/* Header */}
      <div className="restaurant-orders__header">
        <div>
          <h1>Gestion des commandes</h1>
          <p>{filteredCommandes.length} commande{filteredCommandes.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchCommandes} className="restaurant-orders__refresh" disabled={loading}>
          <RefreshCw size={18} />
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Filtres */}
      <div className="restaurant-orders__filters">
        <button
          className={`restaurant-orders__filter ${filter === 'actives' ? 'restaurant-orders__filter--active' : ''}`}
          onClick={() => handleFilterChange('actives')}
        >
          <Flame size={16} /> Actives
        </button>
        <button
          className={`restaurant-orders__filter ${filter === 'en_attente' ? 'restaurant-orders__filter--active' : ''}`}
          onClick={() => handleFilterChange('en_attente')}
        >
          <Clock size={16} /> En attente
        </button>
        <button
          className={`restaurant-orders__filter ${filter === 'en_preparation' ? 'restaurant-orders__filter--active' : ''}`}
          onClick={() => handleFilterChange('en_preparation')}
        >
          <ChefHat size={16} /> En préparation
        </button>
        <button
          className={`restaurant-orders__filter ${filter === 'prete' ? 'restaurant-orders__filter--active' : ''}`}
          onClick={() => handleFilterChange('prete')}
        >
          <CheckCircle size={16} /> Prêtes
        </button>
        <button
          className={`restaurant-orders__filter ${filter === 'terminees' ? 'restaurant-orders__filter--active' : ''}`}
          onClick={() => handleFilterChange('terminees')}
        >
          <Package size={16} /> Terminées
        </button>
      </div>

      {error && (
        <div className="restaurant-orders__error">
          <p>{error}</p>
          <button onClick={fetchCommandes}>Réessayer</button>
        </div>
      )}

      {/* Vue Kanban pour les commandes actives */}
      {filter === 'actives' && (
        <div className="restaurant-orders__kanban">
          {Object.entries(commandesByStatus).map(([status, orders]) => {
            const statusInfo = getStatusInfo(status);
            const StatusIcon = statusInfo.icon;
            return (
              <div key={status} className="restaurant-orders__column">
                <div className={`restaurant-orders__column-header restaurant-orders__column-header--${statusInfo.color}`}>
                  <span className="restaurant-orders__column-icon">
                    <StatusIcon size={18} />
                  </span>
                  <span className="restaurant-orders__column-title">{statusInfo.label}</span>
                  <span className="restaurant-orders__column-count">{orders.length}</span>
                </div>
                <div className="restaurant-orders__column-content">
                  {orders.length === 0 ? (
                    <div className="restaurant-orders__column-empty">
                      Aucune commande
                    </div>
                  ) : (
                    orders.map((commande) => (
                      <OrderCard
                        key={commande.id}
                        commande={commande}
                        statusInfo={statusInfo}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                        getNextStatusLabel={getNextStatusLabel}
                        onUpdateStatus={handleUpdateStatus}
                        onViewDetails={() => setSelectedCommande(commande)}
                        updating={updating === commande.id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vue liste pour les autres filtres */}
      {filter !== 'actives' && (
        <div className="restaurant-orders__list">
          {filteredCommandes.length === 0 ? (
            <div className="restaurant-orders__empty">
              <div className="restaurant-orders__empty-icon">
                <Package size={48} />
              </div>
              <h3>Aucune commande</h3>
              <p>Aucune commande dans cette catégorie</p>
            </div>
          ) : (
            filteredCommandes.map((commande) => {
              const statusInfo = getStatusInfo(commande.statut);
              return (
                <OrderCard
                  key={commande.id}
                  commande={commande}
                  statusInfo={statusInfo}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                  getNextStatusLabel={getNextStatusLabel}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={() => setSelectedCommande(commande)}
                  updating={updating === commande.id}
                  isListView
                />
              );
            })
          )}
        </div>
      )}

      {/* Modal détails commande */}
      {selectedCommande && (
        <OrderDetailsModal
          commande={selectedCommande}
          onClose={() => setSelectedCommande(null)}
          onUpdateStatus={handleUpdateStatus}
          formatPrice={formatPrice}
          formatDate={formatDate}
          getStatusInfo={getStatusInfo}
          getNextStatusLabel={getNextStatusLabel}
          updating={updating === selectedCommande.id}
        />
      )}
    </div>
  );
}

// Composant carte commande
function OrderCard({ 
  commande, 
  statusInfo, 
  formatPrice, 
  formatDate, 
  getNextStatusLabel, 
  onUpdateStatus, 
  onViewDetails,
  updating,
  isListView = false
}) {
  const nextStatusLabel = getNextStatusLabel(commande.statut);

  return (
    <div className={`order-card-restaurant ${isListView ? 'order-card-restaurant--list' : ''}`}>
      <div className="order-card-restaurant__header">
        <code className="order-card-restaurant__number">{commande.numero_commande}</code>
        <span className="order-card-restaurant__time">{formatDate(commande.date_commande)}</span>
      </div>

      <div className="order-card-restaurant__client">
        <Phone size={14} />
        <a href={`tel:${commande.telephone_client}`}>{commande.telephone_client}</a>
      </div>

      <div className="order-card-restaurant__items">
        {commande.items?.slice(0, 3).map((item, idx) => (
          <div key={idx} className="order-card-restaurant__item">
            <span className="order-card-restaurant__item-qty">{item.quantite}x</span>
            <span className="order-card-restaurant__item-name">{item.nom_plat}</span>
          </div>
        ))}
        {commande.items?.length > 3 && (
          <div className="order-card-restaurant__item-more">
            +{commande.items.length - 3} autre{commande.items.length - 3 > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {commande.notes && (
        <div className="order-card-restaurant__notes">
          <strong>Note:</strong> {commande.notes}
        </div>
      )}

      <div className="order-card-restaurant__footer">
        <div className="order-card-restaurant__payment">
          <span className={`order-card-restaurant__payment-badge ${commande.mode_paiement === 'en_ligne' ? 'order-card-restaurant__payment-badge--online' : ''}`}>
            {commande.mode_paiement === 'en_ligne' ? <CreditCard size={16} /> : <Banknote size={16} />}
          </span>
          {commande.paiement_statut === 'paye' && (
            <span className="order-card-restaurant__payment-status">Payé</span>
          )}
        </div>
        <span className="order-card-restaurant__total">{formatPrice(commande.montant_total)}</span>
      </div>

      <div className="order-card-restaurant__actions">
        <button 
          className="order-card-restaurant__btn order-card-restaurant__btn--secondary"
          onClick={onViewDetails}
        >
          Détails
        </button>
        {nextStatusLabel && (
          <button
            className="order-card-restaurant__btn order-card-restaurant__btn--primary"
            onClick={() => onUpdateStatus(commande.id, statusInfo.next)}
            disabled={updating}
          >
            {updating ? 'Mise à jour...' : nextStatusLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Modal détails
function OrderDetailsModal({ 
  commande, 
  onClose, 
  onUpdateStatus, 
  formatPrice, 
  formatDate, 
  getStatusInfo,
  getNextStatusLabel,
  updating 
}) {
  const statusInfo = getStatusInfo(commande.statut);
  const StatusIcon = statusInfo.icon;
  const nextStatusLabel = getNextStatusLabel(commande.statut);

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal__header">
          <div>
            <h2>Commande {commande.numero_commande}</h2>
            <p>{formatDate(commande.date_commande)}</p>
          </div>
          <button onClick={onClose} className="order-modal__close">
            <X size={24} />
          </button>
        </div>

        <div className="order-modal__content">
          {/* Statut */}
          <div className={`order-modal__status order-modal__status--${statusInfo.color}`}>
            <span className="order-modal__status-icon">
              <StatusIcon size={20} />
            </span>
            <span className="order-modal__status-label">{statusInfo.label}</span>
          </div>

          {/* Client */}
          <div className="order-modal__section">
            <h3>Client</h3>
            <div className="order-modal__client-info">
              <div className="order-modal__client-row">
                <Phone size={16} />
                <a href={`tel:${commande.telephone_client}`}>{commande.telephone_client}</a>
              </div>
              {commande.email_client && (
                <div className="order-modal__client-row">
                  <Mail size={16} />
                  <span>{commande.email_client}</span>
                </div>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="order-modal__section">
            <h3>Articles commandés</h3>
            <div className="order-modal__items">
              {commande.items?.map((item, idx) => (
                <div key={idx} className="order-modal__item">
                  <span className="order-modal__item-qty">{item.quantite}x</span>
                  <span className="order-modal__item-name">{item.nom_plat}</span>
                  <span className="order-modal__item-price">{formatPrice(item.sous_total)}</span>
                </div>
              ))}
            </div>
            <div className="order-modal__total">
              <span>Total</span>
              <span>{formatPrice(commande.montant_total)}</span>
            </div>
          </div>

          {/* Notes */}
          {commande.notes && (
            <div className="order-modal__section">
              <h3>Instructions spéciales</h3>
              <div className="order-modal__notes">
                {commande.notes}
              </div>
            </div>
          )}

          {/* Paiement */}
          <div className="order-modal__section">
            <h3>Paiement</h3>
            <div className="order-modal__payment-info">
              <span className="order-modal__payment-method">
                {commande.mode_paiement === 'en_ligne' ? (
                  <>
                    <CreditCard size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Paiement en ligne
                  </>
                ) : (
                  <>
                    <Banknote size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Paiement sur place
                  </>
                )}
              </span>
              <span className={`order-modal__payment-status order-modal__payment-status--${commande.paiement_statut === 'paye' ? 'paid' : 'pending'}`}>
                {commande.paiement_statut === 'paye' ? (
                  <>
                    <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Payé
                  </>
                ) : (
                  'En attente'
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="order-modal__footer">
          {commande.statut !== 'annulee' && commande.statut !== 'recuperee' && (
            <button
              className="order-modal__btn order-modal__btn--danger"
              onClick={() => onUpdateStatus(commande.id, 'annulee')}
              disabled={updating}
            >
              Annuler la commande
            </button>
          )}
          {nextStatusLabel && (
            <button
              className="order-modal__btn order-modal__btn--primary"
              onClick={() => onUpdateStatus(commande.id, statusInfo.next)}
              disabled={updating}
            >
              {updating ? 'Mise à jour...' : nextStatusLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantOrdersPage;