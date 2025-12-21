require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const { testConnection } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware pour injecter io dans les requêtes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ========== MIDDLEWARES ==========

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// ========== ROUTES ==========

app.use('/api', routes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========== SOCKET.IO ==========

io.on('connection', (socket) => {
  console.log('🔌 Nouvelle connexion WebSocket:', socket.id);

  // Rejoindre une salle de restaurant (pour les restaurateurs)
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`📍 Socket ${socket.id} a rejoint restaurant_${restaurantId}`);
  });

  // Rejoindre une salle utilisateur (pour les clients)
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📍 Socket ${socket.id} a rejoint user_${userId}`);
  });

  // Quitter une salle
  socket.on('leave_restaurant', (restaurantId) => {
    socket.leave(`restaurant_${restaurantId}`);
    console.log(`🚪 Socket ${socket.id} a quitté restaurant_${restaurantId}`);
  });

  socket.on('leave_user', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`🚪 Socket ${socket.id} a quitté user_${userId}`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('❌ Déconnexion WebSocket:', socket.id);
  });
});

// ========== GESTION DES ERREURS ==========

app.use(notFound);
app.use(errorHandler);

// ========== DÉMARRAGE DU SERVEUR ==========

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Restaurant API Server                        ║
║                                                   ║
║   Port: ${PORT}                                      ║
║   Environnement: ${process.env.NODE_ENV || 'development'}                    ║
║   API: http://localhost:${PORT}/api                  ║
║   Health: http://localhost:${PORT}/health            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Fermeture du serveur...');
  server.close(() => {
    console.log('Serveur fermé.');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };