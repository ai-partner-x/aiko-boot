/**
 * 计量单位主数据页面
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

// 维度选项
const dimensionOptions = [
  { value: '数量', label: '数量' },
  { value: '重量', label: '重量' },
  { value: '长度', label: '长度' },
  { value: '体积', label: '体积' },
  { value: '面积', label: '面积' },
  { value: '时间', label: '时间' },
];

// 初始数据
const initialUnits: UnitOfMeasure[] = [
  { id: '1', title: 'EA - 个/件', subtitle: '数量', uomCode: 'EA', uomName: '个/件', dimension: '数量', baseUnit: 'EA', conversionFactor: 1, isoCode: 'EA', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '2', title: 'PC - 台', subtitle: '数量', uomCode: 'PC', uomName: '台', dimension: '数量', baseUnit: 'EA', conversionFactor: 1, isoCode: 'H87', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '3', title: 'BOX - 箱', subtitle: '数量', uomCode: 'BOX', uomName: '箱', dimension: '数量', baseUnit: 'EA', conversionFactor: 12, isoCode: 'BX', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '4', title: 'KG - 千克', subtitle: '重量', uomCode: 'KG', uomName: '千克', dimension: '重量', baseUnit: 'KG', conversionFactor: 1, isoCode: 'KGM', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '5', title: 'G - 克', subtitle: '重量', uomCode: 'G', uomName: '克', dimension: '重量', baseUnit: 'KG', conversionFactor: 0.001, isoCode: 'GRM', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '6', title: 'T - 吨', subtitle: '重量', uomCode: 'T', uomName: '吨', dimension: '重量', baseUnit: 'KG', conversionFactor: 1000, isoCode: 'TNE', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '7', title: 'M - 米', subtitle: '长度', uomCode: 'M', uomName: '米', dimension: '长度', baseUnit: 'M', conversionFactor: 1, isoCode: 'MTR', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '8', title: 'CM - 厘米', subtitle: '长度', uomCode: 'CM', uomName: '厘米', dimension: '长度', baseUnit: 'M', conversionFactor: 0.01, isoCode: 'CMT', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '9', title: 'L - 升', subtitle: '体积', uomCode: 'L', uomName: '升', dimension: '体积', baseUnit: 'L', conversionFactor: 1, isoCode: 'LTR', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '10', title: 'SET - 套', subtitle: '数量', uomCode: 'SET', uomName: '套', dimension: '数量', baseUnit: 'EA', conversionFactor: 1, isoCode: 'SET', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
];

// 表单弹窗
function FormDialog({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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
function DeleteConfirmDialog({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string }) {
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
            <p className="mt-2 text-sm text-gray-600">确定要删除 <span className="font-medium text-gray-900">{itemName}</span> 吗？此操作不可撤销。</p>
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

export function UnitsOfMeasurePage() {
  const [units, setUnits] = useState(initialUnits);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(units[0]?.id);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitOfMeasure | null>(null);
  
  const [formData, setFormData] = useState({
    uomCode: '',
    uomName: '',
    dimension: '数量',
    baseUnit: '',
    conversionFactor: 1,
    isoCode: '',
    status: 'active',
  });

  const filteredUnits = units.filter(u => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return u.uomCode.toLowerCase().includes(keyword) || u.uomName.toLowerCase().includes(keyword) || u.dimension.toLowerCase().includes(keyword);
  });

  const resetForm = () => {
    setFormData({ uomCode: '', uomName: '', dimension: '数量', baseUnit: '', conversionFactor: 1, isoCode: '', status: 'active' });
  };

  const handleCreate = () => { resetForm(); setShowCreateDialog(true); };

  const handleEdit = (item: UnitOfMeasure) => {
    setEditingItem(item);
    setFormData({
      uomCode: item.uomCode,
      uomName: item.uomName,
      dimension: item.dimension,
      baseUnit: item.baseUnit,
      conversionFactor: item.conversionFactor,
      isoCode: item.isoCode,
      status: item.status?.color === 'green' ? 'active' : 'inactive',
    });
    setShowEditDialog(true);
  };

  const handleDelete = (item: UnitOfMeasure) => {
    setEditingItem(item);
    setShowDeleteDialog(true);
  };

  const handleCreateSubmit = () => {
    const now = new Date().toISOString().split('T')[0];
    const newUnit: UnitOfMeasure = {
      id: Date.now().toString(),
      title: `${formData.uomCode} - ${formData.uomName}`,
      subtitle: formData.dimension,
      uomCode: formData.uomCode,
      uomName: formData.uomName,
      dimension: formData.dimension,
      baseUnit: formData.baseUnit || formData.uomCode,
      conversionFactor: formData.conversionFactor,
      isoCode: formData.isoCode,
      status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' },
      createdAt: now,
      updatedAt: now,
    };
    setUnits([...units, newUnit]);
    setSelectedId(newUnit.id);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;
    const now = new Date().toISOString().split('T')[0];
    setUnits(units.map(u => u.id === editingItem.id ? {
      ...u,
      title: `${formData.uomCode} - ${formData.uomName}`,
      subtitle: formData.dimension,
      uomCode: formData.uomCode,
      uomName: formData.uomName,
      dimension: formData.dimension,
      baseUnit: formData.baseUnit || formData.uomCode,
      conversionFactor: formData.conversionFactor,
      isoCode: formData.isoCode,
      status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' } as const,
      updatedAt: now,
    } : u));
    setShowEditDialog(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (!editingItem) return;
    setUnits(units.filter(u => u.id !== editingItem.id));
    if (selectedId === editingItem.id) setSelectedId(units.find(u => u.id !== editingItem.id)?.id);
    setShowDeleteDialog(false);
    setEditingItem(null);
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">单位代码 *</Label>
          <Input value={formData.uomCode} onChange={(e) => setFormData({ ...formData, uomCode: e.target.value.toUpperCase() })} placeholder="如: KG" maxLength={10} />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">单位名称 *</Label>
          <Input value={formData.uomName} onChange={(e) => setFormData({ ...formData, uomName: e.target.value })} placeholder="如: 千克" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">计量维度</Label>
          <Select value={formData.dimension} onChange={(e) => setFormData({ ...formData, dimension: e.target.value })} options={dimensionOptions} />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">基本单位</Label>
          <Input value={formData.baseUnit} onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value.toUpperCase() })} placeholder="如: KG" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">换算系数</Label>
          <Input type="number" value={formData.conversionFactor} onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 0 })} step={0.001} />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">ISO 代码</Label>
          <Input value={formData.isoCode} onChange={(e) => setFormData({ ...formData, isoCode: e.target.value })} placeholder="如: KGM" />
        </div>
      </div>
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">状态</Label>
        <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} />
      </div>
    </div>
  );

  const renderDetail = (uom: UnitOfMeasure) => (
    <div className="p-6 space-y-6">
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
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="单位代码" value={<span className="font-mono font-semibold text-emerald-600">{uom.uomCode}</span>} />
          <DetailField label="单位名称" value={uom.uomName} />
          <DetailField label="计量维度" value={uom.dimension} />
          <DetailField label="基本单位" value={uom.baseUnit} />
          <DetailField label="ISO 代码" value={uom.isoCode} />
          <DetailField label="状态" value={
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', uom.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
              <span className={cn('w-1.5 h-1.5 rounded-full', uom.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400')} />
              {uom.status?.label}
            </span>
          } />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="换算信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="换算系数" value={uom.conversionFactor} />
          <DetailField label="换算公式" value={`1 ${uom.uomCode} = ${uom.conversionFactor} ${uom.baseUnit}`} />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={uom.createdAt} />
          <DetailField label="最后更新" value={uom.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <>
      <MasterDetail
        title="计量单位"
        subtitle="管理系统中使用的计量单位和换算关系"
        headerIcon={UomIcon}
        items={filteredUnits}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id)}
        onSearch={setSearchKeyword}
        searchPlaceholder="搜索单位代码、名称或维度..."
        primaryAction={{ label: '新建单位', onClick: handleCreate }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderDetail={renderDetail}
        masterWidth={300}
      />
      <FormDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="新建计量单位">
        {renderForm()}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>取消</Button>
          <Button onClick={handleCreateSubmit} disabled={!formData.uomCode || !formData.uomName}>创建</Button>
        </div>
      </FormDialog>
      <FormDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} title="编辑计量单位">
        {renderForm()}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowEditDialog(false)}>取消</Button>
          <Button onClick={handleEditSubmit}>保存</Button>
        </div>
      </FormDialog>
      <DeleteConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDeleteConfirm} itemName={editingItem?.uomName || ''} />
    </>
  );
}

export default UnitsOfMeasurePage;
