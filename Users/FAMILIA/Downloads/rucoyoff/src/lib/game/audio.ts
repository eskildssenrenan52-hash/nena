// @ts-nocheck
// removed unused soundManager import

// Web Audio API-based sound engine
let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null
let sfxGain: GainNode | null = null
let ambienceGain: GainNode | null = null

export const AUDIO = {
  master: 0.7,
  music: 0.4,
  sfx: 0.8,
  ambience: 0.3,
} as const

function ensureCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      masterGain = ctx.createGain()
      masterGain.gain.value = AUDIO.master
      musicGain = ctx.createGain()
      musicGain.gain.value = AUDIO.music
      sfxGain = ctx.createGain()
      sfxGain.gain.value = AUDIO.sfx
      ambienceGain = ctx.createGain()
      ambienceGain.gain.value = AUDIO.ambience

      musicGain.connect(masterGain)
      sfxGain.connect(masterGain)
      ambienceGain.connect(masterGain)
      masterGain.connect(ctx.destination)
    } catch {
      return null
    }
  }
  return ctx
}

export function resumeAudio() {
  const c = ensureCtx()
  if (c?.state === 'suspended') c.resume()
}

// ─── SFX ───────────────────────────────────────────────────────────────────

function playTone(opts: {
  type?: OscillatorType
  freq: number | [number, number]
  duration: number
  attack?: number
  decay?: number
  gain?: number
  pan?: number
  vibrato?: { rate: number; depth: number }
  filter?: { type: BiquadFilterType; freq: number; Q?: number }
  noise?: boolean
  noiseGain?: number
  pitchBend?: number
  echo?: boolean
  echoDelay?: number
  echoDecay?: number
}) {
  const c = ensureCtx()
  if (!c || !sfxGain) return
  const t = c.currentTime

  const g = c.createGain()
  g.connect(sfxGain)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(opts.gain ?? 0.3, t + (opts.attack ?? 0.01))
  g.gain.exponentialRampToValueAtTime(0.001, t + opts.duration)

  if (opts.pan !== undefined && (c as any).createStereoPanner) {
    const pan = (c as any).createStereoPanner()
    pan.pan.value = opts.pan
    g.connect(pan)
    pan.connect(sfxGain)
    g.disconnect(sfxGain)
  }

  if (opts.filter) {
    const f = c.createBiquadFilter()
    f.type = opts.filter.type
    f.frequency.value = opts.filter.freq
    if (opts.filter.Q) f.Q.value = opts.filter.Q
    g.connect(f)
    f.connect(sfxGain)
    g.disconnect(sfxGain)
  }

  if (opts.noise) {
    const bufferSize = Math.ceil(c.sampleRate * opts.duration)
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const n = c.createBufferSource()
    n.buffer = buffer
    const ng = c.createGain()
    ng.gain.value = opts.noiseGain ?? 0.15
    n.connect(ng)
    ng.connect(sfxGain)
    n.start(t)
    n.stop(t + opts.duration)
  }

  if (opts.freq !== undefined) {
    const osc = c.createOscillator()
    osc.type = opts.type ?? 'sine'
    const isArr = Array.isArray(opts.freq)
    osc.frequency.setValueAtTime(isArr ? opts.freq[0] : opts.freq, t)
    if (isArr) osc.frequency.exponentialRampToValueAtTime(opts.freq[1], t + opts.duration)
    if (opts.pitchBend) osc.frequency.exponentialRampToValueAtTime(opts.freq * (1 + opts.pitchBend), t + opts.duration)

    if (opts.vibrato) {
      const lfo = c.createOscillator()
      lfo.frequency.value = opts.vibrato.rate
      const lfoGain = c.createGain()
      lfoGain.gain.value = opts.vibrato.depth
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start(t)
      lfo.stop(t + opts.duration)
    }

    osc.connect(g)
    g.connect(sfxGain)
    osc.start(t)
    osc.stop(t + opts.duration)
  }

  if (opts.echo) {
    const delay = c.createDelay()
    delay.delayTime.value = opts.echoDelay ?? 0.15
    const dg = c.createGain()
    dg.gain.value = opts.echoDecay ?? 0.3
    g.connect(delay)
    delay.connect(dg)
    dg.connect(sfxGain)
    dg.connect(delay)
  }
}

