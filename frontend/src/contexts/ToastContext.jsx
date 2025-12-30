import { createContext, useContext, useState, useCallback, useRef } from 'react';

// Contexte pour les toasts
const ToastContext = createContext(null);

// Types de toast disponibles
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Positions disponibles
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
};

export function ToastProvider({ children, position = TOAST_POSITIONS.TOP_RIGHT, maxToasts = 5 }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = TOAST_TYPES.INFO, title, message, duration = 5000, action, dismissible = true }) => {
      const id = ++toastIdRef.current;

      const newToast = {
        id,
        type,
        title,
        message,
        duration,
        action,
        dismissible,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Limiter le nombre de toasts
        const updated = [...prev, newToast];
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      // Auto-dismiss si durée spécifiée
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [maxToasts, removeToast]
  );

  // Helpers pour chaque type
  const success = useCallback(
    (message, options = {}) =>
      addToast({ type: TOAST_TYPES.SUCCESS, message, ...options }),
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) =>
      addToast({ type: TOAST_TYPES.ERROR, message, duration: 7000, ...options }),
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) =>
      addToast({ type: TOAST_TYPES.WARNING, message, ...options }),
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) =>
      addToast({ type: TOAST_TYPES.INFO, message, ...options }),
    [addToast]
  );

  // Supprimer tous les toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    position,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;