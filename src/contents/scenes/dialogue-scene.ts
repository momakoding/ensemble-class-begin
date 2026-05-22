import * as Phaser from 'phaser'
import { SCENE_KEYS, ASSET_KEYS, EVENT_KEYS, px } from '../constants'
import { DPR } from '@/engine'
import { KIDS } from '../data/kids'
import type { KidId } from '../data/kids'
import { useEventBus } from '@/runtime'

const eventBus = useEventBus()

export class DialogueScene extends Phaser.Scene {
  private kidId!: KidId
  private lineIndex = 0
  private dialogText!: Phaser.GameObjects.Text
  private promptText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: SCENE_KEYS.DIALOGUE })
  }

  init(data: { kidId: KidId }): void {
    this.kidId = data.kidId
    this.lineIndex = 0
  }

  create(): void {
    const { width, height } = this.scale
    const kid = KIDS.find(k => k.id === this.kidId)!

    this.add.image(width / 2, height / 2, ASSET_KEYS.CLASSROOM_BG).setDisplaySize(width, height)

    this.add.image(width / 2, height * 0.28, ASSET_KEYS.KID_AVATAR).setScale(1.4)
    this.add.text(width / 2, height * 0.28, kid.emoji, { fontSize: px(64) }).setOrigin(0.5)
    this.add.text(width / 2, height * 0.28 + Math.round(80 * DPR), kid.name, {
      fontSize: px(24), color: '#e0c890', fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    const boxY = height * 0.62
    const boxW = width * 0.72
    const boxH = Math.round(130 * DPR)
    const boxX = width / 2

    const box = this.add.graphics()
    box.fillStyle(0x000000, 0.75)
    box.fillRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, Math.round(12 * DPR))
    box.lineStyle(Math.round(2 * DPR), 0x9966ff, 0.8)
    box.strokeRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, Math.round(12 * DPR))
    void box

    this.dialogText = this.add.text(boxX, boxY, '', {
      fontSize: px(22), color: '#f0f0f0', fontFamily: 'sans-serif',
      wordWrap: { width: boxW - Math.round(40 * DPR) }, align: 'center',
    }).setOrigin(0.5)

    this.promptText = this.add.text(boxX + boxW / 2 - Math.round(20 * DPR), boxY + boxH / 2 - Math.round(16 * DPR), '▶', {
      fontSize: px(16), color: '#9966ff',
    }).setOrigin(1, 1)

    this.showLine()

    this.input.on('pointerdown', () => this.advance())
    this.input.keyboard?.on('keydown-SPACE', () => this.advance())

    eventBus.on(EVENT_KEYS.GAME_PAUSE, this.handlePause)
    eventBus.on(EVENT_KEYS.GAME_RESUME, this.handleResume)
    this.events.on('shutdown', () => {
      eventBus.off(EVENT_KEYS.GAME_PAUSE, this.handlePause)
      eventBus.off(EVENT_KEYS.GAME_RESUME, this.handleResume)
    })
  }

  private showLine(): void {
    const kid = KIDS.find(k => k.id === this.kidId)!
    if (this.lineIndex < kid.lines.length) {
      this.dialogText.setText(kid.lines[this.lineIndex])
    } else {
      const { width, height } = this.scale
      this.dialogText.setText('')
      this.promptText.setVisible(false)
      this.add.text(width / 2, height * 0.62, `演奏"${kid.keyword}"`, {
        fontSize: px(26), color: '#ffffff',
        backgroundColor: '#7c3aed',
        padding: { x: Math.round(20 * DPR), y: Math.round(10 * DPR) },
        fontFamily: 'sans-serif',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.scene.start(SCENE_KEYS.RHYTHM, { chartKey: kid.id, kidId: this.kidId })
      })
    }
  }

  private advance(): void {
    const kid = KIDS.find(k => k.id === this.kidId)!
    if (this.lineIndex < kid.lines.length) {
      this.lineIndex++
      this.showLine()
    }
  }

  private handlePause = (): void => { this.scene.pause() }
  private handleResume = (): void => { this.scene.resume() }
}
