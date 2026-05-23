import ensembleUrl from '../assets/midi/ensemble.mid?url'
import { GAME_CONFIG } from '../constants'
import type { KidData } from '../data/kids'

export interface NoteData {
  time: number
  lane: 0 | 1 | 2 | 3
  pitch: number
  chordPitches: number[]
}

export interface ChartData {
  bpm: number
  duration: number
  waveform: OscillatorType
  notes: NoteData[]
}

// 倒计时结束后留给玩家的预备时间（秒），第一个音符在此之后才开始落下
const START_OFFSET = GAME_CONFIG.RHYTHM.NOTE_FALL_TIME + 1.0

const chartRegistry = new Map<string, ChartData>()

// ── MIDI 解析 ───────────────────────────────────────────────────────────────

function readVlq(data: Uint8Array, pos: number): [number, number] {
  let val = 0
  while (true) {
    const b = data[pos++]
    val = (val << 7) | (b & 0x7f)
    if (!(b & 0x80)) break
  }
  return [val, pos]
}

interface RawNote {
  pitch: number
  startTick: number
}

interface ParseResult {
  tempoMicros: number
  division: number
  notes: RawNote[]
}

function parseMidiBytes(buffer: ArrayBuffer): ParseResult {
  const data = new Uint8Array(buffer)
  const view = new DataView(buffer)

  const division = view.getUint16(12, false)
  const nTracks = view.getUint16(10, false)

  let offset = 14
  let tempoMicros = 500_000
  const rawNotes: RawNote[] = []

  for (let t = 0; t < nTracks; t++) {
    if (offset + 8 > data.length) break
    const tLen = view.getUint32(offset + 4, false)
    const trackEnd = offset + 8 + tLen
    let pos = offset + 8
    let tick = 0
    let lastStatus = 0
    const active = new Map<number, number>() // (pitch<<4|ch) → startTick

    while (pos < trackEnd) {
      let delta: number
      ;[delta, pos] = readVlq(data, pos)
      tick += delta
      if (pos >= trackEnd) break

      let status = data[pos]

      if (status === 0xff) {
        pos++
        const mt = data[pos++]
        let ml: number
        ;[ml, pos] = readVlq(data, pos)
        if (mt === 0x51 && ml === 3) {
          tempoMicros = (data[pos] << 16) | (data[pos + 1] << 8) | data[pos + 2]
        }
        pos += ml
      } else if (status === 0xf0 || status === 0xf7) {
        pos++
        let sl: number
        ;[sl, pos] = readVlq(data, pos)
        pos += sl
      } else {
        if (status & 0x80) { lastStatus = status; pos++ }
        else status = lastStatus

        const type = (status >> 4) & 0xf
        const ch = status & 0xf

        if (type === 0x9) {
          const pitch = data[pos++]
          const vel = data[pos++]
          const key = (pitch << 4) | ch
          if (vel > 0) {
            active.set(key, tick)
          } else {
            const st = active.get(key)
            if (st !== undefined) { rawNotes.push({ pitch, startTick: st }); active.delete(key) }
          }
        } else if (type === 0x8) {
          const pitch = data[pos++]; pos++
          const key = (pitch << 4) | ch
          const st = active.get(key)
          if (st !== undefined) { rawNotes.push({ pitch, startTick: st }); active.delete(key) }
        } else if (type === 0xa || type === 0xb || type === 0xe) {
          pos += 2
        } else if (type === 0xc || type === 0xd) {
          pos++
        }
      }
    }

    offset = trackEnd
  }

  rawNotes.sort((a, b) => a.startTick - b.startTick)
  return { tempoMicros, division, notes: rawNotes }
}

// ── 音符 → Lane 分配 ────────────────────────────────────────────────────────

/** 单声部：按音高排名映射到 0-3 四轨，加起始偏移 */
function buildSingleVoice(notes: RawNote[], tps: number, bpm: number, waveform: OscillatorType): ChartData {
  const unique = [...new Set(notes.map(n => n.pitch))].sort((a, b) => a - b)
  const n = unique.length || 1
  const chartNotes: NoteData[] = notes.map(raw => {
    const rank = unique.indexOf(raw.pitch)
    const lane = Math.min(3, Math.floor((rank / n) * 4)) as 0 | 1 | 2 | 3
    return { time: raw.startTick / tps + START_OFFSET, lane, pitch: raw.pitch, chordPitches: [raw.pitch] }
  })
  const last = chartNotes.at(-1)
  return { bpm, duration: last ? last.time + 2 : 30, waveform, notes: chartNotes }
}

/**
 * 双声部（ensemble）声部分离：最大音程缺口法（largest-gap voice splitting）
 *
 * 对每个同时刻音符组，找相邻音之间最大的半音间距作为声部分界线：
 *   - 分界线以上（高音部）→ 右手 → lane 2/3
 *   - 分界线以下（低音部）→ 左手 → lane 0/1
 * 每手各取一个代表音符（右手取最高/旋律，左手取最低/根音）。
 * 单音符用上一次各手确认音高的最近邻原则归手。
 */
