import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  MapPin,
  Truck,
  PawPrint,
  Route,
  Clock,
  User,
  Phone,
  ChevronRight,
  ChevronDown,
  Send,
  X,
  Eye,
  AlertCircle,
  CheckCircle,
  Coffee,
  Utensils,
  Heart,
  Bed,
  Activity,
  Map,
  RefreshCw,
  Thermometer,
  Droplets,
  Battery,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useTrackReporting, useTrackStatistics } from '@/hooks';
import {
  formatDate,
  getStatusText,
  formatIntervalMinutes,
  getReportFrequencyStatus,
  getReportFrequencyStatusText,
  getReportFrequencyStatusColor,
  getTimeSinceLastReportMinutes,
  getLocationAlerts,
  calculateAvgIntervalMinutes,
} from '@/utils';
import type { Order, TransportLocation } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import TrackMap from '@/components/TrackMap';
import { cn } from '@/lib/utils';

const QUICK_LOCATIONS = [
  { label: '高速服务区', icon: Coffee },
  { label: '收费站', icon: MapPin },
  { label: '加油站', icon: Activity },
  { label: '休息站', icon: Bed },
  { label: '餐厅', icon: Utensils },
];

const PET_STATUS_OPTIONS = [
  { label: '状态良好', icon: Heart, color: 'text-green-500', bg: 'bg-green-50' },
  { label: '正在休息', icon: Bed, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '正在喂食', icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: '稍显焦虑', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function TrackingIndex() {
  const navigate = useNavigate();

  const {
    orders,
    pets,
    routes,
    vehicles,
    employees,
    transportLocations,
    getOrderLocations,
    getCurrentLocation,
  } = useAppStore();

  const {
    isReporting,
    reportError,
    reportSuccess,
    reportLocation,
    validateReport,
    canReport,
    getTimeSinceLastReport,
    getReportCount,
  } = useTrackReporting({
    autoValidate: true,
    showSuccessAnimation: true,
  });

  const { allOrderProgress, getOrderProgress, refresh, isRefreshing } =
    useTrackStatistics({
      autoRefresh: true,
      refreshIntervalMs: 30000,
    });

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [locationRemark, setLocationRemark] = useState('');
  const [selectedPetStatus, setSelectedPetStatus] = useState<string | null>(null);
  const [showMapOrderId, setShowMapOrderId] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState('');

  const inTransitOrders = useMemo(
    () =>
      orders.filter((o) =>
        ['accepted', 'picked_up', 'in_transit', 'arrived'].includes(o.status),
      ),
    [orders],
  );

  const getProgress = (order: Order) => {
    const progress = getOrderProgress(order.id);
    return progress?.progressPercent ?? 10;
  };

  const getPetName = (petId: string) =>
    pets.find((p) => p.id === petId)?.name || '-';
  const getPet = (petId: string) => pets.find((p) => p.id === petId);
  const getRoute = (routeId: string) => routes.find((r) => r.id === routeId);
  const getVehicle = (vehicleId: string) =>
    vehicles.find((v) => v.id === vehicleId);
  const getEmployee = (employeeId: string) =>
    employees.find((e) => e.id === employeeId);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const clearReportForm = () => {
    setLocation('');
    setLocationRemark('');
    setSelectedPetStatus(null);
    setDuplicateError('');
  };

  const openReportModal = (orderId: string) => {
    setCurrentOrderId(orderId);
    clearReportForm();
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    clearReportForm();
    setReportModalOpen(false);
    setCurrentOrderId(null);
  };

  const appendQuickLocation = (quickLoc: string) => {
    if (location.includes(quickLoc)) return;
    setDuplicateError('');
    setLocation((prev) => (prev ? `${prev} ${quickLoc}` : quickLoc));
  };

  const handleReportLocation = async () => {
    if (!currentOrderId) return;

    const validation = validateReport(currentOrderId, location);
    if (!validation.valid) {
      setDuplicateError(validation.error || '');
      return;
    }

    const result = await reportLocation(currentOrderId, location, {
      remark: locationRemark,
      petStatus: selectedPetStatus || undefined,
    });

    if (result) {
      closeReportModal();
      refresh();
    }
  };

  const toggleMapView = (orderId: string) => {
    setShowMapOrderId(showMapOrderId === orderId ? null : orderId);
  };

  const getBadgeVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      pending: 'warning',
      accepted: 'info',
      picked_up: 'info',
      in_transit: 'warning',
      arrived: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return map[status] || 'default';
  };

  const renderLocationAlerts = (loc: TransportLocation) => {
    const alerts = getLocationAlerts(loc);
    if (alerts.length === 0) return null;

    return (
      <div className="flex gap-2 mt-2">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded"
          >
            {alert.type === 'temperature' && <Thermometer className="w-3 h-3" />}
            {alert.type === 'humidity' && <Droplets className="w-3 h-3" />}
            {alert.type === 'battery' && <Battery className="w-3 h-3" />}
            {alert.message}
          </div>
        ))}
      </div>
    );
  };

  const renderOrderCard = (order: Order, index: number) => {
    const pet = getPet(order.pet_id);
    const route = getRoute(order.route_id);
    const vehicle = getVehicle(order.vehicle_id);
    const employee = getEmployee(order.employee_id);
    const currentLoc = getCurrentLocation(order.id);
    const progress = getProgress(order);
    const allLocations = getOrderLocations(order.id);
    const isExpanded = expandedOrderId === order.id;
    const orderProgress = getOrderProgress(order.id);

    const timeSinceLastReport = getTimeSinceLastReportMinutes(currentLoc);
    const frequencyStatus = getReportFrequencyStatus(allLocations);
    const avgInterval = calculateAvgIntervalMinutes(allLocations);
    const reportCount = getReportCount(order.id);
    const canReportNow = canReport(order.id);

    return (
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <div
          className="p-5 cursor-pointer"
          onClick={() => toggleExpand(order.id)}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-6 h-6 text-primary-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-gray-500">
                    {order.order_no}
                  </span>
                  <Badge variant={getBadgeVariant(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-800 truncate">
                  {getPetName(order.pet_id)}
                  {pet && (
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      {pet.breed} · {pet.weight_kg}kg
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              {orderProgress && (
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getReportFrequencyStatusColor(frequencyStatus),
                  )}
                  title={getReportFrequencyStatusText(frequencyStatus)}
                >
                  {getReportFrequencyStatusText(frequencyStatus)}
                </span>
              )}
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Route className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {route?.origin} → {route?.destination}
              <span className="text-gray-400 ml-1">({route?.distance_km}km)</span>
            </span>
          </div>

          {currentLoc ? (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Truck
                    className={cn(
                      'w-4 h-4 text-white',
                      timeSinceLastReport > 120 ? 'animate-pulse' : '',
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-500">当前位置</span>
                    <span className="text-xs text-primary-600 font-medium">
                      实时
                    </span>
                    {timeSinceLastReport > 120 && (
                      <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        久未更新
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {currentLoc.location}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(currentLoc.reported_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {currentLoc.reported_by}
                    </span>
                    {avgInterval > 0 && (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        间隔 {formatIntervalMinutes(avgInterval)}
                      </span>
                    )}
                  </div>
                  {renderLocationAlerts(currentLoc)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">暂无位置上报记录</span>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-500" />
                {route?.origin}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" />
                {route?.destination}
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-md flex items-center justify-center"
                style={{ left: `calc(${progress}% - 8px)` }}
              >
                <Truck className="w-2 h-2 text-primary-500" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>运输进度 {progress.toFixed(0)}%</span>
              <span>共 {reportCount} 次上报</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="truncate">
                      {vehicle?.plate_number} · {vehicle?.vehicle_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="truncate">
                      {vehicle?.driver_name} · {vehicle?.driver_phone}
                    </span>
                  </div>
                  {employee && (
                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>
                        员工：{employee.name} ({employee.employee_no})
                      </span>
                    </div>
                  )}
                </div>

                {orderProgress && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">上报次数</div>
                      <div className="text-lg font-bold text-gray-800">
                        {orderProgress.reportCount}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">平均间隔</div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatIntervalMinutes(orderProgress.avgIntervalMinutes)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">距上次</div>
                      <div
                        className={cn(
                          'text-lg font-bold',
                          timeSinceLastReport > 120
                            ? 'text-red-600'
                            : 'text-gray-800',
                        )}
                      >
                        {formatIntervalMinutes(timeSinceLastReport)}
                      </div>
                    </div>
                  </div>
                )}

                {allLocations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary-500" />
                      轨迹记录
                    </h4>
                    <div className="relative pl-6 max-h-48 overflow-y-auto">
                      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-primary-500 via-primary-300 to-gray-200" />
                      {allLocations
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .reverse()
                        .map((loc, idx) => {
                          const isLatest =
                            idx === allLocations.length - 1 ||
                            (allLocations.length > 5 && idx === 4);
                          return (
                            <div
                              key={loc.id}
                              className="relative mb-3 last:mb-0"
                            >
                              <div
                                className={cn(
                                  'absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2',
                                  isLatest
                                    ? 'bg-primary-500 border-primary-500 text-white'
                                    : 'bg-white border-primary-300 text-primary-500',
                                )}
                              >
                                <MapPin className="w-2.5 h-2.5" />
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-gray-700 truncate">
                                    {loc.location}
                                  </span>
                                  <span className="text-xs text-gray-400 flex-shrink-0">
                                    {formatDate(loc.reported_at)}
                                  </span>
                                </div>
                                {loc.remark && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {loc.remark}
                                  </p>
                                )}
                                {renderLocationAlerts(loc)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openReportModal(order.id);
                    }}
                    disabled={!canReportNow || isReporting}
                  >
                    {isReporting ? '上报中...' : '上报位置'}
                  </Button>
                  <Button
                    size="sm"
                    variant={showMapOrderId === order.id ? 'primary' : 'outline'}
                    leftIcon={<Map className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMapView(order.id);
                    }}
                  >
                    {showMapOrderId === order.id ? '隐藏地图' : '查看地图'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    查看详情
                  </Button>
                </div>

                <AnimatePresence>
                  {showMapOrderId === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <TrackMap
                        orderId={order.id}
                        locations={allLocations}
                        route={route}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {reportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
            <div>
              <p className="font-semibold">位置上报成功</p>
              <p className="text-xs text-green-100">运输轨迹已实时更新</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary-600" />
            实时运输轨迹
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            实时追踪运输中的宠物，查看位置更新和运输进度
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={cn('w-4 h-4', isRefreshing ? 'animate-spin' : '')} />}
            onClick={refresh}
          >
            刷新
          </Button>
          <Badge variant="info" className="text-sm">
            运输中 {inTransitOrders.length} 单
          </Badge>
        </div>
      </div>

      {inTransitOrders.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Navigation className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-2">暂无运输中的订单</p>
            <p className="text-sm text-gray-400">所有订单已完成或尚未开始运输</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {inTransitOrders.map((order, index) => renderOrderCard(order, index))}
        </div>
      )}

      <Modal
        isOpen={reportModalOpen}
        onClose={closeReportModal}
        title="上报位置"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeReportModal}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleReportLocation}
              disabled={!location.trim() || !!duplicateError || isReporting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {isReporting ? '上报中...' : '确认上报'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {reportError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {reportError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              常用位置
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() => appendQuickLocation(loc.label)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border',
                      location.includes(loc.label)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:bg-primary-50',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {loc.label}
                  </button>
                );
              })}
            </div>
            <Input
              label="当前位置"
              placeholder="请输入当前所在位置，如：京津高速服务区"
              leftIcon={<MapPin className="w-4 h-4" />}
              value={location}
              onChange={(e) => {
                setDuplicateError('');
                setLocation(e.target.value);
              }}
              autoFocus
              error={duplicateError}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              宠物状态
            </label>
            <div className="flex flex-wrap gap-2">
              {PET_STATUS_OPTIONS.map((status) => {
                const Icon = status.icon;
                const isSelected = selectedPetStatus === status.label;
                return (
                  <button
                    key={status.label}
                    type="button"
                    onClick={() =>
                      setSelectedPetStatus(
                        selectedPetStatus === status.label ? null : status.label,
                      )
                    }
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all border',
                      isSelected
                        ? `${status.bg} ${status.color} border-current font-medium shadow-sm`
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="备注说明（选填）"
            placeholder="请输入备注信息，如：路面顺畅，预计准时到达"
            value={locationRemark}
            onChange={(e) => setLocationRemark(e.target.value)}
          />

          <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary-800">温馨提示</p>
                <p className="text-xs text-primary-600 mt-0.5">
                  请如实上报当前位置，以便客户和调度人员实时了解运输进度。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
