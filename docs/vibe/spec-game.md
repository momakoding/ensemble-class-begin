# 《合奏课》Game Spec

> 基于 momakoding-gamejam-starter-web 的填充式 spec。
> 工作量评估：3 小时 vibe jam，只动 `src/contents/` + `src/pages/game.vue` 的少量 HUD。

## 1. 立项

- **游戏名**：合奏课
- **主题映射**：教育 × 艺术 = 老师与学生通过对话采集灵感 → 演奏成旋律 → 三段融合为合奏
- **类型**：4 键下落式音游 + 极轻量对话 AVG
- **单局时长**：5–7 分钟
- **物理引擎**：不需要（音游纯计时 + 输入），保留 Arcade 默认即可，不开物理调试

## 2. 个性化内容（先改这些）

### 2.1 `src/contents/game-info/game-meta.ts`

```ts
export const GAME_META: GameMeta = {
  title: "合奏课",
  subtitle: "Ensemble Class Begins",
  description: "倾听学生的故事，把它们弹成歌。",
  tags: ["音游", "叙事", "教育×艺术"],
  showGameCard: true,
  ossCredits: [
    // 如果最终用了 WebAudio 自合成则无需第三方鸣谢
  ],
};
```

### 2.2 `src/contents/game-info/how-to-play.md`

```md
## 操作

- D / F / J / K：四条轨道判定键
- 鼠标点击：推进对话、选择学生
- ESC：暂停

## 玩法

1. 在教室里点击三位学生，听他们讲故事。
2. 故事结束后，把"灵感"演奏成一段旋律。
3. 三段旋律采集完成，登台合奏演出。
```

### 2.3 `src/contents/game-info/team.ts`

- Saša 萨沙 一人项目

## 3. 注册表新增（写代码前先登记）

> 严格按 AGENTS.md §0 的"读前写"流程，先在 `contents/constants.ts` 注册，再写实现。

### 3.1 `SCENE_KEYS` 新增

| Key              | 类（文件）                           | 角色                                       |
| ---------------- | ------------------------------------ | ------------------------------------------ |
| `BootScene`      | 沿用，仅替换 generateTexture 内容    | 生成占位贴图                               |
| `ClassroomScene` | `contents/scenes/classroom-scene.ts` | 教室主枢纽，三个学生头像 + 老师 + 上台按钮 |
| `DialogueScene`  | `contents/scenes/dialogue-scene.ts`  | 单个学生对白演出                           |
| `RhythmScene`    | `contents/scenes/rhythm-scene.ts`    | 4 键下落音游通用关                         |
| `BossScene`      | `contents/scenes/boss-scene.ts`      | 复用 RhythmScene 的下落引擎 + 三段融合谱   |
| `EndingScene`    | `contents/scenes/ending-scene.ts`    | 演出谢幕 + 关键词回顾                      |

> 删除 `GameScene`（demo），把 `pages/game-demo/index.vue` 的 `addScene(GameScene)` 改为按 `BootScene → ClassroomScene` 启动。

### 3.2 `EVENT_KEYS` 新增

| Key 常量         | 字符串           | 方向         | Payload                                                               |
| ---------------- | ---------------- | ------------ | --------------------------------------------------------------------- |
| `KID_COMPLETED`  | `kid:completed`  | Phaser → Vue | `{ kidId: string; score: number; keyword: string }`                   |
| `BOSS_COMPLETED` | `boss:completed` | Phaser → Vue | `{ score: number; maxCombo: number }`                                 |
| `RHYTHM_HIT`     | `rhythm:hit`     | Phaser → Vue | `{ judge: 'perfect' \| 'good' \| 'miss'; combo: number }`（驱动 HUD） |
| `RHYTHM_SCORE`   | `rhythm:score`   | Phaser → Vue | `number`                                                              |

保留原有 `GAME_PAUSE / GAME_RESUME / GAME_RESTART`。

### 3.3 `ASSET_KEYS`（全部 generateTexture）

