# Momakoding Game Jam Starter

## 快速导航

|  | 中文 | English |
|---|---|---|
| 🎮 **有创意 / Game idea** | [上手指南](../onboarding/onboarding.zh.md) | [Onboarding Guide](../onboarding/onboarding.en.md) |
| 👩‍💻 **开发者 / Developer** | 你在这里 | [Developer Docs](./README.en.md) |
| 🤖 **AGENTS.md** | [AGENTS.md](../../AGENTS.md) | [AGENTS.md](../../AGENTS.md) |

---

基于 **Vue 3 + Phaser 4 + TypeScript** 的 Game Jam 快速原型脚手架。开箱即有菜单、示例游戏、暂停/恢复/退出逻辑，以及一套经过分层设计的工程结构，让 AI 辅助开发不容易出错。

---

## 技术栈

| 层 | 选型 |
|---|---|
| UI 框架 | Vue 3 SFC，`<script setup lang="ts">` |
| 游戏引擎 | Phaser 4，Arcade 物理（默认） |
| 语言 | TypeScript 严格模式，禁止 `any` |
| 打包 | Vite 8，`@` 别名 → `./src` |
| 样式 | Tailwind CSS v4 + `tw-animate-css` |
| 路由 | vue-router 4，Hash History |
| 状态 | Pinia + persisted-state（预留，暂无 store） |
| 图标 | lucide-vue-next |
| 工具 | @vueuse/core、tailwind-merge、animate.css |

---

## 快速开始

```bash
pnpm install
pnpm dev      # http://localhost:5173/
pnpm build    # 输出到 dist/
```

---

## 项目结构

```
src/
├── main.ts                  # 应用入口：Pinia + Router
├── App.vue                  # 根组件 <RouterView/>
├── style.css                # Tailwind v4 入口 + @theme tokens
│
├── engine/                  # ① 引擎层：UI 无关、游戏无关的 Phaser 薄封装
│   ├── game-shell/          #   GameShell（Phaser.Game 生命周期）
│   ├── event-bus/           #   GameEventBus（Map+Set pub/sub）
│   └── types.ts             #   EventCallback 等引擎级类型
│
├── contents/                # ② 游戏内容层：场景/常量/类型的唯一事实源
│   ├── constants.ts         #   ★ SCENE_KEYS / EVENT_KEYS / GAME_CONFIG
│   ├── types.ts             #   IGameSceneData 等
│   ├── game-info/           #   ★ 游戏标题、玩法文案、团队信息
│   └── scenes/              #   BootScene / GameScene / ...
│
├── runtime/                 # ③ 运行时胶水层：Vue 侧模块级单例
│   ├── game.ts              #   useGame()（包装 GameShell）
│   └── event-bus.ts         #   useEventBus()（包装 GameEventBus）
│
├── composables/             # ④ 真·Vue composables（返回 Ref / 依赖组件生命周期）
│
├── components/
│   ├── game-button.vue      # BEM 风格按钮，primary / secondary 变体
│   └── mmkd-starter-credit.vue # Momakoding 脚手架署名卡片
│
├── pages/
│   ├── home-page.vue        # 首页菜单
│   ├── how-to-play.vue      # 玩法介绍
│   ├── about-us.vue         # 关于我们
│   ├── game.vue             # 游戏容器（暂停遮罩 / ESC / 退出）
│   └── game-demo/
│       └── index.vue        # ⭐ 参考范例：Vue 侧如何挂载 Phaser 游戏
│
└── router/
    └── index.ts             # Hash History 路由表
```

### 四层依赖方向（单向，不可逆）

```
pages → runtime → engine
pages → contents
contents → engine
```

- `engine/` 不 import 任何项目内模块。
- `runtime/` 引用 `contents/` 只走深路径（`@/contents/constants`），禁止走桶导出（防止 ESM 循环）。
- `contents/` 不 import `pages/`。

详细架构说明见 [`vibe/engine-structure.md`](../vibe/engine-structure.md)。

