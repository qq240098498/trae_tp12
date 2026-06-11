import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Car,
  PawPrint,
  Cloud,
  TrafficCone,
  HelpCircle,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  MapPin,
  User,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDate,
  getExceptionTypeText,
  getExceptionSeverityText,
  getExceptionStatusText,
  getExceptionSeverityBadgeVariant,
  getExceptionStatusBadgeVariant,
} from '@/utils';
import type { ExceptionType, ExceptionStatus } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const typeIcons: Record<ExceptionType, typeof AlertTriangle> = {
  vehicle: Car,
  pet: PawPrint,
  weather: Cloud,
  traffic: TrafficCone,
  other: HelpCircle,
};

const typeColors: Record<ExceptionType, string> = {
  vehicle: 'text-orange-500 bg-orange-50',
  pet: 'text-purple-500 bg-purple-50',
  weather: 'text-blue-500 bg-blue-50',
  traffic: 'text-yellow-500 bg-yellow-50',
  other: 'text-gray-500 bg-gray-50',
};

const statusIcons: Record<ExceptionStatus, typeof AlertTriangle> = {
  reported: AlertTriangle,
  processing: Loader2,
  resolved: CheckCircle2,
  closed: XCircle,
};

const statusColors: Record<ExceptionStatus, string> = {
  reported: 'text-danger-500 bg-danger-100',
  processing: 'text-warning-500 bg-warning-100',
  resolved: 'text-success-600 bg-success-100',
  closed: 'text-gray-500 bg-gray-100',
};

const actionLabels: Record<ExceptionStatus, string> = {
  reported: '受理处理',
  processing: '标记已解决',
  resolved: '关闭异常',
  closed: '',
};

const nextStatusMap: Partial<Record<ExceptionStatus, ExceptionStatus>> = {
  reported: 'processing',
  processing: 'resolved',
  resolved: 'closed',
};

