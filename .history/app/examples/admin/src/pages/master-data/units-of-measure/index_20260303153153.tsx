/**
 * 计量单位主数据页面
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

// 计量单位图标
const UomIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 14h14M4 10v4M9 6v8M14 2v12" strokeLinecap="round" />
  </svg>
);

// 数据类型
interface UnitOfMeasure extends MasterDetailItem {
  uomCode: string;
  uomName: string;
  dimension: string;
  baseUnit: string;
  conversionFactor: number;
  isoCode: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据
const mockUnits: UnitOfMeasure[] = [
  {
    id: '1',
    title: 'EA - 个/件',
    subtitle: '数量',
    uomCode: 'EA',
    uomName: '个/件',
    dimension: '数量',
    baseUnit: 'EA',
    conversionFactor: 1,
    isoCode: 'EA',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'PC - 台',
    subtitle: '数量',
    uomCode: 'PC',
    uomName: '台',
    dimension: '数量',
    baseUnit: 'EA',
    conversionFactor: 1,
    isoCode: 'H87',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '3',
    title: 'BOX - 箱',
    subtitle: '数量',
    uomCode: 'BOX',
    uomName: '箱',
    dimension: '数量',
    baseUnit: 'EA',
    conversionFactor: 12,
    isoCode: 'BX',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '4',
    title: 'KG - 千克',
    subtitle: '重量',
    uomCode: 'KG',
    uomName: '千克',
    dimension: '重量',
    baseUnit: 'KG',
    conversionFactor: 1,
    isoCode: 'KGM',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '5',
    title: 'G - 克',
    subtitle: '重量',
    uomCode: 'G',
    uomName: '克',
    dimension: '重量',
    baseUnit: 'KG',
    conversionFactor: 0.001,
    isoCode: 'GRM',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '6',
    title: 'T - 吨',
    subtitle: '重量',
    uomCode: 'T',
    uomName: '吨',
    dimension: '重量',
    baseUnit: 'KG',
    conversionFactor: 1000,
    isoCode: 'TNE',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '7',
    title: 'M - 米',
    subtitle: '长度',
    uomCode: 'M',
    uomName: '米',
    dimension: '长度',
    baseUnit: 'M',
    conversionFactor: 1,
    isoCode: 'MTR',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '8',
    title: 'CM - 厘米',
    subtitle: '长度',
    uomCode: 'CM',
    uomName: '厘米',
    dimension: '长度',
    baseUnit: 'M',
    conversionFactor: 0.01,
    isoCode: 'CMT',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '9',
    title: 'L - 升',
    subtitle: '体积',
    uomCode: 'L',
    uomName: '升',
    dimension: '体积',
    baseUnit: 'L',
    conversionFactor: 1,
    isoCode: 'LTR',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '10',
    title: 'ML - 毫升',
    subtitle: '体积',
    uomCode: 'ML',
    uomName: '毫升',
    dimension: '体积',
    baseUnit: 'L',
    conversionFactor: 0.001,
    isoCode: 'MLT',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '11',
    title: 'SET - 套',
    subtitle: '数量',
    uomCode: 'SET',
    uomName: '套',
    dimension: '数量',
    baseUnit: 'EA',
    conversionFactor: 1,
    isoCode: 'SET',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '12',
    title: 'PAL - 托盘',
    subtitle: '数量',
    uomCode: 'PAL',
    uomName: '托盘',
    dimension: '数量',
    baseUnit: 'EA',
    conversionFactor: 48,
    isoCode: 'PF',
    status: { label: '停用', color: 'gray' },
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

export function UnitsOfMeasurePage() {
  const [searchKeyword, setSearchKeyword] = useState('');

  // 搜索过滤
  const filteredUnits = mockUnits.filter(u => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      u.uomCode.toLowerCase().includes(keyword) ||
      u.uomName.toLowerCase().includes(keyword) ||
      u.dimension.toLowerCase().includes(keyword)
    );
  });

  // 渲染详情
  const renderDetail = (uom: UnitOfMeasure) => (
    <div className="p-6 space-y-6">
      {/* 头部信息卡 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
            <span className="text-xl font-bold">{uom.uomCode}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{uom.uomName}</h2>
            <p className="text-sm text-gray-500 mt-1">{uom.uomCode} · {uom.dimension}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-gray-900">{uom.conversionFactor}</div>
            <div className="text-sm text-gray-500">换算系数 (对{uom.baseUnit})</div>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="单位代码" value={<span className="font-mono font-semibold text-emerald-600">{uom.uomCode}</span>} />
          <DetailField label="单位名称" value={uom.uomName} />
          <DetailField label="计量维度" value={uom.dimension} />
          <DetailField label="基本单位" value={uom.baseUnit} />
          <DetailField label="ISO 代码" value={uom.isoCode} />
          <DetailField 
            label="状态" 
            value={
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                uom.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  uom.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'
                }`} />
                {uom.status?.label}
              </span>
            } 
          />
        </DetailFieldGrid>
      </DetailSection>

      {/* 换算信息 */}
      <DetailSection title="换算信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="换算系数" value={uom.conversionFactor} />
          <DetailField label="换算公式" value={`1 ${uom.uomCode} = ${uom.conversionFactor} ${uom.baseUnit}`} />
        </DetailFieldGrid>
      </DetailSection>

      {/* 系统信息 */}
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={uom.createdAt} />
          <DetailField label="最后更新" value={uom.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <MasterDetail
      title="计量单位"
      subtitle="管理系统中使用的计量单位和换算关系"
      headerIcon={UomIcon}
      items={filteredUnits}
      onSearch={setSearchKeyword}
      searchPlaceholder="搜索单位代码、名称或维度..."
      primaryAction={{
        label: '新建单位',
        onClick: () => alert('创建新计量单位'),
      }}
      renderDetail={renderDetail}
      masterWidth={300}
    />
  );
}

export default UnitsOfMeasurePage;
