import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-first/orm';
import { SysRole } from '../entity/sys-role.entity.js';

@Mapper(SysRole)
export class SysRoleMapper extends BaseMapper<SysRole> {}
