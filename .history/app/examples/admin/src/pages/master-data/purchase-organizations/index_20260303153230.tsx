/**
 * 采购组织主数据页面
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

// 采购组织图标
const OrgIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="2" width="12" height="4" rx="1" />
    <rect x="1" y="10" width="6" height="4" rx="1" />
    <rect x="11" y="10" width="6" height="4" rx="1" />
    <path d="M9 6v4M4 10V8h10v2" />
  </svg>
);

// 数据类型
interface PurchaseOrg extends MasterDetailItem {
  orgCode: string;
  orgName: string;
  companyCode: string;
  companyName: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  manager: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据
const mockOrgs: PurchaseOrg[] = [
  {
    id: '1',
    title: '1000 - 总部采购组织',
    subtitle: '北京',
    description: '集团总部统一采购，负责战略采购和框架协议',
    orgCode: '1000',
    orgName: '总部采购组织',
    companyCode: '1000',
    companyName: 'XX科技集团有限公司',
    address: '朝阳区建国路89号',
    city: '北京',
    country: '中国',
    currency: 'CNY',
    manager: '张伟',
    email: 'procurement@company.com',
    phone: '010-88888888',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    title: '2000 - 华东采购组织',
    subtitle: '上海',
    description: '负责华东区域采购业务',
    orgCode: '2000',
    orgName: '华东采购组织',
    companyCode: '2000',
    companyName: 'XX科技(上海)有限公司',
    address: '浦东新区陆家嘴环路1000号',
    city: '上海',
    country: '中国',
    currency: 'CNY',
    manager: '李芳',
    email: 'procurement-sh@company.com',
    phone: '021-66666666',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '3',
    title: '3000 - 华南采购组织',
    subtitle: '深圳',
    description: '负责华南区域采购业务',
    orgCode: '3000',
    orgName: '华南采购组织',
    companyCode: '3000',
    companyName: 'XX科技(深圳)有限公司',
    address: '南山区科技园南区',
    city: '深圳',
    country: '中国',
    currency: 'CNY',
    manager: '王磊',
    email: 'procurement-sz@company.com',
    phone: '0755-88888888',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '4',
    title: '4000 - 西南采购组织',
    subtitle: '成都',
    description: '负责西南区域采购业务',
    orgCode: '4000',
    orgName: '西南采购组织',
    companyCode: '4000',
    companyName: 'XX科技(成都)有限公司',
    address: '高新区天府大道北段',
    city: '成都',
    country: '中国',
    currency: 'CNY',
    manager: '赵静',
    email: 'procurement-cd@company.com',
    phone: '028-88888888',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '5',
    title: '5000 - 海外采购组织',
    subtitle: '香港',
    description: '负责海外进口采购业务',
    orgCode: '5000',
    orgName: '海外采购组织',
    companyCode: '5000',
    companyName: 'XX Technology (HK) Limited',
    address: 'Central Plaza, Wan Chai',
    city: '香港',
    country: '中国香港',
    currency: 'HKD',
    manager: '陈明',
    email: 'procurement-hk@company.com',
    phone: '+852-23456789',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '6',
    title: '9000 - 测试采购组织',
    subtitle: '测试环境',
    description: '用于测试和培训',
    orgCode: '9000',
    orgName: '测试采购组织',
    companyCode: '9000',
    companyName: '测试公司',
    address: '测试地址',
    city: '北京',
    country: '中国',
    currency: 'CNY',
    manager: '系统管理员',
    email: 'test@company.com',
    phone: '-',
    status: { label: '停用', color: 'gray' },
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

export function PurchaseOrganizationsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredOrgs = mockOrgs.filter(o => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      o.orgCode.toLowerCase().includes(keyword) ||
      o.orgName.toLowerCase().includes(keyword) ||
      o.city.toLowerCase().includes(keyword)
    );
  });

  const renderDetail = (org: PurchaseOrg) => (
    <div className="p-6 space-y-6">
      {/* 头部信息卡 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
            <span className="text-xl font-bold">{org.orgCode}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{org.orgName}</h2>
            <p className="text-sm text-gray-500 mt-1">{org.companyName}</p>
            {org.description && (
              <p className="text-xs text-gray-400 mt-2">{org.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="组织代码" value={<span className="font-mono font-semibold text-violet-600">{org.orgCode}</span>} />
          <DetailField label="组织名称" value={org.orgName} />
          <DetailField label="公司代码" value={org.companyCode} />
          <DetailField label="公司名称" value={org.companyName} />
          <DetailField label="本位币" value={org.currency} />
          <DetailField 
            label="状态" 
            value={
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                org.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${org.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {org.status?.label}
              </span>
            } 
          />
        </DetailFieldGrid>
      </DetailSection>

      {/* 地址信息 */}
      <DetailSection title="地址信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="地址" value={org.address} />
          <DetailField label="城市" value={org.city} />
          <DetailField label="国家/地区" value={org.country} />
        </DetailFieldGrid>
      </DetailSection>

      {/* 联系信息 */}
      <DetailSection title="联系信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="负责人" value={org.manager} />
          <DetailField label="电子邮件" value={org.email} />
          <DetailField label="电话" value={org.phone} />
        </DetailFieldGrid>
      </DetailSection>

      {/* 系统信息 */}
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={org.createdAt} />
          <DetailField label="最后更新" value={org.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <MasterDetail
      title="采购组织"
      subtitle="管理系统中的采购组织架构"
      headerIcon={OrgIcon}
      items={filteredOrgs}
      onSearch={setSearchKeyword}
      searchPlaceholder="搜索组织代码、名称或城市..."
      primaryAction={{
        label: '新建组织',
        onClick: () => alert('创建新采购组织'),
      }}
      renderDetail={renderDetail}
      masterWidth={340}
    />
  );
}

export default PurchaseOrganizationsPage;
