import axiosInstance from './axios';

/**
 * Service d'upload de fichiers
 */
const uploadService = {
  /**
   * Upload une image
   * @param {File} file - Le fichier image à uploader
   * @returns {Promise<string>} - L'URL de l'image uploadée
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      return response.data.data.url;
    }

    throw new Error(response.data.message || "Erreur lors de l'upload");
  },

  /**
   * Supprime une image
   * @param {string} filename - Le nom du fichier à supprimer
   */
  async deleteImage(filename) {
    const response = await axiosInstance.delete(`/upload/image/${filename}`);
    return response.data;
  },

  /**
   * Extrait le nom du fichier d'une URL
   * @param {string} url - L'URL de l'image
   * @returns {string|null} - Le nom du fichier ou null
   */
  getFilenameFromUrl(url) {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
};

export default uploadService;