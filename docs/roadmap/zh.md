# FRAMEWORK ROADMAP — 开发路线图

> Last updated: 2026-04-30

---

## 当前状态概览

**版本：** `0.0.0`（脚手架阶段）

**已就绪：**

- ✅ 四层架构（engine → contents → runtime → pages）
- ✅ Vue 3 + Phaser 4 + TypeScript 集成
- ✅ 路由系统（首页 / 玩法介绍 / 关于我们 / 设置 / 游戏）
- ✅ EventBus 双向通信（Vue ↔ Phaser）
- ✅ 占位纹理生成（无需美术资源即可运行）
- ✅ 参考 Demo（平台跳跃 + 星星收集）
- ✅ Tailwind CSS v4 主题 token 体系
- ✅ 多 Agent 协作协议（AGENTS.md）
- ✅ Pinia + persisted-state 已挂载
- ✅ 玩法介绍页 Markdown 渲染
- ✅ 游戏元数据数据驱动（game-meta / team）

**空壳 / 待实现：**

- ⬜ Settings 页面（空组件）
- ⬜ Pinia stores（已挂载，无实际 store）
- ⬜ Phaser Registry 使用
- ⬜ 音频系统
- ⬜ 真实美术资源管线

---

## Phase 1 — 脚手架完善 🔧

> 目标：让 starter 开箱即用，降低 Game Jam 参赛者的上手成本。

| 优先级 | 功能 | 说明 | 状态 |
|---|---|---|---|
| P0 | Settings 页面 | 音量控制、画质选项、按键绑定展示；数据持久化到 Pinia store | ⬜ 待开发 |
| P0 | 音频管线 | `BootScene` 中预加载 BGM / SFX；`ASSET_KEYS.AUDIO` 常量表；全局音量控制 | ⬜ 待开发 |
| P1 | 场景过渡动画 | 场景切换时的 fade-in/out 或自定义过渡效果；封装到 `engine/` 层可复用 | ⬜ 待开发 |
| P1 | 资源加载进度条 | `BootScene` 中展示真实加载进度（当前仅生成占位纹理，无实际加载） | ⬜ 待开发 |
| P2 | 移动端适配 | 触屏虚拟摇杆 / 按钮；`<meta viewport>` 优化；canvas 自适应 | ⬜ 待开发 |
| P2 | i18n 支持 | 多语言框架（中/英至少）；UI 文案与游戏内文案分离 | ⬜ 待开发 |

---

## Phase 2 — 游戏开发加速器 🚀

> 目标：提供 Game Jam 中高频使用的通用游戏系统，减少重复造轮子。

| 优先级 | 功能 | 说明 | 状态 |
|---|---|---|---|
| P0 | 对象池系统 | `contents/systems/object-pool.ts`；子弹、粒子、敌人波次复用 | ⬜ 待开发 |
| P0 | 实体组件模式 | `contents/entities/` 目录规范；函数组合优先于类继承 | ⬜ 待开发 |
| P1 | 存档系统 | Pinia store + persisted-state；存档槽位、自动存档、手动存档 | ⬜ 待开发 |
| P1 | Game Over 流程 | 标准 Game Over 场景 + 结算面板（分数、用时、重玩/返回）；`GAME_OVER` 事件完善 | ⬜ 待开发 |
| P1 | 相机系统增强 | 跟随、震屏、缩放、边界限制的预设配置 | ⬜ 待开发 |
| P2 | 粒子特效预设 | 爆炸、拾取、伤害等常用粒子模板 | ⬜ 待开发 |
| P2 | Tiled 地图支持 | Tiled JSON 导入 + 碰撞层自动生成 | ⬜ 待开发 |
| P2 | 对话系统 | 简易对话框组件（Vue 侧 overlay）+ 剧情脚本数据格式 | ⬜ 待开发 |

---

## Phase 3 — 开发体验 & 工具链 🛠️

> 目标：提升开发效率和调试体验。

| 优先级 | 功能 | 说明 | 状态 |
|---|---|---|---|
| P1 | Debug 面板 | 开发模式下的浮动面板：FPS、物理碰撞框、实体数量、事件日志 | ⬜ 待开发 |
| P1 | 热重载优化 | Phaser 场景级 HMR（当前修改场景需刷新页面） | ⬜ 待开发 |
| P2 | CLI 脚手架命令 | `pnpm create-scene <name>`、`pnpm create-entity <name>` 等代码生成器 | ⬜ 待开发 |
| P2 | 单元测试框架 | Vitest 集成；场景逻辑和工具函数的测试模板 | ⬜ 待开发 |
| P2 | ESLint 配置 | 强制分层 import 规则（禁止反向依赖）；自动检查 `any` 使用 | ⬜ 待开发 |

---

## Phase 4 — 发布 & 社区 🌍

> 目标：让脚手架可以被更多 Game Jam 团队直接使用。

| 优先级 | 功能 | 说明 | 状态 |
|---|---|---|---|
| P1 | 一键部署 | GitHub Pages / Vercel / Netlify 部署模板和 CI 配置 | ⬜ 待开发 |
| P1 | 项目模板化 | `degit` / GitHub Template 支持；`pnpm create` 初始化流程 | ⬜ 待开发 |
| P2 | 多 Demo 示例 | 除平台跳跃外，增加 top-down shooter、puzzle、endless runner 等模板 | ⬜ 待开发 |
| P2 | 文档站点 | VitePress 驱动的文档站；教程、API 参考、最佳实践 | ⬜ 待开发 |
| P3 | 插件系统 | 可选功能模块化（排行榜、成就、广告 SDK 接入等） | ⬜ 待开发 |

---

## 不做 / 暂缓

以下功能明确不在当前路线图范围内，除非有强需求推动：

| 功能 | 原因 |
|---|---|
| Matter.js 物理引擎 | Arcade 足够覆盖大多数 2D Jam 场景；切换需 Decision Log 记录 |
| 3D 渲染 | 超出 Phaser 2D 定位 |
| 后端 / 多人联机 | Game Jam 以单机为主；联机需求建议独立项目，可能会做一个叫做Starter-WebOnline的姐妹项目 |
| 原生打包（Electron / Tauri） | 优先 Web 发布；桌面端可后续作为 Phase 4+ 考虑 |

---

## 如何推进

1. **Game Jam 参赛者**：直接使用当前脚手架，遇到缺失功能时在 WIP.md 登记需求。
2. **框架贡献者**：按 Phase 顺序认领任务，遵循 AGENTS.md 协作协议，完成后更新本文档状态。
3. **优先级调整**：根据实际 Jam 反馈动态调整，P0 优先交付，P2/P3 按需推进。
