// src/store/slices/cartSlice.js
// Gestion du panier d'achat via Redux

import { createSlice } from '@reduxjs/toolkit';

// ===== HELPERS =====
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    if (!saved) return { items: [], restaurant: null };
    
    const parsed = JSON.parse(saved);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      restaurant: parsed.restaurant || null,
    };
  } catch (error) {
    console.error('Erreur chargement panier:', error);
    return { items: [], restaurant: null };
  }
};

const saveCartToStorage = (state) => {
  try {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      restaurant: state.restaurant,
    }));
  } catch (error) {
    console.error('Erreur sauvegarde panier:', error);
  }
};

// ===== INITIAL STATE =====
const initialState = loadCartFromStorage();

// ===== SLICE =====
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Ajouter un plat au panier
    addToCart: (state, action) => {
      const { plat, restaurantId, restaurantName, quantity = 1 } = action.payload;
      
      if (!plat || !plat.id) return;

      // Si le panier contient des items d'un autre restaurant, le vider
      if (state.restaurant && state.restaurant.id !== restaurantId) {
        state.items = [];
      }

      // Mettre à jour le restaurant
      state.restaurant = {
        id: restaurantId,
        name: restaurantName,
      };

      // Chercher si le plat existe déjà
      const existingIndex = state.items.findIndex(item => item.id === plat.id);
      
      if (existingIndex > -1) {
        state.items[existingIndex].quantite += quantity;
      } else {
        state.items.push({
          id: plat.id,
          nom: plat.nom,
          prix: parseFloat(plat.prix),
          image_url: plat.image_url,
          quantite: quantity,
        });
      }
      
      saveCartToStorage(state);
    },

    // Retirer un plat du panier
    removeFromCart: (state, action) => {
      const platId = action.payload;
      state.items = state.items.filter(item => item.id !== platId);
      
      // Si le panier est vide, réinitialiser le restaurant
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      
      saveCartToStorage(state);
    },

    // Incrémenter la quantité
    incrementQuantity: (state, action) => {
      const platId = action.payload;
      const item = state.items.find(item => item.id === platId);
      if (item) {
        item.quantite += 1;
        saveCartToStorage(state);
      }
    },

    // Décrémenter la quantité
    decrementQuantity: (state, action) => {
      const platId = action.payload;
      const item = state.items.find(item => item.id === platId);
      
      if (item) {
        if (item.quantite <= 1) {
          // Supprimer l'item si quantité <= 1
          state.items = state.items.filter(i => i.id !== platId);
          if (state.items.length === 0) {
            state.restaurant = null;
          }
        } else {
          item.quantite -= 1;
        }
        saveCartToStorage(state);
      }
    },

    // Mettre à jour la quantité directement
    updateQuantity: (state, action) => {
      const { platId, quantity } = action.payload;
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== platId);
        if (state.items.length === 0) {
          state.restaurant = null;
        }
      } else {
        const item = state.items.find(item => item.id === platId);
        if (item) {
          item.quantite = quantity;
        }
      }
      
      saveCartToStorage(state);
    },

    // Vider le panier
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      localStorage.removeItem('cart');
    },

    // Définir le restaurant (utile pour la synchronisation)
    setRestaurant: (state, action) => {
      state.restaurant = action.payload;
      saveCartToStorage(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  updateQuantity,
  clearCart,
  setRestaurant,
} = cartSlice.actions;

// ===== SÉLECTEURS =====

// Récupérer tous les items du panier
export const selectCartItems = (state) => {
  const items = state.cart?.items;
  return Array.isArray(items) ? items : [];
};

// Récupérer le nombre total d'articles
export const selectCartItemsCount = (state) => {
  const items = state.cart?.items;
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((sum, item) => {
    return sum + (parseInt(item?.quantite) || 0);
  }, 0);
};

// Récupérer le total du panier
export const selectCartTotal = (state) => {
  const items = state.cart?.items;
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((sum, item) => {
    const prix = parseFloat(item?.prix) || 0;
    const quantite = parseInt(item?.quantite) || 0;
    return sum + (prix * quantite);
  }, 0);
};

// Récupérer les infos du restaurant
export const selectCartRestaurant = (state) => {
  return state.cart?.restaurant ?? null;
};

// Vérifier si le panier est vide
export const selectIsCartEmpty = (state) => {
  const items = state.cart?.items;
  return !items || !Array.isArray(items) || items.length === 0;
};

// Récupérer la quantité d'un plat spécifique
export const selectPlatQuantity = (platId) => (state) => {
  const items = state.cart?.items;
  if (!items || !Array.isArray(items)) return 0;
  
  const item = items.find(item => item.id === platId);
  return item ? parseInt(item.quantite) || 0 : 0;
};

export default cartSlice.reducer;