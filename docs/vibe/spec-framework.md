# Momakoding Game UI Framework Spec

## 概述

基于 **Vue 3 + Vue Router 4 + Tailwind CSS 4 + Phaser 4** 的 Game Jam 脚手架，提供首页菜单、玩法介绍、关于我们、游戏容器等通用页面，以及一套"Vue 宿主 ↔ Phaser 游戏世界"的四层架构。

> 架构细节与 vibe coding 手册见 `docs/structure.md`；Demo 玩法与文件清单见 `docs/game-demo.md`。

## 技术栈

- **Vue 3** — Composition API，`<script setup lang="ts">` only
- **Vue Router 4** — `createWebHashHistory`
- **Tailwind CSS 4** — `@tailwindcss/vite` + `tw-animate-css`
- **Phaser 4** — Arcade 物理为默认引擎
- **Pinia** — 状态管理（已挂载，暂无 store；预留给真实游戏的存档数据）
- **TypeScript** — 严格模式，`any` 禁用
- **Vite 8** — `@` alias → `./src`
- 工具库：`@vueuse/core`、`lucide-vue-next`、`tailwind-merge`、`animate.css`

## 目录结构

```text
.
├── docs/                          # 项目说明与学习文档
│   ├── spec-framework.md          # 当前 UI/工程框架规格 (本文件)
│   ├── structure.md               # 引擎架构总览 + vibe coding 手册
│   ├── game-demo.md               # Demo 玩法、结构与技术要点
│   └── phaser-study.md            # Phaser × Vue 集成调研
├── public/                        # 静态资源（不会被 Vite 重新处理）
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.png
│
├── src/
│   ├── main.ts                    # 入口：挂载 Vue + Router + Pinia (+ persisted-state)
│   ├── App.vue                    # 根组件 <RouterView />
│   ├── style.css                  # Tailwind v4 入口 + @theme tokens + 自定义滚动条
│   ├── assets/                    # 参与 Vite 构建的素材
│   │
│   │ ── 以下是"四层架构" ────────────────────────────────────
│   │
│   ├── engine/                    # ① 引擎层 (UI 无关 + 游戏无关，换游戏不改)
│   │   ├── game-shell/            # Phaser.Game 生命周期薄封装
│   │   │   ├── game-shell.ts      # GameShell 类
│   │   │   ├── defaults.ts        # SHELL_DEFAULTS (引擎内部兜底值)
│   │   │   └── index.ts
│   │   ├── event-bus/             # Map<string, Set<cb>> pub/sub
│   │   │   ├── event-bus.ts       # GameEventBus 类
│   │   │   └── index.ts
│   │   ├── types.ts               # EventCallback
│   │   └── index.ts               # 桶导出
│   │
│   ├── contents/                  # ② 游戏内容层 (与 Phaser 耦合，与 UI 解耦)
│   │   ├── constants.ts           # ★ SCENE_KEYS / EVENT_KEYS / GAME_CONFIG 全项目唯一源
│   │   ├── types.ts               # IGameSceneData 等
│   │   ├── scenes/
│   │   │   ├── boot-scene.ts      # 占位纹理生成 → 切到 GameScene
│   │   │   ├── game-scene.ts      # 平台跳跃 + 星星收集
│   │   │   └── index.ts
│   │   ├── assets/                # (占位，未来非代码资产的元数据)
│   │   └── index.ts               # 桶导出
│   │
│   ├── runtime/                   # ③ 运行时胶水层 (Vue 侧模块级单例)
│   │   ├── game.ts                # useGame()：GameShell 单例 + 场景遥控器
│   │   ├── event-bus.ts           # useEventBus()：GameEventBus 单例
│   │   └── index.ts
│   │
│   ├── composables/               # ④ 真·Vue composables（返回 Ref / 依赖组件生命周期）
│   │   └── index.ts               # 暂空 stub
│   │
│   │ ── 以下是 UI 层 ──────────────────────────────────────
│   │
│   ├── components/                # 全局可复用 UI 原语
│   │   └── game-button.vue
│   │
│   ├── pages/                     # 路由页面
│   │   ├── home-page.vue          # 首页：游戏标题 + 功能按钮
│   │   ├── how-to-play.vue        # 玩法介绍
│   │   ├── about-us.vue           # 关于我们
│   │   ├── game.vue               # /game 路由容器：暂停遮罩 + ESC + 退出
│   │   └── game-demo/             # ⭐ Vue 挂载 Phaser 的示范（仅 index.vue）
│   │       └── index.vue
│   │
│   └── router/
│       └── index.ts               # Hash-history 路由表
│
└── 配置文件
    ├── AGENTS.md                  # 多 agent 协作协议 + §13 活注册表
    ├── package.json
    ├── vite.config.ts             # @ alias → ./src；vue + tailwind 插件
    ├── tsconfig*.json
    └── index.html
```

