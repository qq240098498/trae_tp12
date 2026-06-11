export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  weight_kg: number;
  photo_url: string;
  customer_id: string;
  created_at: string;
}

export interface PetProfile {
  id: string;
  pet_id: string;
  diet_habit: string;
  sleep_schedule: string;
  special_needs: string;
  medical_info: string;
  temperament: string;
  favorite_toys: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  duration_hours: number;
  base_price: number;
  is_active: boolean;
}

export type VehicleType = '小型' | '中型' | '大型' | '豪华';
export type VehicleStatus = '空闲' | '使用中' | '维护中';

export interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  capacity: number;
  status: VehicleStatus;
  driver_name: string;
  driver_phone: string;
}

export type EmployeeRole = '司机' | '调度员' | '管理员';

export interface Employee {
  id: string;
  name: string;
  employee_no: string;
  phone: string;
  role: EmployeeRole;
  is_available: boolean;
}

export interface PricingRule {
  id: string;
  vehicle_type: VehicleType;
  pet_species: string;
  weight_min: number;
  weight_max: number;
  price_per_km: number;
  surcharge: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'arrived' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_no: string;
  pet_id: string;
  customer_id: string;
  route_id: string;
  vehicle_id: string;
  employee_id: string;
  base_price: number;
  surcharge: number;
  total_price: number;
  status: OrderStatus;
  pickup_time: string;
  delivery_time: string;
  receiver_name: string;
  receiver_phone: string;
  satisfaction: number | null;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusLog {
  id: string;
  order_id: string;
  status: OrderStatus;
  location: string;
  remark: string;
  created_at: string;
}

export type ExceptionType = 'vehicle' | 'pet' | 'weather' | 'traffic' | 'other';
export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ExceptionStatus = 'reported' | 'processing' | 'resolved' | 'closed' | 'cancelled';

export interface ExceptionProcessingLog {
  id: string;
  exception_id: string;
  action: string;
  operator: string;
  remark: string;
  created_at: string;
}

export interface TransportException {
  id: string;
  exception_no: string;
  order_id: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  title: string;
  description: string;
  location: string;
  reporter_name: string;
  reported_at: string;
  handler_name: string;
  handled_at: string;
  resolution: string;
  processing_logs: ExceptionProcessingLog[];
}
