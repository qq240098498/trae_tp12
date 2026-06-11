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
} from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getStatusText, getStatusColor, formatDate } from '@/utils';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, pets, routes, customers } = useAppStore();

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'picked_up').length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit' || o.status === 'arrived').length;
  const today = new Date().toDateString();
  const completedTodayCount = orders.filter(
    (o) => o.status === 'completed' && new Date(o.updated_at).toDateString() === today,
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
  const getCustomerById = (customerId: string) => customers.find((c) => c.id === customerId);

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
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', card.iconBg)}>
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
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/orders')}>
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
                      transition={{ delay: 0.45 + idx * 0.08, duration: 0.3 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{order.order_no}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {pet?.name || '未知宠物'} · {route ? `${route.origin} → ${route.destination}` : '未知路线'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(getStatusColor(order.status), 'border')}>{getStatusText(order.status)}</Badge>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/orders/${order.id}`)}>
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
                  <div className="font-medium text-gray-800">快速下单</div>
                  <div className="text-sm text-gray-500">创建新的运输订单</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
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
                  <div className="font-medium text-gray-800">新增宠物</div>
                  <div className="text-sm text-gray-500">登记新的宠物档案</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/vehicles')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <Car className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800">车辆管理</div>
                  <div className="text-sm text-gray-500">查看和管理运输车辆</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
