/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpCircle, Info, TrendingUp, ShoppingBag, ChevronRight, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

import { audioService } from '../../services/audioService';
import { 
  tapAnimation, springTransition, shakeAnimation 
} from '../../lib/animations';

export function UpgradeModal() {
  const state = useGameStore(useShallow(s => ({
    selectedBuildingId: s.selectedBuildingId,
    selectBuilding: s.selectBuilding,
    buildings: s.buildings,
    upgradeBuilding: s.upgradeBuilding,
    resources: s.resources,
    sellResource: s.sellResource,
    startMoving: s.startMoving,
    maxCapacity: s.maxCapacity,
    boostInventory: s.boostInventory,
    activateBoost: s.activateBoost,
    activeBoosts: s.activeBoosts
  })));

  const { 
    selectedBuildingId, selectBuilding, buildings, upgradeBuilding, 
    resources, sellResource, startMoving, maxCapacity,
    boostInventory, activateBoost, activeBoosts
  } = state;

  const [activeTab, setActiveTab] = useState<'upgrade' | 'trade'>('upgrade');
  const [isShaking, setIsShaking] = useState(false);

  const b = buildings.find(item => item.id === selectedBuildingId);
  
  if (!b || !selectedBuildingId) {
    return (
      <AnimatePresence>
        {null}
      </AnimatePresence>
    );
  }

  const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
  const isMarket = b.typeId === 'market';
  const isStorage = b.typeId === 'storage' || b.typeId === 'warehouse';
  const isLab = b.typeId === 'lab';
  const isForge = b.typeId === 'forge';
  const isGoblinHut = b.typeId === 'goblin_hut';
  const isTraining = b.typeId === 'training';
  const isTower = b.typeId === 'tower' || b.typeId === 'mortar';
  const isConstructing = b.isConstructing;

  const hasSpecialTab = isMarket || isStorage || isLab || isForge || isGoblinHut || isTraining || isTower;

  // Extract cost calculation logic to match store
  const getLevelCost = (base: number, factor: number, sizeFactor: number, level: number) => {
    const levelCostMult = Math.pow(1.5, level);
    return Math.floor(base * levelCostMult * factor * sizeFactor);
  };

  const utilityMap: Record<string, number> = {
    townhall: 2.5, market: 1.8, lab: 1.8, factory: 2.0, barracks: 1.6,
    academy: 2.2, forge: 1.5, observatory: 2.0, storage: 1.2, warehouse: 1.3,
    lumberjack: 1.4, quarry: 1.4, farm: 1.4, torch: 0.6
  };

  const factor = utilityMap[b.typeId] || 1.0;
  const sizeFactor = Math.sqrt(type.size || 1);
  const isMaxLevel = b.typeId === 'torch' && b.level >= 2;

  const upgradeCost = {
    wood: getLevelCost(type.cost.wood || 0, factor, sizeFactor, b.level),
    stone: getLevelCost(type.cost.stone || 0, factor, sizeFactor, b.level),
    gold: getLevelCost(type.cost.gold || 0, factor, sizeFactor, b.level),
    food: getLevelCost(type.cost.food || 0, factor, sizeFactor, b.level),
  };
 
  const canAfford = 
    !isConstructing && !isMaxLevel &&
    resources.wood >= (upgradeCost.wood || 0) && 
    resources.stone >= (upgradeCost.stone || 0) && 
    resources.gold >= (upgradeCost.gold || 0) &&
    resources.food >= (upgradeCost.food || 0);
 
  const handleUpgrade = () => {
    if (canAfford) {
      audioService.play('build');
      upgradeBuilding(b.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      audioService.play('error');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
    }
  };

  return (
    <AnimatePresence>
      {selectedBuildingId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectBuilding(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-slate-950 border-t border-white/10 rounded-t-[50px] w-full max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-20px_60px_rgba(0,0,0,0.8)] text-white pointer-events-auto"
          >
            {/* Header */}
            <div className={`p-8 pb-10 relative overflow-hidden ${isMarket ? 'bg-amber-600/10' : isStorage ? 'bg-emerald-600/10' : 'bg-brand-600/10'}`}>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <button 
                onClick={() => selectBuilding(null)}
                onPointerDown={() => audioService.play('close', { randomized: true })}
                className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-white/5 z-20"
              >
                <X size={20} className="text-white/40" />
              </button>

              <div className="flex flex-col items-center text-center gap-5 relative z-10">
                 <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center text-5xl border-white/10 shadow-inner">
                    {getIcon(b.typeId)}
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter font-display leading-tight">{type.name}</h2>
                    <div className="flex items-center justify-center gap-3">
                      <span className="px-3 py-1 glass-panel rounded-lg text-[9px] font-black uppercase tracking-[0.3em] text-brand-400 font-mono italic">OPERATIONAL LEVEL {b.level}</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-2 mt-8 relative z-10">
                <button 
                  onClick={() => {
                    startMoving(b.id);
                    selectBuilding(null);
                  }}
                  onPointerDown={() => audioService.play('click', { randomized: true })}
                  className="w-full bg-white text-slate-950 px-6 py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all active:scale-95 font-display italic"
                >
                  <TrendingUp size={16} className="rotate-45" />
                  REPOSITION UNIT
                </button>
              </div>
            </div>

            {/* Tabs */}
            {hasSpecialTab && (
              <div className="flex bg-white/5 p-1.5 mx-6 mt-4 rounded-[28px] border border-white/5">
                 <button 
                  onClick={() => setActiveTab('upgrade')}
                  onPointerDown={() => audioService.play('click', { randomized: true })}
                  className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all font-display italic ${activeTab === 'upgrade' ? 'bg-white text-slate-950 shadow-xl' : 'text-white/40'}`}
                 >
                    CORE UPGRADE
                 </button>
                 <button 
                  onClick={() => setActiveTab('trade')}
                  onPointerDown={() => audioService.play('click', { randomized: true })}
                  className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all font-display italic ${activeTab === 'trade' ? 'bg-white text-slate-950 shadow-xl' : 'text-white/40'}`}
                 >
                    {isMarket ? 'EXCHANGE' : isStorage ? 'RESOURCES' : isLab ? 'CORE RESEARCH' : isForge ? 'WEAPONRY' : 'SUB-SYSTEMS'}
                 </button>
              </div>
            )}

            <div className="p-6 pb-20 space-y-8">
              {activeTab === 'upgrade' ? (
                <>
                  <div className="space-y-4">
                     <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex justify-between font-mono italic px-2">
                        <span>REQUISITION DATA</span>
                        <span className={isMaxLevel ? 'text-red-400' : 'text-brand-400'}>
                          {isMaxLevel ? 'TERM REACHED' : `V.${b.level} INFUSION`}
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {upgradeCost.wood > 0 && <CostCard label="Wood" value={upgradeCost.wood} current={resources.wood} color="text-amber-400" />}
                        {upgradeCost.stone > 0 && <CostCard label="Stone" value={upgradeCost.stone} current={resources.stone} color="text-slate-300" />}
                        {upgradeCost.gold > 0 && <CostCard label="Credits" value={upgradeCost.gold} current={resources.gold} color="text-yellow-400" />}
                        {upgradeCost.food > 0 && <CostCard label="Food" value={upgradeCost.food} current={resources.food} color="text-emerald-400" />}
                     </div>
                  </div>

                  <motion.button
                    {...tapAnimation}
                    animate={isShaking ? shakeAnimation.animate : {}}
                    transition={isShaking ? shakeAnimation.transition : springTransition}
                    onPointerDown={() => {
                       if (canAfford) {
                          audioService.play('critical', { randomized: true });
                       } else {
                          audioService.play('error', { volume: 0.3 });
                       }
                    }}
                    onClick={handleUpgrade}
                    className={`w-full py-7 rounded-[40px] flex flex-col items-center justify-center gap-1 font-black shadow-2xl transition-all border-2 ${
                      canAfford 
                      ? 'bg-brand-500 text-white border-white shadow-brand-500/40' 
                      : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ArrowUpCircle size={24} strokeWidth={2.5} />
                      <span className="text-xl uppercase italic tracking-tighter font-display">
                        {isConstructing ? 'SYNCING...' : isMaxLevel ? 'MAXED' : (canAfford ? 'START UPGRADE' : 'INSUFFICIENT FUNDS')}
                      </span>
                    </div>
                  </motion.button>

                  <div className="bg-brand-500/5 border border-brand-500/10 p-5 rounded-[30px] shadow-inner">
                    <div className="flex items-center gap-3 mb-1">
                      <Info size={14} className="text-brand-400" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-400 font-mono">PROTOCOL TRICK</span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase leading-relaxed font-display">
                      INTER-SPATIAL MERGE ENABLED: OVERLAY THIS UNIT ONTO A SIBLING UNIT OF IDENTICAL LEVEL TO INSTANTLY UPGRADE BOTH WITHOUT CREDITS.
                    </p>
                  </div>
                </>
              ) : isMarket ? (
                <div className="space-y-4">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic mb-2">EXCHANGE PROTOCOL</div>
                   <div className="space-y-3">
                      <TradeEntry icon="🪵" label="Bio-Matter" price={2} current={resources.wood} onSell={() => sellResource('wood', 50, 2)} />
                      <TradeEntry icon="🧱" label="Mineral" price={4} current={resources.stone} onSell={() => sellResource('stone', 25, 4)} />
                      <TradeEntry icon="🍎" label="Calories" price={1.5} current={resources.food} onSell={() => sellResource('food', 100, 1.5)} />
                   </div>
                </div>
              ) : isLab ? (
                <div className="space-y-6">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic mb-2">NEURAL BOOSTERS</div>
                   
                   {boostInventory.length === 0 ? (
                      <div className="p-10 text-center glass-panel rounded-3xl border-white/5 opacity-40">
                         <p className="text-[10px] font-black uppercase tracking-widest italic">Inventory Empty</p>
                         <p className="text-[8px] mt-2 font-mono">FINISH QUESTS OR EXPLORE TO FIND BOOSTS</p>
                      </div>
                   ) : (
                      <div className="space-y-3">
                         {Array.from(new Set(boostInventory.map(b => `${b.type}-${b.level}`))).map(key => {
                            const [type, levelStr] = key.split('-');
                            const level = parseInt(levelStr);
                            const boostsOfThisType = boostInventory.filter(b => b.type === type && b.level === level);
                            const sampleBoost = boostsOfThisType[0];
                            const isActive = activeBoosts.some(ab => ab.type === type);

                            return (
                               <div key={key} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                  <div className="flex items-center gap-4">
                                     <div className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'speed' ? 'bg-amber-500/20 text-amber-500' : type === 'damage' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {type === 'speed' ? '⚡' : type === 'damage' ? '🛡️' : '🔨'}
                                     </div>
                                     <div>
                                        <h4 className="text-xs font-black text-white uppercase italic leading-none">{sampleBoost.name}</h4>
                                        <div className="flex gap-2 mt-2">
                                           <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">x{sampleBoost.multiplier} Power</span>
                                           <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">{Math.floor(sampleBoost.duration / 60)}m duration</span>
                                        </div>
                                        <p className="text-[9px] font-black text-brand-400 mt-1">Owned: {boostsOfThisType.length}</p>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => activateBoost(sampleBoost.id)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all bg-white text-black hover:bg-brand-400 active:scale-95 shadow-lg ${isActive ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-950' : ''}`}
                                  >
                                     {isActive ? 'RE-UP' : 'USE'}
                                  </button>
                               </div>
                            );
                         })}
                      </div>
                   )}

                   <div className="pt-6 border-t border-white/5">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic mb-4">BREAKTHROUGH NODES</div>
                      <div className="space-y-3 opacity-60">
                         <ResearchRow id="combat_dmg" title="Combat Tactics" desc="+10% Damage to all troops" icon="⚔️" level={useGameStore.getState().researchLevels['combat_dmg'] || 0} />
                         <ResearchRow id="mining_eff" title="Extraction" desc="+15% Resource speed" icon="⛏️" level={useGameStore.getState().researchLevels['mining_eff'] || 0} />
                      </div>
                   </div>
                </div>
              ) : isForge ? (
                <div className="space-y-5">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic mb-2">FABRICATION QUEUE</div>
                   <button 
                     onClick={() => useGameStore.getState().startCrafting({ id: 'sword_1', name: 'Iron Sword', type: 'weapon', bonus: { damage: 2 } })}
                     className="w-full p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all font-display"
                   >
                      <div className="flex items-center gap-4">
                         <div className="text-3xl glass-panel w-12 h-12 flex items-center justify-center rounded-2xl">⚔️</div>
                         <div className="text-left">
                            <div className="text-sm font-black uppercase text-white leading-none italic">Iron Sword</div>
                            <div className="text-[9px] text-brand-400 font-mono uppercase mt-2 tracking-[0.2em]">COST: 500 CREDITS • 30S</div>
                         </div>
                      </div>
                      <ChevronRight size={20} className="text-white/20" />
                   </button>
                   <div className="pt-6 border-t border-white/5">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono mb-4">ACTIVE PROCESSES</div>
                      {useGameStore.getState().craftingQueue.map(job => (
                         <div key={job.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl text-[10px] uppercase font-black tracking-widest font-mono">
                            <span className="text-white/60">{job.equipmentId.replace('_', ' ')}</span>
                            <span className="text-brand-500 animate-pulse">FABRICATING...</span>
                         </div>
                      ))}
                   </div>
                </div>
              ) : isGoblinHut ? (
                <div className="space-y-6 text-center py-4">
                   <div className="w-24 h-24 glass-panel rounded-[40px] flex items-center justify-center mx-auto border-brand-500/20 mb-6 relative">
                      <div className="absolute inset-0 bg-brand-500/10 animate-ping rounded-[40px] opacity-20" />
                      <Coins className="text-brand-500" size={40} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-display">Automated Incursion</h3>
                   <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px] mx-auto font-display">Specialized agents are extracting credits from nearby sectors at a controlled frequency.</p>
                   <div className="bg-brand-500/10 p-5 rounded-3xl border border-brand-500/20">
                      <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.4em] font-mono">FLOW RATE: 15 / MIN</span>
                   </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic mb-2">LOGISTICS CAPACITY</div>
                  <div className="grid grid-cols-1 gap-5">
                    <StorageBar label="Bio-Matter" current={resources.wood} max={maxCapacity.wood} color="bg-amber-600" />
                    <StorageBar label="Mineral" current={resources.stone} max={maxCapacity.stone} color="bg-slate-500" />
                    <StorageBar label="Calories" current={resources.food} max={maxCapacity.food} color="bg-emerald-600" />
                    <StorageBar label="Credits" current={resources.gold} max={maxCapacity.gold} color="bg-yellow-500" />
                  </div>
                  <div className="bg-brand-500/5 p-5 rounded-[30px] border border-brand-500/10 flex items-center gap-4">
                    <Info size={20} className="text-brand-400" />
                    <p className="text-[10px] text-slate-400 font-medium uppercase font-display leading-tight">UPGRADE WAREHOUSE INFRASTRUCTURE TO EXPAND THE MAXIMUM ALLOCATION FOR ALL RESOURCE STREAMS.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StorageBar({ label, current, max, color }: { label: string, current: number, max: number, color: string }) {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
        <span>{label}</span>
        <span className={percentage > 90 ? 'text-red-400' : 'text-white'}>{formatValue(current)} / {formatValue(max)}</span>
      </div>
      <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${percentage > 90 ? 'bg-red-500 animate-pulse' : color} rounded-full transition-all duration-1000`}
        />
      </div>
    </div>
  );
}

function ResearchRow({ id, title, desc, icon, level }: { id: string, title: string, desc: string, icon: string, level: number }) {
  const { researchLaboratory, resources } = useGameStore();
  const cost = (level + 1) * 1000;
  const canAfford = resources.gold >= cost;

  return (
    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-blue-500/30 transition-all">
       <div className="flex items-center gap-4">
          <div className="text-2xl w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
          <div>
             <h4 className="text-sm font-black text-white uppercase italic">{title}</h4>
             <p className="text-[8px] text-white/40 uppercase tracking-widest">{desc}</p>
             <p className="text-[10px] font-black text-blue-400 mt-1">Level {level}</p>
          </div>
       </div>
       <button 
         onClick={() => researchLaboratory(id)}
         disabled={!canAfford}
         className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${canAfford ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-white/20'}`}
       >
          {formatValue(cost)} G
       </button>
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.floor(value).toString();
}

