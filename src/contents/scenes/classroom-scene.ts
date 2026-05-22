import * as Phaser from 'phaser'
import { SCENE_KEYS, ASSET_KEYS, EVENT_KEYS } from '../constants'
import { KIDS } from '../data/kids'
import type { KidId } from '../data/kids'
import { useEventBus } from '@/runtime'

const eventBus = useEventBus()

export class ClassroomScene extends Phaser.Scene {
  private completed = new Set<KidId>()

  constructor() {
    super({ key: SCENE_KEYS.CLASSROOM })
  }

  init(): void {
    const saved = this.registry.get('completedKids') as KidId[] | undefined
    this.completed = new Set(saved ?? [])
  }

  create(): void {
    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, ASSET_KEYS.CLASSROOM_BG)

    this.add.text(width / 2, 40, '合奏课', {
      fontSize: '48px', color: '#5a3800', fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5, 0)

    // Teacher
    const charY = height * 0.78
    this.add.image(140, charY, ASSET_KEYS.TEACHER_AVATAR)
    this.add.text(140, charY, '🧑‍🏫', { fontSize: '48px' }).setOrigin(0.5)
    this.add.text(140, charY + 60, '老师', {
      fontSize: '18px', color: '#5a3800', fontFamily: 'sans-serif',
    }).setOrigin(0.5)

    // Students
    const positions = [width * 0.38, width * 0.55, width * 0.72]
    for (let i = 0; i < KIDS.length; i++) {
      const kid = KIDS[i]
      const x = positions[i]
      const y = charY

      const avatar = this.add.image(x, y, ASSET_KEYS.KID_AVATAR).setInteractive({ useHandCursor: true })
      this.add.text(x, y, kid.emoji, { fontSize: '48px' }).setOrigin(0.5)
      this.add.text(x, y + 60, kid.name, {
        fontSize: '20px', color: '#5a3800', fontFamily: 'sans-serif',
      }).setOrigin(0.5)

      if (this.completed.has(kid.id)) {
        this.add.text(x + 36, y - 44, '✓', { fontSize: '28px', color: '#2a8800' }).setOrigin(0.5)
        avatar.setAlpha(0.6)
      } else {
        avatar.on('pointerdown', () => {
          this.scene.start(SCENE_KEYS.DIALOGUE, { kidId: kid.id })
        })
        avatar.on('pointerover', () => { avatar.setTint(0xeeddbb) })
        avatar.on('pointerout', () => { avatar.clearTint() })
      }
    }

    // Progress
    this.add.text(width - 20, 20, `已采集素材 ${this.completed.size} / 3`, {
      fontSize: '20px', color: '#5a3800', fontFamily: 'sans-serif',
    }).setOrigin(1, 0)

    if (this.completed.size === 3) {
      this.showBossButton()
    }

    eventBus.on(EVENT_KEYS.GAME_PAUSE, this.handlePause)
    eventBus.on(EVENT_KEYS.GAME_RESUME, this.handleResume)
    this.events.on('shutdown', () => {
      eventBus.off(EVENT_KEYS.GAME_PAUSE, this.handlePause)
      eventBus.off(EVENT_KEYS.GAME_RESUME, this.handleResume)
    })
  }

  private showBossButton(): void {
    const { width, height } = this.scale
    const btn = this.add.text(width / 2, height - 80, '🎼 上台演奏', {
      fontSize: '32px', color: '#ffffff',
      backgroundColor: '#7c3aed',
      padding: { x: 24, y: 12 },
      fontFamily: 'sans-serif',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.BOSS, { chartId: 'boss', kidId: 'huimi', isBoss: true })
    })
    btn.on('pointerover', () => btn.setAlpha(0.8))
    btn.on('pointerout', () => btn.setAlpha(1))
  }

  private handlePause = (): void => { this.scene.pause() }
  private handleResume = (): void => { this.scene.resume() }
}
