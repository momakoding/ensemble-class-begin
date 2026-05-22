import * as Phaser from 'phaser'
import { SCENE_KEYS, EVENT_KEYS } from '../constants'
import { KIDS } from '../data/kids'
import { useEventBus } from '@/runtime'

const eventBus = useEventBus()

export class EndingScene extends Phaser.Scene {
  private score = 0

  constructor() {
    super({ key: SCENE_KEYS.ENDING })
  }

  init(data: { score: number }): void {
    this.score = data.score ?? 0
  }

  create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#000000')
    this.cameras.main.fadeIn(1200)

    this.add.text(width / 2, height * 0.22, '这首歌的名字，', {
      fontSize: '36px', color: '#f0e6ff', fontFamily: 'sans-serif',
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.33, '叫做"我们"。', {
      fontSize: '36px', color: '#f0e6ff', fontFamily: 'sans-serif',
    }).setOrigin(0.5)

    let yOff = height * 0.5
    for (const kid of KIDS) {
      this.add.text(width / 2, yOff, `${kid.emoji} ${kid.name}：${kid.keyword}`, {
        fontSize: '24px', color: '#c9b6ff', fontFamily: 'sans-serif',
      }).setOrigin(0.5)
      yOff += 44
    }

    this.add.text(width / 2, yOff + 20, `总分：${this.score}`, {
      fontSize: '28px', color: '#FFD700', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.add.text(width / 2, height - 60, '按任意键重新演出', {
      fontSize: '20px', color: '#888888', fontFamily: 'sans-serif',
    }).setOrigin(0.5)

    this.input.on('pointerdown', () => this.restart())
    // 排除 ESC，避免与 Vue 暂停冲突
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Escape') this.restart()
    })

    eventBus.on(EVENT_KEYS.GAME_PAUSE, this.handlePause)
    eventBus.on(EVENT_KEYS.GAME_RESUME, this.handleResume)
    this.events.on('shutdown', () => {
      eventBus.off(EVENT_KEYS.GAME_PAUSE, this.handlePause)
      eventBus.off(EVENT_KEYS.GAME_RESUME, this.handleResume)
    })
  }

  private restart(): void {
    this.registry.remove('completedKids')
    this.scene.start(SCENE_KEYS.CLASSROOM)
  }

  private handlePause = (): void => { this.scene.pause() }
  private handleResume = (): void => { this.scene.resume() }
}
