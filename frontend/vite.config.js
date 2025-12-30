// vite.config.js - Configuration optimisée pour la production
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Alias pour imports plus propres
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  
  // Optimisations de build
  build: {
    // Taille de chunk warning (en Ko)
    chunkSizeWarningLimit: 500,
    
    // Configuration Rollup pour le code splitting
    rollupOptions: {
      output: {
        // Séparation manuelle des chunks pour un meilleur caching
        manualChunks: {
          // Vendor chunks - bibliothèques tierces
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-icons': ['lucide-react'],
          
          // Chunks par fonctionnalité
          'admin': [
            './src/pages/admin/AdminDashboardPage.jsx',
            './src/pages/admin/AdminUsersPage.jsx',
            './src/pages/admin/AdminRestaurantsPage.jsx',
            './src/pages/admin/AdminOrdersPage.jsx',
          ],
          'restaurant': [
            './src/pages/restaurant/RestaurantDashboardPage.jsx',
            './src/pages/restaurant/RestaurantOrdersPage.jsx',
            './src/pages/restaurant/RestaurantMenuPage.jsx',
            './src/pages/restaurant/RestaurantSettingsPage.jsx',
            './src/pages/restaurant/RestaurantPaymentPage.jsx',
          ],
        },
        
        // Nommage des fichiers pour le cache-busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Supprimer les console.log en production
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Génération du rapport de taille
    reportCompressedSize: true,
    
    // Source maps en production (optionnel)
    sourcemap: false,
  },
  
  // Optimisations serveur de dev
  server: {
    port: 5173,
    strictPort: true,
    
    // Proxy pour l'API en développement
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'lucide-react',
    ],
  },
});