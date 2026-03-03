import useSWR from 'swr';
import { toast } from 'sonner';

/**
 * 通用 CRUD API 接口
 */
export interface CrudApi<T, CreateDto, UpdateDto> {
  list(): Promise<T[]>;
  getById?(id: string): Promise<T | null>;
  create(dto: CreateDto): Promise<T>;
  update(id: string, dto: UpdateDto): Promise<T>;
  delete(id: string): Promise<unknown>;
}

/**
 * 通用 CRUD Hook
 *
 * @example
 * const userApi = new UserApi('http://localhost:3001');
 * const { data, isLoading, create, update, remove } = useCrud(userApi, 'users');
 */
export function useCrud<T, CreateDto, UpdateDto>(
  api: CrudApi<T, CreateDto, UpdateDto>,
  key: string
) {
  const { data, isLoading, mutate } = useSWR<T[]>(key, () => api.list(), {
    onError: () => toast.error('获取数据失败'),
  });

  const create = async (dto: CreateDto) => {
    try {
      await api.create(dto);
      toast.success('创建成功');
      mutate();
      return true;
    } catch (err) {
      toast.error((err as Error).message || '创建失败');
      return false;
    }
  };

  const update = async (id: string, dto: UpdateDto) => {
    try {
      await api.update(id, dto);
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
      await api.delete(id);
      toast.success('删除成功');
      mutate();
      return true;
    } catch (err) {
      toast.error((err as Error).message || '删除失败');
      return false;
    }
  };

  return {
    data: data ?? [],
    isLoading,
    create,
    update,
    remove,
    refresh: mutate,
  };
}
