import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-first/orm';
import { Menu } from '../entity/menu.entity.js';

@Mapper(Menu)
export class MenuMapper extends BaseMapper<Menu> {}
