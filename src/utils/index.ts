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
} from '@/types';

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

export function calculatePrice(
  route: Route,
  vehicle: Vehicle,
  pet: Pet,
  pricingRules: PricingRule[],
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

  return basePrice + distancePrice + surcharge;
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
