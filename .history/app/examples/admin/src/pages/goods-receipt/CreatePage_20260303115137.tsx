/**
 * 收货创建页面
 * 使用通用 ObjectPage 组件
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ObjectPage } from '../../components/ObjectPage';

// 图标
const Icons = {
  truck: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4h11v10H1zM12 8h4l2.5 3.5v4.5H12z" />
      <circle cx="4.5" cy="15.5" r="1.5" />
      <circle cx="15" cy="15.5" r="1.5" />
    </svg>
  ),
  save: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v9a1 1 0 01-1 1z" />
      <path d="M10 2v3H6M5 9h6M5 12h6" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="11" rx="1" />
      <path d="M2 6h12M5 1v3M11 1v3" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M6 5h4M6 8h4M6 11h4" strokeLinecap="round" />
    </svg>
  ),
};

export function CreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    poRef: '',
    plant: '1000',
    storageLocation: 'WH01',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    navigate('/goods-receipt');
  };

  return (
    <ObjectPage
      mode="create"
      backPath="/goods-receipt"
      breadcrumb="收货管理"
      title="创建收货单"
      headerIcon={Icons.truck}
      actions={[
        {
          key: 'cancel',
          label: '取消',
          variant: 'secondary',
          onClick: () => navigate('/goods-receipt'),
          showInModes: ['create'],
        },
        {
          key: 'save',
          label: saving ? '保存中...' : '保存',
          icon: Icons.save,
          variant: 'primary',
          onClick: handleSave,
          loading: saving,
          showInModes: ['create'],
          showDropdown: true,
        },
      ]}
      showSectionNav={false}
      sections={[
        {
          id: 'basic',
          title: '基本信息',
          content: (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">采购订单 *</label>
                <select
                  value={formData.poRef}
                  onChange={(e) => setFormData({ ...formData, poRef: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">选择采购订单</option>
                  <option value="PO-2024-0090">PO-2024-0090 - 办公设备采购</option>
                  <option value="PO-2024-0091">PO-2024-0091 - IT设备补充</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">工厂 *</label>
                <select
                  value={formData.plant}
                  onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="1000">1000 - 总部</option>
                  <option value="2000">2000 - 华东分部</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">存储位置 *</label>
                <select
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="WH01">WH01 - 主仓库</option>
                  <option value="WH02">WH02 - 备用仓库</option>
                </select>
              </div>
            </div>
          ),
        },
        {
          id: 'items',
          title: '收货物料',
          subtitle: '选择采购订单后自动加载',
          content: (
            <div className="text-center py-8 text-gray-400">
              请先选择采购订单
            </div>
          ),
        },
      ]}
    />
  );
}

export default CreatePage;
