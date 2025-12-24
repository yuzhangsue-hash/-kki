
import React, { useState } from 'react';
import { getLuxuryWish } from '../services/geminiService';
import { WishResponse, UIStatus } from '../types';
import { Sparkles, Send, Loader2, X, Gift } from 'lucide-react';

interface GiftOracleProps {
  onResult?: () => void;
}

const GiftOracle: React.FC<GiftOracleProps> = ({ onResult }) => {
  const [vibe, setVibe] = useState('');
  const [status, setStatus] = useState<UIStatus>(UIStatus.IDLE);
  const [result, setResult] = useState<WishResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibe.trim()) return;
    
    setStatus(UIStatus.LOADING);
    try {
      const data = await getLuxuryWish(vibe);
      setResult(data);
      setStatus(UIStatus.RESULT);
      if (onResult) onResult();
    } catch (error) {
      setStatus(UIStatus.ERROR);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-[#d4af37] text-[#051a14] px-6 py-3 rounded-full font-cinzel font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-3 group border border-[#fff]/20 pointer-events-auto"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        Summon the Connoisseur
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-[#051a14] border-2 border-[#d4af37]/60 w-full max-w-lg p-10 rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.3)] relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#d4af37]/5 blur-3xl rounded-full" />
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-[#d4af37]/60 hover:text-[#d4af37] hover:rotate-90 transition-all z-10"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="relative z-10">
          <h2 className="text-4xl font-cinzel font-bold text-[#d4af37] mb-2 flex items-center gap-4">
            <Gift className="w-10 h-10" />
            Arix Oracle
          </h2>
          <p className="text-[#d4af37]/60 italic mb-8 tracking-wide font-playfair uppercase text-xs">"Refining your festive essence through artificial intelligence"</p>

          {status === UIStatus.IDLE || status === UIStatus.LOADING ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]/80 block mb-3 font-bold">Your Festive Philosophy</label>
                <textarea 
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="e.g. A winter morning in the Swiss Alps, velvet and old gold..."
                  className="w-full bg-[#072a20]/80 border border-[#d4af37]/20 rounded-xl p-5 text-[#d4af37] placeholder-[#d4af37]/20 focus:outline-none focus:border-[#d4af37] transition-all resize-none h-40 font-playfair text-lg leading-relaxed shadow-inner"
                  disabled={status === UIStatus.LOADING}
                />
              </div>
              <button 
                type="submit"
                disabled={status === UIStatus.LOADING || !vibe.trim()}
                className="w-full bg-[#d4af37] text-[#051a14] py-5 rounded-xl font-cinzel font-bold flex items-center justify-center gap-3 disabled:opacity-50 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
              >
                {status === UIStatus.LOADING ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Synthesizing Luxury...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Invoke Selection
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="border-l-4 border-[#d4af37] pl-6 py-2">
                <p className="text-xl md:text-2xl leading-relaxed text-white/90 font-playfair italic">{result?.message}</p>
              </div>
              
              <div className="bg-[#072a20] p-6 rounded-2xl border border-[#d4af37]/30 shadow-2xl">
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#d4af37] font-bold block mb-3 opacity-70 underline decoration-[#d4af37]/20 underline-offset-4">Curated Acquisition</span>
                <p className="text-[#d4af37] font-cinzel text-2xl md:text-3xl font-bold tracking-tight">{result?.luxuryGift}</p>
              </div>

              <div className="text-center text-[#d4af37]/60 pt-6 border-t border-[#d4af37]/20 font-playfair italic text-lg">
                "{result?.affirmation}"
              </div>

              <button 
                onClick={() => { setStatus(UIStatus.IDLE); setResult(null); setVibe(''); }}
                className="w-full border-2 border-[#d4af37]/30 text-[#d4af37] py-4 rounded-xl font-cinzel hover:bg-[#d4af37]/10 transition-all uppercase tracking-widest text-xs"
              >
                Reset Oracle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftOracle;
