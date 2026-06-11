import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  icon?: ReactNode;
  extra?: ReactNode;
}

export default function Card({
  title,
  children,
  className,
  headerClassName,
  bodyClassName,
  icon,
  extra,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden',
        className
      )}
    >
      {(title || extra) && (
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 border-b border-gray-100',
            headerClassName
          )}
        >
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-primary-500 w-5 h-5 flex items-center justify-center">
                {icon}
              </span>
            )}
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            )}
          </div>
          {extra}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </motion.div>
  );
}