function buildEnsemble(notes: RawNote[], tps: number, bpm: number): ChartData {
  // 按起始 tick 分组
  const groups = new Map<number, RawNote[]>()
  for (const note of notes) {
    const g = groups.get(note.startTick) ?? []
    g.push(note)
    groups.set(note.startTick, g)
  }

  type VoiceNote = { tick: number; pitch: number; chordPitches: number[]; voice: 'left' | 'right' }
  const voiceNotes: VoiceNote[] = []

  // 追踪各手最近一次音高，用于单音归手判断
  let lastRight = 80
  let lastLeft = 55

  for (const [tick, group] of groups) {
    const asc = [...group].sort((a, b) => a.pitch - b.pitch)

    if (asc.length === 1) {
      // 单音：归入音高差更小的那只手
      const p = asc[0].pitch
      const voice = Math.abs(p - lastRight) <= Math.abs(p - lastLeft) ? 'right' : 'left'
      voiceNotes.push({ tick, pitch: p, chordPitches: [p], voice })
      if (voice === 'right') lastRight = p; else lastLeft = p
    } else {
      // 多音：找最大相邻音程缺口，缺口上方 = 右手，下方 = 左手
      let maxGap = 0
      let splitIdx = asc.length - 1
      for (let i = 0; i < asc.length - 1; i++) {
        const gap = asc[i + 1].pitch - asc[i].pitch
        if (gap > maxGap) { maxGap = gap; splitIdx = i }
      }
      const leftGroup  = asc.slice(0, splitIdx + 1)         // 低音部
      const rightGroup = asc.slice(splitIdx + 1)             // 高音部

      // 左手取最低音（根音）作为代表，但保留声部全部音高
      if (leftGroup.length > 0) {
        const p = leftGroup[0].pitch
        voiceNotes.push({ tick, pitch: p, chordPitches: leftGroup.map(n => n.pitch), voice: 'left' })
        lastLeft = p
      }
      // 右手取最高音（旋律）作为代表，但保留声部全部音高
      if (rightGroup.length > 0) {
        const p = rightGroup.at(-1)!.pitch
        voiceNotes.push({ tick, pitch: p, chordPitches: rightGroup.map(n => n.pitch), voice: 'right' })
        lastRight = p
      }
    }
  }

  // 各声部音高集合，用于声部内 lane 细分
  const rightPitches = [...new Set(voiceNotes.filter(n => n.voice === 'right').map(n => n.pitch))].sort((a, b) => a - b)
  const leftPitches  = [...new Set(voiceNotes.filter(n => n.voice === 'left').map(n => n.pitch))].sort((a, b) => a - b)

  function pitchToLane(pitch: number, voice: 'left' | 'right'): 0 | 1 | 2 | 3 {
    const set  = voice === 'right' ? rightPitches : leftPitches
    const rank = set.indexOf(pitch)
    const size = set.length || 1
    const base = voice === 'right' ? 2 : 0
    return (base + Math.min(1, Math.floor((rank / size) * 2))) as 0 | 1 | 2 | 3
  }

  const chartNotes: NoteData[] = voiceNotes.map(n => ({
    time: n.tick / tps + START_OFFSET,
    lane: pitchToLane(n.pitch, n.voice),
    pitch: n.pitch,
    chordPitches: n.chordPitches,
  }))

  chartNotes.sort((a, b) => a.time - b.time)
  const last = chartNotes.at(-1)
  return { bpm, duration: last ? last.time + 2 : 60, waveform: 'triangle', notes: chartNotes }
}

// ── 加载入口 ────────────────────────────────────────────────────────────────

async function loadChart(
  key: string,
  url: string,
  mode: 'single' | 'ensemble',
  waveform: OscillatorType = 'triangle',
): Promise<void> {
  const buffer = await (await fetch(url)).arrayBuffer()
  const { tempoMicros, division, notes } = parseMidiBytes(buffer)
  const tps = (1_000_000 / tempoMicros) * division
  const bpm = 60_000_000 / tempoMicros
  const chart = mode === 'single'
    ? buildSingleVoice(notes, tps, bpm, waveform)
    : buildEnsemble(notes, tps, bpm)
  chartRegistry.set(key, chart)
}

// ── 公开 API ────────────────────────────────────────────────────────────────

export function getChart(key: string): ChartData | undefined {
  return chartRegistry.get(key)
}

export function useCharts() {
  async function loadAllCharts(kids: Pick<KidData, 'id' | 'midiFile' | 'waveform'>[]): Promise<void> {
    await Promise.all([
      ...kids.map(kid => loadChart(kid.id, kid.midiFile, 'single', kid.waveform)),
      loadChart('ensemble', ensembleUrl, 'ensemble'),
    ])
  }

  return { loadAllCharts, getChart }
}
