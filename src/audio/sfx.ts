// Procedural sound effects (Web Audio API) – no audio assets required.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let hum: { stop: () => void } | null = null;
let ringTimer: number | null = null;
let tickTimer: number | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, freqEnd?: number) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, vol: number, when = 0, lowpass = 4000) {
  const c = ac();
  if (!c || !master) return;
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = lowpass;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(c.currentTime + when);
}

export const sfx = {
  unlock() {
    ac();
  },
  setMuted(m: boolean) {
    muted = m;
    if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.6, ctx.currentTime, 0.02);
  },
  click() {
    tone(1800, 0.04, 'square', 0.08);
  },
  dial() {
    for (let i = 0; i < 6; i++) tone(900, 0.03, 'square', 0.06, i * 0.07);
  },
  paper() {
    noise(0.25, 0.25, 0, 3000);
    noise(0.15, 0.2, 0.18, 6000);
  },
  teletype() {
    for (let i = 0; i < 8; i++) tone(2200 + Math.random() * 600, 0.02, 'square', 0.05, i * 0.05);
  },
  stamp() {
    tone(110, 0.18, 'sine', 0.5, 0, 50);
    noise(0.08, 0.3, 0, 1200);
  },
  startHum() {
    const c = ac();
    if (!c || !master || hum) return;
    const o = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 50;
    o2.type = 'sine';
    o2.frequency.value = 15734; // CRT line whine, barely audible
    g.gain.value = 0.012;
    o.connect(g);
    o2.connect(g);
    g.connect(master);
    o.start();
    o2.start();
    hum = {
      stop: () => {
        o.stop();
        o2.stop();
      },
    };
  },
  startRing() {
    if (ringTimer !== null) return;
    const ring = () => {
      for (let i = 0; i < 8; i++) {
        tone(1400, 0.05, 'square', 0.12, i * 0.06);
        tone(1100, 0.05, 'square', 0.12, i * 0.06 + 0.03);
      }
    };
    ring();
    ringTimer = window.setInterval(ring, 2200);
  },
  stopRing() {
    if (ringTimer !== null) {
      window.clearInterval(ringTimer);
      ringTimer = null;
    }
  },
  startTicking() {
    if (tickTimer !== null) return;
    tickTimer = window.setInterval(() => tone(1500, 0.025, 'square', 0.04), 140);
  },
  stopTicking() {
    if (tickTimer !== null) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }
  },
  fanfare(good: boolean) {
    const notes = good ? [392, 523, 659, 784] : [330, 277, 220, 165];
    notes.forEach((n, i) => tone(n, 0.45, good ? 'triangle' : 'sawtooth', 0.15, i * 0.22));
  },
};
