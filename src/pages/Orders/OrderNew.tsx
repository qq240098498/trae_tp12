import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PawPrint, Route, Car, User, Phone, Clock, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { calculatePrice, formatPrice } from '@/utils';
import type { OrderStatus } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

export default function OrderNew() {
  const navigate = useNavigate();
  const {
    pets,
    routes,
    vehicles,
    customers,
    employees,
    pricingRules,
    addOrder,
    addOrderStatusLog,
  } = useAppStore();

  const [petId, setPetId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeRoutes = useMemo(() => routes.filter((r) => r.is_active), [routes]);
  const availableVehicles = useMemo(() => vehicles.filter((v) => v.status === '空闲'), [vehicles]);

  const petOptions = pets.map((p) => ({ label: `${p.name} (${p.species} - ${p.weight_kg}kg)`, value: p.id }));
  const routeOptions = activeRoutes.map((r) => ({
    label: `${r.origin} → ${r.destination} (${r.distance_km}km, 约${r.duration_hours}小时)`,
    value: r.id,
  }));
  const vehicleOptions = availableVehicles.map((v) => ({
    label: `${v.plate_number} - ${v.vehicle_type} (容量${v.capacity}) - ${v.driver_name}`,
    value: v.id,
  }));

  const selectedPet = pets.find((p) => p.id === petId);
  const selectedRoute = activeRoutes.find((r) => r.id === routeId);
  const selectedVehicle = availableVehicles.find((v) => v.id === vehicleId);

  const priceInfo = useMemo(() => {
    if (!selectedPet || !selectedRoute || !selectedVehicle) {
      return { basePrice: 0, surcharge: 0, total: 0 };
    }
    const total = calculatePrice(selectedRoute, selectedVehicle, selectedPet, pricingRules);
    const basePrice = selectedRoute.base_price;
    const surcharge = total - basePrice;
    return { basePrice, surcharge, total };
  }, [selectedPet, selectedRoute, selectedVehicle, pricingRules]);

  useEffect(() => {
    if (selectedVehicle) {
      const employee = employees.find((e) => e.name === selectedVehicle.driver_name);
      if (employee) {
        // employee found, could be used later
      }
    }
  }, [selectedVehicle, employees]);

  const canSubmit = !!(petId && routeId && vehicleId && receiverName && receiverPhone && pickupTime);

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
      base_price: priceInfo.basePrice,
      surcharge: priceInfo.surcharge,
      total_price: priceInfo.total,
      status: 'pending' as OrderStatus,
      pickup_time: pickupTime,
      delivery_time: '',
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      satisfaction: null,
      remark,
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
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-600 font-medium">合计</span>
                  <motion.span
                    key={priceInfo.total}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-primary-600"
                  >
                    {formatPrice(priceInfo.total)}
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
