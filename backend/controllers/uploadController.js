const path = require('path');
const { deleteFile } = require('../utils/upload');

/**
 * Upload d'une image
 * POST /api/upload/image
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Construire l'URL de l'image
    const imageUrl = `/uploads/images/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Erreur upload image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'image'
    });
  }
};

/**
 * Suppression d'une image
 * DELETE /api/upload/image/:filename
 */
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Nom de fichier requis'
      });
    }

    const filePath = path.join('uploads', 'images', filename);
    await deleteFile(filePath);

    res.json({
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'image'
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage
};