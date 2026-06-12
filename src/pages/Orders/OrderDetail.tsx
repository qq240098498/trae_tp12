import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  PawPrint,
  Route,
  Car,
  User,
  CreditCard,
  MapPin,
  CheckCircle2,
  Star,
  Navigation,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { formatDate, formatPrice, getStatusText } from '@/utils';
import type { OrderStatus as AppOrderStatus } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import StatusTimeline, {
  OrderStatus as TimelineOrderStatus,
  StatusLog,
} from '@/components/StatusTimeline';
import TransportTimeline from '@/components/TransportTimeline';

function mapStatusToTimeline(status: AppOrderStatus): TimelineOrderStatus {
  const map: Record<AppOrderStatus, TimelineOrderStatus> = {
    pending: 'pending',
    accepted: 'confirmed',
    picked_up: 'picked_up',
    in_transit: 'in_transit',
    arrived: 'delivered',
    completed: 'delivered',
    cancelled: 'cancelled',
  };
  return map[status];
}

function getBadgeVariant(status: AppOrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<AppOrderStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    orders,
    pets,
    petProfiles,
    routes,
    vehicles,
    employees,
    customers,
    orderStatusLogs,
    transportLocations,
    updateOrderStatus,
    addOrderStatusLog,
    addTransportLocation,
  } = useAppStore();

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [locationRemark, setLocationRemark] = useState('');

  const order = orders.find((o) => o.id === id);

  const pet = pets.find((p) => p.id === order?.pet_id);
  const petProfile = petProfiles.find((pp) => pp.pet_id === pet?.id);
  const route = routes.find((r) => r.id === order?.route_id);
  const vehicle = vehicles.find((v) => v.id === order?.vehicle_id);
  const employee = employees.find((e) => e.id === order?.employee_id);
  const customer = customers.find((c) => c.id === order?.customer_id);

  const timelineStatusLogs: StatusLog[] = useMemo(() => {
    if (!order) return [];
    const logs = orderStatusLogs
      .filter((l) => l.order_id === order.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return logs.map((log) => ({
      status: mapStatusToTimeline(log.status),
      time: formatDate(log.created_at),
      note: log.remark,
      operator: log.location,
    }));
  }, [order, orderStatusLogs]);

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <h2 className="text-xl font-bold text-gray-800">订单详情</h2>
        </div>
        <Card>
          <div className="py-12 text-center text-gray-400">订单不存在</div>
        </Card>
      </div>
    );
  }

  const handleReportLocation = () => {
    if (!location.trim()) return;
    const trimmedLocation = location.trim();
    const trimmedRemark = locationRemark.trim();
    
    addOrderStatusLog({
      order_id: order.id,
      status: order.status,
      location: trimmedLocation,
      remark: trimmedRemark || '位置上报',
    });
    
    const currentEmployee = employees.find((e) => e.id === order.employee_id);
    addTransportLocation({
      order_id: order.id,
      location: trimmedLocation,
      address: trimmedLocation,
      remark: trimmedRemark || '位置上报',
      reported_by: currentEmployee?.name || vehicle?.driver_name || '司机',
    });
    
    setLocation('');
    setLocationRemark('');
    setLocationModalOpen(false);
  };

  const handleStatusUpdate = (newStatus: AppOrderStatus, remark: string) => {
    updateOrderStatus(order.id, newStatus);
    addOrderStatusLog({
      order_id: order.id,
      status: newStatus,
      location: '系统',
      remark,
    });
  };

  const renderActionButtons = () => {
    switch (order.status) {
      case 'pending':
        return (
          <Button
            variant="primary"
            onClick={() => handleStatusUpdate('accepted', '订单已接受')}
          >
            确认接单
          </Button>
        );
      case 'accepted':
        return (
          <Button
            variant="primary"
            onClick={() => handleStatusUpdate('picked_up', '已成功接宠')}
          >
            标记已接宠
          </Button>
        );
      case 'picked_up':
        return (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocationModalOpen(true)}
              leftIcon={<MapPin className="w-4 h-4" />}
            >
              上报位置
            </Button>
            <Button
              variant="primary"
              onClick={() => handleStatusUpdate('in_transit', '开始运输')}
            >
              开始运输
            </Button>
          </div>
        );
      case 'in_transit':
        return (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocationModalOpen(true)}
              leftIcon={<MapPin className="w-4 h-4" />}
            >
              上报位置
            </Button>
            <Button
              variant="primary"
              onClick={() => handleStatusUpdate('arrived', '已到达目的地')}
            >
              标记已到达
            </Button>
          </div>
        );
      case 'arrived':
        return (
          <Button
            variant="primary"
            onClick={() => handleStatusUpdate('completed', '客户已确认签收')}
          >
            确认签收
          </Button>
        );
      default:
        return null;
    }
  };

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary-600" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              订单详情
              <Badge variant={getBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
            </h2>
            <p className="text-sm text-gray-500 font-mono">{order.order_no}</p>
          </div>
        </div>
        <div>{renderActionButtons()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="订单状态" icon={<FileText className="w-5 h-5" />}>
            <StatusTimeline
              currentStatus={mapStatusToTimeline(order.status)}
              statusLogs={timelineStatusLogs}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="基本信息" icon={<FileText className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem label="订单号" value={<span className="font-mono text-xs">{order.order_no}</span>} />
              <InfoItem label="下单时间" value={formatDate(order.created_at)} />
              <InfoItem label="总价" value={<span className="text-primary-600 font-semibold">{formatPrice(order.total_price)}</span>} />
              <InfoItem
                label="满意度"
                value={
                  order.satisfaction ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < order.satisfaction! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    '暂无评价'
                  )
                }
              />
            </div>
          </Card>

          <Card title="宠物信息" icon={<PawPrint className="w-5 h-5" />}>
            {pet ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <PawPrint className="w-10 h-10 text-primary-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{pet.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{pet.species}</Badge>
                      <Badge variant="default">{pet.gender}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem label="品种" value={pet.breed} />
                  <InfoItem label="年龄" value={`${pet.age}岁`} />
                  <InfoItem label="体重" value={`${pet.weight_kg}kg`} />
                  <InfoItem label="主人" value={customer?.name || '-'} />
                </div>
                {petProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary-50 rounded-xl border border-primary-100 space-y-2"
                  >
                    <h4 className="font-semibold text-sm text-primary-700 mb-2">爱好档案</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><span className="text-gray-400">饮食习惯：</span>{petProfile.diet_habit}</div>
                      <div><span className="text-gray-400">作息：</span>{petProfile.sleep_schedule}</div>
                      <div><span className="text-gray-400">特殊需求：</span>{petProfile.special_needs}</div>
                      <div><span className="text-gray-400">性格：</span>{petProfile.temperament}</div>
                      <div><span className="text-gray-400">医疗信息：</span>{petProfile.medical_info}</div>
                      <div><span className="text-gray-400">爱玩玩具：</span>{petProfile.favorite_toys}</div>
                    </div>
                    {petProfile.notes && (
                      <div className="pt-2 border-t border-primary-100">
                        <span className="text-gray-400">备注：</span>
                        <span className="text-gray-600">{petProfile.notes}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400">暂无宠物信息</div>
            )}
          </Card>

          <Card title="运输信息" icon={<Route className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem
                label="运输路线"
                value={route ? `${route.origin} → ${route.destination} (${route.distance_km}km)` : '-'}
                icon={Route}
              />
              <InfoItem
                label="车辆"
                value={vehicle ? `${vehicle.plate_number} (${vehicle.vehicle_type})` : '-'}
                icon={Car}
              />
              <InfoItem
                label="司机"
                value={
                  vehicle
                    ? `${vehicle.driver_name} · ${vehicle.driver_phone}`
                    : '-'
                }
                icon={User}
              />
              <InfoItem
                label="员工"
                value={employee ? `${employee.name} (${employee.employee_no})` : '-'}
                icon={User}
              />
            </div>
            {order.remark && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">订单备注</p>
                <p className="text-sm text-gray-700">{order.remark}</p>
              </div>
            )}
          </Card>

          <Card title="费用明细" icon={<CreditCard className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">基础运费</span>
                <span className="font-medium text-gray-800">{formatPrice(order.base_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">附加费</span>
                <span className="font-medium text-gray-800">{formatPrice(order.surcharge)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                <span className="text-gray-600 font-medium">合计</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(order.total_price)}</span>
              </div>
            </div>
          </Card>

          {(order.status === 'completed' || order.status === 'arrived') && (
            <Card title="签收信息" icon={<CheckCircle2 className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoItem label="收货人" value={order.receiver_name} icon={User} />
                <InfoItem label="联系电话" value={order.receiver_phone} />
                {order.delivery_time && (
                  <InfoItem label="送达时间" value={formatDate(order.delivery_time)} />
                )}
                {order.pickup_time && (
                  <InfoItem label="取件时间" value={formatDate(order.pickup_time)} />
                )}
              </div>
            </Card>
          )}

          <TransportTimeline
            orderId={order.id}
            locations={transportLocations}
            order={order}
            route={route}
            onReportLocation={() => setLocationModalOpen(true)}
          />
        </div>
      </div>

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
