// src/components/ui/Card.jsx
// Composant Card réutilisable

import { memo } from 'react';

const Card = memo(function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) {
  const paddingClasses = {
    none: 'card--p-none',
    sm: 'card--p-sm',
    md: 'card--p-md',
    lg: 'card--p-lg',
  };

  const variantClasses = {
    default: '',
    elevated: 'card--elevated',
    outlined: 'card--outlined',
  };

  return (
    <div 
      className={`card ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="card__header">
          <div className="card__header-content">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card__header-action">{headerAction}</div>
          )}
        </div>
      )}
      
      <div className="card__body">
        {children}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
});

export default Card;

// Card cliquable/lien
export const CardLink = memo(function CardLink({
  to,
  href,
  onClick,
  children,
  className = '',
  ...props
}) {
  const Component = to ? 'a' : href ? 'a' : 'div';
  const linkProps = to ? { href: to } : href ? { href } : {};
  
  return (
    <Component 
      className={`card card--clickable ${className}`}
      onClick={onClick}
      {...linkProps}
      {...props}
    >
      {children}
    </Component>
  );
});