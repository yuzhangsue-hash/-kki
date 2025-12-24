
import React, { Suspense } from 'react';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import ChristmasTree from './ChristmasTree';
import Snow from './Snow';
import { TreeState } from '../types';
import * as THREE from 'three';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <>
      <color attach="background" args={['#000806']} />
      <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={35} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 1.6} 
        minDistance={8}
        maxDistance={25}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      <ambientLight intensity={0.2} />
      {/* Cinematic Rim Light */}
      <spotLight position={[20, 20, 20]} angle={0.2} penumbra={1} intensity={5} color="#d4af37" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#043927" />
      
      <Stars radius={100} depth={60} count={10000} factor={5} saturation={0} fade speed={0.5} />

      <Suspense fallback={null}>
        <ChristmasTree state={treeState} />
        <Snow />
        <Environment preset="night" />
        <ContactShadows opacity={0.5} scale={30} blur={2.5} far={10} color="#000000" />
      </Suspense>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={2.5} 
          radius={0.4} 
        />
        <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.3} />
      </EffectComposer>
    </>
  );
};

export default Experience;
