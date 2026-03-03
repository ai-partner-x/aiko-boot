/**
 * 币种主数据页面
 * 使用 Master-Detail 布局
 */

import { useState } from 'react';
import { 
  MasterDetail, 
  DetailSection, 
  DetailField, 
  DetailFieldGrid,
  type MasterDetailItem 
} from '../../components/MasterDetail';

// 币种图标
const CurrencyIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7" />
    <path d="M6 7.5h6M6 10.5h6M9 5v8" strokeLinecap="round" />
  </svg>
);

// 各币种专属图标
const currencyIcons: Record<string, React.ReactNode> = {
  CNY: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="9" y="13" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none">¥</text>
    </svg>
  ),
  USD: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="9" y="13" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none">$</text>
    </svg>
  ),
  EUR: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="9" y="13" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none">€</text>
    </svg>
  ),
  GBP: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="9" y="13" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none">£</text>
    </svg>
  ),
  JPY: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="9" y="13" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none">¥</text>
    </svg>
  ),
};

// 数据类型
interface Currency extends MasterDetailItem {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  decimalPlaces: number;
  exchangeRate: number;
  country: string;
  isoCode: string;
  minorUnit: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据
const mockCurrencies: Currency[] = [
  {
    id: '1',
    title: 'CNY - 人民币',
    subtitle: '中国',
    currencyCode: 'CNY',
    currencyName: '人民币',
    symbol: '¥',
    decimalPlaces: 2,
    exchangeRate: 1,
    country: '中国',
    isoCode: '156',
    minorUnit: '分',
    status: { label: '启用', color: 'green' },
    icon: currencyIcons.CNY,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'USD - 美元',
    subtitle: '美国',
    currencyCode: 'USD',
    currencyName: '美元',
    symbol: '$',
    decimalPlaces: 2,
    exchangeRate: 7.24,
    country: '美国',
    isoCode: '840',
    minorUnit: '美分',
    status: { label: '启用', color: 'green' },
    icon: currencyIcons.USD,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '3',
    title: 'EUR - 欧元',
    subtitle: '欧盟',
    currencyCode: 'EUR',
    currencyName: '欧元',
    symbol: '€',
    decimalPlaces: 2,
    exchangeRate: 7.89,
    country: '欧盟',
    isoCode: '978',
    minorUnit: '欧分',
    status: { label: '启用', color: 'green' },
    icon: currencyIcons.EUR,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '4',
    title: 'JPY - 日元',
    subtitle: '日本',
    currencyCode: 'JPY',
    currencyName: '日元',
    symbol: '¥',
    decimalPlaces: 0,
    exchangeRate: 0.048,
    country: '日本',
    isoCode: '392',
    minorUnit: '-',
    status: { label: '启用', color: 'green' },
    icon: currencyIcons.JPY,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '5',
    title: 'GBP - 英镑',
    subtitle: '英国',
    currencyCode: 'GBP',
    currencyName: '英镑',
    symbol: '£',
    decimalPlaces: 2,
    exchangeRate: 9.15,
    country: '英国',
    isoCode: '826',
    minorUnit: '便士',
    status: { label: '启用', color: 'green' },
    icon: currencyIcons.GBP,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '6',
    title: 'HKD - 港币',
    subtitle: '中国香港',
    currencyCode: 'HKD',
    currencyName: '港币',
    symbol: 'HK$',
    decimalPlaces: 2,
    exchangeRate: 0.93,
    country: '中国香港',
    isoCode: '344',
    minorUnit: '仙',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '7',
    title: 'KRW - 韩元',
    subtitle: '韩国',
    currencyCode: 'KRW',
    currencyName: '韩元',
    symbol: '₩',
    decimalPlaces: 0,
    exchangeRate: 0.0054,
    country: '韩国',
    isoCode: '410',
    minorUnit: '-',
    status: { label: '停用', color: 'gray' },
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: '8',
    title: 'SGD - 新加坡元',
    subtitle: '新加坡',
    currencyCode: 'SGD',
    currencyName: '新加坡元',
    symbol: 'S$',
    decimalPlaces: 2,
    exchangeRate: 5.38,
    country: '新加坡',
    isoCode: '702',
    minorUnit: '分',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '9',
    title: 'AUD - 澳元',
    subtitle: '澳大利亚',
    currencyCode: 'AUD',
    currencyName: '澳元',
    symbol: 'A$',
    decimalPlaces: 2,
    exchangeRate: 4.72,
    country: '澳大利亚',
    isoCode: '036',
    minorUnit: '分',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '10',
    title: 'CAD - 加元',
    subtitle: '加拿大',
    currencyCode: 'CAD',
    currencyName: '加元',
    symbol: 'C$',
    decimalPlaces: 2,
    exchangeRate: 5.21,
    country: '加拿大',
    isoCode: '124',
    minorUnit: '分',
    status: { label: '启用', color: 'green' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
];

export function CurrenciesPage() {
  const [currencies, setCurrencies] = useState(mockCurrencies);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 搜索过滤
  const filteredCurrencies = currencies.filter(c => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      c.currencyCode.toLowerCase().includes(keyword) ||
      c.currencyName.toLowerCase().includes(keyword) ||
      c.country.toLowerCase().includes(keyword)
    );
  });

  // 渲染详情
  const renderDetail = (currency: Currency) => (
    <div className="p-6 space-y-6">
      {/* 头部信息卡 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
            {currency.symbol}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currency.currencyName}</h2>
            <p className="text-sm text-gray-500 mt-1">{currency.currencyCode} · {currency.country}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-gray-900">{currency.exchangeRate.toFixed(4)}</div>
            <div className="text-sm text-gray-500">对人民币汇率</div>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="币种代码" value={<span className="font-mono font-semibold text-blue-600">{currency.currencyCode}</span>} />
          <DetailField label="币种名称" value={currency.currencyName} />
          <DetailField label="货币符号" value={<span className="text-lg">{currency.symbol}</span>} />
          <DetailField label="国家/地区" value={currency.country} />
          <DetailField label="ISO 代码" value={currency.isoCode} />
          <DetailField label="辅币单位" value={currency.minorUnit} />
        </DetailFieldGrid>
      </DetailSection>

      {/* 设置信息 */}
      <DetailSection title="设置信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="小数位数" value={currency.decimalPlaces} />
          <DetailField label="汇率(对CNY)" value={currency.exchangeRate.toFixed(4)} />
          <DetailField 
            label="状态" 
            value={
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                currency.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  currency.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'
                }`} />
                {currency.status?.label}
              </span>
            } 
          />
        </DetailFieldGrid>
      </DetailSection>

      {/* 系统信息 */}
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={currency.createdAt} />
          <DetailField label="最后更新" value={currency.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <MasterDetail
      title="币种主数据"
      subtitle="管理系统中使用的货币类型和汇率"
      headerIcon={CurrencyIcon}
      items={filteredCurrencies}
      onSearch={setSearchKeyword}
      searchPlaceholder="搜索币种代码、名称或国家..."
      primaryAction={{
        label: '新建币种',
        onClick: () => alert('创建新币种'),
      }}
      renderDetail={renderDetail}
      masterWidth={320}
    />
  );
}

export default CurrenciesPage;
