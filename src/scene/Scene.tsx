import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useGame } from '../game/store';
import { Office } from './Office';
import { Phone } from './Phone';
import { Terminal3D } from './Terminal3D';
import { Newspaper3D, Folder3D } from './Desk';

const HOME_POS = new Vector3(0, 2.0, 2.4);
const HOME_LOOK = new Vector3(0, 0.9, -0.1);
const WINDOW_POS = new Vector3(0, 1.85, 0.2);
const WINDOW_LOOK = new Vector3(0, 1.8, -2.15);

/** Moves the camera to the window during the time skip, then hands control back to the orbit controls. */
function CameraRig() {
  const flow = useGame((s) => s.flow);
  const { camera } = useThree();
  const [orbit, setOrbit] = useState(true);
  const look = useRef(HOME_LOOK.clone());

  useEffect(() => {
    if (flow !== 'idle') setOrbit(false);
  }, [flow]);

  useFrame((_, dt) => {
    if (orbit) return;
    const toWindow = flow !== 'idle';
    const k = 1 - Math.exp(-dt * (toWindow ? 2.2 : 3));
    camera.position.lerp(toWindow ? WINDOW_POS : HOME_POS, k);
    look.current.lerp(toWindow ? WINDOW_LOOK : HOME_LOOK, k);
    camera.lookAt(look.current);
    if (!toWindow && camera.position.distanceTo(HOME_POS) < 0.02) {
      camera.position.copy(HOME_POS);
      setOrbit(true);
    }
  });

  return orbit ? (
    <OrbitControls
      target={HOME_LOOK.toArray()}
      enablePan={false}
      minDistance={1.4}
      maxDistance={3.4}
      minPolarAngle={0.7}
      maxPolarAngle={1.5}
      minAzimuthAngle={-0.8}
      maxAzimuthAngle={0.8}
      enableDamping
    />
  ) : null;
}

export function Scene() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: HOME_POS.toArray(), fov: 50 }} gl={{ antialias: true }}>
      <color attach="background" args={['#0d0806']} />
      <fogExp2 attach="fog" args={['#1a0f09', 0.09]} />
      <ambientLight intensity={0.6} color="#ffd9b0" />
      <directionalLight position={[-2, 3, 3]} intensity={0.25} color="#8aa6ff" />
      <Office />
      <Terminal3D position={[-1.0, 0.755, -0.35]} />
      <Phone position={[1.1, 0.755, -0.15]} />
      <Newspaper3D position={[-0.35, 0.755, 0.35]} />
      <Folder3D position={[0.4, 0.755, 0.3]} />
      <CameraRig />
    </Canvas>
  );
}
