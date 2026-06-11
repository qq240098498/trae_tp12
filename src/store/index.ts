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
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

const initialData: AppData = loadFromStorage() || getMockData();

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
}));
