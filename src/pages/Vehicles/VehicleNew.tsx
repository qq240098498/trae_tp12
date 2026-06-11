import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';
import type { VehicleType, VehicleStatus } from '@/types';

interface VehicleForm {
  plate_number: string;
  vehicle_type: string;
  capacity: string;
  status: string;
  driver_name: string;
  driver_phone: string;
}

const initialForm: VehicleForm = {
  plate_number: '',
  vehicle_type: '',
  capacity: '',
  status: '空闲',
  driver_name: '',
  driver_phone: '',
};

const vehicleTypeOptions = [
  { label: '小型', value: '小型' },
  { label: '中型', value: '中型' },
  { label: '大型', value: '大型' },
  { label: '豪华', value: '豪华' },
];

const statusOptions = [
  { label: '空闲', value: '空闲' },
  { label: '使用中', value: '使用中' },
  { label: '维护中', value: '维护中' },
];

export default function VehicleNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const vehicles = useAppStore((state) => state.vehicles);
  const addVehicle = useAppStore((state) => state.addVehicle);
  const updateVehicle = useAppStore((state) => state.updateVehicle);

  const [form, setForm] = useState<VehicleForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleForm, string>>>({});

  useEffect(() => {
    if (editId) {
      const vehicle = vehicles.find((v) => v.id === editId);
      if (vehicle) {
        setForm({
          plate_number: vehicle.plate_number,
          vehicle_type: vehicle.vehicle_type,
          capacity: String(vehicle.capacity),
          status: vehicle.status,
          driver_name: vehicle.driver_name,
          driver_phone: vehicle.driver_phone,
        });
      }
    }
  }, [editId, vehicles]);

  const handleChange = (field: keyof VehicleForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VehicleForm, string>> = {};

    if (!form.plate_number.trim()) newErrors.plate_number = '请输入车牌号';
    if (!form.vehicle_type) newErrors.vehicle_type = '请选择车型';
    if (!form.capacity || Number(form.capacity) <= 0) newErrors.capacity = '请输入有效容量';
    if (!form.status) newErrors.status = '请选择状态';
    if (!form.driver_name.trim()) newErrors.driver_name = '请输入司机姓名';
    if (!form.driver_phone.trim()) newErrors.driver_phone = '请输入司机电话';
    if (form.driver_phone && !/^1[3-9]\d{9}$/.test(form.driver_phone)) {
      newErrors.driver_phone = '请输入有效的手机号';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const vehicleData = {
      plate_number: form.plate_number.trim(),
      vehicle_type: form.vehicle_type as VehicleType,
      capacity: Number(form.capacity),
      status: form.status as VehicleStatus,
      driver_name: form.driver_name.trim(),
      driver_phone: form.driver_phone.trim(),
    };

    if (editId) {
      updateVehicle(editId, vehicleData);
    } else {
      addVehicle(vehicleData);
    }

    navigate('/vehicles');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/vehicles')}
        >
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {editId ? '编辑车辆' : '新增车辆'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {editId ? '修改车辆信息' : '创建新的车辆记录'}
          </p>
        </div>
      </motion.div>

      <Card>
        <div className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="车牌号"
              placeholder="请输入车牌号"
              value={form.plate_number}
              onChange={(e) => handleChange('plate_number', e.target.value)}
              error={errors.plate_number}
            />
            <Select
              label="车型"
              placeholder="请选择车型"
              value={form.vehicle_type}
              onChange={(e) => handleChange('vehicle_type', e.target.value)}
              options={vehicleTypeOptions}
              error={errors.vehicle_type}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="容量(只)"
              type="number"
              placeholder="请输入容量"
              value={form.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              error={errors.capacity}
            />
            <Select
              label="状态"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={statusOptions}
              error={errors.status}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="司机姓名"
              placeholder="请输入司机姓名"
              value={form.driver_name}
              onChange={(e) => handleChange('driver_name', e.target.value)}
              error={errors.driver_name}
            />
            <Input
              label="司机电话"
              placeholder="请输入司机电话"
              value={form.driver_phone}
              onChange={(e) => handleChange('driver_phone', e.target.value)}
              error={errors.driver_phone}
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSubmit}
            >
              保存
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/vehicles')}
            >
              取消
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
