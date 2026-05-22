import * as Phaser from 'phaser'
import { SCENE_KEYS, ASSET_KEYS, EVENT_KEYS } from '../constants'
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

    this.add.image(width / 2, height / 2, ASSET_KEYS.CLASSROOM_BG)

    this.add.image(width / 2, height * 0.28, ASSET_KEYS.KID_AVATAR).setScale(1.4)
    this.add.text(width / 2, height * 0.28, kid.emoji, { fontSize: '64px' }).setOrigin(0.5)
    this.add.text(width / 2, height * 0.28 + 80, kid.name, {
      fontSize: '24px', color: '#e0c890', fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    const boxY = height * 0.62
    const boxW = width * 0.72
    const boxH = 130
    const boxX = width / 2

    const box = this.add.graphics()
    box.fillStyle(0x000000, 0.75)
    box.fillRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 12)
    box.lineStyle(2, 0x9966ff, 0.8)
    box.strokeRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 12)
    void box

    this.dialogText = this.add.text(boxX, boxY, '', {
      fontSize: '22px', color: '#f0f0f0', fontFamily: 'sans-serif',
      wordWrap: { width: boxW - 40 }, align: 'center',
    }).setOrigin(0.5)

    this.promptText = this.add.text(boxX + boxW / 2 - 20, boxY + boxH / 2 - 16, '▶', {
      fontSize: '16px', color: '#9966ff',
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
        fontSize: '26px', color: '#ffffff',
        backgroundColor: '#7c3aed',
        padding: { x: 20, y: 10 },
        fontFamily: 'sans-serif',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.scene.start(SCENE_KEYS.RHYTHM, { chartId: kid.chartId, kidId: this.kidId })
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
