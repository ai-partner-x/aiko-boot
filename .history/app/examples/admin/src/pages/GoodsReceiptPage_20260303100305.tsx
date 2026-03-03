/**
 * 收货管理列表页面
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
  columns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="4" height="12" rx="1" />
      <rect x="10" y="2" width="4" height="12" rx="1" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5l1.5 1.5M3 13l1.5-1.5M11.5 4.5l1.5-1.5" strokeLinecap="round" />
    </svg>
  ),
  help: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6a2 2 0 113 1.73c0 .77-.5 1.27-.5 1.27" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
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
  truck: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 3h10v9H1zM11 7h3l2 3v5h-5z" />
      <circle cx="4" cy="14" r="1.5" />
      <circle cx="13" cy="14" r="1.5" />
    </svg>
  ),
  sort: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4l3-2 3 2M3 8l3 2 3-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// 状态配置
const statusConfig = {
  planned: { label: '计划中', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  inbound: { label: '运输中', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  arrived: { label: '已到达', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  inspecting: { label: '检验中', color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  received: { label: '已入库', color: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  partial: { label: '部分收货', color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  rejected: { label: '已退回', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

// 模拟数据
const mockData = [
  { id: '1', grNumber: 'GR-2024-0056', poRef: 'PO-2024-0089', supplier: 'Apple 授权经销商', material: 'MacBook Pro 14" M3', orderedQty: 10, receivedQty: 10, unit: '台', status: 'received', plant: '1000', storageLocation: 'WH01', receivedAt: '2024-01-25 14:30', receiver: '王五' },
  { id: '2', grNumber: 'GR-2024-0055', poRef: 'PO-2024-0088', supplier: '办公用品供应商', material: 'A4复印纸 80g', orderedQty: 500, receivedQty: 500, unit: '包', status: 'inspecting', plant: '1000', storageLocation: 'WH02', receivedAt: '2024-01-24 10:00', receiver: '赵六' },
  { id: '3', grNumber: 'GR-2024-0054', poRef: 'PO-2024-0087', supplier: '家具制造商', material: '人体工学办公椅', orderedQty: 20, receivedQty: 15, unit: '把', status: 'partial', plant: '1000', storageLocation: 'WH01', receivedAt: '2024-01-23 16:20', receiver: '钱七' },
  { id: '4', grNumber: 'GR-2024-0053', poRef: 'PO-2024-0086', supplier: 'Dell 官方商城', material: 'Dell 27" 4K显示器', orderedQty: 15, receivedQty: 0, unit: '台', status: 'inbound', plant: '1000', storageLocation: 'WH01', receivedAt: '-', receiver: '-' },
  { id: '5', grNumber: 'GR-2024-0052', poRef: 'PO-2024-0085', supplier: 'IT配件供应商', material: '无线键鼠套装', orderedQty: 30, receivedQty: 30, unit: '套', status: 'received', plant: '1000', storageLocation: 'WH02', receivedAt: '2024-01-22 09:15', receiver: '孙八' },
  { id: '6', grNumber: 'GR-2024-0051', poRef: 'PO-2024-0084', supplier: '投影设备商', material: '投影仪', orderedQty: 2, receivedQty: 0, unit: '台', status: 'planned', plant: '1000', storageLocation: 'WH01', receivedAt: '-', receiver: '-' },
];

export function GoodsReceiptPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalCount = 56;
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

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleView = (id: string) => navigate(`/goods-receipt/${id}`);

  return (
    <div className="min-h-screen pb-6">
      {/* List Report Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* 彩色渐变头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {Icons.truck}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold">收货管理</h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      List Report
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">MIGO - 管理采购收货和库存入库</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/goods-receipt/create')}
                  className="h-10 px-5 rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 flex items-center gap-2 transition-colors shadow-sm"
                >
                  {Icons.plus}
                  <span>创建收货</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
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
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  显示 {displayCount} 项
                </span>
              )}
            </div>

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
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="导出">
                {Icons.download}
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="列设置">
                {Icons.columns}
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="设置">
                {Icons.settings}
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="帮助">
                {Icons.help}
              </button>
            </div>
          </div>
        </div>

        {/* 搜索筛选 */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="搜索收货单号、采购订单、供应商..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-9 px-3 rounded-lg text-sm flex items-center gap-2 transition-colors",
                showFilters ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {Icons.filter}
              <span>筛选</span>
            </button>
            <button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              应用
            </button>
          </div>
        </div>

        {/* 数据表格 */}
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
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    收货单号 {Icons.sort}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">采购订单</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">供应商</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">物料</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">订单数量</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">收货数量</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">存储位置</th>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    收货时间 {Icons.sort}
                  </div>
                </th>
                <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.map((item) => {
                const status = statusConfig[item.status as keyof typeof statusConfig];
                const isFullyReceived = item.receivedQty === item.orderedQty && item.receivedQty > 0;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => toggleSelectRow(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleView(item.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {item.grNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-blue-600">{item.poRef}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{item.supplier}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{item.material}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-900">{item.orderedQty}</span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        isFullyReceived ? "text-green-600" : item.receivedQty > 0 ? "text-amber-600" : "text-gray-400"
                      )}>
                        {item.receivedQty}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{item.plant}/{item.storageLocation}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.receivedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="查看"
                        >
                          {Icons.eye}
                        </button>
                        {item.status !== 'received' && (
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="编辑"
                          >
                            {Icons.edit}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {totalCount} 条记录</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">每页</span>
            <select className="h-8 px-2 rounded border border-gray-200 text-sm">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span className="text-sm text-gray-500">条</span>
            <div className="flex items-center gap-1 ml-4">
              <button className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 3.5l-3 3.5 3 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded bg-blue-600 text-white text-sm font-medium">1</button>
              <button className="w-8 h-8 rounded text-gray-600 text-sm hover:bg-gray-100">2</button>
              <button className="w-8 h-8 rounded text-gray-600 text-sm hover:bg-gray-100">3</button>
              <span className="text-gray-400">...</span>
              <button className="w-8 h-8 rounded text-gray-600 text-sm hover:bg-gray-100">6</button>
              <button className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5.5 3.5l3 3.5-3 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoodsReceiptPage;
