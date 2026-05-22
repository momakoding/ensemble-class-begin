# Momakoding Game Jam Starter

## Quick Navigation

|  | 中文 | English |
|---|---|---|
| 🎮 **有创意 / Game idea** | [上手指南](../onboarding/onboarding.zh.md) | [Onboarding Guide](../onboarding/onboarding.en.md) |
| 👩‍💻 **开发者 / Developer** | [开发者文档](./README.zh.md) | You're here |
| 🤖 **AGENTS.md** | [AGENTS.md](../../AGENTS.md) | [AGENTS.md](../../AGENTS.md) |

---

A Game Jam rapid-prototype scaffold built on **Vue 3 + Phaser 4 + TypeScript**. Ships with a title menu, a playable demo, pause/resume/exit logic, and a layered architecture designed to keep AI-assisted development from going off the rails.

---

## Tech Stack

| Layer | Choice |
|---|---|
| UI Framework | Vue 3 SFC, `<script setup lang="ts">` |
| Game Engine | Phaser 4, Arcade physics (default) |
| Language | TypeScript strict mode, `any` forbidden |
| Bundler | Vite 8, `@` alias → `./src` |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| Routing | vue-router 4, Hash History |
| State | Pinia + persisted-state (reserved, no stores yet) |
| Icons | lucide-vue-next |
| Utilities | @vueuse/core, tailwind-merge, animate.css |

---

## Getting Started

```bash
pnpm install
pnpm dev      # http://localhost:5173/
pnpm build    # output to dist/
```

---

## Project Structure

```
src/
├── main.ts                  # App entry: Pinia + Router
├── App.vue                  # Root component <RouterView/>
├── style.css                # Tailwind v4 entry + @theme tokens
│
├── engine/                  # ① Engine layer: UI-agnostic, game-agnostic Phaser wrapper
│   ├── game-shell/          #   GameShell (Phaser.Game lifecycle)
│   ├── event-bus/           #   GameEventBus (Map+Set pub/sub)
│   └── types.ts             #   EventCallback and other engine-level types
│
├── contents/                # ② Game content layer: single source of truth for scenes/constants/types
│   ├── constants.ts         #   ★ SCENE_KEYS / EVENT_KEYS / GAME_CONFIG
│   ├── types.ts             #   IGameSceneData etc.
│   └── scenes/              #   BootScene / GameScene / ...
│
├── runtime/                 # ③ Runtime glue layer: Vue-side module-level singletons
│   ├── game.ts              #   useGame() (wraps GameShell)
│   └── event-bus.ts         #   useEventBus() (wraps GameEventBus)
│
├── composables/             # ④ True Vue composables (return Ref / depend on component lifecycle)
│
├── components/
│   └── game-button.vue      # BEM-styled button, primary / secondary variants
│
├── pages/
│   ├── home-page.vue        # Title menu
│   ├── how-to-play.vue      # Instructions
│   ├── about-us.vue         # Credits
│   ├── game.vue             # Game host (pause overlay / ESC / exit)
│   └── game-demo/
│       └── index.vue        # ⭐ Reference: how to mount a Phaser game from Vue
│
└── router/
    └── index.ts             # Hash History route table
```

### Four-layer dependency direction (one-way, non-reversible)

```
pages → runtime → engine
pages → contents
contents → engine
```

- `engine/` must not import any project-internal module.
- `runtime/` references `contents/` via deep paths only (`@/contents/constants`). Barrel imports are forbidden (prevents ESM circular init).
- `contents/` must not import `pages/`.

Full architecture walkthrough: [`vibe/engine-structure.md`](../vibe/engine-structure.md).

---

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | `home-page.vue` | Title menu |
| `/how-to-play` | `how-to-play.vue` | Instructions |
| `/about-us` | `about-us.vue` | Credits |
| `/game` | `game.vue` | Game page |

History mode: **Hash** (`createWebHashHistory`) — works on static hosting with no server config.

---

## Demo Game

Visit `/#/game` for the platformer star-collection demo.

| Input | Action |
|---|---|
| ← → | Move |
| ↑ | Jump (ground only) |
| ESC | Pause / Resume |

All textures are generated at runtime via `generateTexture` in `BootScene` — zero external assets required.

---

## Customization Checklist (do this first)

The scaffold concentrates all player-visible placeholder content in a handful of files. Before you start building your actual game, work through this list so the title screen, instructions page, credits page, and color scheme no longer show placeholder text:

| What to change | File | Affects |
|---|---|---|
| Game title & subtitle | `src/contents/game-info/game-meta.ts` | Home page title |
| How-to-play body copy | `src/contents/game-info/how-to-play.md` | `/how-to-play` page — Markdown + inline HTML |
| Team name, members, project blurb | `src/contents/game-info/team.ts` | `/about-us` page |
| Global theme colors | `@theme { … }` in `src/style.css` | Buttons, panels, text, borders — all Tailwind tokens |

> If you see `[Text Here]`, `[Team Name]`, or `[Member A]` anywhere in the running app, that section hasn't been personalized yet. You can tell the AI: "Replace the placeholder content in `game-info` with my game's details, and change the theme to a neon-cyberpunk palette."

When updating colors, edit the existing tokens in `@theme` (e.g. `--color-accent`, `--color-bg-page`, `--color-text-primary`) rather than hardcoding colors in individual Vue files. That way a full theme swap is a single-file edit.

---

## Development Conventions

- **New scene**: extend `Phaser.Scene`, take the key from `SCENE_KEYS`, clean up listeners in `shutdown`.
- **New event**: add to `EVENT_KEYS` first, then wire `on` / `emit` at both ends, then update `AGENTS.md §13.5`.
- **New asset**: register the key in `AGENTS.md §13.6`; use `generateTexture` as placeholder, real assets go in `public/assets/`.
- **Tuning values**: only touch `GAME_CONFIG` in `contents/constants.ts` — don't refactor scene code.
- **Display copy**: always edit `contents/game-info/` — never scatter game title, team name, or instructions across page components.
- **Theme reskin**: edit `@theme` tokens in `src/style.css` — avoid one-off color values scattered across files.
- **Vue ↔ Phaser communication**: EventBus only. Never reach into Phaser objects from Vue.

Multi-agent collaboration protocol: [`AGENTS.md`](../../AGENTS.md).

---

## Documentation Index

| File | Contents |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | Multi-agent protocol + live registry (scenes / events / assets / routes) |
| [`vibe/spec-game.md`](../vibe/spec-game.md) | Game design spec (auto-generated / updated by AI from user's game idea) |
| [`vibe/engine-structure.md`](../vibe/engine-structure.md) | Four-layer architecture + Vibe coding handbook |
| [`vibe/game-demo.md`](../vibe/game-demo.md) | Demo walkthrough |
| [`vibe/phaser-study.md`](../vibe/phaser-study.md) | Phaser × Vue integration research notes |
| [`onboarding.zh.md`](../onboarding/onboarding.zh.md) | Non-technical onboarding guide (Chinese) |
| [`onboarding.en.md`](../onboarding/onboarding.en.md) | Non-technical onboarding guide (English) |
