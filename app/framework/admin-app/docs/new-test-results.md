# Admin App API 测试 curl 命令

## 测试环境
- **后端 API**：http://localhost:3003
- **用户名**：admin
- **密码**：Admin@123

---

## 认证接口

### 1. 登录接口
```bash
curl -X POST "http://localhost:3003/api/auth/login" -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"Admin@123\"}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/auth/login" -Method POST -Header @{'Content-Type'='application/json'} -Body '{\"username\": \"admin\", \"password\": \"Admin@123\"}'
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3MzA0MzYzMiwiZXhwIjoxNzczNjQ4NDMyfQ.K9-GBbiH5kTk-ok6EKe9MlOaFg5BnhS3pFJyw8BrznY",
    "userInfo": {
      "id": 1,
      "username": "admin",
      "realName": "超级管理员",
      "roles": ["SUPER_ADMIN"],
      "permissions": ["sys:user:list", "sys:role:list", "sys:menu:list"]
    }
  }
}
```

---



---

### 3. 获取用户信息
```bash
curl -X GET "http://localhost:3003/api/auth/info?_uid=1" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/auth/info?_uid=1" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "超级管理员",
    "email": null,
    "phone": null,
    "status": 1,
    "createdAt": "2026-03-09T01:54:36.283Z",
    "updatedAt": "2026-03-09T01:54:36.283Z",
    "roles": [
      "SUPER_ADMIN"
    ],
    "permissions": [
      "sys:user:list",
      "sys:role:list",
      "sys:menu:list"
    ]
  }
}
```

---

## 用户管理接口

### 4. 分页查询用户
```bash
curl -X GET "http://localhost:3003/api/sys/user/page?pageNo=1&pageSize=10&username=admin&status=1" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/user/page?pageNo=1&pageSize=10&username=admin&status=1" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "username": "admin",
        "realName": "超级管理员",
        "email": null,
        "phone": null,
        "status": 1,
        "createdAt": "2026-03-09T01:54:36.283Z",
        "updatedAt": "2026-03-09T01:54:36.283Z",
        "roles": [
          "SUPER_ADMIN"
        ]
      }
    ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

### 5. 获取用户详情
```bash
curl -X GET "http://localhost:3003/api/sys/user/1" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/user/1" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "超级管理员",
    "email": null,
    "phone": null,
    "status": 1,
    "createdAt": "2026-03-09T01:54:36.283Z",
    "updatedAt": "2026-03-09T01:54:36.283Z",
    "roles": [
      "SUPER_ADMIN"
    ]
  }
}
```

---

### 6. 创建用户
```bash
curl -X POST "http://localhost:3003/api/sys/user" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"username\": \"testuser\", \"password\": \"123456\", \"realName\": \"测试用户\", \"email\": \"test@example.com\", \"phone\": \"13800138000\", \"status\": 1}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/user" -Method POST -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"username\": \"testuser\", \"password\": \"123456\", \"realName\": \"测试用户\", \"email\": \"test@example.com\", \"phone\": \"13800138000\", \"status\": 1}'
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "SQLite3 can only bind numbers, strings, bigints, buffers, and null"
}
```

---

### 7. 更新用户
```bash
curl -X PUT "http://localhost:3003/api/sys/user/2" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"realName\": \"测试用户更新\", \"email\": \"test2@example.com\", \"phone\": \"13900139000\", \"status\": 1}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/user/2" -Method PUT -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"realName\": \"测试用户更新\", \"email\": \"test2@example.com\", \"phone\": \"13900139000\", \"status\": 1}'
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "用户不存在"
}
```

---

### 8. 删除用户
```bash
curl -X DELETE "http://localhost:3003/api/sys/user/2" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/user/2" -Method DELETE -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "用户不存在"
}
```

---

### 9. 重置密码
```bash
curl -X PUT "http://localhost:3003/api/sys/user/2/password" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"newPassword\": \"654321\"}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/user/2/password" -Method PUT -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"newPassword\": \"654321\"}'
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "用户不存在"
}
```

---

## 角色管理接口

### 10. 查询角色列表
```bash
curl -X GET "http://localhost:3003/api/sys/role/list" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role/list" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "roleCode": "SUPER_ADMIN",
      "roleName": "超级管理员",
      "description": "拥有全部权限",
      "status": 1,
      "createdAt": "2026-03-09T01:54:36.153Z"
    }
  ]
}
```

---

### 11. 获取角色详情
```bash
curl -X GET "http://localhost:3003/api/sys/role/1" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role/1" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "roleCode": "SUPER_ADMIN",
    "roleName": "超级管理员",
    "description": "拥有全部权限",
    "status": 1,
    "createdAt": "2026-03-09T01:54:36.153Z",
    "menuIds": [
      1,
      2,
      3,
      4
    ]
  }
}
```

---

### 12. 创建角色
```bash
curl -X POST "http://localhost:3003/api/sys/role" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"roleCode\": \"TEST_ADMIN\", \"roleName\": \"测试管理员\", \"description\": \"测试角色\", \"status\": 1, \"menuIds\": [1, 2, 3]}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role" -Method POST -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"roleCode\": \"TEST_ADMIN\", \"roleName\": \"测试管理员\", \"description\": \"测试角色\", \"status\": 1, \"menuIds\": [1, 2, 3]}'
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "SQLite3 can only bind numbers, strings, bigints, buffers, and null"
}
```

---

### 13. 更新角色
```bash
curl -X PUT "http://localhost:3003/api/sys/role/2" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"roleName\": \"测试管理员更新\", \"description\": \"测试角色更新\", \"status\": 1, \"menuIds\": [1, 2]}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role/2" -Method PUT -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"roleName\": \"测试管理员更新\", \"description\": \"测试角色更新\", \"status\": 1, \"menuIds\": [1, 2]}'
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "角色不存在"
}
```

---

### 14. 删除角色
```bash
curl -X DELETE "http://localhost:3003/api/sys/role/2" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role/2" -Method DELETE -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：失败

