import 'reflect-metadata';
import { Service, Transactional } from '@ai-first/core';
import { Autowired } from '@ai-first/di/server';
import bcrypt from 'bcryptjs';
import { SysUserMapper } from '../mapper/sys-user.mapper.js';
import { SysUserRoleMapper } from '../mapper/sys-user-role.mapper.js';
import { SysRoleMapper } from '../mapper/sys-role.mapper.js';
import type { CreateUserDto, UpdateUserDto, UserPageDto, UserVo } from '../dto/user.dto.js';

@Service()
export class UserService {
  @Autowired()
  private userMapper!: SysUserMapper;

  @Autowired()
  private userRoleMapper!: SysUserRoleMapper;

  @Autowired()
  private roleMapper!: SysRoleMapper;

  async pageUsers(params: UserPageDto) {
    const allUsers = await this.userMapper.selectList();
    let filtered = allUsers;
    if (params.username) {
      filtered = filtered.filter(u => u.username.includes(params.username!));
    }
    if (params.status !== undefined) {
      filtered = filtered.filter(u => u.status === params.status);
    }
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 10;
    const total = filtered.length;
    const records = filtered.slice((pageNo - 1) * pageSize, pageNo * pageSize);
    const usersWithRoles = await Promise.all(records.map(u => this.toVo(u)));
    return { records: usersWithRoles, total, pageNo, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: number): Promise<UserVo> {
    const user = await this.userMapper.selectById(id);
    if (!user) throw new Error('用户不存在');
    return this.toVo(user);
  }

  @Transactional()
  async createUser(dto: CreateUserDto): Promise<UserVo> {
    const exists = await this.userMapper.selectByUsername(dto.username);
    if (exists) throw new Error('用户名已存在');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userMapper.insert({
      username: dto.username,
      password: hashed,
      realName: dto.realName,
      email: dto.email,
      phone: dto.phone,
      status: dto.status ?? 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (dto.roleIds?.length) await this.assignRoles(user.id, dto.roleIds);
    return this.toVo(user);
  }

  @Transactional()
  async updateUser(id: number, dto: UpdateUserDto): Promise<UserVo> {
    const user = await this.userMapper.selectById(id);
    if (!user) throw new Error('用户不存在');
    if (dto.realName !== undefined) user.realName = dto.realName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.status !== undefined) user.status = dto.status;
    user.updatedAt = new Date();
    await this.userMapper.updateById(user);
    if (dto.roleIds !== undefined) await this.assignRoles(id, dto.roleIds);
    return this.toVo(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userMapper.selectById(id);
    if (!user) throw new Error('用户不存在');
    await this.userRoleMapper.delete({ userId: id });
    return this.userMapper.deleteById(id);
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.userMapper.selectById(id);
    if (!user) throw new Error('用户不存在');
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await this.userMapper.updateById(user);
  }

  private async assignRoles(userId: number, roleIds: number[]) {
    await this.userRoleMapper.delete({ userId });
    for (const roleId of roleIds) {
      await this.userRoleMapper.insert({ userId, roleId });
    }
  }

  private async toVo(user: any): Promise<UserVo> {
    const userRoles = await this.userRoleMapper.selectList({ userId: user.id });
    const roles: string[] = [];
    for (const ur of userRoles) {
      const role = await this.roleMapper.selectById(ur.roleId);
      if (role) roles.push(role.roleCode);
    }
    const { password: _p, ...safe } = user;
    return { ...safe, roles };
  }
}
