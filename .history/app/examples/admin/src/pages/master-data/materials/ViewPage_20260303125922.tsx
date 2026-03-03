/**
 * 物料主数据详情页
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
  material: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="16" height="16" rx="2" />
      <path d="M6 6h8M6 10h8M6 14h5" strokeLinecap="round" />
    </svg>
  ),
};

// Mock 数据
const mockMaterial = {
  id: '1',
  materialCode: 'IT-001',
  materialName: 'MacBook Pro 14" M3',
  materialType: 'FERT',
  materialTypeName: '成品',
  materialGroup: 'IT设备',
  baseUnit: '台',
  description: 'Apple MacBook Pro 14英寸 M3芯片 16GB内存 512GB存储',
  status: 'active' as const,
  
  // 基本数据
  grossWeight: 1.55,
  netWeight: 1.50,
  weightUnit: 'KG',
  volume: 0.002,
  volumeUnit: 'M3',
  
  // 采购数据
  purchaseGroup: 'IT采购组',
  orderUnit: '台',
  minOrderQty: 1,
  standardPrice: 18900,
  priceUnit: 'CNY',
  
  // 库存数据
  totalStock: 25,
  availableStock: 20,
  reservedStock: 5,
  valuationType: '移动平均价',
  
  // 时间信息
  createdAt: '2024-01-01 10:00:00',
  createdBy: '张三',
  updatedAt: '2024-01-15 14:30:00',
  updatedBy: '李四',
};

// 状态配置
const statusConfig = {
  active: { label: '启用', color: 'bg-green-50 text-green-600 border-green-200' },
  inactive: { label: '停用', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  blocked: { label: '冻结', color: 'bg-red-50 text-red-600 border-red-200' },
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = mockMaterial;
  const status = statusConfig[data.status];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <button onClick={() => navigate('/master-data/materials')} className="hover:text-white flex items-center gap-1">
              {Icons.back}
              <span>物料主数据</span>
            </button>
            <span>/</span>
            <span className="text-white">{data.materialCode}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                {Icons.material}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{data.materialName}</h1>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", status.color)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-white/80">{data.materialCode} · {data.materialTypeName}</p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/master-data/materials/${id}/edit`)}
              className="h-10 px-5 rounded-lg bg-white text-purple-600 text-sm font-semibold hover:bg-purple-50 flex items-center gap-2 transition-colors"
            >
              {Icons.edit}
              <span>编辑</span>
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-6 -mt-4">
        <div className="grid grid-cols-3 gap-6">
          {/* 主内容区 */}
          <div className="col-span-2 space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">基本信息</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">物料编码</p>
                    <p className="text-sm text-gray-900 font-medium">{data.materialCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">物料名称</p>
                    <p className="text-sm text-gray-900">{data.materialName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">物料类型</p>
                    <p className="text-sm text-gray-900">{data.materialTypeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">物料组</p>
                    <p className="text-sm text-gray-900">{data.materialGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">基本单位</p>
                    <p className="text-sm text-gray-900">{data.baseUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">状态</p>
                    <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-1">描述</p>
                    <p className="text-sm text-gray-900">{data.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 规格信息 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">规格信息</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">毛重</p>
                    <p className="text-sm text-gray-900">{data.grossWeight} {data.weightUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">净重</p>
                    <p className="text-sm text-gray-900">{data.netWeight} {data.weightUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">体积</p>
                    <p className="text-sm text-gray-900">{data.volume} {data.volumeUnit}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 采购数据 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">采购数据</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">采购组</p>
                    <p className="text-sm text-gray-900">{data.purchaseGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">订单单位</p>
                    <p className="text-sm text-gray-900">{data.orderUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">最小订单量</p>
                    <p className="text-sm text-gray-900">{data.minOrderQty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">标准价格</p>
                    <p className="text-sm text-gray-900 font-medium">¥{data.standardPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 库存概览 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium text-gray-900 text-sm">库存概览</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">总库存</span>
                  <span className="text-sm font-semibold text-gray-900">{data.totalStock} {data.baseUnit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">可用库存</span>
                  <span className="text-sm font-semibold text-green-600">{data.availableStock} {data.baseUnit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">预留库存</span>
                  <span className="text-sm font-semibold text-orange-600">{data.reservedStock} {data.baseUnit}</span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">计价类型</span>
                    <span className="text-sm text-gray-900">{data.valuationType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 变更记录 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium text-gray-900 text-sm">变更记录</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">创建时间</p>
                  <p className="text-sm text-gray-900">{data.createdAt}</p>
                  <p className="text-xs text-gray-500">由 {data.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">最后更新</p>
                  <p className="text-sm text-gray-900">{data.updatedAt}</p>
                  <p className="text-xs text-gray-500">由 {data.updatedBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPage;
