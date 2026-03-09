/**
 * User CRUD Example - 用户增删改查示例
 * 
 * 展示 @ai-partner-x/aiko-boot-starter-orm 的基本用法
 * 
 * TypeScript 代码可以转译为等价的 Java MyBatis-Plus 代码
 */

import 'reflect-metadata';
import { 
  Entity, 
  TableId, 
  TableField, 
  Mapper, 
  BaseMapper, 
  InMemoryAdapter,
  getEntityMetadata,
  getTableIdMetadata,
} from '../src/index.js';

// ==================== Entity 定义 ====================

/**
 * 用户实体
 * 
 * TypeScript:
 * @Entity({ table: 'sys_user' })
 * 
 * 转译为 Java:
 * @Data
 * @TableName("sys_user")
 * public class User { ... }
 */
@Entity({ table: 'sys_user', description: '系统用户表' })
class User {
  @TableId({ type: 'AUTO' })
  id!: number;
  
  @TableField({ column: 'user_name' })
  name!: string;
  
  @TableField()
  email!: string;
  
  @TableField()
  status!: 'ACTIVE' | 'INACTIVE';
  
  @TableField({ exist: false })  // 非数据库字段
  fullName?: string;
}

// ==================== Mapper 定义 ====================

/**
 * 用户 Mapper
 * 
 * TypeScript:
 * @Mapper({ entity: User })
 * class UserMapper extends BaseMapper<User> {}
 * 
 * 转译为 Java:
 * @Mapper
 * public interface UserMapper extends BaseMapper<User> {}
 */
@Mapper({ entity: User })
class UserMapper extends BaseMapper<User> {}

// ==================== 使用示例 ====================

async function main() {
  console.log('=== @aiko-boot/orm User CRUD Example ===\n');
  
  // 1. 查看实体元数据
  const entityMeta = getEntityMetadata(User);
  const tableIdMeta = getTableIdMetadata(User);
  
  console.log('Entity Metadata:', entityMeta);
  console.log('TableId Metadata:', tableIdMeta);
  console.log('');
  
  // 2. 创建 Mapper 实例并设置适配器
  const userMapper = new UserMapper();
  userMapper.setAdapter(new InMemoryAdapter<User>());
  
  // 3. 插入数据 - insert
  console.log('--- INSERT ---');
  const user1 = await userMapper.insert({ name: '张三', email: 'zhangsan@example.com', status: 'ACTIVE' });
  const user2 = await userMapper.insert({ name: '李四', email: 'lisi@example.com', status: 'ACTIVE' });
  const user3 = await userMapper.insert({ name: '王五', email: 'wangwu@example.com', status: 'INACTIVE' });
  
  console.log('Inserted:', user1);
  console.log('Inserted:', user2);
  console.log('Inserted:', user3);
  console.log('');
  
  // 4. 根据 ID 查询 - selectById
  console.log('--- SELECT BY ID ---');
  const foundUser = await userMapper.selectById(1);
  console.log('Found by ID 1:', foundUser);
  console.log('');
  
  // 5. 条件查询 - selectList
  console.log('--- SELECT LIST ---');
  const activeUsers = await userMapper.selectList({ status: 'ACTIVE' });
  console.log('Active users:', activeUsers);
  console.log('');
  
  // 6. 分页查询 - selectPage
  console.log('--- SELECT PAGE ---');
  const page = await userMapper.selectPage(
    { pageNo: 1, pageSize: 2 },
    {},
    [{ field: 'name', direction: 'asc' }]
  );
  console.log('Page result:', page);
  console.log('');
  
  // 7. 统计 - selectCount
  console.log('--- SELECT COUNT ---');
  const totalCount = await userMapper.selectCount();
  const activeCount = await userMapper.selectCount({ status: 'ACTIVE' });
  console.log('Total count:', totalCount);
  console.log('Active count:', activeCount);
  console.log('');
  
  // 8. 更新 - updateById
  console.log('--- UPDATE ---');
  user1.email = 'zhangsan_new@example.com';
  const updatedUser = await userMapper.updateById(user1);
  console.log('Updated:', updatedUser);
  console.log('');
  
  // 9. 条件更新 - update
  console.log('--- UPDATE BY CONDITION ---');
  const updateCount = await userMapper.update(
    { status: 'INACTIVE' },
    { name: '李四' }
  );
  console.log('Updated count:', updateCount);
  console.log('');
  
  // 10. 删除 - deleteById
  console.log('--- DELETE ---');
  const deleted = await userMapper.deleteById(3);
  console.log('Deleted ID 3:', deleted);
  
  const remainingCount = await userMapper.selectCount();
  console.log('Remaining count:', remainingCount);
  console.log('');
  
  console.log('=== Example Complete ===');
}

main().catch(console.error);
