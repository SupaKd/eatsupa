// src/store/slices/index.js
// Export centralisé de tous les slices Redux

// Auth
export {
    default as authReducer,
    login,
    logout,
    register,
    checkSession,
    getProfile,
    updateProfile,
    clearError as clearAuthError,
    resetAuth,
    setSessionChecked,
    selectUser,
    selectToken,
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError,
    selectSessionChecked,
    selectUserRole,
    selectIsAdmin,
    selectIsRestaurateur,
  } from './authSlice';
  
  // Cart
  export {
    default as cartReducer,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    updateQuantity,
    clearCart,
    setRestaurant,
    selectCartItems,
    selectCartItemsCount,
    selectCartTotal,
    selectCartRestaurant,
    selectIsCartEmpty,
    selectPlatQuantity,
  } from './cartSlice';
  
  // Toast
  export {
    default as toastReducer,
    addToast,
    removeToast,
    clearAllToasts,
    setPosition as setToastPosition,
    setMaxToasts,
    selectToasts,
    selectToastPosition,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    TOAST_TYPES,
    TOAST_POSITIONS,
  } from './toastSlice';
  
  // Service Status
  export {
    default as serviceStatusReducer,
    checkServiceStatus,
    setOnlineStatus,
    setMaintenanceMode,
    setRestaurantStatus,
    clearServiceError,
    selectIsOnline,
    selectIsMaintenanceMode,
    selectServiceLoading,
    selectServiceError,
    selectRestaurantStatus,
    selectLastCheck,
  } from './serviceStatusSlice';