import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  PawPrint,
  User,
  Calendar,
  CreditCard,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Send,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDate,
  formatPrice,
  getInsuranceTypeText,
  getInsuranceTypeColor,
  getInsuranceStatusText,
  getInsuranceStatusBadgeVariant,
} from '@/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { insurancePolicies, insuranceProducts, pets, customers, orders, insuranceClaims } = useAppStore();

  const policy = insurancePolicies.find((p) => p.id === id);
  const product = insuranceProducts.find((p) => p.id === policy?.product_id);
  const pet = pets.find((p) => p.id === policy?.pet_id);
  const customer = customers.find((c) => c.id === policy?.customer_id);
  const order = orders.find((o) => o.id === policy?.order_id);
  const relatedClaims = insuranceClaims.filter((c) => c.policy_id === policy?.id);

  if (!policy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">保单不存在</h1>
          <p className="text-gray-500 mb-6">未找到对应的保单信息</p>
          <Button onClick={() => navigate('/insurance')}>返回保险管理</Button>
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      label: '保单编号',
      value: policy.policy_no,
      icon: FileCheck,
      mono: true,
    },
    {
      label: '投保时间',
      value: formatDate(policy.purchase_date),
      icon: Calendar,
    },
    {
      label: '生效时间',
      value: formatDate(policy.effective_date),
      icon: Clock,
    },
    {
      label: '到期时间',
      value: formatDate(policy.expiry_date),
      icon: Calendar,
    },
    {
      label: '投保人',
      value: customer?.name || '-',
      icon: User,
    },
    {
      label: '联系电话',
      value: customer?.phone || '-',
      icon: User,
    },
    {
      label: '关联订单',
      value: order?.order_no || '-',
      icon: FileCheck,
      mono: true,
    },
  ];

  const claimSteps = [
    { title: '提交申请', desc: '在线提交理赔申请及相关材料' },
    { title: '材料审核', desc: '保险公司审核理赔材料' },
    { title: '理赔调查', desc: '必要时进行事件调查核实' },
    { title: '赔付打款', desc: '审核通过后进行理赔支付' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/insurance')}>
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-500" />
            保单详情
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className={`p-6 bg-gradient-to-r ${policy.status === 'active' ? 'from-primary-500 to-primary-600' : policy.status === 'expired' ? 'from-gray-400 to-gray-500' : 'from-amber-500 to-amber-600'}`}>
              <div className="flex items-start justify-between text-white">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6" />
                    <span className="text-lg font-semibold">{product?.name || '宠物运输保险'}</span>
                  </div>
                  <p className="text-white/80 text-sm font-mono">{policy.policy_no}</p>
                </div>
                <Badge variant={policy.status === 'active' ? 'success' : policy.status === 'expired' ? 'default' : 'warning'}>
                  {getInsuranceStatusText(policy.status)}
                </Badge>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">宠物估价</p>
                  <p className="text-xl font-bold text-white">{formatPrice(policy.pet_value)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">保障额度</p>
                  <p className="text-xl font-bold text-white">{formatPrice(policy.coverage_amount)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">已缴保费</p>
                  <p className="text-xl font-bold text-white">{formatPrice(policy.premium_amount)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="基本信息" icon={<FileCheck className="w-5 h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                      <p className={`text-sm font-medium text-gray-800 ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {product && (
            <Card title="保险方案" icon={<Shield className="w-5 h-5" />}>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInsuranceTypeColor(product.type)}`}>
                    {getInsuranceTypeText(product.type)}
                  </span>
                  <span className="text-sm text-gray-600">{product.description}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">保障比例</p>
                    <p className="text-lg font-bold text-blue-600">{(product.coverage_rate * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">最高保额</p>
                    <p className="text-lg font-bold text-green-600">{formatPrice(product.max_coverage)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">费率</p>
                    <p className="text-lg font-bold text-purple-600">{(product.premium_rate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">免赔额</p>
                    <p className="text-lg font-bold text-amber-600">{formatPrice(product.deductible)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">保障范围</p>
                  <div className="flex flex-wrap gap-2">
                    {product.coverage_items.map((item, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">免责条款</p>
                  <div className="flex flex-wrap gap-2">
                    {product.exclusions.map((item, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {relatedClaims.length > 0 && (
            <Card title="理赔记录" icon={<AlertCircle className="w-5 h-5" />}>
              <div className="space-y-3">
                {relatedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => navigate(`/insurance/claims/${claim.id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-danger-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{claim.title}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{claim.claim_no}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">申请金额</p>
                        <p className="font-semibold text-gray-800">{formatPrice(claim.claimed_amount)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="投保宠物" icon={<PawPrint className="w-5 h-5" />}>
            {pet ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center">
                    <PawPrint className="w-7 h-7 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{pet.name}</p>
                    <p className="text-sm text-gray-500">{pet.species} · {pet.breed}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">年龄</p>
                    <p className="text-sm font-semibold text-gray-700">{pet.age}岁</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">性别</p>
                    <p className="text-sm font-semibold text-gray-700">{pet.gender}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">体重</p>
                    <p className="text-sm font-semibold text-gray-700">{pet.weight_kg}kg</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <PawPrint className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>暂无宠物信息</p>
              </div>
            )}
          </Card>

          <Card title="理赔进度" icon={<Send className="w-5 h-5" />}>
            <div className="space-y-4">
              {claimSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    policy.has_claimed ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${policy.has_claimed ? 'text-gray-800' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {policy.status === 'active' && (
            <Button
              size="lg"
              className="w-full"
              leftIcon={<Send className="w-5 h-5" />}
              onClick={() => navigate('/insurance/claims/new', { state: { policyId: policy.id } })}
            >
              申请理赔
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
