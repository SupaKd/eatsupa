const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

// Upload d'une image (authentification requise)
router.post('/image', auth, upload.single('image'), uploadImage);

// Suppression d'une image (authentification requise)
router.delete('/image/:filename', auth, deleteImage);

module.exports = router;