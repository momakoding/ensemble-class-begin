# AGENTS.md

Project conventions **and shared codebase state** for AI coding agents working on
`momakoding-jam-starter-web` — a Vue 3 + Phaser 4 + TypeScript Game Jam starter.

> **Multi-agent source of truth.** Sections 1–12 are the *rules*. Section **13 (Codebase State)** is the *living map* of everything that currently exists in `src/`. Any agent that adds, moves, renames, or deletes code **must** update §13 in the same turn, and append one line to §14 (Change Log). Stale registries silently break collaboration; outdated entries are worse than none.

---

## 0. Multi-agent collaboration protocol

### The contract

1. **Before coding**, skim §1–§12 once per session, then read the §13 subsection(s) relevant to your task.
2. **While coding**, treat §13 tables as the authoritative list. If you need a new scene key / event / asset key / route / store, register it in §13 **before** wiring it up so other agents don't collide.
3. **After coding**, do all of:
   - Update the affected §13 table(s).
   - Bump `Last updated` in each touched subsection to today's date.
   - Append a single-line entry to §14 (Change Log) with date, area, summary.
   - If you introduced a non-obvious trade-off (physics engine swap, asset pipeline change, etc.), add a row to §13.10 (Decision Log). Never silently re-decide past choices.

### Conflict-avoidance rules

- **Namespaces are unique.** Scene keys, event keys, asset keys, and route paths must be unique globally. Check §13.3 / §13.5 / §13.6 / §13.2 before adding.
- **One owner per feature.** When you start a multi-turn feature, add a `WIP` row to §13.9 with owner = your session id / agent name / date. When done, remove or mark `DONE`.
- **No silent deletes.** If you delete code, move the registry row to a `~~strikethrough~~` line at the end of the table rather than removing it, so reviewers see history.
- **No duplication of source-of-truth values.** Registries point to files; actual values (magic numbers, event names) live in TypeScript `as const` objects. If you find a mismatch, the code wins and §13 must be corrected.
- **Atomic updates.** One feature → one coherent §13 + §14 edit. Don't batch unrelated refactors into the same doc patch.

### Read-before-write checklist (copy into your plan)

- [ ] Read §13.1 (directory map) to locate the right folder.
- [ ] Read the registry table(s) for the layer I'm touching (scenes? events? assets?).
- [ ] Confirm my new keys don't already exist.
- [ ] Confirm nothing in §13.9 (WIP) is already claiming this area.

---

## 1. Role & Context

You are an smart AI developer proficient in **Phaser 4**, **Vue 3 (Composition API)**, and **TypeScript**. Refer to the Phaser.js skill when needed. The mission is rapid prototyping for a Game Jam ("Vibe Coding"): prioritize **development velocity and instant feedback** while keeping code readable and type-safe.

The current `src/pages/game-demo/` is a **reference implementation** (platformer with stars) intentionally kept small and well-commented. It **will be deleted and replaced** by the actual game once the jam starts. Use it as a pattern library; do not treat its gameplay as permanent.

---

## 2. Tech Stack (hard constraints)

| Layer | Choice | Notes |
|---|---|---|
| UI framework | Vue 3 SFC, `<script setup lang="ts">` | No Options API |
| Game engine | Phaser **4** (Arcade physics by default) | `phaser@^4.0.0` in `package.json` |
| Language | Strict TypeScript | `any` is forbidden |
| Bundler | Vite 8 | `@` alias → `./src` (see `vite.config.ts`) |
| Styling | Tailwind CSS **v4** (`@tailwindcss/vite`) + `tw-animate-css` | Atomic-first; see §10 |
| Routing | `vue-router@4` with `createWebHashHistory` | Routes in `src/router/index.ts` |
| State | `ref` / `reactive` for UI; Pinia (+ persisted-state plugin) for cross-page state; Phaser `Registry` or EventBus for Game ↔ UI | See §13.8 |
| Icons | `lucide-vue-next` | Already installed |
| Utilities | `@vueuse/core`, `tailwind-merge`, `animate.css` | Already installed |

**Do not add new top-level dependencies without appending a §13.10 decision log row.**

---

## 3. Architecture overview

