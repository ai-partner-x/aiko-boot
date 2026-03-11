import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-first/orm';
import { UserRole } from '../entity/user-role.entity.js';

@Mapper(UserRole)
export class UserRoleMapper extends BaseMapper<UserRole> {}
