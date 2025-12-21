// Middleware de gestion des erreurs globales
const errorHandler = (err, req, res, next) => {
    console.error('Erreur:', err);
  
    // Erreurs de syntaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        success: false,
        message: 'JSON invalide dans la requête.'
      });
    }
  
    // Erreurs MySQL
    if (err.code) {
      switch (err.code) {
        case 'ER_DUP_ENTRY':
          return res.status(409).json({
            success: false,
            message: 'Cette entrée existe déjà.'
          });
        case 'ER_NO_REFERENCED_ROW_2':
          return res.status(400).json({
            success: false,
            message: 'Référence invalide. L\'élément lié n\'existe pas.'
          });
        case 'ER_ROW_IS_REFERENCED_2':
          return res.status(400).json({
            success: false,
            message: 'Impossible de supprimer. Cet élément est utilisé ailleurs.'
          });
        case 'ECONNREFUSED':
          return res.status(503).json({
            success: false,
            message: 'Service de base de données indisponible.'
          });
      }
    }
  
    // Erreurs Multer (upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Maximum 5MB.'
      });
    }
  
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Type de fichier non autorisé.'
      });
    }
  
    // Erreur générique
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Erreur serveur interne.',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  // Middleware pour les routes non trouvées
  const notFound = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Route non trouvée: ${req.method} ${req.originalUrl}`
    });
  };
  
  module.exports = { errorHandler, notFound };