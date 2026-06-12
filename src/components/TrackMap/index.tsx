import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Navigation, Flag } from 'lucide-react';
import type { TransportLocation, Route as RouteType } from '@/types';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface TrackMapProps {
  orderId: string;
  locations: TransportLocation[];
  route?: RouteType;
  className?: string;
}

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  time?: string;
  remark?: string;
  reportedBy?: string;
  isOrigin?: boolean;
  isDestination?: boolean;
  isCurrent?: boolean;
  index?: number;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  '北京': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '天津': { lat: 39.3434, lng: 117.3616 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '苏州': { lat: 31.2990, lng: 120.5853 },
  '南京': { lat: 32.0603, lng: 118.7969 },
  '武汉': { lat: 30.5928, lng: 114.3055 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '重庆': { lat: 29.5630, lng: 106.5516 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '郑州': { lat: 34.7466, lng: 113.6254 },
  '济南': { lat: 36.6512, lng: 117.1201 },
  '青岛': { lat: 36.0671, lng: 120.3826 },
  '长沙': { lat: 28.2282, lng: 112.9388 },
  '合肥': { lat: 31.8206, lng: 117.2272 },
  '福州': { lat: 26.0745, lng: 119.2965 },
  '厦门': { lat: 24.4798, lng: 118.0894 },
  '南昌': { lat: 28.6820, lng: 115.8579 },
};

function lookupCoords(name: string): { lat: number; lng: number } | null {
  if (!name) return null;
  for (const key of Object.keys(CITY_COORDS)) {
    if (name.includes(key)) {
      return CITY_COORDS[key];
    }
  }
  return null;
}

function generateOffsetCoords(
  base: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  progress: number,
  index: number,
  total: number
): { lat: number; lng: number } {
  const latStep = (dest.lat - base.lat) / Math.max(total, 1);
  const lngStep = (dest.lng - base.lng) / Math.max(total, 1);
  const jitterLat = (Math.sin(index * 1.7) * 0.15);
  const jitterLng = (Math.cos(index * 1.3) * 0.15);
  return {
    lat: base.lat + latStep * (index + 0.5) + jitterLat,
    lng: base.lng + lngStep * (index + 0.5) + jitterLng,
  };
}

export default function TrackMap({
  orderId,
  locations,
  route,
  className,
}: TrackMapProps) {
  const mapPoints = useMemo<MapPoint[]>(() => {
    const filteredLocs = locations
      .filter((l) => l.order_id === orderId)
      .sort(
        (a, b) =>
          new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime(),
      );

    const points: MapPoint[] = [];

    if (!route) return [];

    const originCoords =
      lookupCoords(route.origin) || { lat: 40, lng: 116 };
    const destCoords =
      lookupCoords(route.destination) || { lat: 30, lng: 120 };

    points.push({
      id: 'origin',
      name: route.origin,
      lat: originCoords.lat,
      lng: originCoords.lng,
      isOrigin: true,
    });

    filteredLocs.forEach((loc, idx) => {
      let coords: { lat: number; lng: number };
      if (loc.latitude && loc.longitude) {
        coords = { lat: loc.latitude, lng: loc.longitude };
      } else {
        const lookup = lookupCoords(loc.location);
        if (lookup) {
          coords = lookup;
        } else {
          coords = generateOffsetCoords(
            originCoords,
            destCoords,
            (idx + 1) / (filteredLocs.length + 1),
            idx,
            filteredLocs.length,
          );
        }
      }
      points.push({
        id: loc.id,
        name: loc.location,
        lat: coords.lat,
        lng: coords.lng,
        time: loc.reported_at,
        remark: loc.remark,
        reportedBy: loc.reported_by,
        isCurrent: idx === filteredLocs.length - 1,
        index: idx + 1,
      });
    });

    points.push({
      id: 'destination',
      name: route.destination,
      lat: destCoords.lat,
      lng: destCoords.lng,
      isDestination: true,
    });

    return points;
  }, [orderId, locations, route]);

  const { bounds, viewBox } = useMemo(() => {
    if (mapPoints.length === 0) {
      return {
        bounds: { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 },
        viewBox: '0 0 800 400',
      };
    }

    const lats = mapPoints.map((p) => p.lat);
    const lngs = mapPoints.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latPad = Math.max((maxLat - minLat) * 0.15, 0.5);
    const lngPad = Math.max((maxLng - minLng) * 0.15, 0.5);

    return {
      bounds: {
        minLat: minLat - latPad,
        maxLat: maxLat + latPad,
        minLng: minLng - lngPad,
        maxLng: maxLng + lngPad,
      },
      viewBox: '0 0 800 400',
    };
  }, [mapPoints]);

  const project = (lat: number, lng: number): { x: number; y: number } => {
    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;
    const x = ((lng - bounds.minLng) / Math.max(lngRange, 0.001)) * 760 + 20;
    const y =
      380 - ((lat - bounds.minLat) / Math.max(latRange, 0.001)) * 360 + 20;
    return { x, y };
  };

  const pathData = useMemo(() => {
    if (mapPoints.length < 2) return '';
    const projected = mapPoints.map((p) => project(p.lat, p.lng));

    let d = `M ${projected[0].x},${projected[0].y}`;

    for (let i = 1; i < projected.length; i++) {
      const prev = projected[i - 1];
      const curr = projected[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2 - 20;
      d += ` Q ${midX},${midY} ${curr.x},${curr.y}`;
    }

    return d;
  }, [mapPoints, bounds]);

  const currentPoint = mapPoints.find((p) => p.isCurrent);
  const progressPercent = useMemo(() => {
    const total = mapPoints.length - 2;
    if (total <= 0) return 0;
    const currentIdx = mapPoints.findIndex((p) => p.isCurrent);
    if (currentIdx === -1) return 10;
    return Math.round((currentIdx / (mapPoints.length - 1)) * 100);
  }, [mapPoints]);

  return (
    <Card
      title="实时轨迹地图"
      icon={<Navigation className="w-5 h-5" />}
      className={className}
      extra={
        currentPoint ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            实时追踪
          </span>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="relative w-full aspect-[2/1] rounded-2xl bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 overflow-hidden border border-gray-100">
          <svg
            viewBox={viewBox}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </pattern>
              <linearGradient
                id="path-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient
                id="path-progress"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur
                  stdDeviation="3"
                  result="coloredBlur"
                />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="800" height="400" fill="url(#grid-pattern)" />

            {pathData && (
              <>
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="0"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                <motion.path
                  d={pathData}
                  fill="none"
                  stroke="url(#path-progress)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progressPercent / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                />
              </>
            )}

            {mapPoints.map((point) => {
              const { x, y } = project(point.lat, point.lng);

              if (point.isOrigin) {
                return (
                  <g key={point.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill="#dcfce7"
                      opacity="0.7"
                    />
                    <circle cx={x} cy={y} r="12" fill="#22c55e" />
                    <foreignObject
                      x={x - 10}
                      y={y - 10}
                      width="20"
                      height="20"
                    >
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </foreignObject>
                    <text
                      x={x}
                      y={y + 35}
                      textAnchor="middle"
                      className="fill-green-700 text-[11px] font-medium"
                    >
                      {point.name}
                    </text>
                    <text
                      x={x}
                      y={y + 49}
                      textAnchor="middle"
                      className="fill-green-500 text-[9px]"
                    >
                      起点
                    </text>
                  </g>
                );
              }

              if (point.isDestination) {
                return (
                  <g key={point.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill="#fee2e2"
                      opacity="0.7"
                    />
                    <circle cx={x} cy={y} r="12" fill="#ef4444" />
                    <foreignObject
                      x={x - 10}
                      y={y - 10}
                      width="20"
                      height="20"
                    >
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Flag className="w-3.5 h-3.5" />
                      </div>
                    </foreignObject>
                    <text
                      x={x}
                      y={y + 35}
                      textAnchor="middle"
                      className="fill-red-700 text-[11px] font-medium"
                    >
                      {point.name}
                    </text>
                    <text
                      x={x}
                      y={y + 49}
                      textAnchor="middle"
                      className="fill-red-500 text-[9px]"
                    >
                      终点
                    </text>
                  </g>
                );
              }

              if (point.isCurrent) {
                return (
                  <g key={point.id}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      initial={{ r: 12, opacity: 0.8 }}
                      animate={{ r: 28, opacity: 0 }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="#eef2ff"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="11"
                      fill="#6366f1"
                      filter="url(#glow)"
                    />
                    <foreignObject
                      x={x - 9}
                      y={y - 9}
                      width="18"
                      height="18"
                    >
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                    </foreignObject>
                    <text
                      x={x}
                      y={y - 22}
                      textAnchor="middle"
                      className="fill-indigo-600 text-[10px] font-bold bg-white"
                    >
                      {point.name}
                    </text>
                  </g>
                );
              }

              return (
                <g key={point.id}>
                  <circle cx={x} cy={y} r="6" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx={x} cy={y} r="2.5" fill="#94a3b8" />
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    className="fill-slate-500 text-[8px]"
                  >
                    #{point.index}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">运输进度</div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                />
              </div>
              <span className="text-sm font-bold text-indigo-600">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-100 text-[10px] space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              起点
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              当前位置
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              终点
            </div>
          </div>
        </div>

        {currentPoint && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
              <p className="text-xs text-indigo-500 mb-0.5">当前位置</p>
              <p className="text-sm font-semibold text-indigo-800 truncate">
                {currentPoint.name}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-500 mb-0.5">运输进度</p>
              <p className="text-sm font-semibold text-blue-800">
                {progressPercent}% 已完成
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs text-green-500 mb-0.5">上报点数</p>
              <p className="text-sm font-semibold text-green-800">
                共 {Math.max(mapPoints.length - 2, 0)} 个轨迹点
              </p>
            </div>
          </div>
        )}

        {mapPoints.filter((p) => !p.isOrigin && !p.isDestination).length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              轨迹点详情
            </h4>
            <div className="flex flex-wrap gap-2">
              {mapPoints
                .filter((p) => !p.isOrigin && !p.isDestination)
                .map((point) => (
                  <div
                    key={point.id}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs transition-all border',
                      point.isCurrent
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                    title={point.remark}
                  >
                    <span className="font-medium">
                      #{point.index} {point.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
