/**
 * Master-Detail 布局组件
 * 基于 SAP Fiori 设计规范实现
 * 左侧列表 + 右侧详情的经典布局
 */

import { useState, type ReactNode } from 'react';
import { cn, Input } from '@aff/admin-component';

// ===== 类型定义 =====

export interface MasterDetailItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  status?: {
    label: string;
    color: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  };
  badge?: string | number;
  icon?: ReactNode;
}

export interface MasterDetailProps<T extends MasterDetailItem> {
  /** 页面标题 */
  title: string;
  /** 页面副标题 */
  subtitle?: string;
  /** 页面图标 */
  headerIcon?: ReactNode;
  /** 数据列表 */
  items: T[];
  /** 当前选中项 ID */
  selectedId?: string;
  /** 选中变化回调 */
  onSelect?: (item: T) => void;
  /** 渲染详情内容 */
  renderDetail: (item: T) => ReactNode;
  /** 渲染空状态 */
  renderEmpty?: () => ReactNode;
  /** 搜索占位符 */
  searchPlaceholder?: string;
  /** 搜索回调 */
  onSearch?: (keyword: string) => void;
  /** 主操作按钮 */
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  /** 编辑回调 */
  onEdit?: (item: T) => void;
  /** 删除回调 */
  onDelete?: (item: T) => void;
  /** Master 列表宽度 */
  masterWidth?: number;
}

// ===== 状态颜色映射 =====
const statusColors = {
  green: { bg: 'bg-emerald-500', text: 'text-emerald-600' },
  yellow: { bg: 'bg-amber-500', text: 'text-amber-600' },
  red: { bg: 'bg-red-500', text: 'text-red-600' },
  gray: { bg: 'bg-gray-400', text: 'text-gray-600' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
};

// ===== 图标 =====
const Icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3 3" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="8" width="32" height="32" rx="4" />
      <path d="M16 20h16M16 28h8" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
      <path d="M10 4l2 2" />
    </svg>
  ),
  delete: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M6.5 7v5M9.5 7v5M3.5 4l.5 10a1 1 0 001 1h6a1 1 0 001-1l.5-10" />
    </svg>
  ),
};

// 导出图标供外部使用
export const MasterDetailIcons = Icons;

// ===== 主组件 =====

export function MasterDetail<T extends MasterDetailItem>({
  title,
  subtitle,
  headerIcon,
  items,
  selectedId,
  onSelect,
  renderDetail,
  renderEmpty,
  searchPlaceholder = '搜索...',
  onSearch,
  primaryAction,
  onEdit,
  onDelete,
  masterWidth = 360,
}: MasterDetailProps<T>) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(selectedId || items[0]?.id);
  
  const currentSelectedId = selectedId ?? internalSelectedId;
  const selectedItem = items.find(item => item.id === currentSelectedId);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    onSearch?.(value);
  };

  const handleSelect = (item: T) => {
    setInternalSelectedId(item.id);
    onSelect?.(item);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {headerIcon && (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {headerIcon}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="h-9 px-4 rounded-lg bg-white text-blue-600 text-sm font-medium hover:bg-blue-50 flex items-center gap-2 transition-colors"
            >
              {primaryAction.icon || Icons.plus}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Master 列表 */}
        <div 
          className="flex flex-col bg-white border-r border-gray-200"
          style={{ width: masterWidth, minWidth: masterWidth }}
        >
          {/* 搜索框 */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {Icons.search}
              </div>
              <Input
                type="text"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 h-9 bg-gray-50"
              />
            </div>
          </div>

          {/* 列表区域 */}
          <div className="flex-1 overflow-y-auto">
            {items.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <MasterListItem
                    key={item.id}
                    item={item}
                    isSelected={item.id === currentSelectedId}
                    onClick={() => handleSelect(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                {Icons.empty}
                <p className="mt-3 text-sm">暂无数据</p>
              </div>
            )}
          </div>

          {/* 列表底部统计 */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">共 {items.length} 项</span>
          </div>
        </div>

        {/* Detail 详情 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedItem ? (
            <>
              {/* 操作工具栏 */}
              {(onEdit || onDelete) && (
                <div className="sticky top-0 z-10 bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(selectedItem)}
                      className="h-8 px-3 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 flex items-center gap-1.5 transition-colors"
                    >
                      {Icons.edit}
                      <span>编辑</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(selectedItem)}
                      className="h-8 px-3 rounded-lg bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5 transition-colors"
                    >
                      {Icons.delete}
                      <span>删除</span>
                    </button>
                  )}
                </div>
              )}
              {renderDetail(selectedItem)}
            </>
          ) : renderEmpty ? (
            renderEmpty()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              {Icons.empty}
              <p className="mt-3 text-sm">请选择一项查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Master 列表项 =====

interface MasterListItemProps<T extends MasterDetailItem> {
  item: T;
  isSelected: boolean;
  onClick: () => void;
}

function MasterListItem<T extends MasterDetailItem>({ 
  item, 
  isSelected, 
  onClick 
}: MasterListItemProps<T>) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3 cursor-pointer transition-colors relative',
        isSelected 
          ? 'bg-blue-50 border-l-3 border-l-blue-500' 
          : 'hover:bg-gray-50 border-l-3 border-l-transparent'
      )}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        {item.icon && (
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
          )}>
            {item.icon}
          </div>
        )}

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              'text-sm font-medium truncate',
              isSelected ? 'text-blue-700' : 'text-gray-900'
            )}>
              {item.title}
            </h3>
            {item.badge && (
              <span className="flex-shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </div>
          
          {item.subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
          )}
          
          {item.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>

        {/* 状态 */}
        {item.status && (
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', statusColors[item.status.color].bg)} />
            <span className={cn('text-xs', statusColors[item.status.color].text)}>
              {item.status.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Detail 区块组件 =====

export interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function DetailSection({ 
  title, 
  children, 
  className,
}: DetailSectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ===== Detail 字段组件 =====

export interface DetailFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

// ===== Detail 字段网格 =====

export interface DetailFieldGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DetailFieldGrid({ children, columns = 3, className }: DetailFieldGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <dl className={cn('grid gap-x-6 gap-y-4', gridCols[columns], className)}>
      {children}
    </dl>
  );
}

export default MasterDetail;
