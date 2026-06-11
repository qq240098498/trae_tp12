import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, AlertTriangle, Car, PawPrint, Cloud, TrafficCone, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  formatDate,
  getExceptionTypeText,
  getExceptionSeverityText,
  getExceptionStatusText,
  getExceptionSeverityBadgeVariant,
  getExceptionStatusBadgeVariant,
} from '@/utils';
import type { TransportException, ExceptionStatus, ExceptionType } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

const statusTabs: { key: ExceptionStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'reported', label: '已上报' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已解决' },
  { key: 'closed', label: '已关闭' },
];

const typeIcons: Record<ExceptionType, typeof AlertTriangle> = {
  vehicle: Car,
  pet: PawPrint,
  weather: Cloud,
  traffic: TrafficCone,
  other: HelpCircle,
};

const typeColors: Record<ExceptionType, string> = {
  vehicle: 'text-orange-500',
  pet: 'text-purple-500',
  weather: 'text-blue-500',
  traffic: 'text-yellow-500',
  other: 'text-gray-500',
};

export default function ExceptionsIndex() {
  const navigate = useNavigate();
  const { exceptions, orders, pets } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [activeStatus, setActiveStatus] = useState<ExceptionStatus | 'all'>('all');

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      if (activeStatus !== 'all' && exc.status !== activeStatus) return false;

      if (searchText.trim()) {
        const keyword = searchText.trim().toLowerCase();
        const excNo = exc.exception_no.toLowerCase();
        const title = exc.title.toLowerCase();
        const order = orders.find((o) => o.id === exc.order_id);
        const orderNo = order?.order_no.toLowerCase() || '';
        if (!excNo.includes(keyword) && !title.includes(keyword) && !orderNo.includes(keyword)) return false;
      }

      return true;
    });
  }, [exceptions, orders, activeStatus, searchText]);

  const getOrderNo = (orderId: string) => orders.find((o) => o.id === orderId)?.order_no || '-';
  const getPetName = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return '-';
    return pets.find((p) => p.id === order.pet_id)?.name || '-';
  };

  const summaryStats = useMemo(() => {
    const reported = exceptions.filter((e) => e.status === 'reported').length;
    const processing = exceptions.filter((e) => e.status === 'processing').length;
    const resolved = exceptions.filter((e) => e.status === 'resolved').length;
    const closed = exceptions.filter((e) => e.status === 'closed').length;
    const critical = exceptions.filter((e) => e.severity === 'critical' && e.status !== 'closed' && e.status !== 'resolved').length;
    return { reported, processing, resolved, closed, critical };
  }, [exceptions]);

  const columns = [
    {
      key: 'type',
      title: '类型',
      render: (record: TransportException) => {
        const Icon = typeIcons[record.type];
        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${typeColors[record.type]}`} />
            <span className="text-sm">{getExceptionTypeText(record.type)}</span>
          </div>
        );
      },
    },
    {
      key: 'exception_no',
      title: '异常编号',
      render: (record: TransportException) => (
        <span className="font-mono text-xs text-gray-600">{record.exception_no}</span>
      ),
    },
    {
      key: 'title',
      title: '异常描述',
      render: (record: TransportException) => (
        <span className="font-medium text-gray-800 max-w-[200px] truncate block">{record.title}</span>
      ),
    },
    {
      key: 'order_no',
      title: '关联订单',
      render: (record: TransportException) => (
        <span className="font-mono text-xs text-gray-500">{getOrderNo(record.order_id)}</span>
      ),
    },
    {
      key: 'pet_name',
      title: '宠物',
      render: (record: TransportException) => (
        <span className="text-gray-600">{getPetName(record.order_id)}</span>
      ),
    },
    {
      key: 'severity',
      title: '严重程度',
      render: (record: TransportException) => (
        <Badge variant={getExceptionSeverityBadgeVariant(record.severity)}>
          {getExceptionSeverityText(record.severity)}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (record: TransportException) => (
        <Badge variant={getExceptionStatusBadgeVariant(record.status)}>
          {getExceptionStatusText(record.status)}
        </Badge>
      ),
    },
    {
      key: 'reported_at',
      title: '上报时间',
      render: (record: TransportException) => (
        <span className="text-gray-500 text-xs">{formatDate(record.reported_at)}</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right' as const,
      render: (record: TransportException) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/exceptions/${record.id}`)}
          >
            处理
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-card border border-gray-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.reported}</p>
              <p className="text-xs text-gray-500">待处理</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-card border border-gray-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.processing}</p>
              <p className="text-xs text-gray-500">处理中</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card border border-gray-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.resolved}</p>
              <p className="text-xs text-gray-500">已解决</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-card border border-gray-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.closed}</p>
              <p className="text-xs text-gray-500">已关闭</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card border border-danger-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center animate-pulse-soft">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-danger-600">{summaryStats.critical}</p>
              <p className="text-xs text-danger-500">紧急未处理</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Card
        title="异常情况管理"
        icon={<AlertTriangle className="w-5 h-5" />}
        extra={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/exceptions/new')}
          >
            登记异常
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="搜索异常编号、标题或关联订单"
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
        <Table<TransportException>
          columns={columns}
          data={filteredExceptions}
          rowKey="id"
          emptyText="暂无异常记录"
        />
      </Card>
    </div>
  );
}
