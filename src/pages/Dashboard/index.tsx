import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  PawPrint,
  PlusCircle,
  Car,
  Eye,
  ArrowRight,
  Clock,
  Navigation,
  MapPin,
  Users,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Award,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useTrackStatistics } from '@/hooks';
import {
  getTrackStatisticsSummary,
  formatDate,
  getStatusText,
  getStatusColor,
  formatIntervalMinutes,
  getReportFrequencyStatus,
  getReportFrequencyStatusText,
  getReportFrequencyStatusColor,
} from '@/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const statCards = [
  {
    key: 'pending',
    title: '待处理订单',
    icon: Clock,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    key: 'in_transit',
    title: '运输中订单',
    icon: Truck,
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    key: 'completed_today',
    title: '今日完成',
    icon: CheckCircle,
    gradient: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'pets_total',
    title: '宠物总数',
    icon: PawPrint,
    gradient: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
];

const trackStatCards = [
  {
    key: 'todayReports',
    label: '今日上报',
    icon: Zap,
    gradient: 'from-indigo-400 to-purple-500',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    key: 'reportsLastHour',
    label: '近1小时上报',
    icon: TrendingUp,
    gradient: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    key: 'avgInterval',
    label: '平均上报间隔',
    icon: RefreshCw,
    gradient: 'from-teal-400 to-emerald-500',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    key: 'uniqueDrivers',
    label: '活跃司机',
    icon: Users,
    gradient: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, pets, routes, customers } = useAppStore();

  const {
    statistics,
    allOrderProgress,
    getOrdersNeedingAttention,
    getTopDrivers,
    getTopVehicles,
    getReportTrend,
    refresh,
    isRefreshing,
  } = useTrackStatistics({
    autoRefresh: true,
    refreshIntervalMs: 60000,
  });

  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'picked_up',
  ).length;
  const inTransitCount = orders.filter(
    (o) => o.status === 'in_transit' || o.status === 'arrived',
  ).length;
  const today = new Date().toDateString();
  const completedTodayCount = orders.filter(
    (o) =>
      o.status === 'completed' && new Date(o.updated_at).toDateString() === today,
  ).length;
  const petsCount = pets.length;

  const stats = {
    pending: pendingCount,
    in_transit: inTransitCount,
    completed_today: completedTodayCount,
    pets_total: petsCount,
  };

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getPetById = (petId: string) => pets.find((p) => p.id === petId);
  const getRouteById = (routeId: string) => routes.find((r) => r.id === routeId);
  const getCustomerById = (customerId: string) =>
    customers.find((c) => c.id === customerId);

  const ordersNeedingAttention = getOrdersNeedingAttention();
  const topDrivers = getTopDrivers(5);
  const topVehicles = getTopVehicles(5);
  const reportTrend = getReportTrend(12);
  const trackStatsSummary = getTrackStatisticsSummary(statistics);

  const trackStats = {
    todayReports: statistics.todayReports,
    reportsLastHour: statistics.reportsLastHour,
    avgInterval: `${statistics.avgReportIntervalMinutes}分钟`,
    uniqueDrivers: statistics.uniqueDrivers,
  };

  const maxTrendValue = Math.max(...reportTrend.map((t) => t.count), 1);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              variants={itemVariants}
              className={cn(
                'relative rounded-2xl p-5 overflow-hidden group cursor-pointer',
                'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                card.bg,
              )}
            >
              <div
                className={cn(
                  'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -mr-10 -mt-10 bg-gradient-to-br',
                  card.gradient,
                )}
              />
              <div className="relative z-10">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                    card.iconBg,
                  )}
                >
                  <Icon className={cn('w-6 h-6', card.iconColor)} />
                </div>
                <div className="text-sm text-gray-500 mb-1">{card.title}</div>
                <motion.div
                  key={stats[card.key as keyof typeof stats]}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-gray-800"
                >
                  {stats[card.key as keyof typeof stats]}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card
          title="实时轨迹统计"
          icon={<BarChart3 className="w-5 h-5" />}
          extra={
            <Button
              variant="ghost"
              size="sm"
              leftIcon={
                <RefreshCw
                  className={cn('w-4 h-4', isRefreshing ? 'animate-spin' : '')}
                />
              }
              onClick={refresh}
            >
              刷新
            </Button>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trackStatCards.map((card) => {
              const Icon = card.icon;
              const value = trackStats[card.key as keyof typeof trackStats];
              return (
                <div
                  key={card.key}
                  className={cn(
                    'relative rounded-xl p-4 overflow-hidden',
                    card.bg,
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        card.iconBg,
                      )}
                    >
                      <Icon className={cn('w-5 h-5', card.iconColor)} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-4">上报趋势（近12小时）</h4>
            <div className="flex items-end gap-1 h-24">
              {reportTrend.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(item.count / maxTrendValue) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={cn(
                      'w-full min-w-[20px] max-w-[40px] rounded-t-md bg-gradient-to-t from-indigo-400 to-indigo-600',
                    )}
                    style={{ minHeight: item.count > 0 ? '8px' : '2px' }}
                  />
                  <div className="text-[10px] text-gray-400 mt-1">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {ordersNeedingAttention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Card
            title="需要关注的运输"
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            className="border-amber-200"
          >
          <div className="space-y-3">
            {ordersNeedingAttention.slice(0, 3).map((progress, idx) => {
              const timeSinceLastReport = progress.lastReportAt
                ? (Date.now() - new Date(progress.lastReportAt).getTime()) / (1000 * 60)
                : Infinity;
              const frequencyStatus = getReportFrequencyStatus(
                progress.avgIntervalMinutes,
                timeSinceLastReport,
              );
              return (
                <motion.div
                  key={progress.orderId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {progress.petName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {progress.orderNo}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        getReportFrequencyStatusColor(frequencyStatus),
                      )}
                    >
                      {getReportFrequencyStatusText(frequencyStatus)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      距上次上报: {formatIntervalMinutes(
                        progress.lastReportAt
                          ? (Date.now() -
                              new Date(progress.lastReportAt).getTime()) /
                            (1000 * 60)
                          : 0,
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate('/tracking')}
          >
            查看全部运输轨迹
          </Button>
        </Card>
      </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card
            title="最近订单"
            icon={<Package className="w-5 h-5" />}
            extra={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/orders')}
              >
                查看全部
              </Button>
            }
          >
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">暂无订单</div>
              ) : (
                recentOrders.map((order, idx) => {
                  const pet = getPetById(order.pet_id);
                  const route = getRouteById(order.route_id);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.45 + idx * 0.08,
                        duration: 0.3,
                      }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {order.order_no}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {pet?.name || '未知宠物'} ·{' '}
                            {route
                              ? `${route.origin} → ${route.destination}`
                              : '未知路线'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(getStatusColor(order.status), 'border')}
                        >
                          {getStatusText(order.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          详情
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <Card title="快捷入口" icon={<PlusCircle className="w-5 h-5" />}>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/orders/new')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center text-white">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">新建运输订单</div>
                    <div className="text-xs text-gray-500 mt-0.5">快速创建宠物运输订单</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/pets/new')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                    <PawPrint className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">添加宠物档案</div>
                    <div className="text-xs text-gray-500 mt-0.5">录入宠物信息建立档案</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dispatch')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">车辆调度</div>
                    <div className="text-xs text-gray-500 mt-0.5">分配车辆和司机进行运输</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/tracking')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">实时轨迹追踪</div>
                    <div className="text-xs text-gray-500 mt-0.5">查看所有运输的实时位置</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {topDrivers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Card
                title="司机排行"
                icon={<Award className="w-5 h-5 text-amber-500" />}
              >
                <div className="space-y-3">
                  {topDrivers.slice(0, 3).map((driver, idx) => (
                    <motion.div
                      key={driver.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + idx * 0.08, duration: 0.3 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                            idx === 0
                              ? 'bg-amber-100 text-amber-600'
                              : idx === 1
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-orange-100 text-orange-600',
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {driver.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.count} 次上报
                          </div>
                        </div>
                      </div>
                      <Users className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {topVehicles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <Card
                title="车辆排行"
                icon={<Car className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-3">
                  {topVehicles.slice(0, 3).map((vehicle, idx) => (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.08, duration: 0.3 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                            idx === 0
                              ? 'bg-blue-100 text-blue-600'
                              : idx === 1
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-cyan-100 text-cyan-600',
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {vehicle.plateNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.count} 次上报
                          </div>
                        </div>
                      </div>
                      <Car className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}