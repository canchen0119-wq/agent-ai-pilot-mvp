# Agent AI-Pilot (MVP 1.0)

面向保险经纪人的单人版每日助手。核心目标是把日常动作标准化为可执行任务流：发内容、回消息、做跟进、看结果。

## 1. 项目简介

MVP 首页即 Daily Dashboard，每日自动生成任务并统计执行率。  
系统包含 5 个模块：

- Dashboard：今日内容 / 今日待回 / 今日跟进 / 执行率
- Content Engine：输入客群，生成标题、短文案、CTA
- Chat Assistant：输入客户原话，按温和/推进模式生成回复
- Rhythm Tracker（线索管理页）：按 Day1/3/7 节拍提醒
- Metric View：线索量、回复率、预约数、合规达标率

所有 AI 输出都会经过后端合规过滤器。

## 2. 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- OpenAI API（支持环境变量接入）+ Mock fallback

## 3. 安装步骤

```bash
npm install
```

## 4. 环境变量说明

复制 `.env.example` 到 `.env`：

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

- `OPENAI_API_KEY` 为空时自动走 mock 生成
- 设置后会优先调用真实 OpenAI 接口

## 5. 数据库初始化

```bash
npm run db:push
npm run db:seed
```

## 6. 启动方式

```bash
npm run dev
```

打开：`http://localhost:3000`

## 7. 主要页面说明

- `/dashboard`：每日任务工作台，支持完成打勾，实时执行率
- `/content`：内容生成，支持重生成、复制、合规提示
- `/chat`：沟通回复生成，支持模式切换、复制、合规提示
- `/leads`：新增线索、阶段管理、节拍推荐、预约与回复状态
- `/metrics`：四个核心数字指标卡片

## 8. 后续扩展建议

1. 接入真实客户消息渠道（微信/短信/社媒）并自动回填 `needsReply`
2. 增加 Dashboard 日期切换与历史执行率趋势
3. 合规规则升级为可配置后台词库
4. AI 输出增加 A/B 版本与点击反馈闭环
5. SQLite 切换到 Postgres 并接入部署平台

## 目录结构

```text
app/
  api/
  dashboard/
  content/
  chat/
  leads/
  metrics/
components/
lib/
  ai/
  compliance/
  dashboard/
  leads/
  metrics/
prisma/
```

