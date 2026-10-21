import { Html } from '@react-three/drei';
import { useGame } from '../game/store';
import { METRIC_KEYS, METRIC_LABELS } from '../game/types';
import { useCanvasTexture, useInteractive } from './helpers';

export function Terminal3D({ position }: { position: [number, number, number] }) {
  const metrics = useGame((s) => s.metrics);
  const stage = useGame((s) => s.stage);
  const started = useGame((s) => s.started);
  const panel = useGame((s) => s.panel);
  const ending = useGame((s) => s.ending);
  const open = useGame((s) => s.open);
  const { hovered, handlers } = useInteractive(started && !ending && panel === 'none', () => open('terminal'));

  const tex = useCanvasTexture(
    512,
    384,
    (ctx, w, h) => {
      ctx.fillStyle = '#021006';
      ctx.fillRect(0, 0, w, h);
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillStyle = '#4dff7c';
      ctx.shadowColor = '#4dff7c';
      ctx.shadowBlur = 8;
      ctx.fillText('ЭЛЕКТРОНИКА МС-0511', 24, 44);
      ctx.font = '20px "Courier New", monospace';
      ctx.fillText(`ЭТАП ${Math.min(stage + 1, 5)}/5`, 24, 74);
      METRIC_KEYS.forEach((k, i) => {
        const y = 125 + i * 62;
        ctx.fillText(METRIC_LABELS[k].toUpperCase(), 24, y);
        ctx.strokeStyle = '#4dff7c';
        ctx.strokeRect(24, y + 10, 400, 18);
        ctx.fillRect(26, y + 12, (396 * metrics[k]) / 100, 14);
        ctx.fillText(String(Math.round(metrics[k])), 440, y + 26);
      });
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
    },
    [metrics, stage],
  );

  return (
    <group position={position} rotation={[0, 0.45, 0]} {...handlers}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.45]} />
        <meshStandardMaterial color="#b8b09a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.34, -0.05]} castShadow>
        <boxGeometry args={[0.72, 0.58, 0.55]} />
        <meshStandardMaterial color="#c4bca6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.36, 0.2306]}>
        <planeGeometry args={[0.56, 0.42]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={hovered ? 1.6 : 1.1} color="#000" />
      </mesh>
      <pointLight position={[0, 0.36, 0.5]} color="#4dff7c" intensity={0.5} distance={1.6} />
      {hovered && (
        <Html position={[0, 0.85, 0]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
          <div className="tag">Терминал «Электроника»: показатели</div>
        </Html>
      )}
    </group>
  );
}
