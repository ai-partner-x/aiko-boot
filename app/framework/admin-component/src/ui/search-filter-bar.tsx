/**
 * Aiko Boot 搜索筛选栏组件
 */

import * as React from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './button';
import { Input } from './input';

// ===== 类型定义 =====

export interface FilterField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: string | string[] | [string, string] | undefined;
}

export interface SearchFilterBarProps {
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 搜索值 */
  searchValue?: string;
  /** 搜索变化回调 */
  onSearchChange?: (value: string) => void;
  /** 筛选字段配置 */
  filterFields?: FilterField[];
  /** 筛选值 */
  filterValues?: FilterValue;
  /** 筛选变化回调 */
  onFilterChange?: (values: FilterValue) => void;
  /** 应用筛选回调 */
  onApply?: () => void;
  /** 清除筛选回调 */
  onClear?: () => void;
  /** 加载状态 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 额外操作按钮 */
  actions?: React.ReactNode;
}

// ===== 主组件 =====

export function SearchFilterBar({
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  filterFields = [],
  filterValues = {},
  onFilterChange,
  onApply,
  onClear,
  loading = false,
  className,
  actions,
}: SearchFilterBarProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [localValues, setLocalValues] = React.useState<FilterValue>(filterValues);

  // 同步外部值
  React.useEffect(() => {
    setLocalValues(filterValues);
  }, [filterValues]);

  // 计算激活的筛选条件数量
  const activeFilterCount = Object.values(filterValues).filter(
    (v) => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  // 处理字段值变化
  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    const newValues = { ...localValues, [fieldId]: value };
    setLocalValues(newValues);
    onFilterChange?.(newValues);
  };

  // 处理应用
  const handleApply = () => {
    onApply?.();
  };

  // 处理清除
  const handleClear = () => {
    const emptyValues: FilterValue = {};
    setLocalValues(emptyValues);
    onFilterChange?.(emptyValues);
    onClear?.();
  };

  return (
    <div
      className={cn(
        'rounded border border-[rgb(var(--fiori-grey-300))] bg-white shadow-[var(--fiori-shadow-sm)]',
        className
      )}
    >
      <div className="p-4">
        {/* 基础搜索行 */}
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--fiori-grey-500))]" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 筛选按钮 */}
          {filterFields.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setExpanded(!expanded)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>筛选</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--fiori-primary))] text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* 应用按钮 */}
          <Button onClick={handleApply} disabled={loading}>
            {loading ? '加载中...' : '应用'}
          </Button>

          {/* 清除按钮 */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              title="清除所有筛选条件"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* 额外操作 */}
          {actions}
        </div>

        {/* 展开的筛选条件 */}
        {expanded && filterFields.length > 0 && (
          <div className="mt-4 border-t border-[rgb(var(--fiori-grey-200))] pt-4">
            <p className="mb-3 text-sm font-medium text-[rgb(var(--fiori-text-secondary))]">
              筛选条件
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filterFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="text-sm font-medium text-[rgb(var(--fiori-text-primary))]">
                    {field.label}
                  </label>
                  {renderFilterField(field, localValues[field.id], (value) =>
                    handleFieldChange(field.id, value)
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 渲染筛选字段 =====

function renderFilterField(
  field: FilterField,
  value: string | string[] | [string, string] | undefined,
  onChange: (value: string | string[]) => void
) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          type="text"
          placeholder={field.placeholder || `输入${field.label}`}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-[rgb(var(--fiori-grey-300))] px-3 py-2 text-sm focus:border-[rgb(var(--fiori-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--fiori-primary))]/20"
        >
          <option value="">全部</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'multiselect':
      return (
        <select
          multiple
          value={(value as string[]) || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
            onChange(selected);
          }}
          className="w-full rounded border border-[rgb(var(--fiori-grey-300))] px-3 py-2 text-sm focus:border-[rgb(var(--fiori-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--fiori-primary))]/20"
          style={{ minHeight: '80px' }}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'daterange':
      const dateRange = (value as [string, string]) || ['', ''];
      return (
        <div className="flex gap-2">
          <Input
            type="date"
            placeholder="开始日期"
            value={dateRange[0] || ''}
            onChange={(e) => onChange([e.target.value, dateRange[1]])}
          />
          <Input
            type="date"
            placeholder="结束日期"
            value={dateRange[1] || ''}
            onChange={(e) => onChange([dateRange[0], e.target.value])}
          />
        </div>
      );

    default:
      return null;
  }
}

export default SearchFilterBar;
