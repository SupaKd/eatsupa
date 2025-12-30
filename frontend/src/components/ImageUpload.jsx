import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { getImageUrl } from '../services/imageUtils';

function ImageUpload({ 
  value, 
  onChange, 
  onUpload,
  placeholder = "Glissez-déposez une image ou cliquez pour sélectionner",
  maxSize = 5, // en MB
  accept = "image/jpeg,image/png,image/gif,image/webp"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Mettre à jour la preview quand value change
  useEffect(() => {
    if (value) {
      setPreview(getImageUrl(value));
    } else {
      setPreview(null);
    }
  }, [value]);

  const validateFile = (file) => {
    // Vérifier le type
    const allowedTypes = accept.split(',').map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      return "Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP.";
    }

    // Vérifier la taille
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Le fichier est trop volumineux. Maximum: ${maxSize}MB`;
    }

    return null;
  };

  const handleFile = useCallback(async (file) => {
    setError(null);

    // Validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Créer une preview locale immédiatement
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Si une fonction d'upload est fournie, l'utiliser
    if (onUpload) {
      setIsUploading(true);
      try {
        const uploadedUrl = await onUpload(file);
        console.log('URL uploadée:', uploadedUrl);
        
        // Nettoyer l'URL blob
        URL.revokeObjectURL(localPreview);
        
        // Construire l'URL complète pour la preview
        setPreview(getImageUrl(uploadedUrl));
        
        // Retourner l'URL relative pour stockage en BDD
        onChange?.(uploadedUrl);
      } catch (err) {
        setError(err.message || "Erreur lors de l'upload");
        setPreview(value ? getImageUrl(value) : null);
        URL.revokeObjectURL(localPreview);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Sinon, retourner le fichier directement
      onChange?.(file);
    }
  }, [onUpload, onChange, value, maxSize, accept]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload">
      <div
        className={`image-upload__dropzone ${isDragging ? 'image-upload__dropzone--dragging' : ''} ${preview ? 'image-upload__dropzone--has-image' : ''} ${error ? 'image-upload__dropzone--error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="image-upload__input"
        />

        {isUploading ? (
          <div className="image-upload__loading">
            <Loader2 className="image-upload__spinner" size={40} />
            <span>Upload en cours...</span>
          </div>
        ) : preview ? (
          <div className="image-upload__preview">
            <img 
              src={preview} 
              alt="Preview" 
              onError={(e) => {
                console.error('Erreur chargement image:', preview);
                e.target.style.display = 'none';
              }}
            />
            <button
              type="button"
              className="image-upload__remove"
              onClick={handleRemove}
              aria-label="Supprimer l'image"
            >
              <X size={20} />
            </button>
            <div className="image-upload__overlay">
              <Upload size={24} />
              <span>Changer l'image</span>
            </div>
          </div>
        ) : (
          <div className="image-upload__placeholder">
            <div className="image-upload__icon">
              <ImageIcon size={48} />
            </div>
            <p className="image-upload__text">{placeholder}</p>
            <p className="image-upload__hint">
              JPEG, PNG, GIF ou WebP • Max {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="image-upload__error">{error}</p>
      )}
    </div>
  );
}

ImageUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onUpload: PropTypes.func,
  placeholder: PropTypes.string,
  maxSize: PropTypes.number,
  accept: PropTypes.string
};

export default ImageUpload;