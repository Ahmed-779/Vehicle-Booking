import React from 'react';
import { Loader2, Car } from 'lucide-react';
import { cn } from '../../utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={cn('animate-spin text-primary-500', sizes[size], className)} />
  );
};

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50/30">
      <div className="relative">
        {/* Animated car icon */}
        <div className="animate-bounce-slow">
          <div className="p-4 bg-primary-100 rounded-full">
            <Car className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        {/* Road underneath */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-300 rounded-full">
          <div className="w-8 h-1 bg-primary-400 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="mt-8 text-gray-600 font-medium animate-pulse">{message}</p>
    </div>
  );
};

// Skeleton loading component
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded-2xl',
        className
      )}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC = () => {
  return (
    <div className="card">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};

// Booking skeleton
export const BookingSkeleton: React.FC = () => {
  return (
    <div className="card flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  );
};
