import useSWR from 'swr';
import { toast } from 'sonner';
import { UserApi } from '@user-crud/api/client';
import type { User, CreateUserDto, UpdateUserDto } from '@user-crud/api/client';

const userApi = new UserApi(import.meta.env.VITE_API_URL || 'http://localhost:3001');

export function useUsers() {
  const { data, isLoading, mutate } = useSWR<User[]>('users', () => userApi.list(), {
    onError: () => toast.error('获取用户列表失败'),
  });

  const create = async (dto: CreateUserDto) => {
    try {
      await userApi.create(dto);
      toast.success('创建成功');
      mutate();
      return true;
    } catch (err) {
      toast.error((err as Error).message || '创建失败');
      return false;
    }
  };

  const update = async (id: string, dto: UpdateUserDto) => {
    try {
      await userApi.update(id, dto);
      toast.success('更新成功');
      mutate();
      return true;
    } catch (err) {
      toast.error((err as Error).message || '更新失败');
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      await userApi.delete(id);
      toast.success('删除成功');
      mutate();
      return true;
    } catch (err) {
      toast.error((err as Error).message || '删除失败');
      return false;
    }
  };

  return {
    users: data ?? [],
    isLoading,
    create,
    update,
    remove,
  };
}
