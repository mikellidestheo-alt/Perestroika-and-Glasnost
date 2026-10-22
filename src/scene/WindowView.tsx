import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PointLight } from 'three';
import { useGame } from '../game/store';
import { SKIP_MS, WINDOW_STATES, type WindowState } from './windowStates';

const W = 768;
const H = 544;
const HORIZON = Math.round(H * 0.64);

// ---------- tiny colour helpers ----------
type RGB = [number, number, number];
const hex = (c: string): RGB => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- static scenery (seeded once) ----------
const r = rng(1985);
const STARS = Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * HORIZON * 0.8, s: 0.6 + r() * 1.2 }));
const CLOUDS = Array.from({ length: 9 }, () => ({ x: r() * W, y: 20 + r() * HORIZON * 0.55, w: 90 + r() * 120, speed: 4 + r() * 8 }));
const BUILDINGS = (() => {
  const list: { x: number; w: number; h: number; win: number }[] = [];
  let x = -10;
  while (x < W) {
    const w = 18 + r() * 20;
    list.push({ x, w, h: 28 + r() * 70, win: Math.floor(r() * 3) });
    x += w + 1;
  }
  return list;
})();
const TREES = Array.from({ length: 26 }, (_, i) => ({ x: 12 + i * 30 + r() * 14, s: 12 + r() * 10, seed: r() }));
const RAIN = Array.from({ length: 160 }, () => ({ x: r() * W, y: r() * H }));
const FLAKES = Array.from({ length: 220 }, () => ({ x: r() * W, y: r() * H, s: 1 + r() * 1.6, p: r() * 6 }));

const C = {
  nightTop: hex('#050914'),
  nightHor: hex('#16213a'),
  dayTop: hex('#5f9bd6'),
  dayHor: hex('#bfdcf0'),
  ovTop: hex('#8d97a3'),
  ovHor: hex('#b9c0c8'),
  duskTop: hex('#3b3560'),
  duskHor: hex('#ff9150'),
};

