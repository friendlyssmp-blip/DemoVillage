import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { Zap, Shield, Hammer, Timer as TimerIcon } from 'lucide-react';
import { springTransition } from '../../lib/animations';

export function ActiveBoosts() {
  const activeBoosts = useGameStore(state => state.activeBoosts);
  const now = Date.now();

  if (activeBoosts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[50] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeBoosts.map(boost => {
          const remainingMs = boost.endTime - now;
          const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
          const minutes = Math.floor(remainingSec / 60);
          const seconds = remainingSec % 60;
          
          const Icon = boost.type === 'speed' ? Zap : boost.type === 'damage' ? Shield : Hammer;
          const colorClass = boost.type === 'speed' ? 'text-amber-400' : boost.type === 'damage' ? 'text-red-400' : 'text-blue-400';
          const bgClass = boost.type === 'speed' ? 'bg-amber-400/20 border-amber-400/30' : boost.type === 'damage' ? 'bg-red-400/20 border-red-400/30' : 'bg-blue-400/20 border-blue-400/30';

          return (
            <motion.div
              key={boost.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={springTransition}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgClass}`}
            >
              <div className={`p-2 rounded-xl bg-black/40 ${colorClass}`}>
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase italic leading-none">{boost.name}</span>
                <div className="flex items-center gap-1 mt-1 opacity-60">
                   <TimerIcon size={8} className="text-white" />
                   <span className="text-[9px] font-black text-white font-mono tracking-wider">
                     {minutes}:{seconds.toString().padStart(2, '0')}
                   </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
