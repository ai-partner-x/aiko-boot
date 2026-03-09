/**
 * 手动测试 - 不使用装饰器语法
 */
import 'reflect-metadata';
import { 
  Entity, TableId, TableField, Mapper, BaseMapper, InMemoryAdapter,
  getEntityMetadata, getTableIdMetadata, getTableFieldMetadata
} from '../dist/index.js';

// 定义实体类
class User {
  id;
  name;
  email;
  status;
}

// 手动应用装饰器
Entity({ table: 'sys_user' })(User);
TableId({ type: 'AUTO' })(User.prototype, 'id');
TableField({ column: 'user_name' })(User.prototype, 'name');
TableField()(User.prototype, 'email');
TableField()(User.prototype, 'status');

// 定义 Mapper
class UserMapper extends BaseMapper {}
Mapper({ entity: User })(UserMapper);

async function main() {
  console.log('=== @aiko-boot/orm 测试 ===\n');
  
  // 查看元数据
  console.log('Entity Metadata:', getEntityMetadata(User));
  console.log('TableId Metadata:', getTableIdMetadata(User));
  console.log('TableField Metadata:', getTableFieldMetadata(User));
  console.log('');
  
  // 创建 Mapper 实例
  const userMapper = new UserMapper();
  userMapper.setAdapter(new InMemoryAdapter());
  
  // 插入
  console.log('--- INSERT ---');
  const user1 = await userMapper.insert({ name: '张三', email: 'zhangsan@example.com', status: 'ACTIVE' });
  const user2 = await userMapper.insert({ name: '李四', email: 'lisi@example.com', status: 'ACTIVE' });
  const user3 = await userMapper.insert({ name: '王五', email: 'wangwu@example.com', status: 'INACTIVE' });
  console.log('Inserted:', user1);
  console.log('Inserted:', user2);
  console.log('Inserted:', user3);
  console.log('');
  
  // 查询
  console.log('--- SELECT ---');
  const found = await userMapper.selectById(1);
  console.log('selectById(1):', found);
  
  const activeUsers = await userMapper.selectList({ status: 'ACTIVE' });
  console.log('selectList({ status: ACTIVE }):', activeUsers);
  
  const count = await userMapper.selectCount();
  console.log('selectCount():', count);
  console.log('');
  
  // 分页
  console.log('--- PAGE ---');
  const page = await userMapper.selectPage({ pageNo: 1, pageSize: 2 });
  console.log('selectPage:', page);
  console.log('');
  
  // 更新
  console.log('--- UPDATE ---');
  user1.email = 'zhangsan_new@example.com';
  const updated = await userMapper.updateById(user1);
  console.log('updateById:', updated);
  console.log('');
  
  // 删除
  console.log('--- DELETE ---');
  const deleted = await userMapper.deleteById(3);
  console.log('deleteById(3):', deleted);
  console.log('Remaining count:', await userMapper.selectCount());
  
  console.log('\n=== 测试完成 ===');
}

main().catch(console.error);
