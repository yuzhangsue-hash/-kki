
import React, { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const SnowMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 0.05,
    uRange: new THREE.Vector3(30, 20, 30), // Width, Height, Depth of the snow volume
    uColor: new THREE.Color("#ffffff"),
  },
  // Vertex Shader
  `
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uRange;
  
  attribute float aSpeed;
  attribute float aPhase;
  attribute vec3 aOffset;

  varying float vOpacity;

  void main() {
    vec3 pos = position;

    // Vertical movement with wrapping
    // We use a large offset and modulo to keep particles within the uRange.y height
    float yOffset = mod(pos.y - (uTime * aSpeed), uRange.y) - (uRange.y * 0.5);
    
    // Horizontal drift (wind/flutter)
    float xDrift = sin(uTime * 0.5 + aPhase) * 0.5;
    float zDrift = cos(uTime * 0.3 + aPhase) * 0.5;

    vec3 finalPos = vec3(
      pos.x + xDrift,
      yOffset,
      pos.z + zDrift
    );

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    
    // Size attenuation based on distance
    gl_PointSize = uSize * (1000.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Fade out near the edges of the volume for a softer look
    float edgeFade = 1.0 - smoothstep(uRange.y * 0.4, uRange.y * 0.5, abs(yOffset));
    vOpacity = edgeFade * 0.6;
  }
  `,
  // Fragment Shader
  `
  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    
    // Soft circular particle
    float alpha = smoothstep(0.5, 0.2, d) * vOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
  `
);

extend({ SnowMaterial });

const SNOW_COUNT = 1500;

const Snow: React.FC = () => {
  const materialRef = useRef<any>(null);

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const spd = new Float32Array(SNOW_COUNT);
    const phs = new Float32Array(SNOW_COUNT);

    const range = { x: 30, y: 20, z: 30 };

    for (let i = 0; i < SNOW_COUNT; i++) {
      // Random starting positions within the volume
      pos[i * 3] = (Math.random() - 0.5) * range.x;
      pos[i * 3 + 1] = (Math.random() - 0.5) * range.y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * range.z;

      // Random speeds for natural variation
      spd[i] = 0.5 + Math.random() * 1.5;
      
      // Random phases for horizontal wobble
      phs[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, phases: phs };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SNOW_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={SNOW_COUNT}
          array={speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={SNOW_COUNT}
          array={phases}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <snowMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;
