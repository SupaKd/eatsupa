// src/components/ui/Button.jsx
// Composant Button réutilisable avec variantes et états de chargement
// Remplace les 50+ boutons similaires dans l'app

import { memo, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = memo(
  forwardRef(function Button(
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      type = "button",
      className = "",
      ...props
    },
    ref
  ) {
    const baseClass = "btn";

    const variantClasses = {
      primary: "btn--primary",
      secondary: "btn--secondary",
      danger: "btn--danger",
      ghost: "btn--ghost",
      outline: "btn--outline",
    };

    const sizeClasses = {
      sm: "btn--sm",
      md: "btn--md",
      lg: "btn--lg",
    };

    const classes = [
      baseClass,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && "btn--full",
      loading && "btn--loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 size={iconSize} className="btn__spinner" />
            <span>
              {typeof children === "string" ? children : "Chargement..."}
            </span>
          </>
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon size={iconSize} />}
            {children && <span>{children}</span>}
            {Icon && iconPosition === "right" && <Icon size={iconSize} />}
          </>
        )}
      </button>
    );
  })
);

export default Button;

// Variantes pré-configurées
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => (
  <Button variant="secondary" {...props} />
);
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;

// Bouton icône seule
export const IconButton = memo(
  forwardRef(function IconButton(
    {
      icon: Icon,
      size = "md",
      variant = "ghost",
      label,
      className = "",
      ...props
    },
    ref
  ) {
    const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

    return (
      <button
        ref={ref}
        type="button"
        className={`icon-btn icon-btn--${variant} icon-btn--${size} ${className}`}
        aria-label={label}
        title={label}
        {...props}
      >
        <Icon size={iconSize} />
      </button>
    );
  })
);
