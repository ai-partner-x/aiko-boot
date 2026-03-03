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
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="h-11 px-3 flex items-center justify-between sticky top-0 z-50 bg-[#354a5f] text-white">
      {/* 左侧 - Logo 和标题 */}
      <div className="flex items-center gap-2">
        {layoutMode === 'menu' && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="切换菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          {logo || (
            <div className="w-7 h-7 rounded bg-[#0070f2] flex items-center justify-center font-semibold text-sm">
              A
            </div>
          )}
          <span className="font-medium text-sm">{title}</span>
        </Link>
      </div>

      {/* 中间 - 搜索框 */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="fiori-search">
          <Search className="h-4 w-4 text-white/50 mr-2" />
          <input
            type="text"
            placeholder="搜索应用..."
          />
        </div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center">
        {/* 布局切换 */}
        <div className="flex items-center bg-white/10 rounded p-0.5 mr-2">
          <button
            onClick={() => onLayoutModeChange('tile')}
            className={cn(
              'p-1.5 rounded transition-all',
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
              'p-1.5 rounded transition-all',
              layoutMode === 'menu'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            title="菜单视图"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* 搜索按钮 (移动端) */}
        <button 
          className="p-2 rounded hover:bg-white/10 transition-colors md:hidden"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-4 w-4" />
        </button>

        {/* 通知 */}
        <button className="p-2 rounded hover:bg-white/10 transition-colors relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#e74c3c] rounded-full text-[10px] font-medium flex items-center justify-center px-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* 帮助 */}
        <button className="p-2 rounded hover:bg-white/10 transition-colors hidden sm:flex">
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* 用户菜单 */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#0070f2] flex items-center justify-center">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:block text-sm">{userName}</span>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 text-[rgb(var(--fiori-text-primary))]">
                {/* 用户信息 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-[rgb(var(--fiori-text-secondary))]">当前用户</p>
                  <p className="font-medium text-sm mt-0.5">{userName}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-[rgb(var(--fiori-primary-light))] text-[rgb(var(--fiori-primary))] text-xs rounded">
                    管理员
                  </span>
                </div>

                {/* 菜单项 */}
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-[rgb(var(--fiori-text-secondary))]" />
                    <span>个人资料</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <Settings className="h-4 w-4 text-[rgb(var(--fiori-text-secondary))]" />
                    <span>账户设置</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <HelpCircle className="h-4 w-4 text-[rgb(var(--fiori-text-secondary))]" />
                    <span>帮助中心</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-[rgb(var(--fiori-error))]"
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
