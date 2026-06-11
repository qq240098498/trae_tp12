import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Empty({ icon, title, description, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {icon && <div className="mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-medium text-gray-700 mb-1">{title}</h3>}
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
    </div>
  );
}