## 分层约定

四层严格单向依赖：**`pages → runtime → contents → engine`**。

| 层 | 职责 | 可 import | 禁止 import |
|---|---|---|---|
| `engine/` | Phaser 薄封装，UI 无关 + 游戏无关 | 只 import Phaser 本身 | **任何项目内模块** |
| `contents/` | 游戏世界（场景、常量、实体、数值） | `engine/`、`runtime/`、Phaser | `pages/`、Vue、DOM |
| `runtime/` | Vue 侧模块级单例（非 composable） | `engine/`、`@/contents/constants`（深路径） | `@/contents` 桶导出（会触发 ESM 循环）、`pages/` |
| `composables/` | 真·Vue composable（返回 `Ref` 或依赖生命周期的 hook） | 任意下层 | `pages/` |
| `components/` | 全局可复用 UI 原语 | 任意下层 | `pages/` |
| `pages/` | 路由页 + 页面级组合 | 任意下层 | 无 |

**分层判据**是"换一个 jam 游戏能不能复用"，不是"是否 import Phaser"。`engine/` 和 `contents/` 都可以 import Phaser，只是抽象层级不同。

**`runtime/ → contents/` 必须走深路径。** `contents/scenes/*` 顶层有 `useEventBus()` / `useGame()` 的模块级副作用；经 `@/contents` 桶导出会顺带拉起 scenes，而 scenes 反向 import `@/runtime`，造成 ESM 循环启动。现用示范：`src/runtime/game.ts:5`。

## 命名规范

- **文件名**：`kebab-case`（`player-entity.ts`、`game-hud.vue`）
- **Vue 组件引用**：`PascalCase`（`<GameButton />`）
- **Scene 类**：`PascalCase` + `Scene` 后缀（`GameScene`、`BootScene`）
- **Scene key 字符串**：与类名一致的 `PascalCase`（`'GameScene'`）
- **事件 key**：`namespace:verb`（`'score:update'`、`'game:restart'`）
- **资产 key**：`kebab-case` 名词（`'player'`、`'enemy-goblin'`、`'bgm-level-1'`）
- **路由路径**：`kebab-case`（`/how-to-play`）
- **常量**：`UPPER_SNAKE_CASE`，放在 `as const` 对象内

## 页面规格

### 1. 首页 (`/`)

- 全屏容器，内容垂直 + 水平居中
- 游戏名称：大号标题，占位符文本 `[请输入文本]`
- 功能按钮纵向排列，间距适中：
  1. **开始游戏** → 导航到 `/how-to-play?from=start`
  2. **玩法介绍** → 导航到 `/how-to-play?from=menu`
  3. **关于我们** → 导航到 `/about-us`
  4. **退出游戏** → 执行 `window.close()`，失败则跳转 `about:blank`
- 背景：纯色深色调（后期可替换为视觉特效）

### 2. 玩法介绍页 (`/how-to-play`)

- 全屏容器，内容居中
- 标题 "玩法介绍"
- 正文区域：占位文本说明
- 底部按钮根据来源切换：
  - `from=start` → 显示 "开始游戏"（预留，暂导航到 `/`）
  - `from=menu` → 显示 "返回主页"（导航到 `/`）

### 3. 关于我们页 (`/about-us`)

- 全屏容器，内容居中
- 标题 "关于我们"
- 团队 / 项目信息占位
- 底部 "返回主页" 按钮

### 4. 游戏页 (`/game`)

