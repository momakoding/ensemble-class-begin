# Turn Your Game Idea Into Something Playable Using Our Starter

> This guide is for **non-programmers** — product managers, designers, writers, and anyone who has a game idea but has never written a line of code.

## Quick Navigation

|  | 中文 | English |
|---|---|---|
| 🎮 **有创意 / Game idea** | [上手指南](./onboarding.zh.md) | You're here |
| 👩‍💻 **开发者 / Developer** | [开发者文档](../readme/README.zh.md) | [Developer Docs](../readme/README.en.md) |
| 🤖 **AGENTS.md** | [AGENTS.md](../../AGENTS.md) | [AGENTS.md](../../AGENTS.md) |

---

## What is this?

Think of it as a **blank PowerPoint template for browser games**.

A good template already has the layout, colors, and placeholder boxes set up — you just fill in your content. This project does the same thing, except instead of slides, you're filling in **gameplay**: how to jump, how to score, how to win, how to lose.

Out of the box you get:

- A **title menu** (Start Game, How to Play, About)
- A **working demo game** (a little character jumping around collecting stars)
- **Pause / Resume / Exit** logic already wired up
- Runs **without any art assets** — the engine draws colored rectangles as placeholders
- Plays in any browser, and can be packaged and shared with anyone

In other words, the moment you clone this repo, you already have **a game that runs**. Your job is to **turn it into your game**.

---

## What kind of games is this good for?

Good fit:

- **2D** side-scrollers, top-down games, or single-screen games (platformers, dodge games, collectors, brick-breakers, puzzle games…)
- **Short sessions** — a few minutes per run — perfect for Game Jams, class projects, product demos, portfolio pieces
- **Browser-based** games (works on mobile browsers too)
- Rapid prototypes to answer "**is this idea actually fun?**"

Not a great fit:

