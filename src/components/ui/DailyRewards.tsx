/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, CheckCircle2, Star, Timer, 
  Package, Coins, Pickaxe, Trees, Apple, X
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { rewardService } from '../../services/rewardService';

export function DailyRewards() {
  const [isOpen, setIsOpen] = useState(false);
  const { lastDailyClaim, dailyRewardStreak, addResource, resources } = useGameStore();
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
    if (canClaim) {
        setIsOpen(true);
    }
  }, [canClaim]);

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
    Object.entries(currentReward).forEach(([k, v]) => {
        addResource(k as any, v as number);
    });

    useGameStore.setState((state) => ({ 
        dailyRewardStreak: state.dailyRewardStreak + 1,
        lastDailyClaim: Date.now()
    }));

    setTimeout(() => {
        setClaiming(false);
        setIsOpen(false);
    }, 1000);
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      {canClaim && (
         <button 
           onClick={() => setIsOpen(true)}
           className="fixed top-24 left-4 z-30 w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-amber-500/20 animate-bounce pointer-events-auto"
         >
           <Gift size={20} />
         </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl font-sans"
          >
            <div className="max-w-2xl w-full flex flex-col gap-8 items-center">
              
              <div className="text-center space-y-2">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest"
                >
                  <Star size={12} fill="currentColor" />
                  Daily Bonus System
                  <Star size={12} fill="currentColor" />
                </motion.div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Login Streak</h2>
                <p className="text-sm text-white/40 font-medium max-w-xs mx-auto">Claim increasing rewards every day. Don't break the chain!</p>
              </div>

              <div className="w-full grid grid-cols-2 md:grid-cols-7 gap-3">
                {days.map((day, idx) => {
                  const isCurrent = idx === dailyRewardStreak % 7;
                  const isClaimed = idx < dailyRewardStreak % 7;
                  const isUpcoming = idx > dailyRewardStreak % 7;

                  return (
                    <div 
                      key={day}
                      className={`relative p-4 h-32 rounded-3xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        isCurrent 
                          ? 'bg-amber-500 border-amber-400 text-black scale-110 z-10 shadow-2xl shadow-amber-500/20' 
                          : isClaimed 
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 opacity-60' 
                            : 'bg-white/5 border-white/5 text-white/20 shadow-inner'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase">Day {day}</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/10">
                        {day === 7 ? <Package size={24} /> : day === 3 || day === 5 ? <Apple size={20} /> : <Coins size={20} />}
                      </div>
                      <div className="flex flex-col items-center">
                        {isClaimed ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <span className="text-[10px] font-black italic">
                            {day === 7 ? 'MEGA' : day === 4 ? 'BUNDLE' : `REWARD`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <button 
                  onClick={handleClaim}
                  disabled={!canClaim || claiming}
                  className={`w-full py-5 rounded-[32px] font-black uppercase italic tracking-widest text-sm shadow-2xl transition-all active:scale-95 ${
                    canClaim 
                      ? 'bg-white text-black hover:bg-amber-400' 
                      : 'bg-white/10 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {claiming ? 'Processing...' : canClaim ? 'Claim Reward' : 'Come back tomorrow'}
                </button>
                
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest flex items-center gap-2">
                   < Timer size={12} />
                   Streak resets in 24 hours
                </p>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-all"
              >
                <X size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
