import { useState } from 'react';
import { Plus, Edit2, Power, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';
import type { Employee, EmployeeRole } from '@/types';

interface EmployeeForm {
  name: string;
  employee_no: string;
  phone: string;
  role: string;
  is_available: string;
}

const initialForm: EmployeeForm = {
  name: '',
  employee_no: '',
  phone: '',
  role: '',
  is_available: 'true',
};

const roleOptions = [
  { label: '司机', value: '司机' },
  { label: '调度员', value: '调度员' },
  { label: '管理员', value: '管理员' },
];

export default function EmployeesIndex() {
  const employees = useAppStore((state) => state.employees);
  const addEmployee = useAppStore((state) => state.addEmployee);
  const updateEmployee = useAppStore((state) => state.updateEmployee);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeForm, string>>>({});

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (record: Employee) => {
    setEditingId(record.id);
    setForm({
      name: record.name,
      employee_no: record.employee_no,
      phone: record.phone,
      role: record.role,
      is_available: String(record.is_available),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (field: keyof EmployeeForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeForm, string>> = {};

    if (!form.name.trim()) newErrors.name = '请输入姓名';
    if (!form.employee_no.trim()) newErrors.employee_no = '请输入工号';
    if (!form.phone.trim()) newErrors.phone = '请输入手机号';
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }
    if (!form.role) newErrors.role = '请选择角色';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const employeeData = {
      name: form.name.trim(),
      employee_no: form.employee_no.trim(),
      phone: form.phone.trim(),
      role: form.role as EmployeeRole,
      is_available: form.is_available === 'true',
    };

    if (editingId) {
      updateEmployee(editingId, employeeData);
    } else {
      addEmployee(employeeData);
    }

    setModalOpen(false);
  };

  const handleToggleAvailable = (record: Employee) => {
    updateEmployee(record.id, { is_available: !record.is_available });
  };

  const columns = [
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name' as const,
      render: (record: Employee) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-800">{record.name}</span>
        </div>
      ),
    },
    { key: 'employee_no', title: '工号', dataIndex: 'employee_no' as const },
    { key: 'phone', title: '手机号', dataIndex: 'phone' as const },
    {
      key: 'role',
      title: '角色',
      align: 'center' as const,
      render: (record: Employee) => (
        <Badge variant="info">{record.role}</Badge>
      ),
    },
    {
      key: 'is_available',
      title: '接单状态',
      align: 'center' as const,
      render: (record: Employee) => (
        <Badge variant={record.is_available ? 'success' : 'default'}>
          {record.is_available ? '可接单' : '不可接单'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: 200,
      render: (record: Employee) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit2 className="w-4 h-4" />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Power className="w-4 h-4" />}
            onClick={() => handleToggleAvailable(record)}
          >
            {record.is_available ? '停用' : '启用'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">员工管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理员工信息和接单状态</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          新增员工
        </Button>
      </motion.div>

      <Card>
        <Table<Employee>
          columns={columns}
          data={employees}
          rowKey="id"
          emptyText="暂无员工数据"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '编辑员工' : '新增员工'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>保存</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="姓名"
              placeholder="请输入姓名"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
            />
            <Input
              label="工号"
              placeholder="请输入工号"
              value={form.employee_no}
              onChange={(e) => handleChange('employee_no', e.target.value)}
              error={errors.employee_no}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="手机号"
              placeholder="请输入手机号"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
            />
            <Select
              label="角色"
              placeholder="请选择角色"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              options={roleOptions}
              error={errors.role}
            />
          </div>
          <Select
            label="接单状态"
            value={form.is_available}
            onChange={(e) => handleChange('is_available', e.target.value)}
            options={[
              { label: '可接单', value: 'true' },
              { label: '不可接单', value: 'false' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
