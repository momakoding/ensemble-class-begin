# Changelog

One line per change that touches `src/` or project structure. Newest at the top.

- **2026-04-30** — 文档更新：AGENTS.md §8 Skills 表新增 `spec-game.md` 触发行、§13.1 补充 `docs/vibe/` 目录说明及 `spec-game.md` 工作流；README（zh/en）Documentation Index 新增 `spec-game.md` 条目；onboarding（zh/en）新增"把你的游戏创意记录下来 / Record your game idea"章节，引导用户通过 AI 生成游戏设计 spec。
- **2026-04-30** — 全局颜色 token 审计（black/white）：`style.css` 新增 `--color-overlay-scrim`（black）、`--color-glass`（white）、`--color-text-bright`（white）、`--color-text-dark`（slate-900）；`game.vue` 的 `bg-black/60` → `bg-overlay-scrim/60`、`bg-white/10` → `bg-glass/10`、`hover:text-white` → `hover:text-text-bright`；`game-button.vue` 的 `text-slate-900` → `text-text-dark`；同步 AGENTS.md §10。
- **2026-04-29** — 全局颜色 token 审计（补充）：`style.css` 新增 `--color-danger-light`（red-500）和 `--color-success-light`（green-500）token；`game.vue` 的 `hover:bg-green-500` → `hover:bg-success-light`，`game-demo/index.vue` 的 `hover:bg-red-500` → `hover:bg-danger-light`；同步 AGENTS.md §10。
- **2026-04-29** — 全局颜色 token 审计：`App.vue`、`game-button.vue`、`mmkd-starter-credit.vue`、`how-to-play.vue`、`game.vue`、`game-demo/index.vue` 中的硬编码 Tailwind 颜色（`slate-*`/`amber-*`/`gray-*`/`green-*`/`red-*`/`yellow-*`）替换为 `style.css` `@theme` token（`bg-bg-page`/`bg-bg-overlay`/`bg-accent`/`text-text-*`/`bg-danger`/`bg-success` 等）；仅保留无对应 token 的品牌徽章色。
- **2026-04-29** — Translate all remaining Chinese in AGENTS.md to English (§10 theme tokens, §11 component organization, §13.1 directory map, §13.3 scenes); add Skills subsection under §8 with trigger table for `.skills/` discovery; update `edit-game-meta.md` skill with `showGameCard` and `ossCredits` fields.
- **2026-04-29** — 重写 `about-us.vue`：配色全面对齐 `style.css` token（`text-accent`/`bg-bg-surface`/`text-text-*` 等），移除所有硬编码 `slate-*`/`amber-*`；OSS 依赖列表改为从 `GAME_META.ossCredits` 数据驱动渲染；游戏卡片显隐由 `GAME_META.showGameCard` 控制；tag 使用全局 `game-tag` utility；类型集中到 `game-info/types.ts`（新增 `OssCredit`、`showGameCard` 字段）；同步 AGENTS.md §13.7。
- **2026-04-29** — `game-meta.ts` 新增 `GameMeta` 接口及 `description` / `tags` 字段；`about-us.vue` 游戏信息卡片改用 `GAME_META`（标题、简介、tags 迭代渲染）；`game-info/index.ts` 改为 `export *` 桶导出；新增 `.skills/scaffold/edit-game-meta.md` Skill；同步 AGENTS.md §13.7 类型表。

- **2026-04-29** — 文档补全：`docs/readme/README.en.md` 新增 Customization Checklist；`onboarding.zh.md` / `onboarding.en.md` 在"跑起来"后新增占位内容替换指引；`AGENTS.md` §13.1 新增 `game-info/` 目录规约，§13.7 补充 `IGameMeta` / `ITeamInfo` / `ITeamMember` 类型条目。
- **2026-04-28** — 整理全局颜色 token：`src/style.css` `@theme` 块新增 bg/accent/text/border/danger/success 系列 token，所有值统一引用 Tailwind 内置 `var(--color-*)` 而非硬编码 HEX；同步 AGENTS.md §10。
- **2026-04-28** — 重构 `pages/about-us.vue`：新增 Hero 标题区、团队卡片成员列表、游戏信息卡片（`needShowingIntro` 控制显隐）、全宽开源技术区（`MmkdStarterCredit` + 其他依赖列表）；升级 `components/mmkd-starter-credit.vue`（横排 header、GitHub 图标、amber 主题边框）。
- **2026-04-28** — Decision Log 和 Change Log 从 AGENTS.md 拆出为独立文件（`DECISION_LOG.md` / `CHANGELOG.md`）；更新 AGENTS.md §13.10 引用指向。
- **2026-04-28** — 新增 `src/components/mmkd-starter-credit.vue`（Momakoding 署名卡片）；重构 `pages/about-us.vue`（双列卡片布局，开源技术区独立卡片，引用 MmkdStarterCredit）；同步 AGENTS.md §13.1 / §13.7。
- **2026-04-26;01:35** — 修正 `contents/` 分层描述（"UI 无关 + 与 Phaser 耦合"，不是"引擎无关"）；确认 scenes 留在 `contents/scenes/` 不外拎；新增"runtime → contents 必须走深路径"规则到 §11；同步 §13.10 决策日志（三条新决策）。
- **2026-04-26;01:20** — 分层重构：`core` → `engine`；新增 `contents` 作为游戏内容层（场景/常量/类型的唯一源）；`composables/runtime` → `runtime`（提升到顶级）；`game-demo` 只保留 Vue 挂载示范。同步 §11 / §13.1 / §13.3 / §13.10；engine 不再依赖 `GAME_CONFIG`，改用内部 `SHELL_DEFAULTS`。
- **2026-04-25;00:01** — Initial AGENTS.md rewrite: removed Nuxt / PrimeVue / portal sections irrelevant to this project; added §13 Codebase State registries (routes, scenes, entities, events, assets, types, stores, WIP, decisions) and §0 multi-agent protocol.
