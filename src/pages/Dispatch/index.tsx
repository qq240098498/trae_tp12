import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Truck,
  CheckCircle2,
  PawPrint,
  Route,
  Phone,
  MapPin,
  FileText,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { formatDate, formatPrice, getStatusText } from '@/utils';
import type { Order, OrderStatus } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

type DispatchTab = 'pending' | 'in_transit' | 'completed';

const tabs: { key: DispatchTab; label: string; icon: typeof ClipboardList }[] = [
  { key: 'pending', label: '待接单', icon: ClipboardList },
  { key: 'in_transit', label: '运输中', icon: Truck },
  { key: 'completed', label: '已完成', icon: CheckCircle2 },
];

function getBadgeVariant(status: OrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    pending: 'warning',
    accepted: 'info',
    picked_up: 'info',
    in_transit: 'warning',
    arrived: 'info',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status];
}

export default function DispatchIndex() {
  const navigate = useNavigate();
  const {
    orders,
    pets,
    routes,
    vehicles,
    customers,
    employees,
    updateOrderStatus,
    addOrderStatusLog,
    addTransportLocation,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<DispatchTab>('pending');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [locationRemark, setLocationRemark] = useState('');

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const inTransitOrders = useMemo(
    () => orders.filter((o) => ['accepted', 'picked_up', 'in_transit', 'arrived'].includes(o.status)),
    [orders],
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed' || o.status === 'cancelled'),
    [orders],
  );

  const displayOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'in_transit':
        return inTransitOrders;
      case 'completed':
        return completedOrders;
    }
  }, [activeTab, pendingOrders, inTransitOrders, completedOrders]);

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name || '-';
  const getPet = (petId: string) => pets.find((p) => p.id === petId);
  const getRouteText = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? `${route.origin} → ${route.destination}` : '-';
  };
  const getRoute = (routeId: string) => routes.find((r) => r.id === routeId);
  const getVehicle = (vehicleId: string) => vehicles.find((v) => v.id === vehicleId);
  const getCustomer = (customerId: string) => customers.find((c) => c.id === customerId);
  const getEmployee = (employeeId: string) => employees.find((e) => e.id === employeeId);

  const handleAcceptOrder = (order: Order) => {
    updateOrderStatus(order.id, 'accepted');
    addOrderStatusLog({
      order_id: order.id,
      status: 'accepted',
      location: '调度中心',
      remark: '员工已接单',
    });
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus, remark: string) => {
    updateOrderStatus(orderId, newStatus);
    addOrderStatusLog({
      order_id: orderId,
      status: newStatus,
      location: '运输途中',
      remark,
    });
  };

  const openLocationModal = (orderId: string) => {
    setCurrentOrderId(orderId);
    setLocation('');
    setLocationRemark('');
    setLocationModalOpen(true);
  };

  const handleReportLocation = () => {
    if (!currentOrderId || !location.trim()) return;
    const trimmedLocation = location.trim();
    const trimmedRemark = locationRemark.trim();
    
    addOrderStatusLog({
      order_id: currentOrderId,
      status: 'in_transit',
      location: trimmedLocation,
      remark: trimmedRemark || '位置上报',
    });
    
    const order = orders.find((o) => o.id === currentOrderId);
    const vehicle = order ? vehicles.find((v) => v.id === order.vehicle_id) : null;
    const employee = order ? employees.find((e) => e.id === order.employee_id) : null;
    
    addTransportLocation({
      order_id: currentOrderId,
      location: trimmedLocation,
      address: trimmedLocation,
      remark: trimmedRemark || '位置上报',
      reported_by: employee?.name || vehicle?.driver_name || '司机',
    });
    
    setLocationModalOpen(false);
    setCurrentOrderId(null);
    setLocation('');
    setLocationRemark('');
  };

  const renderOrderCard = (order: Order) => {
    const pet = getPet(order.pet_id);
    const route = getRoute(order.route_id);
    const vehicle = getVehicle(order.vehicle_id);
    const customer = getCustomer(order.customer_id);
    const employee = getEmployee(order.employee_id);

    return (
      <motion.div
        key={order.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="h-full">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gray-500">{order.order_no}</span>
                  <Badge variant={getBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-gray-800">{getPetName(order.pet_id)}</span>
                  {pet && (
                    <span className="text-xs text-gray-400">
                      {pet.breed} · {pet.weight_kg}kg
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-primary-600">{formatPrice(order.total_price)}</div>
                <div className="text-xs text-gray-400 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(order.created_at)}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Route className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {route?.origin} → {route?.destination}
                  <span className="text-gray-400 ml-1">({route?.distance_km}km)</span>
                </span>
              </div>
              {vehicle && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {vehicle.plate_number} · {vehicle.vehicle_type}
                  </span>
                </div>
              )}
              {customer && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {customer.name} · {customer.phone}
                  </span>
                </div>
              )}
              {employee && activeTab !== 'pending' && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    员工：{employee.name} ({employee.employee_no})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  收货人：{order.receiver_name} · {order.receiver_phone}
                </span>
              </div>
            </div>

            {order.remark && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">备注</p>
                <p className="text-sm text-gray-600">{order.remark}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              {activeTab === 'pending' && (
                <Button
                  size="lg"
                  className="w-full"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  onClick={() => handleAcceptOrder(order)}
                >
                  一键接单
                </Button>
              )}

              {activeTab === 'in_transit' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<MapPin className="w-4 h-4" />}
                    onClick={() => openLocationModal(order.id)}
                  >
                    上报位置
                  </Button>
                  {order.status === 'accepted' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate(order.id, 'picked_up', '已成功接宠')}
                    >
                      已接宠
                    </Button>
                  )}
                  {(order.status === 'accepted' || order.status === 'picked_up') && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate(order.id, 'in_transit', '开始运输')}
                    >
                      运输中
                    </Button>
                  )}
                  {order.status === 'in_transit' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate(order.id, 'arrived', '已到达目的地')}
                    >
                      标记到达
                    </Button>
                  )}
                  {order.status === 'arrived' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate(order.id, 'completed', '客户已签收')}
                    >
                      确认签收
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    详情
                  </Button>
                </div>
              )}

              {activeTab === 'completed' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  查看详情
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <Card title="运输调度" icon={<Truck className="w-5 h-5" />}>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'pending'
                ? pendingOrders.length
                : tab.key === 'in_transit'
                  ? inTransitOrders.length
                  : completedOrders.length;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab.key)}
                className={
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ' +
                  (isActive
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={
                    'px-2 py-0.5 rounded-full text-xs font-semibold ' +
                    (isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500')
                  }
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {displayOrders.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400">
              {activeTab === 'pending' && '暂无待接单订单'}
              {activeTab === 'in_transit' && '暂无运输中订单'}
              {activeTab === 'completed' && '暂无已完成订单'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayOrders.map((order) => renderOrderCard(order))}
        </div>
      )}

      <Modal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title="上报位置"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setLocationModalOpen(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleReportLocation} disabled={!location.trim()}>
              确认上报
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="当前位置"
            placeholder="请输入当前所在位置"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="备注说明（选填）"
            placeholder="请输入备注信息"
            value={locationRemark}
            onChange={(e) => setLocationRemark(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
