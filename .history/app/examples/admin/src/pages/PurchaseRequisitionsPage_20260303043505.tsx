/**
 * 采购申请列表页面 - 优化版
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
  download: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  ),
  filter: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h12M4 7h8M6 11h4" strokeLinecap="round" />
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
  eye: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  more: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
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

// 统计数据
const stats = [
  { label: '全部', value: 156, active: true },
  { label: '待审批', value: 23, color: 'text-amber-600' },
  { label: '已批准', value: 89, color: 'text-emerald-600' },
  { label: '已拒绝', value: 12, color: 'text-red-500' },
  { label: '草稿', value: 32, color: 'text-gray-500' },
];

export function PurchaseRequisitionsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('全部');
  const [showFilters, setShowFilters] = useState(false);

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

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">采购申请管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">管理和跟踪所有采购申请单据</p>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
            {Icons.download}
            <span>导出</span>
          </button>
          <button 
            onClick={() => navigate('/purchase-requisitions/create')}
            className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            {Icons.plus}
            <span>创建采购申请</span>
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {Icons.search}
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索采购申请号、物料名称、申请人..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          
          {/* 筛选按钮 */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-10 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors",
              showFilters 
                ? "bg-blue-50 border-blue-200 text-blue-600" 
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {Icons.filter}
            <span>筛选</span>
            {Icons.chevronDown}
          </button>
          
          {/* 应用按钮 */}
          <button className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
            应用
          </button>
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">状态</label>
                <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400">
                  <option>全部状态</option>
                  <option>待审批</option>
                  <option>已批准</option>
                  <option>已拒绝</option>
                  <option>草稿</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">申请人</label>
                <input type="text" placeholder="输入申请人" className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">部门</label>
                <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400">
                  <option>全部部门</option>
                  <option>研发部</option>
                  <option>行政部</option>
                  <option>市场部</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">创建日期</label>
                <input type="date" className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* 状态标签页 */}
        <div className="px-4 border-t border-gray-100">
          <div className="flex gap-1">
            {stats.map((stat) => (
              <button
                key={stat.label}
                onClick={() => setActiveTab(stat.label)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === stat.label
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {stat.label}
                <span className={cn(
                  "ml-1.5 text-xs",
                  activeTab === stat.label ? "text-blue-600" : stat.color || "text-gray-400"
                )}>
                  {stat.value}
                </span>
              </button>
            ))}
          </div>
        </div>
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
                    checked={selectedRows.length === mockData.length}
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
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.map((row) => {
                const status = statusConfig[row.status as keyof typeof statusConfig];
                return (
                  <tr 
                    key={row.id} 
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors cursor-pointer",
                      selectedRows.includes(row.id) && "bg-blue-50/50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {row.prNumber}
                      </span>
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
                      <div className="flex items-center justify-end gap-1">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          {Icons.eye}
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
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
            已选择 <span className="font-medium text-gray-900">{selectedRows.length}</span> 项
            <span className="mx-2">·</span>
            共 <span className="font-medium text-gray-900">{mockData.length}</span> 条记录
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