- 3D games (that's Unity / Unreal territory)
- Multiplayer games with real-time servers
- Commercial-grade titles with polished production values

One-liner: **"a game one person can finish in a week"** — that's exactly what this scaffold is built for.

---

## Why would a product manager care?

Because it compresses the path from **idea → something playable** to the shortest it's ever been.

The usual pain points:

1. "I have an idea but I can't code."
2. "Explaining it to a developer takes a week, and what comes back isn't what I imagined."
3. "Prototyping tools like Figma only let you click through screens — **you can't actually play it**, so stakeholders don't get it."

This project, paired with a modern **AI coding assistant** (Claude Code, Cursor, Kilo Code, etc.), lets you:

- **Describe what you want in plain English**, and let the AI write the code
- **Play the result immediately** in your browser — if it's not right, say "make the jump feel lighter" and play again
- **Never need to understand the code** — you just need to be able to **describe the experience**

That's literally a product manager's core skill: **articulating what "the right feel" means**.

---

## What does a real workflow look like?

Say your idea is: **"A chef dodging falling knives while catching ingredients to cook dishes."**

Traditional path:

```
You → Write a spec → Schedule a dev meeting → Dev estimates timeline
  → One week later: "Here's a demo" → You: "That's not the vibe" → Another week…
```

With this scaffold + an AI assistant:

```
Day 1, morning
  You: "Replace the square with a chef character, replace the stars
        with ingredients, add knives falling from the top — getting
        hit ends the game."
  AI: (writes the code)
  You: (refresh browser, play for 30 seconds)
       "Knives are too slow, double the speed. Make the ingredients red."
  AI: (updates the code)
  You: (play again) "Nice. Next: add a timer."

Day 1, afternoon
  You drop a link in Slack: "Check this out — is it fun?"
```

**You wrote zero code. You have a playable thing.**

This scaffold deliberately keeps the project structure, naming conventions, and tunable values **clean and consistent** so that AI edits are reliable and the game keeps running after each change.

---

## What do I need?

Ideally a computer and three free things.

### 1. Node.js (the runtime that powers web projects)

Download the **LTS version** from [nodejs.org](https://nodejs.org) and install it. Just click Next through the installer.

### 2. pnpm (the package manager)

After Node.js is installed, open a terminal (Windows: Command Prompt or PowerShell; Mac: Terminal) and paste:

```bash
npm install -g pnpm
```

Hit Enter and wait for it to finish.

### 3. An AI coding assistant

Pick one:

- **[Kilo Code](https://kilocode.ai/)** — what this project is actively developed with
- **[Cursor](https://cursor.sh/)** — an AI-native editor, smoothest onboarding
- **[Claude Code](https://claude.com/claude-code)** — chat with Claude directly in your terminal

All of these can **read this project's structure** and modify the code based on what you tell them.

---

## Three steps to get it running

Open a terminal, navigate to this project folder, and run:

```bash
# Step 1: install dependencies (only needed the first time)
pnpm install

# Step 2: start the dev server
pnpm dev
```

The terminal will print something like:

```
  ➜  Local:   http://localhost:5173/
```

Copy that URL into your browser. You'll see the game's title screen. Hit "Start Game" to play the demo — arrow keys to move, Up to jump, ESC to pause.

> To stop the server: go back to the terminal and press `Ctrl + C`.

To **build a shareable version**:

```bash
pnpm build
```

This creates a `dist/` folder. Upload that folder to any static host (GitHub Pages, Vercel, Netlify…) and anyone with the link can play.

---

## Before you start building: replace the placeholder content

Once the demo is running, you'll notice some **placeholder text** in the title screen, how-to-play page, and about page — things like `[Text Here]`, `[Team Name]`, and `[Member A]`. Those are yours to fill in.

Just tell the AI:

> "Replace the placeholder content in `game-info` with my game's details: the game is called XX, subtitle is XX, team name is XX, members are A, B, and C."

Or open the files yourself:

| What to change | File |
|---|---|
| Game title & subtitle | `src/contents/game-info/game-meta.ts` |
| How-to-play body copy | `src/contents/game-info/how-to-play.md` |
| Team name & members | `src/contents/game-info/team.ts` |
| Overall color theme | `@theme { … }` in `src/style.css` |

Refresh the browser after saving — the title screen will already look like your game.

---

## Record your game idea

Once you have an idea, just tell the AI what game you want to make. The AI will turn your description into a **game design spec** and save it at [`docs/vibe/spec-game.md`](../vibe/spec-game.md).

This spec is the "design blueprint" for your game, covering: core mechanic, player actions, entities (characters/enemies/items), win/lose conditions, scoring, difficulty curve, and more.

**How it works:**

1. Tell the AI: "I want to make a game where…" (describe it however you like, in any language)
2. The AI auto-generates `docs/vibe/spec-game.md`
3. When you want to change mechanics or add features later, the AI **updates** the existing spec instead of rewriting from scratch
4. All development work uses this spec as the source of truth, so your vision stays consistent through iterations

> 💡 You don't need to open or edit this file yourself. Just chat with the AI about your ideas and it will maintain the document for you.

---

## How do I tell the AI what to change?

One rule: **describe the feeling you want, not the code change**.

### Good prompts

- "The jump feels too heavy — I want it to feel **floaty and light**"
- "Replace the blue square with **a pixel-art cat**" (the AI will generate a placeholder or point you to assets)
- "Add a **60-second countdown** — when it hits zero, show Game Over"
- "Stars are too easy to collect — **cut the count from 10 to 5**, and make them flash before disappearing"
- "Change the background from black to a **gradient sunset**"
- "Add **background music** to the main menu using this file: bgm.mp3"

### Prompts to avoid

- "Change `GRAVITY` in `game-scene.ts` to 400" — unless you already know what you're doing, let the AI decide the right value
- "Refactor the state management" — not needed at Game Jam pace; **working > elegant**
- "Add a backend server for save data" — out of scope for a small browser game

### Useful vocabulary

| What you mean | How to say it to the AI |
|---|---|
| How movement/physics feels | "feel", "jump curve", "inertia", "weight" |
| Visual effects | "screen shake", "flash white", "particles", "color palette" |
| Rule changes | "add a mechanic", "change the win condition to…" |
| On-screen UI | "HUD" (the collective term for score, health bar, timer, etc.) |
| "Just change a number, don't touch the structure" | "only change the value, don't refactor" |

---

## Common mistakes to avoid

### 1. Asking for too much at once

**Don't say**: "Replace the character with a cat, add three enemy types, make three levels, add a shop, and build a leaderboard."

**Do say**: Start with the cat. Play it. Then add one enemy. Play it. Then add a level. Small steps, always playable — that's the Game Jam rhythm.

### 2. Not playing between changes

Every time the AI finishes a change, **open the browser and play for 30 seconds** before asking for the next thing. Your next request should come from what you just felt, not from your original plan.

### 3. Panicking when something breaks

White screens and red terminal errors are completely normal. Just **copy the red error text** from the terminal or the browser's F12 console and paste it to the AI. Most issues fix themselves.

### 4. Chasing AAA visuals

Placeholder rectangles + pixel art + a simple color palette can make a **surprisingly charming** game. Spend your energy on the feel of the gameplay. Art can come later — from a friend, an AI image generator, or an asset store.

---

## FAQ

**Q: I know nothing about code. Can I really make something?**

Yes. This project is designed for exactly that. What you need is the ability to **clearly describe what you want** and the willingness to **iterate without fear**.

**Q: Can the AI break the project?**

It can. That's why before any big change, learn one small skill: **Git commit**. VS Code and Cursor both have a one-click button for it. If something breaks, you can roll back to the last working version instantly. Ask the AI to walk you through it.

**Q: Is this free?**

The scaffold is free and open source. Node.js, pnpm, and the editors are free. AI assistants have free tiers; heavy use runs about $20/month.

**Q: Can I sell or publish the game I make with this?**

The scaffold is open source and free for commercial use. The game you build is yours. Just **check the licenses on any assets** (music, images, fonts) you use.

**Q: Can it run on mobile as a real app?**

It runs in **mobile browsers** out of the box. Packaging it as a native app (App Store / Google Play) requires an extra layer like Capacitor or Tauri — doable, but a next-step topic.

**Q: What if I get halfway through and give up?**

That's fine. You'll have already:
- Run a real front-end project (most people never do)
- Collaborated with an AI to write code (a core skill in 2026)
- Built a playable game, even if it's just a demo

None of that is wasted on a PM's résumé.

---

## Where to go next

1. **Get the demo running** (follow "Three steps to get it running" above)
2. **Play it for a minute** — feel what "a game you can modify" is like
3. **Open your AI assistant** and say "I want to turn this demo into [your game idea]" — let it guide you
4. Want to understand how the project is organized? Read [`README.en.md`](../readme/README.en.md)
5. Want the AI to make fewer mistakes? Have it read [`AGENTS.md`](../../AGENTS.md) first

---

## A final word

The biggest frustration in product work isn't having bad ideas — it's having ideas that **stay stuck in your head** because you can't make them real fast enough.

This toolchain + AI combination is the first time "**the experience in my head**" can become "**a thing someone else can play**" in a single day.

Not to turn you into a programmer. To make you a **better product manager** — one who can run their own prototype, communicate with their team through something playable, and drop a link in a meeting and say "this is the feeling I'm going for."

Have fun.
