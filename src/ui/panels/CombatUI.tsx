/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, TROOP_STATS } from '../../store/useGameStore';
import { TroopType, TroopStats } from '../../core/types';
import { Sword, ArrowLeft, RotateCw, Skull, Trophy } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { 
  tapAnimation, springTransition, menuTransition 
} from '../../lib/animations';

export function CombatUI() {
  const { 
    combatStatus, setViewMode, startMatchmaking, cancelMatchmaking,
    deployUnit, selectedCombatUnit, setCombatUnit,
    battleTimeLeft, destructionPercentage, matchmakingQueueStartTime,
    opponentName, army, enemyBuildings,
    isReplaying, replaySpeed, stopReplay
  } = useGameStore(useShallow(s => ({
    combatStatus: s.combatStatus,
    setViewMode: s.setViewMode,
    startMatchmaking: s.startMatchmaking,
    cancelMatchmaking: s.cancelMatchmaking,
    deployUnit: s.deployUnit,
    selectedCombatUnit: s.selectedCombatUnit,
    setCombatUnit: s.setCombatUnit,
    battleTimeLeft: s.battleTimeLeft,
    destructionPercentage: s.destructionPercentage,
    matchmakingQueueStartTime: s.matchmakingQueueStartTime,
    opponentName: s.opponentName,
    army: s.army,
    enemyBuildings: s.enemyBuildings,
    isReplaying: s.isReplaying,
    replaySpeed: s.replaySpeed,
    stopReplay: s.stopReplay
  })));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (combatStatus === 'searching') {
      const interval = setInterval(() => setTick(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [combatStatus]);

  const searchTime = matchmakingQueueStartTime ? Math.floor((Date.now() - matchmakingQueueStartTime) / 1000) : 0;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col font-sans">
      {/* Search Header */}
      <AnimatePresence>
        {combatStatus === 'searching' && (
          <motion.div 
            {...menuTransition}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-xl p-8 rounded-[40px] flex flex-col items-center gap-6 border border-white/10 pointer-events-auto shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse" />
              <RotateCw size={48} className="text-blue-400 animate-spin relative z-10" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Searching...</h2>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">Establishing Uplink</p>
            </div>
            <div className="bg-white/5 px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
               <span className="text-lg font-black font-mono text-white leading-none">{searchTime}s</span>
            </div>
            
            <button 
              onClick={cancelMatchmaking}
              className="mt-4 bg-white text-black px-10 py-5 rounded-3xl text-sm font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Cancel Scout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat HUD */}
      {combatStatus === 'attacking' && (
        <>
          {/* Top HUD: Timer and Destruction % */}
          <div className="absolute top-2 inset-x-2 flex flex-col gap-2 pointer-events-none">
             <div className="flex justify-between items-center w-full pointer-events-auto px-2">
                {/* Battle Timer */}
                <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">TIME</span>
                   <span className={`text-lg font-black font-mono leading-none ${battleTimeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                      {formatTime(battleTimeLeft)}
                   </span>
                </div>

                {/* Exit/Surrender */}
                <div className="flex items-center gap-2">
                   {isReplaying ? (
                      <button onClick={stopReplay} className="bg-red-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase">EXIT</button>
                   ) : (
                      <button onClick={() => useGameStore.setState({ combatStatus: 'idle', viewMode: 'menu' })} className="glass-panel px-4 py-2 rounded-2xl text-white/40 text-[10px] font-black">SURRENDER</button>
                   )}
                </div>
             </div>

             {/* Progress HUD */}
             <div className="px-2 pointer-events-auto">
               <div className="glass-panel p-4 rounded-[30px] flex items-center justify-between gap-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-red-600/5 transition-all duration-500" style={{ width: `${destructionPercentage}%` }} />
                  <div className="flex flex-col relative z-10">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">CITY SECURED</span>
                     <span className="text-2xl font-black text-white italic leading-none">{destructionPercentage}%</span>
                  </div>
                  <div className="text-right relative z-10">
                     <span className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">TARGET IDENT</span>
                     <span className="block text-[11px] font-black text-white uppercase italic truncate max-w-[120px] leading-none">{opponentName}</span>
                  </div>
               </div>
             </div>
          </div>

          {/* Unit Deployment Bar - Optimized for portrait thumbs */}
          {!isReplaying ? (
            <div className="absolute bottom-10 inset-x-4 glass-panel p-2 rounded-[32px] border border-white/10 pointer-events-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
               <div className="grid grid-cols-4 gap-1">
                  <DeploymentButton 
                    icon="⚔️" 
                    count={army.warrior}
                    active={selectedCombatUnit === 'warrior'}
                    onClick={() => setCombatUnit('warrior')} 
                  />
                  <DeploymentButton 
                    icon="🏹" 
                    count={army.archer}
                    active={selectedCombatUnit === 'archer'}
                    onClick={() => setCombatUnit('archer')} 
                  />
                  <DeploymentButton 
                    icon="🛡️" 
                    count={army.tank}
                    active={selectedCombatUnit === 'tank'}
                    onClick={() => setCombatUnit('tank')} 
                  />
                  <DeploymentButton 
                    icon="⚡" 
                    count={army.scout}
                    active={selectedCombatUnit === 'scout'}
                    onClick={() => setCombatUnit('scout')} 
                  />
               </div>
            </div>
          ) : (
            <div className="absolute bottom-10 inset-x-4 bg-red-600/90 backdrop-blur-xl px-8 py-5 rounded-[40px] border border-red-500 pointer-events-none shadow-2xl flex items-center justify-center gap-3">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
               <span className="text-sm font-black text-white uppercase italic tracking-[0.2em]">LIVE FEED ACTIVE</span>
            </div>
          )}
        </>
      )}

      <CombatOverlay combatStatus={combatStatus} setViewMode={setViewMode} />

      {/* Start Button & Army Prep */}
      {combatStatus === 'idle' && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto overflow-y-auto pt-8 pb-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full px-6 flex flex-col gap-6"
          >
             <div className="flex justify-between items-start">
               <div className="flex flex-col">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">ATTACK HUB</h2>
                  <p className="text-[9px] font-black text-brand-400 uppercase tracking-[0.3em]">Operational Readiness Status: 100%</p>
               </div>
               <button onClick={() => setViewMode('menu')} className="p-3 glass-panel rounded-2xl text-white/40 active:scale-95"><Sword size={18} className="rotate-180" /></button>
             </div>

             {/* Army Selection Grid */}
             <div className="grid grid-cols-2 gap-3">
                {(Object.entries(TROOP_STATS) as [TroopType, TroopStats][]).map(([tid, stats]) => (
                   <div key={tid} className="glass-panel border-white/5 p-4 rounded-3xl flex flex-col gap-3 relative group">
                      <div className="flex items-center justify-between">
                         <span className="text-2xl">{tid === 'warrior' ? '⚔️' : tid === 'archer' ? '🏹' : tid === 'tank' ? '🛡️' : '⚡'}</span>
                         <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">FOOD COST</span>
                            <span className="text-[10px] font-black text-emerald-400 font-mono leading-none">{stats.cost.food}</span>
                         </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-white uppercase italic">{stats.name}</span>
                         <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{stats.health}HP / {stats.damage}ATK</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                         <span className="text-[14px] font-black text-white font-mono leading-none">x{army[tid]}</span>
                         <button 
                           onClick={() => useGameStore.getState().trainTroop(tid)}
                           className="bg-brand-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] active:scale-90 transition-all uppercase tracking-tighter"
                         >
                            Deploy
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             {/* Army Capacity - Full Width */}
             <div className="glass-panel border-white/5 p-5 rounded-[32px] flex flex-col gap-3">
                <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">DEPLOYMENT LIMIT</span>
                      <span className="text-lg font-black text-white italic leading-none">
                         {Object.entries(army).reduce((s, [t, c]) => s + (c * TROOP_STATS[t as TroopType].capacity), 0)} / {useGameStore.getState().maxArmyCapacity}
                      </span>
                   </div>
                   <div className="px-3 py-1 glass-panel rounded-lg text-[9px] font-black text-brand-400 uppercase tracking-widest">ACTIVE</div>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <div 
                      className="h-full bg-brand-500 transition-all duration-500 shadow-[0_0_10px_rgba(51,84,255,0.5)]" 
                      style={{ width: `${(Object.entries(army).reduce((s, [t, c]) => s + (c * TROOP_STATS[t as TroopType].capacity), 0) / useGameStore.getState().maxArmyCapacity) * 100}%` }}
                   />
                </div>
             </div>

             <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={startMatchmaking}
                  className="bg-white text-slate-950 font-black py-6 rounded-[32px] uppercase italic tracking-[0.2em] shadow-2xl active:scale-95 text-sm font-display"
                >
                  INITIATE SCOUTING
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CombatOverlay({ combatStatus, setViewMode }: { combatStatus: string, setViewMode: any }) {
  if (combatStatus !== 'victory' && combatStatus !== 'defeat' && combatStatus !== 'matchmaking_failed') return null;

  if (combatStatus === 'matchmaking_failed') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/90 flex items-center justify-center pointer-events-auto"
      >
        <motion.div 
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40">
             <Trophy size={48} className="grayscale opacity-20" />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">FAILED</h2>
            <p className="text-xs font-bold text-red-400 uppercase tracking-[0.3em] mt-2">No Opponent Found</p>
          </div>
          <p className="text-xs text-white/40 max-w-xs mx-auto">All scouts returned empty handed. Try again in a few moments or upgrade your village to attract rivals.</p>
          <button 
            onClick={() => useGameStore.setState({ combatStatus: 'idle' })}
            className="w-full bg-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-xs px-12"
          >
            Try Again
          </button>
          <button 
            onClick={() => {
              useGameStore.setState({ combatStatus: 'idle', viewMode: 'menu' });
            }}
            className="w-full text-white/40 font-black py-2 uppercase tracking-widest text-[10px]"
          >
            Return Home
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/90 flex items-center justify-center pointer-events-auto"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className={`w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto border-2 ${combatStatus === 'victory' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' : 'bg-red-500/20 border-red-500/40 text-red-500'}`}>
           {combatStatus === 'victory' ? <Trophy size={48} /> : <Skull size={48} />}
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            {combatStatus === 'victory' ? 'VICTORY' : 'DEFEAT'}
          </h2>
          <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Battle Results</p>
        </div>

        {combatStatus === 'victory' && (
          <div className="flex gap-4 justify-center">
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] font-black text-amber-500 uppercase">+150 Gold</span>
                <span className="text-[8px] text-white/40 uppercase">Victory Bonus</span>
             </div>
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-400 uppercase">+25 RP</span>
                <span className="text-[8px] text-white/40 uppercase">Rank Progress</span>
             </div>
          </div>
        )}

        <button 
          onClick={() => {
            const { addResource, rankedPoints } = useGameStore.getState();
            if (combatStatus === 'victory') {
               audioService.play('claim');
               addResource('gold', 150);
               useGameStore.setState({ rankedPoints: rankedPoints + 25 });
            } else {
               audioService.play('close');
               useGameStore.setState({ rankedPoints: Math.max(0, rankedPoints - 15) });
            }
            useGameStore.setState({ combatStatus: 'idle', viewMode: 'menu' });
          }}
          className="w-full bg-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-xs hover:bg-zinc-200 transition-all active:scale-95 px-12"
        >
          Return Home
        </button>
      </motion.div>
    </motion.div>
  );
}

function DeploymentButton({ icon, count, onClick, active = false }: { icon: string, label?: string, count: number, onClick: () => void, active?: boolean }) {
  return (
    <motion.button 
      {...tapAnimation}
      transition={springTransition}
      onClick={onClick}
      disabled={count <= 0}
      className={`group flex flex-col items-center gap-1 p-1 transition-all ${active ? 'scale-105' : count <= 0 ? 'opacity-20 grayscale' : 'opacity-80'}`}
    >
       <div className={`w-full aspect-square rounded-[20px] flex items-center justify-center text-xl shadow-inner transition-all relative border-2 ${active ? 'bg-brand-500 border-white text-white' : 'glass-panel border-white/10 group-active:bg-white/10'}`}>
          {icon}
          {count > 0 && (
             <div className="absolute -top-1 -right-1 bg-white text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-slate-900 shadow-xl">
                {count}
             </div>
          )}
       </div>
    </motion.button>
  );
}
