const path = require('path');
const { deleteFile } = require('../utils/upload');
const { compressImage, formatBytes } = require('../utils/imageCompression');

/**
 * Upload d'une image avec compression automatique
 * POST /api/upload/image
 * Query params:
 *   - type: restaurant | plat | profile (défaut: plat)
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const imageType = req.query.type || 'plat';
    const originalPath = req.file.path;
    let finalUrl = `/uploads/images/${req.file.filename}`;
    let compressionResult = null;

    try {
      // Compresser l'image (convertit en WebP)
      compressionResult = await compressImage(originalPath, null, imageType);
      
      // Mettre à jour l'URL avec le nouveau nom de fichier
      if (compressionResult.newFilename !== req.file.filename) {
        finalUrl = `/uploads/images/${compressionResult.newFilename}`;
      }

      console.log(`✅ Image compressée: ${formatBytes(compressionResult.originalSize)} → ${formatBytes(compressionResult.compressedSize)} (${compressionResult.savings} économisés)`);
    } catch (compressionError) {
      // Si la compression échoue, garder l'image originale
      console.error('⚠️ Compression échouée (image originale conservée):', compressionError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        filename: compressionResult?.newFilename || req.file.filename,
        originalName: req.file.originalname,
        size: compressionResult?.compressedSize || req.file.size,
        originalSize: req.file.size,
        savings: compressionResult?.savings || '0%',
        mimetype: compressionResult ? 'image/webp' : req.file.mimetype,
        url: finalUrl
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