import { createSlice } from '@reduxjs/toolkit';

// Charger le panier depuis localStorage
const loadCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], restaurantId: null, restaurantName: null };
  } catch {
    return { items: [], restaurantId: null, restaurantName: null };
  }
};

// Sauvegarder le panier dans localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Ajouter un article au panier
    addToCart: (state, action) => {
      const { plat, restaurantId, restaurantName } = action.payload;
      
      // Si le panier contient des articles d'un autre restaurant, le vider
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }
      
      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;
      
      // Vérifier si l'article existe déjà
      const existingItem = state.items.find(item => item.id === plat.id);
      
      if (existingItem) {
        existingItem.quantite += 1;
      } else {
        state.items.push({
          id: plat.id,
          nom: plat.nom,
          prix: parseFloat(plat.prix),
          quantite: 1,
          image_url: plat.image_url,
        });
      }
      
      saveCartToStorage(state);
    },
    
    // Retirer un article du panier
    removeFromCart: (state, action) => {
      const platId = action.payload;
      state.items = state.items.filter(item => item.id !== platId);
      
      // Si le panier est vide, réinitialiser
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
      }
      
      saveCartToStorage(state);
    },
    
    // Mettre à jour la quantité
    updateQuantity: (state, action) => {
      const { platId, quantite } = action.payload;
      
      if (quantite <= 0) {
        state.items = state.items.filter(item => item.id !== platId);
        if (state.items.length === 0) {
          state.restaurantId = null;
          state.restaurantName = null;
        }
      } else {
        const item = state.items.find(item => item.id === platId);
        if (item) {
          item.quantite = quantite;
        }
      }
      
      saveCartToStorage(state);
    },
    
    // Incrémenter la quantité
    incrementQuantity: (state, action) => {
      const platId = action.payload;
      const item = state.items.find(item => item.id === platId);
      if (item) {
        item.quantite += 1;
      }
      saveCartToStorage(state);
    },
    
    // Décrémenter la quantité
    decrementQuantity: (state, action) => {
      const platId = action.payload;
      const item = state.items.find(item => item.id === platId);
      if (item) {
        if (item.quantite > 1) {
          item.quantite -= 1;
        } else {
          state.items = state.items.filter(i => i.id !== platId);
          if (state.items.length === 0) {
            state.restaurantId = null;
            state.restaurantName = null;
          }
        }
      }
      saveCartToStorage(state);
    },
    
    // Vider le panier
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
      saveCartToStorage(state);
    },
  },
});

// Sélecteurs
export const selectCartItems = (state) => state.cart.items;
export const selectCartRestaurant = (state) => ({
  id: state.cart.restaurantId,
  name: state.cart.restaurantName,
});
export const selectCartItemsCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantite, 0);
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.prix * item.quantite), 0);
export const selectIsCartEmpty = (state) => state.cart.items.length === 0;

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;