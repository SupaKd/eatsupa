// ===== src/store/store.js ===== (VERSION CORRIGÉE AVEC AUTH)
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

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
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(errorMiddleware),
  devTools: import.meta.env.DEV,
});

export default store;