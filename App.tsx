
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import GiftOracle from './components/GiftOracle';
import { TreeState } from './types';
import { Boxes, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = useCallback(() => {
    setTreeState(prev => prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#010d0a]">
      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]}>
        <Experience treeState={treeState} />
      </Canvas>

      {/* Main UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8 md:p-12 select-none">
        <header className="text-center">
          <h1 className="text-5xl md:text-8xl font-cinzel font-bold text-[#d4af37] drop-shadow-[0_0_30px_rgba(212,175,55,0.6)] tracking-tighter transition-all">
            ARIX
          </h1>
          <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-6 opacity-60" />
          <p className="text-[#d4af37] text-xs md:text-sm tracking-[0.8em] font-cinzel uppercase opacity-80">
            Signature Signature · Vol. III
          </p>
        </header>

        {/* Dynamic Controls */}
        <div className="flex flex-col items-center gap-6 mb-8 pointer-events-auto">
          <button 
            onClick={toggleState}
            className="group flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <div className={`w-16 h-16 rounded-full border-2 border-[#d4af37]/40 flex items-center justify-center bg-[#051a14]/60 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:border-[#d4af37] transition-colors`}>
               {treeState === TreeState.TREE_SHAPE ? (
                 <Boxes className="w-8 h-8 text-[#d4af37]" />
               ) : (
                 <Sparkles className="w-8 h-8 text-[#d4af37] animate-pulse" />
               )}
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-bold">
              {treeState === TreeState.TREE_SHAPE ? 'Dissolve Essence' : 'Manifest Tree'}
            </span>
          </button>
        </div>

        <footer className="text-[#d4af37]/40 text-[10px] tracking-widest uppercase flex flex-col items-center gap-3">
          <div className="flex gap-8">
            <span>Scroll to navigate</span>
            <span>•</span>
            <span>Drag to rotate</span>
          </div>
          <span className="font-bold text-[#d4af37]/60 border-t border-[#d4af37]/10 pt-2">
            Procedural High-Jewelry Christmas Experience
          </span>
        </footer>
      </div>

      {/* Interactive AI Component */}
      <GiftOracle onResult={() => setTreeState(TreeState.TREE_SHAPE)} />
      
      {/* Background Ambience Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />
    </div>
  );
};

export default App;