export default function ExceptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exceptions, orders, pets, employees, updateExceptionStatus, addExceptionProcessingLog } = useAppStore();

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionRemark, setActionRemark] = useState('');
  const [resolution, setResolution] = useState('');

  const exception = exceptions.find((e) => e.id === id);

  if (!exception) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">未找到异常记录</h1>
          <p className="text-gray-500 mb-6">该异常记录不存在或已被删除</p>
          <Button onClick={() => navigate('/exceptions')}>返回列表</Button>
        </div>
      </div>
    );
  }

  const order = orders.find((o) => o.id === exception.order_id);
  const pet = order ? pets.find((p) => p.id === order.pet_id) : null;
  const TypeIcon = typeIcons[exception.type];
  const StatusIcon = statusIcons[exception.status];

  const dispatchers = employees.filter((e) => e.role === '调度员' || e.role === '管理员');
  const currentHandler = dispatchers.length > 0 ? dispatchers[0].name : '管理员';

  const handleAction = () => {
    const nextStatus = nextStatusMap[exception.status];
    if (!nextStatus) return;

    const actionText = actionLabels[exception.status];
    const remarkValue = actionRemark.trim() || actionText;

    addExceptionProcessingLog(exception.id, {
      action: actionText,
      operator: currentHandler,
      remark: remarkValue,
    });

    const resolutionValue = nextStatus === 'resolved' ? resolution.trim() : undefined;
    updateExceptionStatus(exception.id, nextStatus, currentHandler, resolutionValue);

    setShowActionModal(false);
    setActionRemark('');
    setResolution('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/exceptions')}
        >
          返回列表
        </Button>
        {exception.status !== 'closed' && nextStatusMap[exception.status] && (
          <Button
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => setShowActionModal(true)}
          >
            {actionLabels[exception.status]}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="异常信息" icon={<AlertTriangle className="w-5 h-5" />}>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[exception.type]}`}>
                  <TypeIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{exception.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xs text-gray-500">{exception.exception_no}</span>
                    <Badge variant={getExceptionSeverityBadgeVariant(exception.severity)}>
                      {getExceptionSeverityText(exception.severity)}
                    </Badge>
                    <Badge variant={getExceptionStatusBadgeVariant(exception.status)}>
                      {getExceptionStatusText(exception.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">详细描述</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{exception.description}</p>
              </div>

              {exception.resolution && (
                <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                  <h4 className="text-sm font-medium text-success-700 mb-2">处理结果</h4>
                  <p className="text-sm text-success-600 leading-relaxed">{exception.resolution}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">异常类型：</span>
                  <span className="text-sm font-medium text-gray-800">{getExceptionTypeText(exception.type)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">发生地点：</span>
                  <span className="text-sm font-medium text-gray-800">{exception.location || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">上报人：</span>
                  <span className="text-sm font-medium text-gray-800">{exception.reporter_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">上报时间：</span>
                  <span className="text-sm font-medium text-gray-800">{formatDate(exception.reported_at)}</span>
                </div>
                {exception.handler_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">处理人：</span>
                    <span className="text-sm font-medium text-gray-800">{exception.handler_name}</span>
                  </div>
                )}
                {exception.handled_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">处理时间：</span>
                    <span className="text-sm font-medium text-gray-800">{formatDate(exception.handled_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="处理流程" icon={<Clock className="w-5 h-5" />}>
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
              {exception.processing_logs.map((log, index) => {
                const isLast = index === exception.processing_logs.length - 1;
                const logActionColor = log.action === '上报异常'
                  ? 'text-danger-500 bg-danger-100'
                  : log.action === '受理处理'
                    ? 'text-warning-500 bg-warning-100'
                    : log.action === '处理中'
                      ? 'text-blue-500 bg-blue-50'
                      : log.action === '已解决'
                        ? 'text-success-600 bg-success-100'
                        : log.action === '已关闭'
                          ? 'text-gray-500 bg-gray-100'
                          : 'text-primary-500 bg-primary-100';

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                    className="relative mb-6 last:mb-0"
                  >
                    <div
                      className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 ${logActionColor} ${isLast ? 'animate-pulse-soft' : ''}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className={`rounded-xl p-4 border transition-all ${
                        isLast
                          ? 'bg-primary-50/50 border-primary-200'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-800">
                          {log.action}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      {log.remark && (
                        <p className="text-sm text-gray-600">{log.remark}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">操作人：{log.operator}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="关联订单" icon={<FileText className="w-5 h-5" />}>
            {order ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">订单号</span>
                  <span className="font-mono text-sm text-gray-800">{order.order_no}</span>
                </div>
                {pet && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">宠物</span>
                    <span className="text-sm text-gray-800">{pet.name} ({pet.species})</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">订单状态</span>
                  <Badge variant={order.status === 'in_transit' ? 'warning' : 'info'}>
                    {order.status === 'in_transit' ? '运输中' : order.status === 'picked_up' ? '已接宠' : order.status}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  查看订单详情
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">无关联订单信息</p>
            )}
          </Card>

          <Card title="当前状态" icon={<StatusIcon className="w-5 h-5" />}>
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${statusColors[exception.status]}`}>
                <StatusIcon className={`w-8 h-8 ${exception.status === 'processing' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {getExceptionStatusText(exception.status)}
                </p>
                <Badge variant={getExceptionSeverityBadgeVariant(exception.severity)} className="mt-2">
                  严重程度：{getExceptionSeverityText(exception.severity)}
                </Badge>
              </div>
              {exception.status !== 'closed' && nextStatusMap[exception.status] && (
                <Button
                  className="w-full"
                  onClick={() => setShowActionModal(true)}
                >
                  {actionLabels[exception.status]}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setActionRemark('');
          setResolution('');
        }}
        title={actionLabels[exception.status]}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowActionModal(false);
                setActionRemark('');
                setResolution('');
              }}
            >
              取消
            </Button>
            <Button onClick={handleAction}>
              确认
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">
              当前状态：
              <Badge variant={getExceptionStatusBadgeVariant(exception.status)} className="ml-2">
                {getExceptionStatusText(exception.status)}
              </Badge>
              <span className="mx-2 text-gray-400">→</span>
              <Badge variant={getExceptionStatusBadgeVariant(nextStatusMap[exception.status]!)} className="ml-2">
                {getExceptionStatusText(nextStatusMap[exception.status]!)}
              </Badge>
            </p>
          </div>

          <Input
            label="处理备注"
            placeholder="请输入处理备注"
            value={actionRemark}
            onChange={(e) => setActionRemark(e.target.value)}
          />

          {nextStatusMap[exception.status] === 'resolved' && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                处理结果
              </label>
              <textarea
                className="w-full min-h-[100px] px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 hover:border-gray-300 resize-y"
                placeholder="请详细描述处理结果和后续措施"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <User className="w-3.5 h-3.5" />
            <span>操作人：{currentHandler}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
