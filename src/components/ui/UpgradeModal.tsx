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
    maxCapacity: s.maxCapacity
  })));

  const { 
    selectedBuildingId, selectBuilding, buildings, upgradeBuilding, 
    resources, sellResource, startMoving, maxCapacity 
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
  const isConstructing = b.isConstructing;

  const hasSpecialTab = isMarket || isStorage || isLab || isForge || isGoblinHut;

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
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectBuilding(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl text-white pointer-events-auto"
          >
            {/* Header */}
            <div className={`p-8 bg-gradient-to-br ${isMarket ? 'from-amber-500 to-orange-600' : isStorage ? 'from-emerald-500 to-teal-600' : 'from-indigo-500 to-purple-600'} text-white relative`}>
              <button 
                onClick={() => selectBuilding(null)}
                onPointerDown={() => audioService.play('close', { randomized: true })}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                    {getIcon(b.typeId)}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{type.name}</h2>
                    <p className="opacity-70 text-xs font-bold uppercase tracking-widest text-amber-300">Level {b.level}</p>
                 </div>
              </div>

              {/* Move Button in Header */}
              <button 
                onClick={() => {
                  startMoving(b.id);
                  selectBuilding(null);
                }}
                onPointerDown={() => audioService.play('click', { randomized: true })}
                className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
              >
                <TrendingUp size={14} className="rotate-45" />
                Drag to Merge or Move
              </button>
            </div>

            {/* Tabs */}
            {hasSpecialTab && (
              <div className="flex bg-black/20 p-1 mx-8 mt-6 rounded-2xl border border-white/10">
                 <button 
                  onClick={() => setActiveTab('upgrade')}
                  onPointerDown={() => audioService.play('click', { randomized: true })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'upgrade' ? 'bg-white/10 shadow-lg text-white' : 'text-white/40'}`}
                 >
                    Upgrade
                 </button>
                 <button 
                  onClick={() => setActiveTab('trade')}
                  onPointerDown={() => audioService.play('click', { randomized: true })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'trade' ? 'bg-white/10 shadow-lg text-white' : 'text-white/40'}`}
                 >
                    {isMarket ? 'Market' : isStorage ? 'Storage' : isLab ? 'Research' : isForge ? 'Forge' : 'Raid'}
                 </button>
              </div>
            )}

            <div className="p-8 space-y-6">
              {activeTab === 'upgrade' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                     <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                        <div className="text-[10px] text-emerald-400 font-black uppercase mb-1 flex items-center gap-1">
                          <ShoppingBag size={10} />
                          Option 1
                        </div>
                        <div className="text-xs font-black text-white uppercase italic">Manual Upgrade</div>
                        <div className="text-[8px] opacity-40 font-bold uppercase mt-1">Cost-based</div>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                        <div className="text-[10px] text-cyan-400 font-black uppercase mb-1 flex items-center gap-1">
                          <TrendingUp size={10} />
                          Option 2
                        </div>
                        <div className="text-xs font-black text-white uppercase italic">Building Merge</div>
                        <div className="text-[8px] opacity-40 font-bold uppercase mt-1">Space-based</div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex justify-between">
                        <span>UNIFIED COST</span>
                        <span className={isMaxLevel ? 'text-red-400' : 'text-amber-400'}>
                          {isMaxLevel ? 'MAX LEVEL REACHED' : `Lv.${b.level} → Lv.${b.level + 1}`}
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {upgradeCost.wood > 0 && <CostCard label="Wood" value={upgradeCost.wood} current={resources.wood} color="text-amber-400" />}
                        {upgradeCost.stone > 0 && <CostCard label="Stone" value={upgradeCost.stone} current={resources.stone} color="text-slate-300" />}
                        {upgradeCost.gold > 0 && <CostCard label="Gold" value={upgradeCost.gold} current={resources.gold} color="text-yellow-400" />}
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
                    className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-3 font-black text-lg shadow-xl transition-all border-b-4 ${
                      canAfford 
                      ? 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600 active:scale-95' 
                      : 'bg-red-500/20 text-red-500 border-red-900/50 cursor-pointer'
                    }`}
                  >
                    <ArrowUpCircle size={24} />
                    {isConstructing ? 'UPGRADING...' : isMaxLevel ? 'MAX LEVEL' : (canAfford ? 'AUTO-UPGRADE' : 'INSUFFICIENT FUNDS')}
                  </motion.button>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-3xl">
                    <p className="text-[10px] font-black text-cyan-200 uppercase leading-tight italic">
                      TIP: DRAG THIS BUILDING ONTO ANOTHER LV.{b.level} {type.name.toUpperCase()} TO MERGE INSTANTLY!
                    </p>
                  </div>
                </>
              ) : isMarket ? (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <TradeEntry icon="🪵" label="Wood" price={2} current={resources.wood} onSell={() => sellResource('wood', 50, 2)} />
                      <TradeEntry icon="🧱" label="Stone" price={4} current={resources.stone} onSell={() => sellResource('stone', 25, 4)} />
                      <TradeEntry icon="🍎" label="Food" price={1.5} current={resources.food} onSell={() => sellResource('food', 100, 1.5)} />
                   </div>
                </div>
              ) : isLab ? (
                <div className="space-y-4">
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 italic">Scientific Breakthroughs</div>
                   <ResearchRow id="combat_dmg" title="Combat Tactics" desc="+10% Damage to all troops" icon="⚔️" level={useGameStore.getState().researchLevels['combat_dmg'] || 0} />
                   <ResearchRow id="mining_eff" title="Extraction" desc="+15% Resource speed" icon="⛏️" level={useGameStore.getState().researchLevels['mining_eff'] || 0} />
                </div>
              ) : isForge ? (
                <div className="space-y-4">
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 italic">Master Craftsmanship</div>
                   <button 
                     onClick={() => useGameStore.getState().startCrafting({ id: 'sword_1', name: 'Iron Sword', type: 'weapon', bonus: { damage: 2 } })}
                     className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all"
                   >
                      <div className="flex items-center gap-3">
                         <div className="text-2xl">⚔️</div>
                         <div className="text-left">
                            <div className="text-xs font-black uppercase text-white leading-none">Iron Sword</div>
                            <div className="text-[8px] text-white/40 uppercase mt-1">Cost: 500 G • 30s</div>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                   </button>
                   <div className="pt-4 border-t border-white/5">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Crafting Queue</div>
                      {useGameStore.getState().craftingQueue.map(job => (
                         <div key={job.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-[10px] uppercase font-black tracking-tight mb-2">
                            <span>{job.equipmentId.replace('_', ' ')}</span>
                            <span className="text-amber-500">In Progress...</span>
                         </div>
                      ))}
                   </div>
                </div>
              ) : isGoblinHut ? (
                <div className="space-y-4 text-center">
                   <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 mb-4 animate-bounce">
                      <Coins className="text-amber-500" size={32} />
                   </div>
                   <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Automatic Raiding</h3>
                   <p className="text-[10px] text-white/40 font-medium leading-relaxed">Goblins are raiding nearby villages. Gold is deposited directly to your vault every hour.</p>
                   <div className="bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Rate: 15 / MINUTE</span>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <StorageBar label="Wood Capacity" current={resources.wood} max={maxCapacity.wood} color="bg-amber-600" />
                    <StorageBar label="Stone Capacity" current={resources.stone} max={maxCapacity.stone} color="bg-slate-500" />
                    <StorageBar label="Food Capacity" current={resources.food} max={maxCapacity.food} color="bg-emerald-600" />
                    <StorageBar label="Gold Capacity" current={resources.gold} max={maxCapacity.gold} color="bg-yellow-500" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                    <Info size={16} className="text-amber-400" />
                    <p className="text-[9px] opacity-60 font-medium">Build more warehouses to increase your total storage capacity for all resources.</p>
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
