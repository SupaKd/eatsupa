const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Configuration de compression par type d'image
 */
const COMPRESSION_CONFIG = {
  // Images de restaurants (bannières) - plus grandes
  restaurant: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 80
  },
  // Images de plats - taille moyenne
  plat: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 75
  },
  // Miniatures pour les listes
  thumbnail: {
    maxWidth: 400,
    maxHeight: 300,
    quality: 70
  },
  // Profil utilisateur
  profile: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 80
  }
};

/**
 * Compresse et redimensionne une image
 * @param {string} inputPath - Chemin de l'image source
 * @param {string} outputPath - Chemin de sortie (optionnel, écrase l'original si non fourni)
 * @param {string} type - Type d'image (restaurant, plat, thumbnail, profile)
 * @returns {Promise<{originalSize: number, compressedSize: number, savings: string}>}
 */
const compressImage = async (inputPath, outputPath = null, type = 'plat') => {
  const config = COMPRESSION_CONFIG[type] || COMPRESSION_CONFIG.plat;
  const finalOutputPath = outputPath || inputPath;
  
  // Récupérer la taille originale
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;

  // Créer un chemin temporaire si on écrase l'original
  const tempPath = outputPath ? null : `${inputPath}.tmp`;
  const targetPath = tempPath || finalOutputPath;

  try {
    await sharp(inputPath)
      .resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true // Ne pas agrandir les petites images
      })
      .webp({ quality: config.quality }) // Convertir en WebP (meilleure compression)
      .toFile(targetPath);

    // Si on utilise un fichier temporaire, remplacer l'original
    if (tempPath) {
      fs.unlinkSync(inputPath);
      
      // Renommer avec extension .webp
      const webpPath = inputPath.replace(/\.[^.]+$/, '.webp');
      fs.renameSync(tempPath, webpPath);
      
      const compressedStats = fs.statSync(webpPath);
      const compressedSize = compressedStats.size;
      const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      return {
        originalSize,
        compressedSize,
        savings: `${savings}%`,
        newPath: webpPath,
        newFilename: path.basename(webpPath)
      };
    }

    const compressedStats = fs.statSync(targetPath);
    const compressedSize = compressedStats.size;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    return {
      originalSize,
      compressedSize,
      savings: `${savings}%`,
      newPath: targetPath,
      newFilename: path.basename(targetPath)
    };
  } catch (error) {
    // Nettoyer le fichier temporaire en cas d'erreur
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
};

/**
 * Compresse une image et garde le format original (JPEG/PNG)
 * Utile si WebP n'est pas souhaité
 */
const compressImageKeepFormat = async (inputPath, outputPath = null, type = 'plat') => {
  const config = COMPRESSION_CONFIG[type] || COMPRESSION_CONFIG.plat;
  const finalOutputPath = outputPath || inputPath;
  const ext = path.extname(inputPath).toLowerCase();

  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;

  const tempPath = outputPath ? null : `${inputPath}.tmp`;
  const targetPath = tempPath || finalOutputPath;

  try {
    let sharpInstance = sharp(inputPath)
      .resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Appliquer la compression selon le format
    if (ext === '.png') {
      sharpInstance = sharpInstance.png({ 
        quality: config.quality,
        compressionLevel: 9 
      });
    } else if (ext === '.gif') {
      sharpInstance = sharpInstance.gif();
    } else {
      // JPEG par défaut
      sharpInstance = sharpInstance.jpeg({ 
        quality: config.quality,
        mozjpeg: true // Meilleure compression
      });
    }

    await sharpInstance.toFile(targetPath);

    if (tempPath) {
      fs.unlinkSync(inputPath);
      fs.renameSync(tempPath, inputPath);
    }

    const compressedStats = fs.statSync(finalOutputPath);
    const compressedSize = compressedStats.size;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    return {
      originalSize,
      compressedSize,
      savings: `${savings}%`,
      newPath: finalOutputPath,
      newFilename: path.basename(finalOutputPath)
    };
  } catch (error) {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
};

/**
 * Génère une miniature
 */
const generateThumbnail = async (inputPath, outputDir = null) => {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const thumbFilename = `${filename}_thumb.webp`;
  const thumbPath = outputDir 
    ? path.join(outputDir, thumbFilename)
    : path.join(path.dirname(inputPath), thumbFilename);

  await sharp(inputPath)
    .resize(COMPRESSION_CONFIG.thumbnail.maxWidth, COMPRESSION_CONFIG.thumbnail.maxHeight, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: COMPRESSION_CONFIG.thumbnail.quality })
    .toFile(thumbPath);

  return {
    path: thumbPath,
    filename: thumbFilename
  };
};

/**
 * Formate la taille en bytes en format lisible
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  compressImage,
  compressImageKeepFormat,
  generateThumbnail,
  formatBytes,
  COMPRESSION_CONFIG
};