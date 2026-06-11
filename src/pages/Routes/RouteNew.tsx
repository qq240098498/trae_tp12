import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';

interface RouteForm {
  origin: string;
  destination: string;
  distance_km: string;
  duration_hours: string;
  base_price: string;
  is_active: string;
}

const initialForm: RouteForm = {
  origin: '',
  destination: '',
  distance_km: '',
  duration_hours: '',
  base_price: '',
  is_active: 'true',
};

export default function RouteNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const routes = useAppStore((state) => state.routes);
  const addRoute = useAppStore((state) => state.addRoute);
  const updateRoute = useAppStore((state) => state.updateRoute);

  const [form, setForm] = useState<RouteForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof RouteForm, string>>>({});

  useEffect(() => {
    if (editId) {
      const route = routes.find((r) => r.id === editId);
      if (route) {
        setForm({
          origin: route.origin,
          destination: route.destination,
          distance_km: String(route.distance_km),
          duration_hours: String(route.duration_hours),
          base_price: String(route.base_price),
          is_active: String(route.is_active),
        });
      }
    }
  }, [editId, routes]);

  const handleChange = (field: keyof RouteForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RouteForm, string>> = {};

    if (!form.origin.trim()) newErrors.origin = '请输入起点城市';
    if (!form.destination.trim()) newErrors.destination = '请输入终点城市';
    if (!form.distance_km || Number(form.distance_km) <= 0) newErrors.distance_km = '请输入有效的距离';
    if (!form.duration_hours || Number(form.duration_hours) <= 0) newErrors.duration_hours = '请输入有效的时长';
    if (!form.base_price || Number(form.base_price) < 0) newErrors.base_price = '请输入有效的价格';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const routeData = {
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      distance_km: Number(form.distance_km),
      duration_hours: Number(form.duration_hours),
      base_price: Number(form.base_price),
      is_active: form.is_active === 'true',
    };

    if (editId) {
      updateRoute(editId, routeData);
    } else {
      addRoute(routeData);
    }

    navigate('/routes');
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
          onClick={() => navigate('/routes')}
        >
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {editId ? '编辑路线' : '新增路线'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {editId ? '修改运输路线信息' : '创建新的运输路线'}
          </p>
        </div>
      </motion.div>

      <Card>
        <div className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="起点城市"
              placeholder="请输入起点城市"
              value={form.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              error={errors.origin}
            />
            <Input
              label="终点城市"
              placeholder="请输入终点城市"
              value={form.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              error={errors.destination}
            />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Input
              label="距离(km)"
              type="number"
              placeholder="请输入距离"
              value={form.distance_km}
              onChange={(e) => handleChange('distance_km', e.target.value)}
              error={errors.distance_km}
            />
            <Input
              label="预计时长(小时)"
              type="number"
              step="0.1"
              placeholder="请输入时长"
              value={form.duration_hours}
              onChange={(e) => handleChange('duration_hours', e.target.value)}
              error={errors.duration_hours}
            />
            <Input
              label="基础价格(元)"
              type="number"
              step="0.01"
              placeholder="请输入价格"
              value={form.base_price}
              onChange={(e) => handleChange('base_price', e.target.value)}
              error={errors.base_price}
            />
          </div>
          <Select
            label="是否启用"
            value={form.is_active}
            onChange={(e) => handleChange('is_active', e.target.value)}
            options={[
              { label: '启用', value: 'true' },
              { label: '停用', value: 'false' },
            ]}
          />
          <div className="flex items-center gap-3 pt-2">
            <Button
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSubmit}
            >
              保存
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/routes')}
            >
              取消
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
