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

export interface TransportLocation {
  id: string;
  order_id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  remark?: string;
  reported_by: string;
  reported_at: string;
}

export type TransportStatus = 'idle' | 'waiting' | 'loading' | 'in_transit' | 'stopped' | 'unloading' | 'completed';

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

export type InsuranceType = 'basic' | 'standard' | 'premium';
export type InsuranceStatus = 'pending' | 'active' | 'expired' | 'cancelled';

export interface InsuranceProduct {
  id: string;
  name: string;
  type: InsuranceType;
  description: string;
  coverage_rate: number;
  max_coverage: number;
  premium_rate: number;
  min_premium: number;
  deductible: number;
  is_active: boolean;
  coverage_items: string[];
  exclusions: string[];
  created_at: string;
}

export interface InsurancePolicy {
  id: string;
  policy_no: string;
  order_id: string;
  customer_id: string;
  pet_id: string;
  product_id: string;
  pet_value: number;
  premium_amount: number;
  coverage_amount: number;
  status: InsuranceStatus;
  purchase_date: string;
  effective_date: string;
  expiry_date: string;
  has_claimed: boolean;
  total_claimed_amount: number;
  surrender_date?: string;
  surrender_reason?: string;
  refund_amount?: number;
  created_at: string;
}

export type ClaimStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'paid' | 'closed';
export type ClaimReason = 'injury' | 'illness' | 'death' | 'lost' | 'damage' | 'other';

export interface ClaimProcessingLog {
  id: string;
  claim_id: string;
  action: string;
  operator: string;
  remark: string;
  created_at: string;
}

export interface InsuranceClaim {
  id: string;
  claim_no: string;
  policy_id: string;
  order_id: string;
  customer_id: string;
  pet_id: string;
  reason: ClaimReason;
  title: string;
  description: string;
  claimed_amount: number;
  approved_amount: number | null;
  status: ClaimStatus;
  incident_date: string;
  incident_location: string;
  reporter_name: string;
  reporter_phone: string;
  submitted_at: string;
  reviewer_name: string;
  reviewed_at: string;
  resolution: string;
  payment_date: string;
  evidence_urls: string[];
  processing_logs: ClaimProcessingLog[];
}
