/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpCircle, Info, TrendingUp, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

import { audioService } from '../../services/audioService';

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
  const isStorage = b.typeId === 'storage';
  const isConstructing = b.isConstructing;
 
  const upgradeCost = {
    wood: (type.cost.wood || 0) * b.level,
    stone: (type.cost.stone || 0) * b.level,
    gold: (type.cost.gold || 0) * b.level,
  };
 
  const canAfford = 
    !isConstructing &&
    resources.wood >= (upgradeCost.wood || 0) && 
    resources.stone >= (upgradeCost.stone || 0) && 
    resources.gold >= (upgradeCost.gold || 0);
 
  const handleUpgrade = () => {
    if (canAfford) {
      audioService.play('build');
      upgradeBuilding(b.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
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
                className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
              >
                <TrendingUp size={14} className="rotate-45" />
                Drag to Merge or Move
              </button>
            </div>

            {/* Tabs */}
            {(isMarket || isStorage) && (
              <div className="flex bg-black/20 p-1 mx-8 mt-6 rounded-2xl border border-white/10">
                 <button 
                  onClick={() => setActiveTab('upgrade')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'upgrade' ? 'bg-white/10 shadow-lg text-white' : 'text-white/40'}`}
                 >
                    Upgrade
                 </button>
                 <button 
                  onClick={() => setActiveTab('trade')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'trade' ? 'bg-white/10 shadow-lg text-white' : 'text-white/40'}`}
                 >
                    {isMarket ? 'Market' : 'Storage'}
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
                        <span className="text-amber-400">Lv.{b.level} → Lv.{b.level*2}</span>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        {upgradeCost.wood > 0 && <CostCard label="Wood" value={upgradeCost.wood} current={resources.wood} color="text-amber-400" />}
                        {upgradeCost.stone > 0 && <CostCard label="Stone" value={upgradeCost.stone} current={resources.stone} color="text-slate-300" />}
                        {upgradeCost.gold > 0 && <CostCard label="Gold" value={upgradeCost.gold} current={resources.gold} color="text-yellow-400" />}
                     </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={!canAfford}
                    className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-3 font-black text-lg shadow-xl transition-all border-b-4 ${
                      canAfford 
                      ? 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600 active:scale-95' 
                      : 'bg-white/5 text-white/20 border-transparent cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpCircle size={24} />
                    {isConstructing ? 'UPGRADING...' : 'AUTO-UPGRADE'}
                  </button>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-3xl">
                    <p className="text-[10px] font-black text-cyan-200 uppercase leading-tight italic">
                      TIP: DRAG THIS BUILDING ONTO ANOTHER LV.{b.level} {type.name.toUpperCase()} TO MERGE INSTANTLY!
                    </p>
                  </div>
                </>
              ) : isMarket ? (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <TradeEntry 
                        icon="🪵" 
                        label="Wood" 
                        price={2} 
                        current={resources.wood} 
                        onSell={() => sellResource('wood', 50, 2)} 
                      />
                      <TradeEntry 
                        icon="🧱" 
                        label="Stone" 
                        price={4} 
                        current={resources.stone} 
                        onSell={() => sellResource('stone', 25, 4)} 
                      />
                      <TradeEntry 
                        icon="🍎" 
                        label="Food" 
                        price={1.5} 
                        current={resources.food} 
                        onSell={() => sellResource('food', 100, 1.5)} 
                      />
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
        <span className={percentage > 90 ? 'text-red-400' : 'text-white'}>{Math.floor(current)} / {max}</span>
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

function CostCard({ label, value, current, color }: { label: string, value: number, current: number, color: string }) {
  const isAffordable = current >= value;
  return (
    <div className={`p-4 rounded-3xl border flex flex-col items-center transition-colors ${isAffordable ? 'border-white/10 bg-white/5' : 'border-red-500/30 bg-red-500/10'}`}>
      <span className="text-[8px] font-black text-white/40 uppercase mb-1">{label}</span>
      <span className={`text-sm font-black ${isAffordable ? color : 'text-red-400'}`}>{value.toLocaleString()}</span>
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
    default: return '🏠';
  }
}
