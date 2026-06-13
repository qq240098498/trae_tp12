import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PawPrint, Route, Car, User, Phone, Clock, FileText, CreditCard, CheckCircle, Shield, Info, ChevronDown, ChevronUp, Box, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { calculatePrice, formatPrice } from '@/utils';
import type { OrderStatus, InsuranceProduct, CageType, LuxuryLevel } from '@/types';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

const CAGE_OPTIONS: { value: CageType; label: string; desc: string; icon: string; price: number }[] = [
  { value: 'standard', label: '标准笼', desc: '常规运输笼，满足基本运输需求', icon: '📦', price: 0 },
  { value: 'reinforced', label: '加固笼', desc: '加厚材质，防撞防逃，适合中大型犬', icon: '🛡️', price: 80 },
  { value: 'luxury', label: '豪华笼', desc: '空间宽敞，内置水壶食盆，舒适透气', icon: '👑', price: 200 },
];

const LUXURY_OPTIONS: { value: LuxuryLevel; label: string; desc: string; icon: string; multiplier: number }[] = [
  { value: 'economy', label: '经济型', desc: '普通运输车辆，标准服务', icon: '🚐', multiplier: 1.0 },
  { value: 'comfort', label: '舒适型', desc: '空调恒温车厢，定时巡查', icon: '🚗', multiplier: 1.3 },
  { value: 'luxury', label: '豪华型', desc: '独立空调舱，实时监控，专人陪护', icon: '🌟', multiplier: 1.8 },
  { value: 'vip', label: 'VIP尊享', desc: '专车专送，一对一服务，全程直播', icon: '💎', multiplier: 2.5 },
];

