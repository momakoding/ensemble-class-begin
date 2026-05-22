# Changelog

One line per change that touches `src/` or project structure. Newest at the top.

- **2026-05-23** — 修复编译错误：`RhythmScene` 构造函数参数 `key` 加显式 `string` 类型注解，解决 `BossScene` 传入 `"BossScene"` 时 TS2345 字面量类型不匹配。
- **2026-05-23** — HiDPI（DPR）全量适配：`engine/game-shell/defaults.ts` 新增 `DPR` 常量（`devicePixelRatio` 取最大值 2）；`constants.ts` 引入 `DPR` 并对 `GAME_CONFIG.WIDTH/HEIGHT/JUDGE_LINE_Y` 做 DPR 缩放，新增 `px()` 辅助函数将像素值转为 Phaser font size 字符串；`boot-scene.ts` 所有贴图生成尺寸改用 DPR；`rhythm-scene.ts`、`classroom-scene.ts`、`dialogue-scene.ts`、`ending-scene.ts` 的所有硬编码像素值（轨道坐标、文字位置、判定线等）改用 `Math.round(n * DPR)` / `px()`；背景图加 `.setDisplaySize(width, height)` 铺满画布。
- **2026-05-23** — 以 MIDI 文件替换硬编码谱面：删除 `src/contents/data/charts.ts`；新增 `src/contents/assets/midi/`（`1.mid` / `2.mid` / `3.mid` 对应三个小孩，`ensemble.mid` 合奏关）；新增 `src/contents/composables/useCharts.ts`，包含浏览器端 MIDI 解析器（支持 Running Status / VLQ / meta 事件）、单声部映射（音高排名→轨道）、合奏双声部分离（largest-gap voice splitting，左手→轨道 0/1、右手→轨道 2/3）；`kids.ts` 的 `chartId` 字段改为 `midiFile`（Vite `?url` 导入）+ `waveform`；`game.vue` 启动时调用 `useCharts().loadAllCharts(KIDS)` 预加载。
- **2026-05-23** — 暂停系统重构：`rhythm-scene.ts` 改用 `manuallyPaused` + `pausedSongTime` 实现逻辑暂停（取代 `scene.pause/resume`），恢复时播放 3-2-1 倒计时并修正 `startTime` 偏移；新增 `EVENT_KEYS.GAME_RETURN_CLASSROOM` 事件及对应 handler，直接跳转至教室场景；`game.vue` 暂停弹窗新增"返回教室"按钮。
- **2026-05-23** — 音符判定与场景 API 小修：`RhythmScene.onKeyDown` 改为取判定窗口内时间差最小的音符（避免多音符重叠时误判首个）；`getBossWaveform` 重命名为 `getWaveform(chart, now)`，参数从 `(waveform, now, duration)` 改为 `(ChartData, now)`；`RhythmSceneInitData.chartId` → `chartKey`（字符串 key 而非 `CHARTS` 索引类型）；`BossScene` 同步更新，boss 谱面 key 由 `'boss'` 改为 `'ensemble'`。
- **2026-05-23** — HUD 简化与暂停弹窗 UI 升级：`game.vue` HUD 折叠为右上角单列（移除左侧进度显示）；暂停弹窗改为 `rounded-2xl` + 边框 + 阴影 + `min-w-[260px]`；新增 `.game-page__classroom-btn` 样式。
- **2026-05-23** — 新增 Python 工具脚本 `tools/parse-midi.py` / `tools/inspect-midi.py`，用于离线检查 MIDI 文件结构和音符分布。
- **2026-05-22** — 初始化项目文档体系：新增 `AGENTS.md`（多智能体协作协议 + 代码库状态注册表）、`CHANGELOG.md`、`DECISION_LOG.md`、`WIP.md`；新增 `docs/onboarding/`（中英双语入门指南）、`docs/readme/`（中英 README）、`docs/roadmap/`、`docs/vibe/`（引擎结构、游戏 Demo、游戏设计 spec 等深度文档）。
- **2026-05-22** — 首次提交游戏源码与资源：搭建完整游戏场景体系（`BootScene` / `ClassroomScene` / `DialogueScene` / `RhythmScene` / `BossScene` / `EndingScene`）；建立 `engine/`（GameShell / EventBus）、`runtime/`、`contents/`（常量 / 数据 / 场景 / 音频 / 资源）三层架构；新增 `game.vue`（Vue HUD + Phaser 挂载）、`about-us.vue`、`home-page.vue`、`how-to-play.vue` 等页面；静态谱面数据（`charts.ts`）与角色数据（`kids.ts`）；公共资源（classroom 背景图、logo、favicon）。
- **2026-05-22** — 初始化构建配置：`package.json`（Vite + Vue 3 + Phaser + TypeScript + Tailwind CSS v4）、`vite.config.ts`（`@/` 路径别名）、`tsconfig` 三件套、`pnpm-lock.yaml`。
- **2026-05-22** — 初始化仓库：`.gitignore`（Node / Vite / Vue 标准忽略规则）。
