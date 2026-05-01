/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { Hammer, Coins, Zap, Sword, Shield, Thermometer, UserPlus, TrendingUp, X, Edit2, Users } from 'lucide-react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export function BuildingPanel() {
  const { 
    selectedBuildingId, buildings, resources, upgradeBuilding, 
    tradeMarket, startCrafting, researchLaboratory, era, 
    selectBuilding, inventory, craftingQueue, collectCraftedItem,
    villageName, updateVillageName
  } = useGameStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(villageName);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  if (!selectedBuilding) return null;

  const type = BUILDING_TYPES[selectedBuilding.typeId as keyof typeof BUILDING_TYPES];
  const isConstructing = selectedBuilding.progress < 1;

  const handleClose = () => {
    audioService.play('close');
    selectBuilding(null);
  };

  const handleUpgrade = () => {
    upgradeBuilding(selectedBuilding.id);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
  };

  return (
    <AnimatePresence>
      <motion.div 
        key={selectedBuildingId}
        initial={{ y: 500, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 500, opacity: 0 }}
        className="fixed bottom-0 inset-x-0 glass-panel rounded-t-[40px] shadow-[0_-30px_100px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col z-[100] tech-border border-b-0 max-h-[80vh] overflow-y-auto"
      >
        {/* Header Section */}
        <div className="relative h-24 flex items-end p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
          <div className="absolute inset-0 opacity-10 bg-brand-500 blur-3xl -translate-y-1/2" />
          
          <div className="z-20 w-full pr-12">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white truncate font-display">{type.name}</h3>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 font-mono">LV {selectedBuilding.level}</span>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 z-30 p-2 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

      {/* Content Section */}
      <div className="p-6 pb-12 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <p className="text-[11px] font-medium leading-relaxed text-slate-400 italic">
          "{type.description}"
        </p>

        {!isConstructing && selectedBuilding.typeId === 'market' && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
            <ActionBar 
              label="Wood -> Gold" 
              icon={<TrendingUp size={16} className="text-amber-500" />}
              price="500 Wood"
              onClick={() => tradeMarket('wood', 'gold', 500)}
              disabled={resources.wood < 500}
            />
            <ActionBar 
              label="Stone -> Gold" 
              icon={<TrendingUp size={16} className="text-slate-400" />}
              price="500 Stone"
              onClick={() => tradeMarket('stone', 'gold', 500)}
              disabled={resources.stone < 500}
            />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button 
            onClick={handleUpgrade}
            disabled={isConstructing}
            className="w-full relative py-5 rounded-[24px] bg-white text-slate-950 font-black italic shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20 translate-y-0"
          >
            <Hammer size={20} strokeWidth={2.5} />
            <span className="text-sm uppercase tracking-widest">UPGRADE PROTOCOL</span>
          </button>
        </div>
      </div>
    </motion.div>

    </AnimatePresence>
  );
}

function ActionBar({ label, subLabel, icon, price, onClick, disabled }: { 
  label: string, 
  subLabel?: string, 
  icon: React.ReactNode, 
  price: string, 
  onClick: () => void, 
  disabled: boolean 
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start gap-2 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all active:scale-95 disabled:opacity-20 flex-1 text-left group overflow-hidden relative`}
    >
      <div className="absolute bottom-0 right-0 p-1 opacity-5 group-hover:opacity-20 transition-opacity">
         {icon}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-black/40 rounded-xl border border-white/5 group-hover:border-brand-500/30 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase text-white truncate leading-none font-display italic group-hover:text-brand-400 transition-colors">{label}</span>
      </div>
      {subLabel && <span className="text-[8px] font-bold opacity-30 uppercase leading-none font-mono">{subLabel}</span>}
      <div className="flex items-center gap-2 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
        <Coins size={10} className="text-amber-500" />
        <span className="text-[9px] font-black italic font-mono text-amber-500/80">{price}</span>
      </div>
    </button>
  );
}