| Key              | 形状     | 尺寸/颜色                  | 用途                          |
| ---------------- | -------- | -------------------------- | ----------------------------- |
| `note-lane-0`    | 圆角矩形 | 80×24，#FFB86B             | D 轨判定块                    |
| `note-lane-1`    | 圆角矩形 | 80×24，#FF7AB6             | F 轨                          |
| `note-lane-2`    | 圆角矩形 | 80×24，#7D3FC              | J 轨                          |
| `note-lane-3`    | 圆角矩形 | 80×24，#A78BFA             | K 轨                          |
| `judge-line`     | 矩形     | 360×4，#FFFFFF             | 判定线                        |
| `kid-avatar`     | 圆       | 96×96，#F5DEB3             | 学生头像底（叠 emoji 文字层） |
| `teacher-avatar` | 圆       | 96×96，#C9B6FF             | 老师头像底                    |
| `classroom-bg`   | 渐变矩形 | 1280×720，#FAF3D → #F0C987 | 教室背景                      |

emoji 直接用 `Phaser.GameObjects.Text`（系统字体即可）叠在头像中央。

## 4. `GAME_CONFIG` 数值

```ts
export const GAME_CONFIG = {
  RHYTHM: {
    LANE_COUNT: 4,
    LANE_KEYS: ["D", "F", "J", "K"],
    NOTE_FALL_TIME: 1.6, // 秒，note 从顶到判定线
    JUDGE_LINE_Y: 600,
    PERFECT_WINDOW: 0.08, // ±80ms
    GOOD_WINDOW: 0.16,
    SCORE_PERFECT: 100,
    SCORE_GOOD: 60,
    SCORE_MISS: 0,
  },
  AUDIO: {
    MASTER_GAIN: 0.25,
    NOTE_DURATION: 0.45, // 秒
    WAVEFORM: "triangle", // 单关默认
    BOSS_WAVEFORMS: ["triangle", "sawtooth", "square"], // 三段叠加
  },
} as const;
```

## 5. 内容数据（重头戏）

新建 `src/contents/data/`，由 AI 直接填：

### 5.1 `kids.ts`

```ts
export interface KidData {
  id: "huimi" | "yali" | "jiawen"; // 惠弥：可爱小女孩；雅莉：假小子；嘉文：孩子王
  name: string;
  emoji: string; // 显示在头像中央
  keyword: string; // 演奏关标题
  lines: string[]; // 对白，每条点击一次推进
  chartId: keyof typeof CHARTS; // 关联的谱面
}

export const KIDS: KidData[] = [
  {
    id: "huimi",
    name: "惠弥",
    emoji: "🧒",
    keyword: "雨后的操场",
    lines: [
      "老师，我昨天看到操场全是水洼。",
      "踩上去会有'啪嗒'的声音，一深一浅。",
      "我想把那个声音变成歌。",
    ],
    chartId: "rain",
  },
  // 其他人同结构
];
```

### 5.2 `charts.ts`

，

```ts
export interface NoteData {
  time: number; // 秒，从关卡 t=0 起
  lane: 0 | 1 | 2 | 3;
  pitch: number; // MIDI 音高，60 = C4
}

export interface ChartData {
  bpm: number;
  duration: number;
  waveform: OscillatorType;
  notes: NoteData[];
}

export const CHARTS = {
  rain: {
    bpm: 100,
    duration: 30,
    waveform: "triangle",
    notes: [
      /* 40–60 个 */
    ],
  },
  chair: {
    bpm: 88,
    duration: 30,
    waveform: "sine",
    notes: [
      /* */
    ],
  },
  cat: {
    bpm: 120,
    duration: 30,
    waveform: "square",
    notes: [
      /* */
    ],
  },
  boss: {
    bpm: 110,
    duration: 60,
    waveform: "triangle",
    notes: [
      /* 三段主题轮换 + 末段叠加，约 120 个 */
    ],
  },
} as const;
```

> 谱面生成原则：每张单曲取 1 个 5 度内的简单旋律（4–6 个不同音高），boss 谱前 1/3 复用 rain 主题、中 1/3 复用 chair、后 1/3 三主题混排，密度递增。

## 6. 场景规格（实现细节）

### 6.1 ClassroomScene

- 启动数据：`{ completed: Set<KidId> }`（可放 Phaser Registry）
- 三个学生头像横排（点击进入 `DialogueScene`，传 `kidId`）
- 老师头像在左侧装饰
- 当 `completed.size === 3` → 出现"上台演奏 🎼"按钮 → 切 `BossScene`
- 顶部 HUD（Vue 侧，监听 `KID_COMPLETED`）显示"已采集 N/3"

