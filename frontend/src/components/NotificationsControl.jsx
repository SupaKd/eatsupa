// src/components/restaurant/NotificationControl.jsx
// Composant pour contrôler les notifications sonores

import { memo, useState } from 'react';
import { Volume2, VolumeX, Bell, BellOff, Settings } from 'lucide-react';

/**
 * Bouton simple pour activer/désactiver le son
 */
export const SoundToggleButton = memo(function SoundToggleButton({
  enabled,
  onToggle,
  pendingCount = 0,
  size = 'md',
  showLabel = true,
  className = '',
}) {
  const sizeClasses = {
    sm: 'notification-toggle--sm',
    md: 'notification-toggle--md',
    lg: 'notification-toggle--lg',
  };

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;

  return (
    <button
      className={`notification-toggle ${sizeClasses[size]} ${enabled ? 'notification-toggle--active' : ''} ${className}`}
      onClick={onToggle}
      title={enabled ? 'Désactiver les notifications sonores' : 'Activer les notifications sonores'}
      aria-label={enabled ? 'Désactiver le son' : 'Activer le son'}
    >
      {enabled ? (
        <Volume2 size={iconSize} />
      ) : (
        <VolumeX size={iconSize} />
      )}
      {showLabel && (
        <span className="notification-toggle__label">
          {enabled ? 'Son activé' : 'Son désactivé'}
        </span>
      )}
      {pendingCount > 0 && (
        <span className="notification-toggle__badge">{pendingCount}</span>
      )}
    </button>
  );
});

/**
 * Panneau de contrôle complet des notifications
 */
export const NotificationPanel = memo(function NotificationPanel({
  soundEnabled,
  onToggleSound,
  onTestSound,
  pendingCount = 0,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`notification-panel ${className}`}>
      <button
        className={`notification-panel__trigger ${pendingCount > 0 ? 'notification-panel__trigger--alert' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {pendingCount > 0 ? (
          <Bell size={20} className="notification-panel__trigger-icon notification-panel__trigger-icon--animated" />
        ) : (
          <Bell size={20} className="notification-panel__trigger-icon" />
        )}
        {pendingCount > 0 && (
          <span className="notification-panel__trigger-badge">{pendingCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="notification-panel__backdrop" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="notification-panel__dropdown">
            <div className="notification-panel__header">
              <h3>Notifications</h3>
              <button 
                className="notification-panel__close" 
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="notification-panel__content">
              {/* Statut des commandes en attente */}
              <div className="notification-panel__status">
                {pendingCount > 0 ? (
                  <div className="notification-panel__status-alert">
                    <Bell size={24} className="animate-bounce" />
                    <div>
                      <strong>{pendingCount} commande{pendingCount > 1 ? 's' : ''}</strong>
                      <span>en attente de confirmation</span>
                    </div>
                  </div>
                ) : (
                  <div className="notification-panel__status-ok">
                    <Bell size={24} />
                    <span>Aucune commande en attente</span>
                  </div>
                )}
              </div>

              {/* Contrôle du son */}
              <div className="notification-panel__control">
                <div className="notification-panel__control-info">
                  {soundEnabled ? (
                    <Volume2 size={20} />
                  ) : (
                    <VolumeX size={20} />
                  )}
                  <div>
                    <strong>Notifications sonores</strong>
                    <span>{soundEnabled ? 'Activées' : 'Désactivées'}</span>
                  </div>
                </div>
                <button
                  className={`notification-panel__switch ${soundEnabled ? 'notification-panel__switch--on' : ''}`}
                  onClick={onToggleSound}
                  role="switch"
                  aria-checked={soundEnabled}
                >
                  <span className="notification-panel__switch-handle" />
                </button>
              </div>

              {/* Bouton de test */}
              <button
                className="notification-panel__test-btn"
                onClick={onTestSound}
              >
                <Volume2 size={16} />
                Tester le son
              </button>

              {/* Info */}
              <p className="notification-panel__info">
                Les notifications sonores vous alertent quand une nouvelle commande arrive.
                {pendingCount > 0 && soundEnabled && (
                  <> Un rappel sera joué toutes les 15 secondes tant qu'il y a des commandes en attente.</>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

/**
 * Alerte flottante pour les commandes urgentes
 */
export const UrgentOrderAlert = memo(function UrgentOrderAlert({
  count,
  onDismiss,
  onViewOrders,
}) {
  if (count === 0) return null;

  return (
    <div className="urgent-order-alert">
      <div className="urgent-order-alert__content">
        <div className="urgent-order-alert__icon">
          <Bell size={24} className="animate-bounce" />
        </div>
        <div className="urgent-order-alert__text">
          <strong>{count} nouvelle{count > 1 ? 's' : ''} commande{count > 1 ? 's' : ''}</strong>
          <span>en attente de confirmation</span>
        </div>
      </div>
      <div className="urgent-order-alert__actions">
        <button 
          className="urgent-order-alert__btn urgent-order-alert__btn--primary"
          onClick={onViewOrders}
        >
          Voir les commandes
        </button>
        <button 
          className="urgent-order-alert__btn urgent-order-alert__btn--secondary"
          onClick={onDismiss}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
});

export default NotificationPanel;