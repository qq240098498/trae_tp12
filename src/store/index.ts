import { create } from 'zustand';
import type {
  Pet,
  PetProfile,
  Customer,
  Route,
  Vehicle,
  Employee,
  PricingRule,
  Order,
  OrderStatus,
  OrderStatusLog,
  VehicleType,
  VehicleStatus,
  EmployeeRole,
  TransportException,
  ExceptionType,
  ExceptionSeverity,
  ExceptionStatus,
  ExceptionProcessingLog,
  InsuranceProduct,
  InsurancePolicy,
  InsuranceClaim,
  InsuranceStatus,
  ClaimStatus,
  ClaimProcessingLog,
  InsuranceType,
  ClaimReason,
  TransportLocation,
  CageType,
  LuxuryLevel,
} from '@/types';
import { generateId, generateOrderNo } from '@/utils';

interface AppState {
  pets: Pet[];
  petProfiles: PetProfile[];
  customers: Customer[];
  routes: Route[];
  vehicles: Vehicle[];
  employees: Employee[];
  pricingRules: PricingRule[];
  orders: Order[];
  orderStatusLogs: OrderStatusLog[];
  transportLocations: TransportLocation[];
  exceptions: TransportException[];

  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  addPet: (pet: Omit<Pet, 'id' | 'created_at'>) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;

  addPetProfile: (profile: Omit<PetProfile, 'id'>) => void;
  updatePetProfile: (id: string, profile: Partial<PetProfile>) => void;

  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;

  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  updatePricingRule: (id: string, rule: Partial<PricingRule>) => void;
  deletePricingRule: (id: string) => void;

  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;

  addOrder: (order: Omit<Order, 'id' | 'order_no' | 'created_at' | 'updated_at'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addOrderStatusLog: (log: Omit<OrderStatusLog, 'id' | 'created_at'>) => void;

  addTransportLocation: (location: Omit<TransportLocation, 'id' | 'reported_at'>) => void;

  addException: (exception: Omit<TransportException, 'id' | 'exception_no' | 'reported_at' | 'processing_logs'>) => void;
  updateExceptionStatus: (id: string, status: ExceptionStatus, handlerName: string, resolution?: string) => void;
  addExceptionProcessingLog: (exceptionId: string, log: Omit<ExceptionProcessingLog, 'id' | 'exception_id' | 'created_at'>) => void;

  insuranceProducts: InsuranceProduct[];
  insurancePolicies: InsurancePolicy[];
  insuranceClaims: InsuranceClaim[];

  addInsuranceProduct: (product: Omit<InsuranceProduct, 'id' | 'created_at'>) => void;
  updateInsuranceProduct: (id: string, product: Partial<InsuranceProduct>) => void;
  deleteInsuranceProduct: (id: string) => void;

  addInsurancePolicy: (policy: Omit<InsurancePolicy, 'id' | 'policy_no' | 'created_at'>) => void;
  updateInsurancePolicyStatus: (id: string, status: InsuranceStatus) => void;
  surrenderInsurancePolicy: (id: string, reason: string) => { success: boolean; message: string; refundAmount?: number };

  addInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'claim_no' | 'submitted_at' | 'processing_logs'>) => void;
  updateInsuranceClaimStatus: (id: string, status: ClaimStatus, reviewerName: string, approvedAmount?: number, resolution?: string) => void;
  addInsuranceClaimProcessingLog: (claimId: string, log: Omit<ClaimProcessingLog, 'id' | 'claim_id' | 'created_at'>) => void;
}

const STORAGE_KEY = 'pet_shipping_app_state';

type AppData = {
  pets: Pet[];
  petProfiles: PetProfile[];
  customers: Customer[];
  routes: Route[];
  vehicles: Vehicle[];
  employees: Employee[];
  pricingRules: PricingRule[];
  orders: Order[];
  orderStatusLogs: OrderStatusLog[];
  transportLocations: TransportLocation[];
  exceptions: TransportException[];
  insuranceProducts: InsuranceProduct[];
  insurancePolicies: InsurancePolicy[];
  insuranceClaims: InsuranceClaim[];
};

