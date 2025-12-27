import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI, commandeAPI } from '@services/api';

function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [commandesEnAttente, setCommandesEnAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingFermeture, setTogglingFermeture] = useState(false);
  const [togglingLivraison, setTogglingLivraison] = useState(false);
  const [updatingCommande, setUpdatingCommande] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      const restaurantResponse = await restaurantAPI.getMyRestaurant();
      
      if (restaurantResponse.data.success) {
        const data = restaurantResponse.data.data;
        setRestaurant(data.restaurant);
        setStats(data.stats);
      }

      // Récupérer les commandes en attente
      const commandesResponse = await commandeAPI.getAll();
      if (commandesResponse.data.success) {
        const enAttente = commandesResponse.data.data.filter(
          c => ['en_attente', 'confirmee', 'en_preparation', 'prete'].includes(c.statut)
        );
        setCommandesEnAttente(enAttente);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      if (err.response?.data?.code === 'NO_RESTAURANT') {
        setError('no_restaurant');
      } else {
        setError('Impossible de charger les données');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Polling toutes les 30 secondes pour les nouvelles commandes
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Toggle fermeture exceptionnelle (ouvrir/fermer le restaurant)
  const handleToggleFermeture = async () => {
    if (!restaurant || togglingFermeture) return;
    
    setTogglingFermeture(true);
    try {
      // Utiliser la nouvelle route dédiée ou update classique
      await restaurantAPI.update(restaurant.id, {
        fermeture_exceptionnelle: !restaurant.fermeture_exceptionnelle
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Erreur toggle fermeture:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setTogglingFermeture(false);
    }
  };

  // Toggle livraison
  const handleToggleLivraison = async () => {
    if (!restaurant || togglingLivraison) return;
    
    setTogglingLivraison(true);
    try {
      await restaurantAPI.update(restaurant.id, {
        livraison_active: !restaurant.livraison_active
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Erreur toggle livraison:', err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setTogglingLivraison(false);
    }
  };

  // Mettre à jour le statut d'une commande
  const handleUpdateCommandeStatus = async (commandeId, newStatus) => {
    setUpdatingCommande(commandeId);
    try {
      await commandeAPI.updateStatus(commandeId, newStatus);
      await fetchDashboardData();
    } catch (err) {
      console.error('Erreur mise à jour commande:', err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdatingCommande(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      en_attente: { label: 'En attente', color: 'yellow', next: 'confirmee', nextLabel: 'Confirmer' },
      confirmee: { label: 'Confirmée', color: 'blue', next: 'en_preparation', nextLabel: 'Préparer' },
      en_preparation: { label: 'En préparation', color: 'orange', next: 'prete', nextLabel: 'Prête' },
      prete: { label: 'Prête', color: 'green', next: 'recuperee', nextLabel: 'Récupérée' },
    };
    return statusMap[status] || { label: status, color: 'gray' };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error === 'no_restaurant') {
    return (
      <div className="dashboard-empty-state">
        <div className="dashboard-empty-state__icon">🏪</div>
        <h2>Créez votre restaurant</h2>
        <p>Commencez par créer votre établissement pour recevoir des commandes.</p>
        <Link to="/dashboard/restaurant" className="dashboard-empty-state__btn">
          Créer mon restaurant
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Réessayer</button>
      </div>
    );
  }

  const commandesUrgentes = commandesEnAttente.filter(c => c.statut === 'en_attente');

  return (
    <div className="restaurant-dashboard">
      {/* Statut du restaurant (basé sur les horaires + fermeture exceptionnelle) */}
      <div className={`dashboard-status-banner ${restaurant?.est_ouvert ? 'dashboard-status-banner--open' : 'dashboard-status-banner--closed'}`}>
        <div className="dashboard-status-banner__info">
          <div className="dashboard-status-banner__indicator">
            <span className={`dashboard-status-banner__dot ${restaurant?.est_ouvert ? 'dashboard-status-banner__dot--open' : ''}`}></span>
            <span className="dashboard-status-banner__text">
              {restaurant?.fermeture_exceptionnelle 
                ? 'Fermé temporairement' 
                : (restaurant?.est_ouvert ? 'Restaurant ouvert' : 'Restaurant fermé')}
            </span>
          </div>
          {restaurant?.est_ouvert && restaurant?.heure_fermeture && (
            <span className="dashboard-status-banner__hours">
              Fermeture à {restaurant.heure_fermeture}
            </span>
          )}
          {!restaurant?.est_ouvert && !restaurant?.fermeture_exceptionnelle && restaurant?.prochaine_ouverture && (
            <span className="dashboard-status-banner__hours">
              Prochaine ouverture : {restaurant.prochaine_ouverture.jourCapitalized} à {restaurant.prochaine_ouverture.heure}
            </span>
          )}
          {restaurant?.fermeture_exceptionnelle && (
            <span className="dashboard-status-banner__hours">
              Cliquez sur "Ouvrir" pour reprendre les commandes
            </span>
          )}
        </div>
        <button
          className={`dashboard-status-banner__toggle ${restaurant?.fermeture_exceptionnelle ? 'dashboard-status-banner__toggle--open' : 'dashboard-status-banner__toggle--close'}`}
          onClick={handleToggleFermeture}
          disabled={togglingFermeture}
        >
          {togglingFermeture ? '...' : (restaurant?.fermeture_exceptionnelle ? 'Ouvrir' : 'Fermer')}
        </button>
      </div>

      {/* Contrôles rapides */}
      <div className="dashboard-quick-controls">
        {/* Toggle Livraison */}
        <div className="dashboard-quick-control">
          <div className="dashboard-quick-control__info">
            <span className="dashboard-quick-control__icon">🚗</span>
            <div>
              <span className="dashboard-quick-control__label">Livraison</span>
              <span className={`dashboard-quick-control__status ${restaurant?.livraison_active ? 'dashboard-quick-control__status--on' : ''}`}>
                {restaurant?.livraison_active ? 'Activée' : 'Désactivée'}
              </span>
            </div>
          </div>
          <button
            className={`dashboard-quick-control__switch ${restaurant?.livraison_active ? 'dashboard-quick-control__switch--on' : ''}`}
            onClick={handleToggleLivraison}
            disabled={togglingLivraison}
            aria-label="Toggle livraison"
          >
            <span className="dashboard-quick-control__switch-handle"></span>
          </button>
        </div>

        {/* CA du jour */}
        <div className="dashboard-quick-control dashboard-quick-control--info">
          <div className="dashboard-quick-control__info">
            <span className="dashboard-quick-control__icon">💰</span>
            <div>
              <span className="dashboard-quick-control__label">CA du jour</span>
              <span className="dashboard-quick-control__value">{formatPrice(stats?.ca_jour)}</span>
            </div>
          </div>
        </div>

        {/* Commandes du jour */}
        <div className="dashboard-quick-control dashboard-quick-control--info">
          <div className="dashboard-quick-control__info">
            <span className="dashboard-quick-control__icon">📦</span>
            <div>
              <span className="dashboard-quick-control__label">Commandes totales</span>
              <span className="dashboard-quick-control__value">{stats?.total_commandes || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte commandes en attente */}
      {commandesUrgentes.length > 0 && (
        <div className="dashboard-alert dashboard-alert--warning">
          <div className="dashboard-alert__icon">⚠️</div>
          <div className="dashboard-alert__content">
            <strong>{commandesUrgentes.length} commande{commandesUrgentes.length > 1 ? 's' : ''} en attente de confirmation</strong>
            <span>Action requise</span>
          </div>
          <Link to="/dashboard/commandes?statut=en_attente" className="dashboard-alert__action">
            Voir tout
          </Link>
        </div>
      )}

      {/* Liste des commandes actives */}
      <div className="dashboard-orders-section">
        <div className="dashboard-orders-section__header">
          <h2>
            Commandes en cours
            {commandesEnAttente.length > 0 && (
              <span className="dashboard-orders-section__badge">{commandesEnAttente.length}</span>
            )}
          </h2>
          <Link to="/dashboard/commandes" className="dashboard-orders-section__link">
            Toutes les commandes →
          </Link>
        </div>

        {commandesEnAttente.length === 0 ? (
          <div className="dashboard-orders-empty">
            <span className="dashboard-orders-empty__icon">✨</span>
            <p>Aucune commande en cours</p>
          </div>
        ) : (
          <div className="dashboard-orders-list">
            {commandesEnAttente.slice(0, 5).map((commande) => {
              const statusInfo = getStatusInfo(commande.statut);
              const isUpdating = updatingCommande === commande.id;

              return (
                <div key={commande.id} className="dashboard-order-card">
                  <div className="dashboard-order-card__header">
                    <div className="dashboard-order-card__id">
                      <code>{commande.numero_commande}</code>
                      <span className="dashboard-order-card__time">{formatTime(commande.date_commande)}</span>
                    </div>
                    <span className={`dashboard-order-card__status dashboard-order-card__status--${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="dashboard-order-card__items">
                    {commande.items?.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="dashboard-order-card__item">
                        {item.quantite}× {item.nom_plat}
                      </span>
                    ))}
                    {commande.items?.length > 3 && (
                      <span className="dashboard-order-card__more">+{commande.items.length - 3} autres</span>
                    )}
                  </div>

                  {commande.notes && (
                    <div className="dashboard-order-card__notes">
                      📝 {commande.notes}
                    </div>
                  )}

                  <div className="dashboard-order-card__footer">
                    <div className="dashboard-order-card__client">
                      <a href={`tel:${commande.telephone_client}`}>📞 {commande.telephone_client}</a>
                      {commande.mode_retrait === 'livraison' && (
                        <span className="dashboard-order-card__delivery-badge">🚗 Livraison</span>
                      )}
                    </div>
                    <span className="dashboard-order-card__total">{formatPrice(commande.montant_total)}</span>
                  </div>

                  <div className="dashboard-order-card__actions">
                    {statusInfo.next && (
                      <button
                        className="dashboard-order-card__btn dashboard-order-card__btn--primary"
                        onClick={() => handleUpdateCommandeStatus(commande.id, statusInfo.next)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? '...' : statusInfo.nextLabel}
                      </button>
                    )}
                    {commande.statut === 'en_attente' && (
                      <button
                        className="dashboard-order-card__btn dashboard-order-card__btn--danger"
                        onClick={() => handleUpdateCommandeStatus(commande.id, 'annulee')}
                        disabled={isUpdating}
                      >
                        Refuser
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {commandesEnAttente.length > 5 && (
              <Link to="/dashboard/commandes" className="dashboard-orders-list__more">
                Voir les {commandesEnAttente.length - 5} autres commandes
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="dashboard-stats-row">
        <div className="dashboard-stat-mini">
          <span className="dashboard-stat-mini__label">CA Semaine</span>
          <span className="dashboard-stat-mini__value">{formatPrice(stats?.ca_semaine)}</span>
        </div>
        <div className="dashboard-stat-mini">
          <span className="dashboard-stat-mini__label">CA Mois</span>
          <span className="dashboard-stat-mini__value">{formatPrice(stats?.ca_mois)}</span>
        </div>
        <div className="dashboard-stat-mini">
          <span className="dashboard-stat-mini__label">Plats actifs</span>
          <span className="dashboard-stat-mini__value">{stats?.nb_plats_actifs || 0}</span>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="dashboard-shortcuts">
        <Link to="/dashboard/commandes" className="dashboard-shortcut">
          <span className="dashboard-shortcut__icon">📋</span>
          <span className="dashboard-shortcut__label">Commandes</span>
        </Link>
        <Link to="/dashboard/menu" className="dashboard-shortcut">
          <span className="dashboard-shortcut__icon">🍽️</span>
          <span className="dashboard-shortcut__label">Menu</span>
        </Link>
        <Link to="/dashboard/restaurant" className="dashboard-shortcut">
          <span className="dashboard-shortcut__icon">⚙️</span>
          <span className="dashboard-shortcut__label">Paramètres</span>
        </Link>
        <Link to={`/restaurant/${restaurant?.id}`} className="dashboard-shortcut" target="_blank">
          <span className="dashboard-shortcut__icon">👁️</span>
          <span className="dashboard-shortcut__label">Ma page</span>
        </Link>
      </div>
    </div>
  );
}

export default RestaurantDashboardPage;