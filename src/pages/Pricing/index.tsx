import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';
import type { PricingRule, VehicleType } from '@/types';

interface PricingForm {
  vehicle_type: string;
  pet_species: string;
  weight_min: string;
  weight_max: string;
  price_per_km: string;
  surcharge: string;
}

const initialForm: PricingForm = {
  vehicle_type: '',
  pet_species: '',
  weight_min: '',
  weight_max: '',
  price_per_km: '',
  surcharge: '',
};

const vehicleTypeOptions = [
  { label: '小型', value: '小型' },
  { label: '中型', value: '中型' },
  { label: '大型', value: '大型' },
  { label: '豪华', value: '豪华' },
];

const petSpeciesOptions = [
  { label: '狗', value: '狗' },
  { label: '猫', value: '猫' },
  { label: '其他', value: '其他' },
];

export default function PricingIndex() {
  const pricingRules = useAppStore((state) => state.pricingRules);
  const addPricingRule = useAppStore((state) => state.addPricingRule);
  const updatePricingRule = useAppStore((state) => state.updatePricingRule);
  const deletePricingRule = useAppStore((state) => state.deletePricingRule);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PricingForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PricingForm, string>>>({});

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (record: PricingRule) => {
    setEditingId(record.id);
    setForm({
      vehicle_type: record.vehicle_type,
      pet_species: record.pet_species,
      weight_min: String(record.weight_min),
      weight_max: String(record.weight_max),
      price_per_km: String(record.price_per_km),
      surcharge: String(record.surcharge),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (field: keyof PricingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PricingForm, string>> = {};

    if (!form.vehicle_type) newErrors.vehicle_type = '请选择车型';
    if (!form.pet_species) newErrors.pet_species = '请选择宠物种类';
    if (!form.weight_min || Number(form.weight_min) < 0) newErrors.weight_min = '请输入有效最小体重';
    if (!form.weight_max || Number(form.weight_max) <= 0) newErrors.weight_max = '请输入有效最大体重';
    if (Number(form.weight_min) >= Number(form.weight_max)) newErrors.weight_max = '最大体重大于最小体重';
    if (!form.price_per_km || Number(form.price_per_km) < 0) newErrors.price_per_km = '请输入有效每公里价格';
    if (!form.surcharge || Number(form.surcharge) < 0) newErrors.surcharge = '请输入有效附加费';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const ruleData = {
      vehicle_type: form.vehicle_type as VehicleType,
      pet_species: form.pet_species,
      weight_min: Number(form.weight_min),
      weight_max: Number(form.weight_max),
      price_per_km: Number(form.price_per_km),
      surcharge: Number(form.surcharge),
    };

    if (editingId) {
      updatePricingRule(editingId, ruleData);
    } else {
      addPricingRule(ruleData);
    }

    setModalOpen(false);
  };

  const handleDelete = (record: PricingRule) => {
    if (window.confirm(`确定删除该定价规则吗？`)) {
      deletePricingRule(record.id);
    }
  };

  const columns = [
    {
      key: 'vehicle_type',
      title: '车型',
      dataIndex: 'vehicle_type' as const,
      align: 'center' as const,
    },
    {
      key: 'pet_species',
      title: '宠物种类',
      dataIndex: 'pet_species' as const,
      align: 'center' as const,
    },
    {
      key: 'weight_range',
      title: '体重区间(kg)',
      align: 'center' as const,
      render: (record: PricingRule) => `${record.weight_min} - ${record.weight_max}`,
    },
    {
      key: 'price_per_km',
      title: '每公里价格(元)',
      dataIndex: 'price_per_km' as const,
      align: 'right' as const,
      render: (record: PricingRule) => `¥${record.price_per_km.toFixed(2)}`,
    },
    {
      key: 'surcharge',
      title: '附加费(元)',
      dataIndex: 'surcharge' as const,
      align: 'right' as const,
      render: (record: PricingRule) => `¥${record.surcharge.toFixed(2)}`,
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: 160,
      render: (record: PricingRule) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit2 className="w-4 h-4" />}
            onClick={() => openEditModal(record)}
          >
            编辑
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
          <h1 className="text-2xl font-bold text-gray-800">基础价格维护</h1>
          <p className="text-sm text-gray-500 mt-1">管理运输定价规则</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          新增定价规则
        </Button>
      </motion.div>

      <Card>
        <Table<PricingRule>
          columns={columns}
          data={pricingRules}
          rowKey="id"
          emptyText="暂无定价规则"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '编辑定价规则' : '新增定价规则'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>保存</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Select
              label="车型"
              placeholder="请选择车型"
              value={form.vehicle_type}
              onChange={(e) => handleChange('vehicle_type', e.target.value)}
              options={vehicleTypeOptions}
              error={errors.vehicle_type}
            />
            <Select
              label="宠物种类"
              placeholder="请选择宠物种类"
              value={form.pet_species}
              onChange={(e) => handleChange('pet_species', e.target.value)}
              options={petSpeciesOptions}
              error={errors.pet_species}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="最小体重(kg)"
              type="number"
              placeholder="请输入最小体重"
              value={form.weight_min}
              onChange={(e) => handleChange('weight_min', e.target.value)}
              error={errors.weight_min}
            />
            <Input
              label="最大体重(kg)"
              type="number"
              placeholder="请输入最大体重"
              value={form.weight_max}
              onChange={(e) => handleChange('weight_max', e.target.value)}
              error={errors.weight_max}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="每公里价格(元)"
              type="number"
              step="0.01"
              placeholder="请输入每公里价格"
              value={form.price_per_km}
              onChange={(e) => handleChange('price_per_km', e.target.value)}
              error={errors.price_per_km}
            />
            <Input
              label="附加费(元)"
              type="number"
              step="0.01"
              placeholder="请输入附加费"
              value={form.surcharge}
              onChange={(e) => handleChange('surcharge', e.target.value)}
              error={errors.surcharge}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
