// src/hooks/useToast.js
// Hook personnalisé pour utiliser les toasts via Redux

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToast,
  removeToast,
  clearAllToasts,
  selectToasts,
  selectToastPosition,
  TOAST_TYPES,
  TOAST_POSITIONS,
} from '@/store/slices/toastSlice';

/**
 * Hook pour gérer les notifications toast via Redux
 * Remplace le contexte ToastContext
 * 
 * @example
 * const toast = useToast();
 * toast.success('Opération réussie !');
 * toast.error('Une erreur est survenue');
 */
export function useToast() {
  const dispatch = useDispatch();
  const toasts = useSelector(selectToasts);
  const position = useSelector(selectToastPosition);

  const success = useCallback(
    (message, options = {}) => {
      dispatch(addToast({ type: TOAST_TYPES.SUCCESS, message, ...options }));
    },
    [dispatch]
  );

  const error = useCallback(
    (message, options = {}) => {
      dispatch(addToast({ type: TOAST_TYPES.ERROR, message, duration: 7000, ...options }));
    },
    [dispatch]
  );

  const warning = useCallback(
    (message, options = {}) => {
      dispatch(addToast({ type: TOAST_TYPES.WARNING, message, ...options }));
    },
    [dispatch]
  );

  const info = useCallback(
    (message, options = {}) => {
      dispatch(addToast({ type: TOAST_TYPES.INFO, message, ...options }));
    },
    [dispatch]
  );

  const remove = useCallback(
    (id) => {
      dispatch(removeToast(id));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch(clearAllToasts());
  }, [dispatch]);

  const show = useCallback(
    (options) => {
      dispatch(addToast(options));
    },
    [dispatch]
  );

  return {
    // État
    toasts,
    position,
    
    // Actions helpers
    success,
    error,
    warning,
    info,
    
    // Actions de base
    show,
    remove,
    removeToast: remove,
    clearAll,
  };
}

// Re-export des constantes pour faciliter l'usage
export { TOAST_TYPES, TOAST_POSITIONS };

export default useToast;