// src/hooks/useAuth.js
// Hook personnalisé pour l'authentification via Redux

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  checkSession,
  getProfile,
  updateProfile as updateProfileAction,
  clearError,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectSessionChecked,
  selectUserRole,
  selectIsAdmin,
  selectIsRestaurateur,
} from '@/store/slices/authSlice';

/**
 * Hook pour gérer l'authentification via Redux
 * Remplace AuthContext
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const dispatch = useDispatch();
  
  // Sélecteurs
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const sessionChecked = useSelector(selectSessionChecked);
  const userRole = useSelector(selectUserRole);
  const isAdmin = useSelector(selectIsAdmin);
  const isRestaurateur = useSelector(selectIsRestaurateur);

  // Actions
  const login = useCallback(
    async (credentials) => {
      const result = await dispatch(loginAction(credentials));
      if (loginAction.rejected.match(result)) {
        throw new Error(result.payload || 'Erreur de connexion');
      }
      return result.payload;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAction());
  }, [dispatch]);

  const register = useCallback(
    async (userData) => {
      const result = await dispatch(registerAction(userData));
      if (registerAction.rejected.match(result)) {
        throw new Error(result.payload || 'Erreur lors de l\'inscription');
      }
      return result.payload;
    },
    [dispatch]
  );

  const refreshProfile = useCallback(async () => {
    const result = await dispatch(getProfile());
    if (getProfile.rejected.match(result)) {
      throw new Error(result.payload || 'Erreur de récupération du profil');
    }
    return result.payload;
  }, [dispatch]);

  const updateProfile = useCallback(
    async (profileData) => {
      const result = await dispatch(updateProfileAction(profileData));
      if (updateProfileAction.rejected.match(result)) {
        throw new Error(result.payload || 'Erreur de mise à jour du profil');
      }
      return result.payload;
    },
    [dispatch]
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const verifySession = useCallback(async () => {
    const result = await dispatch(checkSession());
    return !checkSession.rejected.match(result);
  }, [dispatch]);

  return {
    // État
    user,
    token,
    isAuthenticated,
    loading,
    error,
    sessionChecked,
    userRole,
    isAdmin,
    isRestaurateur,
    
    // Actions
    login,
    logout,
    register,
    refreshProfile,
    updateProfile,
    clearError: clearAuthError,
    verifySession,
  };
}

/**
 * Hook pour vérifier la session au montage du composant
 * À utiliser dans App.jsx ou un composant racine
 */
export function useSessionCheck() {
  const dispatch = useDispatch();
  const sessionChecked = useSelector(selectSessionChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!sessionChecked) {
      dispatch(checkSession());
    }
  }, [dispatch, sessionChecked]);

  return { sessionChecked, isAuthenticated };
}

export default useAuth;