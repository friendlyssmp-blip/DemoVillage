/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, X, ChevronUp, ChevronDown } from 'lucide-react';

import { audioService } from '../../services/audioService';

export function BuildMenu() {
  const { 
    isPlacementMode, startPlacement, cancelPlacement, resources,
    selectedBuildingId, selectedObjectId
  } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const buildings = Object.values(BUILDING_TYPES).filter(b => b.id !== 'townhall');

  // Hide build button if interacting with existing structures
  const isInteracting = !!(selectedBuildingId || selectedObjectId);

  if (isInteracting) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4 pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        {/* Toggle Button */}
        {!isPlacementMode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={() => audioService.play('click', { randomized: true })}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-black/40 backdrop-blur-md border border-white/20 p-4 rounded-full text-white shadow-2xl pointer-events-auto flex items-center gap-2"
          >
            {isOpen ? <ChevronDown size={20} /> : <Hammer size={20} />}
            <span className="font-black uppercase tracking-tighter text-[10px]">
              {isOpen ? 'Close' : 'Build'}
            </span>
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {isPlacementMode ? (
            <motion.div
              key="cancel"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="flex justify-center pointer-events-auto"
            >
              <button
                onClick={cancelPlacement}
                onPointerDown={() => audioService.play('close', { randomized: true })}
                className="bg-red-500/80 backdrop-blur-md text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase tracking-widest border border-white/20 transform transition-transform active:scale-95"
              >
                <X size={24} /> Cancel Build
              </button>
            </motion.div>
          ) : isOpen && (
            <motion.div
              key="menu"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="backdrop-blur-lg bg-black/60 rounded-[32px] p-4 shadow-2xl border border-white/10 pointer-events-auto w-full overflow-hidden"
            >
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {buildings.map((b) => {
                  const canAfford = Object.entries(b.cost).every(([res, amt]) => (resources[res as keyof typeof resources] || 0) >= (amt || 0));
                  const currentCount = useGameStore.getState().buildings.filter(bi => bi.typeId === b.id).length;
                  const isMaxed = b.id !== 'torch' && currentCount >= 256;

                  return (
                    <motion.button
                      key={b.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onPointerDown={() => {
                        if (isMaxed) {
                          audioService.play('error');
                        } else if (canAfford) {
                          audioService.play('secondary', { randomized: true });
                        } else {
                          audioService.play('error', { volume: 0.3 });
                        }
                      }}
                      onClick={() => {
                        if (isMaxed) {
                           alert(`Max limit reached for ${b.name}! (256 buildings)`);
                           return;
                        }
                        if (canAfford) {
                          startPlacement(b.id);
                          setIsOpen(false);
                        }
                      }}
                      disabled={!canAfford || isMaxed}
                      className={`flex-shrink-0 w-24 p-2 rounded-2xl flex flex-col items-center gap-1 transition-all border snap-center relative ${
                        canAfford && !isMaxed
                        ? 'bg-white/5 border-white/10 hover:bg-white/15' 
                        : 'bg-black/20 border-transparent opacity-30 grayscale cursor-not-allowed'
                      }`}
                    >
                      {isMaxed && (
                        <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center rounded-2xl">
                          <span className="text-[10px] font-black text-red-500 rotate-12">MAXED</span>
                        </div>
                      )}
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl shadow-inner">
                         {getIcon(b.id)}
                      </div>
                      
                      <div className="flex flex-col items-center w-full">
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate w-full text-center">{b.name}</span>
                        <div className="text-[6px] font-black opacity-40 uppercase tracking-widest mt-0.5">{currentCount}/256</div>
                        <div className="flex flex-wrap items-center justify-center gap-0.5 mt-1">
                          {Object.entries(b.cost).map(([res, amt]) => (amt || 0) > 0 && (
                            <div key={res} className="flex items-center gap-0.5 px-0.5 rounded-full">
                              <span className={`text-[7px] font-black ${resources[res as keyof typeof resources] >= (amt || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                                {amt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getIcon(id: string) {
  switch(id) {
    case 'lumberjack': return '🪓';
    case 'quarry': return '⛏️';
    case 'farm': return '🌾';
    case 'market': return '⚖️';
    case 'warehouse': return '📦';
    case 'barracks': return '⚔️';
    case 'tower': return '🏹';
    case 'mortar': return '💣';
    case 'trap': return '🕳️';
    case 'torch': return '🏮';
    default: return '🏠';
  }
}
