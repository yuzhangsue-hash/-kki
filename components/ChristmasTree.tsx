
import React, { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Instances, Instance, Float, shaderMaterial } from '@react-three/drei';
import { TreeState } from '../types';

// Custom Shader for the Foliage Points
const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uLerp: 0,
    uColorBase: new THREE.Color("#043927"),
    uColorEdge: new THREE.Color("#d4af37"),
  },
  // Vertex Shader
  `
  uniform float uTime;
  uniform float uLerp;
  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aPhase;
  attribute float aSize;
  varying float vGlow;
  varying vec3 vColor;

  void main() {
    vec3 pos = mix(aScatterPos, aTreePos, uLerp);
    
    // Breathing/Jitter logic
    float jitter = sin(uTime * 1.5 + aPhase) * 0.15 * (1.0 - uLerp * 0.5);
    pos += jitter;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vGlow = (sin(uTime * 2.0 + aPhase) * 0.5 + 0.5);
  }
  `,
  // Fragment Shader
  `
  uniform vec3 uColorBase;
  uniform vec3 uColorEdge;
  varying float vGlow;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 2.0);
    
    vec3 color = mix(uColorBase, uColorEdge, vGlow * 0.4);
    gl_FragColor = vec4(color, strength * (0.8 + vGlow * 0.2));
  }
  `
);

extend({ FoliageMaterial });

const FOLIAGE_COUNT = 8000;
const BAUBLE_COUNT = 150;
const GIFT_COUNT = 30;

const ChristmasTree: React.FC<{ state: TreeState }> = ({ state }) => {
  const pointsRef = useRef<any>(null);
  const giftRefs = useRef<any[]>([]);
  const baubleRefs = useRef<any[]>([]);
  const lerpRef = useRef(0);

  // Pre-calculate positions and attributes
  const { foliage, baubles, gifts } = useMemo(() => {
    const fPosS = new Float32Array(FOLIAGE_COUNT * 3);
    const fPosT = new Float32Array(FOLIAGE_COUNT * 3);
    const fPhase = new Float32Array(FOLIAGE_COUNT);
    const fSize = new Float32Array(FOLIAGE_COUNT);

    const getConePos = (hScale: number, rScale: number, volume: boolean = false) => {
      const h = Math.random() * hScale;
      const r = (1 - h / hScale) * rScale * (volume ? Math.random() : 1);
      const theta = Math.random() * Math.PI * 2;
      return [Math.cos(theta) * r, h - 2.5, Math.sin(theta) * r];
    };

    // Foliage (Points)
    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const s = new THREE.Vector3().randomDirection().multiplyScalar(10 + Math.random() * 8);
      fPosS.set([s.x, s.y, s.z], i * 3);
      fPosT.set(getConePos(6, 3, true), i * 3);
      fPhase[i] = Math.random() * Math.PI * 2;
      fSize[i] = 0.05 + Math.random() * 0.15;
    }

    // Baubles (Spheres - Light weight)
    const bData = Array.from({ length: BAUBLE_COUNT }).map(() => ({
      sPos: new THREE.Vector3().randomDirection().multiplyScalar(12 + Math.random() * 5),
      tPos: new THREE.Vector3(...getConePos(5.8, 2.9)),
      scale: 0.05 + Math.random() * 0.1,
      weight: 0.6, // Moves more
      color: Math.random() > 0.3 ? "#FFD700" : "#ffffff",
      phase: Math.random() * Math.PI * 2
    }));

    // Gifts (Cubes - Heavy weight)
    const gData = Array.from({ length: GIFT_COUNT }).map(() => ({
      sPos: new THREE.Vector3().randomDirection().multiplyScalar(8 + Math.random() * 4),
      tPos: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        -2.5, // Bottom of tree
        (Math.random() - 0.5) * 4
      ),
      scale: 0.2 + Math.random() * 0.3,
      weight: 0.2, // Heavy, moves less
      color: iotaColor(),
      phase: Math.random() * Math.PI * 2
    }));

    return { foliage: { fPosS, fPosT, fPhase, fSize }, baubles: bData, gifts: gData };
  }, []);

  function iotaColor() {
    const colors = ["#043927", "#d4af37", "#1a472a", "#8b0000"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  useFrame((sceneState, delta) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    lerpRef.current = THREE.MathUtils.lerp(lerpRef.current, target, delta * 1.5);
    const t = lerpRef.current;
    const time = sceneState.clock.getElapsedTime();

    // Update Foliage Shader
    if (pointsRef.current) {
      pointsRef.current.material.uTime = time;
      pointsRef.current.material.uLerp = t;
    }

    // Update Baubles (Instanced)
    baubleRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const data = baubles[i];
      const pos = new THREE.Vector3().lerpVectors(data.sPos, data.tPos, t);
      // Floating motion influenced by weight
      pos.x += Math.sin(time + data.phase) * (1 - t) * data.weight;
      pos.y += Math.cos(time * 0.8 + data.phase) * (1 - t) * data.weight;
      ref.position.copy(pos);
      ref.scale.setScalar(data.scale * (1 + Math.sin(time * 3 + data.phase) * 0.1));
    });

    // Update Gifts (Instanced)
    giftRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const data = gifts[i];
      const pos = new THREE.Vector3().lerpVectors(data.sPos, data.tPos, t);
      // Heavy floating motion
      pos.y += Math.sin(time * 0.5 + data.phase) * (1 - t) * data.weight;
      ref.position.copy(pos);
      ref.rotation.set(time * 0.1 * data.weight, time * 0.2 * data.weight, 0);
      ref.scale.setScalar(data.scale);
    });
  });

  return (
    <group>
      {/* 1. Foliage Points Layer */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={FOLIAGE_COUNT} array={foliage.fPosS} itemSize={3} />
          <bufferAttribute attach="attributes-aScatterPos" count={FOLIAGE_COUNT} array={foliage.fPosS} itemSize={3} />
          <bufferAttribute attach="attributes-aTreePos" count={FOLIAGE_COUNT} array={foliage.fPosT} itemSize={3} />
          <bufferAttribute attach="attributes-aPhase" count={FOLIAGE_COUNT} array={foliage.fPhase} itemSize={1} />
          <bufferAttribute attach="attributes-aSize" count={FOLIAGE_COUNT} array={foliage.fSize} itemSize={1} />
        </bufferGeometry>
        {/* @ts-ignore */}
        <foliageMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* 2. Baubles Layer (Instanced Spheres) */}
      <Instances range={BAUBLE_COUNT}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial metalness={1} roughness={0.1} envMapIntensity={1.5} />
        {baubles.map((data, i) => (
          <Instance 
            key={i} 
            ref={(el) => (baubleRefs.current[i] = el)} 
            color={data.color}
          />
        ))}
      </Instances>

      {/* 3. Gifts Layer (Instanced Cubes - Heavy) */}
      <Instances range={GIFT_COUNT}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.7} />
        {gifts.map((data, i) => (
          <Instance 
            key={i} 
            ref={(el) => (giftRefs.current[i] = el)} 
            color={data.color}
          />
        ))}
      </Instances>

      {/* 4. Top Star (Constant high light) */}
      <group position={[0, 3.5, 0]} scale={[lerpRef.current, lerpRef.current, lerpRef.current]}>
        <Float speed={4} rotationIntensity={1.5}>
          <mesh>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={10} 
              toneMapped={false}
            />
          </mesh>
          <pointLight intensity={20} distance={15} color="#FFD700" />
        </Float>
      </group>

      {/* Ground Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#043927" transparent opacity={0.2 * lerpRef.current} />
      </mesh>
    </group>
  );
};

export default ChristmasTree;
