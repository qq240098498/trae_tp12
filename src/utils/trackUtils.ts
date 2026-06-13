import type {
  TransportLocation,
  TrackStatistics,
  OrderTrackProgress,
  TrackReportValidationResult,
  Order,
  Route,
  Pet,
  Employee,
  Vehicle,
} from '@/types';

const ORDER_STATUS_REPORTABLE: ReadonlyArray<Order['status']> = [
  'accepted',
  'picked_up',
  'in_transit',
  'arrived',
] as const;

const MIN_REPORT_INTERVAL_MINUTES = 5;
const MAX_REPORT_INTERVAL_MINUTES = 120;
const EARTH_RADIUS_KM = 6371;
const OVERDUE_INTERVAL_MULTIPLIER = 2;
const MIN_OVERDUE_INTERVAL_MINUTES = 120;

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function calculateRouteDistanceKm(locations: TransportLocation[]): number {
  let total = 0;
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    if (
      prev.latitude !== undefined &&
      prev.longitude !== undefined &&
      curr.latitude !== undefined &&
      curr.longitude !== undefined
    ) {
      total += haversineDistanceKm(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );
    }
  }
  return Math.round(total * 100) / 100;
}

export function calculateAvgSpeedKmh(locations: TransportLocation[]): number {
  if (locations.length < 2) return 0;
  const sorted = sortLocationsByTime(locations);
  const totalDistance = calculateRouteDistanceKm(sorted);
  if (totalDistance === 0) return 0;
  const startTime = new Date(sorted[0].reported_at).getTime();
  const endTime = new Date(sorted[sorted.length - 1].reported_at).getTime();
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  if (hours === 0) return 0;
  return Math.round((totalDistance / hours) * 100) / 100;
}

export function sortLocationsByTime(
  locations: TransportLocation[],
  ascending: boolean = true,
): TransportLocation[] {
  return [...locations].sort((a, b) => {
    const diff =
      new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
    return ascending ? diff : -diff;
  });
}

export function groupLocationsByOrderId(
  locations: TransportLocation[],
): Map<string, TransportLocation[]> {
  const map = new Map<string, TransportLocation[]>();
  for (const loc of locations) {
    const arr = map.get(loc.order_id) ?? [];
    arr.push(loc);
    map.set(loc.order_id, arr);
  }
  map.forEach((arr) => arr.sort((a, b) =>
    new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime(),
  ));
  return map;
}

export function getAverageIntervalMinutes(locations: TransportLocation[]): number {
  if (locations.length < 2) return 0;
  const sorted = sortLocationsByTime(locations);
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total +=
      (new Date(sorted[i].reported_at).getTime() -
        new Date(sorted[i - 1].reported_at).getTime()) /
      (1000 * 60);
  }
  return Math.round(total / (sorted.length - 1));
}

export function getTimeSinceLastReportMinutes(
  location: TransportLocation | null,
  now: Date = new Date(),
): number {
  if (!location) return Infinity;
  return (now.getTime() - new Date(location.reported_at).getTime()) / (1000 * 60);
}

export function isReportableOrderStatus(status: Order['status']): boolean {
  return ORDER_STATUS_REPORTABLE.includes(status);
}

export function buildReportRemark(
  remark: string | undefined,
  petStatus: string | undefined,
): string {
  const trimmedRemark = remark?.trim() ?? '';
  const petStatusText = petStatus ? `宠物${petStatus}` : '';
  return [trimmedRemark, petStatusText].filter(Boolean).join('，') || '位置上报';
}

export function resolveReporterName(
  order: Order | undefined,
  employees: Employee[],
  vehicles: Vehicle[],
): string {
  if (!order) return '司机';
  const employee = employees.find((e) => e.id === order.employee_id);
  if (employee?.name) return employee.name;
  const vehicle = vehicles.find((v) => v.id === order.vehicle_id);
  return vehicle?.driver_name || '司机';
}

export function validateTrackReportData(
  order: Order | undefined,
  location: string,
  currentLocation: TransportLocation | null,
): TrackReportValidationResult {
  const warnings: string[] = [];

  if (!location.trim()) {
    return { valid: false, error: '位置信息不能为空' };
  }

  if (!order) {
    return { valid: false, error: '订单不存在' };
  }

  if (!isReportableOrderStatus(order.status)) {
    return { valid: false, error: '该订单状态不允许上报位置' };
  }

  const trimmedLocation = location.trim();

  if (currentLocation && currentLocation.location === trimmedLocation) {
    return { valid: false, error: '当前位置与上次上报位置相同，请输入新的位置' };
  }

  if (currentLocation) {
    const timeDiff = getTimeSinceLastReportMinutes(currentLocation);
    if (timeDiff < MIN_REPORT_INTERVAL_MINUTES) {
      warnings.push(`距离上次上报仅 ${timeDiff.toFixed(0)} 分钟，上报频率较高`);
    }
    if (timeDiff > MAX_REPORT_INTERVAL_MINUTES) {
      warnings.push(
        `距离上次上报已 ${Math.round(timeDiff / 60)} 小时，建议增加上报频率`,
      );
    }
  }

  if (trimmedLocation.length < 2) {
    warnings.push('位置描述较短，建议提供更详细的位置信息');
  }

  return { valid: true, warnings };
}

