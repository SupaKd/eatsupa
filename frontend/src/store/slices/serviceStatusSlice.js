// src/store/slices/serviceStatusSlice.js
// Gestion du statut du service/restaurant via Redux

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk pour vérifier le statut du service
export const checkServiceStatus = createAsyncThunk(
  'serviceStatus/check',
  async (_, { rejectWithValue }) => {
    try {
      return {
        isOnline: true,
        lastCheck: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de vérification du statut');
    }
  }
);

const initialState = {
  isOnline: true,
  isMaintenanceMode: false,
  lastCheck: null,
  loading: false,
  error: null,
  restaurantStatus: {
    isOpen: true,
    nextOpeningTime: null,
    closingReason: null,
  },
};

const serviceStatusSlice = createSlice({
  name: 'serviceStatus',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
      state.lastCheck = Date.now();
    },

    setMaintenanceMode: (state, action) => {
      state.isMaintenanceMode = action.payload;
    },

    setRestaurantStatus: (state, action) => {
      state.restaurantStatus = {
        ...state.restaurantStatus,
        ...action.payload,
      };
    },

    clearServiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkServiceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkServiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isOnline = action.payload.isOnline;
        state.lastCheck = action.payload.lastCheck;
        state.error = null;
      })
      .addCase(checkServiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isOnline = false;
      });
  },
});

export const {
  setOnlineStatus,
  setMaintenanceMode,
  setRestaurantStatus,
  clearServiceError,
} = serviceStatusSlice.actions;

// ===== SÉLECTEURS =====
export const selectIsOnline = (state) => state.serviceStatus?.isOnline ?? true;
export const selectIsMaintenanceMode = (state) => state.serviceStatus?.isMaintenanceMode ?? false;
export const selectServiceLoading = (state) => state.serviceStatus?.loading ?? false;
export const selectServiceError = (state) => state.serviceStatus?.error ?? null;
export const selectRestaurantStatus = (state) => state.serviceStatus?.restaurantStatus ?? {
  isOpen: true,
  nextOpeningTime: null,
  closingReason: null,
};
export const selectLastCheck = (state) => state.serviceStatus?.lastCheck ?? null;

export default serviceStatusSlice.reducer;