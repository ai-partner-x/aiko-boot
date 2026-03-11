import { Entity, TableId, TableField } from '@ai-first/orm';

@Entity({ tableName: 'sys_role' })
export class Role {
  @TableId({ type: 'AUTO' })
  id!: number;

  @TableField({ column: 'role_code' })
  roleCode!: string;

  @TableField({ column: 'role_name' })
  roleName!: string;

  @TableField({ column: 'description' })
  description?: string;

  @TableField({ column: 'status' })
  status!: number;

  @TableField({ column: 'created_at' })
  createdAt?: Date;
}
