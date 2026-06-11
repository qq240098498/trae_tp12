import type {
  Route,
  Vehicle,
  Pet,
  PricingRule,
  OrderStatus,
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
