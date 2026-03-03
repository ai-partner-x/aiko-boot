/**
 * 收货编辑页面
 * 使用通用 ObjectPage 组件
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ObjectPage } from '../../components/ObjectPage';
import { cn } from '@aff/admin-component';

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
  box: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1L14 4v6l-6 3-6-3V4l6-3z" />
      <path d="M8 8v6M8 8L2 4M8 8l6-4" />
    </svg>
  ),
};

// 模拟数据
const mockDetail = {
  id: '1',
  grNumber: 'GR-2024-0056',
  poRef: 'PO-2024-0089',
  status: 'inspecting',
  supplier: 'Apple 授权经销商',
  plant: '1000',
  plantName: '上海工厂',
  storageLocation: 'WH01',
  storageName: '主仓库',
  receivedAt: '2024-01-25 14:30',
  receiver: '王五',
  items: [
    { id: '1', lineNo: '10', material: 'M-1001', description: 'MacBook Pro 14" M3 Pro', orderedQty: 5, receivedQty: 5, unit: '台', batch: 'BATCH001' },
    { id: '2', lineNo: '20', material: 'M-1002', description: 'MacBook Pro 14" M3 Max', orderedQty: 5, receivedQty: 5, unit: '台', batch: 'BATCH002' },
  ],
};

export function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState(mockDetail.items);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    navigate(`/goods-receipt/${id}`);
  };

  const updateItem = (itemId: string, field: string, value: number) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  return (
    <ObjectPage
      mode="edit"
      backPath={`/goods-receipt/${id}`}
      breadcrumb="收货管理"
      title={mockDetail.grNumber}
      subtitle={`参考: ${mockDetail.poRef}`}
      status={{ label: '检验中', color: 'yellow' }}
      headerIcon={Icons.truck}
      headerFields={[
        { label: '收货日期', value: mockDetail.receivedAt.split(' ')[0] },
        { label: '收货人', value: mockDetail.receiver },
        { label: '供应商', value: mockDetail.supplier },
      ]}
      actions={[
        {
          key: 'cancel',
          label: '取消',
          variant: 'secondary',
          onClick: () => navigate(`/goods-receipt/${id}`),
          showInModes: ['edit'],
        },
        {
          key: 'save',
          label: saving ? '保存中...' : '保存',
          icon: Icons.save,
          variant: 'primary',
          onClick: handleSave,
          loading: saving,
          showInModes: ['edit'],
          showDropdown: true,
        },
      ]}
      sections={[
        // 库存信息
        {
          id: 'storage',
          title: '库存信息',
          icon: Icons.box,
          content: (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">工厂</label>
                <p className="text-sm text-gray-900">{mockDetail.plant} - {mockDetail.plantName}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">存储位置</label>
                <p className="text-sm text-gray-900">{mockDetail.storageLocation} - {mockDetail.storageName}</p>
              </div>
            </div>
          ),
        },
        // 收货明细
        {
          id: 'items',
          title: '收货明细',
          subtitle: '可修改收货数量',
          content: (
            <div className="-mx-6 -mb-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">行号</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">物料</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">描述</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">订单数量</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">收货数量</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">批次</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.lineNo}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-blue-600">{item.material}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900">{item.orderedQty}</span>
                        <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          value={item.receivedQty}
                          onChange={(e) => updateItem(item.id, 'receivedQty', Number(e.target.value))}
                          className="w-20 h-8 px-2 text-right rounded border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                          min={0}
                          max={item.orderedQty}
                        />
                        <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.batch}
                          onChange={(e) => updateItem(item.id, 'batch', e.target.value as any)}
                          className="w-28 h-8 px-2 rounded border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
      ]}
    />
  );
}

export default EditPage;
