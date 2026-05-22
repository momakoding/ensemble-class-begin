import midi1Url from '../assets/midi/1.mid?url'
import midi2Url from '../assets/midi/2.mid?url'
import midi3Url from '../assets/midi/3.mid?url'

export type KidId = 'huimi' | 'yali' | 'jiawen'

export interface KidData {
  id: KidId
  name: string
  emoji: string
  keyword: string
  lines: string[]
  midiFile: string
  waveform: OscillatorType
}

export const KIDS: KidData[] = [
  {
    id: 'huimi',
    name: '惠弥',
    emoji: '🧒',
    keyword: '雨后的操场',
    lines: [
      '老师，我昨天看到操场全是水洼。',
      '踩上去会有"啪嗒"的声音，一深一浅。',
      '我想把那个声音变成歌。',
    ],
    midiFile: midi1Url,
    waveform: 'triangle',
  },
  {
    id: 'yali',
    name: '雅莉',
    emoji: '🎒',
    keyword: '空椅子的下午',
    lines: [
      '老师，我喜欢放学后坐在教室里。',
      '四周很安静，椅子腿碰地板会发出轻轻的声音。',
      '那个时候感觉整个世界都是我一个人的。',
    ],
    midiFile: midi2Url,
    waveform: 'sine',
  },
  {
    id: 'jiawen',
    name: '嘉文',
    emoji: '😄',
    keyword: '追猫咪的早晨',
    lines: [
      '老师！今天早上我追了一只猫！',
      '它跑得超快，爪子踩地板"哒哒哒"的，',
      '我一步追两步，差点迟到，但我好高兴！',
    ],
    midiFile: midi3Url,
    waveform: 'square',
  },
]
