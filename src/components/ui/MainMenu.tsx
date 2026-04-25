/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { 
  Globe, Sword, Trophy, Settings, 
  ChevronRight, ArrowRight, User, 
  Coins, Users, BarChart3, Cloud
} from 'lucide-react';

export function MainMenu() {
  const { setViewMode, resources, population, playerName } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans overflow-hidden p-4">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      {/* Visual Decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-600/10 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2" />

      {/* Content Container - Compact & Responsive */}
      <div className="relative w-full max-w-sm flex flex-col gap-6 items-center">
        
        {/* Branding Block */}
        <div className="text-center w-full">
           <motion.div 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="text-[9px] uppercase font-black tracking-[0.4em] text-blue-400 mb-1"
           >
             Civilization Engine
           </motion.div>
           <motion.h1 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-4xl font-black text-white italic leading-tight tracking-tighter uppercase"
           >
             PROJECT<br /><span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>VILLAGE</span>
           </motion.h1>
        </div>

        {/* Player Stats Bar - Smaller */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl"
        >
          <div className="flex flex-col">
             <span className="text-[7px] font-black uppercase opacity-40">Chief</span>
             <span className="text-xs font-black text-white italic">{playerName}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[7px] font-black uppercase opacity-40">Gold</span>
             <span className="text-xs font-black text-amber-500 italic">{Math.floor(resources.gold).toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Navigation - Compact Column */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col gap-2"
        >
          <MenuButton 
            icon={<Globe size={20} />} 
            label="My World" 
            onClick={() => setViewMode('playing')}
            primary
          />
          <div className="grid grid-cols-2 gap-2">
            <MenuButton 
              icon={<Sword size={20} />} 
              label="Fight" 
              onClick={() => setViewMode('fighting')}
            />
            <MenuButton 
              icon={<Trophy size={18} />} 
              label="Ranked" 
              onClick={() => setViewMode('ranked')}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MenuButton 
              icon={<Coins size={18} />} 
              label="Shop" 
              onClick={() => setViewMode('shop')}
            />
            <MenuButton 
              icon={<Users size={18} />} 
              label="Clan" 
              onClick={() => setViewMode('clan')}
            />
            <MenuButton 
              icon={<User size={18} />} 
              label="Social" 
              onClick={() => setViewMode('friends')}
            />
          </div>
          <MenuButton 
            icon={<Settings size={18} />} 
            label="Settings" 
            onClick={() => setViewMode('settings')}
          />
        </motion.div>

        <div className="flex flex-col items-center gap-1 opacity-20">
           <span className="text-[8px] font-black uppercase tracking-widest italic">Alpha v0.9.0</span>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, primary = false, disabled = false }: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void,
  primary?: boolean,
  disabled?: boolean
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      className={`group w-full p-4 rounded-2xl border transition-all text-center flex items-center justify-center gap-4 relative overflow-hidden backdrop-blur-md shadow-lg ${
        primary 
          ? 'bg-white text-black border-white' 
          : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white'
      } ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="shrink-0">{icon}</div>
      <h3 className="text-sm font-black italic tracking-tighter uppercase leading-none">{label}</h3>
    </motion.button>
  );
}
