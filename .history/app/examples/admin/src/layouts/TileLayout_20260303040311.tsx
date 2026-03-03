/**
 * 磁贴式布局 - SAP Fiori Launchpad 风格
 */

import { useState, useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  FileText,
  Package,
  Truck,
  CreditCard,
  Database,
  Settings,
  BarChart3,
  Star,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { cn, Button, Card } from '@aff/admin-component';
import ShellBar from '../components/ShellBar';

// 应用磁贴配置
export interface AppTile {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  iconColor: string;
  path: string;
  category: string;
  badge?: { label: string; color: string };
}

const appTiles: AppTile[] = [
  // MM-采购
  {
    id: 'pr-create',
    title: '创建采购申请',
    subtitle: '发起新的采购需求',
    description: '创建标准采购申请，支持物料和服务采购',
    icon: <FileText className="h-8 w-8" />,
    iconColor: '#0073e6',
    path: '/purchase-requisitions/create',
    category: 'MM-采购',
    badge: { label: '新', color: 'bg-green-500' },
  },
  {
    id: 'pr-list',
    title: '管理采购申请',
    subtitle: 'F1643 - 采购申请管理',
    description: '查看、编辑和管理所有采购申请',
    icon: <ShoppingCart className="h-8 w-8" />,
    iconColor: '#1976d2',
    path: '/purchase-requisitions',
    category: 'MM-采购',
    badge: { label: '核心', color: 'bg-blue-500' },
  },
  {
    id: 'po-list',
    title: '采购订单',
    subtitle: 'ME21N - 采购订单管理',
    description: '查看和管理采购订单',
    icon: <Package className="h-8 w-8" />,
    iconColor: '#388e3c',
    path: '/purchase-orders',
    category: 'MM-采购',
  },
  {
    id: 'gr-list',
    title: '收货管理',
    subtitle: 'MIGO - 货物移动',
    description: '处理货物接收和库存移动',
    icon: <Truck className="h-8 w-8" />,
    iconColor: '#f57c00',
    path: '/goods-receipt',
    category: 'MM-采购',
  },
  // 主数据
  {
    id: 'materials',
    title: '物料主数据',
    subtitle: 'F2018 - 物料管理',
    description: '管理物料基本信息',
    icon: <Database className="h-8 w-8" />,
    iconColor: '#7b1fa2',
    path: '/master-data/materials',
    category: '主数据',
  },
  {
    id: 'suppliers',
    title: '供应商管理',
    subtitle: 'F0002 - 供应商',
    description: '管理供应商信息',
    icon: <Database className="h-8 w-8" />,
    iconColor: '#00796b',
    path: '/master-data/suppliers',
    category: '主数据',
  },
  // 报表
  {
    id: 'reports',
    title: '报表分析',
    subtitle: '数据分析和报表',
    description: '查看各类业务报表',
    icon: <BarChart3 className="h-8 w-8" />,
    iconColor: '#c2185b',
    path: '/reports',
    category: '报表分析',
  },
  // 系统
  {
    id: 'settings',
    title: '系统设置',
    subtitle: '配置和管理',
    description: '系统配置和用户管理',
    icon: <Settings className="h-8 w-8" />,
    iconColor: '#5d4037',
    path: '/settings',
    category: '系统管理',
  },
];

// 分类配置
const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  'MM-采购': { icon: <ShoppingCart className="h-5 w-5" />, color: '#1976d2' },
  '主数据': { icon: <Database className="h-5 w-5" />, color: '#7b1fa2' },
  '报表分析': { icon: <BarChart3 className="h-5 w-5" />, color: '#c2185b' },
  '系统管理': { icon: <Settings className="h-5 w-5" />, color: '#5d4037' },
};

interface TileLayoutProps {
  onLayoutModeChange: (mode: 'menu' | 'tile') => void;
}

