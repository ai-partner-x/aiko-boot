import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-first/orm';
import { SysUserRole } from '../entity/sys-user-role.entity.js';

@Mapper(SysUserRole)
export class SysUserRoleMapper extends BaseMapper<SysUserRole> {}
