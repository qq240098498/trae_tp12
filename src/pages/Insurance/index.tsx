import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PawPrint,
  CreditCard,
  AlertCircle,
  FileCheck,
  Send,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  formatDate,
  formatPrice,
  getInsuranceTypeText,
  getInsuranceTypeColor,
  getInsuranceStatusText,
  getInsuranceStatusBadgeVariant,
  getClaimStatusText,
  getClaimStatusBadgeVariant,
  getClaimReasonText,
  getClaimReasonColor,
} from '@/utils';
import type {
  InsuranceProduct,
  InsurancePolicy,
  InsuranceClaim,
  InsuranceType,
} from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';

type TabType = 'products' | 'policies' | 'claims';

const insuranceTypeOptions = [
  { label: '基础版', value: 'basic' },
  { label: '标准版', value: 'standard' },
  { label: '尊享版', value: 'premium' },
];

interface ProductForm {
  name: string;
  type: string;
  description: string;
  coverage_rate: string;
  max_coverage: string;
  premium_rate: string;
  min_premium: string;
  deductible: string;
  is_active: boolean;
  coverage_items: string;
  exclusions: string;
}

const initialProductForm: ProductForm = {
  name: '',
  type: '',
  description: '',
  coverage_rate: '',
  max_coverage: '',
  premium_rate: '',
  min_premium: '',
  deductible: '',
  is_active: true,
  coverage_items: '',
  exclusions: '',
};

