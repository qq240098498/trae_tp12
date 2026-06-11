import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertCircle,
  Shield,
  PawPrint,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  FileText,
  Upload,
  Ban,
  Check,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDate,
  formatPrice,
  getClaimStatusText,
  getClaimStatusBadgeVariant,
  getClaimReasonText,
  getClaimReasonColor,
  getInsuranceStatusBadgeVariant,
  getInsuranceStatusText,
} from '@/utils';
import type { ClaimStatus } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const claimSteps: { key: ClaimStatus; label: string; icon: typeof Clock }[] = [
  { key: 'submitted', label: '已提交', icon: Send },
  { key: 'reviewing', label: '审核中', icon: Clock },
  { key: 'approved', label: '已通过', icon: CheckCircle2 },
  { key: 'paid', label: '已赔付', icon: DollarSign },
  { key: 'closed', label: '已结案', icon: FileText },
];

const nextStatusMap: Partial<Record<ClaimStatus, ClaimStatus>> = {
  submitted: 'reviewing',
  reviewing: 'approved',
  approved: 'paid',
  paid: 'closed',
};

const actionLabels: Partial<Record<ClaimStatus, string>> = {
  submitted: '开始审核',
  reviewing: '审核通过',
  approved: '确认赔付',
  paid: '结案',
};

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    insuranceClaims,
    insurancePolicies,
    insuranceProducts,
    pets,
    customers,
    orders,
    updateInsuranceClaimStatus,
    addInsuranceClaimProcessingLog,
  } = useAppStore();

  const [showActionModal, setShowActionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionRemark, setActionRemark] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  const claim = insuranceClaims.find((c) => c.id === id);
  const policy = insurancePolicies.find((p) => p.id === claim?.policy_id);
  const product = insuranceProducts.find((p) => p.id === policy?.product_id);
  const pet = pets.find((p) => p.id === claim?.pet_id);
  const customer = customers.find((c) => c.id === claim?.customer_id);
  const order = orders.find((o) => o.id === claim?.order_id);

  if (!claim) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">理赔记录不存在</h1>
          <p className="text-gray-500 mb-6">未找到对应的理赔申请</p>
          <Button onClick={() => navigate('/insurance')}>返回保险管理</Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = claimSteps.findIndex((s) => s.key === claim.status);
  const isRejected = claim.status === 'rejected';
  const canAct = ['submitted', 'reviewing', 'approved', 'paid'].includes(claim.status);
  const canReject = ['submitted', 'reviewing'].includes(claim.status);

  const handleAction = () => {
    const nextStatus = nextStatusMap[claim.status];
    if (!nextStatus) return;

    if (claim.status === 'reviewing' && approvedAmount) {
      updateInsuranceClaimStatus(
        claim.id,
        nextStatus,
        '管理员',
        Number(approvedAmount),
        actionRemark || '审核通过，按约定金额赔付',
      );
    } else {
      updateInsuranceClaimStatus(claim.id, nextStatus, '管理员', undefined, actionRemark);
    }

    addInsuranceClaimProcessingLog(claim.id, {
      action: actionLabels[claim.status] || '状态变更',
      operator: '管理员',
      remark: actionRemark || `理赔状态已更新为${getClaimStatusText(nextStatus)}`,
    });

    setShowActionModal(false);
    setActionRemark('');
    setApprovedAmount('');
  };

  const handleReject = () => {
    updateInsuranceClaimStatus(
      claim.id,
      'rejected',
      '管理员',
      0,
      rejectReason || '审核不通过',
    );
    addInsuranceClaimProcessingLog(claim.id, {
      action: '审核拒绝',
      operator: '管理员',
      remark: rejectReason || '审核不通过',
    });
    setShowRejectModal(false);
    setRejectReason('');
  };

  const infoItems = [
    { label: '理赔编号', value: claim.claim_no, mono: true },
    { label: '提交时间', value: formatDate(claim.submitted_at) },
    { label: '事件时间', value: formatDate(claim.incident_date) },
    { label: '事件地点', value: claim.incident_location },
    { label: '关联保单', value: policy?.policy_no || '-', mono: true },
    { label: '关联订单', value: order?.order_no || '-', mono: true },
    { label: '报案人', value: claim.reporter_name },
    { label: '联系电话', value: claim.reporter_phone },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 justify-between flex-wrap"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/insurance')}>
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-danger-500" />
              理赔详情
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{claim.claim_no}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAct && (
            <Button
              leftIcon={<Check className="w-4 h-4" />}
              onClick={() => {
                if (claim.status === 'reviewing') {
                  setApprovedAmount(claim.claimed_amount.toString());
                }
                setShowActionModal(true);
              }}
            >
              {actionLabels[claim.status] || '处理'}
            </Button>
          )}
          {canReject && (
            <Button
              variant="danger"
              leftIcon={<X className="w-4 h-4" />}
              onClick={() => setShowRejectModal(true)}
            >
              拒绝理赔
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className={`p-6 ${
              isRejected
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : claim.status === 'paid' || claim.status === 'closed'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-amber-500 to-amber-600'
            }`}>
              <div className="flex items-start justify-between text-white">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-lg font-semibold">{claim.title}</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {getClaimReasonText(claim.reason)} · 申请 {formatPrice(claim.claimed_amount)}
                  </p>
                </div>
                <Badge variant={getClaimStatusBadgeVariant(claim.status)}>
                  {getClaimStatusText(claim.status)}
                </Badge>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">申请金额</p>
                  <p className="text-xl font-bold text-white">{formatPrice(claim.claimed_amount)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">赔付金额</p>
                  <p className="text-xl font-bold text-white">
                    {claim.approved_amount != null ? formatPrice(claim.approved_amount) : '-'}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">审核人</p>
                  <p className="text-xl font-bold text-white">{claim.reviewer_name || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="理赔进度" icon={<Clock className="w-5 h-5" />}>
            <div className="relative">
              <div className="absolute top-4 left-[28px] right-[28px] h-0.5 bg-gray-200" />
              <div className="flex items-center justify-between relative">
                {claimSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isRejectStep = isRejected && idx === 1;

                  return (
                    <div key={step.key} className="flex flex-col items-center z-10">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isRejectStep
                            ? 'bg-red-500 text-white shadow-lg'
                            : isDone
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
                      >
                        {isRejectStep ? (
                          <Ban className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <p
                        className={`mt-2 text-xs font-medium ${
                          isRejectStep
                            ? 'text-red-600'
                            : isDone
                            ? 'text-gray-800'
                            : 'text-gray-400'
                        }`}
                      >
                        {isRejectStep ? '已拒绝' : step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card title="基本信息" icon={<FileText className="w-5 h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="p-3 bg-gray-50 rounded-xl"
                >
                  <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                  <p className={`text-sm font-medium text-gray-800 ${item.mono ? 'font-mono' : ''}`}>
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card title="详细描述" icon={<FileText className="w-5 h-5" />}>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {claim.description}
              </p>
            </div>
            {claim.resolution && (
              <div className="mt-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <p className="text-xs text-primary-600 font-medium mb-1">处理结果</p>
                <p className="text-sm text-gray-700 leading-relaxed">{claim.resolution}</p>
              </div>
            )}
          </Card>

          <Card title="凭证材料" icon={<Upload className="w-5 h-5" />}>
            {claim.evidence_urls && claim.evidence_urls.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {claim.evidence_urls.map((url, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无上传凭证</p>
              </div>
            )}
          </Card>

          <Card title="处理日志" icon={<Clock className="w-5 h-5" />}>
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200" />
              {claim.processing_logs.map((log, idx) => (
                <motion.div
                  key={log.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="relative mb-5 last:mb-0"
                >
                  <div className="absolute -left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow" />
                  <div className="bg-gray-50 rounded-xl p-4 ml-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{log.action}</span>
                      <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">操作人：{log.operator}</p>
                    {log.remark && (
                      <p className="text-sm text-gray-600">{log.remark}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {policy && (
            <Card title="关联保单" icon={<Shield className="w-5 h-5" />}>
              <div
                onClick={() => navigate(`/insurance/policies/${policy.id}`)}
                className="space-y-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-500">{policy.policy_no}</span>
                  <Badge variant={getInsuranceStatusBadgeVariant(policy.status)}>
                    {getInsuranceStatusText(policy.status)}
                  </Badge>
                </div>
                {product && (
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <p className="text-xs text-gray-500">保障额度</p>
                    <p className="text-sm font-bold text-primary-600">{formatPrice(policy.coverage_amount)}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">已缴保费</p>
                    <p className="text-sm font-bold text-gray-700">{formatPrice(policy.premium_amount)}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card title="理赔宠物" icon={<PawPrint className="w-5 h-5" />}>
            {pet ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{pet.name}</p>
                    <p className="text-xs text-gray-500">{pet.species} · {pet.breed}</p>
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

          <Card title="申请人" icon={<User className="w-5 h-5" />}>
            {customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-semibold text-lg">
                    {customer.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{customer.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    联系地址
                  </p>
                  <p className="text-sm text-gray-700">{customer.address}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>暂无申请人信息</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={actionLabels[claim.status] || '处理理赔'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              取消
            </Button>
            <Button onClick={handleAction} leftIcon={<Check className="w-4 h-4" />}>
              确认
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {claim.status === 'reviewing' && (
            <Input
              label="赔付金额 (元)"
              type="number"
              placeholder="请输入实际赔付金额"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              处理备注
            </label>
            <textarea
              value={actionRemark}
              onChange={(e) => setActionRemark(e.target.value)}
              placeholder="请输入处理备注（选填）"
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="拒绝理赔"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleReject} leftIcon={<XCircle className="w-4 h-4" />}>
              确认拒绝
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-700 font-medium">确定拒绝此理赔申请吗？</p>
            <p className="text-xs text-red-500 mt-1">拒绝后理赔申请将无法恢复，请谨慎操作</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              拒绝原因 <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请详细说明拒绝理赔的原因..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-danger-400 focus:ring-2 focus:ring-danger-100 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
