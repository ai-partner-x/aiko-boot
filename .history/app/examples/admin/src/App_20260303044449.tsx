/**
 * Admin 应用主入口
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuLayout from './layouts/MenuLayout';
import TileLayout from './layouts/TileLayout';

// 示例页面
import HomePage from './pages/HomePage';
import PurchaseRequisitionsPage from './pages/PurchaseRequisitionsPage';
import CreatePurchaseRequisitionPage from './pages/CreatePurchaseRequisitionPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  // 从 localStorage 读取布局偏好
  const [layoutMode, setLayoutMode] = useState<'menu' | 'tile'>(() => {
    const saved = localStorage.getItem('admin-layout-mode');
    return (saved as 'menu' | 'tile') || 'tile';
  });

  // 保存布局偏好
  useEffect(() => {
    localStorage.setItem('admin-layout-mode', layoutMode);
  }, [layoutMode]);

  const handleLayoutModeChange = (mode: 'menu' | 'tile') => {
    setLayoutMode(mode);
  };

  return (
    <BrowserRouter>
      <Routes>
        {layoutMode === 'menu' ? (
          <Route
            element={<MenuLayout onLayoutModeChange={handleLayoutModeChange} />}
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/purchase-requisitions" element={<PurchaseRequisitionsPage />} />
            <Route path="/purchase-requisitions/create" element={<CreatePurchaseRequisitionPage />} />
            <Route path="/purchase-orders" element={<div className="p-4">采购订单列表</div>} />
            <Route path="/goods-receipt" element={<div className="p-4">收货管理</div>} />
            <Route path="/master-data/*" element={<div className="p-4">主数据管理</div>} />
            <Route path="/reports/*" element={<div className="p-4">报表分析</div>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route
            element={<TileLayout onLayoutModeChange={handleLayoutModeChange} />}
          >
            <Route path="/" element={null} />
            <Route path="/purchase-requisitions" element={<PurchaseRequisitionsPage />} />
            <Route path="/purchase-requisitions/create" element={<CreatePurchaseRequisitionPage />} />
            <Route path="/purchase-orders" element={<div className="p-4">采购订单列表</div>} />
            <Route path="/goods-receipt" element={<div className="p-4">收货管理</div>} />
            <Route path="/master-data/*" element={<div className="p-4">主数据管理</div>} />
            <Route path="/reports/*" element={<div className="p-4">报表分析</div>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
