import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  User,
  Phone,
  Shield,
  PawPrint,
  DollarSign,
  Upload,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils';
import type { ClaimReason, ClaimStatus } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

interface ClaimForm {
  policy_id: string;
  reason: string;
  title: string;
  description: string;
  claimed_amount: string;
  incident_date: string;
  incident_location: string;
  reporter_name: string;
  reporter_phone: string;
}

const initialForm: ClaimForm = {
  policy_id: '',
  reason: '',
  title: '',
  description: '',
  claimed_amount: '',
  incident_date: '',
  incident_location: '',
  reporter_name: '',
  reporter_phone: '',
};

const reasonOptions = [
  { label: '意外伤害', value: 'injury' },
  { label: '突发疾病', value: 'illness' },
  { label: '死亡理赔', value: 'death' },
  { label: '丢失走失', value: 'lost' },
  { label: '笼具损坏', value: 'damage' },
  { label: '其他原因', value: 'other' },
];

export default function ClaimNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { policyId?: string } | null;
  const {
    insurancePolicies,
    insuranceProducts,
    pets,
    customers,
    addInsuranceClaim,
    addInsuranceClaimProcessingLog,
  } = useAppStore();

  const [form, setForm] = useState<ClaimForm>({
    ...initialForm,
    policy_id: state?.policyId || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClaimForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const activePolicies = useMemo(
    () => insurancePolicies.filter((p) => p.status === 'active' || p.status === 'pending'),
    [insurancePolicies],
  );

  const policyOptions = activePolicies.map((p) => {
    const pet = pets.find((pt) => pt.id === p.pet_id);
    return {
      label: `${p.policy_no} - ${pet?.name || '未知宠物'} (${formatPrice(p.coverage_amount)})`,
      value: p.id,
    };
  });

  const selectedPolicy = activePolicies.find((p) => p.id === form.policy_id);
  const selectedProduct = insuranceProducts.find((p) => p.id === selectedPolicy?.product_id);
  const relatedPet = pets.find((p) => p.id === selectedPolicy?.pet_id);
  const relatedCustomer = customers.find((c) => c.id === selectedPolicy?.customer_id);

  const handleChange = (field: keyof ClaimForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'policy_id' && relatedCustomer) {
      setForm((prev) => ({
        ...prev,
        reporter_name: relatedCustomer.name,
        reporter_phone: relatedCustomer.phone,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClaimForm, string>> = {};
    if (!form.policy_id) newErrors.policy_id = '请选择保单';
    if (!form.reason) newErrors.reason = '请选择理赔原因';
    if (!form.title.trim()) newErrors.title = '请输入理赔标题';
    if (!form.description.trim()) newErrors.description = '请输入详细描述';
    if (!form.claimed_amount || Number(form.claimed_amount) <= 0) newErrors.claimed_amount = '请输入有效理赔金额';
    if (selectedPolicy && Number(form.claimed_amount) > selectedPolicy.coverage_amount) {
      newErrors.claimed_amount = `理赔金额不能超过保障额度${formatPrice(selectedPolicy.coverage_amount)}`;
    }
    if (!form.incident_date) newErrors.incident_date = '请选择事件发生时间';
    if (!form.incident_location.trim()) newErrors.incident_location = '请输入事件发生地点';
    if (!form.reporter_name.trim()) newErrors.reporter_name = '请输入报案人姓名';
    if (!form.reporter_phone.trim()) newErrors.reporter_phone = '请输入报案人电话';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedPolicy || !relatedCustomer) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const claimData = {
      policy_id: form.policy_id,
      order_id: selectedPolicy.order_id,
      customer_id: relatedCustomer.id,
      pet_id: selectedPolicy.pet_id,
      reason: form.reason as ClaimReason,
      title: form.title.trim(),
      description: form.description.trim(),
      claimed_amount: Number(form.claimed_amount),
      approved_amount: null,
      status: 'submitted' as ClaimStatus,
      incident_date: form.incident_date,
      incident_location: form.incident_location.trim(),
      reporter_name: form.reporter_name.trim(),
      reporter_phone: form.reporter_phone.trim(),
      reviewer_name: '',
      reviewed_at: '',
      resolution: '',
      payment_date: '',
      evidence_urls: [],
    };

    addInsuranceClaim(claimData);

    setTimeout(() => {
      const lastClaim = useAppStore.getState().insuranceClaims[useAppStore.getState().insuranceClaims.length - 1];
      if (lastClaim) {
        addInsuranceClaimProcessingLog(lastClaim.id, {
          action: '提交成功',
          operator: form.reporter_name.trim(),
          remark: '理赔申请已成功提交，等待审核',
        });
      }
    }, 0);

    setSubmitting(false);
    navigate('/insurance');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-danger-500" />
            申请理赔
          </h1>
          <p className="text-sm text-gray-500 mt-1">提交理赔申请，我们将尽快为您处理</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="基本信息" icon={<FileText className="w-5 h-5" />}>
            <div className="space-y-5">
              <Select
                label="选择保单"
                placeholder="请选择要理赔的保单"
                value={form.policy_id}
                onChange={(e) => handleChange('policy_id', e.target.value)}
                options={policyOptions}
                error={errors.policy_id}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="理赔原因"
                  placeholder="请选择理赔原因"
                  value={form.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  options={reasonOptions}
                  error={errors.reason}
                />
                <Input
                  label="事件发生时间"
                  type="datetime-local"
                  value={form.incident_date}
                  onChange={(e) => handleChange('incident_date', e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  error={errors.incident_date}
                />
              </div>
              <Input
                label="事件发生地点"
                placeholder="请输入事件发生的具体地点"
                value={form.incident_location}
                onChange={(e) => handleChange('incident_location', e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.incident_location}
              />
              <Input
                label="理赔标题"
                placeholder="请简要描述理赔事项"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={errors.title}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  详细描述 <span className="text-gray-400 text-xs">(请详细描述事件经过、损失情况等)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="请详细描述理赔事件的经过、造成的损失等信息..."
                    rows={5}
                    className={`w-full px-4 pt-2.5 pb-2.5 pl-10 text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                      errors.description
                        ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                        : 'border-gray-200 focus:border-primary-400 focus:ring-primary-100'
                    }`}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1.5 text-xs text-danger-500">{errors.description}</p>
                )}
              </div>
              <Input
                label="申请理赔金额 (元)"
                type="number"
                placeholder="请输入申请理赔的金额"
                value={form.claimed_amount}
                onChange={(e) => handleChange('claimed_amount', e.target.value)}
                leftIcon={<DollarSign className="w-4 h-4" />}
                error={errors.claimed_amount}
              />
            </div>
          </Card>

          <Card title="报案人信息" icon={<User className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="报案人姓名"
                placeholder="请输入报案人姓名"
                value={form.reporter_name}
                onChange={(e) => handleChange('reporter_name', e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                error={errors.reporter_name}
              />
              <Input
                label="联系电话"
                placeholder="请输入联系电话"
                value={form.reporter_phone}
                onChange={(e) => handleChange('reporter_phone', e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.reporter_phone}
              />
            </div>
          </Card>

          <Card title="上传凭证" icon={<Upload className="w-5 h-5" />}>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium mb-1">点击或拖拽上传凭证</p>
              <p className="text-xs text-gray-400">
                支持图片格式：JPG、PNG，可上传医疗证明、照片、视频等相关凭证
              </p>
              <p className="text-xs text-amber-500 mt-2">
                * 当前为演示版本，实际上传功能需接入后端服务
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedPolicy && (
            <Card title="保单信息" icon={<Shield className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="success">保障中</Badge>
                  <span className="font-mono text-xs text-gray-500">{selectedPolicy.policy_no}</span>
                </div>
                {relatedPet && (
                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{relatedPet.name}</p>
                      <p className="text-xs text-gray-500">{relatedPet.species} · {relatedPet.breed}</p>
                    </div>
                  </div>
                )}
                {selectedProduct && (
                  <p className="text-sm text-gray-600">{selectedProduct.name}</p>
                )}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">宠物估价</span>
                    <span className="font-medium">{formatPrice(selectedPolicy.pet_value)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">保障额度</span>
                    <span className="font-medium text-primary-600">{formatPrice(selectedPolicy.coverage_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">已缴保费</span>
                    <span className="font-medium">{formatPrice(selectedPolicy.premium_amount)}</span>
                  </div>
                  {selectedProduct && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">免赔额</span>
                      <span className="font-medium">{formatPrice(selectedProduct.deductible)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          <Card title="理赔流程" icon={<Send className="w-5 h-5" />}>
            <div className="space-y-4">
              {[
                { step: 1, title: '提交申请', desc: '填写理赔信息并上传凭证', done: false },
                { step: 2, title: '材料审核', desc: '1-3个工作日内审核材料', done: false },
                { step: 3, title: '理赔调查', desc: '必要时核实事件详情', done: false },
                { step: 4, title: '赔付到账', desc: '审核通过后3-7天打款', done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm font-medium text-gray-500">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              leftIcon={<Send className="w-5 h-5" />}
              loading={submitting}
              onClick={handleSubmit}
            >
              提交理赔申请
            </Button>
            <p className="text-xs text-gray-400 text-center">
              提交即表示同意《保险理赔条款》
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
