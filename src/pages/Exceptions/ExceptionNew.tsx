import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ExceptionType, ExceptionSeverity } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

const typeOptions = [
  { label: '车辆故障', value: 'vehicle' },
  { label: '宠物异常', value: 'pet' },
  { label: '天气影响', value: 'weather' },
  { label: '交通问题', value: 'traffic' },
  { label: '其他', value: 'other' },
];

const severityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'critical' },
];

export default function ExceptionNew() {
  const navigate = useNavigate();
  const { orders, exceptions, addException } = useAppStore();

  const inTransitOrders = orders.filter(
    (o) => o.status === 'in_transit' || o.status === 'picked_up'
  );

  const orderOptions = inTransitOrders.map((o) => ({
    label: `${o.order_no}`,
    value: o.id,
  }));

  const allOrders = orders.map((o) => ({
    label: `${o.order_no} (${o.status})`,
    value: o.id,
  }));

  const displayOrderOptions = orderOptions.length > 0 ? orderOptions : allOrders;

  const [form, setForm] = useState({
    order_id: '',
    type: '' as ExceptionType | '',
    severity: '' as ExceptionSeverity | '',
    title: '',
    description: '',
    location: '',
    reporter_name: '',
    handler_name: '',
    status: 'reported' as const,
    handled_at: '',
    resolution: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.order_id) newErrors.order_id = '请选择关联订单';
    if (!form.type) newErrors.type = '请选择异常类型';
    if (!form.severity) newErrors.severity = '请选择严重程度';
    if (!form.title.trim()) newErrors.title = '请输入异常标题';
    if (!form.description.trim()) newErrors.description = '请输入异常描述';
    if (!form.reporter_name.trim()) newErrors.reporter_name = '请输入上报人姓名';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addException({
      order_id: form.order_id,
      type: form.type as ExceptionType,
      severity: form.severity as ExceptionSeverity,
      status: 'reported',
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      reporter_name: form.reporter_name.trim(),
      handler_name: '',
      handled_at: '',
      resolution: '',
    });

    navigate('/exceptions');
  };

  return (
    <div className="space-y-6">
      <Card
        title="登记异常情况"
        icon={<ArrowLeft className="w-5 h-5" />}
        extra={
          <Button variant="ghost" onClick={() => navigate('/exceptions')}>
            返回列表
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="关联订单"
              options={displayOrderOptions}
              placeholder="请选择关联订单"
              value={form.order_id}
              onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              error={errors.order_id}
            />
            <Select
              label="异常类型"
              options={typeOptions}
              placeholder="请选择异常类型"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ExceptionType })}
              error={errors.type}
            />
            <Select
              label="严重程度"
              options={severityOptions}
              placeholder="请选择严重程度"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value as ExceptionSeverity })}
              error={errors.severity}
            />
            <Input
              label="上报人"
              placeholder="请输入上报人姓名"
              value={form.reporter_name}
              onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
              error={errors.reporter_name}
            />
          </div>

          <Input
            label="异常标题"
            placeholder="请简要描述异常情况"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              详细描述
            </label>
            <textarea
              className="w-full min-h-[120px] px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 hover:border-gray-300 resize-y"
              placeholder="请详细描述异常情况，包括发生时间、具体表现等"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-danger-500">{errors.description}</p>
            )}
          </div>

          <Input
            label="发生地点"
            placeholder="请输入异常发生的位置"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/exceptions')}>
          取消
        </Button>
        <Button
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
        >
          提交登记
        </Button>
      </div>
    </div>
  );
}
