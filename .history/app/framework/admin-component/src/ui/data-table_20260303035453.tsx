/**
 * SAP Fiori 风格数据表格组件
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
      <div className="relative rounded border border-[rgb(var(--fiori-grey-300))] overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm">
            {/* 表头 */}
            <thead className="bg-[rgb(var(--fiori-grey-100))] border-b-2 border-[rgb(var(--fiori-grey-300))]">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: Header<T, unknown>) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left font-semibold text-[rgb(var(--fiori-text-primary))]',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:bg-[rgb(var(--fiori-grey-200))]'
                      )}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-[rgb(var(--fiori-grey-500))]">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            {/* 表体 */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-4 py-8 text-center text-[rgb(var(--fiori-text-secondary))]">
                    加载中...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-4 py-8 text-center text-[rgb(var(--fiori-text-secondary))]">
                    暂无数据
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-[rgb(var(--fiori-grey-200))] transition-colors',
                      'hover:bg-[rgb(var(--fiori-primary-light))]',
                      row.getIsSelected() && 'bg-[rgb(var(--fiori-primary-light))]',
                      (onRowClick || onRowDoubleClick) && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                    onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-[rgb(var(--fiori-text-primary))]"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-[rgb(var(--fiori-text-secondary))]">
          {enableRowSelection && (
            <span>
              已选择 {table.getFilteredSelectedRowModel().rows.length} 项
              {totalCount && ` / 共 ${totalCount} 项`}
            </span>
          )}
          {!enableRowSelection && totalCount && (
            <span>共 {totalCount} 项</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* 每页条数 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--fiori-text-secondary))]">每页</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded border border-[rgb(var(--fiori-grey-300))] px-2 py-1 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-[rgb(var(--fiori-text-secondary))]">条</span>
          </div>
          
          {/* 分页按钮 */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              上一页
            </Button>
            <span className="px-2 text-sm text-[rgb(var(--fiori-text-secondary))]">
              第 {pagination.pageIndex + 1} 页
              {table.getPageCount() > 0 && ` / 共 ${table.getPageCount()} 页`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
