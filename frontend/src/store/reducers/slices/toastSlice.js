// src/store/slices/toastSlice.js
// Gestion centralisée des notifications toast via Redux

import { createSlice } from '@reduxjs/toolkit';

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

const initialState = {
  toasts: [],
  position: TOAST_POSITIONS.BOTTOM_RIGHT,
  maxToasts: 5,
  nextId: 1,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const {
        type = TOAST_TYPES.INFO,
        title,
        message,
        duration = 5000,
        action: toastAction,
        dismissible = true,
      } = action.payload;

      const newToast = {
        id: state.nextId,
        type,
        title,
        message,
        duration,
        action: toastAction,
        dismissible,
        createdAt: Date.now(),
      };

      state.nextId += 1;

      // Limiter le nombre de toasts
      if (state.toasts.length >= state.maxToasts) {
        state.toasts = state.toasts.slice(-(state.maxToasts - 1));
      }

      state.toasts.push(newToast);
    },

    removeToast: (state, action) => {
      const id = action.payload;
      state.toasts = state.toasts.filter((toast) => toast.id !== id);
    },

    clearAllToasts: (state) => {
      state.toasts = [];
    },

    setPosition: (state, action) => {
      state.position = action.payload;
    },

    setMaxToasts: (state, action) => {
      state.maxToasts = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  clearAllToasts,
  setPosition,
  setMaxToasts,
} = toastSlice.actions;

// ===== SÉLECTEURS =====
export const selectToasts = (state) => state.toast?.toasts ?? [];
export const selectToastPosition = (state) => state.toast?.position ?? TOAST_POSITIONS.BOTTOM_RIGHT;

// ===== ACTION CREATORS HELPERS =====
export const showSuccess = (message, options = {}) =>
  addToast({ type: TOAST_TYPES.SUCCESS, message, ...options });

export const showError = (message, options = {}) =>
  addToast({ type: TOAST_TYPES.ERROR, message, duration: 7000, ...options });

export const showWarning = (message, options = {}) =>
  addToast({ type: TOAST_TYPES.WARNING, message, ...options });

export const showInfo = (message, options = {}) =>
  addToast({ type: TOAST_TYPES.INFO, message, ...options });

export default toastSlice.reducer;