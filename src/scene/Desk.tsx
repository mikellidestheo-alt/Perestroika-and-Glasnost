import { Html } from '@react-three/drei';
import { useGame, currentScenario } from '../game/store';
import { useCanvasTexture, useInteractive, wrapText } from './helpers';

export function Newspaper3D({ position }: { position: [number, number, number] }) {
  const headline = useGame((s) => s.headlines[0]);
  const started = useGame((s) => s.started);
  const panel = useGame((s) => s.panel);
  const ending = useGame((s) => s.ending);
  const open = useGame((s) => s.open);
  const { hovered, handlers } = useInteractive(started && !ending && panel === 'none', () => open('paper'));

  const tex = useCanvasTexture(
    512,
    384,
    (ctx, w, h) => {
      ctx.fillStyle = '#e8e0c8';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b01010';
      ctx.font = 'bold 54px Georgia, serif';
      ctx.fillText(headline.paper.toUpperCase(), 24, 66);
      ctx.fillRect(24, 78, w - 48, 4);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 30px Georgia, serif';
      wrapText(ctx, headline.title, w - 48).slice(0, 4).forEach((l, i) => ctx.fillText(l, 24, 124 + i * 36));
      ctx.font = '19px Georgia, serif';
      wrapText(ctx, headline.sub, w - 48).slice(0, 3).forEach((l, i) => ctx.fillText(l, 24, 280 + i * 24));
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let i = 0; i < 9; i++) ctx.fillRect(24, 340 + (i % 2) * 8, w - 48, 1);
    },
    [headline],
  );

  return (
    <group position={position} rotation={[0, 0.25, 0]} {...handlers}>
      <mesh position={[0.02, 0.006, 0.02]} rotation={[-Math.PI / 2, 0, -0.1]} receiveShadow>
        <planeGeometry args={[0.55, 0.4]} />
        <meshStandardMaterial color="#cfc6ae" />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0.05]} receiveShadow>
        <planeGeometry args={[0.55, 0.4]} />
        <meshStandardMaterial map={tex} emissive={hovered ? '#553a10' : '#000'} />
      </mesh>
      {hovered && (
        <Html position={[0, 0.25, 0]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
          <div className="tag">Газеты «Правда» и «Известия»</div>
        </Html>
      )}
    </group>
  );
}

export function Folder3D({ position }: { position: [number, number, number] }) {
  const stage = useGame((s) => s.stage);
  const answered = useGame((s) => s.phoneAnswered);
  const started = useGame((s) => s.started);
  const panel = useGame((s) => s.panel);
  const ending = useGame((s) => s.ending);
  const open = useGame((s) => s.open);
  const scenario = currentScenario(stage);
  const locked = !!scenario.crisis && !answered;
  const enabled = started && !ending && panel === 'none' && !locked;
  const { hovered, handlers } = useInteractive(started && !ending && panel === 'none', () => {
    if (!locked) open('folder');
  });

  const label = useCanvasTexture(
    256,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = '#e8e0c8';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#b01010';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#b01010';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('СОВЕРШЕННО', w / 2, 52);
      ctx.fillText('СЕКРЕТНО', w / 2, 84);
      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = '#222';
      ctx.fillText(`Дело № ${scenario.id}`, w / 2, 112);
    },
    [scenario.id],
  );

  return (
    <group position={position} rotation={[0, -0.2, 0]} {...handlers}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.42, 0.04, 0.55]} />
        <meshStandardMaterial color="#8a0f14" roughness={0.6} emissive="#ff3030" emissiveIntensity={hovered && enabled ? 0.35 : enabled ? 0.12 : 0} />
      </mesh>
      <mesh position={[0, 0.0405, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshStandardMaterial map={label} />
      </mesh>
      {(hovered || enabled) && (
        <Html position={[0, 0.3, 0]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
          <div className={`tag ${enabled ? 'tag-alert' : ''}`}>
            {locked ? 'Папка закрыта: ответьте на звонок' : 'Папка «Совершенно секретно»'}
          </div>
        </Html>
      )}
    </group>
  );
}
