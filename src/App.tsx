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
import { X, AlertOctagon, ShieldAlert } from 'lucide-react';
import { GameViewport } from './game/GameViewport';
import { HUD } from './ui/hud/HUD.tsx';
import { BuildMenu } from './ui/panels/BuildMenu.tsx';
import { VillageManager } from './systems/VillageManager.tsx';
import { OfflineSummary } from './ui/panels/OfflineSummary.tsx';
import { MainMenu } from './ui/menus/MainMenu.tsx';
import { RankedMenu } from './ui/menus/RankedMenu.tsx';
import { Shop } from './ui/menus/Shop.tsx';
import { ClanMenu } from './ui/menus/ClanMenu.tsx';
import { SocialMenu } from './ui/menus/SocialMenu.tsx';
import { SettingsPanel } from './ui/panels/SettingsPanel.tsx';
import { ChatOverlay } from './ui/hud/ChatOverlay.tsx';
import { DailyRewards } from './ui/panels/DailyRewards.tsx';
import { CombatUI } from './ui/panels/CombatUI.tsx';
import { AuthOverlay } from './systems/auth/AuthOverlay.tsx';
import { CloudSync } from './systems/auth/CloudSync.tsx';
import { SocialManager } from './systems/SocialManager.tsx';
import { authService } from './services/authService';
import { useGameStore } from './store/useGameStore';
import { audioService } from './services/audioService';
import { ErrorBoundary } from './ui/ErrorBoundary.tsx';

import { ProgressionManager } from './systems/ProgressionManager.tsx';

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
  const isFlagged = useGameStore(state => state.isFlagged);
  
  // Only show loading if we are logged in but profile hasn't loaded yet
  const isLoading = user.uid && !user.profile;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
      <CloudSync />
      
      {/* Anti-Cheat Suspension Overlay */}
      <AnimatePresence>
        {isFlagged && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-red-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-24 h-24 bg-red-500/20 border border-red-500/30 rounded-[40px] flex items-center justify-center mb-8">
              <X className="text-red-500" size={48} />
            </div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Account Suspended</h1>
            <p className="text-red-200/60 max-w-md uppercase font-black text-xs tracking-widest leading-loose">
              Our behavior detection system has identified unusual activity on this account. Access to features has been restricted.
              <br/><br/>
              <span className="text-white/40">Reason: Abnormal action frequency (Rate Limit Exceeded)</span>
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-12 px-12 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform"
            >
              Contact Support
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthOverlay />
      <VillageManager />
      <SocialManager />
      <ProgressionManager />
      
      <AnimatePresence mode="wait">
        {viewMode === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10">
            <MainMenu />
          </motion.div>
        )}

        {viewMode === 'playing' && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <HUD />
            <BuildMenu />
            <OfflineSummary />
            <ChatOverlay />
            <DailyRewards />
          </motion.div>
        )}

        {viewMode === 'fighting' && (
          <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
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
            <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[40px] p-8 shadow-2xl">
              <SettingsPanel showBack={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


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

      <div className="absolute inset-0 -z-0">
         <GameViewport 
           menuMode={viewMode !== 'playing'} 
           combatMode={viewMode === 'fighting'} 
         />
      </div>
      

      </div>
    </ErrorBoundary>
  );
}

