import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { formatDate, formatPrice, getStatusText, getStatusColor, getCageLabel, getLuxuryLabel } from '@/utils';
import type { Order, OrderStatus } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

const statusTabs: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'accepted', label: '已接单' },
  { key: 'picked_up', label: '已接宠' },
  { key: 'in_transit', label: '运输中' },
  { key: 'arrived', label: '已到达' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
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

export default function OrdersIndex() {
  const navigate = useNavigate();
  const { orders, pets, routes, vehicles } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeStatus !== 'all' && order.status !== activeStatus) return false;

      if (searchText.trim()) {
        const keyword = searchText.trim().toLowerCase();
        const pet = pets.find((p) => p.id === order.pet_id);
        const petName = pet?.name?.toLowerCase() || '';
        const orderNo = order.order_no.toLowerCase();
        if (!orderNo.includes(keyword) && !petName.includes(keyword)) return false;
      }

      return true;
    });
  }, [orders, pets, activeStatus, searchText]);

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name || '-';
  const getRouteText = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? `${route.origin} → ${route.destination}` : '-';
  };
  const getVehicleText = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.plate_number} (${vehicle.vehicle_type})` : '-';
  };

  const columns = [
    {
      key: 'order_no',
      title: '订单号',
      dataIndex: 'order_no' as keyof Order,
      render: (record: Order) => (
        <span className="font-mono text-xs text-gray-600">{record.order_no}</span>
      ),
    },
    {
      key: 'pet_name',
      title: '宠物名',
      render: (record: Order) => <span className="font-medium">{getPetName(record.pet_id)}</span>,
    },
    {
      key: 'route',
      title: '运输路线',
      render: (record: Order) => (
        <span className="text-gray-600">{getRouteText(record.route_id)}</span>
      ),
    },
    {
      key: 'vehicle',
      title: '车辆',
      render: (record: Order) => (
        <span className="text-gray-600">{getVehicleText(record.vehicle_id)}</span>
      ),
    },
    {
      key: 'cage_type',
      title: '笼子',
      render: (record: Order) => (
        <span className="text-gray-600 text-xs">{getCageLabel(record.cage_type)}</span>
      ),
    },
    {
      key: 'luxury_level',
      title: '等级',
      render: (record: Order) => (
        <span className="text-gray-600 text-xs">{getLuxuryLabel(record.luxury_level)}</span>
      ),
    },
    {
      key: 'total_price',
      title: '总价',
      render: (record: Order) => (
        <span className="font-semibold text-primary-600">{formatPrice(record.total_price)}</span>
      ),
      align: 'right' as const,
    },
    {
      key: 'status',
      title: '状态',
      render: (record: Order) => (
        <Badge variant={getBadgeVariant(record.status)}>{getStatusText(record.status)}</Badge>
      ),
    },
    {
      key: 'created_at',
      title: '下单时间',
      render: (record: Order) => (
        <span className="text-gray-500 text-xs">{formatDate(record.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right' as const,
      render: (record: Order) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/orders/${record.id}`)}
          >
            详情
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="订单中心"
        icon={<FileText className="w-5 h-5" />}
        extra={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/orders/new')}
          >
            去下单
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="搜索订单号或宠物名"
                leftIcon={<Search className="w-4 h-4" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const isActive = activeStatus === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveStatus(tab.key)}
                  className={
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all ' +
                    (isActive
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                  }
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <Table<Order>
          columns={columns}
          data={filteredOrders}
          rowKey="id"
          emptyText="暂无订单数据"
        />
      </Card>
    </div>
  );
}
