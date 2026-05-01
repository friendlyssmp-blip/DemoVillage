import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { Trophy, ArrowLeft, Coins, Users, Star, Medal, PlayCircle, History } from 'lucide-react';

export function RankedMenu() {
  const { setViewMode, leaderboard, playerName, rankedPoints, rankTier, user, replays, startReplay } = useGameStore(useShallow(s => ({
    setViewMode: s.setViewMode,
    leaderboard: s.leaderboard,
    playerName: s.playerName,
    rankedPoints: s.rankedPoints,
    rankTier: s.rankTier,
    user: s.user,
    replays: s.replays,
    startReplay: s.startReplay
  })));

  const [activeTab, setActiveTab] = useState<'ranks' | 'history'>('ranks');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setViewMode('menu')} />
      
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-2xl h-[85vh] bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-6 text-black flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
             <div className="bg-black/20 p-3 rounded-2xl">
                <Trophy size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Ranked Arena</h2>
                <div className="flex items-center gap-2">
                   <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Season 1: Primal Dawn</p>
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
        <div className="px-8 py-5 bg-black/40 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Rating</span>
                 <span className="text-2xl font-black text-amber-500 italic tracking-tighter">{rankedPoints} RP</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">League</span>
                 <span className="text-sm font-black text-white uppercase italic">{rankTier}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
               <TabButton active={activeTab === 'ranks'} onClick={() => setActiveTab('ranks')} icon={<Trophy size={14} />} label="Leaderboard" />
               <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={14} />} label="My History" />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950/20">
          <AnimatePresence mode="wait">
            {activeTab === 'ranks' ? (
              <motion.div 
                key="ranks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-3 flex-1 flex flex-col"
              >
                <div className="grid grid-cols-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">
                  <span className="col-span-1">Rank</span>
                  <span className="col-span-2">Chief</span>
                  <span className="col-span-1 text-center">Score</span>
                  <span className="col-span-1 text-right">Village</span>
                </div>

                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, idx) => (
                      <LeaderboardRow key={entry.userId} entry={{...entry, rank: idx + 1}} isSelf={entry.userId === user.uid} />
                    ))
                  ) : (
                    <div className="py-20 text-center">
                       <Trophy className="mx-auto text-white/5 mb-4" size={48} />
                       <p className="text-white/20 uppercase font-black italic">Awaiting first legends...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-3 flex-1 flex flex-col"
              >
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {replays.length > 0 ? (
                    replays.map((replay) => (
                      <ReplayRow 
                        key={replay.id} 
                        replay={replay} 
                        onWatch={() => startReplay(replay)}
                      />
                    ))
                  ) : (
                    <div className="py-20 text-center">
                       <History className="mx-auto text-white/5 mb-4" size={48} />
                       <p className="text-white/20 uppercase font-black italic">No combat data recorded</p>
                       <p className="text-[10px] text-white/10 font-bold uppercase mt-2">BATTLES WILL BE LOGGED HERE FOR REVIEW</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/5">
           <p className="text-[9px] text-center font-black text-white/10 uppercase tracking-[0.4em]">Fair Play Guaranteed • Deterministic Replay System Active</p>
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ReplayRow({ replay, onWatch }: { replay: any, onWatch: () => void }) {
  const isVictory = replay.result === 'victory';
  const isDefeat = replay.result === 'defeat';

  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 group hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
       <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm border ${isVictory ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : isDefeat ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
             {isVictory ? 'WIN' : isDefeat ? 'LOSS' : 'DRAW'}
          </div>
          <div>
             <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Attack on {replay.opponentName}</h3>
             <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">{new Date(replay.date).toLocaleDateString()}</span>
                <div className="w-1 h-1 bg-white/10 rounded-full" />
                <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest leading-none">{replay.destruction}% Dest.</span>
             </div>
          </div>
       </div>
       <button 
         onClick={onWatch}
         className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-amber-500 transition-colors active:scale-95 shadow-lg"
       >
          <PlayCircle size={14} />
          Watch Replay
       </button>
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
