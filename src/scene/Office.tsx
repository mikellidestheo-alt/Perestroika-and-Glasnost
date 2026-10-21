import { useMemo } from 'react';
import * as THREE from 'three';
import { useCanvasTexture } from './helpers';

const WOOD = '#3a2216';
const DARK_WOOD = '#241209';
const BRASS = '#b8913a';

function Bookshelf({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const books = useMemo(() => {
    const palette = ['#5a1010', '#1b2f4b', '#2d4a2a', '#6b5a2a', '#3a1a3a', '#222'];
    return Array.from({ length: 4 }).flatMap((_, row) =>
      Array.from({ length: 14 }).map((__, i) => ({
        key: `${row}-${i}`,
        x: -0.78 + i * 0.12,
        y: 0.18 + row * 0.5,
        h: 0.28 + ((i * 7 + row * 3) % 5) * 0.03,
        c: palette[(i * 3 + row) % palette.length],
      })),
    );
  }, []);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 2.1, 0.3]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.8} />
      </mesh>
      {books.map((b) => (
        <mesh key={b.key} position={[b.x, b.y + b.h / 2 - 0.02, 0.17]}>
          <boxGeometry args={[0.09, b.h, 0.18]} />
          <meshStandardMaterial color={b.c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Window() {
  return (
    <group position={[0, 1.7, -2.18]}>
      <mesh>
        <planeGeometry args={[1.8, 1.4]} />
        <meshBasicMaterial color="#16284a" />
      </mesh>
      {/* Kremlin star glow on the horizon */}
      <mesh position={[0.45, -0.15, 0.01]}>
        <circleGeometry args={[0.05, 5]} />
        <meshBasicMaterial color="#ff2b2b" />
      </mesh>
      <mesh position={[0.45, -0.38, 0.005]}>
        <boxGeometry args={[0.1, 0.45, 0.01]} />
        <meshBasicMaterial color="#5a1a12" />
      </mesh>
      {[-0.9, 0, 0.9].map((x) => (
        <mesh key={x} position={[x, 0, 0.03]}>
          <boxGeometry args={[0.05, 1.4, 0.05]} />
          <meshStandardMaterial color={DARK_WOOD} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.8, 0.05, 0.05]} />
        <meshStandardMaterial color={DARK_WOOD} />
      </mesh>
      {/* Curtains */}
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0, 0.1]}>
          <boxGeometry args={[0.5, 1.7, 0.08]} />
          <meshStandardMaterial color="#6a1218" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Emblem() {
  const tex = useCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#7b0f14';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e6c04a';
      ctx.font = 'bold 120px serif';
      ctx.textAlign = 'center';
      ctx.fillText('☭', w / 2, 150);
      ctx.font = 'bold 22px serif';
      ctx.fillText('СССР', w / 2, 220);
    },
    [],
  );
  return (
    <mesh position={[-1.55, 2.0, -2.17]}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}

export function Office() {
  const rug = useMemo(() => new THREE.Color('#5c0f14'), []);
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.2]} receiveShadow>
        <planeGeometry args={[4.4, 3.2]} />
        <meshStandardMaterial color={rug} roughness={1} />
      </mesh>
      {/* walls */}
      <mesh position={[0, 1.6, -2.2]} receiveShadow>
        <boxGeometry args={[8, 3.2, 0.1]} />
        <meshStandardMaterial color="#4b3a2b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, -2.14]}>
        <boxGeometry args={[8, 1, 0.04]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.7} />
      </mesh>
      <mesh position={[-3.2, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[6, 3.2, 0.1]} />
        <meshStandardMaterial color="#4b3a2b" roughness={0.9} />
      </mesh>
      <mesh position={[3.2, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[6, 3.2, 0.1]} />
        <meshStandardMaterial color="#4b3a2b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#2b2018" />
      </mesh>
      <Window />
      <Emblem />
      <Bookshelf position={[-2.2, 0, -2.0]} />
      <Bookshelf position={[2.2, 0, -2.0]} />

      {/* desk */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.06, 1.6]} />
        <meshStandardMaterial color="#4a2a18" roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.755, 0]} receiveShadow>
        <boxGeometry args={[3.0, 0.005, 1.1]} />
        <meshStandardMaterial color="#1f3a2a" roughness={0.9} />
      </mesh>
      {[-1.65, 1.65].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]} castShadow>
          <boxGeometry args={[0.2, 0.72, 1.5]} />
          <meshStandardMaterial color="#3a2012" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, -0.72]}>
        <boxGeometry args={[3.2, 0.5, 0.04]} />
        <meshStandardMaterial color="#3a2012" />
      </mesh>

      <Lamp position={[1.4, 0.75, -0.5]} />
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  const glow = useCanvasTexture(
    128,
    128,
    (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,220,150,0.9)');
      g.addColorStop(0.35, 'rgba(255,180,90,0.3)');
      g.addColorStop(1, 'rgba(255,160,60,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    },
    [],
  );
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.04, 20]} />
        <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.45, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[-0.1, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.17, 0.2, 20, 1, true]} />
        <meshStandardMaterial color="#1f5a3a" side={THREE.DoubleSide} roughness={0.4} emissive="#0a2a18" />
      </mesh>
      <mesh position={[-0.1, 0.47, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ffe2a8" />
      </mesh>
      <sprite position={[-0.1, 0.45, 0]} scale={[1.1, 1.1, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight position={[-0.1, 0.42, 0.05]} color="#ffb766" intensity={3.2} distance={7} decay={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
    </group>
  );
}
