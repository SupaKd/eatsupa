// src/pages/restaurant/RestaurantOrdersPage.jsx - Version optimisée
// Réduit de ~450 lignes à ~250 lignes grâce aux composants réutilisables

import { useState, useEffect, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Flame, Clock, ChefHat, CheckCircle, Package, Phone, X, Mail } from 'lucide-react';
import { commandeAPI } from '@services/api';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { getOrderStatus, isOrderActive } from '@/utils/statusConfig';
import { Button, IconButton } from '../../components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { usePolling } from '@/hooks';

// Composant carte commande mémoïsé
const OrderCard = memo(function OrderCard({ 
  commande, 
  onUpdateStatus, 
  onViewDetails,
  updating,
  isListView = false
}) {
  const statusInfo = getOrderStatus(commande.statut);

  return (
    <div className={`order-card-restaurant ${isListView ? 'order-card-restaurant--list' : ''}`}>
      <div className="order-card-restaurant__header">
        <code className="order-card-restaurant__number">{commande.numero_commande}</code>
        <span className="order-card-restaurant__time">{formatDateTime(commande.date_commande)}</span>
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
        <PaymentStatusBadge status={commande.paiement_statut} size="sm" />
        <span className="order-card-restaurant__total">{formatPrice(commande.montant_total)}</span>
      </div>

      <div className="order-card-restaurant__actions">
        <Button variant="secondary" size="sm" onClick={onViewDetails}>
          Détails
        </Button>
        {statusInfo.nextLabel && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUpdateStatus(commande.id, statusInfo.next)}
            loading={updating}
          >
            {statusInfo.nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
});

// Modal détails optimisé
const OrderDetailsModal = memo(function OrderDetailsModal({ 
  commande, 
  onClose, 
  onUpdateStatus, 
  updating 
}) {
  if (!commande) return null;
  
  const statusInfo = getOrderStatus(commande.statut);

  return (
    <Modal
      isOpen={!!commande}
      onClose={onClose}
      title={`Commande ${commande.numero_commande}`}
      size="lg"
      footer={
        <div className="order-modal__footer">
          {commande.statut !== 'annulee' && commande.statut !== 'recuperee' && (
            <Button
              variant="danger"
              onClick={() => onUpdateStatus(commande.id, 'annulee')}
              loading={updating}
            >
              Annuler la commande
            </Button>
          )}
          {statusInfo.nextLabel && (
            <Button
              variant="primary"
              onClick={() => onUpdateStatus(commande.id, statusInfo.next)}
              loading={updating}
            >
              {statusInfo.nextLabel}
            </Button>
          )}
        </div>
      }
    >
      <OrderStatusBadge status={commande.statut} size="lg" />

      <div className="order-modal__section">
        <h3>Client</h3>
        <p><Phone size={16} /> <a href={`tel:${commande.telephone_client}`}>{commande.telephone_client}</a></p>
        {commande.email_client && <p><Mail size={16} /> {commande.email_client}</p>}
      </div>

      <div className="order-modal__section">
        <h3>Articles commandés</h3>
        {commande.items?.map((item, idx) => (
          <div key={idx} className="order-modal__item">
            <span>{item.quantite}x {item.nom_plat}</span>
            <span>{formatPrice(item.sous_total)}</span>
          </div>
        ))}
        <div className="order-modal__total">
          <span>Total</span>
          <span>{formatPrice(commande.montant_total)}</span>
        </div>
      </div>

      {commande.notes && (
        <div className="order-modal__section">
          <h3>Instructions spéciales</h3>
          <p>{commande.notes}</p>
        </div>
      )}
    </Modal>
  );
});

// Filtres
const FILTERS = [
  { key: 'actives', label: 'Actives', icon: Flame },
  { key: 'en_attente', label: 'En attente', icon: Clock },
  { key: 'en_preparation', label: 'En préparation', icon: ChefHat },
  { key: 'prete', label: 'Prêtes', icon: CheckCircle },
  { key: 'terminees', label: 'Terminées', icon: Package },
];

// Page principale
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
      setError(null);
      const response = await commandeAPI.getAll();
      if (response.data.success) {
        setCommandes(response.data.data);
      }
    } catch (err) {
      setError('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  // Polling automatique toutes les 30 secondes
  usePolling(fetchCommandes, 30000, !loading);

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'actives') {
      searchParams.delete('statut');
    } else {
      searchParams.set('statut', newFilter);
    }
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const handleUpdateStatus = useCallback(async (commandeId, newStatus) => {
    setUpdating(commandeId);
    try {
      await commandeAPI.updateStatus(commandeId, newStatus);
      await fetchCommandes();
      setSelectedCommande(null);
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  }, [fetchCommandes]);

  // Filtrer les commandes
  const filteredCommandes = commandes.filter((c) => {
    if (filter === 'actives') return isOrderActive(c.statut);
    if (filter === 'terminees') return !isOrderActive(c.statut);
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
    return <LoadingState message="Chargement des commandes..." />;
  }

  return (
    <div className="restaurant-orders">
      {/* Header */}
      <div className="restaurant-orders__header">
        <div>
          <h1>Gestion des commandes</h1>
          <p>{filteredCommandes.length} commande{filteredCommandes.length > 1 ? 's' : ''}</p>
        </div>
        <Button 
          variant="secondary" 
          icon={RefreshCw} 
          onClick={fetchCommandes} 
          loading={loading}
        >
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <div className="restaurant-orders__filters">
        {FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`restaurant-orders__filter ${filter === key ? 'restaurant-orders__filter--active' : ''}`}
            onClick={() => handleFilterChange(key)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="restaurant-orders__error">
          <p>{error}</p>
          <Button onClick={fetchCommandes}>Réessayer</Button>
        </div>
      )}

      {/* Vue Kanban pour les commandes actives */}
      {filter === 'actives' && (
        <div className="restaurant-orders__kanban">
          {Object.entries(commandesByStatus).map(([status, orders]) => {
            const statusInfo = getOrderStatus(status);
            return (
              <div key={status} className="restaurant-orders__column">
                <div className={`restaurant-orders__column-header restaurant-orders__column-header--${statusInfo.color}`}>
                  <span className="restaurant-orders__column-title">{statusInfo.label}</span>
                  <span className="restaurant-orders__column-count">{orders.length}</span>
                </div>
                <div className="restaurant-orders__column-content">
                  {orders.length === 0 ? (
                    <div className="restaurant-orders__column-empty">Aucune commande</div>
                  ) : (
                    orders.map((commande) => (
                      <OrderCard
                        key={commande.id}
                        commande={commande}
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
        filteredCommandes.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune commande"
            message="Aucune commande dans cette catégorie"
          />
        ) : (
          <div className="restaurant-orders__list">
            {filteredCommandes.map((commande) => (
              <OrderCard
                key={commande.id}
                commande={commande}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={() => setSelectedCommande(commande)}
                updating={updating === commande.id}
                isListView
              />
            ))}
          </div>
        )
      )}

      {/* Modal détails */}
      <OrderDetailsModal
        commande={selectedCommande}
        onClose={() => setSelectedCommande(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updating === selectedCommande?.id}
      />
    </div>
  );
}

export default RestaurantOrdersPage;