```
┌──────────────── Vue SPA (router + HUD) ────────────────┐
│  Pages: home, how-to-play, about-us, game              │
│                                                        │
│  /game ─► game.vue   (pause overlay / ESC / exit)      │
│           └─ <GameHost/>   (mounts Phaser.Game)        │
│                └─ Phaser.Game                          │
│                    ├─ BootScene   (load assets)        │
│                    └─ GameScene   (actual gameplay)    │
└────────────────────────────────────────────────────────┘
           ▲                                    │
           └──────── eventBus (emit/on) ────────┘
```

- **Vue owns**: routing, menus, HUDs, overlays (pause, game-over, settings), DOM events outside the canvas.
- **Phaser owns**: render loop, physics, collisions, keyboard/gamepad input for gameplay, timers inside a scene, scene transitions.
- **EventBus** (`src/pages/game-demo/event-bus.ts` → will move to `src/core/event-bus.ts` once the real game lands; see §13.10) is the *only* channel between the two worlds.

---

## 4. Phaser + TS integration rules

- Scenes are **classes** extending `Phaser.Scene`, one class per file, filename `kebab-case`.
- Every scene member is **typed**. Use `!` (definite assignment) only for fields initialized in `create()`.
- Every scene with non-trivial init data defines an interface: `init(data: ISceneData): void`.
- Every scene ships with a `private debug = false` flag that, when true, calls `this.physics.world.createDebugGraphic()` and/or logs state.
- Lifecycle hygiene:
  - Register EventBus listeners in `create()`.
  - Unregister them in a `this.events.on('shutdown', …)` handler.
  - Never rely on garbage collection to detach listeners.
- Prefer **Arcade physics** unless a feature genuinely needs Matter; swapping engines mid-project requires a §13.10 decision log entry.
- Use `Phaser.Types.Physics.Arcade.ArcadePhysicsCallback` for collider/overlap handlers to keep them typed.

---

## 5. Vibe-coding execution strategy

- **Iterate on feel, not on architecture.** When the human says "make the jump lighter", tweak `GRAVITY` / `PLAYER_JUMP` in `constants.ts` — don't refactor (unless they say so).
- **Function composition over deep class hierarchies** for game entities. Small helpers in `src/core/` are preferred to a `BaseEntity` abstract class.
- **Placeholder graphics are a feature, not a stopgap.** If art is missing, use `Phaser.GameObjects.Graphics.generateTexture()` (see `boot-scene.ts`). Ship logic first.
- **Debuggable by default.** Every new scene exposes the `debug` flag. Every new entity logs its key state when `debug` is on.
- **Ship runnable modules.** Prefer one working slice end-to-end over multiple half-wired subsystems.

---

## 6. Code standards

- **Strict UI separation.** Vue components render HUD / menus / overlays **only**. No gameplay decisions inside `.vue`.
- **EventBus is canonical.** All Vue ↔ Phaser messaging goes through the singleton. Raw `window` events are forbidden for game state.
- **Asset keys are constants.** String literals for textures / audio / scenes must not appear outside the `as const` objects in `constants.ts`.
- **Loop hygiene.** Avoid heavy logic in `Scene.update()`. Delegate to each entity's own `update(time, delta)` method and iterate a group.
- **Object pools** for anything spawned repeatedly (bullets, particles, enemies waves). Reuse via `group.get()` / `setActive(false).setVisible(false)`.
- **Typed events.** When an EventBus payload becomes non-trivial, add a type to §13.7 and use it at both ends.
- **No `var`.** Always `const`, `let` only when reassignment is real.

---

## 7. Forbidden

