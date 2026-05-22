import * as Phaser from 'phaser'
import { SCENE_KEYS, ASSET_KEYS } from '../constants'
import { DPR } from '@/engine'
import classroomImgUrl from '../assets/img/classroom.png'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT })
  }

  preload(): void {
    // 教室背景图片
    this.load.image(ASSET_KEYS.CLASSROOM_BG, classroomImgUrl)
  }

  create(): void {
    const nW = Math.round(80 * DPR)
    const nH = Math.round(24 * DPR)
    const nR = Math.round(6 * DPR)

    // 音符：四条轨道颜色
    const noteColors = [0xFFB86B, 0xFF7AB6, 0x7D3FFC, 0xA78BFA]
    const noteKeys = [ASSET_KEYS.NOTE_LANE_0, ASSET_KEYS.NOTE_LANE_1, ASSET_KEYS.NOTE_LANE_2, ASSET_KEYS.NOTE_LANE_3]
    for (let i = 0; i < 4; i++) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(noteColors[i], 1)
      g.fillRoundedRect(0, 0, nW, nH, nR)
      g.generateTexture(noteKeys[i], nW, nH)
      g.destroy()
    }

    // 判定线
    const jW = Math.round(360 * DPR)
    const jH = Math.round(4 * DPR)
    const judgeGfx = this.make.graphics({ x: 0, y: 0 })
    judgeGfx.fillStyle(0xFFFFFF, 1)
    judgeGfx.fillRect(0, 0, jW, jH)
    judgeGfx.generateTexture(ASSET_KEYS.JUDGE_LINE, jW, jH)
    judgeGfx.destroy()

    // 学生/老师头像底（圆形）
    const aR = Math.round(48 * DPR)
    const aS = aR * 2
    const kidGfx = this.make.graphics({ x: 0, y: 0 })
    kidGfx.fillStyle(0xF5DEB3, 1)
    kidGfx.fillCircle(aR, aR, aR)
    kidGfx.generateTexture(ASSET_KEYS.KID_AVATAR, aS, aS)
    kidGfx.destroy()

    const teacherGfx = this.make.graphics({ x: 0, y: 0 })
    teacherGfx.fillStyle(0xC9B6FF, 1)
    teacherGfx.fillCircle(aR, aR, aR)
    teacherGfx.generateTexture(ASSET_KEYS.TEACHER_AVATAR, aS, aS)
    teacherGfx.destroy()

    this.scene.start(SCENE_KEYS.CLASSROOM)
  }
}
