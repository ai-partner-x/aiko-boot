/**
 * 采购组织主数据页面
 * 使用 Master-Detail 布局，支持 CRUD 操作
 */

import { useState } from 'react';
import { cn, Input, Label, Select, Button } from '@aff/admin-component';
import { MasterDetail, DetailSection, DetailField, DetailFieldGrid, type MasterDetailItem } from '../../../components/MasterDetail';

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

// 初始数据
const initialOrgs: PurchaseOrg[] = [
  { id: '1', title: '1000 - 总部采购组织', subtitle: '北京', description: '集团总部统一采购', orgCode: '1000', orgName: '总部采购组织', companyCode: '1000', companyName: 'XX科技集团有限公司', address: '朝阳区建国路89号', city: '北京', country: '中国', currency: 'CNY', manager: '张伟', email: 'procurement@company.com', phone: '010-88888888', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '2', title: '2000 - 华东采购组织', subtitle: '上海', description: '负责华东区域采购', orgCode: '2000', orgName: '华东采购组织', companyCode: '2000', companyName: 'XX科技(上海)有限公司', address: '浦东新区陆家嘴环路1000号', city: '上海', country: '中国', currency: 'CNY', manager: '李芳', email: 'procurement-sh@company.com', phone: '021-66666666', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '3', title: '3000 - 华南采购组织', subtitle: '深圳', description: '负责华南区域采购', orgCode: '3000', orgName: '华南采购组织', companyCode: '3000', companyName: 'XX科技(深圳)有限公司', address: '南山区科技园南区', city: '深圳', country: '中国', currency: 'CNY', manager: '王磊', email: 'procurement-sz@company.com', phone: '0755-88888888', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '4', title: '4000 - 西南采购组织', subtitle: '成都', description: '负责西南区域采购', orgCode: '4000', orgName: '西南采购组织', companyCode: '4000', companyName: 'XX科技(成都)有限公司', address: '高新区天府大道北段', city: '成都', country: '中国', currency: 'CNY', manager: '赵静', email: 'procurement-cd@company.com', phone: '028-88888888', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '5', title: '5000 - 海外采购组织', subtitle: '香港', description: '负责海外进口采购', orgCode: '5000', orgName: '海外采购组织', companyCode: '5000', companyName: 'XX Technology (HK) Limited', address: 'Central Plaza, Wan Chai', city: '香港', country: '中国香港', currency: 'HKD', manager: '陈明', email: 'procurement-hk@company.com', phone: '+852-23456789', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
];

// 弹窗组件
function FormDialog({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="10" cy="10" r="8" /><path d="M10 6v5M10 13.5v.5" strokeLinecap="round" /></svg>
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

export function PurchaseOrganizationsPage() {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(orgs[0]?.id);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PurchaseOrg | null>(null);
  
  const [formData, setFormData] = useState({
    orgCode: '', orgName: '', companyCode: '', companyName: '', address: '', city: '', country: '中国', currency: 'CNY', manager: '', email: '', phone: '', status: 'active',
  });

  const filteredOrgs = orgs.filter(o => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return o.orgCode.toLowerCase().includes(keyword) || o.orgName.toLowerCase().includes(keyword) || o.city.toLowerCase().includes(keyword);
  });

  const resetForm = () => {
    setFormData({ orgCode: '', orgName: '', companyCode: '', companyName: '', address: '', city: '', country: '中国', currency: 'CNY', manager: '', email: '', phone: '', status: 'active' });
  };

  const handleCreate = () => { resetForm(); setShowCreateDialog(true); };
  
  const handleEdit = (item: PurchaseOrg) => {
    setEditingItem(item);
    setFormData({
      orgCode: item.orgCode, orgName: item.orgName, companyCode: item.companyCode, companyName: item.companyName,
      address: item.address, city: item.city, country: item.country, currency: item.currency,
      manager: item.manager, email: item.email, phone: item.phone, status: item.status?.color === 'green' ? 'active' : 'inactive',
    });
    setShowEditDialog(true);
  };

  const handleDelete = (item: PurchaseOrg) => { setEditingItem(item); setShowDeleteDialog(true); };

  const handleCreateSubmit = () => {
    const now = new Date().toISOString().split('T')[0];
    const newOrg: PurchaseOrg = {
      id: Date.now().toString(),
      title: `${formData.orgCode} - ${formData.orgName}`,
      subtitle: formData.city,
      description: `负责${formData.city}区域采购`,
      orgCode: formData.orgCode, orgName: formData.orgName, companyCode: formData.companyCode, companyName: formData.companyName,
      address: formData.address, city: formData.city, country: formData.country, currency: formData.currency,
      manager: formData.manager, email: formData.email, phone: formData.phone,
      status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' },
      createdAt: now, updatedAt: now,
    };
    setOrgs([...orgs, newOrg]);
    setSelectedId(newOrg.id);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;
    const now = new Date().toISOString().split('T')[0];
    setOrgs(orgs.map(o => o.id === editingItem.id ? {
      ...o,
      title: `${formData.orgCode} - ${formData.orgName}`,
      subtitle: formData.city,
      orgCode: formData.orgCode, orgName: formData.orgName, companyCode: formData.companyCode, companyName: formData.companyName,
      address: formData.address, city: formData.city, country: formData.country, currency: formData.currency,
      manager: formData.manager, email: formData.email, phone: formData.phone,
      status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' } as const,
      updatedAt: now,
    } : o));
    setShowEditDialog(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (!editingItem) return;
    setOrgs(orgs.filter(o => o.id !== editingItem.id));
    if (selectedId === editingItem.id) setSelectedId(orgs.find(o => o.id !== editingItem.id)?.id);
    setShowDeleteDialog(false);
    setEditingItem(null);
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">组织代码 *</Label>
          <Input value={formData.orgCode} onChange={(e) => setFormData({ ...formData, orgCode: e.target.value })} placeholder="如: 1000" />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">组织名称 *</Label>
          <Input value={formData.orgName} onChange={(e) => setFormData({ ...formData, orgName: e.target.value })} placeholder="如: 总部采购组织" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">公司代码</Label>
          <Input value={formData.companyCode} onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })} placeholder="如: 1000" />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">公司名称</Label>
          <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="公司全称" />
        </div>
      </div>
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">地址</Label>
        <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="详细地址" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">城市</Label>
          <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="如: 北京" />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">国家/地区</Label>
          <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="如: 中国" />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">本位币</Label>
          <Select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} options={[{ value: 'CNY', label: 'CNY - 人民币' }, { value: 'USD', label: 'USD - 美元' }, { value: 'HKD', label: 'HKD - 港币' }]} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">负责人</Label>
          <Input value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} placeholder="姓名" />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">电子邮件</Label>
          <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">电话</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="联系电话" />
        </div>
      </div>
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">状态</Label>
        <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} />
      </div>
    </div>
  );

  const renderDetail = (org: PurchaseOrg) => (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
            <span className="text-xl font-bold">{org.orgCode}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{org.orgName}</h2>
            <p className="text-sm text-gray-500 mt-1">{org.companyName}</p>
            {org.description && <p className="text-xs text-gray-400 mt-2">{org.description}</p>}
          </div>
        </div>
      </div>
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="组织代码" value={<span className="font-mono font-semibold text-violet-600">{org.orgCode}</span>} />
          <DetailField label="组织名称" value={org.orgName} />
          <DetailField label="公司代码" value={org.companyCode} />
          <DetailField label="公司名称" value={org.companyName} />
          <DetailField label="本位币" value={org.currency} />
          <DetailField label="状态" value={
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', org.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
              <span className={cn('w-1.5 h-1.5 rounded-full', org.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400')} />
              {org.status?.label}
            </span>
          } />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="地址信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="地址" value={org.address} />
          <DetailField label="城市" value={org.city} />
          <DetailField label="国家/地区" value={org.country} />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="联系信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="负责人" value={org.manager} />
          <DetailField label="电子邮件" value={org.email} />
          <DetailField label="电话" value={org.phone} />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={org.createdAt} />
          <DetailField label="最后更新" value={org.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <>
      <MasterDetail
        title="采购组织"
        subtitle="管理系统中的采购组织架构"
        headerIcon={OrgIcon}
        items={filteredOrgs}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id)}
        onSearch={setSearchKeyword}
        searchPlaceholder="搜索组织代码、名称或城市..."
        primaryAction={{ label: '新建组织', onClick: handleCreate }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderDetail={renderDetail}
        masterWidth={340}
      />
      <FormDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="新建采购组织">
        {renderForm()}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>取消</Button>
          <Button onClick={handleCreateSubmit} disabled={!formData.orgCode || !formData.orgName}>创建</Button>
        </div>
      </FormDialog>
      <FormDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} title="编辑采购组织">
        {renderForm()}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowEditDialog(false)}>取消</Button>
          <Button onClick={handleEditSubmit}>保存</Button>
        </div>
      </FormDialog>
      <DeleteConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDeleteConfirm} itemName={editingItem?.orgName || ''} />
    </>
  );
}

export default PurchaseOrganizationsPage;
