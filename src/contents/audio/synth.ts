let ctx: AudioContext | null = null

export function playNote(midi: number, waveform: OscillatorType, duration = 0.45) {
  if (!ctx) ctx = new AudioContext()
  const freq = 440 * Math.pow(2, (midi - 69) / 12)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = waveform
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}
