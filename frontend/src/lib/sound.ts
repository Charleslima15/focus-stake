// Tiny synthesized sound effects via Web Audio — no audio files to fetch or
// license, everything is generated on the fly. Muted state persists across
// visits; the AudioContext is created lazily and warmed up on the first
// user gesture (see primeAudio) so later programmatic playback — e.g. a
// blur event firing mid-session — isn't blocked by autoplay policy.

const MUTE_KEY = 'focus-stake:sfx-muted'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return null
    ctx = new AudioCtor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function primeAudio() {
  getCtx()
}

export function getMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // localStorage unavailable — mute preference just won't persist
  }
}

function envelope(context: AudioContext, startTime: number, attack: number, decay: number, peak: number) {
  const gain = context.createGain()
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(peak, startTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + decay)
  return gain
}

/** Low, percussive "stamp hitting paper" thud for a broken session. */
export function playBrokenThud() {
  if (getMuted()) return
  const context = getCtx()
  if (!context) return
  const now = context.currentTime

  const osc = context.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(160, now)
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.22)
  const oscGain = envelope(context, now, 0.004, 0.28, 0.5)
  osc.connect(oscGain).connect(context.destination)
  osc.start(now)
  osc.stop(now + 0.32)

  const bufferSize = Math.floor(context.sampleRate * 0.18)
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  const noise = context.createBufferSource()
  noise.buffer = buffer
  const noiseFilter = context.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 800
  const noiseGain = envelope(context, now, 0.001, 0.14, 0.22)
  noise.connect(noiseFilter).connect(noiseGain).connect(context.destination)
  noise.start(now)
  noise.stop(now + 0.2)
}

/** Bright two-note chime for a cleared session. */
export function playClearedChime() {
  if (getMuted()) return
  const context = getCtx()
  if (!context) return
  const now = context.currentTime
  const notes = [659.25, 880] // E5, A5

  notes.forEach((freq, i) => {
    const start = now + i * 0.1
    const osc = context.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const gain = envelope(context, start, 0.008, 0.24, 0.26)
    osc.connect(gain).connect(context.destination)
    osc.start(start)
    osc.stop(start + 0.3)
  })
}

/** Short, dry tick for the final-seconds countdown. */
export function playTick() {
  if (getMuted()) return
  const context = getCtx()
  if (!context) return
  const now = context.currentTime
  const osc = context.createOscillator()
  osc.type = 'square'
  osc.frequency.value = 1000
  const gain = envelope(context, now, 0.001, 0.05, 0.1)
  osc.connect(gain).connect(context.destination)
  osc.start(now)
  osc.stop(now + 0.06)
}
