/**
 * 菜单式布局 - 传统侧边栏导航
 */

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Home,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  BarChart3,
  Package,
  Truck,
  CreditCard,
  Database,
} from 'lucide-react';
import { cn } from '@aff/admin-component';
import ShellBar from '../components/ShellBar';

// 菜单配置
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: <Home className="h-5 w-5" />,
    path: '/',
  },
  {
    id: 'procurement',
    label: 'MM-采购',
    icon: <ShoppingCart className="h-5 w-5" />,
    children: [
      { id: 'pr-list', label: '采购申请', path: '/purchase-requisitions' },
      { id: 'pr-create', label: '创建采购申请', path: '/purchase-requisitions/create' },
      { id: 'po-list', label: '采购订单', path: '/purchase-orders' },
      { id: 'gr-list', label: '收货管理', path: '/goods-receipt' },
    ],
  },
  {
    id: 'master-data',
    label: '主数据',
    icon: <Database className="h-5 w-5" />,
    children: [
      { id: 'materials', label: '物料主数据', path: '/master-data/materials' },
      { id: 'suppliers', label: '供应商', path: '/master-data/suppliers' },
      { id: 'cost-centers', label: '成本中心', path: '/master-data/cost-centers' },
    ],
  },
  {
    id: 'reports',
    label: '报表分析',
    icon: <BarChart3 className="h-5 w-5" />,
    children: [
      { id: 'pr-report', label: '采购申请报表', path: '/reports/purchase-requisitions' },
      { id: 'po-report', label: '采购订单报表', path: '/reports/purchase-orders' },
    ],
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings',
  },
];

interface MenuLayoutProps {
  onLayoutModeChange: (mode: 'menu' | 'tile') => void;
}

export function MenuLayout({ onLayoutModeChange }: MenuLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['procurement']);
  const location = useLocation();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    return (
      <div key={item.id}>
        {item.path && !hasChildren ? (
          <Link
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-colors',
              level > 0 && 'ml-6',
              active
                ? 'bg-[rgb(var(--fiori-primary-light))] text-[rgb(var(--fiori-primary-dark))] font-medium'
                : 'text-[rgb(var(--fiori-text-primary))] hover:bg-[rgb(var(--fiori-grey-100))]'
            )}
          >
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
            {item.badge && sidebarOpen && (
              <span className="ml-auto px-2 py-0.5 bg-[rgb(var(--fiori-primary))] text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpand(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-colors',
              'text-[rgb(var(--fiori-text-primary))] hover:bg-[rgb(var(--fiori-grey-100))]'
            )}
          >
            {item.icon}
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </>
            )}
          </button>
        )}

        {/* 子菜单 */}
        {hasChildren && isExpanded && sidebarOpen && (
          <div className="mt-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--fiori-background))]">
      <ShellBar
        layoutMode="menu"
        onLayoutModeChange={onLayoutModeChange}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={cn(
            'bg-white border-r border-[rgb(var(--fiori-grey-200))] transition-all duration-300 flex-shrink-0',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
          style={{ height: 'calc(100vh - 48px)', position: 'sticky', top: 48 }}
        >
          <nav className="py-4 overflow-y-auto h-full">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6 min-h-[calc(100vh-48px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MenuLayout;
