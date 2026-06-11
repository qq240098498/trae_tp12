import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PawPrint,
  Route,
  Tags,
  Truck,
  ShoppingCart,
  CalendarClock,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: '首页仪表板', path: '/', icon: LayoutDashboard },
  { label: '宠物管理', path: '/pets', icon: PawPrint },
  { label: '运输路线', path: '/routes', icon: Route },
  { label: '价格维护', path: '/pricing', icon: Tags },
  { label: '车辆管理', path: '/vehicles', icon: Truck },
  { label: '订单中心', path: '/orders', icon: ShoppingCart },
  { label: '运输调度', path: '/dispatch', icon: CalendarClock },
  { label: '保险管理', path: '/insurance', icon: Shield },
  { label: '异常处理', path: '/exceptions', icon: AlertTriangle },
  { label: '员工管理', path: '/employees', icon: Users },
];

export default function Sidebar({ isOpen, isMobile, onToggle }: SidebarProps) {
  const location = useLocation();

  const sidebarVariants = {
    open: { width: isMobile ? '100%' : 256, x: 0 },
    closed: {
      width: isMobile ? '100%' : 80,
      x: isMobile ? '-100%' : 0,
    },
  };

  return (
    <>
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed left-0 top-0 h-screen z-50',
          'bg-white border-r border-gray-100 shadow-card',
          'flex flex-col',
          isMobile ? 'max-w-xs' : ''
        )}
      >
        <div
          className={cn(
            'h-16 flex items-center border-b border-gray-100 px-4',
            isOpen ? 'justify-between' : 'justify-center'
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="logo-expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-800">
                  宠物运输
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft"
              >
                <PawPrint className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
              !isOpen && 'w-full justify-center'
            )}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onToggle()}
              >
                {({ isActive: navActive }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      'relative flex items-center rounded-xl cursor-pointer transition-all duration-200',
                      isOpen ? 'h-11 px-3' : 'h-11 justify-center',
                      navActive
                        ? 'bg-primary-50 text-primary-600 font-medium shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        navActive ? 'text-primary-500' : ''
                      )}
                    />
                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-3 whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {navActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-500"
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div
            className={cn(
              'flex items-center rounded-xl p-2 bg-gray-50',
              isOpen ? '' : 'justify-center'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-medium flex-shrink-0">
              A
            </div>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 overflow-hidden"
                >
                  <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                    管理员
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    admin@example.com
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
