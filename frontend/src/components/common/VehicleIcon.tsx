import React from 'react';
import { Car } from 'lucide-react';
import { VehicleType } from '../../types';
import { cn } from '../../utils';

interface VehicleIconProps {
  type: VehicleType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

// Custom SVG icons for vehicles
const CarIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

const VanIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H3c-.55 0-1 .45-1 1v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4.99zM7 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3-8H4V7h12v3z"/>
  </svg>
);

const SuvIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v9c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-9l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l2-5h10l2 5H5z"/>
  </svg>
);

const TruckIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-8.5l1.96 2.5H17V9.5h2.5zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

export const VehicleIcon: React.FC<VehicleIconProps> = ({
  type,
  size = 'md',
  color,
  className,
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const iconClass = cn(sizes[size], className);
  const style = color ? { color } : undefined;

  switch (type) {
    case VehicleType.CAR:
      return <CarIcon className={iconClass} style={style} />;
    case VehicleType.VAN:
      return <VanIcon className={iconClass} style={style} />;
    case VehicleType.SUV:
      return <SuvIcon className={iconClass} style={style} />;
    case VehicleType.TRUCK:
      return <TruckIcon className={iconClass} style={style} />;
    default:
      return <Car className={iconClass} style={style} />;
  }
};

// Badge with vehicle icon
interface VehicleBadgeProps {
  vehicle: {
    name: string;
    type: VehicleType;
    color: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const VehicleBadge: React.FC<VehicleBadgeProps> = ({
  vehicle,
  size = 'md',
  showName = true,
}) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium',
        sizes[size]
      )}
      style={{
        backgroundColor: `${vehicle.color}20`,
        color: vehicle.color,
      }}
    >
      <VehicleIcon type={vehicle.type} size={iconSizes[size]} />
      {showName && <span className="truncate max-w-[150px]">{vehicle.name}</span>}
    </div>
  );
};

// Fun car illustration for landing page
export const CarIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 100" fill="none" className={cn('w-full', className)}>
    {/* Road */}
    <rect x="0" y="75" width="200" height="10" rx="5" fill="#e5e7eb" />
    <rect x="20" y="78" width="30" height="4" rx="2" fill="#d1d5db" />
    <rect x="70" y="78" width="30" height="4" rx="2" fill="#d1d5db" />
    <rect x="120" y="78" width="30" height="4" rx="2" fill="#d1d5db" />
    <rect x="170" y="78" width="20" height="4" rx="2" fill="#d1d5db" />
    
    {/* Car body */}
    <path
      d="M40 55 Q50 25 100 25 Q150 25 160 55 L165 60 Q165 70 155 70 L45 70 Q35 70 35 60 Z"
      fill="#06b6d4"
      className="animate-float"
    />
    
    {/* Windows */}
    <path
      d="M55 55 Q60 35 100 35 Q140 35 145 55 Z"
      fill="#e0f2fe"
    />
    
    {/* Window divider */}
    <rect x="98" y="35" width="4" height="20" fill="#06b6d4" />
    
    {/* Headlights */}
    <ellipse cx="155" cy="55" rx="5" ry="4" fill="#fef3c7" />
    <ellipse cx="45" cy="55" rx="5" ry="4" fill="#fef3c7" />
    
    {/* Wheels */}
    <circle cx="60" cy="70" r="12" fill="#374151" />
    <circle cx="60" cy="70" r="6" fill="#9ca3af" />
    <circle cx="140" cy="70" r="12" fill="#374151" />
    <circle cx="140" cy="70" r="6" fill="#9ca3af" />
    
    {/* Smile on the car */}
    <path
      d="M90 50 Q100 55 110 50"
      stroke="#0891b2"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Eyes */}
    <ellipse cx="80" cy="43" rx="3" ry="4" fill="#0891b2" />
    <ellipse cx="120" cy="43" rx="3" ry="4" fill="#0891b2" />
  </svg>
);
