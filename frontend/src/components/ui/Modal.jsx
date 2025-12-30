// src/components/ui/Modal.jsx
// Composant Modal générique réutilisable
// Remplace CategoryModal, PlatModal, UserModal, OrderDetailsModal

import { memo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  className = '',
}) {
  // Fermer avec Escape
  const handleKeyDown = useCallback((e) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Bloquer le scroll du body quand ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'modal--sm',
    md: 'modal--md',
    lg: 'modal--lg',
    xl: 'modal--xl',
    full: 'modal--full',
  };

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={closeOnOverlay ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`modal ${sizeClasses[size]} ${className}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          {showCloseButton && (
            <button 
              onClick={onClose} 
              className="modal__close"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="modal__content">
          {children}
        </div>

        {/* Footer optionnel */}
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

export default Modal;

// Hook pour gérer l'état d'un modal
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}

// Composant ConfirmModal pour les confirmations
export const ConfirmModal = memo(function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="modal__message">{message}</p>
    </Modal>
  );
});

// Import useState pour useModal
import { useState } from 'react';