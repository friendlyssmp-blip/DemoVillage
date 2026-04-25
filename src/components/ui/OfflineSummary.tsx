/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, TrendingUp, AlertTriangle, CheckCircle2, 
  Pickaxe, Trees, Apple, Coins, X
} from 'lucide-react';

export function OfflineSummary() {
  const { offlineSummary, closeOfflineSummary } = useGameStore();

  if (!offlineSummary || !offlineSummary.active) return null;

  const { timeAway, generated, lost, foodShortage } = offlineSummary;
  
  const hours = Math.floor(timeAway / 3600000);
  const minutes = Math.floor((timeAway % 3600000) / 60000);
  
  const timeString = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  const resourceIcons = {
    wood: <Trees size={16} className="text-amber-600" />,
    stone: <Pickaxe size={16} className="text-slate-500" />,
    food: <Apple size={16} className="text-emerald-600" />,
    gold: <Coins size={16} className="text-yellow-500" />
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <button 
              onClick={closeOfflineSummary}
              className="absolute top-6 right-6 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Welcome Back!</h2>
                <p className="text-sm font-bold opacity-80">You were away for {timeString}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Production Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(generated).map(([res, amount]) => (
                  <div key={res} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase opacity-40">{res}</span>
                      {resourceIcons[res as keyof typeof resourceIcons]}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-white">+{Math.floor(amount)}</span>
                      {lost[res as keyof typeof lost] > 0 && (
                        <span className="text-[9px] font-bold text-red-400">({Math.floor(lost[res as keyof typeof lost])} lost)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {foodShortage && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex gap-3 items-start">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-black text-amber-500 uppercase italic">Food Shortage!</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed font-medium">Your village ran out of food during your absence. Production slowed down significantly to prevent starvation.</p>
                </div>
              </div>
            )}

            {!foodShortage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex gap-3 items-start">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-black text-emerald-500 uppercase italic">Healthy Economy</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed font-medium">Your citizens were well-fed and worked efficiently throughout your time away.</p>
                </div>
              </div>
            )}

            <button 
              onClick={closeOfflineSummary}
              className="w-full bg-white text-black font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-xl group overflow-hidden relative text-xs uppercase italic tracking-widest"
            >
              <TrendingUp size={18} />
              <span>Resume Village</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
