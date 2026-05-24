let ctx: AudioContext | null = null

interface ActiveNode {
  osc: OscillatorNode
  gain: GainNode
}

const activeNodes = new Map<string, ActiveNode[]>()

export function releaseNotes(voice = 'default') {
  if (!ctx) return
  const nodes = activeNodes.get(voice)
  if (!nodes || nodes.length === 0) return
  const t = ctx.currentTime
  for (const { osc, gain } of nodes) {
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(0.05, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    osc.stop(t + 0.07)
  }
  activeNodes.set(voice, [])
}

export function playNote(midi: number, waveform: OscillatorType, duration = 0.45, voice = 'default') {
  if (!ctx) ctx = new AudioContext()
  const freq = 440 * Math.pow(2, (midi - 69) / 12)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = waveform
  osc.frequency.value = freq
  const t = ctx.currentTime
  gain.gain.setValueAtTime(0.25, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(t + duration + 0.01)
  const pool = activeNodes.get(voice) ?? []
  pool.push({ osc, gain })
  activeNodes.set(voice, pool)
}
