# Decision Log

Record non-obvious architectural choices so future agents don't re-litigate them.
**Append-only.** Add new rows at the bottom.

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-25;00:01 | Use Arcade physics (not Matter) as default | Simpler API, enough for 2D jam games; swap only if a feature requires it |
| 2026-04-25;00:01 | EventBus built on `EventTarget` (not mitt/EventEmitter) | Zero-dependency, browser-native, simple typing |
| 2026-04-25;00:01 | Placeholder textures generated via `graphics.generateTexture` | Lets gameplay ship before art; keys stay stable when real art replaces them |
| 2026-04-25;00:01 | Router uses hash history | Works for `file://` and static hosting without server config |
| 2026-04-25;00:01 | Pinia + persisted-state installed but unused | Reserved for real-game save data; no stub stores until needed |
| 2026-04-25;00:01 | `game-demo/` is reference-only and will be deleted | New game code should live at `src/pages/game/` (or similar) and import from `src/core/` — not extend the demo in place |
| 2026-04-26;01:20 | 分层重构：`core/` → `engine/`（引擎基建） + 新增 `contents/`（游戏内容层）+ `composables/runtime/` → `runtime/`（Vue 单例胶水） | `core` 名字暧昧、常量跟 shell 混在同一目录；现在四层职责正交：engine 换游戏不改、contents 换 UI 不改、runtime 仅做 Vue 胶水、pages 仅 UI。`GAME_CONFIG.WIDTH/HEIGHT` 从 shell 里拿掉，改为 `SHELL_DEFAULTS` 引擎内部兜底，彻底切断 engine → contents 的反向依赖 |
| 2026-04-26;01:20 | `createGameShell(container, initialScene)` 签名不接受 config 对象 | 避免 Java-style 构造参数爆炸；游戏要覆盖画幅/物理就在 `BootScene.init()` 里用 Phaser 原生 API（`this.scale.resize(...)`），shell 永远只管生命周期 |
| 2026-04-26;01:20 | `src/pages/game-demo/` 只保留 `index.vue`，场景/常量/event-bus 的副本全部清除 | Vue 侧"如何挂载一个 Phaser 游戏"是 page 层的职责；场景本身是游戏内容，住 `contents/`。单一事实源 |
| 2026-04-26;01:35 | `contents/` 的定位改成"UI 无关 + 与 Phaser 耦合"（原先误标为"引擎无关"） | scenes 继承 `Phaser.Scene`、用 physics/input，天然跟 Phaser 耦合。分层判据是"另一个 Phaser jam 游戏能不能复用"而不是"是否碰 Phaser"；engine 能复用、contents 不能复用，两边都可用 Phaser |
| 2026-04-26;01:35 | scenes 留在 `contents/scenes/`，不单拎为顶层 `src/scenes/` | scenes 高度依赖 `contents/constants` / `types` / 未来的 `entities`，拆开只会增加跨目录 import；jam 节奏下内容层向内生长（contents/entities, contents/systems）而不是向外膨胀 |
| 2026-04-26;01:35 | `runtime/` 引用 `contents/` 一律走深路径（`@/contents/constants` / `@/contents/types`），禁止走桶 | `contents/scenes/*` 顶层有 `useGame()` / `useEventBus()` 的模块级副作用；桶导出 `@/contents` 会把 scenes 拖进来，而 scenes 反向 import `@/runtime`，造成 runtime 初始化未完成时 scenes 已经在调 runtime → 循环启动死锁 |
| 2026-04-28 | Decision Log 和 Change Log 从 AGENTS.md 拆出为独立文件（`DECISION_LOG.md` / `CHANGELOG.md`） | AGENTS.md 专注规则与活跃注册表；历史记录单独维护，避免 AGENTS.md 无限膨胀 |