interface BuildTrackStatisticsInput {
  allLocations: TransportLocation[];
  orders: Order[];
  vehicles: Vehicle[];
  now?: Date;
}

export function buildTrackStatistics(
  input: BuildTrackStatisticsInput,
): TrackStatistics {
  const { allLocations, orders, vehicles, now = new Date() } = input;
  const today = now.toDateString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const inTransitOrders = orders.filter((o) => isReportableOrderStatus(o.status));
  const locationMap = groupLocationsByOrderId(allLocations);
  const ordersWithLocations = inTransitOrders.filter((o) => locationMap.has(o.id));

  let totalInterval = 0;
  let intervalCount = 0;
  let totalDistanceKm = 0;
  let totalSpeedKmh = 0;
  let speedCount = 0;
  let overdueReportOrders = 0;
  let compliantReports = 0;
  const petStatusMap = new Map<string, number>();

  for (const order of ordersWithLocations) {
    const locs = locationMap.get(order.id) ?? [];
    const sorted = sortLocationsByTime(locs);

    for (let i = 1; i < sorted.length; i++) {
      totalInterval +=
        (new Date(sorted[i].reported_at).getTime() -
          new Date(sorted[i - 1].reported_at).getTime()) /
        (1000 * 60);
      intervalCount++;
    }

    const orderDistance = calculateRouteDistanceKm(sorted);
    totalDistanceKm += orderDistance;

    const orderAvgSpeed = calculateAvgSpeedKmh(sorted);
    if (orderAvgSpeed > 0) {
      totalSpeedKmh += orderAvgSpeed;
      speedCount++;
    }

    const avgInterval = getAverageIntervalMinutes(sorted);
    const lastReportTime = sorted.length > 0
      ? getTimeSinceLastReportMinutes(sorted[sorted.length - 1], now)
      : Infinity;
    const overdueThreshold = Math.max(avgInterval * OVERDUE_INTERVAL_MULTIPLIER, MIN_OVERDUE_INTERVAL_MINUTES);
    if (lastReportTime > overdueThreshold && avgInterval > 0) {
      overdueReportOrders++;
    }

    const latestLoc = sorted[sorted.length - 1];
    if (latestLoc?.pet_status) {
      petStatusMap.set(
        latestLoc.pet_status,
        (petStatusMap.get(latestLoc.pet_status) ?? 0) + 1,
      );
    }
  }

  if (intervalCount > 0) {
    const avgInterval = totalInterval / intervalCount;
    compliantReports = allLocations.filter((loc) => {
      const orderLocs = locationMap.get(loc.order_id);
      if (!orderLocs || orderLocs.length < 2) return true;
      const sorted = sortLocationsByTime(orderLocs);
      const idx = sorted.findIndex((l) => l.id === loc.id);
      if (idx <= 0) return true;
      const diff =
        (new Date(sorted[idx].reported_at).getTime() -
          new Date(sorted[idx - 1].reported_at).getTime()) /
        (1000 * 60);
      return diff >= MIN_REPORT_INTERVAL_MINUTES;
    }).length;
  }

  const uniqueDrivers = new Set(allLocations.map((l) => l.reported_by)).size;
  const vehicleIdSet = new Set<string>();
  for (const loc of allLocations) {
    const order = orders.find((o) => o.id === loc.order_id);
    if (order?.vehicle_id) vehicleIdSet.add(order.vehicle_id);
  }
  const uniqueVehicles = vehicleIdSet.size;

  let todayReports = 0;
  let reportsLastHour = 0;
  let reportsLast24Hours = 0;

  for (const loc of allLocations) {
    const t = new Date(loc.reported_at);
    if (t.toDateString() === today) todayReports++;
    if (t >= oneHourAgo) reportsLastHour++;
    if (t >= twentyFourHoursAgo) reportsLast24Hours++;
  }

  const petStatusDistribution: Record<string, number> = {};
  for (const [status, count] of petStatusMap.entries()) {
    petStatusDistribution[status] = count;
  }

  return {
    totalReports: allLocations.length,
    todayReports,
    inTransitOrders: inTransitOrders.length,
    avgReportIntervalMinutes: intervalCount > 0 ? Math.round(totalInterval / intervalCount) : 0,
    avgReportsPerOrder:
      ordersWithLocations.length > 0
        ? Math.round((allLocations.filter((l) =>
            inTransitOrders.some((o) => o.id === l.order_id),
          ).length / ordersWithLocations.length) * 100) / 100
        : 0,
    reportsLastHour,
    reportsLast24Hours,
    uniqueDrivers,
    uniqueVehicles,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    avgSpeedKmh: speedCount > 0 ? Math.round((totalSpeedKmh / speedCount) * 100) / 100 : 0,
    overdueReportOrders,
    ordersWithLocation: ordersWithLocations.length,
    complianceRate: allLocations.length > 0
      ? Math.round((compliantReports / allLocations.length) * 10000) / 100
      : 100,
    petStatusDistribution,
    avgReportsPerDriver: uniqueDrivers > 0
      ? Math.round((allLocations.length / uniqueDrivers) * 100) / 100
      : 0,
    avgReportsPerVehicle: uniqueVehicles > 0
      ? Math.round((allLocations.length / uniqueVehicles) * 100) / 100
      : 0,
  };
}