export default function OrderNew() {
  const navigate = useNavigate();
  const {
    pets,
    routes,
    vehicles,
    customers,
    employees,
    pricingRules,
    insuranceProducts,
    addOrder,
    addOrderStatusLog,
    addInsurancePolicy,
  } = useAppStore();

  const [petId, setPetId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [cageType, setCageType] = useState<CageType>('standard');
  const [luxuryLevel, setLuxuryLevel] = useState<LuxuryLevel>('economy');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [hasInsurance, setHasInsurance] = useState(false);
  const [selectedInsuranceProductId, setSelectedInsuranceProductId] = useState('');
  const [petValue, setPetValue] = useState(5000);
  const [showInsuranceDetail, setShowInsuranceDetail] = useState(false);

  const activeRoutes = useMemo(() => routes.filter((r) => r.is_active), [routes]);
  const availableVehicles = useMemo(() => vehicles.filter((v) => v.status === '空闲'), [vehicles]);
  const activeInsuranceProducts = useMemo(
    () => insuranceProducts.filter((p) => p.is_active),
    [insuranceProducts],
  );

  const petOptions = pets.map((p) => ({ label: `${p.name} (${p.species} - ${p.weight_kg}kg)`, value: p.id }));
  const routeOptions = activeRoutes.map((r) => ({
    label: `${r.origin} → ${r.destination} (${r.distance_km}km, 约${r.duration_hours}小时)`,
    value: r.id,
  }));
  const vehicleOptions = availableVehicles.map((v) => ({
    label: `${v.plate_number} - ${v.vehicle_type} (容量${v.capacity}) - ${v.driver_name}`,
    value: v.id,
  }));
  const insuranceOptions = activeInsuranceProducts.map((p) => ({
    label: `${p.name} (保障率${(p.coverage_rate * 100).toFixed(0)}%, 费率${(p.premium_rate * 100).toFixed(1)}%)`,
    value: p.id,
  }));

  const selectedPet = pets.find((p) => p.id === petId);
  const selectedRoute = activeRoutes.find((r) => r.id === routeId);
  const selectedVehicle = availableVehicles.find((v) => v.id === vehicleId);
  const selectedInsuranceProduct: InsuranceProduct | undefined = activeInsuranceProducts.find(
    (p) => p.id === selectedInsuranceProductId,
  );

  const selectedCageOption = CAGE_OPTIONS.find((c) => c.value === cageType);
  const selectedLuxuryOption = LUXURY_OPTIONS.find((l) => l.value === luxuryLevel);

  const priceInfo = useMemo(() => {
    if (!selectedPet || !selectedRoute || !selectedVehicle) {
      return { basePrice: 0, surcharge: 0, cagePrice: 0, luxuryPremium: 0, total: 0 };
    }
    const transportTotal = calculatePrice(selectedRoute, selectedVehicle, selectedPet, pricingRules);
    const basePrice = selectedRoute.base_price;
    const surcharge = transportTotal - basePrice;
    const cagePrice = selectedCageOption?.price ?? 0;
    const luxuryPremium = Math.round(transportTotal * ((selectedLuxuryOption?.multiplier ?? 1) - 1));
    const total = transportTotal + cagePrice + luxuryPremium;
    return { basePrice, surcharge, cagePrice, luxuryPremium, total };
  }, [selectedPet, selectedRoute, selectedVehicle, pricingRules, selectedCageOption, selectedLuxuryOption]);

  const insuranceInfo = useMemo(() => {
    if (!hasInsurance || !selectedInsuranceProduct) {
      return { premium: 0, coverage: 0 };
    }
    const rawPremium = petValue * selectedInsuranceProduct.premium_rate;
    const premium = Math.max(rawPremium, selectedInsuranceProduct.min_premium);
    const rawCoverage = petValue * selectedInsuranceProduct.coverage_rate;
    const coverage = Math.min(rawCoverage, selectedInsuranceProduct.max_coverage);
    return { premium, coverage };
  }, [hasInsurance, selectedInsuranceProduct, petValue]);

  const finalTotal = priceInfo.total + insuranceInfo.premium;

  useEffect(() => {
    if (selectedVehicle) {
      const employee = employees.find((e) => e.name === selectedVehicle.driver_name);
      if (employee) {
        // employee found, could be used later
      }
    }
  }, [selectedVehicle, employees]);

  const canSubmit = !!(petId && routeId && vehicleId && receiverName && receiverPhone && pickupTime
    && (!hasInsurance || (hasInsurance && selectedInsuranceProductId && petValue > 0)));

  const handleSubmit = async () => {
    if (!canSubmit || !selectedPet || !selectedRoute || !selectedVehicle) return;

    setSubmitting(true);

    const customer = customers.find((c) => c.id === selectedPet.customer_id);
    const employee = employees.find((e) => e.name === selectedVehicle.driver_name);

    const newOrder = {
      pet_id: petId,
      customer_id: customer?.id || '',
      route_id: routeId,
      vehicle_id: vehicleId,
      employee_id: employee?.id || '',
      cage_type: cageType,
      luxury_level: luxuryLevel,
      base_price: priceInfo.basePrice,
      surcharge: priceInfo.surcharge + insuranceInfo.premium + priceInfo.cagePrice + priceInfo.luxuryPremium,
      total_price: finalTotal,
      status: 'pending' as OrderStatus,
      pickup_time: pickupTime,
      delivery_time: '',
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      satisfaction: null,
      remark: remark + (hasInsurance ? `\n[已投保：${selectedInsuranceProduct?.name}]` : ''),
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    addOrder(newOrder);

    setTimeout(() => {
      const lastOrder = useAppStore.getState().orders[useAppStore.getState().orders.length - 1];
      if (lastOrder) {
        addOrderStatusLog({
          order_id: lastOrder.id,
          status: 'pending',
          location: '系统',
          remark: '订单已创建，等待接单',
        });

        if (hasInsurance && selectedInsuranceProduct && customer) {
          const now = new Date();
          const effectiveDate = new Date(pickupTime || now);
          const expiryDate = new Date(effectiveDate);
          expiryDate.setDate(expiryDate.getDate() + Math.ceil(selectedRoute.duration_hours / 24) + 3);

          addInsurancePolicy({
            order_id: lastOrder.id,
            customer_id: customer.id,
            pet_id: petId,
            product_id: selectedInsuranceProduct.id,
            pet_value: petValue,
            premium_amount: insuranceInfo.premium,
            coverage_amount: insuranceInfo.coverage,
            status: 'active',
            purchase_date: now.toISOString(),
            effective_date: effectiveDate.toISOString(),
            expiry_date: expiryDate.toISOString(),
            has_claimed: false,
            total_claimed_amount: 0,
          });
        }
      }
    }, 0);

    setSubmitting(false);
    navigate('/orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <h2 className="text-xl font-bold text-gray-800">计费下单</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="选择服务" icon={<PawPrint className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="选择宠物"
                placeholder="请选择要运输的宠物"
                options={petOptions}
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
              />
              <Select
                label="选择运输路线"
                placeholder="请选择运输路线"
                options={routeOptions}
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
              />
              <Select
                label="选择车辆"
                placeholder="请选择可用车辆"
                options={vehicleOptions}
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                wrapperClassName="md:col-span-2"
              />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Box className="w-4 h-4 text-primary-500" />
                  选择笼子类型
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CAGE_OPTIONS.map((cage) => {
                    const isSelected = cageType === cage.value;
                    return (
                      <button
                        key={cage.value}
                        type="button"
                        onClick={() => setCageType(cage.value)}
                        className={cn(
                          'relative text-left p-4 rounded-xl border-2 transition-all duration-200',
                          isSelected
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                          </div>
                        )}
                        <div className="text-2xl mb-2">{cage.icon}</div>
                        <div className="font-semibold text-gray-800 text-sm mb-1">{cage.label}</div>
                        <div className="text-xs text-gray-500 mb-2">{cage.desc}</div>
                        <div className="text-sm font-bold text-primary-600">
                          {cage.price === 0 ? '免费' : `+¥${cage.price}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  车辆豪华等级
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {LUXURY_OPTIONS.map((luxury) => {
                    const isSelected = luxuryLevel === luxury.value;
                    return (
                      <button
                        key={luxury.value}
                        type="button"
                        onClick={() => setLuxuryLevel(luxury.value)}
                        className={cn(
                          'relative text-left p-4 rounded-xl border-2 transition-all duration-200',
                          isSelected
                            ? luxury.value === 'vip'
                              ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm'
                              : luxury.value === 'luxury'
                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                : 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className={cn(
                              'w-5 h-5',
                              luxury.value === 'vip' ? 'text-amber-500' : luxury.value === 'luxury' ? 'text-purple-500' : 'text-primary-500'
                            )} />
                          </div>
                        )}
                        <div className="text-2xl mb-2">{luxury.icon}</div>
                        <div className="font-semibold text-gray-800 text-sm mb-1">{luxury.label}</div>
                        <div className="text-xs text-gray-500 mb-2">{luxury.desc}</div>
                        <div className="text-sm font-bold text-primary-600">
                          {luxury.multiplier === 1.0 ? '标准价' : `×${luxury.multiplier}倍`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedPet && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 bg-primary-50 rounded-xl border border-primary-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <PawPrint className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{selectedPet.name}</span>
                      <Badge variant="info">{selectedPet.species}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedPet.breed} · {selectedPet.age}岁 · {selectedPet.weight_kg}kg
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>

          <Card title="收货信息" icon={<User className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="收货人姓名"
                placeholder="请输入收货人姓名"
                leftIcon={<User className="w-4 h-4" />}
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
              <Input
                label="收货人电话"
                placeholder="请输入收货人联系电话"
                leftIcon={<Phone className="w-4 h-4" />}
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
              />
              <Input
                label="预计取件时间"
                type="datetime-local"
                leftIcon={<Clock className="w-4 h-4" />}
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                wrapperClassName="md:col-span-2"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  备注信息
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="请输入备注信息（选填）"
                    rows={3}
                    className="w-full px-4 pt-2.5 pb-2.5 pl-10 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 hover:border-gray-300 resize-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card title="运输保险" icon={<Shield className="w-5 h-5" />}>
            <div className="space-y-5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasInsurance}
                  onChange={(e) => {
                    setHasInsurance(e.target.checked);
                    if (e.target.checked && activeInsuranceProducts.length > 0 && !selectedInsuranceProductId) {
                      setSelectedInsuranceProductId(activeInsuranceProducts[0].id);
                    }
                  }}
                  className="mt-1 w-5 h-5 rounded-lg border-2 border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-colors"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                      购买运输保险
                    </span>
                    <Badge variant="info">推荐</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    为您的宠物提供运输途中的全方位保障，意外无忧
                  </p>
                </div>
              </label>

              {hasInsurance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-gray-100 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select
                      label="选择保险方案"
                      placeholder="请选择保险产品"
                      options={insuranceOptions}
                      value={selectedInsuranceProductId}
                      onChange={(e) => setSelectedInsuranceProductId(e.target.value)}
                    />
                    <Input
                      label="宠物估价 (元)"
                      type="number"
                      placeholder="请输入宠物价值"
                      value={petValue.toString()}
                      onChange={(e) => setPetValue(Number(e.target.value) || 0)}
                      min={0}
                      step={100}
                    />
                  </div>

                  {selectedInsuranceProduct && (
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100">
                      <button
                        onClick={() => setShowInsuranceDetail(!showInsuranceDetail)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary-500" />
                          <span className="font-medium text-primary-700">
                            {selectedInsuranceProduct.name} 方案详情
                          </span>
                        </div>
                        {showInsuranceDetail ? (
                          <ChevronUp className="w-4 h-4 text-primary-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-primary-500" />
                        )}
                      </button>
                      <AnimatePresence>
                        {showInsuranceDetail && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-3 overflow-hidden"
                          >
                            <p className="text-sm text-gray-600">{selectedInsuranceProduct.description}</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-gray-500">保障比例</p>
                                <p className="font-semibold text-gray-800">{(selectedInsuranceProduct.coverage_rate * 100).toFixed(0)}%</p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-gray-500">最高保额</p>
                                <p className="font-semibold text-gray-800">{formatPrice(selectedInsuranceProduct.max_coverage)}</p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-gray-500">保险费率</p>
                                <p className="font-semibold text-gray-800">{(selectedInsuranceProduct.premium_rate * 100).toFixed(1)}%</p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-gray-500">免赔额</p>
                                <p className="font-semibold text-gray-800">{formatPrice(selectedInsuranceProduct.deductible)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1.5">保障范围：</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedInsuranceProduct.coverage_items.map((item, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1.5">免责条款：</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedInsuranceProduct.exclusions.map((item, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {insuranceInfo.coverage > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm text-gray-500">预计保障额度</p>
                        <p className="text-xl font-bold text-primary-600">{formatPrice(insuranceInfo.coverage)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">应付保费</p>
                        <p className="text-xl font-bold text-gray-800">{formatPrice(insuranceInfo.premium)}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="费用明细" icon={<CreditCard className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="space-y-3">
                {selectedRoute && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Route className="w-4 h-4 text-gray-400" />
                    <span>{selectedRoute.origin} → {selectedRoute.destination}</span>
                  </div>
                )}
                {selectedVehicle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span>{selectedVehicle.plate_number} · {selectedVehicle.vehicle_type}</span>
                  </div>
                )}
                {selectedCageOption && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Box className="w-4 h-4 text-primary-500" />
                    <span>{selectedCageOption.icon} {selectedCageOption.label}</span>
                  </div>
                )}
                {selectedLuxuryOption && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{selectedLuxuryOption.icon} {selectedLuxuryOption.label}</span>
                  </div>
                )}
                {hasInsurance && selectedInsuranceProduct && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-primary-500" />
                    <span className="text-primary-600">{selectedInsuranceProduct.name}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">基础运费</span>
                  <span className="font-medium text-gray-800">{formatPrice(priceInfo.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">附加费</span>
                  <span className="font-medium text-gray-800">{formatPrice(priceInfo.surcharge)}</span>
                </div>
                {priceInfo.cagePrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Box className="w-3.5 h-3.5" />
                      {selectedCageOption?.label}费用
                    </span>
                    <span className="font-medium text-primary-600">{formatPrice(priceInfo.cagePrice)}</span>
                  </div>
                )}
                {priceInfo.luxuryPremium > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {selectedLuxuryOption?.label}升级费
                    </span>
                    <span className="font-medium text-amber-600">{formatPrice(priceInfo.luxuryPremium)}</span>
                  </div>
                )}
                {hasInsurance && insuranceInfo.premium > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      运输保费
                    </span>
                    <span className="font-medium text-primary-600">{formatPrice(insuranceInfo.premium)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-600 font-medium">合计</span>
                  <motion.span
                    key={finalTotal}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-primary-600"
                  >
                    {formatPrice(finalTotal)}
                  </motion.span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                leftIcon={<CheckCircle className="w-5 h-5" />}
                loading={submitting}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                提交订单
              </Button>

              {!canSubmit && (
                <p className="text-xs text-gray-400 text-center">
                  请完整填写所有必填项后提交
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
