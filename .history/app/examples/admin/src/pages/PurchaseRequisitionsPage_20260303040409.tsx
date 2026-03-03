/**
 * 采购申请列表页面
 */

import { useState } from 'react';
import {
  DataTable,
  SearchFilterBar,
  StatusChip,
  Button,
  Card,
} from '@aff/admin-component';
import { Plus, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 模拟数据
const mockData = [
  { id: '1', prNumber: 'PR-2024-001', material: '办公电脑', quantity: 10, status: 'pending', createdAt: '2024-01-15', requester: '张三' },
  { id: '2', prNumber: 'PR-2024-002', material: '打印纸', quantity: 100, status: 'approved', createdAt: '2024-01-14', requester: '李四' },
  { id: '3', prNumber: 'PR-2024-003', material: '办公桌', quantity: 5, status: 'draft', createdAt: '2024-01-13', requester: '王五' },
  { id: '4', prNumber: 'PR-2024-004', material: '显示器', quantity: 8, status: 'rejected', createdAt: '2024-01-12', requester: '赵六' },
  { id: '5', prNumber: 'PR-2024-005', material: '键盘鼠标套装', quantity: 20, status: 'pending', createdAt: '2024-01-11', requester: '钱七' },
];

const statusMap = {
  draft: { label: '草稿', variant: 'default' as const },
  pending: { label: '待审批', variant: 'warning' as const },
  approved: { label: '已批准', variant: 'success' as const },
  rejected: { label: '已拒绝', variant: 'error' as const },
};

export function PurchaseRequisitionsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [data] = useState(mockData);

  const columns = [
    { id: 'prNumber', header: '采购申请号', accessorKey: 'prNumber' as const },
    { id: 'material', header: '物料', accessorKey: 'material' as const },
    { id: 'quantity', header: '数量', accessorKey: 'quantity' as const },
    {
      id: 'status',
      header: '状态',
      accessorKey: 'status' as const,
      cell: ({ row }: { row: { original: typeof mockData[0] } }) => {
        const status = statusMap[row.original.status as keyof typeof statusMap];
        return <StatusChip label={status.label} variant={status.variant} />;
      },
    },
    { id: 'requester', header: '申请人', accessorKey: 'requester' as const },
    { id: 'createdAt', header: '创建日期', accessorKey: 'createdAt' as const },
  ];

  const filterFields = [
    {
      id: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { value: 'draft', label: '草稿' },
        { value: 'pending', label: '待审批' },
        { value: 'approved', label: '已批准' },
        { value: 'rejected', label: '已拒绝' },
      ],
    },
    { id: 'requester', label: '申请人', type: 'text' as const },
  ];

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--fiori-text-primary))]">
            采购申请管理
          </h1>
          <p className="text-[rgb(var(--fiori-text-secondary))]">
            管理和跟踪所有采购申请
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button onClick={() => navigate('/purchase-requisitions/create')}>
            <Plus className="h-4 w-4 mr-2" />
            创建采购申请
          </Button>
        </div>
      </div>

      {/* 搜索筛选栏 */}
      <SearchFilterBar
        searchPlaceholder="搜索采购申请号、物料..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterFields={filterFields}
        onApply={() => console.log('Apply filters')}
      />

      {/* 数据表格 */}
      <Card>
        <DataTable
          data={data}
          columns={columns}
          enableRowSelection
          pageSize={10}
          onRowClick={(row) => console.log('Row clicked:', row)}
        />
      </Card>
    </div>
  );
}

export default PurchaseRequisitionsPage;