### 6.2 DialogueScene

- `init({ kidId })`，从 `KIDS` 取数据
- 黑色半透明对话框，逐行显示 `lines`，鼠标点击 / 空格推进
- 每行结束在顶部追加该行的"灵感词"（手工标，第一版直接用 keyword 拆字）
- 末行之后中央按钮"演奏'{keyword}'" → 切 `RhythmScene({ chartId, kidId })`

### 6.3 RhythmScene（核心）

- `init({ chartId, kidId, isBoss?: boolean })`
- `create()`：
  - 画 4 条轨道、判定线
  - 把 chart.notes 全量预生成为 `Phaser.GameObjects.Image`，初始 y 在屏幕外，按 `time - NOTE_FALL_TIME` 时刻入场
  - 用 `this.input.keyboard!.on("keydown-D"…)` 注册四个按键
- `update(time)`：以 `scene.time.now / 1000` 为时间轴推进 note 的 y 坐标
- 命中检测：按下时取 `lane` 中最早未命中且 `|note.time - now| < GOOD_WINDOW` 的 note
  - 命中 → `playNote(pitch, waveform)` + emit `RHYTHM_HIT`
  - 未命中或超时 → judge=miss
- 关卡时间走完 → emit `KID_COMPLETED` + 切回 `ClassroomScene`
- 不设失败惩罚

### 6.4 BossScene

- 直接 `extends RhythmScene` 复用引擎，覆盖 `init` 加载 `boss` chart，`isBoss=true`
- 三段切换：根据当前 note 的 `time / duration` 比例切 waveform
- 完成后切 `EndingScene`

### 6.5 EndingScene

- 黑屏渐入"这首歌的名字，叫做'我们'。"
- 列出三个 keyword + boss 总分
- 按键回 `ClassroomScene` 重玩

## 7. 音频实现（不引第三方）

新建 `src/contents/audio/synth.ts`，封装 WebAudio：

```ts
let ctx: AudioContext | null = null;

export function playNote(
  midi: number,
  waveform: OscillatorType,
  duration = 0.45,
) {
  if (!ctx) ctx = new AudioContext();
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = waveform;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}
```

> 不加 Tone.js，避免 §13.10 还要写决策。原生 Web Audio 单音合成对音游来说够用。

## 8. Vue 侧改动

仅 `pages/game.vue` 顶部 HUD 加两块：

- 节奏关时显示 score / combo / 最近 judge（监听 `RHYTHM_HIT` / `RHYTHM_SCORE`）
- 教室时显示采集进度

不新增页面，不改路由。

## 9. 工时切片（3h 死线）

| 段        | 时长                                               | 产出               |
| --------- | -------------------------------------------------- | ------------------ |
| 0:00–0:20 | 删 demo、登记 SCENE/EVENT/ASSET keys、写 game-meta | starter 跑通新骨架 |
| 0:20–1:30 | RhythmScene 引擎 + WebAudio 合成 + HUD             | 一关 chart 可玩    |
| 1:30–2:00 | ClassroomScene + DialogueScene + 流转              | 三关串通           |
| 2:00–2:40 | 写 4 张 chart + 3 段对白 + EndingScene             | 内容完整           |
| 2:40–3:00 | BossScene 三段 waveform 切换、打磨手感             | 可提交             |

## 10. 砍件优先级

1. EndingScene 视觉特效 → 砍
2. 灵感词追加动画 → 砍，词直接显示
3. 第三个学生 → 砍，boss 退化为两段融合
4. judge 三档 → 退化为 hit / miss 二值

## 11. 验收

- 从 `/` → `/#/game` → 教室 → 三关 → boss → 结局，全流程不卡死
- 控制台无 TS 报错，无未注册 EVENT_KEY 警告
- AGENTS.md §13.3 / §13.5 / §13.6 同步更新
- ESC 暂停照常工作（starter 自带，别破坏）

---

先按 §3 注册表登记 + 改 game-meta，确认骨架通了再让它写 RhythmScene。RhythmScene 一旦能跑，剩下的全是填数据的活。Boss 谱让 AI 按"前段复用 rain.notes，中段复用 chair.notes，把 lane 偏移、密度加密"自动拼一版，比手写快十倍。
