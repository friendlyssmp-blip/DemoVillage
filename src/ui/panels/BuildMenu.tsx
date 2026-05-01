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

  const isPaused = useGameStore(state => state.isPaused);

  if (isInteracting || isPaused) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-[100] px-4 pointer-events-none flex flex-col items-center gap-4">
        {/* Toggle Button */}
        {!isPlacementMode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="glass-panel border-white/20 p-5 rounded-full text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center gap-3 tech-border"
          >
            {isOpen ? <ChevronDown size={22} /> : <Hammer size={22} strokeWidth={2.5} />}
            <span className="font-black uppercase tracking-[0.2em] text-[12px] italic font-display">
              {isOpen ? 'CLOSE' : 'CONSTRUCT'}
            </span>
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {isPlacementMode ? (
            <motion.div
              key="cancel"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="flex justify-center pointer-events-auto mb-4"
            >
              <button
                onClick={cancelPlacement}
                className="glass-panel bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 font-black uppercase tracking-widest italic tech-border"
              >
                <X size={24} /> 
                <span>CANCEL</span>
              </button>
            </motion.div>
          ) : isOpen && (
            <motion.div
              key="menu"
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              className="glass-panel px-4 py-8 rounded-[40px] shadow-2xl pointer-events-auto w-full max-w-sm tech-border bg-slate-950/90"
            >
              <div className="h-48 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3 px-2">
                {buildings.map((b) => {
                  const canAfford = Object.entries(b.cost).every(([res, amt]) => (resources[res as keyof typeof resources] || 0) >= (amt || 0));
                  const currentCount = useGameStore.getState().buildings.filter(bi => bi.typeId === b.id).length;
                  const isMaxed = b.id !== 'torch' && currentCount >= 256;

                  return (
                    <motion.button
                      key={b.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (isMaxed) return;
                        if (canAfford) {
                          startPlacement(b.id);
                          setIsOpen(false);
                        }
                      }}
                      disabled={!canAfford || isMaxed}
                      className={`p-3 rounded-3xl border flex flex-col items-center gap-2 transition-all relative ${
                        canAfford && !isMaxed
                        ? 'bg-white/5 border-white/5' 
                        : 'bg-black/40 border-transparent opacity-30 grayscale cursor-not-allowed'
                      }`}
                    >
                      <div className="text-2xl">{getIcon(b.id)}</div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white uppercase italic leading-none">{b.name}</span>
                        <span className="text-[7px] opacity-40 font-mono mt-1">{currentCount}/256</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(b.cost).map(([res, amt]) => (amt || 0) > 0 && (
                          <span key={res} className={`text-[8px] font-mono font-black ${resources[res as keyof typeof resources] >= (amt || 0) ? 'text-emerald-400' : 'text-red-500'}`}>
                            {formatCompact(amt || 0)}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>

  );
}

function formatCompact(val: number) {
  if (val >= 1000) return (val/1000).toFixed(1) + 'K';
  return val.toString();
}

function getIcon(id: string) {
  switch(id) {
    case 'lumberjack': return '🪓';
    case 'quarry': return '⛏️';
    case 'farm': return '🌾';
    case 'market': return '⚖️';
    case 'storage': return '📦';
    case 'barracks': return '⚔️';
    case 'lab': return '🧪';
    case 'goblin_hut': return '👺';
    case 'factory': return '⚙️';
    case 'tower': return '🏹';
    case 'mortar': return '💣';
    case 'trap': return '🕳️';
    case 'torch': return '🏮';
    default: return '🏠';
  }
}