export function playSfx(name: string, intensity = 1) {
  switch (name) {
    case 'sword_hit':
      playTone({ type: 'sawtooth', freq: [800, 300], duration: 0.08, gain: 0.15 * intensity, attack: 0.005, noise: true, noiseGain: 0.08 * intensity })
      break
    case 'magic_cast':
      playTone({ type: 'sine', freq: [600, 1200], duration: 0.3, gain: 0.2 * intensity, vibrato: { rate: 12, depth: 30 } })
      break
    case 'fireball':
      playTone({ type: 'square', freq: [200, 80], duration: 0.4, gain: 0.18 * intensity, noise: true, noiseGain: 0.2 * intensity, filter: { type: 'lowpass', freq: 800 } })
      break
    case 'arrow_shoot':
      playTone({ type: 'sawtooth', freq: [1200, 400], duration: 0.15, gain: 0.1 * intensity, attack: 0.005 })
      break
    case 'enemy_hit':
      playTone({ type: 'square', freq: [150, 80], duration: 0.1, gain: 0.12 * intensity, noise: true, noiseGain: 0.05 * intensity })
      break
    case 'crit':
      playTone({ type: 'sawtooth', freq: [1000, 200], duration: 0.2, gain: 0.2 * intensity, vibrato: { rate: 20, depth: 50 } })
      break
    case 'level_up':
      playTone({ type: 'sine', freq: [440, 880], duration: 0.3, gain: 0.2 * intensity, echo: true, echoDelay: 0.2, echoDecay: 0.4 })
      setTimeout(() => playTone({ type: 'sine', freq: [554, 1108], duration: 0.3, gain: 0.2 * intensity, echo: true, echoDelay: 0.2, echoDecay: 0.4 }), 150)
      setTimeout(() => playTone({ type: 'sine', freq: [659, 1318], duration: 0.5, gain: 0.25 * intensity, echo: true, echoDelay: 0.2, echoDecay: 0.4 }), 300)
      break
    case 'item_drop':
      playTone({ type: 'sine', freq: [800, 1200], duration: 0.15, gain: 0.1 * intensity })
      break
    case 'heal':
      playTone({ type: 'sine', freq: [300, 600], duration: 0.3, gain: 0.15 * intensity, vibrato: { rate: 8, depth: 20 } })
      break
    case 'death':
      playTone({ type: 'sawtooth', freq: [300, 60], duration: 0.6, gain: 0.2 * intensity, noise: true, noiseGain: 0.15 * intensity, filter: { type: 'lowpass', freq: 400 } })
      break
    case 'step':
      playTone({ type: 'triangle', freq: 80, duration: 0.05, gain: 0.03 * intensity, noise: true, noiseGain: 0.02 * intensity })
      break
    case 'dash':
      playTone({ type: 'sawtooth', freq: [500, 1200], duration: 0.2, gain: 0.15 * intensity, pitchBend: -0.3 })
      break
    case 'explosion':
      playTone({ type: 'square', freq: [150, 40], duration: 0.5, gain: 0.2 * intensity, noise: true, noiseGain: 0.3 * intensity, filter: { type: 'lowpass', freq: 600 } })
      break
    case 'summon':
      playTone({ type: 'sine', freq: [200, 80], duration: 0.5, gain: 0.15 * intensity, vibrato: { rate: 4, depth: 40 } })
      break
    case 'ui_click':
      playTone({ type: 'sine', freq: 1000, duration: 0.05, gain: 0.05 * intensity })
      break
    case 'ui_hover':
      playTone({ type: 'sine', freq: 600, duration: 0.03, gain: 0.03 * intensity })
      break
    case 'quest_complete':
      playTone({ type: 'sine', freq: [523, 784], duration: 0.3, gain: 0.2 * intensity, echo: true, echoDelay: 0.2, echoDecay: 0.3 })
      setTimeout(() => playTone({ type: 'sine', freq: [659, 1047], duration: 0.4, gain: 0.2 * intensity, echo: true, echoDelay: 0.2, echoDecay: 0.3 }), 200)
      break
    case 'boss_alert':
      playTone({ type: 'sawtooth', freq: [200, 60], duration: 1.0, gain: 0.3 * intensity, vibrato: { rate: 8, depth: 80 } })
      break
  }
}

