import * as Phaser from 'phaser'
import { SCENE_KEYS, GAME_CONFIG, ASSET_KEYS, EVENT_KEYS, px } from '../constants'
import { DPR } from '@/engine'
import { getChart } from '../composables/useCharts'
import type { NoteData, ChartData } from '../composables/useCharts'
import { KIDS } from '../data/kids'
import type { KidId } from '../data/kids'
import { playNote, releaseNotes } from '../audio/synth'
import { useEventBus } from '@/runtime'

const eventBus = useEventBus()

const { RHYTHM } = GAME_CONFIG

const LANE_X = [490, 590, 690, 790].map(x => Math.round(x * DPR))

interface NoteObject {
  data: NoteData
  image: Phaser.GameObjects.Image
  hit: boolean
  missed: boolean
}

export interface RhythmSceneInitData {
  chartKey: string
  kidId: KidId
  isBoss?: boolean
}

export class RhythmScene extends Phaser.Scene {
  protected chartKey!: string
  protected kidId!: KidId
  protected isBoss = false

  private notes: NoteObject[] = []
  private startTime = 0
  private pausedSongTime = 0
  private score = 0
  private combo = 0
  private chartDone = false
  private countdownActive = true
  private manuallyPaused = false
  private keys: Phaser.Input.Keyboard.Key[] = []
  private judgeText!: Phaser.GameObjects.Text
  private judgeTimer: ReturnType<typeof setTimeout> | null = null

  constructor(key: string = SCENE_KEYS.RHYTHM) {
    super({ key })
  }

  init(data: RhythmSceneInitData): void {
    this.chartKey = data.chartKey
    this.kidId = data.kidId
    this.isBoss = data.isBoss ?? false
    this.score = 0
    this.combo = 0
    this.chartDone = false
    this.countdownActive = true
    this.manuallyPaused = false
    this.pausedSongTime = 0
    this.notes = []
  }

