import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-glow hover:-translate-y-0.5 focus:ring-primary-400 active:translate-y-0 active:shadow-none',
    secondary: 'bg-white text-primary-600 border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:-translate-y-0.5 focus:ring-primary-300 active:translate-y-0',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-glow-accent hover:-translate-y-0.5 focus:ring-accent-400 active:translate-y-0 active:shadow-none',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 focus:ring-red-400 active:translate-y-0',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
