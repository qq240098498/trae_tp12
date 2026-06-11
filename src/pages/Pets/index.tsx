import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  PawPrint,
  User,
  Phone,
  MapPin,
  Filter,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/Empty';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export default function Pets() {
  const navigate = useNavigate();
  const { pets, customers, deletePet } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);

  const speciesOptions = useMemo(() => {
    const speciesSet = new Set(pets.map((p) => p.species));
    return Array.from(speciesSet).map((s) => ({ label: s, value: s }));
  }, [pets]);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch =
        !searchText ||
        pet.name.toLowerCase().includes(searchLower) ||
        pet.breed.toLowerCase().includes(searchLower);
      const matchSpecies = !speciesFilter || pet.species === speciesFilter;
      return matchSearch && matchSpecies;
    });
  }, [pets, searchText, speciesFilter]);

  const getCustomerById = (customerId: string) => customers.find((c) => c.id === customerId);

  const handleDeleteClick = (petId: string) => {
    setDeletingPetId(petId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingPetId) {
      deletePet(deletingPetId);
      setDeletingPetId(null);
      setDeleteModalOpen(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">宠物管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有注册的宠物档案</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/pets/new')}>
          新增宠物
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="搜索宠物名称或品种..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                searchText ? (
                  <button onClick={() => setSearchText('')} className="hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                ) : null
              }
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              placeholder="全部种类"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              options={speciesOptions}
            />
          </div>
        </div>
      </Card>

      {filteredPets.length === 0 ? (
        <Card>
          <Empty
            icon={<PawPrint className="w-16 h-16 text-gray-300" />}
            title="暂无宠物数据"
            description={searchText || speciesFilter ? '没有找到匹配的宠物，请调整筛选条件' : '点击"新增宠物"添加第一个宠物档案'}
          />
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredPets.map((pet) => {
              const customer = getCustomerById(pet.customer_id);
              return (
                <motion.div
                  key={pet.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <PawPrint className="w-8 h-8 text-primary-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 truncate">{pet.name}</h3>
                            <p className="text-sm text-gray-500">{pet.breed}</p>
                          </div>
                          <Badge variant={pet.species === '狗' ? 'info' : pet.species === '猫' ? 'warning' : 'default'}>
                            {pet.species}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                          <span>{pet.gender}</span>
                          <span>·</span>
                          <span>{pet.age}岁</span>
                          <span>·</span>
                          <span>{pet.weight_kg}kg</span>
                        </div>
                      </div>
                    </div>

                    {customer && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{customer.address}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => navigate(`/pets/${pet.id}`)}
                        className="flex-1"
                      >
                        详情
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit2 className="w-4 h-4" />}
                        onClick={() => navigate(`/pets/${pet.id}/profile/edit`)}
                        className="flex-1"
                      >
                        编辑
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDeleteClick(pet.id)}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="确认删除"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-gray-600">确定要删除这个宠物档案吗？相关的运输历史和爱好档案也会被一并删除，此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