**响应**：
```json
{
  "success": false,
  "error": "角色不存在"
}
```

---

### 15. 获取角色菜单
```bash
curl -X GET "http://localhost:3003/api/sys/role/1/menus" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role/1/menus" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": [
    1,
    2,
    3,
    4
  ]
}
```

---

### 16. 分配菜单
```bash
curl -X PUT "http://localhost:3003/api/sys/role/1/menus" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"menuIds\": [1, 2, 3, 4]}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/role/1/menus" -Method PUT -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"menuIds\": [1, 2, 3, 4]}'
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "roleCode": "SUPER_ADMIN",
    "roleName": "超级管理员",
    "description": "拥有全部权限",
    "status": 1,
    "createdAt": "2026-03-09T01:54:36.153Z"
  }
}
```

---

## 菜单管理接口

### 17. 获取菜单树
```bash
curl -X GET "http://localhost:3003/api/sys/menu/tree" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/menu/tree" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "menuName": "系统管理",
      "menuType": 1,
      "path": null,
      "component": null,
      "permission": null,
      "icon": "Settings",
      "sortOrder": 100,
      "status": 1,
      "children": [
        {
          "id": 2,
          "parentId": 1,
          "menuName": "用户管理",
          "menuType": 2,
          "path": "/sys/user",
          "component": null,
          "permission": "sys:user:list",
          "icon": null,
          "sortOrder": 1,
          "status": 1
        },
        {
          "id": 3,
          "parentId": 1,
          "menuName": "角色管理",
          "menuType": 2,
          "path": "/sys/role",
          "component": null,
          "permission": "sys:role:list",
          "icon": null,
          "sortOrder": 2,
          "status": 1
        },
        {
          "id": 4,
          "parentId": 1,
          "menuName": "菜单管理",
          "menuType": 2,
          "path": "/sys/menu",
          "component": null,
          "permission": "sys:menu:list",
          "icon": null,
          "sortOrder": 3,
          "status": 1
        }
      ]
    }
  ]
}
```

---

