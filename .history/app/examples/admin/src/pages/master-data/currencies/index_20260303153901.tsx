/**
 * 币种主数据页面
 * 使用 Master-Detail 布局，支持 CRUD 操作
 */

import { useState } from 'react';
import { cn, Input, Label, Select, Button } from '@aff/admin-component';
import { 
  MasterDetail, 
  DetailSection, 
  DetailField, 
  DetailFieldGrid,
  type MasterDetailItem 
} from '../../../components/MasterDetail';

// 币种图标
const CurrencyIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7" />
    <path d="M6 7.5h6M6 10.5h6M9 5v8" strokeLinecap="round" />
  </svg>
);

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

// 初始数据
const initialCurrencies: Currency[] = [
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
];

// 表单弹窗组件
function FormDialog({ 
  isOpen, 
  onClose, 
  title, 
  children,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// 删除确认弹窗
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v5M10 13.5v.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            <p className="mt-2 text-sm text-gray-600">
              确定要删除 <span className="font-medium text-gray-900">{itemName}</span> 吗？此操作不可撤销。
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="destructive" onClick={onConfirm}>删除</Button>
        </div>
      </div>
    </div>
  );
}

export function CurrenciesPage() {
  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(currencies[0]?.id);
  
  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Currency | null>(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    currencyCode: '',
    currencyName: '',
    symbol: '',
    decimalPlaces: 2,
    exchangeRate: 1,
    country: '',
    isoCode: '',
    minorUnit: '',
    status: 'active',
  });

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

  // 重置表单
  const resetForm = () => {
    setFormData({
      currencyCode: '',
      currencyName: '',
      symbol: '',
      decimalPlaces: 2,
      exchangeRate: 1,
      country: '',
      isoCode: '',
      minorUnit: '',
      status: 'active',
    });
  };

  // 打开创建弹窗
  const handleCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  // 打开编辑弹窗
  const handleEdit = (item: Currency) => {
    setEditingItem(item);
    setFormData({
      currencyCode: item.currencyCode,
      currencyName: item.currencyName,
      symbol: item.symbol,
      decimalPlaces: item.decimalPlaces,
      exchangeRate: item.exchangeRate,
      country: item.country,
      isoCode: item.isoCode,
      minorUnit: item.minorUnit,
      status: item.status?.color === 'green' ? 'active' : 'inactive',
    });
    setShowEditDialog(true);
  };

  // 打开删除确认
  const handleDelete = (item: Currency) => {
    setEditingItem(item);
    setShowDeleteDialog(true);
  };

  // 提交创建
  const handleCreateSubmit = () => {
    const now = new Date().toISOString().split('T')[0];
    const newCurrency: Currency = {
      id: Date.now().toString(),
      title: `${formData.currencyCode} - ${formData.currencyName}`,
      subtitle: formData.country,
      currencyCode: formData.currencyCode,
      currencyName: formData.currencyName,
      symbol: formData.symbol,
      decimalPlaces: formData.decimalPlaces,
      exchangeRate: formData.exchangeRate,
      country: formData.country,
      isoCode: formData.isoCode,
      minorUnit: formData.minorUnit,
      status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' },
      createdAt: now,
      updatedAt: now,
    };
    setCurrencies([...currencies, newCurrency]);
    setSelectedId(newCurrency.id);
    setShowCreateDialog(false);
    resetForm();
  };

  // 提交编辑
  const handleEditSubmit = () => {
    if (!editingItem) return;
    const now = new Date().toISOString().split('T')[0];
    const updatedCurrencies = currencies.map(c => 
      c.id === editingItem.id
        ? {
            ...c,
            title: `${formData.currencyCode} - ${formData.currencyName}`,
            subtitle: formData.country,
            currencyCode: formData.currencyCode,
            currencyName: formData.currencyName,
            symbol: formData.symbol,
            decimalPlaces: formData.decimalPlaces,
            exchangeRate: formData.exchangeRate,
            country: formData.country,
            isoCode: formData.isoCode,
            minorUnit: formData.minorUnit,
            status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' } as const,
            updatedAt: now,
          }
        : c
    );
    setCurrencies(updatedCurrencies);
    setShowEditDialog(false);
    setEditingItem(null);
    resetForm();
  };

  // 确认删除
  const handleDeleteConfirm = () => {
    if (!editingItem) return;
    setCurrencies(currencies.filter(c => c.id !== editingItem.id));
    if (selectedId === editingItem.id) {
      setSelectedId(currencies.find(c => c.id !== editingItem.id)?.id);
    }
    setShowDeleteDialog(false);
    setEditingItem(null);
  };

  // 表单组件
  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">币种代码 *</Label>
          <Input
            value={formData.currencyCode}
            onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })}
            placeholder="如: USD"
            maxLength={3}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">币种名称 *</Label>
          <Input
            value={formData.currencyName}
            onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
            placeholder="如: 美元"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">货币符号 *</Label>
          <Input
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="如: $"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">国家/地区 *</Label>
          <Input
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="如: 美国"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">小数位数</Label>
          <Input
            type="number"
            value={formData.decimalPlaces}
            onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 0 })}
            min={0}
            max={4}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">汇率(对CNY)</Label>
          <Input
            type="number"
            value={formData.exchangeRate}
            onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })}
            step={0.0001}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">ISO 代码</Label>
          <Input
            value={formData.isoCode}
            onChange={(e) => setFormData({ ...formData, isoCode: e.target.value })}
            placeholder="如: 840"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">辅币单位</Label>
          <Input
            value={formData.minorUnit}
            onChange={(e) => setFormData({ ...formData, minorUnit: e.target.value })}
            placeholder="如: 美分"
          />
        </div>
      </div>
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">状态</Label>
        <Select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'active', label: '启用' },
            { value: 'inactive', label: '停用' },
          ]}
        />
      </div>
    </div>
  );

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
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                currency.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              )}>
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  currency.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'
                )} />
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
    <>
      <MasterDetail
        title="币种主数据"
        subtitle="管理系统中使用的货币类型和汇率"
        headerIcon={CurrencyIcon}
        items={filteredCurrencies}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id)}
        onSearch={setSearchKeyword}
        searchPlaceholder="搜索币种代码、名称或国家..."
        primaryAction={{
          label: '新建币种',
          onClick: handleCreate,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderDetail={renderDetail}
        masterWidth={320}
      />

      {/* 创建弹窗 */}
      <FormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="新建币种"
      >
        {renderForm()}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>取消</Button>
          <Button onClick={handleCreateSubmit} disabled={!formData.currencyCode || !formData.currencyName}>
            创建
          </Button>
        </div>
      </FormDialog>

      {/* 编辑弹窗 */}
      <FormDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        title="编辑币种"
      >
        {renderForm()}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowEditDialog(false)}>取消</Button>
          <Button onClick={handleEditSubmit}>保存</Button>
        </div>
      </FormDialog>

      {/* 删除确认 */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        itemName={editingItem?.currencyName || ''}
      />
    </>
  );
}

export default CurrenciesPage;
