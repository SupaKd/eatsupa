import { useState, useEffect } from 'react';
import { useToast, TOAST_TYPES } from '@/contexts/ToastContext';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

// Icônes par type
const TOAST_ICONS = {
  [TOAST_TYPES.SUCCESS]: CheckCircle,
  [TOAST_TYPES.ERROR]: XCircle,
  [TOAST_TYPES.WARNING]: AlertTriangle,
  [TOAST_TYPES.INFO]: Info,
};

// Composant individuel Toast
function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const Icon = TOAST_ICONS[toast.type] || Info;

  // Animation de la barre de progression
  useEffect(() => {
    if (toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Durée de l'animation de sortie
  };

  return (
    <div
      className={`toast toast--${toast.type} ${isExiting ? 'toast--exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon">
        <Icon size={20} strokeWidth={2} />
      </div>

      <div className="toast__content">
        {toast.title && <h4 className="toast__title">{toast.title}</h4>}
        {toast.message && <p className="toast__message">{toast.message}</p>}

        {toast.action && (
          <button
            className="toast__action"
            onClick={() => {
              toast.action.onClick?.();
              handleClose();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.dismissible && (
        <button
          className="toast__close"
          onClick={handleClose}
          aria-label="Fermer la notification"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}

      {/* Barre de progression */}
      {toast.duration > 0 && (
        <div className="toast__progress">
          <div
            className="toast__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Container principal des toasts
function ToastContainer() {
  const { toasts, position, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={`toast-container toast-container--${position}`}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;