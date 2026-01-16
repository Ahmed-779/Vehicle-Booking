import React from 'react';
import { getInitials, cn } from '../../utils';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color = '#6366f1',
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white',
        'ring-2 ring-white shadow-soft',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

// Avatar with user info
interface UserAvatarProps extends AvatarProps {
  subtitle?: string;
  showInfo?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  color,
  size = 'md',
  subtitle,
  showInfo = true,
  className,
}) => {
  if (!showInfo) {
    return <Avatar name={name} color={color} size={size} className={className} />;
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar name={name} color={color} size={size} />
      <div className="min-w-0">
        <p className="font-semibold text-gray-800 truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