  create(): void {
    const { WIDTH, HEIGHT } = GAME_CONFIG
    const chart = getChart(this.chartKey)
    if (!chart) {
      console.error(`Chart not loaded: ${this.chartKey}`)
      this.scene.start(SCENE_KEYS.CLASSROOM)
      return
    }

    this.cameras.main.setBackgroundColor('#1a0a2e')

    const trackGfx = this.add.graphics()
    trackGfx.lineStyle(Math.round(2 * DPR), 0x444466, 0.6)
    for (let i = 0; i < 4; i++) {
      trackGfx.lineBetween(LANE_X[i], 0, LANE_X[i], HEIGHT)
    }

    const judgeLineGfx = this.add.graphics()
    judgeLineGfx.fillStyle(0xFFFFFF, 0.8)
    judgeLineGfx.fillRect(
      LANE_X[0] - Math.round(40 * DPR),
      RHYTHM.JUDGE_LINE_Y - Math.round(2 * DPR),
      LANE_X[3] - LANE_X[0] + Math.round(80 * DPR),
      Math.round(4 * DPR)
    )
    void judgeLineGfx

    const keyLabels = ['D', 'F', 'J', 'K']
    for (let i = 0; i < 4; i++) {
      this.add.text(LANE_X[i], RHYTHM.JUDGE_LINE_Y + Math.round(20 * DPR), keyLabels[i], {
        fontSize: px(20), color: '#aaaacc', fontFamily: 'monospace',
      }).setOrigin(0.5, 0)
    }

    const kid = KIDS.find(k => k.id === this.kidId)
    const title = this.isBoss ? '合奏演出' : (kid?.keyword ?? '')
    this.add.text(WIDTH / 2, Math.round(20 * DPR), title, {
      fontSize: px(28), color: '#ffffff', fontFamily: 'sans-serif',
    }).setOrigin(0.5, 0)

    this.judgeText = this.add.text(WIDTH / 2, RHYTHM.JUDGE_LINE_Y - Math.round(60 * DPR), '', {
      fontSize: px(40), color: '#FFFFFF', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5, 1).setDepth(5)

    const noteKeys = [ASSET_KEYS.NOTE_LANE_0, ASSET_KEYS.NOTE_LANE_1, ASSET_KEYS.NOTE_LANE_2, ASSET_KEYS.NOTE_LANE_3]
    for (const n of chart.notes) {
      const img = this.add.image(LANE_X[n.lane], Math.round(-30 * DPR), noteKeys[n.lane])
      img.setVisible(false)
      this.notes.push({ data: n, image: img, hit: false, missed: false })
    }

    if (this.input.keyboard) {
      for (const key of ['D', 'F', 'J', 'K']) {
        const k = this.input.keyboard.addKey(key)
        this.keys.push(k)
        this.input.keyboard.on(`keydown-${key}`, () => this.onKeyDown(key))
      }
    }

    eventBus.on(EVENT_KEYS.GAME_PAUSE, this.handlePause)
    eventBus.on(EVENT_KEYS.GAME_RESUME, this.handleResume)
    eventBus.on(EVENT_KEYS.GAME_RETURN_CLASSROOM, this.handleReturnClassroom)
    this.events.on('shutdown', () => {
      eventBus.off(EVENT_KEYS.GAME_PAUSE, this.handlePause)
      eventBus.off(EVENT_KEYS.GAME_RESUME, this.handleResume)
      eventBus.off(EVENT_KEYS.GAME_RETURN_CLASSROOM, this.handleReturnClassroom)
    })

    this.startCountdown()
  }

  private runCountdown(steps: string[], onComplete: () => void): void {
    const { WIDTH, HEIGHT } = GAME_CONFIG
    const txt = this.add.text(WIDTH / 2, HEIGHT / 2, steps[0], {
      fontSize: px(120), color: '#FFFFFF', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10)

    let i = 0
    const tick = () => {
      if (i >= steps.length) {
        txt.destroy()
        onComplete()
        return
      }
      txt.setText(steps[i]).setScale(1).setAlpha(1)
      this.tweens.add({
        targets: txt,
        alpha: 0,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 800,
        onComplete: () => { i++; tick() },
      })
    }
    tick()
  }

  private startCountdown(): void {
    this.runCountdown(['3', '2', '1', 'START!'], () => {
      this.countdownActive = false
      this.startTime = this.time.now
    })
  }

  update(): void {
    if (this.chartDone || this.countdownActive || this.manuallyPaused) return

    const chart = getChart(this.chartKey)
    if (!chart) return

    const now = (this.time.now - this.startTime) / 1000

    for (const note of this.notes) {
      if (note.hit || note.missed) continue

      const timeToJudge = note.data.time - now
      if (timeToJudge <= RHYTHM.NOTE_FALL_TIME) {
        note.image.setVisible(true)
        const progress = 1 - (timeToJudge / RHYTHM.NOTE_FALL_TIME)
        note.image.y = progress * RHYTHM.JUDGE_LINE_Y
      }

      if (now > note.data.time + RHYTHM.GOOD_WINDOW && !note.hit) {
        note.missed = true
        note.image.setVisible(false)
        this.combo = 0
        this.showJudge('MISS')
        eventBus.emit(EVENT_KEYS.RHYTHM_HIT, { judge: 'miss', combo: 0 })
      }
    }

    if (!this.chartDone && now >= chart.duration) {
      this.chartDone = true
      this.onChartComplete(now)
    }
  }

  private onKeyDown(key: string): void {
    if (this.countdownActive || this.manuallyPaused) return
    const laneIndex = ['D', 'F', 'J', 'K'].indexOf(key)
    if (laneIndex === -1) return

    const chart = getChart(this.chartKey)
    if (!chart) return

    const now = (this.time.now - this.startTime) / 1000

    // 取判定窗口内距当前时间最近的音符（非首个）
    const candidate = this.notes
      .filter(n => !n.hit && !n.missed && n.data.lane === laneIndex && Math.abs(n.data.time - now) <= RHYTHM.GOOD_WINDOW)
      .sort((a, b) => Math.abs(a.data.time - now) - Math.abs(b.data.time - now))[0]

    if (candidate) {
      const diff = Math.abs(candidate.data.time - now)
      const isPerfect = diff <= RHYTHM.PERFECT_WINDOW
      candidate.hit = true
      candidate.image.setVisible(false)

      this.combo++
      this.score += isPerfect ? RHYTHM.SCORE_PERFECT : RHYTHM.SCORE_GOOD
      this.showJudge(isPerfect ? 'PERFECT' : 'GOOD')
      const voice = candidate.data.lane < 2 ? 'left' : 'right'
      releaseNotes(voice)
      for (const p of candidate.data.chordPitches) {
        playNote(p, this.getWaveform(chart, now), candidate.data.duration, voice)
      }
      eventBus.emit(EVENT_KEYS.RHYTHM_HIT, { judge: isPerfect ? 'perfect' : 'good', combo: this.combo })
      eventBus.emit(EVENT_KEYS.RHYTHM_SCORE, this.score)
    }
  }

  protected getWaveform(chart: ChartData, _now: number): OscillatorType {
    return chart.waveform
  }

  private showJudge(text: string): void {
    const colors: Record<string, string> = { PERFECT: '#FFD700', GOOD: '#88FFAA', MISS: '#FF6666' }
    this.judgeText.setText(text).setColor(colors[text] ?? '#FFFFFF')
    if (this.judgeTimer) clearTimeout(this.judgeTimer)
    this.judgeTimer = setTimeout(() => this.judgeText.setText(''), 400)
  }

  protected onChartComplete(_now: number): void {
    if (this.isBoss) {
      eventBus.emit(EVENT_KEYS.BOSS_COMPLETED, { score: this.score, maxCombo: this.combo })
      this.scene.start(SCENE_KEYS.ENDING, { score: this.score })
    } else {
      const kid = KIDS.find(k => k.id === this.kidId)
      const prev: string[] = this.registry.get('completedKids') ?? []
      if (!prev.includes(this.kidId)) {
        this.registry.set('completedKids', [...prev, this.kidId])
      }
      eventBus.emit(EVENT_KEYS.KID_COMPLETED, { kidId: this.kidId, score: this.score, keyword: kid?.keyword ?? '' })
      this.scene.start(SCENE_KEYS.CLASSROOM)
    }
  }

  private handlePause = (): void => {
    if (this.countdownActive || this.chartDone || this.manuallyPaused) return
    this.pausedSongTime = (this.time.now - this.startTime) / 1000
    this.manuallyPaused = true
  }

  private handleResume = (): void => {
    if (!this.manuallyPaused) return
    this.manuallyPaused = false
    this.countdownActive = true
    this.runCountdown(['3', '2', '1'], () => {
      this.startTime = this.time.now - this.pausedSongTime * 1000
      this.countdownActive = false
    })
  }

  private handleReturnClassroom = (): void => {
    this.manuallyPaused = false
    this.scene.start(SCENE_KEYS.CLASSROOM)
  }
}
