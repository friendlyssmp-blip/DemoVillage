/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { Trophy, ArrowLeft, Coins, Users, Star, Medal } from 'lucide-react';

export function RankedMenu() {
  const { setViewMode, leaderboard, playerName, rankedPoints, rankTier, user } = useGameStore(useShallow(s => ({
    setViewMode: s.setViewMode,
    leaderboard: s.leaderboard,
    playerName: s.playerName,
    rankedPoints: s.rankedPoints,
    rankTier: s.rankTier,
    user: s.user
  })));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setViewMode('menu')} />
      
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-6 text-black flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="bg-black/20 p-3 rounded-2xl">
                <Trophy size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">World Rankings</h2>
                <div className="flex items-center gap-2">
                   <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Season 1: Primal Dawn</p>
                   {rankTier && (
                     <>
                        <span className="w-1 h-1 bg-black/30 rounded-full" />
                        <span className="text-[10px] font-black uppercase text-black/60">{rankTier} TIER</span>
                     </>
                   )}
                </div>
             </div>
          </div>
          <button 
            onClick={() => setViewMode('menu')}
            className="p-3 bg-black/10 hover:bg-black/20 rounded-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* User Stats Summary */}
        <div className="px-6 py-4 bg-amber-500/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your Rating</span>
               <span className="text-2xl font-black text-amber-500 italic tracking-tighter">{rankedPoints} RP</span>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Rank</span>
               <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-xl font-black text-white">#{leaderboard.findIndex(e => e.userId === user.uid) + 1 || '--'}</span>
               </div>
            </div>
        </div>

        {/* Leaderboard List */}
        <div className="p-6 space-y-3 flex-1 overflow-hidden">
          <div className="grid grid-cols-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">
            <span className="col-span-1">Rank</span>
            <span className="col-span-2">Chief</span>
            <span className="col-span-1 text-center">Score</span>
            <span className="col-span-1 text-right">Village</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, idx) => (
                <LeaderboardRow key={entry.userId} entry={{...entry, rank: idx + 1}} isSelf={entry.userId === user.uid} />
              ))
            ) : (
              <div className="py-12 text-center text-white/20 uppercase font-black italic">
                 No candidates found
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-center">
           <div className="flex gap-8">
              <div className="flex items-center gap-2">
                 <Coins size={14} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-tight">Total Pot</span>
                 <span className="text-sm font-black text-white italic">1.2M</span>
              </div>
              <div className="flex items-center gap-2">
                 <Users size={14} className="text-emerald-400" />
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-tight">Active Chiefs</span>
                 <span className="text-sm font-black text-white italic">14.2K</span>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function LeaderboardRow({ entry, isSelf }: { entry: any, isSelf: boolean }) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-white/40';
  };

  return (
    <div className={`grid grid-cols-5 items-center px-6 py-4 rounded-2xl border transition-all ${isSelf ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-white/5'}`}>
       <div className={`col-span-1 font-black italic text-xl ${getRankColor(entry.rank)}`}>
          #{entry.rank}
       </div>
       <div className="col-span-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">
             <Star size={14} />
          </div>
          <div className="flex flex-col">
             <span className="text-sm font-black text-white uppercase tracking-tighter italic leading-none">{entry.name}</span>
             {isSelf && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">You</span>}
          </div>
       </div>
       <div className="col-span-1 text-center font-black text-white italic tracking-tighter">
          {entry.gold.toLocaleString()}
       </div>
       <div className="col-span-1 text-right flex items-center justify-end gap-2">
          <Medal size={14} className="text-blue-400" />
          <span className="text-sm font-black text-white">LV.{entry.level}</span>
       </div>
    </div>
  );
}
