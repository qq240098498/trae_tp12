import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  UtensilsCrossed,
  Moon,
  Sparkles,
  Heart,
  Stethoscope,
  Gamepad2,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Empty from '@/components/Empty';
import { cn } from '@/lib/utils';
import type { PetProfile } from '@/types';

interface ProfileForm {
  diet_habit: string;
  sleep_schedule: string;
  temperament: string;
  special_needs: string;
  medical_info: string;
  favorite_toys: string;
  notes: string;
}

const formFields = [
  {
    key: 'diet_habit' as const,
    label: '饮食习惯',
    icon: UtensilsCrossed,
    placeholder: '如：每天两餐，早上8点和晚上6点，狗粮200g/餐',
    rows: 3,
  },
  {
    key: 'sleep_schedule' as const,
    label: '作息规律',
    icon: Moon,
    placeholder: '如：晚上10点到早上7点，午休1小时',
    rows: 2,
  },
  {
    key: 'temperament' as const,
    label: '性格特点',
    icon: Sparkles,
    placeholder: '如：温顺友好，喜欢和人互动',
    rows: 2,
  },
  {
    key: 'special_needs' as const,
    label: '特殊需求',
    icon: Heart,
    placeholder: '如：对鸡肉过敏，需要特殊狗粮',
    rows: 3,
  },
  {
    key: 'medical_info' as const,
    label: '医疗信息',
    icon: Stethoscope,
    placeholder: '如：已接种所有疫苗，已绝育，定期驱虫',
    rows: 3,
  },
  {
    key: 'favorite_toys' as const,
    label: '喜爱玩具',
    icon: Gamepad2,
    placeholder: '如：飞盘、磨牙棒、网球',
    rows: 2,
  },
  {
    key: 'notes' as const,
    label: '备注',
    icon: FileText,
    placeholder: '其他需要说明的信息',
    rows: 3,
  },
];

export default function PetProfileEdit() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { pets, petProfiles, addPetProfile, updatePetProfile } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const pet = useMemo(() => pets.find((p) => p.id === id), [pets, id]);
  const existingProfile = useMemo(() => petProfiles.find((pp) => pp.pet_id === id), [petProfiles, id]);

  const [form, setForm] = useState<ProfileForm>({
    diet_habit: existingProfile?.diet_habit || '',
    sleep_schedule: existingProfile?.sleep_schedule || '',
    temperament: existingProfile?.temperament || '',
    special_needs: existingProfile?.special_needs || '',
    medical_info: existingProfile?.medical_info || '',
    favorite_toys: existingProfile?.favorite_toys || '',
    notes: existingProfile?.notes || '',
  });

  if (!pet) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <Empty
            icon={<AlertCircle className="w-16 h-16 text-gray-300" />}
            title="宠物不存在"
            description="未找到该宠物的档案信息"
          />
          <div className="flex justify-center mt-4">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/pets')}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const profileData: Omit<PetProfile, 'id'> = {
        pet_id: id,
        ...form,
      };

      if (existingProfile) {
        updatePetProfile(existingProfile.id, form);
      } else {
        addPetProfile(profileData);
      }

      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/pets/${id}`);
      }, 1000);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(`/pets/${id}`)}>
            返回详情
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">编辑爱好档案</h1>
            <p className="text-sm text-gray-500 mt-1">
              {pet ? `${pet.name} 的爱好档案` : '宠物爱好档案'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
          保存档案
        </Button>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-success-50 border border-success-200 p-4 flex gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-success-800">保存成功</h4>
            <p className="text-sm text-success-700 mt-0.5">档案已保存，即将返回详情页</p>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card title="爱好档案信息" icon={<Heart className="w-5 h-5 text-rose-500" />}>
          <div className="space-y-5">
            {formFields.map((field, idx) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Icon className="w-4 h-4 text-primary-500" />
                    {field.label}
                  </label>
                  <textarea
                    value={form[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    className={cn(
                      'w-full px-4 py-3 text-sm rounded-xl border bg-white text-gray-800 placeholder:text-gray-400',
                      'transition-all duration-200 focus:outline-none focus:ring-2 resize-none',
                      'border-gray-200 focus:border-primary-400 focus:ring-primary-100 hover:border-gray-300',
                    )}
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <Button variant="ghost" onClick={() => navigate(`/pets/${id}`)}>
              取消
            </Button>
            <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
              保存档案
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
