/**
 * AI-First Framework Shell Bar
 * 基于 SAP Fiori Launchpad Shell Bar 设计规范
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@aff/admin-component';

// 自定义 SVG 图标 - 更精致
const Icons = {
  menu: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3 3" strokeLinecap="round" />
    </svg>
  ),
  grid: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  list: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="3" height="3" rx="0.5" />
      <rect x="6" y="2" width="9" height="3" rx="0.5" />
      <rect x="1" y="7" width="3" height="3" rx="0.5" />
      <rect x="6" y="7" width="9" height="3" rx="0.5" />
      <rect x="1" y="12" width="3" height="3" rx="0.5" />
      <rect x="6" y="12" width="9" height="3" rx="0.5" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13.5 6.5a4.5 4.5 0 10-9 0c0 5-2 6.5-2 6.5h13s-2-1.5-2-6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 15a1.5 1.5 0 01-2.6 0" strokeLinecap="round" />
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="7" />
      <path d="M6.5 6.5a2.5 2.5 0 014.87.83c0 1.67-2.37 2.5-2.37 2.5" strokeLinecap="round" />
      <circle cx="9" cy="13" r="0.5" fill="currentColor" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M2.9 13.1l1.4-1.4M11.7 4.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

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
      className="h-[44px] px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm"
      style={{ 
        background: 'linear-gradient(180deg, #3d5a73 0%, #354a5f 100%)',
      }}
    >
      {/* 左侧 - Logo 和标题 */}
      <div className="flex items-center gap-3">
        {layoutMode === 'menu' && (
          <button
            onClick={onMenuToggle}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors text-white/90 hover:text-white"
            title="切换菜单"
          >
            {Icons.menu}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          {logo || (
            <div 
              className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
              }}
            >
              A
            </div>
          )}
          <span className="font-semibold text-sm text-white tracking-wide">{title}</span>
        </Link>
      </div>

      {/* 中间 - 搜索框 */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div 
          className="relative flex items-center h-8 rounded-lg transition-all duration-200 group"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          <div className="ml-3 text-white/50 group-focus-within:text-white/70 transition-colors">
            {Icons.search}
          </div>
          <input
            type="text"
            placeholder="搜索应用..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm px-3 placeholder-white/40 focus:placeholder-white/50"
          />
        </div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center gap-0.5 text-white">
        {/* 布局切换 */}
        <div 
          className="flex items-center rounded-md overflow-hidden mr-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={() => onLayoutModeChange('tile')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all',
              layoutMode === 'tile'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            title="磁贴视图"
          >
            {Icons.grid}
          </button>
          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={() => onLayoutModeChange('menu')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all',
              layoutMode === 'menu'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            title="菜单视图"
          >
            {Icons.list}
          </button>
        </div>

        {/* 通知 */}
        <button className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors relative text-white/80 hover:text-white">
          {Icons.bell}
          {notificationCount > 0 && (
            <span 
              className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
              }}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* 帮助 */}
        <button className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors text-white/80 hover:text-white">
          {Icons.help}
        </button>

        {/* 用户 */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
              }}
            >
              {Icons.user}
            </div>
            <span className="text-sm font-medium hidden sm:block text-white/90">{userName}</span>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              
              <div 
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl py-1 z-50 text-gray-700 overflow-hidden"
                style={{
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                }}
              >
                {/* 用户信息头部 */}
                <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow"
                      style={{ 
                        background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                      }}
                    >
                      {Icons.user}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userName}</p>
                      <span 
                        className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full text-white font-medium"
                        style={{ backgroundColor: '#0070f2' }}
                      >
                        管理员
                      </span>
                    </div>
                  </div>
                </div>

                {/* 菜单项 */}
                <div className="py-2">
                  <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors">
                    <span className="text-gray-400">{Icons.user}</span>
                    <span className="text-gray-700">个人资料</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors">
                    <span className="text-gray-400">{Icons.settings}</span>
                    <span className="text-gray-700">账户设置</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors">
                    <span className="text-gray-400">{Icons.help}</span>
                    <span className="text-gray-700">帮助中心</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm transition-colors group"
                  >
                    <span className="text-red-400 group-hover:text-red-500">{Icons.logout}</span>
                    <span className="text-red-500 group-hover:text-red-600">退出登录</span>
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
