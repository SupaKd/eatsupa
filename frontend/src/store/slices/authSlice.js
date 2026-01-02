// ===== src/store/authSlice.js ===== (VERSION CORRIGÉE)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.sabai-thoiry.com';

// ===== ASYNC THUNKS =====

// Vérifier la session
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Session invalide');
      }

      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

// Connexion
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur de connexion');
      }

      if (data.success && data.user) {
        return data.user;
      }

      return rejectWithValue('Réponse invalide du serveur');
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

// Déconnexion
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return null;
    } catch (error) {
      // Même en cas d'erreur, on déconnecte localement
      return null;
    }
  }
);

// ===== INITIAL STATE =====
const initialState = {
  user: null,
  loading: true, // true au démarrage pour vérifier la session
  error: null,
  isAuthenticated: false,
};

// ===== SLICE =====
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // Check Session
    builder
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Ne pas afficher d'erreur pour les 401 (session non connectée normale)
        state.error = null;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Erreur de connexion';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Même en cas d'erreur, on déconnecte localement
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;

// ===== SÉLECTEURS =====
export const selectUser = (state) => state?.auth?.user ?? null;
export const selectIsAuthenticated = (state) => state?.auth?.isAuthenticated ?? false;
export const selectAuthLoading = (state) => state?.auth?.loading ?? true;
export const selectAuthError = (state) => state?.auth?.error ?? null;

export default authSlice.reducer;