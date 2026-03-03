/**
 * 设置页面
 */

import { Card, CardContent, CardHeader, CardTitle, Button } from '@aff/admin-component';
import { User, Bell, Shield, Palette, Globe } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--fiori-text-primary))]">
          系统设置
        </h1>
        <p className="text-[rgb(var(--fiori-text-secondary))]">
          管理您的账户和系统偏好设置
        </p>
      </div>

      <div className="grid gap-4">
        {/* 个人信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[rgb(var(--fiori-primary))]" />
              <CardTitle>个人信息</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[rgb(var(--fiori-text-secondary))]">用户名</label>
                <p className="font-medium">admin</p>
              </div>
              <div>
                <label className="text-sm text-[rgb(var(--fiori-text-secondary))]">邮箱</label>
                <p className="font-medium">admin@example.com</p>
              </div>
            </div>
            <Button variant="outline">编辑个人信息</Button>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[rgb(var(--fiori-warning))]" />
              <CardTitle>通知设置</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>邮件通知</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>浏览器推送通知</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>短信通知</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 主题设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-[rgb(var(--fiori-secondary))]" />
              <CardTitle>外观设置</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg border-2 border-[rgb(var(--fiori-primary))] bg-white">
                浅色
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-800 text-white">
                深色
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300">
                跟随系统
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 语言设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[rgb(var(--fiori-success))]" />
              <CardTitle>语言和地区</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <select className="w-full max-w-xs px-3 py-2 rounded-lg border border-[rgb(var(--fiori-grey-300))]">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English (US)</option>
              <option value="de-DE">Deutsch</option>
            </select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
