/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  X, Coins, Zap, Paintbrush, 
  Package, ChevronRight, ShoppingBag
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ResourceType } from '../../types';

import { audioService } from '../../services/audioService';

export function Shop() {
  const { setViewMode, resources, addResource, spendResources } = useGameStore();

  const buyResources = (type: ResourceType, amount: number, costGold: number) => {
    if (spendResources({ gold: costGold })) {
      audioService.play('collect');
      addResource(type, amount);
    } else {
      audioService.play('close');
      alert('Not enough Gold!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans"
    >
      <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-2xl" onClick={() => setViewMode('menu')} />
      
      <div className="relative w-full max-w-5xl h-full bg-[#050510] border border-white/10 rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <ShoppingBag className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Marketplace</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Village Supplies & Boosts</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/30 uppercase">Balance</span>
            <span className="text-xl font-black text-amber-500 italic">{Math.floor(resources.gold).toLocaleString()} <span className="text-[10px] uppercase">Gold</span></span>
          </div>
          <button 
            onClick={() => setViewMode('menu')}
            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Tabs / Categories */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Section: Resource Packs */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Package className="text-amber-500" size={18} />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Resource Bundles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ShopCard 
                title="Lumber Stack"
                desc="+500 Wood"
                cost={250}
                icon={<div className="w-10 h-10 bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">W</div>}
                onClick={() => buyResources('wood', 500, 250)}
              />
              <ShopCard 
                title="Stone Crate"
                desc="+500 Stone"
                cost={250}
                icon={<div className="w-10 h-10 bg-slate-500/20 rounded-xl flex items-center justify-center text-slate-400">S</div>}
                onClick={() => buyResources('stone', 500, 250)}
              />
              <ShopCard 
                title="Grain Silo"
                desc="+1000 Food"
                cost={400}
                icon={<div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">F</div>}
                onClick={() => buyResources('food', 1000, 400)}
              />
              <ShopCard 
                title="Mega Bundle"
                desc="All x1000"
                cost={1500}
                icon={<div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">M</div>}
                onClick={() => {
                  if (spendResources({ gold: 1500 })) {
                    addResource('wood', 1000);
                    addResource('stone', 1000);
                    addResource('food', 1000);
                  }
                }}
              />
            </div>
          </section>

          {/* Section: Boosts */}
          <section>
             <div className="flex items-center gap-2 mb-6">
              <Zap className="text-blue-500" size={18} />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Time Boosters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <BoostCard 
                 title="Production 2x"
                 duration="2 Hours"
                 cost={500}
                 color="blue"
               />
               <BoostCard 
                 title="Double Gold"
                 duration="1 Hour"
                 cost={800}
                 color="amber"
               />
               <BoostCard 
                 title="Instant Build"
                 duration="Next 3 Buildings"
                 cost={1200}
                 color="purple"
               />
            </div>
          </section>

          {/* Section: Cosmetics */}
          <section>
             <div className="flex items-center gap-2 mb-6">
              <Paintbrush className="text-pink-500" size={18} />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Visual Customization</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl border border-emerald-500/20" />
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic">Neo-Stone Skin</h3>
                      <p className="text-xs text-white/40 font-medium">Glow effects for all buildings</p>
                    </div>
                  </div>
                  <div className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase italic tracking-widest">
                    2500 G
                  </div>
               </div>
               <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer opacity-50">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-pink-500/20 rounded-3xl border border-pink-500/20" />
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic">Cyberpunk Village</h3>
                      <p className="text-xs text-white/40 font-medium">Coming Soon</p>
                    </div>
                  </div>
                  <div className="bg-white/10 text-white/40 px-6 py-3 rounded-2xl font-black text-xs uppercase italic tracking-widest underline decoration-pink-500">
                    EVENT ONLY
                  </div>
               </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  </motion.div>
  );
}

function ShopCard({ title, desc, cost, icon, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group active:scale-95 flex flex-col items-center text-center gap-4"
    >
      {icon}
      <div className="space-y-1">
        <h3 className="text-sm font-black text-white uppercase italic leading-none">{title}</h3>
        <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{desc}</p>
      </div>
      <div className="mt-2 flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
         <Coins size={12} />
         <span className="text-[10px] font-black">{cost}</span>
      </div>
    </div>
  );
}

function BoostCard({ title, duration, cost, color }: any) {
  const colors: any = {
    blue: 'bg-blue-500 border-blue-400',
    amber: 'bg-amber-500 border-amber-400',
    purple: 'bg-purple-500 border-purple-400',
  };

  return (
    <div className="p-8 rounded-[40px] bg-white/5 border border-white/5 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[40px] opacity-20 ${colors[color].split(' ')[0]}`} />
      <div className="relative z-10 space-y-4">
        <h3 className="text-xl font-black text-white uppercase italic leading-tight">{title}</h3>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 tracking-widest">
           < Zap size={14} />
           {duration}
        </div>
        <button className="w-full bg-white/10 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
           Purchase • {cost} G
        </button>
      </div>
    </div>
  );
}