export default function InsuranceIndex() {
  const navigate = useNavigate();
  const {
    insuranceProducts,
    insurancePolicies,
    insuranceClaims,
    pets,
    customers,
    orders,
    addInsuranceProduct,
    updateInsuranceProduct,
    deleteInsuranceProduct,
    surrenderInsurancePolicy,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [searchText, setSearchText] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(initialProductForm);
  const [productErrors, setProductErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name || '-';
  const getCustomerName = (customerId: string) => customers.find((c) => c.id === customerId)?.name || '-';
  const getOrderNo = (orderId: string) => orders.find((o) => o.id === orderId)?.order_no || '-';
  const getProductName = (productId: string) => insuranceProducts.find((p) => p.id === productId)?.name || '-';
  const getPolicyNo = (policyId: string) => insurancePolicies.find((p) => p.id === policyId)?.policy_no || '-';

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return insuranceProducts;
    const keyword = searchText.trim().toLowerCase();
    return insuranceProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword),
    );
  }, [insuranceProducts, searchText]);

  const filteredPolicies = useMemo(() => {
    if (!searchText.trim()) return insurancePolicies;
    const keyword = searchText.trim().toLowerCase();
    return insurancePolicies.filter(
      (p) =>
        p.policy_no.toLowerCase().includes(keyword) ||
        getPetName(p.pet_id).toLowerCase().includes(keyword) ||
        getCustomerName(p.customer_id).toLowerCase().includes(keyword),
    );
  }, [insurancePolicies, searchText, pets, customers]);

  const filteredClaims = useMemo(() => {
    if (!searchText.trim()) return insuranceClaims;
    const keyword = searchText.trim().toLowerCase();
    return insuranceClaims.filter(
      (c) =>
        c.claim_no.toLowerCase().includes(keyword) ||
        c.title.toLowerCase().includes(keyword) ||
        getPolicyNo(c.policy_id).toLowerCase().includes(keyword),
    );
  }, [insuranceClaims, searchText, insurancePolicies]);

  const openAddProductModal = () => {
    setEditingProductId(null);
    setProductForm(initialProductForm);
    setProductErrors({});
    setProductModalOpen(true);
  };

  const openEditProductModal = (record: InsuranceProduct) => {
    setEditingProductId(record.id);
    setProductForm({
      name: record.name,
      type: record.type,
      description: record.description,
      coverage_rate: String(record.coverage_rate * 100),
      max_coverage: String(record.max_coverage),
      premium_rate: String(record.premium_rate * 100),
      min_premium: String(record.min_premium),
      deductible: String(record.deductible),
      is_active: record.is_active,
      coverage_items: record.coverage_items.join('，'),
      exclusions: record.exclusions.join('，'),
    });
    setProductErrors({});
    setProductModalOpen(true);
  };

  const handleProductChange = (field: keyof ProductForm, value: string | boolean) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
    if (productErrors[field]) {
      setProductErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateProductForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductForm, string>> = {};
    if (!productForm.name.trim()) newErrors.name = '请输入产品名称';
    if (!productForm.type) newErrors.type = '请选择产品类型';
    if (!productForm.coverage_rate || Number(productForm.coverage_rate) <= 0 || Number(productForm.coverage_rate) > 100)
      newErrors.coverage_rate = '请输入有效保障比例(1-100)';
    if (!productForm.max_coverage || Number(productForm.max_coverage) <= 0)
      newErrors.max_coverage = '请输入有效最高保额';
    if (!productForm.premium_rate || Number(productForm.premium_rate) <= 0 || Number(productForm.premium_rate) > 100)
      newErrors.premium_rate = '请输入有效费率(1-100)';
    if (!productForm.min_premium || Number(productForm.min_premium) < 0)
      newErrors.min_premium = '请输入有效最低保费';
    if (!productForm.deductible || Number(productForm.deductible) < 0)
      newErrors.deductible = '请输入有效免赔额';
    setProductErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductSubmit = () => {
    if (!validateProductForm()) return;
    const productData = {
      name: productForm.name.trim(),
      type: productForm.type as InsuranceType,
      description: productForm.description.trim(),
      coverage_rate: Number(productForm.coverage_rate) / 100,
      max_coverage: Number(productForm.max_coverage),
      premium_rate: Number(productForm.premium_rate) / 100,
      min_premium: Number(productForm.min_premium),
      deductible: Number(productForm.deductible),
      is_active: productForm.is_active,
      coverage_items: productForm.coverage_items.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      exclusions: productForm.exclusions.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    };
    if (editingProductId) {
      updateInsuranceProduct(editingProductId, productData);
    } else {
      addInsuranceProduct(productData);
    }
    setProductModalOpen(false);
  };

  const handleDeleteProduct = (record: InsuranceProduct) => {
    if (window.confirm(`确定删除保险产品「${record.name}」吗？`)) {
      deleteInsuranceProduct(record.id);
    }
  };

  const canSurrenderPolicy = (policy: InsurancePolicy) => {
    if (policy.status !== 'pending' && policy.status !== 'active') return false;
    if (policy.has_claimed) return false;
    const hasPendingClaim = insuranceClaims.some(
      (c) => c.policy_id === policy.id && (c.status === 'submitted' || c.status === 'reviewing'),
    );
    if (hasPendingClaim) return false;
    return true;
  };

  const calculateQuickRefund = (policy: InsurancePolicy): string => {
    const now = new Date();
    const effectiveDate = new Date(policy.effective_date);
    const expiryDate = new Date(policy.expiry_date);
    if (policy.status === 'pending' || now < effectiveDate) {
      return `全额退还 ${formatPrice(policy.premium_amount)}`;
    }
    const hoursElapsed = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed <= 24) {
      return `退还80% ${formatPrice(Math.round(policy.premium_amount * 0.8 * 100) / 100)}`;
    }
    if (now < expiryDate) {
      return `退还50% ${formatPrice(Math.round(policy.premium_amount * 0.5 * 100) / 100)}`;
    }
    return '不可退保';
  };

  const handleSurrenderPolicy = (record: InsurancePolicy) => {
    const refundInfo = calculateQuickRefund(record);
    const reason = window.prompt(
      `确定申请退保吗？\n保单编号：${record.policy_no}\n${refundInfo}\n\n请输入退保原因：`,
    );
    if (!reason) return;
    const result = surrenderInsurancePolicy(record.id, reason);
    if (!result.success) {
      alert(result.message);
    }
  };

  const productColumns = [
    {
      key: 'name',
      title: '产品名称',
      render: (record: InsuranceProduct) => (
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${record.type === 'premium' ? 'text-amber-500' : record.type === 'standard' ? 'text-blue-500' : 'text-gray-500'}`} />
          <span className="font-medium text-gray-800">{record.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      title: '类型',
      render: (record: InsuranceProduct) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getInsuranceTypeColor(record.type)}`}>
          {getInsuranceTypeText(record.type)}
        </span>
      ),
    },
    {
      key: 'coverage',
      title: '保障比例',
      align: 'center' as const,
      render: (record: InsuranceProduct) => `${(record.coverage_rate * 100).toFixed(0)}%`,
    },
    {
      key: 'max_coverage',
      title: '最高保额',
      align: 'right' as const,
      render: (record: InsuranceProduct) => formatPrice(record.max_coverage),
    },
    {
      key: 'premium_rate',
      title: '费率',
      align: 'center' as const,
      render: (record: InsuranceProduct) => `${(record.premium_rate * 100).toFixed(1)}%`,
    },
    {
      key: 'deductible',
      title: '免赔额',
      align: 'right' as const,
      render: (record: InsuranceProduct) => formatPrice(record.deductible),
    },
    {
      key: 'is_active',
      title: '状态',
      align: 'center' as const,
      render: (record: InsuranceProduct) => (
        <Badge variant={record.is_active ? 'success' : 'default'}>{record.is_active ? '启用中' : '已停用'}</Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: 160,
      render: (record: InsuranceProduct) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit2 className="w-4 h-4" />}
            onClick={() => openEditProductModal(record)}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDeleteProduct(record)}
            className="text-danger-500 hover:text-danger-600"
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const policyColumns = [
    {
      key: 'policy_no',
      title: '保单编号',
      render: (record: InsurancePolicy) => (
        <span className="font-mono text-xs text-gray-600">{record.policy_no}</span>
      ),
    },
    {
      key: 'pet',
      title: '宠物',
      render: (record: InsurancePolicy) => (
        <div className="flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-primary-500" />
          <span className="font-medium text-gray-800">{getPetName(record.pet_id)}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      title: '投保人',
      render: (record: InsurancePolicy) => getCustomerName(record.customer_id),
    },
    {
      key: 'product',
      title: '保险方案',
      render: (record: InsurancePolicy) => (
        <span className="text-sm text-gray-700">{getProductName(record.product_id)}</span>
      ),
    },
    {
      key: 'pet_value',
      title: '宠物估价',
      align: 'right' as const,
      render: (record: InsurancePolicy) => formatPrice(record.pet_value),
    },
    {
      key: 'coverage_amount',
      title: '保障额度',
      align: 'right' as const,
      render: (record: InsurancePolicy) => (
        <span className="font-medium text-primary-600">{formatPrice(record.coverage_amount)}</span>
      ),
    },
    {
      key: 'premium_amount',
      title: '保费',
      align: 'right' as const,
      render: (record: InsurancePolicy) => formatPrice(record.premium_amount),
    },
    {
      key: 'status',
      title: '状态',
      align: 'center' as const,
      render: (record: InsurancePolicy) => (
        <Badge variant={getInsuranceStatusBadgeVariant(record.status)}>
          {getInsuranceStatusText(record.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: 200,
      render: (record: InsurancePolicy) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/insurance/policies/${record.id}`)}
          >
            详情
          </Button>
          {canSurrenderPolicy(record) && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={() => handleSurrenderPolicy(record)}
              className="text-danger-500 hover:text-danger-600"
            >
              退保
            </Button>
          )}
        </div>
      ),
    },
  ];

  const claimColumns = [
    {
      key: 'claim_no',
      title: '理赔编号',
      render: (record: InsuranceClaim) => (
        <span className="font-mono text-xs text-gray-600">{record.claim_no}</span>
      ),
    },
    {
      key: 'reason',
      title: '理赔原因',
      render: (record: InsuranceClaim) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getClaimReasonColor(record.reason)}`}>
          {getClaimReasonText(record.reason)}
        </span>
      ),
    },
    {
      key: 'title',
      title: '理赔描述',
      render: (record: InsuranceClaim) => (
        <span className="font-medium text-gray-800 max-w-[200px] truncate block">{record.title}</span>
      ),
    },
    {
      key: 'policy_no',
      title: '关联保单',
      render: (record: InsuranceClaim) => (
        <span className="font-mono text-xs text-gray-500">{getPolicyNo(record.policy_id)}</span>
      ),
    },
    {
      key: 'pet',
      title: '宠物',
      render: (record: InsuranceClaim) => (
        <div className="flex items-center gap-1">
          <PawPrint className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm">{getPetName(record.pet_id)}</span>
        </div>
      ),
    },
    {
      key: 'claimed_amount',
      title: '申请金额',
      align: 'right' as const,
      render: (record: InsuranceClaim) => formatPrice(record.claimed_amount),
    },
    {
      key: 'approved_amount',
      title: '赔付金额',
      align: 'right' as const,
      render: (record: InsuranceClaim) => (
        <span className={record.approved_amount ? 'text-success-600 font-medium' : 'text-gray-400'}>
          {record.approved_amount != null ? formatPrice(record.approved_amount) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      align: 'center' as const,
      render: (record: InsuranceClaim) => (
        <Badge variant={getClaimStatusBadgeVariant(record.status)}>
          {getClaimStatusText(record.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: 160,
      render: (record: InsuranceClaim) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/insurance/claims/${record.id}`)}
          >
            详情
          </Button>
        </div>
      ),
    },
  ];

  const statsCards = [
    {
      key: 'products',
      label: '保险产品',
      value: insuranceProducts.length,
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      key: 'policies',
      label: '有效保单',
      value: insurancePolicies.filter((p) => p.status === 'active').length,
      icon: FileCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      key: 'pending_claims',
      label: '待处理理赔',
      value: insuranceClaims.filter((c) => c.status === 'submitted' || c.status === 'reviewing').length,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      key: 'total_premium',
      label: '累计保费',
      value: formatPrice(insurancePolicies.reduce((sum, p) => sum + p.premium_amount, 0)),
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  const tabs: { key: TabType; label: string; icon: typeof Shield }[] = [
    { key: 'products', label: '保险产品', icon: Shield },
    { key: 'policies', label: '我的保单', icon: FileText },
    { key: 'claims', label: '理赔管理', icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-500" />
          保险管理
        </h1>
        <p className="text-sm text-gray-500 mt-1">管理保险产品、保单与理赔流程</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索..."
                className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            {activeTab === 'products' && (
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAddProductModal}>
                新增产品
              </Button>
            )}
            {activeTab === 'claims' && (
              <Button leftIcon={<Send className="w-4 h-4" />} onClick={() => navigate('/insurance/claims/new')}>
                申请理赔
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Table<InsuranceProduct>
                  columns={productColumns}
                  data={filteredProducts}
                  rowKey="id"
                  emptyText="暂无保险产品"
                />
              </motion.div>
            )}
            {activeTab === 'policies' && (
              <motion.div
                key="policies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Table<InsurancePolicy>
                  columns={policyColumns}
                  data={filteredPolicies}
                  rowKey="id"
                  emptyText="暂无保单记录"
                />
              </motion.div>
            )}
            {activeTab === 'claims' && (
              <motion.div
                key="claims"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Table<InsuranceClaim>
                  columns={claimColumns}
                  data={filteredClaims}
                  rowKey="id"
                  emptyText="暂无理赔记录"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProductId ? '编辑保险产品' : '新增保险产品'}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleProductSubmit}>保存</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="产品名称"
              placeholder="请输入产品名称"
              value={productForm.name}
              onChange={(e) => handleProductChange('name', e.target.value)}
              error={productErrors.name}
            />
            <Select
              label="产品类型"
              placeholder="请选择产品类型"
              value={productForm.type}
              onChange={(e) => handleProductChange('type', e.target.value)}
              options={insuranceTypeOptions}
              error={productErrors.type}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">产品描述</label>
            <textarea
              value={productForm.description}
              onChange={(e) => handleProductChange('description', e.target.value)}
              placeholder="请输入产品描述"
              rows={2}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Input
              label="保障比例(%)"
              type="number"
              placeholder="例如: 80"
              value={productForm.coverage_rate}
              onChange={(e) => handleProductChange('coverage_rate', e.target.value)}
              error={productErrors.coverage_rate}
            />
            <Input
              label="最高保额(元)"
              type="number"
              placeholder="例如: 20000"
              value={productForm.max_coverage}
              onChange={(e) => handleProductChange('max_coverage', e.target.value)}
              error={productErrors.max_coverage}
            />
            <Input
              label="费率(%)"
              type="number"
              step="0.1"
              placeholder="例如: 5"
              value={productForm.premium_rate}
              onChange={(e) => handleProductChange('premium_rate', e.target.value)}
              error={productErrors.premium_rate}
            />
            <Input
              label="最低保费(元)"
              type="number"
              placeholder="例如: 50"
              value={productForm.min_premium}
              onChange={(e) => handleProductChange('min_premium', e.target.value)}
              error={productErrors.min_premium}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="免赔额(元)"
              type="number"
              placeholder="例如: 100"
              value={productForm.deductible}
              onChange={(e) => handleProductChange('deductible', e.target.value)}
              error={productErrors.deductible}
            />
            <div className="flex items-center h-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(e) => handleProductChange('is_active', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">启用此产品</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              保障范围 <span className="text-xs text-gray-400">(用逗号分隔)</span>
            </label>
            <textarea
              value={productForm.coverage_items}
              onChange={(e) => handleProductChange('coverage_items', e.target.value)}
              placeholder="例如: 意外伤害，意外身故，医疗费用"
              rows={2}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              免责条款 <span className="text-xs text-gray-400">(用逗号分隔)</span>
            </label>
            <textarea
              value={productForm.exclusions}
              onChange={(e) => handleProductChange('exclusions', e.target.value)}
              placeholder="例如: 先天性疾病，既往症，故意行为"
              rows={2}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
