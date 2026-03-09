import { Entity, TableId, TableField } from '@ai-first/orm';

@Entity({ tableName: 'sys_user_role' })
export class SysUserRole {
  @TableId({ type: 'AUTO' })
  id!: number;

  @TableField({ column: 'user_id' })
  userId!: number;

  @TableField({ column: 'role_id' })
  roleId!: number;
}