function CostCard({ label, value, current, color }: { label: string, value: number, current: number, color: string }) {
  const isAffordable = current >= value;
  return (
    <div className={`p-2.5 rounded-2xl border flex flex-col items-center transition-colors ${isAffordable ? 'border-white/10 bg-white/5' : 'border-red-500/30 bg-red-500/10'}`}>
      <span className="text-[7px] font-black text-white/40 uppercase mb-0.5">{label}</span>
      <span className={`text-[11px] font-black break-all text-center leading-tight ${isAffordable ? color : 'text-red-400'}`}>{formatValue(value)}</span>
    </div>
  );
}

function TradeEntry({ icon, label, price, current, onSell }: { icon: string, label: string, price: number, current: number, onSell: () => void }) {
  const canSell = current >= (label === 'Stone' ? 25 : label === 'Wood' ? 50 : 100);
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
             <div className="font-black text-sm uppercase tracking-tight">{label}</div>
             <div className="text-[10px] text-white/40 font-bold uppercase">Rate: 1 = {price}Gold</div>
          </div>
       </div>
       <button 
        onClick={onSell}
        onPointerDown={() => {
           if (canSell) {
              audioService.play('collect', { randomized: true });
           } else {
              audioService.play('error', { volume: 0.2 });
           }
        }}
        disabled={!canSell}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${canSell ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white/5 text-white/20'}`}
       >
         Sell All
       </button>
    </div>
  );
}

function getIcon(typeId: string) {
  switch(typeId) {
    case 'lumberjack': return '🪓';
    case 'quarry': return '⛏️';
    case 'farm': return '🌾';
    case 'market': return '⚖️';
    case 'storage': return '📦';
    case 'barracks': return '⚔️';
    case 'townhall': return '🏰';
    case 'torch': return '🏮';
    case 'goblin_hut': return '👺';
    case 'forge': return '⚒️';
    case 'warehouse': return '🏛️';
    case 'academy': return '📜';
    case 'lab': return '🧪';
    default: return '🏠';
  }
}
