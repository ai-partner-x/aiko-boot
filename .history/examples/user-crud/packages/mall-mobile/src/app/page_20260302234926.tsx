type User = {
  id: number;
  username: string;
  email: string;
  age?: number;
};

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('http://localhost:3001/api/users', {
    // 移动端 Next.js 默认是服务端渲染，这里直接在服务端请求 API
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('获取用户列表失败');
  }

  const data = await res.json();
  return data.data ?? [];
}

export default async function HomePage() {
  const users = await fetchUsers();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-4 py-6 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold">用户列表</h1>
          <span className="text-xs text-gray-500">共 {users.length} 人</span>
        </header>

        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
              </div>
              <div className="text-xs text-gray-400">
                {user.age ? `${user.age} 岁` : '年龄未知'}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">暂无用户数据</p>
          )}
        </div>
      </div>
    </main>
  );
}
