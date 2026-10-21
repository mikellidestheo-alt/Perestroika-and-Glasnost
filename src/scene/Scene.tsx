import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Office } from './Office';
import { Phone } from './Phone';
import { Terminal3D } from './Terminal3D';
import { Newspaper3D, Folder3D } from './Desk';

export function Scene() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2.0, 2.4], fov: 50 }} gl={{ antialias: true }}>
      <color attach="background" args={['#0d0806']} />
      <fogExp2 attach="fog" args={['#1a0f09', 0.11]} />
      <ambientLight intensity={0.7} color="#ffd9b0" />
      <directionalLight position={[-2, 3, 3]} intensity={0.25} color="#8aa6ff" />
      <Office />
      <Terminal3D position={[-1.0, 0.755, -0.35]} />
      <Phone position={[1.1, 0.755, -0.15]} />
      <Newspaper3D position={[-0.35, 0.755, 0.35]} />
      <Folder3D position={[0.4, 0.755, 0.3]} />
      <OrbitControls
        target={[0, 0.9, -0.1]}
        enablePan={false}
        minDistance={1.4}
        maxDistance={3.4}
        minPolarAngle={0.7}
        maxPolarAngle={1.5}
        minAzimuthAngle={-0.8}
        maxAzimuthAngle={0.8}
        enableDamping
      />
    </Canvas>
  );
}
