import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { X, CheckCircle2, Award, Coins, Package, RefreshCw } from 'lucide-react';
import { Quest } from '../../core/types';

export function QuestUI() {
  const { quests, setQuestsOpen, claimQuestReward, refreshQuests } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setQuestsOpen(false)}
    >
      <motion.div
        initial={{ y: 500, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 500, opacity: 0 }}
        className="w-full h-[85vh] bg-slate-900 border-t border-white/10 rounded-t-[40px] overflow-hidden shadow-2xl flex flex-col absolute bottom-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 bg-slate-800 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 text-left">
            <h2 className="text-xl font-black text-white italic tracking-tight font-display">DAILY MISSIONS</h2>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest leading-none mt-1">Village prosperity protocols active</p>
          </div>
          <div className="flex gap-2 relative z-10">
            <button 
              onClick={() => refreshQuests()}
              className="p-3 bg-white/5 border border-white/10 rounded-xl transition-all text-white/60 hover:text-white"
              title="Refresh Quests"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => setQuestsOpen(false)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl transition-all text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quest List */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto no-scrollbar bg-slate-900/50">
          {quests.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">No active missions available</p>
              <button 
                onClick={() => refreshQuests()}
                className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic text-[10px] tracking-widest transition-all"
              >
                REQUEST DEPLOYMENT
              </button>
            </div>
          ) : (
            quests.map((quest, idx) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <QuestCard 
                  quest={quest} 
                  onClaim={() => claimQuestReward(quest.id)} 
                />
              </motion.div>
            ))
          )}
        </div>

        <div className="px-6 py-4 bg-slate-800/80 border-t border-white/5 text-center flex justify-between items-center pb-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] text-white/40 font-black uppercase tracking-[0.2em]">Transmission stable</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuestCard({ quest, onClaim }: { quest: Quest, onClaim: () => void }) {
  const progressPercent = (quest.progress / quest.requiredAmount) * 100;
  
  return (
    <div className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
      quest.claimed 
        ? 'bg-slate-950/50 border-white/5 opacity-50' 
        : quest.completed 
          ? 'bg-brand-500/10 border-brand-500/50 shadow-[0_0_30px_rgba(var(--brand-500),0.15)]' 
          : 'bg-black/40 border-white/5 hover:border-white/10'
    }`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1">
          <h3 className="font-black text-white italic tracking-tight font-display text-base">{quest.title}</h3>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-[280px]">
            {quest.description}
          </p>
        </div>
        {quest.completed && !quest.claimed && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="p-1.5 px-3 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 size={12} strokeWidth={3} />
            VERIFIED
          </motion.div>
        )}
      </div>

      {/* Progress Section */}
      {!quest.claimed && (
        <div className="mb-5 relative z-10">
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Synchronization</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-white font-mono">{quest.progress}</span>
                <span className="text-[9px] font-bold text-white/20">/ {quest.requiredAmount}</span>
             </div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full transition-colors duration-500 ${
                quest.completed ? 'bg-emerald-400' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
              }`}
            />
          </div>
        </div>
      )}

      {/* Reward & Action - Hardware style */}
      <div className="flex items-center justify-between gap-4 py-2 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Protocol Reward</span>
            <div className="flex items-center gap-1.5">
              <Coins size={12} className="text-amber-400" />
              <span className="text-xs font-black text-white italic font-mono">{quest.reward.gold}</span>
            </div>
          </div>
          
          {quest.reward.items.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Asset Bonus</span>
              <div className="flex items-center gap-3">
                {quest.reward.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Package size={12} className="text-cyan-400" />
                    <span className="text-[9px] font-black text-white italic uppercase tracking-tight">{item.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          disabled={!quest.completed || quest.claimed}
          onClick={onClaim}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black italic tracking-widest transition-all duration-300 ${
            quest.claimed
              ? 'bg-white/5 text-white/10 cursor-not-allowed'
              : quest.completed
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95'
                : 'bg-white/5 text-white/30 border border-white/5'
          }`}
        >
          {quest.claimed ? 'EXECUTED' : 'CLAIM REWARD'}
        </button>
      </div>
    </div>
  );
}
