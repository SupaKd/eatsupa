// src/components/ui/StateViews.jsx
// Composants pour les états de chargement, erreur et vide
// Remplace les 30+ occurrences similaires dans l'app

import { memo } from 'react';
import { Loader2, AlertCircle, Package, RefreshCw } from 'lucide-react';
import Button from './Button';

// État de chargement
export const LoadingState = memo(function LoadingState({ 
  message = 'Chargement...', 
  size = 'md',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'loading-state--sm',
    md: 'loading-state--md',
    lg: 'loading-state--lg',
  };

  return (
    <div className={`loading-state ${sizeClasses[size]} ${className}`}>
      <Loader2 className="loading-state__spinner" />
      <p className="loading-state__message">{message}</p>
    </div>
  );
});

// État d'erreur
export const ErrorState = memo(function ErrorState({ 
  title = 'Erreur',
  message = 'Une erreur est survenue', 
  onRetry,
  retryLabel = 'Réessayer',
  className = '' 
}) {
  return (
    <div className={`error-state ${className}`}>
      <AlertCircle className="error-state__icon" size={48} />
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <Button 
          variant="primary" 
          icon={RefreshCw} 
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
});

// État vide
export const EmptyState = memo(function EmptyState({ 
  icon: Icon = Package,
  title = 'Aucun élément',
  message,
  action,
  actionLabel,
  onAction,
  className = '' 
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__icon">
        <Icon size={64} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {(action || onAction) && (
        action || (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
});

// Composant Message (succès/erreur/info/warning)
export const Message = memo(function Message({
  type = 'info',
  children,
  icon,
  onDismiss,
  className = '',
}) {
  const icons = {
    success: '✓',
    error: '!',
    warning: '⚠',
    info: 'i',
  };

  return (
    <div className={`message message--${type} ${className}`}>
      <span className="message__icon">{icon || icons[type]}</span>
      <span className="message__content">{children}</span>
      {onDismiss && (
        <button className="message__dismiss" onClick={onDismiss}>×</button>
      )}
    </div>
  );
});

// Skeleton pour le chargement progressif
export const Skeleton = memo(function Skeleton({
  width,
  height,
  variant = 'text',
  className = '',
}) {
  const variantClasses = {
    text: 'skeleton--text',
    circular: 'skeleton--circular',
    rectangular: 'skeleton--rectangular',
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '100px'),
  };

  return (
    <div 
      className={`skeleton ${variantClasses[variant]} ${className}`} 
      style={style}
    />
  );
});

// Card Skeleton pour les listes
export const CardSkeleton = memo(function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-skeleton">
          <Skeleton variant="rectangular" height="150px" />
          <div className="card-skeleton__content">
            <Skeleton width="60%" />
            <Skeleton width="80%" />
            <Skeleton width="40%" />
          </div>
        </div>
      ))}
    </>
  );
});