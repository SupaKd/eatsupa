// src/store/index.js
// Configuration du store Redux avec tous les slices

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import toastReducer from './slices/toastSlice';
import serviceStatusReducer from './slices/serviceStatusSlice';

// Middleware pour auto-dismiss des toasts
const toastAutoRemoveMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Si un toast a été ajouté, programmer sa suppression automatique
  if (action.type === 'toast/addToast') {
    const state = store.getState();
    const toasts = state.toast?.toasts || [];
    const lastToast = toasts[toasts.length - 1];
    
    if (lastToast && lastToast.duration > 0) {
      setTimeout(() => {
        store.dispatch({ type: 'toast/removeToast', payload: lastToast.id });
      }, lastToast.duration);
    }
  }
  
  return result;
};

// Middleware pour logger les erreurs en développement
const errorMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Erreur Redux:', error);
    throw error;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    toast: toastReducer,
    serviceStatus: serviceStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer les actions avec des fonctions (comme les callbacks des toasts)
        ignoredActions: ['toast/addToast'],
        ignoredPaths: ['toast.toasts'],
      },
    }).concat(toastAutoRemoveMiddleware, errorMiddleware),
  devTools: import.meta.env.DEV,
});

// Types pour TypeScript (optionnel, mais utile)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;

// Re-export des slices pour faciliter les imports
export * from './slices';