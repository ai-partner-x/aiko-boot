import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-first/orm';
import { Role } from '../entity/role.entity.js';

@Mapper(Role)
export class RoleMapper extends BaseMapper<Role> {}
