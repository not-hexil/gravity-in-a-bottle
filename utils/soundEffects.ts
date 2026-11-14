// Zero-dependency Web Audio API procedural sound synthesizer

let sharedCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
    return noiseBuffer;
  }
  const length = ctx.sampleRate * 1.0;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

// ---------------------------------------------------------------------------
// 1. UNIVERSAL MECHANICAL KEYBOARD SWITCH CLICK (Keys & Mobile D-Pad)
// ---------------------------------------------------------------------------

export function playMechKeyPress(isActionButton = false) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Tactile switch click transient (filtered noise burst)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isActionButton ? 2100 : 2600 + Math.random() * 350, now);
  filter.Q.setValueAtTime(3.2, now);

  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.001, now);
  clickGain.gain.linearRampToValueAtTime(isActionButton ? 0.14 : 0.1, now + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

  noise.connect(filter);
  filter.connect(clickGain);
  clickGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.025);

  // Housing "thock" body resonance
  const thockOsc = ctx.createOscillator();
  const thockGain = ctx.createGain();
  thockOsc.type = 'triangle';
  thockOsc.frequency.setValueAtTime(isActionButton ? 190 : 240 + Math.random() * 30, now);
  thockOsc.frequency.exponentialRampToValueAtTime(75, now + 0.028);

  thockGain.gain.setValueAtTime(0.07, now);
  thockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  thockOsc.connect(thockGain);
  thockGain.connect(ctx.destination);
  thockOsc.start(now);
  thockOsc.stop(now + 0.032);
}

export function playMechKeyRelease() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320 + Math.random() * 40, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.016);

  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.02);
}

// ---------------------------------------------------------------------------
// 2. SOLAR SYSTEM MAP SOUNDS
// ---------------------------------------------------------------------------

export function playRandomSpaceBeep() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const freqs = [330, 440, 523.25, 659.25, 783.99, 880];
  const baseFreq = freqs[Math.floor(Math.random() * freqs.length)];

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.09);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

export function playMissionLockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.055);

    gain.gain.setValueAtTime(0.09, now + i * 0.055);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.055 + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.055);
    osc.stop(now + i * 0.055 + 0.15);
  });
}

// ---------------------------------------------------------------------------
// 3. SHARED VICTORY / COMPLETION FANFARE
// ---------------------------------------------------------------------------

export function playMissionCompleteFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.09;
    const dur = idx === notes.length - 1 ? 0.45 : 0.16;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  });
}

// ---------------------------------------------------------------------------
// 4. HUYGENS LANDER (TITAN DESCENT) AUDIO
// ---------------------------------------------------------------------------

export function playThrusterBurst() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(950, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.075);
}

export function playParachuteDeploy() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Canopy inflation billow (filtered noise sweep)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
  filter.frequency.exponentialRampToValueAtTime(240, now + 0.42);

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.001, now);
  nGain.gain.linearRampToValueAtTime(0.22, now + 0.04);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.46);

  // Mortar deployment thump
  const osc = ctx.createOscillator();
  const oGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.22);

  oGain.gain.setValueAtTime(0.18, now);
  oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

  osc.connect(oGain);
  oGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

export function playAtmosphereBuffet() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}

export function playCrashExplosion() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(75, now + 0.55);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.26, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.6);
}

// ---------------------------------------------------------------------------
// 5. LUNOKHOD 1 (LUNAR ROVER) AUDIO
// ---------------------------------------------------------------------------

export function playWaypointPing() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);

  gain.gain.setValueAtTime(0.07, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

export function playRoverDrivePulse() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(68 + Math.random() * 8, now);

  gain.gain.setValueAtTime(0.025, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.065);
}

export function playProbeCollected(count: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const base = 440 + count * 65;
  [base, base * 1.25, base * 1.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    gain.gain.setValueAtTime(0.09, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.17);
  });
}

// ---------------------------------------------------------------------------
// 6. GALILEO PROBE (JUPITER PLUNGE) AUDIO
// ---------------------------------------------------------------------------

export function playTelemetryDataTick(progressPercent: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const freq = 620 + (progressPercent / 100) * 420;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.032, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function playLightningZap() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.24);

  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.27);
}

// ---------------------------------------------------------------------------
// 7. INGENUITY HELICOPTER (MARS FLIGHT) AUDIO
// ---------------------------------------------------------------------------

export function playRotorPulse() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(115, now);
  osc.frequency.exponentialRampToValueAtTime(165, now + 0.045);

  gain.gain.setValueAtTime(0.055, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

export function playWaypointScanChime(scanIndex: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [587.33, 739.99, 880];
  const base = notes[Math.min(scanIndex - 1, notes.length - 1)] || 660;

  [base, base * 1.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);

    gain.gain.setValueAtTime(0.1, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.21);
  });
}

export function playRockBump() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.11);

  gain.gain.setValueAtTime(0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}