---

## 个性化内容入口（开做前先改）

这个脚手架故意把“玩家会直接看到的占位内容”集中在少数几个文件里。正式开做自己的游戏前，建议先完成这份清单：

| 要改什么 | 文件 | 会影响哪里 |
|---|---|---|
| 游戏名称、副标题 | `src/contents/game-info/game-meta.ts` | 首页标题、页面展示的游戏元信息 |
| 玩法介绍正文 | `src/contents/game-info/how-to-play.md` | `/how-to-play` 页面，支持 Markdown 和少量 HTML |
| 团队名称、成员、项目简介 | `src/contents/game-info/team.ts` | `/about-us` 页面 |
| 全局主题色 | `src/style.css` 的 `@theme { ... }` | 首页、按钮、面板、文字、边框等 Tailwind token |

> 看到 `[请输入文本]`、`[Text Here]`、`[团队名称]`、`[成员 A]` 这类内容，就说明还没完成个性化。可以直接让 AI：“把 game-info 里的占位内容替换成我的游戏信息，并把主题色改成霓虹赛博风”。

主题色优先改 `@theme` 中已有 token，例如 `--color-accent`、`--color-bg-page`、`--color-text-primary`。不要在各个 Vue 文件里到处硬编码颜色；这样后续换主题最快。

---

## 路由

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | `home-page.vue` | 首页菜单 |
| `/how-to-play` | `how-to-play.vue` | 玩法介绍 |
| `/about-us` | `about-us.vue` | 关于我们 |
| `/game` | `game.vue` | 游戏页面 |

History 模式：**Hash**（`createWebHashHistory`），无需服务端配置。

---

## 示例游戏（Demo）

访问 `/#/game`，进入平台跳跃收集星星的 Demo。

| 操作 | 说明 |
|---|---|
| ← → | 移动 |
| ↑ | 跳跃（仅地面） |
| ESC | 暂停 / 恢复 |

所有纹理由 `BootScene` 用 `generateTexture` 在运行时生成，零外部素材依赖。

---

## 开发约定

- **新场景**：继承 `Phaser.Scene`，key 从 `SCENE_KEYS` 取，`shutdown` 里清理监听器。
- **新事件**：先加进 `EVENT_KEYS`，再在两端 `on` / `emit`，最后更新 `AGENTS.md §13.5`。
- **新资产**：key 登记进 `AGENTS.md §13.6`；占位用 `generateTexture`，真实素材放 `public/assets/`。
- **数值调参**：只改 `contents/constants.ts` 里的 `GAME_CONFIG`，不动场景代码。
- **展示文案**：优先改 `contents/game-info/`，不要把游戏名、团队名、玩法说明散落在页面组件里。
- **主题换肤**：优先改 `src/style.css` 的 `@theme` token，复用 Tailwind 类名，不要到处写一次性颜色。
- **Vue ↔ Phaser 通信**：只走 `EventBus`，禁止在 Vue 里直接操作 Phaser 对象。

多 agent 协作规约见 [`AGENTS.md`](../../AGENTS.md)。

---

## 文档索引

| 文件 | 内容 |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | 多 agent 协作协议 + 活注册表（场景/事件/资产/路由） |
| [`vibe/spec-game.md`](../vibe/spec-game.md) | 游戏设计 spec（用户描述创意后由 AI 自动生成/更新） |
| [`vibe/engine-structure.md`](../vibe/engine-structure.md) | 四层架构详解 + Vibe coding 手册 |
| [`vibe/game-demo.md`](../vibe/game-demo.md) | Demo 玩法与结构走读 |
| [`vibe/phaser-study.md`](../vibe/phaser-study.md) | Phaser × Vue 集成调研笔记 |
| [`onboarding.zh.md`](../onboarding/onboarding.zh.md) | 面向非技术人员的上手指南（中文） |
| [`onboarding.en.md`](../onboarding/onboarding.en.md) | 面向非技术人员的上手指南（英文） |
