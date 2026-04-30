/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, TROOP_TYPES } from '../../store/useGameStore';
import { TroopType, TroopStats } from '../../types';
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
            className="absolute top-0 inset-x-0 bg-black/80 backdrop-blur-md p-8 flex flex-col items-center gap-4 border-b border-white/10 pointer-events-auto"
          >
            <RotateCw size={32} className="text-blue-400 animate-spin" />
            <h2 className="text-xl font-black text-white italic uppercase tracking-widest">Searching for Rival...</h2>
            <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
               <span className="text-xs font-mono text-blue-400">{searchTime}s</span>
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Searching...</span>
            </div>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest max-w-xs text-center">We are scouting for a village that matches your power level. Estimated time: {'<'} 30s</p>
            
            <button 
              onClick={cancelMatchmaking}
              className="mt-2 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
            >
              Cancel Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat HUD */}
      {combatStatus === 'attacking' && (
        <>
          {/* Top HUD: Timer and Destruction % */}
          <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-4 pointer-events-auto">
             {/* Battle Timer */}
             <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex flex-col items-center min-w-[120px]">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Time Left</span>
                <span className={`text-2xl font-black font-mono leading-none ${battleTimeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                   {formatTime(battleTimeLeft)}
                </span>
             </div>

             {/* Destruction Percentage */}
             <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-[40px] border border-white/10 flex flex-col items-center min-w-[160px] relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/10" style={{ width: `${destructionPercentage}%` }} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 relative z-10">Buildings Destroyed</span>
                <span className="text-3xl font-black text-white italic leading-none relative z-10">
                   {destructionPercentage}%
                </span>
                <div className="mt-2 text-[8px] font-black text-white/20 uppercase tracking-[0.2em] relative z-10">
                   {destructionPercentage >= 50 ? "⭐️ VICTORY" : "SCUTTLING"}
                </div>
             </div>
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-4 rounded-3xl border border-white/10 pointer-events-auto">
             <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Opponent</span>
             <span className="text-sm font-black text-white uppercase italic truncate max-w-[150px]">{opponentName}</span>
             <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div 
                   className="h-full bg-red-500 transition-all duration-500" 
                   style={{ width: `${(enemyBuildings.filter(b => b.health > 0).length / enemyBuildings.length) * 100}%` }} 
                />
             </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
             {isReplaying ? (
               <div className="flex gap-2">
                 {[1, 2, 4].map(speed => (
                   <button 
                     key={speed}
                     onClick={() => useGameStore.setState({ replaySpeed: speed })}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${replaySpeed === speed ? 'bg-amber-500 text-black border-amber-400' : 'bg-black/60 text-white/40 border-white/10'}`}
                   >
                     {speed}X
                   </button>
                 ))}
                 <button 
                   onClick={stopReplay}
                   className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic border border-red-500 shadow-lg shadow-red-500/20"
                 >
                   Exit
                 </button>
               </div>
             ) : (
               <button 
                 onClick={() => useGameStore.setState({ combatStatus: 'idle', viewMode: 'menu' })}
                 className="bg-black/60 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-white/60 hover:text-white transition-all uppercase text-[10px] font-black italic tracking-widest hover:bg-red-900/40"
               >
                 Surrender
               </button>
             )}
          </div>

          {/* Unit Deployment Bar */}
          {!isReplaying ? (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-xl p-4 rounded-[40px] border border-white/10 pointer-events-auto shadow-2xl">
               <DeploymentButton 
                 icon="⚔️" 
                 label="Warrior"
                 count={army.warrior}
                 active={selectedCombatUnit === 'warrior'}
                 onClick={() => setCombatUnit('warrior')} 
               />
               <DeploymentButton 
                 icon="🏹" 
                 label="Archer"
                 count={army.archer}
                 active={selectedCombatUnit === 'archer'}
                 onClick={() => setCombatUnit('archer')} 
               />
               <DeploymentButton 
                 icon="🛡️" 
                 label="Tank" 
                 count={army.tank}
                 active={selectedCombatUnit === 'tank'}
                 onClick={() => setCombatUnit('tank')} 
               />
               <DeploymentButton 
                 icon="⚡" 
                 label="Scout" 
                 count={army.scout}
                 active={selectedCombatUnit === 'scout'}
                 onClick={() => setCombatUnit('scout')} 
               />
            </div>
          ) : (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-8 py-3 rounded-[40px] border border-white/10 pointer-events-none shadow-2xl flex items-center gap-3">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
               <span className="text-sm font-black text-white uppercase italic tracking-[0.2em]">REPLAYING BATTLE</span>
            </div>
          )}
        </>
      )}

      <CombatOverlay combatStatus={combatStatus} setViewMode={setViewMode} />

      {/* Start Button & Army Prep */}
      {combatStatus === 'idle' && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center pointer-events-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl px-6 flex flex-col gap-6"
          >
             <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center border border-red-500/30">
                   <Sword size={32} className="text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Prepare for Raid</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4">Select your forces to conquer other villages</p>
             </div>

             {/* Army Selection Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.entries(TROOP_TYPES) as [TroopType, TroopStats][]).map(([tid, stats]) => (
                   <div key={tid} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col gap-3 relative group">
                      <div className="flex items-center justify-between">
                         <span className="text-2xl">{tid === 'warrior' ? '⚔️' : tid === 'archer' ? '🏹' : tid === 'tank' ? '🛡️' : '⚡'}</span>
                         <span className="text-[10px] font-black text-white/60">Lv.1</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-white uppercase italic">{stats.name}</span>
                         <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{stats.health}HP • {stats.damage}ATK</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white">x{army[tid]}</span>
                            <span className="text-[8px] text-white/20 uppercase">Units</span>
                         </div>
                         <button 
                           onClick={() => useGameStore.getState().trainTroop(tid)}
                           className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90"
                         >
                            <Sword size={14} className="text-white" />
                         </button>
                      </div>
                      {/* Price Tag */}
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {stats.cost.food} FOOD
                      </div>
                   </div>
                ))}
             </div>

             {/* Army Capacity Bar */}
             <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col gap-2">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Army Capacity</span>
                   <span className="text-xs font-black text-white italic">
                      {Object.entries(army).reduce((s, [t, c]) => s + (c * TROOP_TYPES[t as TroopType].capacity), 0)} / {useGameStore.getState().maxArmyCapacity}
                   </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-red-500 transition-all duration-500" 
                      style={{ width: `${(Object.entries(army).reduce((s, [t, c]) => s + (c * TROOP_TYPES[t as TroopType].capacity), 0) / useGameStore.getState().maxArmyCapacity) * 100}%` }}
                   />
                </div>
             </div>

             <div className="flex flex-col gap-2 pt-4">
                <button 
                  onClick={startMatchmaking}
                  className="bg-red-600 text-white font-black py-6 rounded-[32px] uppercase italic tracking-[0.2em] shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all active:scale-95 text-sm"
                >
                  Find Match & Battle
                </button>
                <button 
                  onClick={() => setViewMode('menu')}
                  className="py-4 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Back to Village
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

function DeploymentButton({ icon, label, count, onClick, active = false }: { icon: string, label: string, count: number, onClick: () => void, active?: boolean }) {
  return (
    <motion.button 
      {...tapAnimation}
      transition={springTransition}
      onClick={onClick}
      disabled={count <= 0}
      className={`group flex flex-col items-center gap-2 p-2 transition-all ${active ? 'scale-110' : count <= 0 ? 'opacity-20 grayscale' : 'opacity-60'}`}
    >
       <div className={`w-14 h-14 bg-white/5 border rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all relative ${active ? 'border-red-500 bg-red-500/10' : 'border-white/10 group-hover:bg-white/10 group-hover:border-white/20'}`}>
          {icon}
          {count > 0 && (
             <div className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-black shadow-lg">
                x{count}
             </div>
          )}
       </div>
       <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
    </motion.button>
  );
}
