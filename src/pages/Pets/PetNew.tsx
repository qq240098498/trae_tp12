import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PawPrint,
  User,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types';

interface PetBasicForm {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  weight_kg: string;
  photo_url: string;
}

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 1, title: '基础信息', icon: PawPrint },
  { id: 2, title: '主人信息', icon: User },
  { id: 3, title: '确认提交', icon: CheckCircle2 },
];

const speciesOptions = [
  { label: '狗', value: '狗' },
  { label: '猫', value: '猫' },
  { label: '其他', value: '其他' },
];

const genderOptions = [
  { label: '公', value: '公' },
  { label: '母', value: '母' },
];

export default function PetNew() {
  const navigate = useNavigate();
  const { addPet, addCustomer, customers } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [petForm, setPetForm] = useState<PetBasicForm>({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    weight_kg: '',
    photo_url: '',
  });
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!petForm.name.trim()) newErrors.name = '请输入宠物名称';
    if (!petForm.species) newErrors.species = '请选择宠物种类';
    if (!petForm.breed.trim()) newErrors.breed = '请输入宠物品种';
    if (!petForm.age || Number(petForm.age) < 0) newErrors.age = '请输入有效年龄';
    if (!petForm.gender) newErrors.gender = '请选择性别';
    if (!petForm.weight_kg || Number(petForm.weight_kg) <= 0) newErrors.weight_kg = '请输入有效体重';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!customerForm.name.trim()) newErrors.customer_name = '请输入主人姓名';
    if (!customerForm.phone.trim()) {
      newErrors.customer_phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(customerForm.phone.trim())) {
      newErrors.customer_phone = '请输入正确的手机号码';
    }
    if (!customerForm.address.trim()) newErrors.customer_address = '请输入联系地址';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const existingCustomer = customers.find(
        (c) => c.name === customerForm.name.trim() && c.phone === customerForm.phone.trim(),
      );

      let customer: Customer;
      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        customer = addCustomer({
          name: customerForm.name.trim(),
          phone: customerForm.phone.trim(),
          address: customerForm.address.trim(),
        });
      }

      addPet({
        name: petForm.name.trim(),
        species: petForm.species,
        breed: petForm.breed.trim(),
        age: Number(petForm.age),
        gender: petForm.gender,
        weight_kg: Number(petForm.weight_kg),
        photo_url: petForm.photo_url.trim(),
        customer_id: customer.id,
      });

      setSubmitting(false);
      navigate('/pets');
    }, 500);
  };

  const updatePetField = (field: keyof PetBasicForm, value: string) => {
    setPetForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateCustomerField = (field: keyof CustomerForm, value: string) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
    const errorKey = `customer_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : isActive
                    ? 'bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-gray-50 border-gray-200 text-gray-400',
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </motion.div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  isActive || isCompleted ? 'text-gray-700' : 'text-gray-400',
                )}
              >
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 sm:w-24 h-0.5 mx-2 sm:mx-4 mb-6',
                  isCompleted ? 'bg-primary-500' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/pets')}>
          返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">新增宠物登记</h1>
          <p className="text-sm text-gray-500 mt-1">完善以下信息完成宠物档案登记</p>
        </div>
      </div>

      <Card>
        {renderStepIndicator()}

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="宠物名称 *"
                  value={petForm.name}
                  onChange={(e) => updatePetField('name', e.target.value)}
                  placeholder="请输入宠物名称"
                  error={errors.name}
                />
                <Select
                  label="宠物种类 *"
                  placeholder="请选择种类"
                  value={petForm.species}
                  onChange={(e) => updatePetField('species', e.target.value)}
                  options={speciesOptions}
                  error={errors.species}
                />
                <Input
                  label="品种 *"
                  value={petForm.breed}
                  onChange={(e) => updatePetField('breed', e.target.value)}
                  placeholder="如：金毛、英短等"
                  error={errors.breed}
                />
                <Select
                  label="性别 *"
                  placeholder="请选择性别"
                  value={petForm.gender}
                  onChange={(e) => updatePetField('gender', e.target.value)}
                  options={genderOptions}
                  error={errors.gender}
                />
                <Input
                  label="年龄（岁）*"
                  type="number"
                  value={petForm.age}
                  onChange={(e) => updatePetField('age', e.target.value)}
                  placeholder="请输入年龄"
                  error={errors.age}
                  min={0}
                  step={0.1}
                />
                <Input
                  label="体重（kg）*"
                  type="number"
                  value={petForm.weight_kg}
                  onChange={(e) => updatePetField('weight_kg', e.target.value)}
                  placeholder="请输入体重"
                  error={errors.weight_kg}
                  min={0}
                  step={0.1}
                />
              </div>
              <div>
                <Input
                  label="照片 URL"
                  value={petForm.photo_url}
                  onChange={(e) => updatePetField('photo_url', e.target.value)}
                  placeholder="请输入照片链接（可选）"
                  leftIcon={<ImageIcon className="w-4 h-4" />}
                />
                {petForm.photo_url && (
                  <div className="mt-3">
                    <img
                      src={petForm.photo_url}
                      alt="预览"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-dashed border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Input
                label="主人姓名 *"
                value={customerForm.name}
                onChange={(e) => updateCustomerField('name', e.target.value)}
                placeholder="请输入主人姓名"
                error={errors.customer_name}
              />
              <Input
                label="联系电话 *"
                value={customerForm.phone}
                onChange={(e) => updateCustomerField('phone', e.target.value)}
                placeholder="请输入手机号码"
                error={errors.customer_phone}
                maxLength={11}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系地址 *</label>
                <textarea
                  value={customerForm.address}
                  onChange={(e) => updateCustomerField('address', e.target.value)}
                  placeholder="请输入详细地址"
                  rows={3}
                  className={cn(
                    'w-full px-4 py-3 text-sm rounded-xl border bg-white text-gray-800 placeholder:text-gray-400',
                    'transition-all duration-200 focus:outline-none focus:ring-2 resize-none',
                    errors.customer_address
                      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                      : 'border-gray-200 focus:border-primary-400 focus:ring-primary-100 hover:border-gray-300',
                  )}
                />
                {errors.customer_address && (
                  <p className="mt-1.5 text-xs text-danger-500">{errors.customer_address}</p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="rounded-xl bg-success-50 border border-success-200 p-4 flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-success-800">信息确认</h4>
                  <p className="text-sm text-success-700 mt-0.5">请仔细核对以下信息，确认无误后提交</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-primary-500" />
                    宠物信息
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">名称</span>
                      <span className="text-gray-800 font-medium">{petForm.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">种类</span>
                      <span className="text-gray-800 font-medium">{petForm.species}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">品种</span>
                      <span className="text-gray-800 font-medium">{petForm.breed}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">性别</span>
                      <span className="text-gray-800 font-medium">{petForm.gender}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">年龄</span>
                      <span className="text-gray-800 font-medium">{petForm.age} 岁</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">体重</span>
                      <span className="text-gray-800 font-medium">{petForm.weight_kg} kg</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    主人信息
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">姓名</span>
                      <span className="text-gray-800 font-medium">{customerForm.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">电话</span>
                      <span className="text-gray-800 font-medium">{customerForm.phone}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-gray-500 block mb-1">地址</span>
                      <span className="text-gray-800 font-medium">{customerForm.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {currentStep > 1 ? (
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={handlePrev}>
              上一步
            </Button>
          ) : (
            <div />
          )}
          {currentStep < 3 ? (
            <Button rightIcon={<ArrowRight className="w-4 h-4" />} onClick={handleNext}>
              下一步
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} leftIcon={<Check className="w-4 h-4" />}>
              确认提交
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
