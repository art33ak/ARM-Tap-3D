ARM-Tap-3D/
├── public/
│   └── models/
│       └── arm-coin.glb
├── src/
│   └── components/
│       └── Coin3D.tsx
└── src/App.tsx

import { Canvas } from "@react-three/fiber";
import {
  Float,
  Sparkles,
  Environment,
  Torus,
} from "@react-three/drei";

function Coin() {
  return (
    <group rotation={[0.12, 0.22, 0]}>
      {/* Մետաղադրամի հաստ եզրը */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.18, 1.18, 0.18, 96]} />
        <meshStandardMaterial
          color="#d99518"
          metalness={0.95}
          roughness={0.22}
        />
      </mesh>

      {/* Առջևի ոսկեգույն մակերեսը */}
      <mesh position={[0, 0, 0.105]}>
        <circleGeometry args={[1.08, 96]} />
        <meshStandardMaterial
          color="#ffc83d"
          metalness={0.88}
          roughness={0.2}
          emissive="#713900"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Արտաքին լուսավոր օղակը */}
      <mesh position={[0, 0, 0.12]}>
        <torusGeometry args={[0.96, 0.025, 12, 96]} />
        <meshStandardMaterial
          color="#fff0a0"
          metalness={0.9}
          roughness={0.18}
          emissive="#ffb52e"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Ներքին տեխնոլոգիական օղակ */}
      <mesh position={[0, 0, 0.125]}>
        <torusGeometry args={[0.78, 0.012, 8, 96]} />
        <meshStandardMaterial
          color="#fff0b5"
          metalness={0.8}
          roughness={0.24}
        />
      </mesh>

      {/* ARM նշանը */}
      <mesh position={[0, 0, 0.145]}>
        <torusGeometry args={[0.28, 0.035, 12, 64]} />
        <meshStandardMaterial
          color="#fff2bd"
          metalness={0.9}
          roughness={0.17}
          emissive="#a45b00"
          emissiveIntensity={0.25}
        />
      </mesh>

      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.07, 0.72, 0.025]} />
        <meshStandardMaterial
          color="#fff1b0"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Փոքր տեխնոլոգիական գծեր */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.86,
              Math.sin(angle) * 0.86,
              0.13,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.09, 0.018, 0.012]} />
            <meshStandardMaterial
              color="#fff4c7"
              metalness={0.8}
              roughness={0.2}
              emissive="#e5a42c"
              emissiveIntensity={0.25}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Coin3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        background:
          "radial-gradient(circle at 50% 45%, #183c78 0%, #10152f 48%, #070a18 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.3], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <pointLight
          position={[3, 3, 4]}
          intensity={90}
          color="#43dfff"
        />
        <pointLight
          position={[-3, 1, 2]}
          intensity={75}
          color="#a45bff"
        />
        <pointLight
          position={[0, -3, 3]}
          intensity={65}
          color="#ffb72b"
        />

        <Float
          speed={1.5}
          rotationIntensity={0.12}
          floatIntensity={0.18}
        >
          <Coin />
        </Float>

        <Sparkles
          count={90}
          scale={3.8}
          size={2.5}
          speed={0.35}
          color="#67dcff"
        />
        <Sparkles
          count={35}
          scale={3.2}
          size={2}
          speed={0.25}
          color="#d8a0ff"
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
