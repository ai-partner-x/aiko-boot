import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-first/orm';
import { SysMenu } from '../entity/sys-menu.entity.js';

@Mapper(SysMenu)
export class SysMenuMapper extends BaseMapper<SysMenu> {}
