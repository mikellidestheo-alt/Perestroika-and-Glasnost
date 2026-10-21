import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import { sfx } from '../audio/sfx';
import { useGame, currentScenario } from '../game/store';
import { useInteractive } from './helpers';

export function Phone({ position }: { position: [number, number, number] }) {
  const stage = useGame((s) => s.stage);
  const answered = useGame((s) => s.phoneAnswered);
  const panel = useGame((s) => s.panel);
  const ending = useGame((s) => s.ending);
  const started = useGame((s) => s.started);
  const open = useGame((s) => s.open);

  const ringing = started && !ending && !!currentScenario(stage).crisis && !answered && panel === 'none';
  const enabled = started && !ending && panel === 'none' && !!currentScenario(stage).crisis && !answered;
  const { hovered, handlers } = useInteractive(enabled, () => {
    sfx.stopRing();
    open('phone');
  });

  useEffect(() => {
    if (ringing) sfx.startRing();
    else sfx.stopRing();
    return () => sfx.stopRing();
  }, [ringing]);

  const handset = useRef<Group>(null);
  const body = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (handset.current) {
      handset.current.position.y = 0.17 + (ringing ? Math.abs(Math.sin(t * 30)) * 0.015 : 0);
      handset.current.rotation.z = ringing ? Math.sin(t * 40) * 0.03 : 0;
    }
    if (body.current) body.current.position.x = ringing ? Math.sin(t * 45) * 0.004 : 0;
  });

  const glow = ringing ? '#ff2a1a' : hovered ? '#552200' : '#000000';
  return (
    <group position={position} rotation={[0, -0.5, 0]} {...(enabled ? handlers : {})}>
      <group ref={body}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.46, 0.14, 0.34]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.4} emissive={glow} emissiveIntensity={ringing ? 0.8 : 0.6} />
        </mesh>
        {/* dial plate */}
        <mesh position={[0, 0.145, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#d9c27a" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.148, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.03, 0.085, 32]} />
          <meshStandardMaterial color="#222" side={2} />
        </mesh>
        {/* Cradle with Kremlin coat of arms (gold disc) */}
        <mesh position={[0, 0.147, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.035, 24]} />
          <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.3} />
        </mesh>
        <group ref={handset} position={[0, 0.17, -0.07]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.36, 12]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
          </mesh>
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} position={[x, -0.02, 0]} castShadow>
              <sphereGeometry args={[0.05, 14, 14]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
            </mesh>
          ))}
        </group>
      </group>
      {(hovered || ringing) && (
        <Html position={[0, 0.5, 0]} center distanceFactor={4} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`tag ${ringing ? 'tag-alert' : ''}`}>{ringing ? '☎ Срочный звонок!' : 'Кремлёвская «вертушка»'}</div>
        </Html>
      )}
    </group>
  );
}