// ─── Ambience ─────────────────────────────────────────────────────────────

let ambienceNode: OscillatorNode | null = null
let ambienceNoise: AudioBufferSourceNode | null = null

export function setAmbience(type: string) {
  const c = ensureCtx()
  if (!c || !ambienceGain) return

  // Stop existing
  if (ambienceNode) { try { ambienceNode.stop() } catch {} ambienceNode = null }
  if (ambienceNoise) { try { ambienceNoise.stop() } catch {} ambienceNoise = null }

  if (type === 'none') return

  const t = c.currentTime

  if (type === 'forest') {
    // Wind-like noise
    const bufferSize = c.sampleRate * 2
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.05
    ambienceNoise = c.createBufferSource()
    ambienceNoise.buffer = buffer
    ambienceNoise.loop = true
    const ng = c.createGain()
    ng.gain.value = 0.06
    ambienceNoise.connect(ng)
    ng.connect(ambienceGain)
    ambienceNoise.start(t)
  } else if (type === 'dungeon') {
    // Deep drone
    ambienceNode = c.createOscillator()
    ambienceNode.type = 'sine'
    ambienceNode.frequency.value = 60
    const g = c.createGain()
    g.gain.value = 0.04
    ambienceNode.connect(g)
    g.connect(ambienceGain)
    ambienceNode.start(t)
  } else if (type === 'city') {
    // Gentle hum
    ambienceNode = c.createOscillator()
    ambienceNode.type = 'triangle'
    ambienceNode.frequency.value = 150
    const g = c.createGain()
    g.gain.value = 0.03
    ambienceNode.connect(g)
    g.connect(ambienceGain)
    ambienceNode.start(t)
  } else if (type === 'volcano') {
    // Rumble
    const bufferSize = c.sampleRate * 2
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.1
    ambienceNoise = c.createBufferSource()
    ambienceNoise.buffer = buffer
    ambienceNoise.loop = true
    const f = c.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 200
    const ng = c.createGain()
    ng.gain.value = 0.08
    ambienceNoise.connect(f)
    f.connect(ng)
    ng.connect(ambienceGain)
    ambienceNoise.start(t)
  }
}

// ─── Music (procedural) ───────────────────────────────────────────────────

let musicNodes: OscillatorNode[] = []
let musicTimer: number | null = null

const THEME_PROGRESSIONS: Record<string, number[][]> = {
  title: [
    [262, 330, 392, 523], [262, 330, 392, 523], [196, 262, 330, 392], [196, 262, 330, 392],
    [220, 262, 330, 440], [220, 262, 330, 440], [174, 220, 262, 330], [174, 220, 262, 330],
  ],
  battle: [
    [330, 392, 494, 587], [330, 392, 494, 587], [262, 330, 392, 494], [262, 330, 392, 494],
    [294, 349, 440, 587], [294, 349, 440, 587], [220, 294, 349, 440], [220, 294, 349, 440],
  ],
  boss: [
    [196, 262, 311, 392], [196, 262, 311, 392], [147, 196, 262, 311], [147, 196, 262, 311],
    [165, 220, 262, 349], [165, 220, 262, 349], [131, 165, 220, 262], [131, 165, 220, 262],
  ],
}

function playChord(chord: number[], duration: number, gain: number) {
  const c = ensureCtx()
  if (!c || !musicGain) return
  const t = c.currentTime
  chord.forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = i === 0 ? 'triangle' : 'sine'
    osc.frequency.value = freq
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain * (i === 0 ? 0.5 : 0.3), t + 0.1)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.connect(g)
    g.connect(musicGain)
    osc.start(t)
    osc.stop(t + duration)
    musicNodes.push(osc)
  })
}

export function playMusic(theme: string) {
  stopMusic()
  const progression = THEME_PROGRESSIONS[theme]
  if (!progression) return

  let beat = 0
  const playBeat = () => {
    const chord = progression[beat % progression.length]
    playChord(chord, 0.8, 0.04)
    beat++
  }
  playBeat()
  musicTimer = window.setInterval(playBeat, 800)
}

export function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null }
  musicNodes.forEach(n => { try { n.stop() } catch {} })
  musicNodes = []
}

export function playBossMusic() {
  playMusic('boss')
}
