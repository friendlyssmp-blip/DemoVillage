/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { Play, Settings, LogOut, X, Info, Volume2, Monitor, Move, Maximize, ChevronLeft, Cloud, Book, Trash2, AlertTriangle, RotateCw } from 'lucide-react';
import { SettingsPanel } from '../panels/SettingsPanel';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';
import { auth } from '../../lib/firebase';

type PauseSubView = 'main' | 'settings' | 'logout_confirm' | 'help' | 'delete_confirm';

export function PauseMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { setViewMode, setPaused, syncVillage, resetVillage } = useGameStore();
  const [subView, setSubView] = useState<PauseSubView>('main');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [deleteInput, setDeleteInput] = useState('');

  const isDeleteEnabled = deleteInput.toUpperCase() === 'RESET';

  const handleClose = () => {
    audioService.play('close');
    setPaused(false);
    onClose();
  };

  const handleLogout = async () => {
    await authService.logout();
    handleClose();
    setViewMode('menu');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl p-8"
          >
          {subView === 'main' && (
            <div className="flex flex-col items-center gap-8">
               <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-1 bg-white/20 rounded-full mb-6" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Paused</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">Village Management</p>
               </div>

               <div className="w-full space-y-3">
                  <PauseButton 
                    icon={<Play size={18} fill="currentColor" />} 
                    label="Resume" 
                    onClick={handleClose} 
                    primary 
                  />
                  <PauseButton 
                    icon={<Cloud size={18} />} 
                    label={isSaving ? "Saving..." : "Save Village"} 
                    onClick={async () => {
                      setIsSaving(true);
                      await syncVillage();
                      setTimeout(() => setIsSaving(false), 2000);
                    }} 
                  />
                  <PauseButton 
                    icon={<Settings size={18} />} 
                    label="Settings" 
                    onClick={() => {
                      audioService.play('click');
                      setSubView('settings');
                    }} 
                  />
                  <PauseButton 
                    icon={<Info size={18} />} 
                    label="How to Play" 
                    onClick={() => {
                      audioService.play('click');
                      setSubView('help');
                    }} 
                  />
                  <div className="pt-4 border-t border-white/5 mt-4">
                     <PauseButton 
                       label="Return to Main Menu" 
                       onClick={() => {
                         setViewMode('menu');
                         setPaused(false);
                       }} 
                     />
                  </div>
               </div>
            </div>
          )}

          {subView === 'settings' && (
            <SettingsPanel onBack={() => setSubView('main')} />
          )}

          {subView === 'delete_confirm' && (
            <div className="flex flex-col gap-8 text-center py-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Reset Progress</h3>
                <p className="text-xs text-white/40 mt-2">
                  {deleteConfirmStep === 1 
                    ? "Are you sure you want to reset your village to level 1? Your account progress will be reset." 
                    : "THIS ACTION IS IRREVERSIBLE. YOU WILL LOSE YOUR BUILDINGS AND RESOURCES!"}
                </p>
              </div>

              <div className="space-y-3">
                {deleteConfirmStep === 1 ? (
                  <>
                    <PauseButton 
                      label="Yes. Reset everything." 
                      danger 
                      onClick={() => {
                        audioService.play('click');
                        setDeleteConfirmStep(2);
                      }} 
                    />
                    <PauseButton 
                      label="No! Take me back." 
                      primary
                      onClick={() => setSubView('settings')} 
                    />
                  </>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      <label className="text-[10px] font-black uppercase opacity-40">Type RESET to confirm</label>
                      <input 
                        type="text" 
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="RESET"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center tracking-[0.2em] focus:outline-none focus:border-red-500 transition-all uppercase"
                      />
                    </div>
                    <PauseButton 
                      label="RESET NOW" 
                      danger 
                      disabled={!isDeleteEnabled}
                      onClick={async () => {
                        audioService.play('error');
                        await resetVillage();
                      }} 
                    />
                    <PauseButton 
                      label="NEVERMIND" 
                      onClick={() => setSubView('settings')} 
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {subView === 'help' && (
            <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-4">
                <button onClick={() => setSubView('main')} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">How to Play</h3>
              </div>
              
              <div className="space-y-4 text-white/60 text-xs leading-relaxed">
                <section>
                  <h4 className="text-white font-black uppercase mb-1">Building & Growth</h4>
                  <p>Gather Wood and Stone to construct buildings. Each building increases your productive capacity and village power.</p>
                </section>
                <section>
                  <h4 className="text-white font-black uppercase mb-1">Citizens</h4>
                  <p>Your citizens need food to work efficiently. Keep a steady food supply or production will slow down!</p>
                </section>
                <section>
                  <h4 className="text-white font-black uppercase mb-1">Ranked PvP</h4>
                  <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-red-400">
                    Attack real players to gain Ranked Points (RP). Climb the global ladder from Bronze to Elite!
                  </div>
                </section>
              </div>
              
              <PauseButton label="Understood" onClick={() => setSubView('main')} primary />
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

function PauseButton({ icon, label, onClick, primary = false, danger = false, disabled = false }: {
  icon?: React.ReactNode,
  label: string,
  onClick: () => void,
  primary?: boolean,
  danger?: boolean,
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border pointer-events-auto ${
        disabled
          ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
          : primary 
            ? 'bg-white text-black border-white shadow-xl hover:bg-zinc-100' 
            : danger 
              ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
              : 'bg-black/40 backdrop-blur-sm text-white/80 border-white/10 hover:bg-black/60 hover:text-white'
      }`}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
