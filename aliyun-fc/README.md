# 阿里云 FC 云函数部署指南

## 环境准备

```powershell
# 安装 Serverless Devs CLI
npm install @serverless-devs/s -g

# 配置阿里云凭证（只需执行一次）
s config add --AccessKeyID <你的AccessKeyID> --AccessKeySecret <你的AccessKeySecret> --AccountID <你的阿里云账号ID>
```

## 配置环境变量

在 PowerShell 中设置以下环境变量（部署前必须）：

```powershell
$env:OSS_REGION = "oss-cn-beijing"
$env:OSS_BUCKET = "sales-lead-app"
$env:OSS_ACCESS_KEY_ID = "你的AccessKeyID"
$env:OSS_ACCESS_KEY_SECRET = "你的AccessKeySecret"
```

## 一键部署

```powershell
cd d:\Qcoder\sales-lead-agent\aliyun-fc
s deploy
```

部署完成后，将输出的 HTTP 触发器 URL 更新到前端 `.env.production`：

```
VITE_ANALYTICS_API=https://你的触发器URL
```

## 手动部署（控制台）

1. 登录 [阿里云 FC 控制台](https://fcnext.console.aliyun.com/)
2. 进入服务 `sales-analytics` → 函数 `analytics-api`
3. 在线编辑器中粘贴 `index.js` 的完整代码
4. 配置环境变量（OSS_REGION、OSS_BUCKET、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET）
5. 保存并部署

## 数据结构

OSS 中存储两个 JSON 文件：

| 文件路径 | 内容 |
|---------|------|
| `analytics-data/chat-logs.json` | 对话日志数组 |
| `analytics-data/click-paths.json` | 点击路径数组 |

## API 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/chat` | 获取全部对话日志 |
| POST | `/chat` | 追加一条对话记录 |
| DELETE | `/chat` | 清空对话数据 |
| GET | `/clicks` | 获取全部点击路径 |
| POST | `/clicks` | 追加一条点击记录 |
| DELETE | `/clicks` | 清空点击数据 |
