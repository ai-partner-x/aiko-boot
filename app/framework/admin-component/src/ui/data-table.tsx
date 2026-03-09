/**
 * Aiko Boot 数据表格组件
 * 基于 @tanstack/react-table
 */

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  PaginationState,
  RowSelectionState,
  Updater,
  Table,
  Row,
  Cell,
  HeaderGroup,
  Header,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './button';

// ===== 类型定义 =====

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: { getValue: () => unknown; row: { original: T } }) => React.ReactNode;
  enableSorting?: boolean;
  size?: number;
  /** 列对齐方式 */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  
  // 选择
  enableRowSelection?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  
  // 分页
  pageSize?: number;
  pageIndex?: number;
  totalCount?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  
  // 排序
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  
  // 事件
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  
  // 样式
  className?: string;
  getRowId?: (row: T) => string;
}

// ===== 主组件 =====

export function DataTable<T>({
  data,
  columns,
  loading = false,
  enableRowSelection = false,
  selectedRows = [],
  onSelectionChange,
  pageSize = 25,
  pageIndex = 0,
  totalCount,
  onPaginationChange,
  pageSizeOptions = [10, 25, 50, 100],
  onSortChange,
  onRowClick,
  onRowDoubleClick,
  className,
  getRowId,
}: DataTableProps<T>) {
  // 排序状态
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  // 分页状态
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex,
    pageSize,
  });
  
  // 选择状态
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // 转换列定义
  const tableColumns = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];
    
    // 添加选择列
    if (enableRowSelection) {
      cols.push({
        id: 'select',
        header: ({ table }: { table: Table<T> }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        cell: ({ row }: { row: Row<T> }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        size: 40,
      });
    }
    
    // 添加数据列
    columns.forEach((col) => {
      cols.push({
        id: col.id,
        header: col.header,
        accessorKey: col.accessorKey as string,
        accessorFn: col.accessorFn,
        cell: col.cell,
        enableSorting: col.enableSorting !== false,
        size: col.size,
        meta: { align: col.align || 'left' },
      });
    });
    
    return cols;
  }, [columns, enableRowSelection]);

  // 创建表格实例
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: (updater: Updater<SortingState>) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortChange && newSorting.length > 0) {
        onSortChange(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc');
      }
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      if (onPaginationChange) {
        onPaginationChange(newPagination.pageIndex + 1, newPagination.pageSize);
      }
    },
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onSelectionChange) {
        const selectedData = table.getSelectedRowModel().rows.map((row: Row<T>) => row.original);
        onSelectionChange(selectedData);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowId ? (row: T) => getRowId(row) : undefined,
    manualPagination: !!onPaginationChange,
    pageCount: totalCount ? Math.ceil(totalCount / pagination.pageSize) : undefined,
  });

  // 同步外部分页状态
  React.useEffect(() => {
    setPagination({ pageIndex, pageSize });
  }, [pageIndex, pageSize]);

  return (
    <div className={cn('w-full', className)}>
      {/* 表格容器 */}
      <div className="relative overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm">
            {/* 表头 */}
            <thead className="bg-gray-50/80">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: Header<T, unknown>) => {
                    const align = (header.column.columnDef.meta as { align?: string })?.align || 'left';
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'px-4 py-3 text-xs font-semibold text-gray-600',
                          align === 'left' && 'text-left',
                          align === 'center' && 'text-center',
                          align === 'right' && 'text-right',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-100'
                        )}
                        style={{ width: header.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className={cn(
                          'flex items-center gap-2',
                          align === 'right' && 'justify-end',
                          align === 'center' && 'justify-center'
                        )}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            
            {/* 表体 */}
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-4 py-8 text-center text-gray-400">
                    加载中...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-4 py-8 text-center text-gray-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row: Row<T>) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors',
                      'hover:bg-gray-50/50',
                      row.getIsSelected() && 'bg-blue-50/50',
                      (onRowClick || onRowDoubleClick) && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                    onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell: Cell<T, unknown>) => {
                      const align = (cell.column.columnDef.meta as { align?: string })?.align || 'left';
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            'px-4 py-3 text-sm text-gray-900',
                            align === 'left' && 'text-left',
                            align === 'center' && 'text-center',
                            align === 'right' && 'text-right'
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {enableRowSelection && (
            <span>
              已选择 {table.getFilteredSelectedRowModel().rows.length} 项
              {totalCount && ` / 共 ${totalCount} 条记录`}
            </span>
          )}
          {!enableRowSelection && totalCount && (
            <span>共 {totalCount} 条记录</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* 每页条数 */}
          <span className="text-sm text-gray-500">每页</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 px-2 rounded border border-gray-200 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">条</span>
          
          {/* 分页按钮 */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronUp className="h-4 w-4 -rotate-90" />
            </button>
            {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={cn(
                  'w-8 h-8 rounded text-sm font-medium',
                  pagination.pageIndex === i
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {i + 1}
              </button>
            ))}
            {table.getPageCount() > 5 && (
              <>
                <span className="text-gray-400">...</span>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  className={cn(
                    'w-8 h-8 rounded text-sm font-medium',
                    pagination.pageIndex === table.getPageCount() - 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {table.getPageCount()}
                </button>
              </>
            )}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronUp className="h-4 w-4 rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