function getMockData(): AppData {
  const now = new Date().toISOString();

  const customers: Customer[] = [
    { id: generateId(), name: '张三', phone: '13800138001', address: '北京市朝阳区建国路88号' },
    { id: generateId(), name: '李四', phone: '13800138002', address: '上海市浦东新区世纪大道100号' },
    { id: generateId(), name: '王五', phone: '13800138003', address: '广州市天河区天河路385号' },
  ];

  const pets: Pet[] = [
    { id: generateId(), name: '豆豆', species: '狗', breed: '金毛', age: 3, gender: '公', weight_kg: 25, photo_url: '', customer_id: customers[0].id, created_at: now },
    { id: generateId(), name: '咪咪', species: '猫', breed: '英短', age: 2, gender: '母', weight_kg: 4.5, photo_url: '', customer_id: customers[1].id, created_at: now },
    { id: generateId(), name: '旺财', species: '狗', breed: '柯基', age: 1, gender: '公', weight_kg: 12, photo_url: '', customer_id: customers[2].id, created_at: now },
  ];

  const petProfiles: PetProfile[] = [
    { id: generateId(), pet_id: pets[0].id, diet_habit: '每天两次，每次200g狗粮', sleep_schedule: '晚上10点到早上7点', special_needs: '对鸡肉过敏', medical_info: '已接种所有疫苗', temperament: '温顺友好', favorite_toys: '飞盘、网球', notes: '喜欢散步' },
    { id: generateId(), pet_id: pets[1].id, diet_habit: '自由进食猫粮', sleep_schedule: '白天睡觉，晚上活跃', special_needs: '无', medical_info: '已绝育，接种疫苗', temperament: '安静独立', favorite_toys: '逗猫棒、毛线球', notes: '怕陌生人' },
  ];

  const routes: Route[] = [
    { id: generateId(), origin: '北京', destination: '天津', distance_km: 120, duration_hours: 1.5, base_price: 50, is_active: true },
    { id: generateId(), origin: '上海', destination: '苏州', distance_km: 100, duration_hours: 1.2, base_price: 45, is_active: true },
    { id: generateId(), origin: '广州', destination: '深圳', distance_km: 140, duration_hours: 2, base_price: 60, is_active: true },
    { id: generateId(), origin: '北京', destination: '上海', distance_km: 1200, duration_hours: 14, base_price: 300, is_active: true },
  ];

  const vehicles: Vehicle[] = [
    { id: generateId(), plate_number: '京A12345', vehicle_type: '中型' as VehicleType, capacity: 5, status: '空闲' as VehicleStatus, driver_name: '陈师傅', driver_phone: '13900139001' },
    { id: generateId(), plate_number: '京B67890', vehicle_type: '大型' as VehicleType, capacity: 10, status: '使用中' as VehicleStatus, driver_name: '刘师傅', driver_phone: '13900139002' },
    { id: generateId(), plate_number: '沪C11111', vehicle_type: '小型' as VehicleType, capacity: 3, status: '空闲' as VehicleStatus, driver_name: '赵师傅', driver_phone: '13900139003' },
    { id: generateId(), plate_number: '粤D22222', vehicle_type: '豪华' as VehicleType, capacity: 4, status: '维护中' as VehicleStatus, driver_name: '孙师傅', driver_phone: '13900139004' },
  ];

  const employees: Employee[] = [
    { id: generateId(), name: '陈师傅', employee_no: 'EMP001', phone: '13900139001', role: '司机' as EmployeeRole, is_available: true },
    { id: generateId(), name: '刘师傅', employee_no: 'EMP002', phone: '13900139002', role: '司机' as EmployeeRole, is_available: false },
    { id: generateId(), name: '周调度', employee_no: 'EMP003', phone: '13900139005', role: '调度员' as EmployeeRole, is_available: true },
    { id: generateId(), name: '吴管理', employee_no: 'EMP004', phone: '13900139006', role: '管理员' as EmployeeRole, is_available: true },
  ];

  const pricingRules: PricingRule[] = [
    { id: generateId(), vehicle_type: '小型' as VehicleType, pet_species: '狗', weight_min: 0, weight_max: 10, price_per_km: 1.5, surcharge: 0 },
    { id: generateId(), vehicle_type: '小型' as VehicleType, pet_species: '狗', weight_min: 10, weight_max: 30, price_per_km: 2, surcharge: 20 },
    { id: generateId(), vehicle_type: '中型' as VehicleType, pet_species: '狗', weight_min: 0, weight_max: 10, price_per_km: 2, surcharge: 0 },
    { id: generateId(), vehicle_type: '中型' as VehicleType, pet_species: '狗', weight_min: 10, weight_max: 30, price_per_km: 2.5, surcharge: 30 },
    { id: generateId(), vehicle_type: '大型' as VehicleType, pet_species: '狗', weight_min: 0, weight_max: 10, price_per_km: 2.5, surcharge: 0 },
    { id: generateId(), vehicle_type: '大型' as VehicleType, pet_species: '狗', weight_min: 10, weight_max: 50, price_per_km: 3, surcharge: 50 },
    { id: generateId(), vehicle_type: '小型' as VehicleType, pet_species: '猫', weight_min: 0, weight_max: 10, price_per_km: 1.2, surcharge: 0 },
    { id: generateId(), vehicle_type: '中型' as VehicleType, pet_species: '猫', weight_min: 0, weight_max: 10, price_per_km: 1.8, surcharge: 0 },
  ];

  const orders: Order[] = [
    {
      id: generateId(),
      order_no: generateOrderNo(),
      pet_id: pets[0].id,
      customer_id: customers[0].id,
      route_id: routes[0].id,
      vehicle_id: vehicles[1].id,
      employee_id: employees[1].id,
      cage_type: '大型笼' as CageType,
      luxury_level: '舒适' as LuxuryLevel,
      cage_price: 100,
      luxury_price: 96,
      base_price: 50,
      surcharge: 30,
      total_price: 380,
      status: 'in_transit' as OrderStatus,
      pickup_time: now,
      delivery_time: '',
      receiver_name: '张夫人',
      receiver_phone: '13800138010',
      satisfaction: null,
      remark: '请轻拿轻放',
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      order_no: generateOrderNo(),
      pet_id: pets[1].id,
      customer_id: customers[1].id,
      route_id: routes[1].id,
      vehicle_id: vehicles[0].id,
      employee_id: employees[0].id,
      cage_type: '小型笼' as CageType,
      luxury_level: '经济' as LuxuryLevel,
      cage_price: 30,
      luxury_price: 0,
      base_price: 45,
      surcharge: 0,
      total_price: 165,
      status: 'pending' as OrderStatus,
      pickup_time: '',
      delivery_time: '',
      receiver_name: '李先生',
      receiver_phone: '13800138020',
      satisfaction: null,
      remark: '',
      created_at: now,
      updated_at: now,
    },
  ];

  const orderStatusLogs: OrderStatusLog[] = [
    { id: generateId(), order_id: orders[0].id, status: 'pending' as OrderStatus, location: '北京仓库', remark: '订单已创建', created_at: now },
    { id: generateId(), order_id: orders[0].id, status: 'accepted' as OrderStatus, location: '北京仓库', remark: '员工已接单', created_at: now },
    { id: generateId(), order_id: orders[0].id, status: 'picked_up' as OrderStatus, location: '客户地址', remark: '已接宠', created_at: now },
    { id: generateId(), order_id: orders[0].id, status: 'in_transit' as OrderStatus, location: '京津高速', remark: '运输中', created_at: now },
  ];

  const transportLocations: TransportLocation[] = [
    {
      id: generateId(),
      order_id: orders[0].id,
      location: '北京市朝阳区',
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区建国路88号',
      remark: '已成功接取宠物，状态良好',
      reported_by: '陈师傅',
      reported_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      order_id: orders[0].id,
      location: '京津高速入口',
      latitude: 39.8500,
      longitude: 116.5000,
      address: '京津高速北京段入口',
      remark: '已进入京津高速，正常行驶',
      reported_by: '陈师傅',
      reported_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      order_id: orders[0].id,
      location: '天津市武清区',
      latitude: 39.3800,
      longitude: 117.0500,
      address: '天津市武清区京津高速服务区',
      remark: '停靠服务区休息，检查宠物状态',
      reported_by: '陈师傅',
      reported_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      order_id: orders[0].id,
      location: '天津市西青区',
      latitude: 39.1400,
      longitude: 117.1700,
      address: '天津市西青区杨柳青镇',
      remark: '继续运输中，预计2小时后到达',
      reported_by: '陈师傅',
      reported_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      order_id: orders[0].id,
      location: '天津市南开区',
      latitude: 39.1300,
      longitude: 117.1600,
      address: '天津市南开区黄河道',
      remark: '即将到达目的地',
      reported_by: '陈师傅',
      reported_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      order_id: orders[4].id,
      location: '广州市天河区',
      latitude: 23.1291,
      longitude: 113.2644,
      address: '广州市天河区体育西路',
      remark: '已成功接取宠物，老年犬状态稳定',
      reported_by: '刘师傅',
      reported_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      order_id: orders[4].id,
      location: '广州市白云区',
      latitude: 23.1800,
      longitude: 113.2700,
      address: '广州市白云区机场高速入口',
      remark: '已进入机场高速，平稳驾驶中',
      reported_by: '刘师傅',
      reported_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const exceptions: TransportException[] = [
    {
      id: generateId(),
      exception_no: 'EXC20250610001',
      order_id: orders[0].id,
      type: 'vehicle' as ExceptionType,
      severity: 'high' as ExceptionSeverity,
      status: 'processing' as ExceptionStatus,
      title: '运输车辆发动机故障',
      description: '车辆在高速公路行驶途中发动机出现异响，仪表盘显示发动机故障灯亮起，需要紧急停靠检查',
      location: '京沪高速济南段K120处',
      reporter_name: '陈师傅',
      reported_at: '2025-06-10T14:30:00Z',
      handler_name: '林调度',
      handled_at: '2025-06-10T14:45:00Z',
      resolution: '',
      processing_logs: [
        { id: generateId(), exception_id: '', action: '上报异常', operator: '陈师傅', remark: '车辆发动机故障，已停靠应急车道', created_at: '2025-06-10T14:30:00Z' },
        { id: generateId(), exception_id: '', action: '受理处理', operator: '林调度', remark: '已安排拖车和备用车辆前往', created_at: '2025-06-10T14:45:00Z' },
      ],
    },
    {
      id: generateId(),
      exception_no: 'EXC20250610002',
      order_id: orders[0].id,
      type: 'pet' as ExceptionType,
      severity: 'critical' as ExceptionSeverity,
      status: 'resolved' as ExceptionStatus,
      title: '宠物出现呕吐症状',
      description: '运输途中宠物出现持续呕吐，精神萎靡，怀疑晕车或食物中毒，需要立即处理',
      location: '京沪高速徐州段',
      reporter_name: '陈师傅',
      reported_at: '2025-06-10T10:20:00Z',
      handler_name: '林调度',
      handled_at: '2025-06-10T10:30:00Z',
      resolution: '已在最近服务区停靠，联系就近宠物医院就诊，经检查为晕车反应，已给予药物治疗，宠物状态恢复稳定',
      processing_logs: [
        { id: generateId(), exception_id: '', action: '上报异常', operator: '陈师傅', remark: '宠物持续呕吐，精神萎靡', created_at: '2025-06-10T10:20:00Z' },
        { id: generateId(), exception_id: '', action: '受理处理', operator: '林调度', remark: '指示司机就近服务区停靠，联系宠物医院', created_at: '2025-06-10T10:30:00Z' },
        { id: generateId(), exception_id: '', action: '处理中', operator: '陈师傅', remark: '已到达服务区，带宠物前往就近宠物医院', created_at: '2025-06-10T11:00:00Z' },
        { id: generateId(), exception_id: '', action: '已解决', operator: '林调度', remark: '宠物经检查为晕车反应，已治疗恢复，继续运输', created_at: '2025-06-10T12:30:00Z' },
      ],
    },
    {
      id: generateId(),
      exception_no: 'EXC20250609001',
      order_id: orders[0].id,
      type: 'pet' as ExceptionType,
      severity: 'medium' as ExceptionSeverity,
      status: 'closed' as ExceptionStatus,
      title: '老年犬关节不适',
      description: '运输途中老年犬出现站立困难，疑似关节炎发作，需要调整运输方式',
      location: '京港澳高速郑州段',
      reporter_name: '刘师傅',
      reported_at: '2025-06-09T16:00:00Z',
      handler_name: '林调度',
      handled_at: '2025-06-09T16:15:00Z',
      resolution: '已在服务区停靠给宠物服药，铺设了更柔软的垫子，后续运输每2小时停车检查一次',
      processing_logs: [
        { id: generateId(), exception_id: '', action: '上报异常', operator: '刘师傅', remark: '老年犬站立困难，疑似关节炎', created_at: '2025-06-09T16:00:00Z' },
        { id: generateId(), exception_id: '', action: '受理处理', operator: '林调度', remark: '指示停车检查，给予关节药物', created_at: '2025-06-09T16:15:00Z' },
        { id: generateId(), exception_id: '', action: '已解决', operator: '刘师傅', remark: '已服药，铺设软垫，宠物状态好转', created_at: '2025-06-09T17:00:00Z' },
        { id: generateId(), exception_id: '', action: '已关闭', operator: '林调度', remark: '持续跟踪无异常，关闭', created_at: '2025-06-10T08:00:00Z' },
      ],
    },
    {
      id: generateId(),
      exception_no: 'EXC20250608001',
      order_id: orders[1].id,
      type: 'weather' as ExceptionType,
      severity: 'medium' as ExceptionSeverity,
      status: 'reported' as ExceptionStatus,
      title: '暴雨天气影响运输',
      description: '目的地上海地区发布暴雨预警，可能影响运输安全和送达时间',
      location: '上海方向',
      reporter_name: '赵师傅',
      reported_at: '2025-06-08T15:00:00Z',
      handler_name: '',
      handled_at: '',
      resolution: '',
      processing_logs: [
        { id: generateId(), exception_id: '', action: '上报异常', operator: '赵师傅', remark: '上海暴雨预警，建议延迟出发', created_at: '2025-06-08T15:00:00Z' },
      ],
    },
    {
      id: generateId(),
      exception_no: 'EXC20250607001',
      order_id: orders[0].id,
      type: 'vehicle' as ExceptionType,
      severity: 'low' as ExceptionSeverity,
      status: 'resolved' as ExceptionStatus,
      title: '车辆空调制冷不足',
      description: '运输车辆空调制冷效果不佳，车厢温度偏高，可能影响宠物舒适度',
      location: '广深高速',
      reporter_name: '孙师傅',
      reported_at: '2025-06-07T11:00:00Z',
      handler_name: '林调度',
      handled_at: '2025-06-07T11:20:00Z',
      resolution: '已开窗通风并降低车速减少热量，空调问题已安排回程检修',
      processing_logs: [
        { id: generateId(), exception_id: '', action: '上报异常', operator: '孙师傅', remark: '空调制冷不足，车厢温度偏高', created_at: '2025-06-07T11:00:00Z' },
        { id: generateId(), exception_id: '', action: '受理处理', operator: '林调度', remark: '建议开窗通风，低速行驶', created_at: '2025-06-07T11:20:00Z' },
        { id: generateId(), exception_id: '', action: '已解决', operator: '孙师傅', remark: '已开窗通风，温度恢复适宜', created_at: '2025-06-07T12:00:00Z' },
      ],
    },
  ];

  const insuranceProducts: InsuranceProduct[] = [
    {
      id: generateId(),
      name: '基础运输保障',
      type: 'basic' as InsuranceType,
      description: '基础宠物运输安全保障，覆盖常见意外风险',
      coverage_rate: 0.8,
      max_coverage: 5000,
      premium_rate: 0.03,
      min_premium: 30,
      deductible: 200,
      is_active: true,
      coverage_items: ['运输途中意外伤害', '意外身故', '紧急医疗救治', '交通事故'],
      exclusions: ['先天性疾病', '既往症', '自杀自残', '未按要求笼具运输'],
      created_at: now,
    },
    {
      id: generateId(),
      name: '标准全面保障',
      type: 'standard' as InsuranceType,
      description: '全面的宠物运输保障，含医疗和第三方责任',
      coverage_rate: 0.9,
      max_coverage: 20000,
      premium_rate: 0.05,
      min_premium: 80,
      deductible: 100,
      is_active: true,
      coverage_items: ['意外伤害', '意外身故', '医疗费用', '第三方责任', '笼具损坏赔偿', '延误赔偿'],
      exclusions: ['先天性疾病', '既往症', '故意行为', '战争暴乱'],
      created_at: now,
    },
    {
      id: generateId(),
      name: '尊享无忧保障',
      type: 'premium' as InsuranceType,
      description: '高端宠物运输全无忧保障，无免赔额，覆盖全面',
      coverage_rate: 1.0,
      max_coverage: 100000,
      premium_rate: 0.08,
      min_premium: 200,
      deductible: 0,
      is_active: true,
      coverage_items: ['意外伤害全额赔付', '意外身故全额赔付', '全额医疗费用', '第三方责任', '笼具损坏', '延误赔偿', '精神损失', '找宠服务'],
      exclusions: ['故意行为导致', '违法运输'],
      created_at: now,
    },
  ];

  const insurancePolicies: InsurancePolicy[] = [
    {
      id: generateId(),
      policy_no: 'INS' + Date.now() + '001',
      order_id: orders[0].id,
      customer_id: customers[0].id,
      pet_id: pets[0].id,
      product_id: insuranceProducts[1].id,
      pet_value: 8000,
      premium_amount: 400,
      coverage_amount: 7200,
      status: 'active' as InsuranceStatus,
      purchase_date: now,
      effective_date: now,
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      has_claimed: false,
      total_claimed_amount: 0,
      created_at: now,
    },
    {
      id: generateId(),
      policy_no: 'INS' + Date.now() + '002',
      order_id: orders[1].id,
      customer_id: customers[1].id,
      pet_id: pets[1].id,
      product_id: insuranceProducts[0].id,
      pet_value: 3000,
      premium_amount: 90,
      coverage_amount: 2400,
      status: 'active' as InsuranceStatus,
      purchase_date: now,
      effective_date: now,
      expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      has_claimed: false,
      total_claimed_amount: 0,
      created_at: now,
    },
  ];

  const insuranceClaims: InsuranceClaim[] = [
    {
      id: generateId(),
      claim_no: 'CLM' + Date.now() + '001',
      policy_id: insurancePolicies[0].id,
      order_id: orders[0].id,
      customer_id: customers[0].id,
      pet_id: pets[0].id,
      reason: 'injury' as ClaimReason,
      title: '运输途中宠物腿部擦伤',
      description: '宠物在运输过程中因急刹车导致腿部轻微擦伤，已送至宠物医院处理，花费医疗费用800元',
      claimed_amount: 800,
      approved_amount: 630,
      status: 'approved' as ClaimStatus,
      incident_date: '2025-06-10T08:30:00Z',
      incident_location: '京沪高速天津段',
      reporter_name: '张三',
      reporter_phone: '13800138001',
      submitted_at: '2025-06-10T12:00:00Z',
      reviewer_name: '吴管理',
      reviewed_at: '2025-06-10T15:00:00Z',
      resolution: '经审核，属于保障范围，扣除免赔额100元后，按90%比例赔付630元',
      payment_date: '2025-06-11T10:00:00Z',
      evidence_urls: [],
      processing_logs: [
        { id: generateId(), claim_id: '', action: '提交理赔', operator: '张三', remark: '已提交理赔申请及医疗凭证', created_at: '2025-06-10T12:00:00Z' },
        { id: generateId(), claim_id: '', action: '材料审核', operator: '吴管理', remark: '材料齐全，开始审核', created_at: '2025-06-10T13:00:00Z' },
        { id: generateId(), claim_id: '', action: '审核通过', operator: '吴管理', remark: '同意赔付630元', created_at: '2025-06-10T15:00:00Z' },
        { id: generateId(), claim_id: '', action: '赔付完成', operator: '系统', remark: '赔款已支付至客户账户', created_at: '2025-06-11T10:00:00Z' },
      ],
    },
  ];

  return {
    pets,
    petProfiles,
    customers,
    routes,
    vehicles,
    employees,
    pricingRules,
    orders,
    orderStatusLogs,
    transportLocations,
    exceptions,
    insuranceProducts,
    insurancePolicies,
    insuranceClaims,
  };
}

function loadFromStorage(): AppData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AppData;
    }
  } catch {
    console.error('Failed to load state from localStorage');
  }
  return null;
}

