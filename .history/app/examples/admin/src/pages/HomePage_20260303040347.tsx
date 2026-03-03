/**
 * 首页
 */

import { Card, CardContent, CardHeader, CardTitle } from '@aff/admin-component';
import { BarChart3, ShoppingCart, Package, Truck } from 'lucide-react';

const stats = [
  { title: '待处理采购申请', value: 12, icon: <ShoppingCart className="h-5 w-5" />, color: '#0073e6' },
  { title: '进行中订单', value: 8, icon: <Package className="h-5 w-5" />, color: '#388e3c' },
  { title: '待收货', value: 5, icon: <Truck className="h-5 w-5" />, color: '#f57c00' },
  { title: '本月采购额', value: '¥125,430', icon: <BarChart3 className="h-5 w-5" />, color: '#7b1fa2' },
];

export function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--fiori-text-primary))]">
          首页概览
        </h1>
        <p className="text-[rgb(var(--fiori-text-secondary))]">
          欢迎回来！以下是您的工作概况
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--fiori-text-secondary))]">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[rgb(var(--fiori-text-primary))] mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg border border-[rgb(var(--fiori-grey-200))] hover:bg-[rgb(var(--fiori-grey-50))] transition-colors text-left">
              <ShoppingCart className="h-6 w-6 text-[rgb(var(--fiori-primary))] mb-2" />
              <p className="font-medium">创建采购申请</p>
            </button>
            <button className="p-4 rounded-lg border border-[rgb(var(--fiori-grey-200))] hover:bg-[rgb(var(--fiori-grey-50))] transition-colors text-left">
              <Package className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium">查看订单</p>
            </button>
            <button className="p-4 rounded-lg border border-[rgb(var(--fiori-grey-200))] hover:bg-[rgb(var(--fiori-grey-50))] transition-colors text-left">
              <Truck className="h-6 w-6 text-orange-500 mb-2" />
              <p className="font-medium">收货确认</p>
            </button>
            <button className="p-4 rounded-lg border border-[rgb(var(--fiori-grey-200))] hover:bg-[rgb(var(--fiori-grey-50))] transition-colors text-left">
              <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium">查看报表</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
