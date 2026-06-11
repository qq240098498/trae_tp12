import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-500',
  danger: 'bg-danger-100 text-danger-500',
  info: 'bg-blue-50 text-blue-600',
  default: 'bg-gray-100 text-gray-600',
};

export default function Badge({
  variant = 'default',
  children,
  className,
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
