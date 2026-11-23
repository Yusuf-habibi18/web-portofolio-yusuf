/**
 * Generative "cyber ambient" soundtrack + tiny UI sounds, made with the Web Audio
 * API (no audio files, nothing licensed). Always on: it tries to start as the page
 * opens, and if the browser blocks audio until a gesture (most do), it starts on
 * the visitor's first click / tap / key press.
 *
 * Music: slow detuned-saw pad through a breathing low-pass + reverb, a soft sub,
 * and sparse sine "data" plucks with a feedback delay, over a faint air layer.
 */

const MUSIC_LEVEL = 0.2;
const SFX_LEVEL = 0.32;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** D minor-ish progression: Dm9 → Bbmaj7 → Fadd9 → C6/9 (MIDI notes). */
const CHORDS = [
  [50, 57, 60, 64, 65],
  [46, 53, 57, 62, 65],
  [41, 53, 60, 64, 67],
  [48, 55, 62, 64, 69],
];
/** D minor pentatonic for the plucks. */
const PLUCKS = [62, 65, 67, 69, 72, 74, 77, 79];
const CHORD_SECONDS = 8;

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  pad: AudioNode;
  pluckBus: AudioNode;
  sfx: GainNode;
};

let engine: Engine | null = null;
let on = false;
let timers: number[] = [];
let chordIndex = 0;
const subscribers = new Set<(v: boolean) => void>();

function impulse(ctx: AudioContext, seconds = 3.8, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function build(): Engine {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  master.connect(comp).connect(ctx.destination);

  const music = ctx.createGain();
  music.gain.value = MUSIC_LEVEL;
  music.connect(master);

  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  reverb.connect(wet).connect(music);

  // Pad bus: low-pass that slowly "breathes"
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 850;
  lp.Q.value = 0.8;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 450;
  lfo.connect(lfoDepth).connect(lp.frequency);
  lfo.start();
  const dry = ctx.createGain();
  dry.gain.value = 0.55;
  lp.connect(dry).connect(music);
  lp.connect(reverb);

  // Pluck bus: feedback delay into the reverb
  const pluckBus = ctx.createGain();
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.42;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.36;
  const dlp = ctx.createBiquadFilter();
  dlp.type = 'lowpass';
  dlp.frequency.value = 2600;
  pluckBus.connect(music);
  pluckBus.connect(delay);
  delay.connect(dlp).connect(feedback).connect(delay);
  dlp.connect(reverb);
  dlp.connect(music);

  // Air: very quiet band-passed noise
  const noise = ctx.createBufferSource();
  const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  noise.buffer = nb;
  noise.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3200;
  bp.Q.value = 0.5;
  const air = ctx.createGain();
  air.gain.value = 0.01;
  noise.connect(bp).connect(air).connect(music);
  noise.start();

  const sfx = ctx.createGain();
  sfx.gain.value = SFX_LEVEL;
  sfx.connect(master);

  return { ctx, master, pad: lp, pluckBus, sfx };
}

function playChord(e: Engine, notes: number[], t0: number, dur: number) {
  const { ctx } = e;
  const attack = 2.6;
  const release = 3.2;
  notes.forEach((m, i) => {
    [-7, 7].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = mtof(m);
      o.detune.value = cents;
      const g = ctx.createGain();
      const peak = i === 0 ? 0.05 : 0.032;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + attack);
      g.gain.setValueAtTime(peak, t0 + dur - release);
      g.gain.linearRampToValueAtTime(0, t0 + dur);
      o.connect(g).connect(e.pad);
      o.start(t0);
      o.stop(t0 + dur + 0.1);
    });
  });
  // soft sub on the root
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = mtof(notes[0] - 12);
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0, t0);
  sg.gain.linearRampToValueAtTime(0.09, t0 + attack);
  sg.gain.setValueAtTime(0.09, t0 + dur - release);
  sg.gain.linearRampToValueAtTime(0, t0 + dur);
  sub.connect(sg).connect(e.pad);
  sub.start(t0);
  sub.stop(t0 + dur + 0.1);
}

