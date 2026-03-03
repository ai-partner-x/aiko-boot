/**
 * 成本中心主数据页面
 * 使用 Master-Detail 布局
 */

import { useState } from 'react';
import { 
  MasterDetail, 
  DetailSection, 
  DetailField, 
  DetailFieldGrid,
  type MasterDetailItem 
} from '../../../components/MasterDetail';

// 成本中心图标
const CostCenterIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7" />
    <path d="M9 5v4l3 2" strokeLinecap="round" />
  </svg>
);

// 数据类型
interface CostCenter extends MasterDetailItem {
  ccCode: string;
  ccName: string;
  ccType: string;
  department: string;
  companyCode: string;
  controllingArea: string;
  profitCenter: string;
  manager: string;
  budget: number;
  used: number;
  currency: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据
const mockCostCenters: CostCenter[] = [
  {
    id: '1',
    title: 'CC1001 - 研发中心',
    subtitle: '研发部',
    badge: '¥850万',
    ccCode: 'CC1001',
    ccName: '研发中心',
    ccType: '研发',
    department: '研发部',
    companyCode: '1000',
    controllingArea: '1000',
    profitCenter: 'PC1001',
    manager: '张三',
    budget: 8500000,
    used: 6230000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'CC1002 - 市场营销',
    subtitle: '市场部',
    badge: '¥320万',
    ccCode: 'CC1002',
    ccName: '市场营销',
    ccType: '营销',
    department: '市场部',
    companyCode: '1000',
    controllingArea: '1000',
    profitCenter: 'PC1002',
    manager: '李四',
    budget: 3200000,
    used: 2890000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '3',
    title: 'CC1003 - 行政管理',
    subtitle: '行政部',
    badge: '¥150万',
    ccCode: 'CC1003',
    ccName: '行政管理',
    ccType: '管理',
    department: '行政部',
    companyCode: '1000',
    controllingArea: '1000',
    profitCenter: 'PC1003',
    manager: '王五',
    budget: 1500000,
    used: 980000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '4',
    title: 'CC1004 - 人力资源',
    subtitle: 'HR部',
    badge: '¥120万',
    ccCode: 'CC1004',
    ccName: '人力资源',
    ccType: '管理',
    department: 'HR部',
    companyCode: '1000',
    controllingArea: '1000',
    profitCenter: 'PC1003',
    manager: '赵六',
    budget: 1200000,
    used: 750000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '5',
    title: 'CC1005 - 财务管理',
    subtitle: '财务部',
    badge: '¥80万',
    ccCode: 'CC1005',
    ccName: '财务管理',
    ccType: '管理',
    department: '财务部',
    companyCode: '1000',
    controllingArea: '1000',
    profitCenter: 'PC1003',
    manager: '钱七',
    budget: 800000,
    used: 520000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '6',
    title: 'CC2001 - 华东销售',
    subtitle: '华东区',
    badge: '¥280万',
    ccCode: 'CC2001',
    ccName: '华东销售',
    ccType: '销售',
    department: '华东销售部',
    companyCode: '2000',
    controllingArea: '1000',
    profitCenter: 'PC2001',
    manager: '孙八',
    budget: 2800000,
    used: 2150000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '7',
    title: 'CC3001 - 生产制造',
    subtitle: '生产部',
    badge: '¥1200万',
    ccCode: 'CC3001',
    ccName: '生产制造',
    ccType: '生产',
    department: '生产部',
    companyCode: '3000',
    controllingArea: '1000',
    profitCenter: 'PC3001',
    manager: '周九',
    budget: 12000000,
    used: 9800000,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '8',
    title: 'CC9999 - 待分配',
    subtitle: '临时',
    ccCode: 'CC9999',
    ccName: '待分配成本中心',
    ccType: '其他',
    department: '-',
    companyCode: '1000',
    controllingArea: '1000',
    profitCenter: '-',
    manager: '系统管理员',
    budget: 0,
    used: 0,
    currency: 'CNY',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: { label: '停用', color: 'gray' },
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(0)}万`;
  }
  return `¥${amount.toLocaleString()}`;
};

export function CostCentersPage() {
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredCostCenters = mockCostCenters.filter(cc => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      cc.ccCode.toLowerCase().includes(keyword) ||
      cc.ccName.toLowerCase().includes(keyword) ||
      cc.department.toLowerCase().includes(keyword)
    );
  });

  const renderDetail = (cc: CostCenter, actionButtons?: React.ReactNode) => {
    const usagePercent = cc.budget > 0 ? Math.round((cc.used / cc.budget) * 100) : 0;
    const remaining = cc.budget - cc.used;

    return (
      <div className="space-y-4">
        {/* 头部信息卡 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold">{cc.ccCode.slice(-4)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{cc.ccName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{cc.ccCode} · {cc.department}</p>
            </div>
            {actionButtons}
          </div>

          {/* 预算使用情况 */}
          {cc.budget > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">预算使用情况</span>
                <span className="text-sm font-medium text-gray-900">{usagePercent}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-500">已使用 {formatAmount(cc.used)}</span>
                <span className="text-gray-500">剩余 {formatAmount(remaining)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <DetailSection title="基本信息">
          <DetailFieldGrid columns={3}>
            <DetailField label="成本中心代码" value={<span className="font-mono font-semibold text-orange-600">{cc.ccCode}</span>} />
            <DetailField label="成本中心名称" value={cc.ccName} />
            <DetailField label="成本中心类型" value={cc.ccType} />
            <DetailField label="所属部门" value={cc.department} />
            <DetailField label="负责人" value={cc.manager} />
            <DetailField 
              label="状态" 
              value={
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  cc.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cc.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {cc.status?.label}
                </span>
              } 
            />
          </DetailFieldGrid>
        </DetailSection>

        {/* 组织信息 */}
        <DetailSection title="组织信息">
          <DetailFieldGrid columns={3}>
            <DetailField label="公司代码" value={cc.companyCode} />
            <DetailField label="控制范围" value={cc.controllingArea} />
            <DetailField label="利润中心" value={cc.profitCenter} />
          </DetailFieldGrid>
        </DetailSection>

        {/* 预算信息 */}
        <DetailSection title="预算信息">
          <DetailFieldGrid columns={4}>
            <DetailField label="预算金额" value={<span className="font-semibold">{formatAmount(cc.budget)}</span>} />
            <DetailField label="已使用" value={formatAmount(cc.used)} />
            <DetailField label="剩余" value={formatAmount(remaining)} />
            <DetailField label="币种" value={cc.currency} />
          </DetailFieldGrid>
        </DetailSection>

        {/* 有效期 */}
        <DetailSection title="有效期">
          <DetailFieldGrid columns={2}>
            <DetailField label="有效期从" value={cc.validFrom} />
            <DetailField label="有效期至" value={cc.validTo} />
          </DetailFieldGrid>
        </DetailSection>

        {/* 系统信息 */}
        <DetailSection title="系统信息">
          <DetailFieldGrid columns={2}>
            <DetailField label="创建时间" value={cc.createdAt} />
            <DetailField label="最后更新" value={cc.updatedAt} />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    );
  };

  return (
    <MasterDetail
      title="成本中心"
      subtitle="管理系统中的成本中心和预算分配"
      headerIcon={CostCenterIcon}
      items={filteredCostCenters}
      onSearch={setSearchKeyword}
      searchPlaceholder="搜索成本中心代码、名称或部门..."
      primaryAction={{
        label: '新建成本中心',
        onClick: () => alert('创建新成本中心'),
      }}
      renderDetail={renderDetail}
      masterWidth={320}
    />
  );
}

export default CostCentersPage;
