/**
 * @aiko-boot/admin-component
 * Aiko Boot 管理端共享组件库
 */

// 工具函数
export { cn } from './utils';

// 基础组件
export { Button, buttonVariants } from './ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './ui/card';
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, useFormField } from './ui/form';
export { Input } from './ui/input';
export { Select, SelectItem, type SelectProps, type SelectOption } from './ui/select';
export { Label } from './ui/label';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './ui/table';
export { Toaster } from './ui/sonner';

// Aiko Boot 组件
export { DataTable, type DataTableProps, type DataTableColumn } from './ui/data-table';
export {
  StatusChip,
  MappedStatusChip,
  approvalStatusMap,
  prStatusMap,
  type StatusChipProps,
  type StatusConfig,
  type StatusMap,
  type MappedStatusChipProps,
} from './ui/status-chip';
export {
  SearchFilterBar,
  type SearchFilterBarProps,
  type FilterField,
  type FilterValue,
} from './ui/search-filter-bar';