function drawWindow(ctx: CanvasRenderingContext2D, st: WindowState, drift: number) {
  const tod = ((st.tod % 1) + 1) % 1;
  const sunH = Math.sin((tod - 0.25) * Math.PI * 2);
  const day = clamp01(sunH * 2 + 0.5);
  const dusk = clamp01(1 - Math.abs(sunH) * 3.5) * (1 - st.cloud * 0.4);

  // sky
  const dayTop = mixRGB(C.dayTop, C.ovTop, st.cloud * 0.9);
  const dayHor = mixRGB(C.dayHor, C.ovHor, st.cloud * 0.9);
  let top = mixRGB(C.nightTop, dayTop, day);
  let hor = mixRGB(C.nightHor, dayHor, day);
  top = mixRGB(top, C.duskTop, dusk * 0.7);
  hor = mixRGB(hor, C.duskHor, dusk * 0.9);
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
  g.addColorStop(0, css(top));
  g.addColorStop(1, css(hor));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // stars
  const starA = (1 - day) * (1 - st.cloud * 0.9);
  if (starA > 0.05) {
    ctx.fillStyle = `rgba(255,255,240,${starA})`;
    for (const s of STARS) ctx.fillRect(s.x, s.y, s.s, s.s);
  }

  // sun / moon
  const arcT = clamp01((tod - 0.25) / 0.5);
  if (sunH > -0.15) {
    const sx = W * (0.12 + 0.76 * arcT);
    const sy = HORIZON - (Math.max(sunH, 0) * 0.85 + 0.04) * HORIZON * 0.9;
    const a = (1 - st.cloud * 0.8) * clamp01(sunH * 3 + 0.5);
    const glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, 90);
    glow.addColorStop(0, `rgba(255,${dusk > 0.3 ? 170 : 235},${dusk > 0.3 ? 90 : 170},${0.9 * a})`);
    glow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - 100, sy - 100, 200, 200);
    ctx.fillStyle = `rgba(255,246,214,${a})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  if (sunH < 0.05) {
    const mt = clamp01((((tod + 0.5) % 1) - 0.25) / 0.5);
    const mx = W * (0.12 + 0.76 * mt);
    const my = HORIZON - (Math.max(-sunH, 0) * 0.8 + 0.05) * HORIZON * 0.8;
    ctx.fillStyle = `rgba(235,238,250,${(1 - st.cloud * 0.85) * clamp01(-sunH * 3 + 0.3)})`;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // clouds
  if (st.cloud > 0.03) {
    const cc = mixRGB(mixRGB(hex('#2a3040'), hex('#d4d8de'), day), hex('#d98a68'), dusk * 0.5);
    for (const c of CLOUDS) {
      const x = ((c.x + drift * c.speed) % (W + 300)) - 150;
      ctx.fillStyle = css(cc, 0.25 + st.cloud * 0.6);
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.ellipse(x + k * c.w * 0.28, c.y + (k % 2) * 6, c.w * 0.32, 16 + st.cloud * 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // far city
  const bCol = mixRGB(hex('#0e1626'), hex('#7b8696'), day);
  const night = 1 - day;
  for (const b of BUILDINGS) {
    ctx.fillStyle = css(mixRGB(bCol, hex('#d34a14'), dusk * 0.12));
    ctx.fillRect(b.x, HORIZON - b.h, b.w, b.h);
    if (st.snow > 0.05) {
      ctx.fillStyle = `rgba(240,244,250,${st.snow * 0.9})`;
      ctx.fillRect(b.x, HORIZON - b.h, b.w, 3);
    }
    if (night > 0.2 || dusk > 0.3) {
      ctx.fillStyle = `rgba(255,214,120,${clamp01(night * 0.9 + dusk * 0.3)})`;
      for (let wy = HORIZON - b.h + 8; wy < HORIZON - 8; wy += 12)
        for (let wx = b.x + 4; wx < b.x + b.w - 4; wx += 8) if (((wx * 7 + wy * 3) | 0) % 5 > b.win) ctx.fillRect(wx, wy, 3, 4);
    }
  }

  // St Basil's domes
  const bx = W * 0.8;
  const domeCols = ['#b3261e', '#2e7d32', '#e6b422', '#1f5fa8', '#b3261e'];
  const bodyCol = mixRGB(hex('#3b2a26'), hex('#b78a6a'), day);
  ctx.fillStyle = css(bodyCol);
  ctx.fillRect(bx - 38, HORIZON - 46, 76, 46);
  [-26, -13, 0, 13, 26].forEach((dx, i) => {
    const hh = 52 + (i === 2 ? 36 : (i % 2) * 8);
    ctx.fillStyle = css(bodyCol);
    ctx.fillRect(bx + dx - 5, HORIZON - hh, 10, hh - 40);
    ctx.fillStyle = css(mixRGB(hex(domeCols[i]), hex('#000000'), night * 0.5));
    ctx.beginPath();
    ctx.ellipse(bx + dx, HORIZON - hh, 9, 13, 0, Math.PI, 0);
    ctx.ellipse(bx + dx, HORIZON - hh, 9, 13, 0, 0, Math.PI);
    ctx.fill();
    if (st.snow > 0.1) {
      ctx.fillStyle = `rgba(245,248,252,${st.snow * 0.85})`;
      ctx.beginPath();
      ctx.ellipse(bx + dx, HORIZON - hh - 4, 7, 6, 0, Math.PI, 0);
      ctx.fill();
    }
  });

  // Kremlin wall + Spasskaya tower
  const wallCol = mixRGB(hex('#3a1713'), hex('#9a4334'), day);
  ctx.fillStyle = css(wallCol);
  ctx.fillRect(0, HORIZON - 30, W, 30);
  for (let x = 0; x < W; x += 14) ctx.fillRect(x, HORIZON - 37, 9, 7);
  if (st.snow > 0.05) {
    ctx.fillStyle = `rgba(245,248,252,${st.snow * 0.9})`;
    for (let x = 0; x < W; x += 14) ctx.fillRect(x, HORIZON - 37, 9, 2);
  }
  const tx = W * 0.42;
  ctx.fillStyle = css(wallCol);
  ctx.fillRect(tx - 24, HORIZON - 150, 48, 150);
  ctx.fillRect(tx - 18, HORIZON - 190, 36, 40);
  ctx.fillStyle = css(mixRGB(hex('#1a2a22'), hex('#2f6b4a'), day));
  ctx.beginPath();
  ctx.moveTo(tx - 20, HORIZON - 190);
  ctx.lineTo(tx, HORIZON - 250);
  ctx.lineTo(tx + 20, HORIZON - 190);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(mixRGB(hex('#d8d2c0'), hex('#f4efe0'), day));
  ctx.beginPath();
  ctx.arc(tx, HORIZON - 120, 12, 0, Math.PI * 2);
  ctx.fill();
  // star
  const starGlow = ctx.createRadialGradient(tx, HORIZON - 256, 1, tx, HORIZON - 256, 28);
  starGlow.addColorStop(0, `rgba(255,50,40,${0.55 + night * 0.4})`);
  starGlow.addColorStop(1, 'rgba(255,50,40,0)');
  ctx.fillStyle = starGlow;
  ctx.fillRect(tx - 30, HORIZON - 286, 60, 60);
  ctx.fillStyle = '#e0231c';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? 4 : 9;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(tx + Math.cos(ang) * rad, HORIZON - 256 + Math.sin(ang) * rad);
  }
  ctx.closePath();
  ctx.fill();

  // flag on the Senate dome
  const fx = W * 0.2;
  ctx.fillStyle = css(wallCol);
  ctx.fillRect(fx - 20, HORIZON - 70, 40, 40);
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(fx - 1, HORIZON - 120, 2, 52);
  const wave = Math.sin(drift * 3) * 2;
  if (st.tricolor > 0.5) {
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(fx + 1, HORIZON - 120, 28, 6 + wave * 0.2);
    ctx.fillStyle = '#1f4fa8';
    ctx.fillRect(fx + 1, HORIZON - 114, 28, 6);
    ctx.fillStyle = '#d52b1e';
    ctx.fillRect(fx + 1, HORIZON - 108, 28, 6 - wave * 0.2);
  } else {
    ctx.fillStyle = '#c8191a';
    ctx.fillRect(fx + 1, HORIZON - 120, 28, 18 + wave * 0.3);
  }

  // ground
  const gCol = mixRGB(hex('#2d2b2a'), hex('#6a6560'), day);
  ctx.fillStyle = css(gCol);
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  if (st.snow > 0.02) {
    ctx.fillStyle = `rgba(${236 - night * 70 | 0},${240 - night * 62 | 0},${248 - night * 40 | 0},${st.snow * 0.92})`;
    ctx.fillRect(0, HORIZON, W, H - HORIZON);
  }

  // trees along the embankment
  for (const t of TREES) {
    const y = HORIZON + 18 + t.seed * 70;
    ctx.strokeStyle = css(mixRGB(hex('#1a120c'), hex('#5a4634'), day));
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(t.x, y + t.s * 1.4);
    ctx.lineTo(t.x, y);
    ctx.stroke();
    const leaf = mixRGB(hex('#2a3a22'), hex('#4a8a3a'), day);
    const bare = mixRGB(hex('#1a120c'), hex('#5a4634'), day);
    if (st.foliage > 0.1) {
      ctx.fillStyle = css(mixRGB(bare, leaf, st.foliage), 0.35 + st.foliage * 0.6);
      ctx.beginPath();
      ctx.arc(t.x, y - 2, t.s * (0.5 + st.foliage * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    if (st.foliage < 0.8) {
      ctx.strokeStyle = css(bare, 1 - st.foliage);
      ctx.lineWidth = 1.5;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(t.x, y);
        ctx.lineTo(t.x + k * t.s * 0.45, y - t.s * (1.1 - Math.abs(k) * 0.2));
        ctx.stroke();
      }
    }
  }

  // precipitation
  if (st.rain > 0.02) {
    ctx.strokeStyle = `rgba(210,222,238,${0.25 + st.rain * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const n = Math.round(RAIN.length * st.rain);
    for (let i = 0; i < n; i++) {
      const p = RAIN[i];
      const y = (p.y + drift * 420) % H;
      ctx.moveTo(p.x - y * 0.1, y);
      ctx.lineTo(p.x - y * 0.1 - 3, y + 14);
    }
    ctx.stroke();
    ctx.fillStyle = `rgba(18,26,38,${st.rain * 0.16})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (st.snowfall > 0.02) {
    ctx.fillStyle = `rgba(250,252,255,${0.7 + 0.2 * st.snowfall})`;
    const n = Math.round(FLAKES.length * st.snowfall);
    for (let i = 0; i < n; i++) {
      const f = FLAKES[i];
      const x = (f.x + Math.sin(drift * 2 + f.p) * 14 + W) % W;
      const y = (f.y + drift * 55 * f.s) % H;
      ctx.beginPath();
      ctx.arc(x, y, f.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const smoothTod = (cur: number, target: number, k: number) => {
  const diff = ((((target - cur) % 1) + 1.5) % 1) - 0.5;
  return cur + diff * k;
};

/** Window behind the desk: weather, season and time of day follow the story, with a time-lapse on every skip. */
export function WindowView() {
  const stage = useGame((s) => s.stage);
  const flow = useGame((s) => s.flow);
  const targetIdx = Math.min(flow === 'idle' ? stage : stage + 1, WINDOW_STATES.length - 1);

  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { canvas, texture };
  }, []);

  const cur = useRef<WindowState>({ ...WINDOW_STATES[0] });
  const lapse = useRef<{ start: number; from: WindowState } | null>(null);
  const drift = useRef(0);
  const acc = useRef(1);
  const light = useRef<PointLight>(null);

  useFrame((_, dt) => {
    const target = WINDOW_STATES[targetIdx];
    const c = cur.current;
    const now = performance.now();
    drift.current += dt * (flow === 'skip' ? 5 : 1);

    if (flow === 'skip') {
      if (!lapse.current) lapse.current = { start: now, from: { ...c } };
      const p = clamp01((now - lapse.current.start) / SKIP_MS);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const f = lapse.current.from;
      const cycles = 4;
      c.snow = lerp(f.snow, target.snow, e);
      c.foliage = lerp(f.foliage, target.foliage, e);
      c.cloud = lerp(f.cloud, target.cloud, e);
      c.rain = lerp(f.rain, target.rain, e);
      c.snowfall = lerp(f.snowfall, target.snowfall, e);
      c.tricolor = e > 0.7 ? target.tricolor : f.tricolor;
      const fTod = ((f.tod % 1) + 1) % 1;
      c.tod = fTod + e * (cycles + (target.tod - fTod));
    } else {
      lapse.current = null;
      const k = 1 - Math.exp(-dt * 3);
      c.snow = lerp(c.snow, target.snow, k);
      c.foliage = lerp(c.foliage, target.foliage, k);
      c.cloud = lerp(c.cloud, target.cloud, k);
      c.rain = lerp(c.rain, target.rain, k);
      c.snowfall = lerp(c.snowfall, target.snowfall, k);
      c.tricolor = target.tricolor;
      c.tod = smoothTod(c.tod, target.tod, k);
    }

    // room light follows the sky
    const tod = ((c.tod % 1) + 1) % 1;
    const sunH = Math.sin((tod - 0.25) * Math.PI * 2);
    const day = clamp01(sunH * 2 + 0.5);
    const dusk = clamp01(1 - Math.abs(sunH) * 3.5);
    if (light.current) {
      const col = mixRGB(mixRGB(hex('#3a4a78'), hex('#d4e6ff'), day), hex('#ffb27a'), dusk * 0.7);
      light.current.color.setRGB(col[0] / 255, col[1] / 255, col[2] / 255);
      light.current.intensity = (0.4 + day * 2.2 * (1 - c.cloud * 0.4)) * 1.2;
    }

    acc.current += dt;
    if (acc.current > 1 / 24) {
      acc.current = 0;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawWindow(ctx, c, drift.current);
        texture.needsUpdate = true;
      }
    }
  });

  return (
    <group position={[0, 1.8, -2.15]}>
      <mesh>
        <planeGeometry args={[2.4, 1.7]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* frame and mullions */}
      {[
        { p: [0, 0.87, 0.04], s: [2.55, 0.1, 0.1] },
        { p: [0, -0.87, 0.06], s: [2.55, 0.12, 0.14] },
        { p: [-1.24, 0, 0.04], s: [0.1, 1.84, 0.1] },
        { p: [1.24, 0, 0.04], s: [0.1, 1.84, 0.1] },
        { p: [0, 0, 0.04], s: [0.06, 1.7, 0.06] },
        { p: [0, 0.1, 0.04], s: [2.4, 0.05, 0.06] },
      ].map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]}>
          <boxGeometry args={b.s as [number, number, number]} />
          <meshStandardMaterial color="#241209" roughness={0.7} />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 0.1, 1.2]} distance={7} decay={1.4} />
    </group>
  );
}
