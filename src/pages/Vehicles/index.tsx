import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Car, Phone, User, Settings, CheckCircle, Clock, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';
import type { Vehicle, VehicleStatus } from '@/types';

const statusConfig: Record<VehicleStatus, { variant: 'success' | 'warning' | 'default'; icon: React.ReactNode }> = {
  空闲: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  使用中: { variant: 'warning', icon: <Clock className="w-3 h-3" /> },
  维护中: { variant: 'default', icon: <Wrench className="w-3 h-3" /> },
};

const statusOptions = [
  { label: '空闲', value: '空闲' },
  { label: '使用中', value: '使用中' },
  { label: '维护中', value: '维护中' },
];

export default function VehiclesIndex() {
  const navigate = useNavigate();
  const vehicles = useAppStore((state) => state.vehicles);
  const updateVehicle = useAppStore((state) => state.updateVehicle);
  const deleteVehicle = useAppStore((state) => state.deleteVehicle);

  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: VehicleStatus) => {
    updateVehicle(id, { status });
    setEditingStatusId(null);
  };

  const handleDelete = (record: Vehicle) => {
    if (window.confirm(`确定删除车辆 ${record.plate_number} 吗？`)) {
      deleteVehicle(record.id);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">车辆管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理运输车辆信息</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/vehicles/new')}
        >
          新增车辆
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="h-full">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-500 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {vehicle.plate_number}
                      </h3>
                      <p className="text-xs text-gray-500">{vehicle.vehicle_type}</p>
                    </div>
                  </div>
                  <Badge
                    variant={statusConfig[vehicle.status].variant}
                    icon={statusConfig[vehicle.status].icon}
                  >
                    {vehicle.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>容量：{vehicle.capacity} 只</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>司机：{vehicle.driver_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{vehicle.driver_phone}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit2 className="w-4 h-4" />}
                    onClick={() => navigate(`/vehicles/new?id=${vehicle.id}`)}
                    className="flex-1"
                  >
                    编辑
                  </Button>
                  {editingStatusId === vehicle.id ? (
                    <Select
                      value={vehicle.status}
                      onChange={(e) => handleStatusChange(vehicle.id, e.target.value as VehicleStatus)}
                      options={statusOptions}
                      wrapperClassName="flex-1"
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingStatusId(vehicle.id)}
                      className="flex-1"
                    >
                      修改状态
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDelete(vehicle)}
                    className="text-danger-500 hover:text-danger-600"
                  >
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {vehicles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16 text-gray-400"
          >
            暂无车辆数据
          </motion.div>
        )}
      </div>
    </div>
  );
}
