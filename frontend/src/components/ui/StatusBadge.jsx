// src/components/ui/StatusBadge.jsx
// Composant Badge de statut réutilisable
// Remplace les 20+ occurrences de badges similaires dans l'app

import { memo } from 'react';
import * as Icons from 'lucide-react';

const StatusBadge = memo(function StatusBadge({ 
  status, 
  label, 
  color = 'gray', 
  icon, 
  size = 'md',
  showIcon = true,
  className = '' 
}) {
  const Icon = icon ? (typeof icon === 'string' ? Icons[icon] : icon) : null;
  
  const sizeClasses = {
    sm: 'status-badge--sm',
    md: 'status-badge--md',
    lg: 'status-badge--lg',
  };

  return (
    <span className={`status-badge status-badge--${color} ${sizeClasses[size]} ${className}`}>
      {showIcon && Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      <span>{label || status}</span>
    </span>
  );
});

export default StatusBadge;

// Variantes pré-configurées pour les cas courants
export const OrderStatusBadge = memo(function OrderStatusBadge({ status, ...props }) {
  const statusConfig = {
    en_attente: { label: 'En attente', color: 'yellow', icon: 'Clock' },
    confirmee: { label: 'Confirmée', color: 'blue', icon: 'CheckCircle' },
    en_preparation: { label: 'En préparation', color: 'orange', icon: 'ChefHat' },
    prete: { label: 'Prête', color: 'green', icon: 'CheckCircle' },
    livree: { label: 'Livrée', color: 'green', icon: 'Truck' },
    recuperee: { label: 'Récupérée', color: 'green', icon: 'PartyPopper' },
    annulee: { label: 'Annulée', color: 'red', icon: 'XCircle' },
  };

  const config = statusConfig[status] || { label: status, color: 'gray', icon: 'AlertCircle' };
  return <StatusBadge {...config} {...props} />;
});

export const PaymentStatusBadge = memo(function PaymentStatusBadge({ status, ...props }) {
  const statusConfig = {
    en_attente: { label: 'En attente', color: 'yellow' },
    paye: { label: 'Payé', color: 'green' },
    echoue: { label: 'Échoué', color: 'red' },
    rembourse: { label: 'Remboursé', color: 'blue' },
  };

  const config = statusConfig[status] || { label: status, color: 'gray' };
  return <StatusBadge {...config} showIcon={false} {...props} />;
});

export const RoleBadge = memo(function RoleBadge({ role, ...props }) {
  const roleConfig = {
    admin: { label: 'Administrateur', color: 'red' },
    restaurateur: { label: 'Restaurateur', color: 'orange' },
    client: { label: 'Client', color: 'blue' },
  };

  const config = roleConfig[role] || { label: role, color: 'gray' };
  return <StatusBadge {...config} showIcon={false} {...props} />;
});