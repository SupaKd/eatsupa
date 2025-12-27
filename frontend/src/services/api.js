import axiosInstance from './axios';

// ========== AUTHENTIFICATION ==========

export const authAPI = {
  // Inscription
  register: (data) => axiosInstance.post('/auth/register', data),
  
  // Connexion
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  
  // Récupérer le profil
  getProfile: () => axiosInstance.get('/auth/profile'),
  
  // Mettre à jour le profil
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  
  // Changer le mot de passe
  changePassword: (data) => axiosInstance.put('/auth/change-password', data),
  
  // Mettre à jour la photo
  updatePhoto: (formData) => axiosInstance.put('/auth/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ========== RESTAURANTS ==========

export const restaurantAPI = {
  // Liste des restaurants
  getAll: (params) => axiosInstance.get('/restaurants', { params }),
  
  // Détail d'un restaurant
  getById: (id) => axiosInstance.get(`/restaurants/${id}`),
  
  // Restaurant du restaurateur connecté
  getMyRestaurant: () => axiosInstance.get('/restaurants/me/restaurant'),
  
  // Créer un restaurant
  create: (data) => axiosInstance.post('/restaurants', data),
  
  // Mettre à jour un restaurant
  update: (id, data) => axiosInstance.put(`/restaurants/${id}`, data),
  
  // Supprimer un restaurant
  delete: (id) => axiosInstance.delete(`/restaurants/${id}`),
  
  // Mettre à jour l'image
  updateImage: (id, formData) => axiosInstance.put(`/restaurants/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ========== CATÉGORIES ==========

export const categoryAPI = {
  // Liste des catégories d'un restaurant
  // Params: { include_plats: true } pour inclure les plats dans chaque catégorie
  getByRestaurant: (restaurantId, params = {}) => 
    axiosInstance.get(`/restaurants/${restaurantId}/categories`, { params }),
  
  // Créer une catégorie
  create: (restaurantId, data) => 
    axiosInstance.post(`/restaurants/${restaurantId}/categories`, data),
  
  // Mettre à jour une catégorie
  update: (restaurantId, id, data) => 
    axiosInstance.put(`/restaurants/${restaurantId}/categories/${id}`, data),
  
  // Supprimer une catégorie
  delete: (restaurantId, id) => 
    axiosInstance.delete(`/restaurants/${restaurantId}/categories/${id}`),
  
  // Réorganiser les catégories
  reorder: (restaurantId, data) => 
    axiosInstance.put(`/restaurants/${restaurantId}/categories/reorder`, data),
};

// ========== PLATS ==========

export const platAPI = {
  // Liste des plats d'un restaurant
  getByRestaurant: (restaurantId, params) => 
    axiosInstance.get(`/restaurants/${restaurantId}/plats`, { params }),
  
  // Détail d'un plat
  getById: (restaurantId, id) => 
    axiosInstance.get(`/restaurants/${restaurantId}/plats/${id}`),
  
  // Créer un plat
  create: (restaurantId, data) => 
    axiosInstance.post(`/restaurants/${restaurantId}/plats`, data),
  
  // Mettre à jour un plat
  update: (restaurantId, id, data) => 
    axiosInstance.put(`/restaurants/${restaurantId}/plats/${id}`, data),
  
  // Supprimer un plat
  delete: (restaurantId, id) => 
    axiosInstance.delete(`/restaurants/${restaurantId}/plats/${id}`),
  
  // Mettre à jour l'image d'un plat
  updateImage: (restaurantId, id, formData) => 
    axiosInstance.put(`/restaurants/${restaurantId}/plats/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Basculer la disponibilité
  toggleDisponibilite: (restaurantId, id) => 
    axiosInstance.patch(`/restaurants/${restaurantId}/plats/${id}/disponibilite`),
};

// ========== COMMANDES ==========

export const commandeAPI = {
  // Liste des commandes
  getAll: (params) => axiosInstance.get('/commandes', { params }),
  
  // Détail d'une commande
  getById: (id) => axiosInstance.get(`/commandes/${id}`),
  
  // Suivre une commande par token (pour invités)
  trackByToken: (token) => axiosInstance.get(`/commandes/suivi/${token}`),
  
  // Créer une commande
  create: (data) => axiosInstance.post('/commandes', data),
  
  // Mettre à jour le statut
  updateStatus: (id, statut) => 
    axiosInstance.put(`/commandes/${id}/statut`, { statut }),
  
  // Annuler une commande
  cancel: (id) => axiosInstance.post(`/commandes/${id}/annuler`),
  
  // Statistiques
  getStats: (params) => axiosInstance.get('/commandes/statistiques', { params }),
};

// ========== PAIEMENT ==========

export const paiementAPI = {
  // Récupérer les paramètres de paiement d'un restaurant
  getSettings: (restaurantId) => 
    axiosInstance.get(`/paiement/restaurants/${restaurantId}/settings`),
  
  // Mettre à jour les paramètres de paiement
  updateSettings: (restaurantId, data) => 
    axiosInstance.put(`/paiement/restaurants/${restaurantId}/settings`, data),
  
  // Créer un compte Stripe Connect
  createStripeAccount: (restaurantId) => 
    axiosInstance.post(`/paiement/restaurants/${restaurantId}/stripe/connect`),
  
  // Compléter l'onboarding Stripe
  completeStripeOnboarding: (restaurantId) => 
    axiosInstance.post(`/paiement/restaurants/${restaurantId}/stripe/complete-onboarding`),
  
  // Obtenir le lien du dashboard Stripe
  getStripeDashboard: (restaurantId) => 
    axiosInstance.get(`/paiement/restaurants/${restaurantId}/stripe/dashboard`),
  
  // Créer une session de paiement
  createPaymentSession: (commandeId) => 
    axiosInstance.post('/paiement/create-session', { commande_id: commandeId }),
  
  // Vérifier le statut d'un paiement
  checkPaymentStatus: (commandeId) => 
    axiosInstance.get(`/paiement/status/${commandeId}`),
  
  // Simuler un paiement (demo)
  simulatePayment: (commandeId) => 
    axiosInstance.post(`/paiement/demo/success/${commandeId}`),
  
  // Marquer comme payé (paiement sur place)
  markAsPaid: (commandeId) => 
    axiosInstance.post(`/paiement/commandes/${commandeId}/mark-paid`),
};

// ========== ADMIN ==========

export const adminAPI = {
  // Dashboard
  getDashboard: () => axiosInstance.get('/admin/dashboard'),
  
  // Utilisateurs
  users: {
    getAll: (params) => axiosInstance.get('/admin/users', { params }),
    getById: (id) => axiosInstance.get(`/admin/users/${id}`),
    create: (data) => axiosInstance.post('/admin/users', data),
    update: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
    delete: (id) => axiosInstance.delete(`/admin/users/${id}`),
  },
  
  // Restaurants
  restaurants: {
    getAll: (params) => axiosInstance.get('/admin/restaurants', { params }),
    toggleStatus: (id) => axiosInstance.patch(`/admin/restaurants/${id}/toggle-status`),
  },
};

// Export global de toutes les API
export const api = {
  auth: authAPI,
  restaurant: restaurantAPI,
  category: categoryAPI,
  plat: platAPI,
  commande: commandeAPI,
  paiement: paiementAPI,
  admin: adminAPI,
};

export default api;