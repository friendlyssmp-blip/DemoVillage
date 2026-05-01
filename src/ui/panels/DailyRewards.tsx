/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Gift, CheckCircle2, Star, Timer, 
  Package, Coins, Pickaxe, Trees, Apple, X
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { audioService } from '../../services/audioService';
import { 
  tapAnimation, springTransition, glowPulse 
} from '../../lib/animations';

export function DailyRewards() {
// ...
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const { lastDailyClaim, dailyRewardStreak, addResource, resources } = useGameStore(useShallow(s => ({
    lastDailyClaim: s.lastDailyClaim,
    dailyRewardStreak: s.dailyRewardStreak,
    addResource: s.addResource,
    resources: s.resources
  })));
  const [claiming, setClaiming] = useState(false);

  // Check if can claim (new day based on local midnight)
  const lastDate = new Date(lastDailyClaim).setHours(0, 0, 0, 0);
  const nowDate = new Date().setHours(0, 0, 0, 0);
  const canClaim = nowDate > lastDate;

  // Streak reset logic: If more than 48 hours passed since last claim, reset streak
  useEffect(() => {
    if (lastDailyClaim > 0 && Date.now() - lastDailyClaim > 48 * 3600 * 1000) {
      useGameStore.setState({ dailyRewardStreak: 0 });
    }
  }, [lastDailyClaim]);
  
  useEffect(() => {
    if (canClaim && !hasAutoOpened) {
        setIsOpen(true);
        setHasAutoOpened(true);
    }
  }, [canClaim, hasAutoOpened]);

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    
    const dayIndex = dailyRewardStreak % 7;
    const rewards = [
        { wood: 100, gold: 50 },
        { stone: 100, gold: 50 },
        { food: 200, gold: 100 },
        { wood: 200, stone: 200, gold: 200 },
        { food: 500, gold: 300 },
        { wood: 500, stone: 500, gold: 500 },
        { wood: 1000, stone: 1000, food: 1000, gold: 2000 }
    ];

    const currentReward = rewards[dayIndex];
    
    // Process reward
    audioService.play('claim');
    Object.entries(currentReward).forEach(([k, v]) => {
        addResource(k as any, v as number);
    });

    useGameStore.setState((state) => ({ 
        dailyRewardStreak: state.dailyRewardStreak + 1,
        lastDailyClaim: Date.now()
    }));

    // Explicitly trigger sync after claim
    useGameStore.getState().syncVillage();

    setTimeout(() => {
        setClaiming(false);
        setIsOpen(false);
    }, 1000);
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      <AnimatePresence>
        {canClaim && !isOpen && (
           <motion.button 
             initial={{ scale: 0, rotate: -20 }}
             animate={{ scale: 1, rotate: 0 }}
             exit={{ scale: 0, rotate: 20 }}
             onClick={() => setIsOpen(true)}
             className="fixed top-28 left-4 z-30 w-14 h-14 glass-panel bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-[0_15px_40px_rgba(99,102,241,0.4)] pointer-events-auto group"
           >
             <Gift size={24} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-xl animate-ping opacity-75" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-xl flex items-center justify-center" />
           </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/90 backdrop-blur-3xl font-sans"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full h-[95vh] flex flex-col gap-8 items-center p-8 bg-slate-950 rounded-t-[50px] border-t border-white/10 relative overflow-y-auto no-scrollbar"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 p-3 bg-white/5 border border-white/5 rounded-2xl text-white/20 active:scale-95 transition-all"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-4 pt-4 mt-6">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/5 text-brand-400 text-[10px] font-black uppercase tracking-[0.3em] font-mono"
                >
                  <Star size={14} fill="currentColor" />
                  REWARD PROTOCOL ACTIVATED
                  <Star size={14} fill="currentColor" />
                </motion.div>
                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter font-display leading-tight">Daily <span className="text-brand-500">Streak</span></h2>
                <p className="text-xs text-slate-400 font-medium max-w-[280px] mx-auto uppercase tracking-wide font-display">Maintain your sequence to maximize asset allocation from the core systems.</p>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 px-2">
                {days.map((day, idx) => {
                  const isCurrent = idx === dailyRewardStreak % 7;
                  const isClaimed = idx < dailyRewardStreak % 7;

                  return (
                    <motion.button 
                      key={day}
                      initial={{ scale: 0.9, opacity: 0, y: 30 }}
                      animate={{ scale: isCurrent ? 1.02 : 1, opacity: 1, y: 0 }}
                      transition={{ ...springTransition, delay: idx * 0.05 }}
                      onClick={isCurrent && canClaim ? (e) => {
                        handleClaim();
                        confetti({
                          particleCount: 50,
                          spread: 60,
                          origin: { y: e.clientY / window.innerHeight, x: e.clientX / window.innerWidth },
                          colors: ['#6366f1', '#a855f7', '#ec4899']
                        });
                      } : undefined}
                      className={`relative p-6 rounded-[35px] border-2 flex flex-col items-center justify-between transition-all group overflow-hidden h-44 ${
                        isCurrent 
                          ? 'bg-brand-500 border-white text-white z-10 shadow-[0_15px_30px_rgba(99,102,241,0.3)] cursor-pointer' 
                          : isClaimed 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-60' 
                            : 'bg-white/5 border-white/5 text-white/10 shadow-inner'
                      } ${day === 7 ? 'col-span-2' : ''}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono opacity-50">DAY</span>
                        <span className="text-3xl font-black font-display tracking-tighter italic leading-none">{day}</span>
                      </div>

                      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-2xl ${isCurrent ? 'bg-white/20' : 'bg-black/40'}`}>
                        {day === 7 ? <Package size={28} /> : day === 3 || day === 5 ? <Apple size={28} /> : <Coins size={28} />}
                      </div>

                      <div className="w-full text-center">
                        {isClaimed ? (
                          <div className="flex items-center justify-center gap-1.5 text-emerald-400 leading-none">
                             <CheckCircle2 size={12} strokeWidth={3} />
                             <span className="text-[9px] font-black uppercase tracking-widest">CLAIMED</span>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-black italic tracking-widest uppercase font-display leading-none ${isCurrent ? 'text-white' : 'text-white/20'}`}>
                            {isCurrent && canClaim ? 'EXTRACT REWARD' : `DAY ${day} REWARD`}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-sm pt-4 pb-20">
                {!canClaim ? (
                  <div className="w-full py-6 rounded-[30px] font-black uppercase italic tracking-[0.2em] text-xs bg-white text-slate-950 text-center font-display shadow-xl">
                    NEXT REWARD IN 18H
                  </div>
                ) : (
                  <div className="h-6" />
                )}
                
                <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/5">
                   <Timer size={16} className="text-brand-400" />
                   <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] font-mono">CONTINUITY PROTOCOL: ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
