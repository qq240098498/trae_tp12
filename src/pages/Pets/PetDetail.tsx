import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  PawPrint,
  User,
  Phone,
  MapPin,
  Calendar,
  Info,
  Package,
  Clock,
  Heart,
  UtensilsCrossed,
  Moon,
  Sparkles,
  Stethoscope,
  Gamepad2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/Empty';
import { getStatusText, getStatusColor, formatDate } from '@/utils';
import { cn } from '@/lib/utils';

type TabKey = 'basic' | 'history';

export default function PetDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const { pets, petProfiles, customers, orders, routes } = useAppStore();

  const pet = useMemo(() => pets.find((p) => p.id === id), [pets, id]);
  const petProfile = useMemo(() => petProfiles.find((pp) => pp.pet_id === id), [petProfiles, id]);
  const customer = useMemo(() => (pet ? customers.find((c) => c.id === pet.customer_id) : null), [pet, customers]);
  const petOrders = useMemo(
    () => orders.filter((o) => o.pet_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders, id],
  );

  const tabs = [
    { key: 'basic' as TabKey, label: '基本信息', icon: Info },
    { key: 'history' as TabKey, label: '运输历史', icon: Package },
  ];

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

  const profileItems = [
    { key: 'diet_habit', label: '饮食习惯', icon: UtensilsCrossed, value: petProfile?.diet_habit },
    { key: 'sleep_schedule', label: '作息规律', icon: Moon, value: petProfile?.sleep_schedule },
    { key: 'temperament', label: '性格特点', icon: Sparkles, value: petProfile?.temperament },
    { key: 'special_needs', label: '特殊需求', icon: Heart, value: petProfile?.special_needs },
    { key: 'medical_info', label: '医疗信息', icon: Stethoscope, value: petProfile?.medical_info },
    { key: 'favorite_toys', label: '喜爱玩具', icon: Gamepad2, value: petProfile?.favorite_toys },
    { key: 'notes', label: '备注', icon: FileText, value: petProfile?.notes },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/pets')}>
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">宠物详情</h1>
            <p className="text-sm text-gray-500 mt-1">查看和管理宠物档案信息</p>
          </div>
        </div>
        <Button leftIcon={<Edit2 className="w-4 h-4" />} onClick={() => navigate(`/pets/${id}/profile/edit`)}>
          编辑档案
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-32 h-32 rounded-2xl object-cover bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <PawPrint className="w-12 h-12 text-primary-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
                  <p className="text-gray-500 mt-1">{pet.breed}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={pet.species === '狗' ? 'info' : pet.species === '猫' ? 'warning' : 'default'}>
                    {pet.species}
                  </Badge>
                  <Badge variant="default">{pet.gender}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{pet.age} 岁</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <PawPrint className="w-4 h-4 text-gray-400" />
                  <span>{pet.weight_kg} kg</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>登记于 {formatDate(pet.created_at)}</span>
                </div>
              </div>
              {customer && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">主人信息</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{customer.address}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-gray-100 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors',
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  爱好档案
                </h3>
                {!petProfile ? (
                  <Empty
                    icon={<FileText className="w-12 h-12 text-gray-300" />}
                    title="暂无爱好档案"
                    description="点击编辑档案按钮完善宠物爱好信息"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profileItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-xl bg-gray-50 p-4"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon className="w-4 h-4 text-primary-500" />
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 pl-6">{item.value || '暂无信息'}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  运输历史
                </h3>
                {petOrders.length === 0 ? (
                  <Empty
                    icon={<Package className="w-12 h-12 text-gray-300" />}
                    title="暂无运输记录"
                    description="该宠物还没有任何运输订单"
                  />
                ) : (
                  <div className="space-y-3">
                    {petOrders.map((order, idx) => {
                      const route = routes.find((r) => r.id === order.route_id);
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{order.order_no}</div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                {route ? `${route.origin} → ${route.destination}` : '未知路线'}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <div className="text-sm font-medium text-gray-800">¥{order.total_price}</div>
                              <div className="text-xs text-gray-400">
                                {order.satisfaction ? `${'⭐'.repeat(order.satisfaction)}` : '未评价'}
                              </div>
                            </div>
                            <Badge className={cn(getStatusColor(order.status), 'border')}>{getStatusText(order.status)}</Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
