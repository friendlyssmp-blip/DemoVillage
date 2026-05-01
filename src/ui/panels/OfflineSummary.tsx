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
        className="fixed inset-0 z-[100] flex items-end justify-center p-0 backdrop-blur-md bg-black/60"
        onClick={closeOfflineSummary}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-zinc-950 border-t border-white/10 rounded-t-[40px] w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-900 px-8 py-10 text-white relative border-b border-white/5">
            <button 
              onClick={closeOfflineSummary}
              className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-all"
            >
              <X size={20} className="text-white/40" />
            </button>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-brand-500 p-4 rounded-3xl shadow-xl shadow-brand-500/20">
                <Clock size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">WELCOME BACK</h2>
                <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">Away Interval: {timeString}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">PROD PROTOCOLS</h3>
                <TrendingUp size={14} className="text-white/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(generated).map(([res, amount]) => (
                  <div key={res} className="glass-panel border-white/5 p-4 rounded-3xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-white/40 leading-none">{res}</span>
                      {resourceIcons[res as keyof typeof resourceIcons]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white font-mono">+{Math.floor(amount)}</span>
                      {lost[res as keyof typeof lost] > 0 && (
                        <span className="text-[9px] font-black text-red-500 uppercase">-{Math.floor(lost[res as keyof typeof lost])} WASTED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {foodShortage ? (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex gap-4 items-center">
                <AlertTriangle className="text-red-500 shrink-0" size={24} />
                <div className="flex-1">
                  <h4 className="text-xs font-black text-red-500 uppercase italic">FAMINE PROTOCOL</h4>
                  <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-1">Production throttled 80% due to starvation.</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex gap-4 items-center">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                <div className="flex-1">
                  <h4 className="text-xs font-black text-emerald-500 uppercase italic">STABLE VITALITY</h4>
                  <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-1">All systems nominal. Citizens healthy.</p>
                </div>
              </div>
            )}

            <button 
              onClick={closeOfflineSummary}
              className="w-full bg-white text-slate-950 font-black py-6 rounded-[30px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl text-xs uppercase italic tracking-[0.2em] font-display"
            >
              <span>ACCESS VILLAGE</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
