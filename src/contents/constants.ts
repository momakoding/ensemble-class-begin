/**
 * 游戏内容常量 —— 全项目唯一源。
 *
 * 归属原则：
 *   - UI 无关、引擎无关的游戏世界数值/标识。
 *   - engine/ 不应 import 本文件（engine 若需要 fallback，走自己的 SHELL_DEFAULTS）。
 *   - runtime/ 不直接 import 具体事件 Key，业务层（scenes / pages）才用。
 */
import { DPR } from '@/engine'

/** 将像素数值转为按 DPR 缩放后的 Phaser font size 字符串 */
export const px = (n: number) => `${Math.round(n * DPR)}px`

// ---- 场景 Key ----
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  CLASSROOM: 'ClassroomScene',
  DIALOGUE: 'DialogueScene',
  RHYTHM: 'RhythmScene',
  BOSS: 'BossScene',
  ENDING: 'EndingScene',
} as const

// ---- 事件 Key (Phaser <-> Vue 通信) ----
export const EVENT_KEYS = {
  GAME_OVER: 'game:over',
  GAME_RESTART: 'game:restart',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_RETURN_CLASSROOM: 'game:return-classroom',
  KID_COMPLETED: 'kid:completed',
  BOSS_COMPLETED: 'boss:completed',
  RHYTHM_HIT: 'rhythm:hit',
  RHYTHM_SCORE: 'rhythm:score',
} as const

// ---- 贴图 Key ----
export const ASSET_KEYS = {
  NOTE_LANE_0: 'note-lane-0',
  NOTE_LANE_1: 'note-lane-1',
  NOTE_LANE_2: 'note-lane-2',
  NOTE_LANE_3: 'note-lane-3',
  JUDGE_LINE: 'judge-line',
  KID_AVATAR: 'kid-avatar',
  TEACHER_AVATAR: 'teacher-avatar',
  CLASSROOM_BG: 'classroom-bg',
} as const

// ---- 游戏配置 ----
export const GAME_CONFIG = {
  WIDTH: Math.round(1280 * DPR),
  HEIGHT: Math.round(720 * DPR),
  RHYTHM: {
    LANE_COUNT: 4,
    LANE_KEYS: ['D', 'F', 'J', 'K'],
    NOTE_FALL_TIME: 1.6,
    JUDGE_LINE_Y: Math.round(600 * DPR),
    PERFECT_WINDOW: 0.08,
    GOOD_WINDOW: 0.16,
    SCORE_PERFECT: 100,
    SCORE_GOOD: 60,
    SCORE_MISS: 0,
  },
  AUDIO: {
    MASTER_GAIN: 0.25,
    NOTE_DURATION: 0.45,
    WAVEFORM: 'triangle' as OscillatorType,
    BOSS_WAVEFORMS: ['triangle', 'sawtooth', 'square'] as OscillatorType[],
  },
} as const