interface BuildOrderTrackProgressInput {
  order: Order;
  locations: TransportLocation[];
  pet: Pet | undefined;
  route: Route | undefined;
}

export function buildOrderTrackProgress(
  input: BuildOrderTrackProgressInput,
): OrderTrackProgress {
  const { order, locations, pet, route } = input;
  const sorted = sortLocationsByTime(locations);
  const currentLocation = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  const avgInterval = getAverageIntervalMinutes(sorted);

  const baseProgress = 10;
  const progress = (() => {
    if (!route || sorted.length === 0) return baseProgress;
    const traveledDistance = calculateRouteDistanceKm(sorted);
    if (traveledDistance > 0 && route.distance_km > 0) {
      return Math.min(Math.round((traveledDistance / route.distance_km) * 100), 95);
    }
    const perLocationProgress = (85 - baseProgress) / Math.max(sorted.length, 1);
    return Math.min(baseProgress + sorted.length * perLocationProgress, 95);
  })();

  let estimatedArrival: string | null = null;
  if (route && currentLocation && avgInterval > 0) {
    const remainingDistance = Math.max(0, route.distance_km - calculateRouteDistanceKm(sorted));
    const avgSpeed = calculateAvgSpeedKmh(sorted);
    if (avgSpeed > 0) {
      const etaHours = remainingDistance / avgSpeed;
      estimatedArrival = new Date(Date.now() + etaHours * 60 * 60 * 1000).toISOString();
    } else {
      const remainingProgress = 100 - progress;
      const remainingLocations = Math.ceil(
        (remainingProgress / 100) * route.distance_km / 50,
      );
      const etaMs = remainingLocations * avgInterval * 60 * 1000;
      estimatedArrival = new Date(Date.now() + etaMs).toISOString();
    }
  }

  return {
    orderId: order.id,
    orderNo: order.order_no,
    petName: pet?.name || '未知宠物',
    currentLocation,
    reportCount: sorted.length,
    firstReportAt: sorted.length > 0 ? sorted[0].reported_at : null,
    lastReportAt: currentLocation?.reported_at || null,
    avgIntervalMinutes: avgInterval,
    progressPercent: Math.round(progress),
    estimatedArrival,
    route: route
      ? {
          origin: route.origin,
          destination: route.destination,
          distanceKm: route.distance_km,
        }
      : null,
  };
}

interface DriverRankingItem {
  name: string;
  count: number;
}

