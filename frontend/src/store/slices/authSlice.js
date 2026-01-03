// src/store/slices/authSlice.js
// Gestion complète de l'authentification via Redux (remplace AuthContext)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ===== ASYNC THUNKS =====

// Vérifier la session au démarrage
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Pas de token');
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return rejectWithValue(data.message || 'Session invalide');
      }

      return data.data || data.user;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

// Connexion
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Erreur de connexion');
      }

      if (data.success && data.data) {
        // Sauvegarder le token et l'utilisateur
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
        }
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return data.data;
      }

      return rejectWithValue('Réponse invalide du serveur');
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

// Inscription
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Erreur lors de l\'inscription');
      }

      if (data.success && data.data) {
        // Sauvegarder le token et l'utilisateur
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
        }
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return data.data;
      }

      return rejectWithValue('Réponse invalide du serveur');
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de l\'inscription');
    }
  }
);

// Déconnexion
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Ignorer les erreurs de déconnexion côté serveur
      console.warn('Erreur déconnexion serveur:', error);
    } finally {
      // Toujours nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  }
);

// Récupérer le profil
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Non authentifié');
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Erreur de récupération du profil');
      }

      return data.data || data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de récupération du profil');
    }
  }
);

// Mettre à jour le profil
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Non authentifié');
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Erreur de mise à jour du profil');
      }

      // Mettre à jour le localStorage
      const updatedUser = data.data || data.user;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de mise à jour du profil');
    }
  }
);

// ===== HELPERS =====
const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      return JSON.parse(user);
    }
    return null;
  } catch {
    return null;
  }
};

// ===== INITIAL STATE =====
const storedUser = loadUserFromStorage();

const initialState = {
  user: storedUser,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isAuthenticated: !!storedUser,
  sessionChecked: false,
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
      state.token = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.sessionChecked = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    setSessionChecked: (state) => {
      state.sessionChecked = true;
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
        state.sessionChecked = true;
        state.error = null;
      })
      .addCase(checkSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionChecked = true;
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Erreur de connexion';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Erreur lors de l\'inscription';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetAuth, setSessionChecked } = authSlice.actions;

// ===== SÉLECTEURS =====
export const selectUser = (state) => state.auth?.user ?? null;
export const selectToken = (state) => state.auth?.token ?? null;
export const selectIsAuthenticated = (state) => state.auth?.isAuthenticated ?? false;
export const selectAuthLoading = (state) => state.auth?.loading ?? false;
export const selectAuthError = (state) => state.auth?.error ?? null;
export const selectSessionChecked = (state) => state.auth?.sessionChecked ?? false;
export const selectUserRole = (state) => state.auth?.user?.role ?? null;
export const selectIsAdmin = (state) => state.auth?.user?.role === 'admin';
export const selectIsRestaurateur = (state) => state.auth?.user?.role === 'restaurateur';

export default authSlice.reducer;