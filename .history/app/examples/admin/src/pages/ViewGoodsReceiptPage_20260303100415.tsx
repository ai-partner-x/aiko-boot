/**
 * 收货详情页面
 * 基于 SAP Fiori Object Page 设计
 */

import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@aff/admin-component';

// 图标
const Icons = {
  back: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v6A1.5 1.5 0 003 10.5h2.5" />
    </svg>
  ),
  print: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6V1.5h8V6M4 11h8v3.5H4zM1.5 6h13v5a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 11V6z" />
    </svg>
  ),
  more: (
    <svg width="16" height="16" viewBox="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  ),
  truck: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4h11v10H1zM12 8h4l2.5 3.5v4.5H12z" />
      <circle cx="4.5" cy="15.5" r="1.5" />
      <circle cx="15" cy="15.5" r="1.5" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.5 8.5L6.5 11.5L12.5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 11V7.5M8 5.5v-.01" strokeLinecap="round" />
    </svg>
  ),
};

// 状态配置
const statusConfig = {
  planned: { label: '计划中', headerBg: 'from-gray-500 to-gray-600', badgeBg: 'bg-white/20' },
  inbound: { label: '运输中', headerBg: 'from-blue-500 to-indigo-600', badgeBg: 'bg-white/20' },
  arrived: { label: '已到达', headerBg: 'from-amber-500 to-orange-600', badgeBg: 'bg-white/20' },
  inspecting: { label: '检验中', headerBg: 'from-purple-500 to-indigo-600', badgeBg: 'bg-white/20' },
  received: { label: '已入库', headerBg: 'from-green-500 to-emerald-600', badgeBg: 'bg-white/20' },
  partial: { label: '部分收货', headerBg: 'from-orange-500 to-amber-600', badgeBg: 'bg-white/20' },
  rejected: { label: '已退回', headerBg: 'from-red-500 to-rose-600', badgeBg: 'bg-white/20' },
};

// 模拟详情数据
const mockDetail = {
  id: '1',
  grNumber: 'GR-2024-0056',
  poRef: 'PO-2024-0089',
  status: 'received',
  supplier: 'Apple 授权经销商',
  supplierCode: 'VD-001',
  plant: '1000',
  plantName: '上海工厂',
  storageLocation: 'WH01',
  storageName: '主仓库',
  receivedAt: '2024-01-25 14:30',
  receiver: '王五',
  movementType: '101',
  movementTypeName: '采购收货',
  deliveryNote: 'DN-2024-1234',
  billOfLading: 'BL-20240125',
  items: [
    { id: '1', lineNo: '10', material: 'M-1001', description: 'MacBook Pro 14" M3 Pro', orderedQty: 5, receivedQty: 5, unit: '台', batch: 'BATCH001', serialNumbers: ['SN001', 'SN002', 'SN003', 'SN004', 'SN005'], inspectionResult: '合格' },
    { id: '2', lineNo: '20', material: 'M-1002', description: 'MacBook Pro 14" M3 Max', orderedQty: 5, receivedQty: 5, unit: '台', batch: 'BATCH002', serialNumbers: ['SN006', 'SN007', 'SN008', 'SN009', 'SN010'], inspectionResult: '合格' },
  ],
  totalOrdered: 10,
  totalReceived: 10,
};

export function ViewGoodsReceiptPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const data = mockDetail;
  const status = statusConfig[data.status as keyof typeof statusConfig];
  const receivedPercent = Math.round((data.totalReceived / data.totalOrdered) * 100);

  return (
    <div className="space-y-6">
      {/* Object Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 彩色标题区 - 统一蓝色主题 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
          {/* 装饰圆形 */}
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-16 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5" />
          
          <div className="relative z-10">
            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
              <button 
                onClick={() => navigate('/goods-receipt')}
                className="hover:text-white flex items-center gap-1"
              >
                {Icons.back}
                收货管理
              </button>
              <span>/</span>
              <span className="text-white">{data.grNumber}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {Icons.truck}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold">{data.grNumber}</h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      {status.label}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">参考: {data.poRef}</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                {data.status !== 'received' && (
                  <button
                    onClick={() => navigate(`/goods-receipt/${id}/edit`)}
                    className="h-10 px-5 rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 flex items-center gap-2 transition-colors shadow-sm"
                  >
                    {Icons.edit}
                    <span>编辑</span>
                  </button>
                )}
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.copy}
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.print}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 关键信息 */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">收货日期</p>
              <p className="text-sm font-medium text-gray-900">{data.receivedAt.split(' ')[0]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">收货人</p>
              <p className="text-sm font-medium text-gray-900">{data.receiver}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">移动类型</p>
              <p className="text-sm font-medium text-gray-900">{data.movementType} - {data.movementTypeName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">供应商</p>
              <p className="text-sm font-medium text-gray-900">{data.supplier}</p>
            </div>
          </div>
        </div>

        {/* 收货进度 */}
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data.totalOrdered}</p>
              <p className="text-xs text-gray-400 mt-1">订单数量</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.totalReceived}</p>
              <p className="text-xs text-gray-400 mt-1">已收货数量</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold text-blue-600">{receivedPercent}%</p>
                {receivedPercent === 100 && (
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    {Icons.check}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">完成率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 库存信息 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">库存信息</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">工厂</p>
            <p className="text-sm text-gray-900">{data.plant} - {data.plantName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">存储地点</p>
            <p className="text-sm text-gray-900">{data.storageLocation} - {data.storageName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">交货单号</p>
            <p className="text-sm text-gray-900">{data.deliveryNote}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">提单号</p>
            <p className="text-sm text-gray-900">{data.billOfLading}</p>
          </div>
        </div>
      </div>

      {/* 行项目 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">收货明细</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
              {data.items.length} 项
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">行号</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">物料</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">描述</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">订单数量</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">收货数量</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">批次</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">检验结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => {
                const isFullyReceived = item.receivedQty === item.orderedQty;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.lineNo}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-blue-600">{item.material}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">{item.orderedQty}</span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        isFullyReceived ? "text-green-600" : "text-amber-600"
                      )}>
                        {item.receivedQty}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.batch}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        item.inspectionResult === '合格' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-red-50 text-red-600'
                      )}>
                        {item.inspectionResult}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">合计</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{data.totalOrdered}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-green-600">{data.totalReceived}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 处理记录 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">处理记录</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">收货完成</p>
                  <span className="text-xs text-gray-400">2024-01-25 14:30</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">王五 完成收货入库，共10件物料</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">质量检验</p>
                  <span className="text-xs text-gray-400">2024-01-25 12:00</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">质检员 检验所有物料，结果：全部合格</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">货物到达</p>
                  <span className="text-xs text-gray-400">2024-01-25 10:00</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">仓库确认货物到达，开始卸货</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">收货单创建</p>
                  <span className="text-xs text-gray-400">2024-01-24 16:00</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">系统基于采购订单 {data.poRef} 自动创建</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewGoodsReceiptPage;
