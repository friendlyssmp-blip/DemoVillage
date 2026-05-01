/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
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
    hint: "If the grid is red, you can't place it there! Green means go.",
    btn: "I've placed it"
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
    title: "Phase 5: Survival",
    desc: "Your citizens consume food every day. If you run out, production stops and your settlement will suffer.",
    hint: "Keep an eye on the food bar in the top left. Build Farms to keep it high!",
    btn: "Understood, Food is Ready"
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
  const { tutorialStep, nextTutorial } = useGameStore(useShallow(s => ({
    tutorialStep: s.tutorialStep,
    nextTutorial: s.nextTutorial
  })));

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
        <div className="glass-panel bg-brand-600 border border-white/20 p-8 rounded-[50px] shadow-[0_20px_60px_rgba(99,102,241,0.5)] text-white overflow-hidden relative tech-border">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[60px] -mr-20 -mt-20 rounded-full" />
          
          <div className="flex items-center gap-5 mb-4 px-1">
            <div className="relative">
              <div className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center font-black text-sm border border-white/20 backdrop-blur-3xl font-mono shadow-inner tech-border">
                {String(tutorialStep + 1).padStart(2, '0')}
              </div>
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full blur-[4px]" 
              />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic font-display">{current.title}</h3>
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 font-mono mt-1">OPERATIONAL DATA FEED</div>
            </div>
          </div>
          
          <p className="text-sm font-medium opacity-90 leading-relaxed mb-6 px-1 font-display">{current.desc}</p>
          
          {current.hint && (
            <div className="bg-black/20 p-5 rounded-[24px] flex items-start gap-3 mb-6 border border-white/5 shadow-inner">
              <div className="bg-brand-400 p-1.5 rounded-lg shrink-0 mt-0.5 shadow-lg">
                <ChevronRight size={12} className="text-slate-900" strokeWidth={3} />
              </div>
              <p className="text-[11px] font-bold italic text-slate-200 leading-normal font-display">{current.hint}</p>
            </div>
          )}

          {current.btn && (
            <div className="flex flex-col gap-3">
              <button 
                onClick={nextTutorial}
                className="w-full bg-white text-slate-950 font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 text-sm shadow-2xl group overflow-hidden relative tech-border border-white/40 font-display animate-pulse"
              >
                <motion.div 
                  animate={{ x: [-100, 300] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-200/40 to-transparent w-60 -skew-x-12"
                />
                <span className="relative z-10 italic uppercase tracking-tighter">{current.btn}</span>
                <CheckCircle2 size={18} className="relative z-10 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => useGameStore.getState().skipTutorial()}
                className="text-[9px] uppercase font-black text-white/20 hover:text-white transition-all hover:tracking-[0.2em] py-2 font-mono text-center"
              >
                DISMISS SYSTEM GUIDANCE
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
