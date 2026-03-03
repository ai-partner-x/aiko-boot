/**
 * 创建采购申请页面
 * 基于 SAP Fiori Create Object Page 设计
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@aff/admin-component';

// 图标
const Icons = {
  back: (
    &lt;svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;path d="M12.5 5L7.5 10l5 5" strokeLinecap="round" strokeLinejoin="round" /&gt;
    &lt;/svg&gt;
  ),
  save: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v9a1 1 0 01-1 1z" /&gt;
      &lt;path d="M10 2v3H6M5 9h6M5 12h6" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  send: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;path d="M14 2L7 9M14 2l-4 12-3-5-5-3 12-4z" strokeLinecap="round" strokeLinejoin="round" /&gt;
    &lt;/svg&gt;
  ),
  cancel: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  plus: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"&gt;
      &lt;path d="M8 3v10M3 8h10" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  trash: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12.5 4v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 13V4" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  chevronDown: (
    &lt;svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"&gt;
      &lt;path d="M3.5 5.5l3.5 3 3.5-3" strokeLinecap="round" strokeLinejoin="round" /&gt;
    &lt;/svg&gt;
  ),
  calendar: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;rect x="2" y="3" width="12" height="11" rx="1" /&gt;
      &lt;path d="M2 6h12M5 1v3M11 1v3" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  user: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;circle cx="8" cy="5" r="3" /&gt;
      &lt;path d="M2 14c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" /&gt;
    &lt;/svg&gt;
  ),
  building: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;rect x="2" y="2" width="12" height="12" rx="1" /&gt;
      &lt;path d="M6 5h4M6 8h4M6 11h4" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  info: (
    &lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;circle cx="8" cy="8" r="6.5" /&gt;
      &lt;path d="M8 7v4M8 5v.5" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
  search: (
    &lt;svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"&gt;
      &lt;circle cx="6" cy="6" r="4" /&gt;
      &lt;path d="M9 9l3.5 3.5" strokeLinecap="round" /&gt;
    &lt;/svg&gt;
  ),
};

// 物料选项（模拟数据）
const materialOptions = [
  { code: 'IT-001', name: 'MacBook Pro 14" M3', unit: '台', price: 18900 },
  { code: 'IT-015', name: 'Dell 27" 4K显示器', unit: '台', price: 3500 },
  { code: 'IT-032', name: '无线键鼠套装', unit: '套', price: 299 },
  { code: 'OF-023', name: 'A4复印纸 80g', unit: '包', price: 25 },
  { code: 'FN-008', name: '人体工学办公椅', unit: '把', price: 2800 },
];

// 行项目类型
interface LineItem {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  deliveryDate: string;
  note: string;
}

export function CreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 表头信息
  const [headerData, setHeaderData] = useState({
    requester: '当前用户',
    department: '研发部',
    companyCode: '1000',
    purchaseOrg: '1000',
    purchaseGroup: '001',
    requestDate: new Date().toISOString().split('T')[0],
    description: '',
    priority: 'normal',
  });

  // 行项目
  const [lineItems, setLineItems] = useState&lt;LineItem[]&gt;([
    {
      id: '1',
      materialCode: '',
      materialName: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      amount: 0,
      deliveryDate: '',
      note: '',
    },
  ]);

  // 添加行项目
  const addLineItem = () =&gt; {
    setLineItems([
      ...lineItems,
      {
        id: String(Date.now()),
        materialCode: '',
        materialName: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        amount: 0,
        deliveryDate: '',
        note: '',
      },
    ]);
  };

  // 删除行项目
  const removeLineItem = (id: string) =&gt; {
    if (lineItems.length &gt; 1) {
      setLineItems(lineItems.filter((item) =&gt; item.id !== id));
    }
  };

  // 更新行项目
  const updateLineItem = (id: string, field: keyof LineItem, value: any) =&gt; {
    setLineItems(
      lineItems.map((item) =&gt; {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // 如果选择了物料，自动填充信息
        if (field === 'materialCode') {
          const material = materialOptions.find((m) =&gt; m.code === value);
          if (material) {
            updated.materialName = material.name;
            updated.unit = material.unit;
            updated.unitPrice = material.price;
            updated.amount = updated.quantity * material.price;
          }
        }

        // 计算金额
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice;
        }

        return updated;
      })
    );
  };

  // 计算总金额
  const totalAmount = lineItems.reduce((sum, item) =&gt; sum + item.amount, 0);

  // 保存
  const handleSave = async () =&gt; {
    setSaving(true);
    // 模拟保存
    await new Promise((r) =&gt; setTimeout(r, 1000));
    setSaving(false);
    navigate('/purchase-requisitions');
  };

  // 提交审批
  const handleSubmit = async () =&gt; {
    setSubmitting(true);
    await new Promise((r) =&gt; setTimeout(r, 1000));
    setSubmitting(false);
    navigate('/purchase-requisitions');
  };

  // 取消
  const handleCancel = () =&gt; {
    navigate('/purchase-requisitions');
  };

  return (
    &lt;div className="min-h-screen pb-24"&gt;
      {/* SAP Fiori Create Page Header */}
      &lt;div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6"&gt;
        {/* 彩色渐变头部 - 统一蓝色主题 */}
        &lt;div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden"&gt;
          &lt;div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" /&gt;
          
          &lt;div className="relative z-10"&gt;
            {/* 面包屑 */}
            &lt;div className="flex items-center gap-2 text-sm text-white/70 mb-3"&gt;
              &lt;button onClick={() =&gt; navigate('/purchase-requisitions')} className="hover:text-white"&gt;
                采购申请管理
              &lt;/button&gt;
              &lt;span&gt;/&lt;/span&gt;
              &lt;span className="text-white"&gt;创建采购申请&lt;/span&gt;
            &lt;/div&gt;

            &lt;div className="flex items-start justify-between"&gt;
              &lt;div className="flex items-center gap-4"&gt;
                &lt;div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"&gt;
                  {Icons.plus}
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;div className="flex items-center gap-3 mb-1"&gt;
                    &lt;h1 className="text-xl font-semibold"&gt;创建采购申请&lt;/h1&gt;
                    &lt;span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium"&gt;
                      新建模式
                    &lt;/span&gt;
                  &lt;/div&gt;
                  &lt;p className="text-white/80 text-sm"&gt;新建采购申请项目&lt;/p&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* 右侧操作按钮 */}
              &lt;div className="flex items-center gap-2"&gt;
                &lt;button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"&gt;
                  {Icons.info}
                &lt;/button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {/* 关键信息区域 */}
        &lt;div className="p-6 border-b border-gray-100"&gt;
          &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-6"&gt;
            &lt;div className="flex items-center gap-3"&gt;
              &lt;div className="text-gray-400"&gt;{Icons.calendar}&lt;/div&gt;
              &lt;div&gt;
                &lt;p className="text-xs text-gray-500"&gt;申请日期&lt;/p&gt;
                &lt;p className="text-sm font-medium text-gray-900"&gt;{headerData.requestDate}&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center gap-3"&gt;
              &lt;div className="text-gray-400"&gt;{Icons.user}&lt;/div&gt;
              &lt;div&gt;
                &lt;p className="text-xs text-gray-500"&gt;申请人&lt;/p&gt;
                &lt;p className="text-sm font-medium text-gray-900"&gt;{headerData.requester}&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center gap-3"&gt;
              &lt;div className="text-gray-400"&gt;{Icons.building}&lt;/div&gt;
              &lt;div&gt;
                &lt;p className="text-xs text-gray-500"&gt;公司代码&lt;/p&gt;
                &lt;p className="text-sm font-medium text-gray-900"&gt;{headerData.companyCode}&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center gap-3"&gt;
              &lt;div className="text-gray-400"&gt;{Icons.building}&lt;/div&gt;
              &lt;div&gt;
                &lt;p className="text-xs text-gray-500"&gt;采购组织&lt;/p&gt;
                &lt;p className="text-sm font-medium text-gray-900"&gt;{headerData.purchaseOrg} - 总部采购组织&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {/* 操作指南 */}
        &lt;div className="p-6 bg-gray-50/50"&gt;
          &lt;div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500"&gt;
            &lt;span&gt;📝 填写必填字段以创建申请&lt;/span&gt;
            &lt;span&gt;💡 使用值帮助选择物料&lt;/span&gt;
            &lt;span&gt;📋 至少添加一个行项目&lt;/span&gt;
            &lt;span&gt;⚡ 快捷键：Ctrl+S 保存&lt;/span&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* 主内容区 */}
      &lt;div className="space-y-6"&gt;

        {/* 基本信息 */}
        &lt;div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"&gt;
          &lt;div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50"&gt;
            &lt;h2 className="font-semibold text-gray-900"&gt;基本信息&lt;/h2&gt;
            &lt;p className="text-xs text-gray-500 mt-0.5"&gt;填写采购申请的基本详情&lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="p-6"&gt;
            &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"&gt;
              {/* 申请描述 */}
              &lt;div className="lg:col-span-2"&gt;
                &lt;label className="block text-sm font-medium text-gray-700 mb-1.5"&gt;
                  申请描述 &lt;span className="text-red-500"&gt;*&lt;/span&gt;
                &lt;/label&gt;
                &lt;input
                  type="text"
                  value={headerData.description}
                  onChange={(e) =&gt; setHeaderData({ ...headerData, description: e.target.value })}
                  placeholder="请输入采购申请描述"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                /&gt;
              &lt;/div&gt;

              {/* 优先级 */}
              &lt;div&gt;
                &lt;label className="block text-sm font-medium text-gray-700 mb-1.5"&gt;优先级&lt;/label&gt;
                &lt;div className="relative"&gt;
                  &lt;select
                    value={headerData.priority}
                    onChange={(e) =&gt; setHeaderData({ ...headerData, priority: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400 appearance-none"
                  &gt;
                    &lt;option value="low"&gt;低&lt;/option&gt;
                    &lt;option value="normal"&gt;普通&lt;/option&gt;
                    &lt;option value="high"&gt;高&lt;/option&gt;
                    &lt;option value="urgent"&gt;紧急&lt;/option&gt;
                  &lt;/select&gt;
                  &lt;div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"&gt;
                    {Icons.chevronDown}
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* 申请人 */}
              &lt;div&gt;
                &lt;label className="block text-sm font-medium text-gray-700 mb-1.5"&gt;申请人&lt;/label&gt;
                &lt;input
                  type="text"
                  value={headerData.requester}
                  readOnly
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
                /&gt;
              &lt;/div&gt;

              {/* 部门 */}
              &lt;div&gt;
                &lt;label className="block text-sm font-medium text-gray-700 mb-1.5"&gt;部门&lt;/label&gt;
                &lt;input
                  type="text"
                  value={headerData.department}
                  readOnly
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
                /&gt;
              &lt;/div&gt;

              {/* 采购组织 */}
              &lt;div&gt;
                &lt;label className="block text-sm font-medium text-gray-700 mb-1.5"&gt;采购组织&lt;/label&gt;
                &lt;div className="relative"&gt;
                  &lt;select
                    value={headerData.purchaseOrg}
                    onChange={(e) =&gt; setHeaderData({ ...headerData, purchaseOrg: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400 appearance-none"
                  &gt;
                    &lt;option value="1000"&gt;1000 - 总部采购组织&lt;/option&gt;
                    &lt;option value="2000"&gt;2000 - 华东采购组织&lt;/option&gt;
                  &lt;/select&gt;
                  &lt;div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"&gt;
                    {Icons.chevronDown}
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {/* 行项目 */}
        &lt;div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"&gt;
          &lt;div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between"&gt;
            &lt;div&gt;
              &lt;h2 className="font-semibold text-gray-900"&gt;行项目&lt;/h2&gt;
              &lt;p className="text-xs text-gray-500 mt-0.5"&gt;添加需要采购的物料明细&lt;/p&gt;
            &lt;/div&gt;
            &lt;button
              onClick={addLineItem}
              className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
            &gt;
              {Icons.plus}
              &lt;span&gt;添加行&lt;/span&gt;
            &lt;/button&gt;
          &lt;/div&gt;
          &lt;div className="overflow-x-auto"&gt;
            &lt;table className="w-full min-w-[900px]"&gt;
              &lt;thead&gt;
                &lt;tr className="bg-gray-50/80"&gt;
                  &lt;th className="w-10 px-3 py-3 text-left text-xs font-semibold text-gray-600"&gt;#&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 w-48"&gt;物料 &lt;span className="text-red-500"&gt;*&lt;/span&gt;&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 w-48"&gt;物料描述&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 w-24"&gt;数量 &lt;span className="text-red-500"&gt;*&lt;/span&gt;&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 w-16"&gt;单位&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 w-28"&gt;单价&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 w-28"&gt;金额&lt;/th&gt;
                  &lt;th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 w-36"&gt;交货日期&lt;/th&gt;
                  &lt;th className="w-16 px-3 py-3"&gt;&lt;/th&gt;
                &lt;/tr&gt;
              &lt;/thead&gt;
              &lt;tbody className="divide-y divide-gray-100"&gt;
                {lineItems.map((item, index) =&gt; (
                  &lt;tr key={item.id} className="hover:bg-gray-50/50"&gt;
                    &lt;td className="px-3 py-2 text-sm text-gray-500"&gt;{index + 1}&lt;/td&gt;
                    &lt;td className="px-3 py-2"&gt;
                      &lt;div className="relative"&gt;
                        &lt;select
                          value={item.materialCode}
                          onChange={(e) =&gt; updateLineItem(item.id, 'materialCode', e.target.value)}
                          className="w-full h-9 px-2.5 pr-8 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400 appearance-none"
                        &gt;
                          &lt;option value=""&gt;选择物料&lt;/option&gt;
                          {materialOptions.map((m) =&gt; (
                            &lt;option key={m.code} value={m.code}&gt;
                              {m.code}
                            &lt;/option&gt;
                          ))}
                        &lt;/select&gt;
                        &lt;div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400"&gt;
                          {Icons.search}
                        &lt;/div&gt;
                      &lt;/div&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2"&gt;
                      &lt;input
                        type="text"
                        value={item.materialName}
                        readOnly
                        placeholder="-"
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600"
                      /&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2"&gt;
                      &lt;input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =&gt; updateLineItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200 bg-white text-sm text-right focus:outline-none focus:border-blue-400"
                      /&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2 text-center"&gt;
                      &lt;span className="text-sm text-gray-600"&gt;{item.unit || '-'}&lt;/span&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2 text-right"&gt;
                      &lt;span className="text-sm text-gray-600"&gt;
                        {item.unitPrice &gt; 0 ? `¥${item.unitPrice.toLocaleString()}` : '-'}
                      &lt;/span&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2 text-right"&gt;
                      &lt;span className="text-sm font-medium text-gray-900"&gt;
                        {item.amount &gt; 0 ? `¥${item.amount.toLocaleString()}` : '-'}
                      &lt;/span&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2"&gt;
                      &lt;input
                        type="date"
                        value={item.deliveryDate}
                        onChange={(e) =&gt; updateLineItem(item.id, 'deliveryDate', e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400"
                      /&gt;
                    &lt;/td&gt;
                    &lt;td className="px-3 py-2"&gt;
                      &lt;button
                        onClick={() =&gt; removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          lineItems.length === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        )}
                      &gt;
                        {Icons.trash}
                      &lt;/button&gt;
                    &lt;/td&gt;
                  &lt;/tr&gt;
                ))}
              &lt;/tbody&gt;
              &lt;tfoot&gt;
                &lt;tr className="bg-gray-50/80 border-t border-gray-200"&gt;
                  &lt;td colSpan={6} className="px-3 py-3 text-right text-sm font-medium text-gray-700"&gt;
                    合计金额
                  &lt;/td&gt;
                  &lt;td className="px-3 py-3 text-right"&gt;
                    &lt;span className="text-base font-semibold text-blue-600"&gt;
                      ¥{totalAmount.toLocaleString()}
                    &lt;/span&gt;
                  &lt;/td&gt;
                  &lt;td colSpan={2}&gt;&lt;/td&gt;
                &lt;/tr&gt;
              &lt;/tfoot&gt;
            &lt;/table&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* 底部固定操作栏 */}
      &lt;div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"&gt;
        &lt;div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-end gap-3"&gt;
          &lt;button
            onClick={handleCancel}
            disabled={saving || submitting}
            className="h-10 px-5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
          &gt;
            {Icons.cancel}
            &lt;span&gt;取消&lt;/span&gt;
          &lt;/button&gt;

          &lt;button
            onClick={handleSubmit}
            disabled={saving || submitting}
            className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-600/20"
          &gt;
            {submitting ? (
              &lt;svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"&gt;
                &lt;circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /&gt;
                &lt;path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /&gt;
              &lt;/svg&gt;
            ) : (
              Icons.send
            )}
            &lt;span&gt;{submitting ? '提交中...' : '提交审批'}&lt;/span&gt;
          &lt;/button&gt;

          &lt;div className="flex"&gt;
            &lt;button
              onClick={handleSave}
              disabled={saving || submitting}
              className="h-10 px-5 rounded-l-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            &gt;
              {saving ? (
                &lt;svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"&gt;
                  &lt;circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /&gt;
                  &lt;path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /&gt;
                &lt;/svg&gt;
              ) : (
                Icons.save
              )}
              &lt;span&gt;{saving ? '保存中...' : '保存'}&lt;/span&gt;
            &lt;/button&gt;
            &lt;button
              disabled={saving || submitting}
              className="h-10 px-2 rounded-r-lg bg-blue-600 text-white hover:bg-blue-700 border-l border-blue-500 disabled:opacity-50"
            &gt;
              {Icons.chevronDown}
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

export default CreatePage;
