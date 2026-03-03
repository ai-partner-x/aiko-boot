/**
 * AI-First Framework Shell Bar
 * 基于 SAP Fiori Launchpad Shell Bar 设计规范
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  LayoutGrid,
  List,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@aff/admin-component';

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
  title = 'AI-First',
  logo,
  userName = '用户',
  notificationCount = 3,
  layoutMode,
  onLayoutModeChange,
  onMenuToggle,
  onLogout,
}: ShellBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header 
      className="h-11 px-4 flex items-center justify-between sticky top-0 z-50"
      style={{ backgroundColor: '#354a5f' }}
    >
      {/* 左侧 - Logo 和标题 */}
      <div className="flex items-center gap-3">
        {layoutMode === 'menu' && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded hover:bg-white/10 transition-colors text-white"
            title="切换菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          {logo || (
            <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: '#0070f2' }}>
              S
            </div>
          )}
          <span className="font-medium text-sm text-white">{title}</span>
        </Link>
      </div>

      {/* 中间 - 搜索框 */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative flex items-center h-8 rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <Search className="h-4 w-4 text-white/60 ml-3" />
          <input
            type="text"
            placeholder="搜索应用..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm px-3 placeholder-white/50"
          />
        </div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center gap-1 text-white">
        {/* 布局切换 */}
        <div className="flex items-center rounded overflow-hidden mr-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => onLayoutModeChange('tile')}
            className={cn(
              'p-2 transition-colors',
              layoutMode === 'tile'
                ? 'bg-white/20'
                : 'hover:bg-white/10'
            )}
            title="磁贴视图"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onLayoutModeChange('menu')}
            className={cn(
              'p-2 transition-colors',
              layoutMode === 'menu'
                ? 'bg-white/20'
                : 'hover:bg-white/10'
            )}
            title="菜单视图"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* 通知 */}
        <button className="p-2 rounded hover:bg-white/10 transition-colors relative">
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span 
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full text-[10px] font-semibold flex items-center justify-center px-1 text-white"
              style={{ backgroundColor: '#e74c3c' }}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* 帮助 */}
        <button className="p-2 rounded hover:bg-white/10 transition-colors">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        {/* 用户 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors ml-1"
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#0070f2' }}
            >
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm hidden sm:block">{userName}</span>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-lg shadow-xl py-1 z-50 text-gray-700 border border-gray-100">
                {/* 用户信息 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">当前用户</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{userName}</p>
                  <span 
                    className="inline-block mt-2 px-2 py-0.5 text-xs rounded text-white"
                    style={{ backgroundColor: '#0070f2' }}
                  >
                    管理员
                  </span>
                </div>

                {/* 菜单项 */}
                <div className="py-1">
                  <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>个人资料</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span>账户设置</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                    <span>帮助中心</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default ShellBar;