export function computeTopDrivers(
  locations: TransportLocation[],
  limit: number = 5,
): DriverRankingItem[] {
  const counts = new Map<string, number>();
  for (const loc of locations) {
    counts.set(loc.reported_by, (counts.get(loc.reported_by) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

interface VehicleRankingItem {
  id: string;
  plateNumber: string;
  count: number;
}

export function computeTopVehicles(
  locations: TransportLocation[],
  orders: Order[],
  vehicles: Vehicle[],
  limit: number = 5,
): VehicleRankingItem[] {
  const orderVehicleMap = new Map<string, string>();
  for (const o of orders) {
    if (o.vehicle_id) orderVehicleMap.set(o.id, o.vehicle_id);
  }

  const counts = new Map<string, number>();
  for (const loc of locations) {
    const vid = orderVehicleMap.get(loc.order_id);
    if (vid) counts.set(vid, (counts.get(vid) ?? 0) + 1);
  }

  const vehiclePlateMap = new Map(vehicles.map((v) => [v.id, v.plate_number]));

  return Array.from(counts.entries())
    .map(([id, count]) => ({
      id,
      plateNumber: vehiclePlateMap.get(id) ?? '未知车牌',
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

interface TrendItem {
  time: string;
  count: number;
}

export function computeReportTrend(
  locations: TransportLocation[],
  hours: number = 24,
  now: Date = new Date(),
): TrendItem[] {
  const trendData: TrendItem[] = [];
  const hourBuckets = new Map<number, number>();

  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  startTime.setMinutes(0, 0, 0);

  for (const loc of locations) {
    const t = new Date(loc.reported_at);
    if (t < startTime || t > now) continue;
    const hourKey = t.getHours();
    const dayDiff = Math.floor(
      (t.getTime() - startTime.getTime()) / (1000 * 60 * 60),
    );
    const bucketKey = dayDiff;
    hourBuckets.set(bucketKey, (hourBuckets.get(bucketKey) ?? 0) + 1);
  }

  for (let i = 0; i <= hours; i++) {
    const hourDate = new Date(startTime.getTime() + i * 60 * 60 * 1000);
    const timeLabel = `${hourDate.getHours().toString().padStart(2, '0')}:00`;
    trendData.push({ time: timeLabel, count: hourBuckets.get(i) ?? 0 });
  }

  return trendData;
}

export function filterLocationsByTimeRange(
  locations: TransportLocation[],
  startTime: Date,
  endTime: Date,
): TransportLocation[] {
  return locations.filter((l) => {
    const t = new Date(l.reported_at);
    return t >= startTime && t <= endTime;
  });
}

export function countReportsByDriver(
  locations: TransportLocation[],
  driverName: string,
): number {
  let count = 0;
  for (const loc of locations) {
    if (loc.reported_by === driverName) count++;
  }
  return count;
}

export function countReportsByVehicle(
  locations: TransportLocation[],
  orders: Order[],
  vehicleId: string,
): number {
  const orderIds = new Set(
    orders.filter((o) => o.vehicle_id === vehicleId).map((o) => o.id),
  );
  let count = 0;
  for (const loc of locations) {
    if (orderIds.has(loc.order_id)) count++;
  }
  return count;
}

export function getReportFrequencyStatus(
  avgIntervalMinutes: number,
  timeSinceLastReportMinutes: number,
): 'normal' | 'overdue' | 'frequent' | 'none' {
  if (avgIntervalMinutes === 0 && timeSinceLastReportMinutes === Infinity) return 'none';
  if (avgIntervalMinutes === 0) return 'normal';
  if (timeSinceLastReportMinutes > Math.max(avgIntervalMinutes * 2, 120)) {
    return 'overdue';
  }
  if (timeSinceLastReportMinutes < MIN_REPORT_INTERVAL_MINUTES) {
    return 'frequent';
  }
  return 'normal';
}

export function getReportFrequencyStatusText(
  status: 'normal' | 'overdue' | 'frequent' | 'none',
): string {
  const map = {
    normal: '上报正常',
    frequent: '上报频繁',
    overdue: '上报延迟',
    none: '暂无上报',
  };
  return map[status];
}

export function getReportFrequencyStatusColor(
  status: 'normal' | 'overdue' | 'frequent' | 'none',
): string {
  const map = {
    normal: 'text-green-600 bg-green-50',
    frequent: 'text-amber-600 bg-amber-50',
    overdue: 'text-red-600 bg-red-50',
    none: 'text-gray-500 bg-gray-50',
  };
  return map[status];
}

export function formatIntervalMinutes(minutes: number): string {
  if (minutes === Infinity) return '暂无';
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${Math.round(minutes)}分钟前`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}小时${mins}分钟前` : `${hours}小时前`;
}

export function hasTemperatureAlert(location: TransportLocation): boolean {
  if (location.temperature === undefined) return false;
  return location.temperature < 10 || location.temperature > 30;
}

export function hasHumidityAlert(location: TransportLocation): boolean {
  if (location.humidity === undefined) return false;
  return location.humidity < 30 || location.humidity > 70;
}

export function hasBatteryAlert(location: TransportLocation): boolean {
  if (location.battery_level === undefined) return false;
  return location.battery_level < 20;
}

export function getLocationAlerts(
  location: TransportLocation,
): Array<{ type: 'temperature' | 'humidity' | 'battery'; message: string }> {
  const alerts: Array<{
    type: 'temperature' | 'humidity' | 'battery';
    message: string;
  }> = [];

  if (hasTemperatureAlert(location)) {
    alerts.push({
      type: 'temperature',
      message: `温度异常：${location.temperature}℃`,
    });
  }

  if (hasHumidityAlert(location)) {
    alerts.push({
      type: 'humidity',
      message: `湿度异常：${location.humidity}%`,
    });
  }

  if (hasBatteryAlert(location)) {
    alerts.push({
      type: 'battery',
      message: `电量低：${location.battery_level}%`,
    });
  }

  return alerts;
}
