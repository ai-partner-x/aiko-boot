'use client';

import { useState } from 'react';
import { AuthApi } from '@scaffold/api/client';
import type { LoginDto, LoginResultDto } from '@scaffold/api/client';
import { DEFAULT_API_BASE_URL } from '@scaffold/shared';

const apiBaseUrl =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : DEFAULT_API_BASE_URL;

const authApi = new AuthApi(apiBaseUrl);

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<LoginResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const dto: LoginDto = { username, password };
    try {
      const data = await authApi.login(dto);
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败';
      const isNetwork =
        msg.includes('fetch') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('CONNECTION_REFUSED');
      setError(
        isNetwork
          ? '无法连接 API，请先在 scaffold 目录执行：pnpm dev:api'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            用户名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="admin"
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {result && (
          <p className="text-sm text-green-600">
            登录成功：{result.username}（{result.email}）
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <p className="mt-4 text-xs text-gray-500">
        默认账号：admin / admin123
      </p>
    </div>
  );
}
