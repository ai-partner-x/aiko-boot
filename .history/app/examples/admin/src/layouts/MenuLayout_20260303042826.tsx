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
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 6.5l6.5-4.5 6.5 4.5v8a1 1 0 01-1 1h-11a1 1 0 01-1-1v-8z" />
      <path d="M6.5 15.5v-6h5v6" />
    </svg>
  ),
  cart: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="15.5" r="1" />
      <circle cx="14" cy="15.5" r="1" />
      <path d="M1 1h2.5l2 10.5a1.5 1.5 0 001.5 1h7a1.5 1.5 0 001.5-1L17 4.5H4.5" />
    </svg>
  ),
  database: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="9" cy="3.5" rx="6" ry="2" />
      <path d="M15 3.5v5c0 1.1-2.7 2-6 2s-6-.9-6-2v-5" />
      <path d="M15 8.5v5c0 1.1-2.7 2-6 2s-6-.9-6-2v-5" />
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 14.5V7M9 14.5V3.5M4 14.5v-4" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="2" />
      <path d="M14.5 9a5.5 5.5 0 01-.3 1.8l1.3.8a.5.5 0 01.1.6l-1.3 2.2a.5.5 0 01-.6.2l-1.4-.6a5.5 5.5 0 01-1.5.9l-.2 1.5a.5.5 0 01-.5.4h-2.4a.5.5 0 01-.5-.4l-.2-1.5a5.5 5.5 0 01-1.5-.9l-1.4.6a.5.5 0 01-.6-.2L2.2 12.2a.5.5 0 01.1-.6l1.3-.8a5.5 5.5 0 010-3.6l-1.3-.8a.5.5 0 01-.1-.6l1.3-2.2a.5.5 0 01.6-.2l1.4.6a5.5 5.5 0 011.5-.9l.2-1.5a.5.5 0 01.5-.4h2.4a.5.5 0 01.5.4l.2 1.5a5.5 5.5 0 011.5.9l1.4-.6a.5.5 0 01.6.2l1.3 2.2a.5.5 0 01-.1.6l-1.3.8a5.5 5.5 0 01.3 1.8z" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.5 5.5l3.5 3 3.5-3" strokeLinecap="round" strokeLinejoin="round" />
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
  group?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: MenuIcons.home,
    path: '/',
    group: 'main',
  },
  {
    id: 'procurement',
    label: 'MM-采购',
    icon: MenuIcons.cart,
    group: 'business',
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
    group: 'business',
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
    group: 'analytics',
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
    group: 'system',
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
    if (path === '/') return location.pathname === '/';
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
              'flex items-center gap-3 px-3 py-2 mx-2 rounded-md transition-all duration-150 group',
              level > 0 ? 'ml-4 pl-8 text-[13px]' : '',
              active
                ? 'bg-[#e8f4fc] text-[#0064d9]'
                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            )}
          >
            {level === 0 && (
              <span className={cn(
                'flex-shrink-0 transition-colors',
                active ? 'text-[#0064d9]' : 'text-gray-400 group-hover:text-gray-500'
              )}>
                {item.icon}
              </span>
            )}
            {level > 0 && (
              <span className={cn(
                'absolute left-6 w-[3px] h-[3px] rounded-full transition-colors',
                active ? 'bg-[#0064d9]' : 'bg-gray-300'
              )} />
            )}
            <span className={cn(
              'flex-1 transition-colors',
              active && 'font-medium'
            )}>
              {sidebarOpen && item.label}
            </span>
            {item.badge && sidebarOpen && (
              <span className="px-1.5 py-0.5 bg-[#0064d9] text-white text-[10px] rounded font-medium">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpand(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 mx-2 rounded-md transition-all duration-150 group',
              parentActive
                ? 'text-[#0064d9]'
                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            )}
          >
            <span className={cn(
              'flex-shrink-0 transition-colors',
              parentActive ? 'text-[#0064d9]' : 'text-gray-400 group-hover:text-gray-500'
            )}>
              {item.icon}
            </span>
            {sidebarOpen && (
              <>
                <span className={cn(
                  'flex-1 text-left transition-colors',
                  parentActive && 'font-medium'
                )}>
                  {item.label}
                </span>
                {hasChildren && (
                  <span className={cn(
                    'text-gray-400 transition-transform duration-200 flex-shrink-0',
                    isExpanded && 'rotate-180'
                  )}>
                    {MenuIcons.chevronDown}
                  </span>
                )}
              </>
            )}
          </button>
        )}

        {/* 子菜单 - 带连接线 */}
        {hasChildren && sidebarOpen && (
          <div
            className={cn(
              'relative overflow-hidden transition-all duration-200',
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            {/* 垂直连接线 */}
            <div className="absolute left-[26px] top-0 bottom-2 w-px bg-gray-200" />
            
            <div className="pt-1 pb-1">
              {item.children!.map((child, index) => {
                const childActive = isActive(child.path);
                return (
                  <Link
                    key={child.id}
                    to={child.path || '#'}
                    className={cn(
                      'relative flex items-center pl-10 pr-3 py-2 mx-2 rounded-md text-[13px] transition-all duration-150 group',
                      childActive
                        ? 'bg-[#e8f4fc] text-[#0064d9] font-medium'
                        : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-700'
                    )}
                  >
                    {/* 水平连接线 + 圆点 */}
                    <span 
                      className={cn(
                        'absolute left-[26px] top-1/2 w-4 h-px',
                        childActive ? 'bg-[#0064d9]/30' : 'bg-gray-200'
                      )} 
                    />
                    <span 
                      className={cn(
                        'absolute left-[42px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border-2 transition-colors',
                        childActive 
                          ? 'bg-[#0064d9] border-[#0064d9]' 
                          : 'bg-white border-gray-300 group-hover:border-gray-400'
                      )} 
                    />
                    <span className="ml-4">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 按组分类
  const mainItems = menuItems.filter(i => i.group === 'main');
  const businessItems = menuItems.filter(i => i.group === 'business');
  const analyticsItems = menuItems.filter(i => i.group === 'analytics');
  const systemItems = menuItems.filter(i => i.group === 'system');

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <ShellBar
        layoutMode="menu"
        onLayoutModeChange={onLayoutModeChange}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={cn(
            'bg-white border-r border-gray-200/80 transition-all duration-300 flex-shrink-0',
            sidebarOpen ? 'w-56' : 'w-14'
          )}
          style={{ height: 'calc(100vh - 44px)', position: 'sticky', top: 44 }}
        >
          <nav className="py-3 overflow-y-auto h-full">
            {/* 主导航 */}
            <div className="space-y-0.5">
              {mainItems.map((item) => renderMenuItem(item))}
            </div>
            
            {/* 分隔线 */}
            {sidebarOpen && (
              <div className="mx-4 my-3 border-t border-gray-100" />
            )}
            
            {/* 业务模块 */}
            {sidebarOpen && (
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  业务模块
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {businessItems.map((item) => renderMenuItem(item))}
            </div>
            
            {/* 分隔线 */}
            {sidebarOpen && (
              <div className="mx-4 my-3 border-t border-gray-100" />
            )}
            
            {/* 分析 */}
            {sidebarOpen && (
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  分析报表
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {analyticsItems.map((item) => renderMenuItem(item))}
            </div>
            
            {/* 分隔线 */}
            {sidebarOpen && (
              <div className="mx-4 my-3 border-t border-gray-100" />
            )}
            
            {/* 系统 */}
            <div className="space-y-0.5">
              {systemItems.map((item) => renderMenuItem(item))}
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
