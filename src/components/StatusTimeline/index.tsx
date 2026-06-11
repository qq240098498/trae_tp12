import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Home,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface StatusLog {
  status: OrderStatus;
  time: string;
  note?: string;
  operator?: string;
}

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  statusLogs: StatusLog[];
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  pending: {
    label: '待确认',
    icon: Clock,
    variant: 'warning',
    color: 'text-warning-500',
    bgColor: 'bg-warning-100',
    description: '订单已提交，等待确认',
  },
  confirmed: {
    label: '已确认',
    icon: CheckCircle2,
    variant: 'info',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: '订单已确认，准备取件',
  },
  picked_up: {
    label: '已取件',
    icon: Package,
    variant: 'info',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: '宠物已成功取件',
  },
  in_transit: {
    label: '运输中',
    icon: Truck,
    variant: 'warning',
    color: 'text-primary-500',
    bgColor: 'bg-primary-100',
    description: '正在运输途中',
  },
  delivered: {
    label: '已送达',
    icon: Home,
    variant: 'success',
    color: 'text-success-600',
    bgColor: 'bg-success-100',
    description: '已安全送达目的地',
  },
  cancelled: {
    label: '已取消',
    icon: AlertCircle,
    variant: 'danger',
    color: 'text-danger-500',
    bgColor: 'bg-danger-100',
    description: '订单已取消',
  },
};

const statusOrder: OrderStatus[] = [
  'pending',
  'confirmed',
  'picked_up',
  'in_transit',
  'delivered',
];

export default function StatusTimeline({
  currentStatus,
  statusLogs,
  className,
}: StatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const getStatusLog = (status: OrderStatus): StatusLog | undefined => {
    return statusLogs.find((log) => log.status === status);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={statusConfig[currentStatus].variant}>
          {statusConfig[currentStatus].label}
        </Badge>
        <span className="text-sm text-gray-500">
          {statusConfig[currentStatus].description}
        </span>
      </div>

      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

        {(isCancelled ? (['cancelled'] as OrderStatus[]) : statusOrder).map((status, index) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const log = getStatusLog(status);
          const statusIdx = statusOrder.indexOf(status);
          const isCompleted =
            !isCancelled && statusIdx !== -1 && statusIdx < currentIndex;
          const isCurrent = status === currentStatus;
          const isPending = !isCompleted && !isCurrent && !isCancelled;

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className={cn('relative mb-6 last:mb-0')}
            >
              <div
                className={cn(
                  'absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted &&
                    'bg-success-500 border-success-500 text-white shadow-lg shadow-success-100',
                  isCurrent &&
                    cn(
                      config.bgColor,
                      'border-current shadow-lg animate-pulse-soft',
                      config.color
                    ),
                  isPending && 'bg-white border-gray-200 text-gray-300',
                  isCancelled &&
                    'bg-danger-500 border-danger-500 text-white shadow-lg shadow-danger-100'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div
                className={cn(
                  'rounded-xl p-4 border transition-all duration-300',
                  isCurrent
                    ? cn(config.bgColor, 'border-current/30', config.color)
                    : isCompleted
                      ? 'bg-gray-50 border-gray-100'
                      : 'bg-white border-gray-100 opacity-60'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className={cn(
                      'font-semibold text-sm',
                      isCurrent
                        ? config.color
                        : isCompleted
                          ? 'text-gray-800'
                          : 'text-gray-400'
                    )}
                  >
                    {config.label}
                  </h4>
                  {log && (
                    <span
                      className={cn(
                        'text-xs',
                        isCurrent
                          ? config.color
                          : isCompleted
                            ? 'text-gray-500'
                            : 'text-gray-400'
                      )}
                    >
                      {log.time}
                    </span>
                  )}
                </div>

                {log?.note && (
                  <p
                    className={cn(
                      'text-sm',
                      isCurrent
                        ? cn(config.color, 'opacity-80')
                        : isCompleted
                          ? 'text-gray-600'
                          : 'text-gray-400'
                    )}
                  >
                    {log.note}
                  </p>
                )}

                {log?.operator && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <MapPin
                      className={cn(
                        'w-3.5 h-3.5',
                        isCurrent
                          ? config.color
                          : isCompleted
                            ? 'text-gray-400'
                            : 'text-gray-300'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        isCurrent
                          ? config.color
                          : isCompleted
                            ? 'text-gray-500'
                            : 'text-gray-400'
                      )}
                    >
                      操作人：{log.operator}
                    </span>
                  </div>
                )}

                {!log && !isCompleted && !isCancelled && (
                  <p className="text-sm text-gray-400">等待处理...</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
