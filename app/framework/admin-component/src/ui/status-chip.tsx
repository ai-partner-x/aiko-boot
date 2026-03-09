/**
 * Aiko Boot 状态标签组件
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

// ===== 状态芯片变体 =====

const statusChipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[rgb(var(--fiori-grey-200))] text-[rgb(var(--fiori-grey-800))]',
        primary: 'bg-[rgb(var(--fiori-primary-light))] text-[rgb(var(--fiori-primary-dark))]',
        secondary: 'bg-[rgb(var(--fiori-secondary-light))] text-[rgb(var(--fiori-secondary-dark))]',
        success: 'bg-[rgb(var(--fiori-success-light))] text-[rgb(16,126,62)]',
        warning: 'bg-[rgb(var(--fiori-warning-light))] text-[rgb(204,119,0)]',
        error: 'bg-[rgb(var(--fiori-error-light))] text-[rgb(var(--fiori-error))]',
        info: 'bg-[rgb(var(--fiori-info-light))] text-[rgb(var(--fiori-info))]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
      outlined: {
        true: 'bg-transparent border-2',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'default', outlined: true, className: 'border-[rgb(var(--fiori-grey-400))]' },
      { variant: 'primary', outlined: true, className: 'border-[rgb(var(--fiori-primary))]' },
      { variant: 'secondary', outlined: true, className: 'border-[rgb(var(--fiori-secondary))]' },
      { variant: 'success', outlined: true, className: 'border-[rgb(var(--fiori-success))]' },
      { variant: 'warning', outlined: true, className: 'border-[rgb(var(--fiori-warning))]' },
      { variant: 'error', outlined: true, className: 'border-[rgb(var(--fiori-error))]' },
      { variant: 'info', outlined: true, className: 'border-[rgb(var(--fiori-info))]' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      outlined: false,
    },
  }
);

// ===== 类型定义 =====

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  icon?: React.ReactNode;
  label: string;
  description?: string;
}

// ===== 通用状态芯片组件 =====

export function StatusChip({
  className,
  variant,
  size,
  outlined,
  icon,
  label,
  description,
  ...props
}: StatusChipProps) {
  const chip = (
    <span
      className={cn(statusChipVariants({ variant, size, outlined }), className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );

  if (description) {
    return (
      <span className="group relative inline-block">
        {chip}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <span className="block rounded bg-[rgb(var(--fiori-grey-800))] px-2 py-1 text-xs text-white whitespace-nowrap">
            {description}
          </span>
        </span>
      </span>
    );
  }

  return chip;
}

// ===== 预定义状态配置 =====

export interface StatusConfig {
  label: string;
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon?: string;
  description?: string;
}

export type StatusMap<T extends string> = Record<T, StatusConfig>;

// ===== 带状态映射的状态芯片 =====

export interface MappedStatusChipProps<T extends string> {
  status: T;
  statusMap: StatusMap<T>;
  size?: 'sm' | 'default' | 'lg';
  outlined?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function MappedStatusChip<T extends string>({
  status,
  statusMap,
  size = 'default',
  outlined = false,
  showIcon = true,
  showTooltip = true,
  className,
}: MappedStatusChipProps<T>) {
  const config = statusMap[status];

  if (!config) {
    return (
      <StatusChip
        label={status}
        variant="default"
        size={size}
        outlined={outlined}
        className={className}
      />
    );
  }

  return (
    <StatusChip
      label={config.label}
      variant={config.variant}
      size={size}
      outlined={outlined}
      icon={showIcon && config.icon ? <span>{config.icon}</span> : undefined}
      description={showTooltip ? config.description : undefined}
      className={className}
    />
  );
}

// ===== 常用状态映射示例 =====

/** 通用审批状态 */
export const approvalStatusMap: StatusMap<'draft' | 'pending' | 'approved' | 'rejected'> = {
  draft: { label: '草稿', variant: 'default', icon: '📝', description: '尚未提交' },
  pending: { label: '待审批', variant: 'warning', icon: '⏳', description: '等待审批中' },
  approved: { label: '已批准', variant: 'success', icon: '✅', description: '审批通过' },
  rejected: { label: '已拒绝', variant: 'error', icon: '❌', description: '审批被拒绝' },
};

/** 采购申请状态 */
export const prStatusMap: StatusMap<'N' | 'B' | 'A' | 'F' | 'L'> = {
  N: { label: '新建', variant: 'default', icon: '📄', description: '采购申请已创建' },
  B: { label: '已审批', variant: 'success', icon: '✅', description: '采购申请已审批' },
  A: { label: '已分配', variant: 'info', icon: '📌', description: '已分配给供应商' },
  F: { label: '已订购', variant: 'warning', icon: '📦', description: '采购订单已创建' },
  L: { label: '已交货', variant: 'primary', icon: '🚚', description: '货物已交付' },
};

export default StatusChip;
