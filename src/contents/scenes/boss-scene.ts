import { SCENE_KEYS, GAME_CONFIG } from '../constants'
import { RhythmScene } from './rhythm-scene'
import type { RhythmSceneInitData } from './rhythm-scene'

export class BossScene extends RhythmScene {
  constructor() {
    super(SCENE_KEYS.BOSS)
  }

  init(_data: RhythmSceneInitData): void {
    super.init({ chartId: 'boss', kidId: 'huimi', isBoss: true })
  }

  protected getBossWaveform(defaultWaveform: OscillatorType, now: number, duration: number): OscillatorType {
    const waveforms = GAME_CONFIG.AUDIO.BOSS_WAVEFORMS
    const ratio = now / duration
    if (ratio < 1 / 3) return waveforms[0]
    if (ratio < 2 / 3) return waveforms[1]
    return waveforms[2]
  }
}