- `pages/game.vue` 是路由容器，负责：
  - 挂载子组件 `<GameDemo />`（即 `pages/game-demo/index.vue`）
  - 暂停遮罩 + 「⏸ 暂停」/「继续游戏」按钮
  - ESC 键切换暂停
  - 「退出到主页」`RouterLink`
- **不直接碰 Phaser**。所有"暂停"/"恢复"动作都走 `eventBus.emit(EVENT_KEYS.GAME_PAUSE/GAME_RESUME)`，由 `GameScene` 响应。
- 子组件 `game-demo/index.vue` 才负责 `initGame` / `destroyGame` 以及 canvas DOM 的 mount。

## 组件规格

### GameButton

- Props：`label: string`、`variant?: 'primary' | 'secondary'`
- BEM 命名：`.game-button` / `.game-button--primary` / `.game-button--secondary`
- 统一游戏风格，含 hover/active 状态
- 使用 Tailwind 原子类 + 少量 `@apply`（顶部需 `@reference "@/style.css";`）

## 路由配置

源文件：`src/router/index.ts`，模式：`createWebHashHistory`。

| 路径 | name | 页面组件 | 说明 |
|---|---|---|---|
| `/` | `home` | `pages/home-page.vue` | 首页 |
| `/how-to-play` | `how-to-play` | `pages/how-to-play.vue` | 玩法介绍 |
| `/about-us` | `about-us` | `pages/about-us.vue` | 关于我们 |
| `/game` | `game` | `pages/game.vue` → `pages/game-demo/index.vue` | 游戏容器（暂停管理 + Phaser 宿主） |

## 全局样式 (Tailwind v4)

- **原子优先**，`@apply` 只在同一组件内出现重复组合时下沉到 `<style scoped>`。
- scoped 块使用 `@apply` 前必须 `@reference "@/style.css";`，否则 v4 无法解析 theme token。
- 共享 token 写在 `src/style.css` 的 `@theme { ... }` 块内（如 `--color-game-border`、`--color-scrollbar-thumb`）。
- 自定义类名用 BEM（`.game-button--primary`）。
- 自定义工具类用 v4 `@utility` 声明后再 `@apply`。
- 全屏布局：`min-h-screen`；禁止页面滚动条（游戏场景内 canvas 居中）。
- v4 变更提示：`bg-opacity-*` / `text-opacity-*` 已移除，改用 `bg-white/50` / `opacity-*` 语法。

## 状态管理

| 工具 | 状态 | 用途 |
|---|---|---|
| 组件内 `ref` / `reactive` | 常用 | 页面 / 组件自身状态 |
| Pinia + persisted-state | 已挂载、无 store | 预留给真实游戏的存档 / 设置持久化 |
| Phaser `Registry` | 未使用 | 场景重启后仍需保留的值（推荐用于高分等） |
| `runtime/` 模块级单例 | 在用 | 跨 Vue 组件共享同一个 `GameShell` / `GameEventBus` |
| EventBus | 在用 | **Vue ↔ Phaser 唯一合法通道** |

## 约束与禁忌

- 禁止 `any`、禁止 `var`。
- 禁止在 Vue 组件里写游戏逻辑（物理、碰撞、AI），**只允许 HUD / 菜单 / 遮罩**。
- 禁止用 `window.addEventListener` 做游戏状态通信，必须走 EventBus。
- 禁止在任意文件写 scene key / event key / asset key 字面量，统一从 `contents/constants.ts` import。
- 禁止 `engine/` 反向 import `contents/` / `runtime/` / `pages/`。
- 禁止 `runtime/` 从 `@/contents` 桶导出里 import（必须走 `@/contents/constants` 深路径）。
- 新增依赖需在 `AGENTS.md §13.10` 决策日志里记录理由。

## 进一步阅读

- `docs/structure.md` — 四层架构详解、每层典型代码模板、vibe coding 改数值 / 加场景 / 加事件的 step-by-step。
- `docs/game-demo.md` — 当前平台跳跃 demo 的玩法、涉及文件和技术要点。
- `docs/phaser-study.md` — Phaser × Vue 集成原始调研（中文）。
- `AGENTS.md` — 硬规约、多 agent 协作协议、§13 活注册表（所有 scene / event / asset / route / store 的唯一事实源）。
