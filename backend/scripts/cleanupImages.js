/**
 * Script de maintenance pour nettoyer les images orphelines
 * et optimiser l'espace de stockage
 * 
 * Usage: node scripts/cleanupImages.js [--dry-run]
 */

require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { formatBytes } = require('../utils/imageCompression');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'images');
const DRY_RUN = process.argv.includes('--dry-run');

async function getUsedImages() {
  const usedImages = new Set();

  // Images des restaurants
  const [restaurants] = await pool.query('SELECT image FROM restaurants WHERE image IS NOT NULL');
  restaurants.forEach(r => {
    if (r.image && r.image.startsWith('/uploads')) {
      usedImages.add(path.basename(r.image));
    }
  });

  // Images des plats
  const [plats] = await pool.query('SELECT image_url FROM plats WHERE image_url IS NOT NULL');
  plats.forEach(p => {
    if (p.image_url && p.image_url.startsWith('/uploads')) {
      usedImages.add(path.basename(p.image_url));
    }
  });

  // Images des utilisateurs (si applicable)
  const [users] = await pool.query('SELECT photo_url FROM utilisateurs WHERE photo_url IS NOT NULL');
  users.forEach(u => {
    if (u.photo_url && u.photo_url.startsWith('/uploads')) {
      usedImages.add(path.basename(u.photo_url));
    }
  });

  return usedImages;
}

async function getStoredImages() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    return [];
  }

  return fs.readdirSync(UPLOADS_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });
}

async function cleanup() {
  console.log('🔍 Analyse des images...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  Mode simulation (--dry-run) - Aucun fichier ne sera supprimé\n');
  }

  try {
    const usedImages = await getUsedImages();
    const storedImages = await getStoredImages();

    console.log(`📊 Statistiques:`);
    console.log(`   - Images en base de données: ${usedImages.size}`);
    console.log(`   - Images sur le disque: ${storedImages.length}\n`);

    // Trouver les images orphelines
    const orphanedImages = storedImages.filter(img => !usedImages.has(img));
    
    if (orphanedImages.length === 0) {
      console.log('✅ Aucune image orpheline trouvée!');
      return;
    }

    console.log(`🗑️  Images orphelines trouvées: ${orphanedImages.length}\n`);

    let totalSize = 0;
    let deletedCount = 0;

    for (const image of orphanedImages) {
      const imagePath = path.join(UPLOADS_DIR, image);
      
      try {
        const stats = fs.statSync(imagePath);
        totalSize += stats.size;

        if (DRY_RUN) {
          console.log(`   [SIMULATION] Supprimerait: ${image} (${formatBytes(stats.size)})`);
        } else {
          fs.unlinkSync(imagePath);
          console.log(`   ✅ Supprimé: ${image} (${formatBytes(stats.size)})`);
          deletedCount++;
        }
      } catch (err) {
        console.error(`   ❌ Erreur pour ${image}:`, err.message);
      }
    }

    console.log(`\n📈 Résumé:`);
    if (DRY_RUN) {
      console.log(`   - Espace récupérable: ${formatBytes(totalSize)}`);
      console.log(`   - Fichiers à supprimer: ${orphanedImages.length}`);
      console.log(`\n💡 Exécutez sans --dry-run pour supprimer les fichiers`);
    } else {
      console.log(`   - Espace récupéré: ${formatBytes(totalSize)}`);
      console.log(`   - Fichiers supprimés: ${deletedCount}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter
cleanup();