/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { Sword, ArrowLeft, RotateCw, Skull, Trophy } from 'lucide-react';
import { audioService } from '../../services/audioService';

export function CombatUI() {
  const { 
    combatStatus, setViewMode, startMatchmaking, cancelMatchmaking,
    deployUnit, selectedCombatUnit, setCombatUnit 
  } = useGameStore(useShallow(s => ({
    combatStatus: s.combatStatus,
    setViewMode: s.setViewMode,
    startMatchmaking: s.startMatchmaking,
    cancelMatchmaking: s.cancelMatchmaking,
    deployUnit: s.deployUnit,
    selectedCombatUnit: s.selectedCombatUnit,
    setCombatUnit: s.setCombatUnit
  })));

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col font-sans">
      {/* Search Header */}
      <AnimatePresence>
        {combatStatus === 'searching' && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 inset-x-0 bg-black/80 backdrop-blur-md p-8 flex flex-col items-center gap-4 border-b border-white/10 pointer-events-auto"
          >
            <RotateCw size={32} className="text-blue-400 animate-spin" />
            <h2 className="text-xl font-black text-white italic uppercase tracking-widest">Searching for Target...</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Matching based on Village Level</p>
            
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
          <div className="absolute top-4 left-4 flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 rounded-3xl border border-white/10 pointer-events-auto">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Enemy Defenses</span>
                <span className="text-lg font-black text-white italic">14 Structures</span>
             </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
             <button 
               onClick={() => useGameStore.setState({ combatStatus: 'idle', viewMode: 'menu' })}
               className="bg-black/60 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-white/60 hover:text-white transition-all uppercase text-[10px] font-black italic tracking-widest"
             >
               Surrender
             </button>
          </div>

          {/* Unit Deployment Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-xl p-4 rounded-[40px] border border-white/10 pointer-events-auto shadow-2xl">
             <DeploymentButton 
               icon="⚔️" 
               label="Soldier" 
               active={selectedCombatUnit === 'soldier'}
               onClick={() => setCombatUnit('soldier')} 
             />
             <DeploymentButton 
               icon="🏹" 
               label="Archer" 
               active={selectedCombatUnit === 'archer'}
               onClick={() => setCombatUnit('archer')} 
             />
             <DeploymentButton 
               icon="🛡️" 
               label="Heavy" 
               active={selectedCombatUnit === 'heavy'}
               onClick={() => setCombatUnit('heavy')} 
             />
          </div>
        </>
      )}

      <CombatOverlay combatStatus={combatStatus} setViewMode={setViewMode} />

      {/* Start Button */}
      {combatStatus === 'idle' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 flex flex-col gap-4 text-center"
          >
             <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                <Sword size={40} className="text-red-500" />
             </div>
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">BATTLE MODE</h2>
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Conquer others to earn Gold and Rank Points</p>
             <button 
               onClick={startMatchmaking}
               className="bg-red-600 text-white font-black py-5 rounded-3xl uppercase italic tracking-widest shadow-xl hover:bg-red-500 transition-all active:scale-95"
             >
               Find Match
             </button>
             <button 
               onClick={() => setViewMode('menu')}
               className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
             >
               Back to Menu
             </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CombatOverlay({ combatStatus, setViewMode }: { combatStatus: string, setViewMode: any }) {
  if (combatStatus !== 'victory' && combatStatus !== 'defeat') return null;

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

function DeploymentButton({ icon, label, onClick, active = false }: { icon: string, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 p-2 hover:scale-105 transition-all active:scale-90 ${active ? 'scale-110' : 'opacity-60'}`}
    >
       <div className={`w-14 h-14 bg-white/5 border rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all ${active ? 'border-blue-400 bg-blue-400/10' : 'border-white/10 group-hover:bg-white/10 group-hover:border-white/20'}`}>
          {icon}
       </div>
       <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-blue-400' : 'text-white/40'}`}>{label}</span>
    </button>
  );
}
