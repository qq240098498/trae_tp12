import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAppStore } from '@/store';
import type { Route } from '@/types';

export default function RoutesIndex() {
  const navigate = useNavigate();
  const routes = useAppStore((state) => state.routes);
  const updateRoute = useAppStore((state) => state.updateRoute);
  const deleteRoute = useAppStore((state) => state.deleteRoute);

  const handleToggleStatus = (record: Route) => {
    updateRoute(record.id, { is_active: !record.is_active });
  };

  const handleDelete = (record: Route) => {
    if (window.confirm(`确定删除路线 ${record.origin} - ${record.destination} 吗？`)) {
      deleteRoute(record.id);
    }
  };

  const columns = [
    { key: 'origin', title: '起点', dataIndex: 'origin' as const },
    { key: 'destination', title: '终点', dataIndex: 'destination' as const },
    {
      key: 'distance_km',
      title: '距离(km)',
      dataIndex: 'distance_km' as const,
      align: 'right' as const,
    },
    {
      key: 'duration_hours',
      title: '预计时长(h)',
      dataIndex: 'duration_hours' as const,
      align: 'right' as const,
    },
    {
      key: 'base_price',
      title: '基础价格(元)',
      dataIndex: 'base_price' as const,
      align: 'right' as const,
      render: (record: Route) => `¥${record.base_price.toFixed(2)}`,
    },
    {
      key: 'is_active',
      title: '状态',
      align: 'center' as const,
      render: (record: Route) => (
        <Badge variant={record.is_active ? 'success' : 'default'}>
          {record.is_active ? '启用' : '停用'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: 200,
      render: (record: Route) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit2 className="w-4 h-4" />}
            onClick={() => navigate(`/routes/new?id=${record.id}`)}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Power className="w-4 h-4" />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.is_active ? '停用' : '启用'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record)}
            className="text-danger-500 hover:text-danger-600"
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">运输路线管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理宠物运输的路线信息</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/routes/new')}
        >
          新增路线
        </Button>
      </motion.div>
      <Card>
        <Table<Route>
          columns={columns}
          data={routes}
          rowKey="id"
          emptyText="暂无路线数据"
        />
      </Card>
    </div>
  );
}
