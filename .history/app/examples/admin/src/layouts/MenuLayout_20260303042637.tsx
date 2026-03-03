/**
 * 菜单式布局 - 传统侧边栏导航
 * Fiori 风格优化版
 */

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@aff/admin-component';
import ShellBar from '../components/ShellBar';

// 自定义菜单图标
const MenuIcons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7.5l7-5 7 5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-9z" />
      <path d="M7.5 18V10h5v8" />
    </svg>
  ),
  cart: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7.5" cy="17" r="1" />
      <circle cx="15.5" cy="17" r="1" />
      <path d="M1 1h3l2.4 12a1.5 1.5 0 001.5 1.2h8.1a1.5 1.5 0 001.5-1.2L19 5H5" />
    </svg>
  ),
  database: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="10" cy="4" rx="7" ry="2.5" />
      <path d="M17 4v6c0 1.4-3.1 2.5-7 2.5S3 11.4 3 10V4" />
      <path d="M17 10v6c0 1.4-3.1 2.5-7 2.5S3 17.4 3 16v-6" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 16V8M10 16V4M5 16v-5" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M16.4 12.5a1.3 1.3 0 00.3 1.4l.05.05a1.6 1.6 0 11-2.3 2.3l-.05-.05a1.3 1.3 0 00-1.4-.3 1.3 1.3 0 00-.8 1.2v.15a1.6 1.6 0 11-3.2 0v-.08a1.3 1.3 0 00-.85-1.2 1.3 1.3 0 00-1.4.3l-.05.05a1.6 1.6 0 11-2.3-2.3l.05-.05a1.3 1.3 0 00.3-1.4 1.3 1.3 0 00-1.2-.8h-.15a1.6 1.6 0 110-3.2h.08a1.3 1.3 0 001.2-.85 1.3 1.3 0 00-.3-1.4l-.05-.05a1.6 1.6 0 112.3-2.3l.05.05a1.3 1.3 0 001.4.3h.07a1.3 1.3 0 00.8-1.2v-.15a1.6 1.6 0 013.2 0v.08a1.3 1.3 0 00.8 1.2 1.3 1.3 0 001.4-.3l.05-.05a1.6 1.6 0 112.3 2.3l-.05.05a1.3 1.3 0 00-.3 1.4v.07a1.3 1.3 0 001.2.8h.15a1.6 1.6 0 010 3.2h-.08a1.3 1.3 0 00-1.2.8z" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

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
    icon: MenuIcons.home,
    path: '/',
  },
  {
    id: 'procurement',
    label: 'MM-采购',
    icon: MenuIcons.cart,
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
    icon: MenuIcons.database,
    children: [
      { id: 'materials', label: '物料主数据', path: '/master-data/materials' },
      { id: 'suppliers', label: '供应商', path: '/master-data/suppliers' },
      { id: 'cost-centers', label: '成本中心', path: '/master-data/cost-centers' },
    ],
  },
  {
    id: 'reports',
    label: '报表分析',
    icon: MenuIcons.chart,
    children: [
      { id: 'pr-report', label: '采购申请报表', path: '/reports/purchase-requisitions' },
      { id: 'po-report', label: '采购订单报表', path: '/reports/purchase-orders' },
    ],
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: MenuIcons.settings,
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

  const isParentActive = (item: MenuItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);
    const parentActive = isParentActive(item);

    return (
      <div key={item.id}>
        {item.path && !hasChildren ? (
          <Link
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-150',
              level > 0 && 'ml-9 text-sm',
              active
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {level === 0 && (
              <span className={active ? 'text-blue-600' : 'text-gray-400'}>
                {item.icon}
              </span>
            )}
            {level > 0 && (
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                active ? 'bg-blue-600' : 'bg-gray-300'
              )} />
            )}
            {sidebarOpen && <span>{item.label}</span>}
            {item.badge && sidebarOpen && (
              <span className="ml-auto px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpand(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-150',
              parentActive
                ? 'text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span className={parentActive ? 'text-blue-600' : 'text-gray-400'}>
              {item.icon}
            </span>
            {sidebarOpen && (
              <>
                <span className={cn('flex-1 text-left', parentActive && 'font-medium')}>
                  {item.label}
                </span>
                {hasChildren && (
                  <span className={cn(
                    'transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}>
                    {MenuIcons.chevronDown}
                  </span>
                )}
              </>
            )}
          </button>
        )}

        {/* 子菜单 */}
        {hasChildren && sidebarOpen && (
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
            )}
          >
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShellBar
        layoutMode="menu"
        onLayoutModeChange={onLayoutModeChange}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={cn(
            'bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0',
            sidebarOpen ? 'w-60' : 'w-16'
          )}
          style={{ height: 'calc(100vh - 44px)', position: 'sticky', top: 44 }}
        >
          <nav className="py-3 overflow-y-auto h-full">
            <div className="space-y-0.5">
              {menuItems.map((item) => renderMenuItem(item))}
            </div>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6 min-h-[calc(100vh-44px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MenuLayout;
