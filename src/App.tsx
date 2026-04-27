/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameViewport } from './components/game/GameViewport';
import { HUD } from './components/ui/HUD';
import { BuildMenu } from './components/ui/BuildMenu';
import { VillageManager } from './components/systems/VillageManager';
import { OfflineSummary } from './components/ui/OfflineSummary';
import { MainMenu } from './components/ui/MainMenu';
import { RankedMenu } from './components/ui/RankedMenu';
import { Shop } from './components/ui/Shop';
import { ClanMenu } from './components/ui/ClanMenu';
import { SocialMenu } from './components/ui/SocialMenu';
import { ChatOverlay } from './components/ui/ChatOverlay';
import { DailyRewards } from './components/ui/DailyRewards';
import { CombatUI } from './components/ui/CombatUI';
import { AuthOverlay } from './components/auth/AuthOverlay';
import { CloudSync } from './components/auth/CloudSync';
import { SocialManager } from './components/systems/SocialManager';
import { authService } from './services/authService';
import { useGameStore } from './store/useGameStore';
import { audioService } from './services/audioService';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  const viewMode = useGameStore(state => state.viewMode);
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);

  // Initialize Audio
  React.useEffect(() => {
    audioService.setEnabled(true);
    return () => audioService.setEnabled(false);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setLogoutConfirm(false);
    useGameStore.getState().setViewMode('menu');
  };
  const combatStatus = useGameStore(state => state.combatStatus);
  const user = useGameStore(state => state.user);
  
  // Only show loading if we are logged in but profile hasn't loaded yet
  const isLoading = user.uid && !user.profile;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
      <CloudSync />
      <AuthOverlay />
      <VillageManager />
      <SocialManager />
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-[#050510] flex flex-col items-center justify-center gap-6"
          >
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-[40px] flex items-center justify-center animate-pulse">
               <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Syncing Village</h2>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Restoring your legacy...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Viewport for Backgrounds */}
      {(viewMode === 'menu' || viewMode === 'shop' || viewMode === 'clan' || viewMode === 'friends' || viewMode === 'settings' || viewMode === 'ranked') && (
        <div className="absolute inset-0">
           <GameViewport menuMode />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {viewMode === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10">
            <MainMenu />
          </motion.div>
        )}

        {viewMode === 'playing' && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <GameViewport />
            <HUD />
            <BuildMenu />
            <OfflineSummary />
            <ChatOverlay />
            <DailyRewards />
          </motion.div>
        )}

        {viewMode === 'fighting' && (
          <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <GameViewport combatMode />
            <CombatUI />
            {combatStatus === 'attacking' && <ChatOverlay />}
          </motion.div>
        )}

        {viewMode === 'ranked' && (
          <motion.div key="ranked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10">
            <RankedMenu />
          </motion.div>
        )}

        {viewMode === 'shop' && (
          <motion.div key="shop" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute inset-0 z-[60]">
            <Shop />
          </motion.div>
        )}

        {viewMode === 'clan' && (
          <motion.div key="clan" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="absolute inset-0 z-[60]">
            <ClanMenu />
          </motion.div>
        )}

        {viewMode === 'friends' && (
          <motion.div key="friends" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="absolute inset-0 z-[60]">
            <SocialMenu />
          </motion.div>
        )}

        {viewMode === 'settings' && (
          <motion.div 
            key="settings" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.1 }} 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4"
          >
            <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[40px] p-8 shadow-2xl space-y-8">
              <div className="text-center">
                <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">System Settings</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">Configuration</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-white/40">
                    <span className="text-[10px] font-black uppercase tracking-widest">Master Volume</span>
                    <span className="text-[10px] font-mono">80%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-[80%] bg-emerald-500 rounded-full" />
                    <div className="absolute left-[80%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Post-Processing</span>
                  <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full" />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Cloud Saving</span>
                  <div className="text-[8px] font-black italic text-emerald-400">ACTIVE</div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                   <button 
                     onClick={() => setLogoutConfirm(true)}
                     className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all active:scale-95"
                   >
                     Disconnect Account
                   </button>
                </div>
              </div>

              <button 
                onClick={() => useGameStore.getState().setViewMode('menu')}
                className="w-full bg-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-xs active:scale-95 transition-all shadow-xl"
              >
                Return to Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Tip */}
      <div className="fixed bottom-4 left-4 z-10 pointer-events-none opacity-40 text-[10px] text-white/50 uppercase tracking-widest font-mono">
        Drag to rotate • Pinch to zoom • Tap structures to manage
      </div>
      </div>
    </ErrorBoundary>
  );
}

