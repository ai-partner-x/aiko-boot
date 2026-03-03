/**
 * AI-First Framework Shell Bar
 * 企业级管理后台顶部导航栏
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
  notificationCount = 0,
  layoutMode,
  onLayoutModeChange,
  onMenuToggle,
  onLogout,
}: ShellBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-14 px-4 flex items-center justify-between sticky top-0 z-50 bg-[#354a5f] text-white">
      {/* 左侧 - Logo 和标题 */}
      <div className="flex items-center gap-3">
        {layoutMode === 'menu' && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-3">
          {logo || (
            <div className="w-8 h-8 rounded-md bg-[#0073e6] flex items-center justify-center font-bold text-sm">
              S
            </div>
          )}
          <span className="font-semibold text-base hidden sm:block">{title}</span>
        </Link>
      </div>

      {/* 中间 - 搜索框 */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="搜索应用..."
            className="w-full pl-11 pr-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all"
          />
        </div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center gap-1">
        {/* 布局切换 - 更明显的按钮组 */}
        <div className="flex items-center bg-white/10 rounded-md p-1 mr-3 border border-white/20">
          <button
            onClick={() => onLayoutModeChange('tile')}
            className={cn(
              'p-2 rounded transition-all',
              layoutMode === 'tile'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            title="磁贴视图"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onLayoutModeChange('menu')}
            className={cn(
              'p-2 rounded transition-all',
              layoutMode === 'menu'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            title="菜单视图"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* 通知 */}
        <button className="p-2.5 rounded-md hover:bg-white/10 transition-colors relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-medium flex items-center justify-center px-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* 帮助 */}
        <button className="p-2.5 rounded-md hover:bg-white/10 transition-colors hidden sm:flex">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* 设置 */}
        <button className="p-2.5 rounded-md hover:bg-white/10 transition-colors hidden sm:flex">
          <Settings className="h-5 w-5" />
        </button>

        {/* 用户菜单 */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0073e6] flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:block text-sm font-medium">{userName}</span>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              {/* 点击外部关闭 */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 text-gray-700">
                {/* 用户信息 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">当前用户</p>
                  <p className="font-semibold text-gray-900">{userName}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
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

                <div className="border-t border-gray-100 pt-1">
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
