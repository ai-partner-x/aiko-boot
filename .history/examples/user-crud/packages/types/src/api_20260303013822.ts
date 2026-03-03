/**
 * API 通用响应类型
 * 对应后端 res.json({ success: true, data: result }) 的结构
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PageResult<T = unknown> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
