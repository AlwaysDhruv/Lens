import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function GogglesModel({ mouse }) {
  const { scene } = useGLTF("/models/goggles.glb");
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      // subtle idle rotation
      ref.current.rotation.y += 0.002;
      // gentle parallax effect
      ref.current.rotation.y += mouse.current.x * 0.01;
      ref.current.rotation.x = -mouse.current.y * 0.1;
      // floating effect
      ref.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <primitive
      object={scene}
      ref={ref}
      scale={0.02}
      position={[0, -0.1, 0]}
      rotation={[0.2, 0.3, 0]}
    />
  );
}

export default function GogglesBackground() {
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  return (
    <div
      className="goggles-bg"
      onMouseMove={handleMouseMove}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 5]} intensity={1.2} />
        <pointLight position={[-3, -2, -4]} intensity={0.5} />
        <GogglesModel mouse={mouse} />
      </Canvas>
    </div>
  );
}