function saveToStorage(state: AppState) {
  try {
    const toSave: AppData = {
      pets: state.pets,
      petProfiles: state.petProfiles,
      customers: state.customers,
      routes: state.routes,
      vehicles: state.vehicles,
      employees: state.employees,
      pricingRules: state.pricingRules,
      orders: state.orders,
      orderStatusLogs: state.orderStatusLogs,
      transportLocations: state.transportLocations,
      exceptions: state.exceptions,
      insuranceProducts: state.insuranceProducts,
      insurancePolicies: state.insurancePolicies,
      insuranceClaims: state.insuranceClaims,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

const initialData: AppData = (() => {
  const stored = loadFromStorage();
  if (stored) {
    const mockData = getMockData();
    const migratedOrders = (stored.orders ?? mockData.orders).map((order) => {
      if (!order.cage_type) {
        return {
          ...order,
          cage_type: '中型笼' as CageType,
          luxury_level: '经济' as LuxuryLevel,
          cage_price: 60,
          luxury_price: 0,
        };
      }
      return order;
    });
    return {
      ...stored,
      orders: migratedOrders,
      exceptions: stored.exceptions ?? mockData.exceptions,
      transportLocations: stored.transportLocations ?? mockData.transportLocations,
    };
  }
  return getMockData();
})();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialData,

  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
    };
    set((state) => {
      const newState = { ...state, customers: [...state.customers, newCustomer] };
      saveToStorage(newState);
      return newState;
    });
    return newCustomer;
  },

  addPet: (pet) =>
    set((state) => {
      const newPet: Pet = {
        ...pet,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      const newState = { ...state, pets: [...state.pets, newPet] };
      saveToStorage(newState);
      return newState;
    }),

  updatePet: (id, pet) =>
    set((state) => {
      const newState = {
        ...state,
        pets: state.pets.map((p) => (p.id === id ? { ...p, ...pet } : p)),
      };
      saveToStorage(newState);
      return newState;
    }),

  deletePet: (id) =>
    set((state) => {
      const newState = {
        ...state,
        pets: state.pets.filter((p) => p.id !== id),
        petProfiles: state.petProfiles.filter((pp) => pp.pet_id !== id),
      };
      saveToStorage(newState);
      return newState;
    }),

  addPetProfile: (profile) =>
    set((state) => {
      const newProfile: PetProfile = {
        ...profile,
        id: generateId(),
      };
      const newState = { ...state, petProfiles: [...state.petProfiles, newProfile] };
      saveToStorage(newState);
      return newState;
    }),

  updatePetProfile: (id, profile) =>
    set((state) => {
      const newState = {
        ...state,
        petProfiles: state.petProfiles.map((pp) =>
          pp.id === id ? { ...pp, ...profile } : pp,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  addRoute: (route) =>
    set((state) => {
      const newRoute: Route = {
        ...route,
        id: generateId(),
      };
      const newState = { ...state, routes: [...state.routes, newRoute] };
      saveToStorage(newState);
      return newState;
    }),

  updateRoute: (id, route) =>
    set((state) => {
      const newState = {
        ...state,
        routes: state.routes.map((r) => (r.id === id ? { ...r, ...route } : r)),
      };
      saveToStorage(newState);
      return newState;
    }),

  deleteRoute: (id) =>
    set((state) => {
      const newState = {
        ...state,
        routes: state.routes.filter((r) => r.id !== id),
      };
      saveToStorage(newState);
      return newState;
    }),

  addVehicle: (vehicle) =>
    set((state) => {
      const newVehicle: Vehicle = {
        ...vehicle,
        id: generateId(),
      };
      const newState = { ...state, vehicles: [...state.vehicles, newVehicle] };
      saveToStorage(newState);
      return newState;
    }),

  updateVehicle: (id, vehicle) =>
    set((state) => {
      const newState = {
        ...state,
        vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...vehicle } : v)),
      };
      saveToStorage(newState);
      return newState;
    }),

  deleteVehicle: (id) =>
    set((state) => {
      const newState = {
        ...state,
        vehicles: state.vehicles.filter((v) => v.id !== id),
      };
      saveToStorage(newState);
      return newState;
    }),

  addPricingRule: (rule) =>
    set((state) => {
      const newRule: PricingRule = {
        ...rule,
        id: generateId(),
      };
      const newState = { ...state, pricingRules: [...state.pricingRules, newRule] };
      saveToStorage(newState);
      return newState;
    }),

  updatePricingRule: (id, rule) =>
    set((state) => {
      const newState = {
        ...state,
        pricingRules: state.pricingRules.map((r) =>
          r.id === id ? { ...r, ...rule } : r,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  deletePricingRule: (id) =>
    set((state) => {
      const newState = {
        ...state,
        pricingRules: state.pricingRules.filter((r) => r.id !== id),
      };
      saveToStorage(newState);
      return newState;
    }),

  addEmployee: (employee) =>
    set((state) => {
      const newEmployee: Employee = {
        ...employee,
        id: generateId(),
      };
      const newState = { ...state, employees: [...state.employees, newEmployee] };
      saveToStorage(newState);
      return newState;
    }),

  updateEmployee: (id, employee) =>
    set((state) => {
      const newState = {
        ...state,
        employees: state.employees.map((e) =>
          e.id === id ? { ...e, ...employee } : e,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  addOrder: (order) =>
    set((state) => {
      const now = new Date().toISOString();
      const newOrder: Order = {
        ...order,
        id: generateId(),
        order_no: generateOrderNo(),
        created_at: now,
        updated_at: now,
      };
      const newState = { ...state, orders: [...state.orders, newOrder] };
      saveToStorage(newState);
      return newState;
    }),

  updateOrderStatus: (id, status) =>
    set((state) => {
      const newState = {
        ...state,
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  addOrderStatusLog: (log) =>
    set((state) => {
      const newLog: OrderStatusLog = {
        ...log,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      const newState = {
        ...state,
        orderStatusLogs: [...state.orderStatusLogs, newLog],
      };
      saveToStorage(newState);
      return newState;
    }),

  addTransportLocation: (location) =>
    set((state) => {
      const newLocation: TransportLocation = {
        ...location,
        id: generateId(),
        reported_at: new Date().toISOString(),
      };
      const newState = {
        ...state,
        transportLocations: [...state.transportLocations, newLocation],
      };
      saveToStorage(newState);
      return newState;
    }),

  addException: (exception) =>
    set((state) => {
      const now = new Date().toISOString();
      const newException: TransportException = {
        ...exception,
        id: generateId(),
        exception_no: `EXC${Date.now()}`,
        reported_at: now,
        processing_logs: [
          {
            id: generateId(),
            exception_id: '',
            action: '上报异常',
            operator: exception.reporter_name,
            remark: '异常已上报',
            created_at: now,
          },
        ],
      };
      const newState = { ...state, exceptions: [...state.exceptions, newException] };
      saveToStorage(newState);
      return newState;
    }),

  updateExceptionStatus: (id, status, handlerName, resolution) =>
    set((state) => {
      const now = new Date().toISOString();
      const newState = {
        ...state,
        exceptions: state.exceptions.map((e) =>
          e.id === id
            ? {
                ...e,
                status,
                handler_name: handlerName || e.handler_name,
                handled_at: e.handled_at || now,
                resolution: resolution || e.resolution,
              }
            : e,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  addExceptionProcessingLog: (exceptionId, log) =>
    set((state) => {
      const newLog: ExceptionProcessingLog = {
        ...log,
        id: generateId(),
        exception_id: exceptionId,
        created_at: new Date().toISOString(),
      };
      const newState = {
        ...state,
        exceptions: state.exceptions.map((e) =>
          e.id === exceptionId
            ? { ...e, processing_logs: [...e.processing_logs, newLog] }
            : e,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  addInsuranceProduct: (product) =>
    set((state) => {
      const newProduct: InsuranceProduct = {
        ...product,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      const newState = { ...state, insuranceProducts: [...state.insuranceProducts, newProduct] };
      saveToStorage(newState);
      return newState;
    }),

  updateInsuranceProduct: (id, product) =>
    set((state) => {
      const newState = {
        ...state,
        insuranceProducts: state.insuranceProducts.map((p) =>
          p.id === id ? { ...p, ...product } : p,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  deleteInsuranceProduct: (id) =>
    set((state) => {
      const newState = {
        ...state,
        insuranceProducts: state.insuranceProducts.filter((p) => p.id !== id),
      };
      saveToStorage(newState);
      return newState;
    }),

  addInsurancePolicy: (policy) =>
    set((state) => {
      const now = new Date().toISOString();
      const newPolicy: InsurancePolicy = {
        ...policy,
        id: generateId(),
        policy_no: 'INS' + Date.now(),
        created_at: now,
      };
      const newState = { ...state, insurancePolicies: [...state.insurancePolicies, newPolicy] };
      saveToStorage(newState);
      return newState;
    }),

  updateInsurancePolicyStatus: (id, status) =>
    set((state) => {
      const newState = {
        ...state,
        insurancePolicies: state.insurancePolicies.map((p) =>
          p.id === id ? { ...p, status } : p,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),

  surrenderInsurancePolicy: (id, reason) => {
    let result: { success: boolean; message: string; refundAmount?: number } = { success: false, message: '', refundAmount: 0 };
    set((state) => {
      const policy = state.insurancePolicies.find((p) => p.id === id);
      if (!policy) {
        result = { success: false, message: '保单不存在', refundAmount: 0 };
        return state;
      }
      if (policy.status !== 'pending' && policy.status !== 'active') {
        result = { success: false, message: '只有待生效或保障中的保单才可退保', refundAmount: 0 };
        return state;
      }
      if (policy.has_claimed) {
        result = { success: false, message: '已发生理赔的保单不可退保', refundAmount: 0 };
        return state;
      }
      if (policy.status === 'active') {
        const hasPendingOrReviewing = state.insuranceClaims.some(
          (c) => c.policy_id === id && (c.status === 'submitted' || c.status === 'reviewing'),
        );
        if (hasPendingOrReviewing) {
          result = { success: false, message: '该保单存在待处理理赔申请，暂不可退保', refundAmount: 0 };
          return state;
        }
      }
      const now = new Date();
      const effectiveDate = new Date(policy.effective_date);
      const expiryDate = new Date(policy.expiry_date);
      let refundRate = 0;
      if (policy.status === 'pending') {
        refundRate = 1.0;
      } else if (now < effectiveDate) {
        refundRate = 1.0;
      } else {
        const hoursElapsed = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60);
        if (hoursElapsed <= 24) {
          refundRate = 0.8;
        } else if (now < expiryDate) {
          refundRate = 0.5;
        } else {
          result = { success: false, message: '保单已过期，不可退保', refundAmount: 0 };
          return state;
        }
      }
      const refundAmount = Math.round(policy.premium_amount * refundRate * 100) / 100;
      const newState = {
        ...state,
        insurancePolicies: state.insurancePolicies.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'cancelled' as InsuranceStatus,
                surrender_date: now.toISOString(),
                surrender_reason: reason,
                refund_amount: refundAmount,
              }
            : p,
        ),
      };
      saveToStorage(newState);
      result = { success: true, message: '退保成功', refundAmount };
      return newState;
    });
    return result;
  },

  addInsuranceClaim: (claim) =>
    set((state) => {
      const now = new Date().toISOString();
      const newClaim: InsuranceClaim = {
        ...claim,
        id: generateId(),
        claim_no: 'CLM' + Date.now(),
        submitted_at: now,
        processing_logs: [
          {
            id: generateId(),
            claim_id: '',
            action: '提交理赔',
            operator: claim.reporter_name,
            remark: '理赔申请已提交',
            created_at: now,
          },
        ],
      };
      const newState = { ...state, insuranceClaims: [...state.insuranceClaims, newClaim] };
      saveToStorage(newState);
      return newState;
    }),

  updateInsuranceClaimStatus: (id, status, reviewerName, approvedAmount, resolution) =>
    set((state) => {
      const now = new Date().toISOString();
      const newState = {
        ...state,
        insuranceClaims: state.insuranceClaims.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                reviewer_name: reviewerName || c.reviewer_name,
                reviewed_at: c.reviewed_at || now,
                approved_amount: approvedAmount ?? c.approved_amount,
                resolution: resolution || c.resolution,
                payment_date: status === 'paid' ? now : c.payment_date,
              }
            : c,
        ),
        insurancePolicies: state.insurancePolicies.map((p) => {
          const claim = state.insuranceClaims.find((c) => c.id === id);
          if (claim && claim.policy_id === p.id && (status === 'approved' || status === 'paid')) {
            return {
              ...p,
              has_claimed: true,
              total_claimed_amount: p.total_claimed_amount + (approvedAmount ?? claim.claimed_amount),
            };
          }
          return p;
        }),
      };
      saveToStorage(newState);
      return newState;
    }),

  addInsuranceClaimProcessingLog: (claimId, log) =>
    set((state) => {
      const newLog: ClaimProcessingLog = {
        ...log,
        id: generateId(),
        claim_id: claimId,
        created_at: new Date().toISOString(),
      };
      const newState = {
        ...state,
        insuranceClaims: state.insuranceClaims.map((c) =>
          c.id === claimId
            ? { ...c, processing_logs: [...c.processing_logs, newLog] }
            : c,
        ),
      };
      saveToStorage(newState);
      return newState;
    }),
}));
