// src/hooks/useServiceStatus.js
// Hook personnalisé pour le statut du service via Redux

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkServiceStatus,
  setOnlineStatus,
  setMaintenanceMode,
  setRestaurantStatus,
  clearServiceError,
  selectIsOnline,
  selectIsMaintenanceMode,
  selectServiceLoading,
  selectServiceError,
  selectRestaurantStatus,
  selectLastCheck,
} from '@/store/slices/serviceStatusSlice';

/**
 * Hook pour gérer le statut du service via Redux
 * Remplace ServiceStatusContext
 * 
 * @example
 * const { isOnline, isMaintenanceMode, checkStatus } = useServiceStatus();
 */
export function useServiceStatus() {
  const dispatch = useDispatch();
  
  // Sélecteurs
  const isOnline = useSelector(selectIsOnline);
  const isMaintenanceMode = useSelector(selectIsMaintenanceMode);
  const loading = useSelector(selectServiceLoading);
  const error = useSelector(selectServiceError);
  const restaurantStatus = useSelector(selectRestaurantStatus);
  const lastCheck = useSelector(selectLastCheck);

  // Actions
  const checkStatus = useCallback(async () => {
    const result = await dispatch(checkServiceStatus());
    return !checkServiceStatus.rejected.match(result);
  }, [dispatch]);

  const setOnline = useCallback(
    (status) => {
      dispatch(setOnlineStatus(status));
    },
    [dispatch]
  );

  const setMaintenance = useCallback(
    (status) => {
      dispatch(setMaintenanceMode(status));
    },
    [dispatch]
  );

  const updateRestaurantStatus = useCallback(
    (status) => {
      dispatch(setRestaurantStatus(status));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearServiceError());
  }, [dispatch]);

  return {
    // État
    isOnline,
    isMaintenanceMode,
    loading,
    error,
    restaurantStatus,
    lastCheck,
    
    // Actions
    checkStatus,
    setOnline,
    setMaintenance,
    updateRestaurantStatus,
    clearError,
  };
}

export default useServiceStatus;