function pluck(e: Engine) {
  const { ctx } = e;
  const t = ctx.currentTime + 0.02;
  const o = ctx.createOscillator();
  o.type = Math.random() < 0.5 ? 'sine' : 'triangle';
  o.frequency.value = mtof(PLUCKS[(Math.random() * PLUCKS.length) | 0]);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.055, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  o.connect(g).connect(e.pluckBus);
  o.start(t);
  o.stop(t + 1.2);
}

function startMusic(e: Engine) {
  const loopChord = () => {
    playChord(e, CHORDS[chordIndex % CHORDS.length], e.ctx.currentTime + 0.05, CHORD_SECONDS + 3);
    chordIndex++;
  };
  loopChord();
  timers.push(window.setInterval(loopChord, CHORD_SECONDS * 1000));
  const loopPluck = () => {
    if (Math.random() < 0.72) pluck(e);
    timers.push(window.setTimeout(loopPluck, 900 + Math.random() * 1900));
  };
  timers.push(window.setTimeout(loopPluck, 1600));
}

function stopMusic() {
  timers.forEach((t) => {
    window.clearInterval(t);
    window.clearTimeout(t);
  });
  timers = [];
}

function emit() {
  subscribers.forEach((fn) => fn(on));
}

/** Short rising "power on" chord used when sound is switched on. */
function chime(e: Engine) {
  const t = e.ctx.currentTime + 0.03;
  [74, 81, 86].forEach((m, i) => {
    const o = e.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = mtof(m);
    const g = e.ctx.createGain();
    const s = t + i * 0.07;
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(0.07, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
    o.connect(g).connect(e.sfx);
    o.start(s);
    o.stop(s + 0.6);
  });
}

export const sound = {
  isOn: () => on,

  /**
   * Try to start without a gesture. Resolves true if the browser allowed it
   * (audio actually running), false if it is still blocked.
   */
  async tryAutostart(): Promise<boolean> {
    if (on) return true;
    engine ??= build();
    const e = engine;
    try {
      await Promise.race([e.ctx.resume(), new Promise((r) => window.setTimeout(r, 400))]);
    } catch {
      /* blocked */
    }
    if (e.ctx.state !== 'running') return false;
    await this.setOn(true);
    return true;
  },

  subscribe(fn: (v: boolean) => void) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  },

  async setOn(v: boolean) {
    if (v === on) return;
    on = v;
    emit();
    if (v) {
      engine ??= build();
      const e = engine;
      await e.ctx.resume();
      const t = e.ctx.currentTime;
      e.master.gain.cancelScheduledValues(t);
      e.master.gain.setValueAtTime(e.master.gain.value, t);
      e.master.gain.linearRampToValueAtTime(1, t + 1.8);
      chime(e);
      startMusic(e);
    } else if (engine) {
      const e = engine;
      const t = e.ctx.currentTime;
      e.master.gain.cancelScheduledValues(t);
      e.master.gain.setValueAtTime(e.master.gain.value, t);
      e.master.gain.linearRampToValueAtTime(0, t + 0.6);
      stopMusic();
      window.setTimeout(() => {
        if (!on) e.ctx.suspend();
      }, 700);
    }
  },

  /** Tiny rising blip for hovering interactive elements. */
  blip() {
    if (!on || !engine) return;
    const { ctx, sfx } = engine;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(1500, t);
    o.frequency.exponentialRampToValueAtTime(2300, t + 0.045);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(g).connect(sfx);
    o.start(t);
    o.stop(t + 0.1);
  },

  /** Short digital click for presses. */
  click() {
    if (!on || !engine) return;
    const { ctx, sfx } = engine;
    const t = ctx.currentTime;
    [660, 990].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = f;
      const g = ctx.createGain();
      const s = t + i * 0.045;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.08, s + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.07);
      o.connect(g).connect(sfx);
      o.start(s);
      o.stop(s + 0.09);
    });
  },
};