- `var`.
- `any`. Use `unknown` + narrowing, or define a real type.
- Direct DOM manipulation outside the Vue / Phaser boundary.
- Creating or destroying Phaser objects inside tight loops without an object pool.
- Dumping long low-level implementation details unless the human explicitly asks — ship a runnable module first.
- **Running the project yourself after finishing a task — the user runs it.** (Exception: the user may explicitly ask you to start the dev server; when they do, run it in the background so the tool call doesn't block.)
- Adding new dependencies without a §13.10 decision entry.
- Silent renames of exported symbols, scene keys, event keys, asset keys, or routes.

---

## 8. Interaction protocol

- Before adding a feature, check whether it conflicts with the currently active physics engine (Arcade vs Matter) and with anything listed in §13.9 (WIP).
- When the human describes a **feel / vibe** (e.g. "jump feels floaty", "feel more desperate"), translate it directly into tunable numbers — gravity, velocity, damping, easing curve, camera lerp, screen-shake amplitude — don't over-engineer.
- When asked to research or explain, do not edit code.
- When asked to implement, follow the Read-before-write checklist in §0.

### Skills (domain knowledge documents)

`.skills/` contains reusable domain knowledge and operational guides. Agents do **not** auto-load these files — read them **on demand** based on task context.

| Trigger | Skill file | Description |
|---|---|---|
| Phaser development (scenes, physics, rendering, animations, migration) | `.skills/phaser-js/SKILL.md` | Phaser 4 developer guide + API quick-ref; `references/` subdirectory has API reference, game patterns, and v3→v4 migration |
| Editing game metadata (title, subtitle, tags, team info, OSS credits) | `.skills/scaffold/edit-game-meta.md` | Step-by-step guide for editing only `game-meta.ts` / `team.ts` |
| User describes a game idea and wants a spec written | `docs/vibe/spec-game.md` | **User's game spec.** Agents auto-generate / update this file based on the user's game idea. See §13.1 `docs/vibe/` for details |

**Rules:**

- When adding a new skill, create the file under `.skills/<domain>/` and register a trigger row in this table.
- Skill files may include YAML frontmatter (`name` / `description`) for future tooling, but agents currently discover skills only through this table.
- A task may match multiple skills — read all matching ones before writing code.

---

## 9. Naming

- **Files**: `kebab-case` (e.g. `player-entity.ts`, `game-hud.vue`).
- **Component references** in `<template>` / `<script>`: `PascalCase` (e.g. `import GameHud from './game-hud.vue'` → `<GameHud />`).
- **Scene classes**: `PascalCase` + `Scene` suffix (e.g. `GameScene`, `BootScene`, `GameOverScene`).
- **Scene keys**: `PascalCase` string matching the class name (`'GameScene'`).
- **Event keys**: `snake:colon` (e.g. `'score:update'`, `'player:died'`) — namespace:verb.
- **Asset keys**: `kebab-case` noun (e.g. `'player'`, `'enemy-goblin'`, `'bgm-level-1'`).
- **Routes**: `kebab-case` (`/how-to-play`).
- **Constants**: `UPPER_SNAKE_CASE` inside `as const` objects.

---

## 10. CSS (Tailwind CSS v4)

### Atomic-first

- Write utilities directly in templates.
- Reach for `@apply` inside `<style scoped>` only when the **same** complex combination repeats across multiple elements within the same component. Avoid premature abstraction.
- In scoped blocks that use `@apply`, start with `@reference "@/style.css";` so v4 can resolve theme tokens. See `App.vue` and `components/game-button.vue`.

### Theme tokens

- Shared colors and tokens live in `src/style.css` under `@theme { … }` (v4 idiom). Current tokens:
  - **Backgrounds**: `--color-bg-page` (slate-900), `--color-bg-surface` (slate-800), `--color-bg-overlay` (gray-900)
  - **Accent**: `--color-accent` (amber-500), `--color-accent-light` (amber-400), `--color-accent-dim` (amber-600)
  - **Text**: `--color-text-primary` (slate-100), `--color-text-secondary` (slate-400), `--color-text-muted` (slate-500)
  - **Borders**: `--color-border-subtle` (slate-700), `--color-game-border` (slate-600, legacy)
  - **Functional**: `--color-danger` (red-600), `--color-danger-light` (red-500), `--color-success` (green-600), `--color-success-light` (green-500)
  - **Overlay / Glass**: `--color-overlay-scrim` (black), `--color-glass` (white)
  - **Text (extreme)**: `--color-text-dark` (slate-900), `--color-text-bright` (white)
  - **Scrollbar**: `--color-scrollbar-thumb` (slate-700, legacy)
- Component-level color roles (player, enemy, danger) should be added to `@theme` when reused across ≥ 2 components.

### Custom classes

- Custom class names follow **BEM** (`game-button`, `game-button--primary`, `game-button--secondary`).
- Declare reusable custom utilities with `@utility` in `style.css` before `@apply`-ing them elsewhere (v4 rule).

---

## 11. Component organization

The project is split into four non-overlapping layers. **Import direction is one-way: `pages → runtime/contents → engine`.**

The layering criterion is **"could another Phaser jam game reuse this?"**, not "does it import Phaser?". Both `engine/` and `contents/` may import Phaser — they differ in abstraction level.

- `src/engine/` — **Engine layer.** UI-agnostic, **game-agnostic** thin wrappers around Phaser (`GameShell`, `GameEventBus`, `SHELL_DEFAULTS`, `EventCallback`). Unchanged when swapping games. **Must not import any other project module.**
- `src/contents/` — **Game content layer.** UI-agnostic, **Phaser-coupled** (scenes extend `Phaser.Scene`, use physics/input) but decoupled from Vue/DOM. Contains the game world: `constants.ts` (scene/event keys, tuning values), `types.ts`, `scenes/`, and future `entities/`, `systems/`, `data/`. The project's **sole** source of SCENE_KEYS / EVENT_KEYS / GAME_CONFIG.
- `src/runtime/` — **Runtime glue layer.** Module-level singletons on the Vue side (`useGame()` / `useEventBus()`) that wrap engine class instances into app-lifetime global services. Holds no game data.
- `src/composables/` — **True Vue composables.** `useXxx()` functions that return `Ref` / `Reactive` or depend on component lifecycle. Singleton services that are not lifecycle-bound belong in `runtime/`.
- `src/components/` — Globally reusable UI primitives (buttons, tags, panels, HUD widgets).
- `src/pages/` — Route-level components. When a page grows complex, split its sub-modules into a same-name subdirectory (`pages/game-demo/` is the current example).
- All `props` typed with TypeScript; all events typed with `defineEmits<...>()`.

**Forbidden import directions:**

- `engine/` must not import `contents/`, `runtime/`, or `pages/`.
- `contents/` must not import `pages/` (but may import `engine/` and `runtime/`).
- A reverse dependency means the layering is wrong.

**`runtime/` → `contents/` must use deep imports.** Runtime files must write `import ... from "@/contents/constants"` / `"@/contents/types"` — **never import from the `@/contents` barrel export**. Reason: `contents/scenes/*` files have top-level side effects (`const eventBus = useEventBus()` / `const game = useGame()`); importing via the barrel pulls scenes in transitively, and since scenes import `@/runtime` back, this triggers a circular module initialization where `useGame()` is called before runtime has finished initializing. See `src/runtime/game.ts` for the current pattern.

---

## 12. Tailwind v4 gotchas (quick reference)

1. **Opacity syntax changed.** `bg-opacity-*` / `text-opacity-*` are gone. Use `bg-white/50`, `text-gray-500/80`, or generic `opacity-*`.
2. **`@reference` + `@` alias.** Ensure `vite.config.ts` defines the `@` alias (already configured). Inside scoped styles that `@apply` project utilities, add `@reference "@/style.css";` at the top.
3. **`@apply` on custom classes.** Declare the class with `@utility` in `style.css` first.
4. **`tailwindcss-animate`** is not installed; `tw-animate-css` (already imported in `style.css`) covers most animation needs. If you need `animate-in` / `fade-in` v4-style classes, add `@plugin "tailwindcss-animate";` to `style.css` and install the package (document it in §13.10).
5. **`@tailwindcss/typography`** (`prose` classes) is not installed. Add it the same way if needed.
6. **Long words / i18n** (only if the game ships multiple languages): prefer `flex-wrap`, `min-w-0`, `break-words`; use `truncate` only when a single line is truly required.

Full troubleshooting catalog: `.clinerules/02-trouble-shoot.md`.

---

# 13. Codebase State (living registry)

> Update discipline: every row below must point to a real file/symbol in `src/`. If you rename or delete it, update the row *in the same turn*. Do not remove rows — mark them `~~deprecated~~` at the bottom of the table.

**Current scaffold status:** *Reference demo in place, real game not yet started.*
**Scaffold last updated:** 2026-04-28;15:00

---

## 13.1 Directory map

Just `grep` by agent itself.

`composables/` is currently an empty stub. New `useXxx()` hooks (returning `Ref` or depending on component lifecycle) go here; app-lifetime singleton services go in `runtime/`.

### `src/contents/game-info/` — Player-facing content entry point

This is the **single source of truth** for all player-visible placeholder content. All page components read from here — never hard-code game title, team name, or gameplay copy in `.vue` files.

| File | Export | Purpose |
|---|---|---|
| `game-meta.ts` | `GAME_META` (`GameMeta`) | Game title, subtitle, description, tags, OSS credits; read by home page and about page |
| `how-to-play.md` | (raw Markdown) | Gameplay instructions; rendered by `/how-to-play` page |
| `team.ts` | `TEAM_INFO` (`TeamInfo`) | Team name, member list, project description; read by `/about-us` page |
| `index.ts` | barrel export | Re-exports all of the above |

**Edit rules:**

- Change game title / subtitle → edit only `game-meta.ts`.
- Change gameplay instructions → edit only `how-to-play.md` (supports Markdown + minimal inline HTML).
- Change team info → edit only `team.ts`.
- Never hard-code game title, team name, or gameplay copy strings in `pages/` components.

### `docs/vibe/` — Design documents and game spec

| File | Purpose |
|---|---|
| `spec-framework.md` | UI/engineering framework spec (architecture, pages, routes, conventions) |
| `spec-game.md` | **User's game spec.** When the user describes a game idea, agents auto-generate / update this file. This is the single source of truth for the game's design: mechanics, entities, win/lose conditions, level progression, etc. |
| `engine-structure.md` | Four-layer architecture walkthrough + vibe coding handbook |
| `game-demo.md` | Demo walkthrough (platformer + stars reference implementation) |
| `phaser-study.md` | Phaser × Vue integration research notes |

**`spec-game.md` workflow:**

1. User describes a game idea (in chat, in any language).
2. Agent reads `docs/vibe/spec-game.md`, then **overwrites** it with a structured spec derived from the user's description.
3. The spec should cover: core mechanic, player actions, entities, win/lose conditions, scoring, difficulty curve, and any art/audio direction.
4. On subsequent iterations the agent **updates** the existing spec rather than rewriting from scratch, preserving sections the user has already approved.
5. Implementation work references this spec as the design source of truth.

---

## 13.2 Routes

*Last updated: 2026-04-25;00:01. Source of truth: `src/router/index.ts`.*

| Path | Name | Component | Purpose |
|---|---|---|---|
| `/` | `home` | `pages/home-page.vue` | Title + menu |
| `/how-to-play` | `how-to-play` | `pages/how-to-play.vue` | Instructions |
| `/about-us` | `about-us` | `pages/about-us.vue` | Credits |
| `/game` | `game` | `pages/game.vue` | Game host (mounts Phaser via `game-demo/index.vue`) |

History mode: **hash** (`createWebHashHistory`).

---

## 13.3 Phaser scenes

*Last updated: 2026-04-26;01:20. Source of truth: `src/contents/scenes/` and `src/contents/constants.ts` → `SCENE_KEYS`.*

| Key (string) | Class | File | Role | Init data |
|---|---|---|---|---|
| `BootScene` | `BootScene` | `src/contents/scenes/boot-scene.ts` | Generate placeholder textures + progress bar → `game.switchToScene(GameScene)` | none |
| `GameScene` | `GameScene` | `src/contents/scenes/game-scene.ts` | Platformer + star collection demo | `IGameSceneData = { startScore?: number }` |

Scene loading order is in `src/pages/game-demo/index.vue` → `useGame().initGame(container, BootScene)` + `addScene(GameScene)`.

---

## 13.4 Game entities

*Last updated: 2026-04-25;00:03. Source of truth: `src/pages/game-demo/scenes/game-scene.ts`.*

| Entity | Type | Texture key | Defined in | Notes |
|---|---|---|---|---|
| Player | `Phaser.Physics.Arcade.Sprite` | `player` | `GameScene.create()` | World-bounded, gravity on body (`GRAVITY`), speed `PLAYER_SPEED`, jump `PLAYER_JUMP` |
| Platforms | `Phaser.Physics.Arcade.StaticGroup` | `platform` | `GameScene.create()` | One ground spanning the level + 4 floating platforms |
| Stars | `Phaser.Physics.Arcade.Group` | `star` | `GameScene.spawnStars()` | `STAR_COUNT` per wave, `setBounceY(0.2..0.5)`, respawn after `STAR_RESPAWN_DELAY` when all collected |

Collisions wired: `player ↔ platforms`, `stars ↔ platforms`, `player ↔ stars` (overlap → `collectStar`).

---

## 13.5 EventBus events

*Last updated: 2026-04-25;00:03. Source of truth: `src/pages/game-demo/constants.ts` → `EVENT_KEYS`. Bus implementation: `src/pages/game-demo/event-bus.ts`.*

| Key constant | String | Direction | Payload | Emitted by | Listened by |
|---|---|---|---|---|---|
| `SCORE_UPDATE` | `score:update` | Phaser → Vue | `number` (total score) | `GameScene.collectStar`, `GameScene.create` | `pages/game-demo/index.vue` |
| `GAME_OVER` | `game:over` | Phaser → Vue | *(unused yet)* | — | — |
| `GAME_RESTART` | `game:restart` | Vue → Phaser | *(none)* | `pages/game-demo/index.vue` `restartGame` | `GameScene.handleRestart` |
| `GAME_PAUSE` | `game:pause` | Vue → Phaser | *(none)* | `pages/game.vue` `pauseGame` | `GameScene.handlePause` |
| `GAME_RESUME` | `game:resume` | Vue → Phaser | *(none)* | `pages/game.vue` `resumeGame` | `GameScene.handleResume` |

**Rule:** new events are added to `EVENT_KEYS` first, then to the table above, then wired.

---

## 13.6 Asset keys

*Last updated: 2026-04-25;00:01. Source of truth: `src/pages/game-demo/scenes/boot-scene.ts`.*

All current textures are generated at runtime via `generateTexture` (no files in `public/`). When real art lands, move the loader calls into `BootScene.preload()`, keep the same keys, and drop the generator code.

| Key | Kind | Size | Generated at | Used by |
|---|---|---|---|---|
| `player` | texture (rect) | 32×48, fill `#4488ff` | `BootScene.create` | `GameScene` player sprite |
| `star` | texture (circle) | 16×16, fill `#ffdd00` | `BootScene.create` | `GameScene` stars group |
| `platform` | texture (rect) | 64×16, fill `#44aa44` | `BootScene.create` | `GameScene` platforms group |

No audio keys yet. When added, create a separate `ASSET_KEYS.AUDIO` table.

---

## 13.7 Shared TypeScript types / interfaces

*Last updated: 2026-04-29;18:52.*

| Symbol | Defined in | Used by | Purpose |
|---|---|---|---|
| `IGameSceneData` | `src/contents/scenes/game-scene.ts` | `GameScene.init` | Scene startup params (`startScore?`) |
| `Props` (game-button) | `src/components/game-button.vue` | `<GameButton>` usage | `{ label, variant?: 'primary' \| 'secondary' }` |
| `MmkdStarterCredit` (no props) | `src/components/mmkd-starter-credit.vue` | `pages/about-us.vue` | Displays scaffold logo, link, and tech-stack badges |
| `GameMeta` | `src/contents/game-info/types.ts` | `pages/home-page.vue`, `pages/about-us.vue` | `{ title, subtitle?, description?, tags?, showGameCard, ossCredits?: OssCredit[] }` |
| `OssCredit` | `src/contents/game-info/types.ts` | `GameMeta.ossCredits` | `{ name, desc, url? }` |
| `TeamInfo` | `src/contents/game-info/types.ts` | `pages/about-us.vue` | `{ teamName, description, members: TeamMember[] }` |
| `TeamMember` | `src/contents/game-info/types.ts` | `TeamInfo.members` | `{ name, role, avatar?, introId? }` |

When an EventBus payload becomes non-trivial (e.g. `GAME_OVER` carrying final score + cause), define a named type here and import it at both ends.

---

## 13.8 State stores

*Last updated: 2026-04-25;00:01.*

- **Pinia**: installed and mounted (`src/main.ts`), persisted-state plugin enabled. **No stores defined yet.** When you add one, create `src/stores/<name>-store.ts` and register it here.
- **Phaser Registry**: unused so far. If a value must survive scene restarts (e.g. high score), prefer the Registry over module-level singletons.
- **Vue reactive**: in-component `ref` / `reactive` only (no shared reactive singletons outside Pinia).

| Store / key | Location | Kind | Persisted? | Purpose |
|---|---|---|---|---|
| *(none)* | — | — | — | — |

---

## 13.9 Work in progress (WIP)

> Moved to [`WIP.md`](./WIP.md). **Always append new WIP contents there, especially for game idea users**, not here.

---

## 13.10 Decision log

> Moved to [`DECISION_LOG.md`](./DECISION_LOG.md). **Always append new decisions there**, not here.

---

## 14. Change log

> Moved to [`CHANGELOG.md`](./CHANGELOG.md). **Always append new entries there**, not here.
