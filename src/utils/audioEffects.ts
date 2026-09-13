// Web Audio API Synthesized Sound Effects for Hyper-Gamified UI
// Zero external assets required, pure browser-native audio synthesis

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

// Initialize or resume AudioContext safely upon user interaction
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('codeelevate_sound_enabled');
    if (stored !== null) {
      soundEnabled = stored === 'true';
    }
  }
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('codeelevate_sound_enabled', enabled ? 'true' : 'false');
  }
}

// 1. Soft high-tech click / tick sound on hover or node toggle
export function playTickSound(frequency = 640): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Graceful fallback
  }
}

// 2. Interactive Quest Node select / activation sci-fi ping
export function playQuestNodeSound(tier = 1): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const baseFreq = 440 + tier * 80;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

    osc2.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.19);
    osc2.stop(ctx.currentTime + 0.19);
  } catch {
    // Ignore error
  }
}

// 3. Celebratory Rank-up / Level-up chime arpeggio
export function playRankUpSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const startTime = ctx.currentTime + index * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, startTime + 0.2);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.09, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  } catch {
    // Ignore error
  }
}

// 4. Mission Accomplished / Test Success Harmonic Chord
export function playSuccessChime(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const chord = [440, 554.37, 659.25, 880]; // A Major chord
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    });
  } catch {
    // Ignore error
  }
}

/**
 * Celebratory multi-note brass/synth fanfare when an accolade or badge is unlocked
 */
export function playBadgeFanfareSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Ascending celebratory fanfare arpeggio: C5 -> E5 -> G5 -> C6 -> E6 -> G6 with shimmer
    const notes = [
      { f: 523.25, time: 0.0, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.08 },
      { f: 659.25, time: 0.12, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.09 },
      { f: 783.99, time: 0.24, dur: 0.22, type: 'triangle' as OscillatorType, vol: 0.1 },
      { f: 1046.5, time: 0.38, dur: 0.55, type: 'sine' as OscillatorType, vol: 0.12 },
      { f: 1318.51, time: 0.46, dur: 0.6, type: 'sine' as OscillatorType, vol: 0.11 },
      { f: 1567.98, time: 0.54, dur: 0.8, type: 'sine' as OscillatorType, vol: 0.13 }
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch {
    // Ignore error
  }
}

/**
 * Cheerful pop sound effect for particle explosions
 */
export function playConfettiPopSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Ignore error
  }
}
