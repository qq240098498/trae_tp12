import type {
  Route,
  Vehicle,
  Pet,
  PricingRule,
  OrderStatus,
  ExceptionType,
  ExceptionSeverity,
  ExceptionStatus,
  InsuranceType,
  InsuranceStatus,
  ClaimStatus,
  ClaimReason,
  InsurancePolicy,
  InsuranceClaim,
  CageType,
  LuxuryLevel,
  TransportLocation,
  TrackStatistics,
  OrderTrackProgress,
} from '@/types';

export const CAGE_PRICING: Record<CageType, { price: number; label: string; description: string }> = {
  '小型笼': { price: 30, label: '小型笼', description: '适用于5kg以下宠物，基础通风笼具' },
  '中型笼': { price: 60, label: '中型笼', description: '适用于5-15kg宠物，加固笼具带饮水器' },
  '大型笼': { price: 100, label: '大型笼', description: '适用于15-30kg宠物，宽敞加固笼具' },
  '豪华笼': { price: 200, label: '豪华笼', description: '不限体重，恒温控制+实时监控+舒适垫材' },
};

export const LUXURY_PRICING: Record<LuxuryLevel, { multiplier: number; label: string; description: string }> = {
  '经济': { multiplier: 1.0, label: '经济', description: '标准运输车辆，基础环境保障' },
  '舒适': { multiplier: 1.3, label: '舒适', description: '空调恒温车厢，定时巡查照看' },
  '豪华': { multiplier: 1.8, label: '豪华', description: '独立空调隔间，专人陪护，实时视频' },
  '尊享': { multiplier: 2.5, label: '尊享', description: 'VIP专车直达，全程一对一陪护，定制化服务' },
};

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  return `PT${timestamp}`;
}

export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}分钟`;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours}小时`;
  }
  return `${wholeHours}小时${minutes}分钟`;
}

export function calculatePrice(
  route: Route,
  vehicle: Vehicle,
  pet: Pet,
  pricingRules: PricingRule[],
  cageType: CageType = '中型笼',
  luxuryLevel: LuxuryLevel = '经济',
): number {
  const matchingRule = pricingRules.find(
    (rule) =>
      rule.vehicle_type === vehicle.vehicle_type &&
      rule.pet_species === pet.species &&
      pet.weight_kg >= rule.weight_min &&
      pet.weight_kg < rule.weight_max,
  );

  const pricePerKm = matchingRule?.price_per_km ?? 2;
  const surcharge = matchingRule?.surcharge ?? 0;

  const distancePrice = route.distance_km * pricePerKm;
  const basePrice = route.base_price;
  const transportPrice = basePrice + distancePrice + surcharge;

  const cagePrice = CAGE_PRICING[cageType].price;
  const luxuryMultiplier = LUXURY_PRICING[luxuryLevel].multiplier;

  return Math.round((transportPrice * luxuryMultiplier + cagePrice) * 100) / 100;
}

export function getStatusText(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending: '待接单',
    accepted: '已接单',
    picked_up: '已接宠',
    in_transit: '运输中',
    arrived: '已到达',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status];
}

export function getStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-blue-100 text-blue-800 border-blue-200',
    picked_up: 'bg-purple-100 text-purple-800 border-purple-200',
    in_transit: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    arrived: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colorMap[status];
}

export function getExceptionTypeText(type: ExceptionType): string {
  const map: Record<ExceptionType, string> = {
    vehicle: '车辆故障',
    pet: '宠物异常',
    weather: '天气影响',
    traffic: '交通问题',
    other: '其他',
  };
  return map[type];
}

export function getExceptionSeverityText(severity: ExceptionSeverity): string {
  const map: Record<ExceptionSeverity, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
  };
  return map[severity];
}

export function getExceptionStatusText(status: ExceptionStatus): string {
  const map: Record<ExceptionStatus, string> = {
    reported: '已上报',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭',
    cancelled: '已撤销',
  };
  return map[status];
}

export function getExceptionSeverityBadgeVariant(severity: ExceptionSeverity): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<ExceptionSeverity, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    critical: 'danger',
  };
  return map[severity];
}

export function getExceptionStatusBadgeVariant(status: ExceptionStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<ExceptionStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    reported: 'danger',
    processing: 'warning',
    resolved: 'success',
    closed: 'default',
    cancelled: 'danger',
  };
  return map[status];
}

export function getInsuranceTypeText(type: InsuranceType): string {
  const map: Record<InsuranceType, string> = {
    basic: '基础版',
    standard: '标准版',
    premium: '尊享版',
  };
  return map[type];
}

export function getInsuranceTypeColor(type: InsuranceType): string {
  const map: Record<InsuranceType, string> = {
    basic: 'bg-gray-100 text-gray-700',
    standard: 'bg-blue-100 text-blue-700',
    premium: 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700',
  };
  return map[type];
}

