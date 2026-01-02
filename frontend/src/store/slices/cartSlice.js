// ===== src/store/cartSlice.js ===== (VERSION CORRIGÉE)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  restaurant: null,
};

// Charger le panier depuis localStorage
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    if (!saved) return initialState;
    
    const parsed = JSON.parse(saved);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [],
      restaurant: parsed.restaurant || null,
    };
  } catch (error) {
    console.error('Erreur chargement panier:', error);
    return initialState;
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      
      if (!product || !product.id) return;
      
      // S'assurer que items est un tableau
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      
      const existingIndex = state.items.findIndex(
        item => item.product?.id === product.id
      );
      
      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      
      // Sauvegarder dans localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },
    
    removeItem: (state, action) => {
      const productId = action.payload;
      
      if (!Array.isArray(state.items)) {
        state.items = [];
        return;
      }
      
      state.items = state.items.filter(item => item.product?.id !== productId);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      
      if (!Array.isArray(state.items)) {
        state.items = [];
        return;
      }
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.product?.id !== productId);
      } else {
        const item = state.items.find(item => item.product?.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(state));
    },
    
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      localStorage.removeItem('cart');
    },
    
    setRestaurant: (state, action) => {
      state.restaurant = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  setRestaurant 
} = cartSlice.actions;

// ===== SÉLECTEURS CORRIGÉS =====
// Ces sélecteurs gèrent maintenant les cas où state.cart ou state.cart.items est undefined

export const selectCartItems = (state) => {
  // Vérification défensive
  if (!state?.cart?.items) return [];
  return Array.isArray(state.cart.items) ? state.cart.items : [];
};

export const selectCartItemsCount = (state) => {
  // ✅ CORRECTION : Vérifier que items existe et est un tableau
  const items = state?.cart?.items;
  
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  
  return items.reduce((sum, item) => {
    const quantity = parseInt(item?.quantity) || 0;
    return sum + quantity;
  }, 0);
};

export const selectCartTotal = (state) => {
  // ✅ CORRECTION : Vérifier que items existe et est un tableau
  const items = state?.cart?.items;
  
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  
  return items.reduce((sum, item) => {
    if (!item?.product?.price) return sum;
    const price = parseFloat(item.product.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
};

export const selectCartRestaurant = (state) => {
  // ✅ CORRECTION : Retourner null au lieu d'un nouvel objet vide
  // Cela évite les re-renders inutiles
  return state?.cart?.restaurant ?? null;
};

export const selectProductQuantityInCart = (productId) => (state) => {
  const items = state?.cart?.items;
  
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  
  const item = items.find(item => item.product?.id === productId);
  return item ? parseInt(item.quantity) || 0 : 0;
};

export default cartSlice.reducer;