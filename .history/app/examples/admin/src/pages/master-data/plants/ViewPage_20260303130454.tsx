/**
 * 工厂/仓库主数据详情页
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
  plant: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 18V8l6-6 6 6v10H2zM14 18V4h4v14h-4z" />
      <path d="M6 18v-5h4v5M16 9h0M16 12h0" strokeLinecap="round" />
    </svg>
  ),
  location: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 14s-5-4.5-5-7.5a5 5 0 1110 0c0 3-5 7.5-5 7.5z" />
      <circle cx="8" cy="6.5" r="1.5" />
    </svg>
  ),
  storage: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="4" rx="1" />
      <rect x="2" y="9" width="12" height="4" rx="1" />
      <circle cx="4.5" cy="5" r="0.5" fill="currentColor" />
      <circle cx="4.5" cy="11" r="0.5" fill="currentColor" />
    </svg>
  ),
};

// Mock 数据
const mockPlant = {
  id: '1',
  plantCode: '1000',
  plantName: '北京总部工厂',
  plantType: 'plant' as const,
  plantTypeName: '生产工厂',
  status: 'active' as const,
  
  // 组织信息
  companyCode: 'CN01',
  companyName: '中国区公司',
  purchaseOrg: '1000',
  purchaseOrgName: '采购组织 1000',
  salesOrg: '1000',
  salesOrgName: '销售组织 1000',
  
  // 地址信息
  country: '中国',
  province: '北京市',
  city: '北京',
  district: '海淀区',
  address: '中关村软件园二期',
  postalCode: '100085',
  
  // 联系信息
  contactPerson: '张厂长',
  phone: '010-12345678',
  mobile: '139-0000-0001',
  fax: '010-12345679',
  email: 'zhang@company.com',
  
  // 运营信息
  workingHours: '08:00 - 18:00',
  workingDays: '周一至周六',
  timezone: 'GMT+8',
  language: '中文',
  
  // 存储位置
  storageLocations: [
    { code: 'SL01', name: '原材料仓', type: '原材料', capacity: '2000 m³', utilization: 75 },
    { code: 'SL02', name: '成品仓', type: '成品', capacity: '3000 m³', utilization: 60 },
    { code: 'SL03', name: '半成品仓', type: '半成品', capacity: '1500 m³', utilization: 45 },
    { code: 'SL04', name: '备件仓', type: '备件', capacity: '500 m³', utilization: 30 },
    { code: 'SL05', name: '危险品仓', type: '特殊', capacity: '200 m³', utilization: 20 },
  ],
  
  // 统计数据
  totalMaterials: 1256,
  pendingOrders: 45,
  avgTurnover: 12.5,
  totalCapacity: '7200 m³',
  
  // 时间信息
  createdAt: '2020-01-01 09:00:00',
  createdBy: '系统管理员',
  updatedAt: '2024-01-15 14:30:00',
  updatedBy: '运营专员',
};

// 状态配置
const statusConfig = {
  active: { label: '运营中', color: 'bg-green-50 text-green-600 border-green-200' },
  inactive: { label: '停用', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

// 类型配置
const plantTypeConfig = {
  plant: { label: '生产工厂', color: 'bg-blue-50 text-blue-600' },
  warehouse: { label: '仓库', color: 'bg-orange-50 text-orange-600' },
  dc: { label: '配送中心', color: 'bg-purple-50 text-purple-600' },
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = mockPlant;
  const status = statusConfig[data.status];
  const typeConfig = plantTypeConfig[data.plantType];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <button onClick={() => navigate('/master-data/plants')} className="hover:text-white flex items-center gap-1">
              {Icons.back}
              <span>工厂与仓库</span>
            </button>
            <span>/</span>
            <span className="text-white">{data.plantCode}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                {Icons.plant}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{data.plantName}</h1>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", status.color)}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>{data.plantCode}</span>
                  <span>·</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/master-data/plants/${id}/edit`)}
              className="h-10 px-5 rounded-lg bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition-colors"
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
                    <p className="text-xs text-gray-400 mb-1">工厂/仓库编码</p>
                    <p className="text-sm text-gray-900 font-medium">{data.plantCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">名称</p>
                    <p className="text-sm text-gray-900">{data.plantName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">类型</p>
                    <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", typeConfig.color)}>
                      {typeConfig.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">状态</p>
                    <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 组织结构 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">组织结构</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">公司代码</p>
                    <p className="text-sm text-gray-900">{data.companyCode} - {data.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">采购组织</p>
                    <p className="text-sm text-gray-900">{data.purchaseOrg} - {data.purchaseOrgName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">销售组织</p>
                    <p className="text-sm text-gray-900">{data.salesOrg} - {data.salesOrgName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 地址信息 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                {Icons.location}
                <h2 className="font-semibold text-gray-900">地址信息</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">国家/地区</p>
                    <p className="text-sm text-gray-900">{data.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">省/市</p>
                    <p className="text-sm text-gray-900">{data.province} · {data.city}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-1">详细地址</p>
                    <p className="text-sm text-gray-900">{data.district} {data.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">邮政编码</p>
                    <p className="text-sm text-gray-900">{data.postalCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">联系信息</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">负责人</p>
                    <p className="text-sm text-gray-900">{data.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">电话</p>
                    <p className="text-sm text-gray-900">{data.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">手机</p>
                    <p className="text-sm text-gray-900">{data.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">传真</p>
                    <p className="text-sm text-gray-900">{data.fax}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">邮箱</p>
                    <p className="text-sm text-blue-600">{data.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 存储位置 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                {Icons.storage}
                <h2 className="font-semibold text-gray-900">存储位置</h2>
                <span className="text-sm text-gray-500">({data.storageLocations.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">编码</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">容量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">利用率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.storageLocations.map((loc) => (
                      <tr key={loc.code} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <span className="text-sm font-medium text-blue-600">{loc.code}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-900">{loc.name}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-600">{loc.type}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-600">{loc.capacity}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  loc.utilization > 80 ? 'bg-red-500' : loc.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                )}
                                style={{ width: `${loc.utilization}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{loc.utilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 运营信息 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium text-gray-900 text-sm">运营信息</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">工作时间</p>
                  <p className="text-sm text-gray-900">{data.workingHours}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">工作日</p>
                  <p className="text-sm text-gray-900">{data.workingDays}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">时区</p>
                  <p className="text-sm text-gray-900">{data.timezone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">语言</p>
                  <p className="text-sm text-gray-900">{data.language}</p>
                </div>
              </div>
            </div>

            {/* 库存统计 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium text-gray-900 text-sm">库存统计</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">物料种类</span>
                  <span className="text-sm font-semibold text-gray-900">{data.totalMaterials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">待处理订单</span>
                  <span className="text-sm font-semibold text-orange-600">{data.pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">平均周转天数</span>
                  <span className="text-sm font-semibold text-gray-900">{data.avgTurnover} 天</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">总容量</span>
                  <span className="text-sm font-semibold text-blue-600">{data.totalCapacity}</span>
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
