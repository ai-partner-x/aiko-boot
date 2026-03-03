/**
 * SAP Fiori 风格 Shell Bar
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button, cn } from '@aff/admin-component';

export interface ShellBarProps {
  title?: string;
  logo?: React.ReactNode;
  userName?: string;
  notificationCount?: number;
  layoutMode: 'menu' | 'tile';
  onLayoutModeChange: (mode: 'menu' | 'tile') => void;
  onMenuToggle?: () => void;
  onLogout?: () => void;
}

export function ShellBar({
  title = 'SAP Clean Core',
  logo,
  userName = '用户',
  notificationCount = 0,
  layoutMode,
  onLayoutModeChange,
  onMenuToggle,
  onLogout,
}: ShellBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  return (
    <header className="fiori-shell-bar h-12 px-4 flex items-center justify-between sticky top-0 z-50">
      {/* 左侧 */}
      <div className="flex items-center gap-3">
        {layoutMode === 'menu' && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2">
          {logo || (
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center font-bold">
              S
            </div>
          )}
          <span className="font-semibold text-lg hidden sm:block">{title}</span>
        </Link>
      </div>

      {/* 中间搜索 */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="搜索应用..."
            className="w-full pl-10 pr-4 py-1.5 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40"
          />
        </div>
      </div>

      {/* 右侧工具栏 */}
      <div className="flex items-center gap-1">
        {/* 布局切换 */}
        <div className="flex items-center bg-white/10 rounded p-0.5 mr-2">
          <button
            onClick={() => onLayoutModeChange('tile')}
            className={cn(
              'p-1.5 rounded transition-colors',
              layoutMode === 'tile' ? 'bg-white/20' : 'hover:bg-white/10'
            )}
            title="磁贴视图"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onLayoutModeChange('menu')}
            className={cn(
              'p-1.5 rounded transition-colors',
              layoutMode === 'menu' ? 'bg-white/20' : 'hover:bg-white/10'
            )}
            title="菜单视图"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* 通知 */}
        <button className="p-2 rounded hover:bg-white/10 transition-colors relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 rounded hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:block text-sm">{userName}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>设置</span>
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default ShellBar;
