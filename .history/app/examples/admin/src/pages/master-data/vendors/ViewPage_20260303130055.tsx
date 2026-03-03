/**
 * 供应商主数据详情页
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
  vendor: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 16V4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
      <path d="M6 6h8M6 10h5M6 14h3" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" />
    </svg>
  ),
};

// Mock 数据
const mockVendor = {
  id: '1',
  vendorCode: 'VD-001',
  vendorName: '联想集团',
  vendorType: 'supplier',
  vendorTypeName: '供货商',
  status: 'active' as const,
  
  // 地址信息
  country: '中国',
  province: '北京市',
  city: '北京',
  district: '海淀区',
  address: '中关村软件园二期',
  postalCode: '100085',
  
  // 联系信息
  contactPerson: '王经理',
  phone: '010-12345678',
  mobile: '138-0000-0001',
  fax: '010-12345679',
  email: 'wang@lenovo.com',
  website: 'www.lenovo.com.cn',
  
  // 银行信息
  bankName: '中国工商银行北京分行',
  bankAccount: '6222 **** **** 1234',
  taxNumber: '91110000100001234X',
  
  // 业务信息
  paymentTerms: '30天净付',
  currency: 'CNY',
  incoterms: 'DDP',
  
  // 统计数据
  totalOrders: 156,
  totalAmount: 12580000,
  avgDeliveryDays: 3.5,
  qualityScore: 98.5,
  
  // 时间信息
  createdAt: '2023-01-15 09:00:00',
  createdBy: '系统管理员',
  updatedAt: '2024-01-10 15:30:00',
  updatedBy: '采购专员',
};

// 状态配置
const statusConfig = {
  active: { label: '合作中', color: 'bg-green-50 text-green-600 border-green-200' },
  inactive: { label: '暂停', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  blocked: { label: '黑名单', color: 'bg-red-50 text-red-600 border-red-200' },
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = mockVendor;
  const status = statusConfig[data.status];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <button onClick={() => navigate('/master-data/vendors')} className="hover:text-white flex items-center gap-1">
              {Icons.back}
              <span>供应商主数据</span>
            </button>
            <span>/</span>
            <span className="text-white">{data.vendorCode}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                {Icons.vendor}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{data.vendorName}</h1>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", status.color)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-white/80">{data.vendorCode} · {data.vendorTypeName}</p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/master-data/vendors/${id}/edit`)}
              className="h-10 px-5 rounded-lg bg-white text-teal-600 text-sm font-semibold hover:bg-teal-50 flex items-center gap-2 transition-colors"
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
                    <p className="text-xs text-gray-400 mb-1">供应商编码</p>
                    <p className="text-sm text-gray-900 font-medium">{data.vendorCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">供应商名称</p>
                    <p className="text-sm text-gray-900">{data.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">供应商类型</p>
                    <p className="text-sm text-gray-900">{data.vendorTypeName}</p>
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

            {/* 地址信息 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
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
                    <p className="text-xs text-gray-400 mb-1">联系人</p>
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
                  <div>
                    <p className="text-xs text-gray-400 mb-1">网站</p>
                    <p className="text-sm text-blue-600">{data.website}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 银行与财务 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">银行与财务</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">开户银行</p>
                    <p className="text-sm text-gray-900">{data.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">银行账号</p>
                    <p className="text-sm text-gray-900 font-mono">{data.bankAccount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">税号</p>
                    <p className="text-sm text-gray-900 font-mono">{data.taxNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">付款条件</p>
                    <p className="text-sm text-gray-900">{data.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">货币</p>
                    <p className="text-sm text-gray-900">{data.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">贸易条款</p>
                    <p className="text-sm text-gray-900">{data.incoterms}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 业务统计 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium text-gray-900 text-sm">业务统计</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">订单数量</span>
                  <span className="text-sm font-semibold text-gray-900">{data.totalOrders} 单</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">采购金额</span>
                  <span className="text-sm font-semibold text-blue-600">¥{(data.totalAmount / 10000).toFixed(0)}万</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">平均交货</span>
                  <span className="text-sm font-semibold text-gray-900">{data.avgDeliveryDays} 天</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">质量评分</span>
                  <span className="text-sm font-semibold text-green-600">{data.qualityScore}%</span>
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