export function getInsuranceStatusText(status: InsuranceStatus): string {
  const map: Record<InsuranceStatus, string> = {
    pending: '待生效',
    active: '保障中',
    expired: '已过期',
    cancelled: '已退保',
  };
  return map[status];
}

export function getInsuranceStatusBadgeVariant(status: InsuranceStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<InsuranceStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    pending: 'warning',
    active: 'success',
    expired: 'default',
    cancelled: 'danger',
  };
  return map[status];
}

export function getClaimStatusText(status: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = {
    submitted: '已提交',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    paid: '已赔付',
    closed: '已结案',
  };
  return map[status];
}

export function getClaimStatusBadgeVariant(status: ClaimStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<ClaimStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    submitted: 'info',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'danger',
    paid: 'success',
    closed: 'default',
  };
  return map[status];
}

export function getClaimReasonText(reason: ClaimReason): string {
  const map: Record<ClaimReason, string> = {
    injury: '意外伤害',
    illness: '突发疾病',
    death: '死亡理赔',
    lost: '丢失走失',
    damage: '笼具损坏',
    other: '其他原因',
  };
  return map[reason];
}

export function getClaimReasonColor(reason: ClaimReason): string {
  const map: Record<ClaimReason, string> = {
    injury: 'bg-red-50 text-red-600',
    illness: 'bg-orange-50 text-orange-600',
    death: 'bg-gray-100 text-gray-700',
    lost: 'bg-yellow-50 text-yellow-700',
    damage: 'bg-blue-50 text-blue-600',
    other: 'bg-purple-50 text-purple-600',
  };
  return map[reason];
}

export const SURRENDER_REASON_OPTIONS = [
  '计划变更，无需运输',
  '运输服务取消',
  '已选择其他保险公司',
  '宠物健康问题，不适宜运输',
  '其他原因',
] as const;

export interface RefundInfo {
  refundRate: number;
  refundAmount: number;
  ruleDescription: string;
  canSurrender: boolean;
}

export function calculateRefundInfo(policy: {
  status: string;
  effective_date: string;
  expiry_date: string;
  premium_amount: number;
}): RefundInfo {
  const now = new Date();
  const effectiveDate = new Date(policy.effective_date);
  const expiryDate = new Date(policy.expiry_date);
  let refundRate = 0;
  let ruleDescription = '';

  if (policy.status === 'pending') {
    refundRate = 1.0;
    ruleDescription = '保单待生效，支持全额退保';
  } else if (now < effectiveDate) {
    refundRate = 1.0;
    ruleDescription = '保单尚未生效，支持全额退保';
  } else {
    const hoursElapsed = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed <= 24) {
      refundRate = 0.8;
      ruleDescription = `生效${hoursElapsed.toFixed(1)}小时（24小时内），按保费80%退还`;
    } else if (now < expiryDate) {
      refundRate = 0.5;
      ruleDescription = '保单已生效超过24小时且未过期，按保费50%退还';
    } else {
      return { refundRate: 0, refundAmount: 0, ruleDescription: '保单已过期，不可退保', canSurrender: false };
    }
  }

  const refundAmount = Math.round(policy.premium_amount * refundRate * 100) / 100;
  return { refundRate, refundAmount, ruleDescription, canSurrender: true };
}

export function canSurrenderPolicy(
  policy: InsurancePolicy,
  claims: InsuranceClaim[],
): boolean {
  if (policy.status !== 'pending' && policy.status !== 'active') return false;
  if (policy.has_claimed) return false;
  const hasPendingClaim = claims.some(
    (c) => c.policy_id === policy.id && (c.status === 'submitted' || c.status === 'reviewing'),
  );
  if (hasPendingClaim) return false;
  return true;
}

export function buildSurrenderReason(selectedReason: string, customText: string): string {
  if (selectedReason === '其他原因') {
    const text = customText.trim();
    return text ? `其他原因：${text}` : '';
  }
  return selectedReason;
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateTotalDistanceKm(locations: TransportLocation[]): number {
  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
      totalDistance += calculateDistanceKm(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );
    }
  }
  return Math.round(totalDistance * 100) / 100;
}

export function calculateAvgSpeedKmh(locations: TransportLocation[]): number {
  if (locations.length < 2) return 0;

  const totalDistance = calculateTotalDistanceKm(locations);
  if (totalDistance === 0) return 0;

  const startTime = new Date(locations[0].reported_at).getTime();
  const endTime = new Date(locations[locations.length - 1].reported_at).getTime();
  const hours = (endTime - startTime) / (1000 * 60 * 60);

  if (hours === 0) return 0;
  return Math.round((totalDistance / hours) * 100) / 100;
}

