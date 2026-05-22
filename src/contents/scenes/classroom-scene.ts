import * as Phaser from 'phaser'
import { SCENE_KEYS, ASSET_KEYS, EVENT_KEYS, px } from '../constants'
import { DPR } from '@/engine'
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

    this.add.image(width / 2, height / 2, ASSET_KEYS.CLASSROOM_BG).setDisplaySize(width, height)

    this.add.text(width / 2, Math.round(40 * DPR), '合奏课', {
      fontSize: px(48), color: '#5a3800', fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5, 0)

    // Teacher
    const charY = height * 0.78
    const teacherX = Math.round(140 * DPR)
    this.add.image(teacherX, charY, ASSET_KEYS.TEACHER_AVATAR)
    this.add.text(teacherX, charY, '🧑‍🏫', { fontSize: px(48) }).setOrigin(0.5)
    this.add.text(teacherX, charY + Math.round(60 * DPR), '老师', {
      fontSize: px(18), color: '#5a3800', fontFamily: 'sans-serif',
    }).setOrigin(0.5)

    // Students
    const positions = [width * 0.38, width * 0.55, width * 0.72]
    for (let i = 0; i < KIDS.length; i++) {
      const kid = KIDS[i]
      const x = positions[i]
      const y = charY

      const avatar = this.add.image(x, y, ASSET_KEYS.KID_AVATAR).setInteractive({ useHandCursor: true })
      this.add.text(x, y, kid.emoji, { fontSize: px(48) }).setOrigin(0.5)
      this.add.text(x, y + Math.round(60 * DPR), kid.name, {
        fontSize: px(20), color: '#5a3800', fontFamily: 'sans-serif',
      }).setOrigin(0.5)

      if (this.completed.has(kid.id)) {
        this.add.text(x + Math.round(36 * DPR), y - Math.round(44 * DPR), '✓', { fontSize: px(28), color: '#2a8800' }).setOrigin(0.5)
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
    this.add.text(width - Math.round(20 * DPR), Math.round(20 * DPR), `已采集素材 ${this.completed.size} / 3`, {
      fontSize: px(20), color: '#5a3800', fontFamily: 'sans-serif',
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
    const btn = this.add.text(width / 2, height - Math.round(80 * DPR), '🎼 上台演奏', {
      fontSize: px(32), color: '#ffffff',
      backgroundColor: '#7c3aed',
      padding: { x: Math.round(24 * DPR), y: Math.round(12 * DPR) },
      fontFamily: 'sans-serif',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.BOSS, { chartKey: 'ensemble', kidId: 'huimi', isBoss: true })
    })
    btn.on('pointerover', () => btn.setAlpha(0.8))
    btn.on('pointerout', () => btn.setAlpha(1))
  }

  private handlePause = (): void => { this.scene.pause() }
  private handleResume = (): void => { this.scene.resume() }
}