### 18. 获取用户菜单树
```bash
curl -X GET "http://localhost:3003/api/sys/menu/user-tree?_perms=sys:user:list,sys:role:list" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/menu/user-tree?_perms=sys:user:list,sys:role:list" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "menuName": "系统管理",
      "menuType": 1,
      "path": null,
      "component": null,
      "permission": null,
      "icon": "Settings",
      "sortOrder": 100,
      "status": 1,
      "children": [
        {
          "id": 2,
          "parentId": 1,
          "menuName": "用户管理",
          "menuType": 2,
          "path": "/sys/user",
          "component": null,
          "permission": "sys:user:list",
          "icon": null,
          "sortOrder": 1,
          "status": 1
        },
        {
          "id": 3,
          "parentId": 1,
          "menuName": "角色管理",
          "menuType": 2,
          "path": "/sys/role",
          "component": null,
          "permission": "sys:role:list",
          "icon": null,
          "sortOrder": 2,
          "status": 1
        },
        {
          "id": 4,
          "parentId": 1,
          "menuName": "菜单管理",
          "menuType": 2,
          "path": "/sys/menu",
          "component": null,
          "permission": "sys:menu:list",
          "icon": null,
          "sortOrder": 3,
          "status": 1
        }
      ]
    }
  ]
}
```

---

### 19. 获取菜单详情
```bash
curl -X GET "http://localhost:3003/api/sys/menu/1" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/menu/1" -Method GET -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "parentId": 0,
    "menuName": "系统管理",
    "menuType": 1,
    "path": null,
    "component": null,
    "permission": null,
    "icon": "Settings",
    "sortOrder": 100,
    "status": 1
  }
}
```

---

### 20. 创建菜单
```bash
curl -X POST "http://localhost:3003/api/sys/menu" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"parentId\": 1, \"menuName\": \"测试菜单\", \"menuType\": 2, \"path\": \"/test\", \"component\": \"\", \"permission\": \"sys:test\", \"icon\": \"test\", \"sortOrder\": 10, \"status\": 1}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/menu" -Method POST -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"parentId\": 1, \"menuName\": \"测试菜单\", \"menuType\": 2, \"path\": \"/test\", \"component\": \"\", \"permission\": \"sys:test\", \"icon\": \"test\", \"sortOrder\": 10, \"status\": 1}'
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": 1
}
```

---

### 21. 更新菜单
```bash
curl -X PUT "http://localhost:3003/api/sys/menu/5" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo" -d "{\"menuName\": \"测试菜单更新\", \"menuType\": 2, \"path\": \"/test-update\", \"component\": \"\", \"permission\": \"sys:test:update\", \"icon\": \"update\", \"sortOrder\": 20, \"status\": 1}"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/menu/5" -Method PUT -Header @{'Content-Type'='application/json'} -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'} -Body '{\"menuName\": \"测试菜单更新\", \"menuType\": 2, \"path\": \"/test-update\", \"component\": \"\", \"permission\": \"sys:test:update\", \"icon\": \"update\", \"sortOrder\": 20, \"status\": 1}'
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 5,
    "parentId": 1,
    "menuName": "测试菜单更新",
    "menuType": 2,
    "path": "/test-update",
    "component": "",
    "permission": "sys:test:update",
    "icon": "update",
    "sortOrder": 20,
    "status": 1
  }
}
```

---

### 22. 删除菜单
```bash
curl -X DELETE "http://localhost:3003/api/sys/menu/5" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/sys/menu/5" -Method DELETE -Header @{'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiJdLCJwZXJtaXNzaW9ucyI6WyJzeXM6dXNlcjpsaXN0Iiwic3lzOnJvbGU6bGlzdCIsInN5czptZW51Omxpc3QiXSwiaWF0IjoxNzczMDQzNjMyLCJleHAiOjE3NzMwNTA4MzJ9.p5S4W6dbblMroWT19cNLFHTJ1JpppUftCNTQyfhszmo'}
```

**结果**：成功

**响应**：
```json
{
  "success": true,
  "data": {
    "message": "删除成功"
  }
}
```
