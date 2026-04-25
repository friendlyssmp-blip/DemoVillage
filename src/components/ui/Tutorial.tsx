/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    title: "Welcome Chief!",
    desc: "You are the leader of this new settlement. Let's start with the basics.",
    btn: "Start Basics"
  },
  {
    title: "Phase 1: Observation",
    desc: "Use your fingers (or mouse) to navigate. Drag to pan, pinch to zoom, and rotate to see your world from every angle.",
    btn: "I can see clearly now"
  },
  {
    title: "Phase 2: Settlement",
    desc: "Click the Hammer (Build Menu) and place a Lumber Camp near your Town Hall. Use the grid to find a perfect spot.",
    hint: "If the grid is red, you can't place it there! Green means go."
  },
  {
    title: "Phase 3: Vital Resources",
    desc: "Food is your #1 priority. Without it, NPCs starve and production stops! Wood and Stone come next for construction.",
    btn: "Food First, Got it"
  },
  {
    title: "Phase 4: Economy",
    desc: "Storage buildings allow you to keep more resources. Trade Posts let you sell excess for Gold to unlock new milestones.",
    btn: "Grow the Treasury"
  },
  {
    title: "Phase 5: The Food Chain",
    desc: "Citizens eat food every day. If your food runs out, production will slow down significantly!",
    hint: "Keep an eye on the food bar in the top left. Keep it green!"
  },
  {
    title: "Phase 6: Evolution",
    desc: "Upgrade buildings to increase production or merge two identical buildings to double their power at once!",
    btn: "Stronger Together"
  },
  {
    title: "Phase 7: The Market",
    desc: "Sell your excess Wood or Stone at the Trade Post for Gold. Use Gold to unlock new land or tech.",
    btn: "Master the Economy"
  },
  {
    title: "Phase 8: Advanced Edit",
    desc: "Toggle Edit Mode (the pickaxe icon) to rearrange your village without interruption. No camera movement, just pure strategy.",
    btn: "Finish Tutorial"
  }
];

export function Tutorial() {
  const { tutorialStep, nextTutorial } = useGameStore();

  if (tutorialStep >= STEPS.length) return null;

  const current = STEPS[tutorialStep];

  return (
    <AnimatePresence>
      <motion.div 
        key={tutorialStep}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-36 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-sm pointer-events-auto"
      >
        <div className="backdrop-blur-3xl bg-blue-600/90 border border-blue-400/40 p-5 rounded-[40px] shadow-[0_20px_50px_rgba(37,99,235,0.4)] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="relative">
              <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center font-black text-xs border border-white/20 backdrop-blur-md">
                {tutorialStep + 1}
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full blur-[2px] opacity-40" 
              />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight italic">{current.title}</h3>
          </div>
          
          <p className="text-[11px] font-medium opacity-90 leading-relaxed mb-4 px-1">{current.desc}</p>
          
          {current.hint && (
            <div className="bg-white/10 p-3 rounded-3xl flex items-start gap-2.5 mb-4 border border-white/5">
              <div className="bg-white/20 p-1 rounded-lg shrink-0 mt-0.5">
                <ChevronRight size={10} className="text-white" />
              </div>
              <p className="text-[10px] font-bold italic opacity-70 leading-tight">{current.hint}</p>
            </div>
          )}

          {current.btn && (
            <div className="flex flex-col gap-2">
              <button 
                onClick={nextTutorial}
                className="w-full bg-white text-blue-700 font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 text-xs shadow-xl group overflow-hidden relative"
              >
                <motion.div 
                  animate={{ x: [-100, 200] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/40 to-transparent w-40 skew-x-12"
                />
                <span className="relative">{current.btn}</span>
                <CheckCircle2 size={16} className="relative group-hover:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={() => useGameStore.getState().skipTutorial()}
                className="text-[9px] uppercase font-black opacity-30 hover:opacity-100 transition-all hover:tracking-widest py-1"
              >
                Skip Introduction
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