export function TileLayout({ onLayoutModeChange }: TileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [favorites, setFavorites] = useState<string[]>(['pr-create', 'pr-list']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'all'>('favorites');

  // 是否在首页
  const isHome = location.pathname === '/';

  // 按分类组织磁贴
  const tilesByCategory = useMemo(() => {
    const filtered = searchQuery
      ? appTiles.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : appTiles;

    const categories = new Map<string, AppTile[]>();
    filtered.forEach((tile) => {
      const cat = tile.category;
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat)!.push(tile);
    });
    return Array.from(categories.entries());
  }, [searchQuery]);

  const favoriteApps = appTiles.filter((t) => favorites.includes(t.id));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderTile = (tile: AppTile, index: number) => (
    <div
      key={tile.id}
      className="tile-animate"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Card
        className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
        onClick={() => navigate(tile.path)}
      >
        {/* 背景装饰 */}
        <div
          className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: tile.iconColor }}
        />

        <div className="p-5">
          {/* 图标和收藏 */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${tile.iconColor}15` }}
            >
              <div style={{ color: tile.iconColor }}>{tile.icon}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(tile.id);
              }}
              className={cn(
                'p-1.5 rounded-full transition-colors',
                favorites.includes(tile.id)
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'
              )}
            >
              <Star
                className="h-5 w-5"
                fill={favorites.includes(tile.id) ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* 标题 */}
          <h3 className="font-semibold text-[rgb(var(--fiori-text-primary))] mb-1">
            {tile.title}
          </h3>
          <p className="text-sm text-[rgb(var(--fiori-text-secondary))] mb-2">
            {tile.subtitle}
          </p>
          {tile.description && (
            <p className="text-xs text-[rgb(var(--fiori-grey-500))] line-clamp-2">
              {tile.description}
            </p>
          )}

          {/* 徽章 */}
          {tile.badge && (
            <span
              className={cn(
                'absolute top-3 right-3 px-2 py-0.5 text-xs text-white rounded-full',
                tile.badge.color
              )}
            >
              {tile.badge.label}
            </span>
          )}
        </div>
      </Card>
    </div>
  );

  // 如果不在首页，显示内容页
  if (!isHome) {
    return (
      <div className="min-h-screen bg-[rgb(var(--fiori-background))]">
        <ShellBar layoutMode="tile" onLayoutModeChange={onLayoutModeChange} />
        <main className="p-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回门户
          </Button>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--fiori-background))]">
      <ShellBar layoutMode="tile" onLayoutModeChange={onLayoutModeChange} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 欢迎横幅 */}
        <div className="bg-gradient-to-r from-[rgb(var(--fiori-primary))] to-[#17846d] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full bg-white/10" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">欢迎使用 SAP Clean Core 门户</h1>
            <p className="text-white/90 text-lg">
              企业级应用统一入口 - 现代化、智能化、标准化
            </p>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {favoriteApps.length} 个收藏
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {appTiles.length} 个应用
              </span>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-xl shadow-sm border border-[rgb(var(--fiori-grey-200))] mb-6">
          <div className="flex border-b border-[rgb(var(--fiori-grey-200))]">
            <button
              onClick={() => setActiveTab('favorites')}
              className={cn(
                'px-6 py-4 flex items-center gap-2 border-b-2 -mb-px transition-colors',
                activeTab === 'favorites'
                  ? 'border-[rgb(var(--fiori-primary))] text-[rgb(var(--fiori-primary))]'
                  : 'border-transparent text-[rgb(var(--fiori-text-secondary))] hover:text-[rgb(var(--fiori-primary))]'
              )}
            >
              <Star className="h-5 w-5" />
              <span>收藏夹</span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {favoriteApps.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={cn(
                'px-6 py-4 flex items-center gap-2 border-b-2 -mb-px transition-colors',
                activeTab === 'recent'
                  ? 'border-[rgb(var(--fiori-primary))] text-[rgb(var(--fiori-primary))]'
                  : 'border-transparent text-[rgb(var(--fiori-text-secondary))] hover:text-[rgb(var(--fiori-primary))]'
              )}
            >
              <Clock className="h-5 w-5" />
              <span>最近使用</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-6 py-4 flex items-center gap-2 border-b-2 -mb-px transition-colors',
                activeTab === 'all'
                  ? 'border-[rgb(var(--fiori-primary))] text-[rgb(var(--fiori-primary))]'
                  : 'border-transparent text-[rgb(var(--fiori-text-secondary))] hover:text-[rgb(var(--fiori-primary))]'
              )}
            >
              <Home className="h-5 w-5" />
              <span>所有应用</span>
            </button>
          </div>
        </div>

        {/* 内容区 */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteApps.length > 0 ? (
              favoriteApps.map((tile, i) => renderTile(tile, i))
            ) : (
              <div className="col-span-full text-center py-12 text-[rgb(var(--fiori-text-secondary))]">
                您还没有收藏任何应用，点击磁贴上的星标图标添加收藏
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {appTiles.slice(0, 6).map((tile, i) => renderTile(tile, i))}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-8">
            {tilesByCategory.map(([category, tiles]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${categoryConfig[category]?.color || '#666'}15`,
                      color: categoryConfig[category]?.color || '#666',
                    }}
                  >
                    {categoryConfig[category]?.icon || <Home className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[rgb(var(--fiori-text-primary))]">
                      {category}
                    </h2>
                    <p className="text-sm text-[rgb(var(--fiori-text-secondary))]">
                      {tiles.length} 个应用
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tiles.map((tile, i) => renderTile(tile, i))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TileLayout;
