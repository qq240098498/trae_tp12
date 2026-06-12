import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  User,
  Navigation,
  ChevronDown,
  ChevronUp,
  Truck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { TransportLocation, Route as RouteType, Order } from '@/types';
import { formatDate, formatDuration } from '@/utils';
import { cn } from '@/lib/utils';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface TransportTimelineProps {
  orderId: string;
  locations: TransportLocation[];
  order?: Order;
  route?: RouteType;
  className?: string;
  onReportLocation?: () => void;
}

export default function TransportTimeline({
  orderId,
  locations,
  order,
  route,
  className,
  onReportLocation,
}: TransportTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedLocations = useMemo(() => {
    return [...locations]
      .filter((loc) => loc.order_id === orderId)
      .sort((a, b) => new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime());
  }, [locations, orderId]);

  const currentLocation = sortedLocations[sortedLocations.length - 1];

  const progress = useMemo(() => {
    if (!route || sortedLocations.length === 0) return 0;
    const baseProgress = 10;
    const perLocationProgress = (80 - baseProgress) / Math.max(sortedLocations.length, 1);
    return Math.min(baseProgress + sortedLocations.length * perLocationProgress, 95);
  }, [route, sortedLocations.length]);

  const estimatedArrival = useMemo(() => {
    if (!route || !currentLocation) return null;
    const elapsedMs = Date.now() - new Date(currentLocation.reported_at).getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const remainingHours = Math.max(0, route.duration_hours - elapsedHours);
    const eta = new Date(Date.now() + remainingHours * 60 * 60 * 1000);
    return eta;
  }, [route, currentLocation]);

  const totalDistance = useMemo(() => {
    if (!route) return 0;
    return (progress / 100) * route.distance_km;
  }, [route, progress]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTransportStatus = () => {
    if (!order) return { label: '未知', variant: 'default' as const };
    switch (order.status) {
      case 'pending':
        return { label: '待接单', variant: 'warning' as const };
      case 'accepted':
        return { label: '已接单', variant: 'info' as const };
      case 'picked_up':
        return { label: '已接宠', variant: 'info' as const };
      case 'in_transit':
        return { label: '运输中', variant: 'warning' as const };
      case 'arrived':
        return { label: '已到达', variant: 'info' as const };
      case 'completed':
        return { label: '已完成', variant: 'success' as const };
      case 'cancelled':
        return { label: '已取消', variant: 'danger' as const };
      default:
        return { label: '未知', variant: 'default' as const };
    }
  };

  const status = getTransportStatus();

  return (
    <Card
      title="实时运输轨迹"
      icon={<Navigation className="w-5 h-5" />}
      className={className}
      extra={
        onReportLocation && (order?.status === 'picked_up' || order?.status === 'in_transit') ? (
          <button
            onClick={onReportLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            上报位置
          </button>
        ) : null
      }
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-5 border border-primary-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-gray-800">运输状态</span>
              </div>
              <Badge variant={status.variant} className="text-sm">
                {status.label}
              </Badge>
            </div>
            {currentLocation && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">最后更新</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(currentLocation.reported_at)}
                </p>
              </div>
            )}
          </div>

          {route && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  {route.origin}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {route.destination}
                </span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-3 border-primary-500 rounded-full shadow-lg flex items-center justify-center"
                  style={{ left: `calc(${progress}% - 10px)` }}
                >
                  <Truck className="w-2.5 h-2.5 text-primary-500" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>已行驶 {totalDistance.toFixed(1)} km</span>
                <span>总里程 {route.distance_km} km</span>
              </div>
            </div>
          )}

          {currentLocation && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 backdrop-blur rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">当前位置</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {currentLocation.location}
                </p>
              </div>
              {estimatedArrival && (
                <div className="bg-white/60 backdrop-blur rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">预计到达</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(estimatedArrival)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {currentLocation && currentLocation.remark && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">最新动态</p>
                <p className="text-xs text-amber-700 mt-1">{currentLocation.remark}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              位置轨迹记录
            </h3>
            <span className="text-xs text-gray-500">共 {sortedLocations.length} 条记录</span>
          </div>

          {sortedLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Navigation className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无位置轨迹记录</p>
              <p className="text-xs mt-1">司机尚未上报位置信息</p>
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 via-primary-300 to-gray-200" />

              {sortedLocations.map((loc, index) => {
                const isLatest = index === sortedLocations.length - 1;
                const isExpanded = expandedId === loc.id;

                return (
                  <motion.div
                    key={loc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative mb-4 last:mb-0"
                  >
                    <div
                      className={cn(
                        'absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all',
                        isLatest
                          ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-200 animate-pulse-soft'
                          : 'bg-white border-primary-300 text-primary-500'
                      )}
                    >
                      {isLatest ? (
                        <Truck className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </div>

                    <div
                      className={cn(
                        'rounded-xl border transition-all cursor-pointer',
                        isLatest
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      )}
                      onClick={() => toggleExpand(loc.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin
                                className={cn(
                                  'w-4 h-4 flex-shrink-0',
                                  isLatest ? 'text-primary-600' : 'text-gray-400'
                                )}
                              />
                              <span
                                className={cn(
                                  'font-medium truncate',
                                  isLatest ? 'text-primary-800' : 'text-gray-800'
                                )}
                              >
                                {loc.location}
                              </span>
                              {isLatest && (
                                <Badge variant="primary" className="text-xs">
                                  当前位置
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 ml-6">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(loc.reported_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {loc.reported_by}
                              </span>
                            </div>
                          </div>
                          <button className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-100 space-y-3"
                          >
                            {loc.address && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">详细地址</p>
                                <p className="text-sm text-gray-700">{loc.address}</p>
                              </div>
                            )}
                            {loc.remark && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">备注说明</p>
                                <p className="text-sm text-gray-700">{loc.remark}</p>
                              </div>
                            )}
                            {loc.latitude && loc.longitude && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">纬度</p>
                                  <p className="text-sm font-mono text-gray-700">
                                    {loc.latitude.toFixed(4)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">经度</p>
                                  <p className="text-sm font-mono text-gray-700">
                                    {loc.longitude.toFixed(4)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {route && sortedLocations.length > 1 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-3">运输统计</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">上报次数</p>
                <p className="text-lg font-bold text-primary-600">{sortedLocations.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">已行驶</p>
                <p className="text-lg font-bold text-blue-600">{totalDistance.toFixed(0)} km</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">运输进度</p>
                <p className="text-lg font-bold text-green-600">{progress.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