export function calculateAvgIntervalMinutes(locations: TransportLocation[]): number {
  if (locations.length < 2) return 0;

  let totalInterval = 0;
  for (let i = 1; i < locations.length; i++) {
    const diff =
      (new Date(locations[i].reported_at).getTime() -
        new Date(locations[i - 1].reported_at).getTime()) /
      (1000 * 60);
    totalInterval += diff;
  }

  return Math.round(totalInterval / (locations.length - 1));
}

export function getTimeSinceLastReportMinutes(location: TransportLocation | null): number {
  if (!location) return Infinity;
  return (Date.now() - new Date(location.reported_at).getTime()) / (1000 * 60);
}

export function formatIntervalMinutes(minutes: number): string {
  if (minutes === Infinity || minutes === 0) return '--';
  if (minutes < 60) return `${Math.round(minutes)}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function isReportOverdue(
  location: TransportLocation | null,
  expectedIntervalMinutes: number = 60,
): boolean {
  if (!location) return true;
  const timeSince = getTimeSinceLastReportMinutes(location);
  return timeSince > expectedIntervalMinutes * 2;
}

export {
  getReportFrequencyStatus,
  getReportFrequencyStatusText,
  getReportFrequencyStatusColor,
} from './trackUtils';

export function getReportFrequencyStatusOld(
  locations: TransportLocation[],
): 'normal' | 'frequent' | 'infrequent' | 'none' {
  if (locations.length === 0) return 'none';
  if (locations.length < 2) return 'normal';

  const avgInterval = calculateAvgIntervalMinutes(locations);
  if (avgInterval < 15) return 'frequent';
  if (avgInterval > 120) return 'infrequent';
  return 'normal';
}

export function calculateProgressPercent(
  locations: TransportLocation[],
  routeDistanceKm?: number,
): number {
  if (!routeDistanceKm || locations.length === 0) return 10;
  const traveledDistance = calculateTotalDistanceKm(locations);
  if (traveledDistance === 0) {
    const baseProgress = 10;
    const perLocationProgress = (85 - baseProgress) / Math.max(locations.length, 1);
    return Math.min(baseProgress + locations.length * perLocationProgress, 95);
  }
  return Math.min(Math.round((traveledDistance / routeDistanceKm) * 100), 95);
}

export function estimateArrivalTime(
  locations: TransportLocation[],
  remainingDistanceKm: number,
): Date | null {
  if (locations.length < 2 || remainingDistanceKm <= 0) return null;
  const avgSpeed = calculateAvgSpeedKmh(locations);
  if (avgSpeed === 0) return null;
  const hoursNeeded = remainingDistanceKm / avgSpeed;
  return new Date(Date.now() + hoursNeeded * 60 * 60 * 1000);
}

export function getTrackStatisticsSummary(
  statistics: TrackStatistics,
): { label: string; value: string; tip: string }[] {
  return [
    {
      label: '总上报次数',
      value: statistics.totalReports.toString(),
      tip: '系统累计接收的位置上报总数',
    },
    {
      label: '今日上报',
      value: statistics.todayReports.toString(),
      tip: '今日0点至今的位置上报数量',
    },
    {
      label: '近1小时上报',
      value: statistics.reportsLastHour.toString(),
      tip: '最近1小时内的位置上报数量',
    },
    {
      label: '近24小时上报',
      value: statistics.reportsLast24Hours.toString(),
      tip: '最近24小时内的位置上报数量',
    },
    {
      label: '平均上报间隔',
      value: `${statistics.avgReportIntervalMinutes}分钟`,
      tip: '所有运输订单的平均上报时间间隔',
    },
    {
      label: '单均上报次数',
      value: statistics.avgReportsPerOrder.toFixed(1),
      tip: '每个运输订单的平均位置上报次数',
    },
    {
      label: '运输中订单',
      value: statistics.inTransitOrders.toString(),
      tip: '当前处于运输状态的订单数量',
    },
    {
      label: '活跃司机',
      value: statistics.uniqueDrivers.toString(),
      tip: '今日有位置上报的司机数量',
    },
  ];
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

export function filterLocationsByOrder(
  locations: TransportLocation[],
  orderId: string,
): TransportLocation[] {
  return locations.filter((l) => l.order_id === orderId);
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

export function getLatestLocation(
  locations: TransportLocation[],
): TransportLocation | null {
  if (locations.length === 0) return null;
  return sortLocationsByTime(locations, false)[0];
}

export function formatTrackProgress(
  progress: OrderTrackProgress,
): {
  title: string;
  subtitle: string;
  status: string;
  etaText: string;
} {
  const subtitle = progress.route
    ? `${progress.route.origin} → ${progress.route.destination} (${progress.route.distanceKm}km)`
    : '路线信息未知';

  const status =
    progress.currentLocation?.location || '待开始运输';

  const etaText = progress.estimatedArrival
    ? `预计到达：${formatDate(progress.estimatedArrival)}`
    : '到达时间待定';

  return {
    title: `${progress.petName} - ${progress.orderNo}`,
    subtitle,
    status,
    etaText,
  };
}

