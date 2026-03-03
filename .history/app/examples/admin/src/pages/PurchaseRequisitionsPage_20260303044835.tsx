/**
 * 采购申请列表报告页面
 * 基于 SAP Fiori List Report 设计
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@aff/admin-component';

// 图标
const Icons = {
  plus: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 0110.89-3.48M14 8a6 6 0 01-10.89 3.48" />
      <path d="M2 3v3h3M14 13v-3h-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 10V2m0 0l-3 3m3-3l3 3M3 12v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  filter: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h12M4 7h8M6 11h4" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5l1.5 1.5M3 13l1.5-1.5M11.5 4.5l1.5-1.5" strokeLinecap="round" />
    </svg>
  ),
  columns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="4" height="12" rx="1" />
      <rect x="10" y="2" width="4" height="12" rx="1" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12.5 4v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 13V4" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  cart: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 1h2l1.5 9h8l1.5-6H4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="13.5" r="1" />
      <circle cx="11.5" cy="13.5" r="1" />
    </svg>
  ),
  help: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6a2 2 0 113 1.73c0 .77-.5 1.27-.5 1.27" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.5 5.5l3.5 3 3.5-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevronLeft: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8.5 3.5l-3 3.5 3 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5.5 3.5l3 3.5-3 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sort: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4l3-2 3 2M3 8l3 2 3-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
    </svg>
  ),
};

// 状态配置
const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  pending: { label: '待审批', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: '已批准', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: '已拒绝', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
  processing: { label: '处理中', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
};

// 模拟数据
const mockData = [
  { id: '1', prNumber: 'PR-2024-0156', material: 'MacBook Pro 14" M3', materialCode: 'IT-001', quantity: 10, unit: '台', totalAmount: 189000, status: 'pending', createdAt: '2024-01-15 14:30', requester: '张三', department: '研发部', priority: 'high' },
  { id: '2', prNumber: 'PR-2024-0155', material: 'A4复印纸 80g', materialCode: 'OF-023', quantity: 500, unit: '包', totalAmount: 12500, status: 'approved', createdAt: '2024-01-14 09:15', requester: '李四', department: '行政部', priority: 'normal' },
  { id: '3', prNumber: 'PR-2024-0154', material: '人体工学办公椅', materialCode: 'FN-008', quantity: 20, unit: '把', totalAmount: 56000, status: 'draft', createdAt: '2024-01-13 16:45', requester: '王五', department: '人力资源', priority: 'normal' },
  { id: '4', prNumber: 'PR-2024-0153', material: 'Dell 27" 4K显示器', materialCode: 'IT-015', quantity: 15, unit: '台', totalAmount: 52500, status: 'rejected', createdAt: '2024-01-12 11:20', requester: '赵六', department: '设计部', priority: 'low' },
  { id: '5', prNumber: 'PR-2024-0152', material: '无线键鼠套装', materialCode: 'IT-032', quantity: 30, unit: '套', totalAmount: 8970, status: 'pending', createdAt: '2024-01-11 08:00', requester: '钱七', department: '运营部', priority: 'normal' },
  { id: '6', prNumber: 'PR-2024-0151', material: '投影仪', materialCode: 'IT-041', quantity: 2, unit: '台', totalAmount: 15800, status: 'processing', createdAt: '2024-01-10 15:30', requester: '孙八', department: '市场部', priority: 'high' },
  { id: '7', prNumber: 'PR-2024-0150', material: '白板笔套装', materialCode: 'OF-056', quantity: 100, unit: '盒', totalAmount: 2800, status: 'approved', createdAt: '2024-01-09 10:00', requester: '周九', department: '培训部', priority: 'low' },
];

export function PurchaseRequisitionsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // 筛选条件
  const [filters, setFilters] = useState({
    status: '',
    requester: '',
    department: '',
    dateFrom: '',
    dateTo: '',
  });

  const totalCount = 156;
  const displayCount = mockData.length;

  const toggleSelectAll = () => {
    if (selectedRows.length === mockData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockData.map(d => d.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatAmount = (amount: number) => `¥${amount.toLocaleString()}`;

  // 操作函数
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleCreate = () => navigate('/purchase-requisitions/create');

  const handleEdit = (id: string) => navigate(`/purchase-requisitions/${id}/edit`);

  const handleView = (id: string) => navigate(`/purchase-requisitions/${id}`);

  const handleDelete = () => {
    if (selectedRows.length > 0) {
      // TODO: 删除确认对话框
      console.log('Delete:', selectedRows);
    }
  };

  const handleExport = () => console.log('Export');

  const handleClearFilters = () => {
    setFilters({
      status: '',
      requester: '',
      department: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchValue('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchValue !== '';

  return (
    <div className="space-y-4">
      {/* List Report Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                {Icons.cart}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">采购申请管理</h1>
                <p className="text-xs text-gray-500">F1643 - 管理和跟踪所有采购申请单据</p>
              </div>
            </div>

            {/* 主操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
              >
                {Icons.plus}
                <span>创建</span>
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* 左侧 - 选择操作 */}
            <div className="flex items-center gap-3">
              {selectedRows.length > 0 ? (
                <>
                  <span className="text-sm text-blue-600 font-medium">
                    已选择 {selectedRows.length} 项
                  </span>
                  <div className="w-px h-5 bg-gray-200" />
                  <button
                    onClick={() => handleView(selectedRows[0])}
                    className="h-8 px-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                    disabled={selectedRows.length !== 1}
                  >
                    {Icons.eye}
                    <span>查看</span>
                  </button>
                  <button
                    onClick={() => handleEdit(selectedRows[0])}
                    className="h-8 px-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                    disabled={selectedRows.length !== 1}
                  >
                    {Icons.edit}
                    <span>编辑</span>
                  </button>
                  <button
                    className="h-8 px-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                  >
                    {Icons.copy}
                    <span>复制</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-8 px-3 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                  >
                    {Icons.trash}
                    <span>删除</span>
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  显示 {displayCount} 项 {hasActiveFilters && `(共 ${totalCount} 项)`}
                </span>
              )}
            </div>

            {/* 右侧 - 工具按钮 */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors",
                  loading && "animate-spin"
                )}
                title="刷新"
              >
                {Icons.refresh}
              </button>
              <button
                onClick={handleExport}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="导出"
              >
                {Icons.download}
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="列设置"
              >
                {Icons.columns}
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="设置"
              >
                {Icons.settings}
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="帮助"
              >
                {Icons.help}
              </button>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {Icons.search}
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索采购申请号、物料、申请人..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            
            {/* 筛选按钮 */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-9 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors",
                showFilters || hasActiveFilters
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {Icons.filter}
              <span>筛选</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>

            {/* 清除筛选 */}
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="h-9 px-3 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
              >
                {Icons.x}
                <span>清除筛选</span>
              </button>
            )}

            <div className="flex-1" />

            {/* 应用按钮 */}
            <button className="h-9 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
              应用
            </button>
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">状态</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">全部状态</option>
                  <option value="draft">草稿</option>
                  <option value="pending">待审批</option>
                  <option value="approved">已批准</option>
                  <option value="rejected">已拒绝</option>
                  <option value="processing">处理中</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">申请人</label>
                <input
                  type="text"
                  value={filters.requester}
                  onChange={(e) => setFilters({ ...filters, requester: e.target.value })}
                  placeholder="输入申请人"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">部门</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">全部部门</option>
                  <option value="研发部">研发部</option>
                  <option value="行政部">行政部</option>
                  <option value="市场部">市场部</option>
                  <option value="设计部">设计部</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">开始日期</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">结束日期</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === mockData.length && mockData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900">
                    采购申请号 {Icons.sort}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">物料信息</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">数量</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">金额</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申请人</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900">
                    创建时间 {Icons.sort}
                  </div>
                </th>
                <th className="w-24 px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.map((row) => {
                const status = statusConfig[row.status as keyof typeof statusConfig];
                const isSelected = selectedRows.includes(row.id);
                return (
                  <tr 
                    key={row.id} 
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors",
                      isSelected && "bg-blue-50/50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleView(row.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {row.prNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{row.material}</p>
                        <p className="text-xs text-gray-400">{row.materialCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-900">{row.quantity}</span>
                      <span className="text-xs text-gray-400 ml-1">{row.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">{formatAmount(row.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          status.color
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900">{row.requester}</p>
                        <p className="text-xs text-gray-400">{row.department}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{row.createdAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(row.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="查看"
                        >
                          {Icons.eye}
                        </button>
                        <button
                          onClick={() => handleEdit(row.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="编辑"
                        >
                          {Icons.edit}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-sm text-gray-500">
            共 <span className="font-medium text-gray-900">{totalCount}</span> 条记录
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">每页</span>
            <select className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span className="text-sm text-gray-500">条</span>
            
            <div className="flex items-center gap-1 ml-4">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
                {Icons.chevronLeft}
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white text-sm font-medium">
                1
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
                2
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
                3
              </button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
                16
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50">
                {Icons.chevronRight}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseRequisitionsPage;
