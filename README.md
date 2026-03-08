# 心迹·情侣时光 前端项目

## 技术栈

- uni-app (Vue 3)
- TypeScript
- Pinia 状态管理
- Vite 构建工具

## 目录结构

```
src/
├── api/                # API 接口
│   └── index.ts
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── login/          # 登录
│   ├── couple/         # 配对
│   ├── calendar/       # 日历
│   ├── diary/          # 日记
│   ├── wish/           # 心愿
│   └── mine/           # 我的
├── stores/             # Pinia 状态
│   └── user.ts
├── utils/              # 工具函数
│   └── request.ts
├── static/             # 静态资源
├── App.vue             # 根组件
├── main.ts             # 入口文件
├── pages.json          # 页面配置
└── manifest.json       # 应用配置
```

## 快速开始

### 1. 安装依赖

```bash
cd love-frontend
npm install
```

### 2. 开发运行

```bash
# H5 模式
npm run dev:h5

# 微信小程序模式
npm run dev:mp-weixin
```

### 3. 构建发布

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 配置说明

### API 地址

修改 `src/utils/request.ts` 中的 `BASE_URL`：

```typescript
const BASE_URL = 'http://localhost:8080/api'
```

### 微信小程序 AppID

修改 `src/manifest.json` 中的 `mp-weixin.appid`

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | /pages/index/index | 情侣头像、统计、快捷入口 |
| 登录 | /pages/login/index | 微信一键登录 |
| 配对 | /pages/couple/index | 创建/加入情侣空间 |
| 日历 | /pages/calendar/index | 共享日历、事件管理 |
| 日记 | /pages/diary/index | 日记墙 |
| 写日记 | /pages/diary/edit | 发布日记 |
| 心愿 | /pages/wish/index | 心愿清单 |
| 我的 | /pages/mine/index | 个人中心 |

## 设计规范

- 主色调：#FF6B9D（粉色）
- 背景色：#FFF9FA
- 圆角：24rpx（卡片）、48rpx（按钮）
- 阴影：0 4rpx 20rpx rgba(0,0,0,0.05)
