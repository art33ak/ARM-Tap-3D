
function Coin3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 38 }} dpr={[1, 1.6]}>
      <ambientLight intensity={1.5} />
      <pointLight position={[4, 3, 5]} intensity={100} color="#42d9ff" />
      <pointLight position={[-3, -2, 3]} intensity={70} color="#ffb72b" />

      <Float speed={2.2} rotationIntensity={0.12} floatIntensity={0.2}>
        {/* Coin body: rotate the cylinder axis toward the camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.35, 1.35, 0.16, 96]} />
          <meshStandardMaterial
            color="#c88d12"
            metalness={0.9}
            roughness={0.22}
          />
        </mesh>

        {/* Front face */}
        <mesh position={[0, 0, 0.09]}>
          <circleGeometry args={[1.29, 96]} />
          <meshStandardMaterial
            color="#e9ad27"
            metalness={0.78}
            roughness={0.24}
            emissive="#6a3300"
            emissiveIntensity={0.22}
          />
        </mesh>

        {/* Inner golden rim */}
        <mesh position={[0, 0, 0.115]}>
          <torusGeometry args={[1.2, 0.035, 12, 96]} />
          <meshStandardMaterial
            color="#fff0a2"
            metalness={0.85}
            roughness={0.18}
          />
        </mesh>

        {/* ARM letter */}
        <Text
          position={[0, -0.06, 0.15]}
          fontSize={1.05}
          anchorX="center"
          anchorY="middle"
          color="#fff1a4"
          outlineWidth={0.018}
          outlineColor="#8a4d08"
        >
          A
        </Text>
      </Float>

      <Sparkles
        count={48}
        scale={4.2}
        size={3}
        speed={0.45}
        color="#5ddcff"
      />
      <Environment preset="city" />
    </Canvas>
  );
}
