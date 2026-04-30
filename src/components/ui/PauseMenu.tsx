/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { Play, Settings, LogOut, X, Info, Volume2, Monitor, Move, Maximize, ChevronLeft, Cloud, Book, Trash2, AlertTriangle, RotateCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';
import { auth } from '../../lib/firebase';

type PauseSubView = 'main' | 'settings' | 'logout_confirm' | 'help' | 'delete_confirm';

export function PauseMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { setViewMode, setPaused, settings, updateSettings, syncVillage, resetVillage } = useGameStore();
  const [subView, setSubView] = useState<PauseSubView>('main');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [linkConfirmStep, setLinkConfirmStep] = useState<{ type: 'google' | 'apple', action: 'link' | 'unlink' } | null>(null);

  const currentUser = auth.currentUser;
  const isGoogleLinked = currentUser?.providerData.some(p => p.providerId === 'google.com');
  const isAppleLinked = currentUser?.providerData.some(p => p.providerId === 'apple.com');

  const [deleteInput, setDeleteInput] = useState('');

  const isDeleteEnabled = deleteInput === 'RESET';

  const handleLinkAction = async (type: 'google' | 'apple', action: 'link' | 'unlink') => {
    try {
      if (action === 'link') {
        if (type === 'google') await authService.linkGoogle();
        else await authService.linkApple();
      } else {
        if (type === 'google') await authService.unlinkGoogle();
        else await authService.unlinkApple();
      }
      setLinkConfirmStep(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

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
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setSubView('main')} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Settings</h3>
              </div>

              <div className="space-y-6">
                <SettingSlider 
                  label="Audio Volume" 
                  icon={<Volume2 size={16} />} 
                  value={settings.soundVolume} 
                  onChange={(val) => {
                    updateSettings({ soundVolume: val });
                    audioService.setSFXVolume(val);
                  }} 
                />
                <SettingToggle 
                  label="Graphics" 
                  icon={<Monitor size={16} />} 
                  options={['low', 'medium', 'high']} 
                  selected={settings.graphicsQuality} 
                  onSelect={(val: any) => updateSettings({ graphicsQuality: val })} 
                />
                <SettingSlider 
                  label="Camera Speed" 
                  icon={<Move size={16} />} 
                  value={settings.sensitivity} 
                  onChange={(val) => updateSettings({ sensitivity: val })} 
                />
                <SettingSlider 
                  label="UI Density" 
                  icon={<Maximize size={16} />} 
                  value={settings.uiScale} 
                  onChange={(val) => updateSettings({ uiScale: val })} 
                />
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex flex-col gap-1 px-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Auth Services</p>
                   <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Connect for cross-play & cloud sync</p>
                </div>
                
                <div className="space-y-4">
                   {/* Google Connection Card */}
                   <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center">
                               <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path fill={isGoogleLinked ? "#4285F4" : "currentColor"} className={isGoogleLinked ? "" : "opacity-30"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                               </svg>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black text-white uppercase tracking-tighter">Google Account</span>
                               <span className={`text-[8px] font-bold uppercase tracking-widest ${isGoogleLinked ? 'text-emerald-400' : 'text-white/20'}`}>
                                  {isGoogleLinked ? 'CONNECTED' : 'DISCONNECTED'}
                               </span>
                            </div>
                         </div>
                         {isGoogleLinked ? (
                            <button 
                               onClick={() => setLinkConfirmStep({ type: 'google', action: 'unlink' })}
                               className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                               Disconnect
                            </button>
                         ) : (
                            <button 
                               onClick={() => handleLinkAction('google', 'link')}
                               className="px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                               Connect
                            </button>
                         )}
                      </div>
                      
                      {linkConfirmStep?.type === 'google' && (
                         <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-3 border-t border-white/5 mt-1">
                            <p className="text-[8px] font-bold text-red-400/80 uppercase text-center mb-3">Unlinking will disable Google Login for this profile. Continue?</p>
                            <div className="flex gap-2">
                               <button onClick={() => handleLinkAction('google', 'unlink')} className="flex-1 py-2 bg-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase">Yes, Unlink</button>
                               <button onClick={() => setLinkConfirmStep(null)} className="flex-1 py-2 bg-white/5 text-white/40 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                            </div>
                         </motion.div>
                      )}
                   </div>

                   {/* Apple Connection Card */}
                   <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center">
                               <svg className="w-4 h-4" viewBox="0 0 256 315">
                                  <path fill="currentColor" className={isAppleLinked ? "" : "opacity-30"} d="M213.803 167.03c.442 47.58 41.74 63.413 42.147 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.067 0-31.58 12.088-51.889 12.875-20.686.777-35.885-20.705-49.054-39.796-26.938-39.066-47.525-110.37-19.154-159.593 14.077-24.43 39.123-39.846 66.255-40.234 20.686-.388 40.25 13.91 52.88 13.91 12.63 0 36.634-17.18 61.354-14.654 10.378.43 39.51 4.148 58.19 31.426-1.493.926-34.71 20.19-34.354 61.643M174.197 45.445c11.01-13.34 18.423-31.875 16.393-50.38-15.897.644-35.157 10.613-46.54 23.945-10.204 11.79-19.114 30.684-16.71 48.74 17.704 1.378 35.843-8.96 46.857-22.305"/>
                               </svg>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black text-white uppercase tracking-tighter">Apple Identity</span>
                               <span className={`text-[8px] font-bold uppercase tracking-widest ${isAppleLinked ? 'text-emerald-400' : 'text-white/20'}`}>
                                  {isAppleLinked ? 'CONNECTED' : 'DISCONNECTED'}
                               </span>
                            </div>
                         </div>
                         {isAppleLinked ? (
                            <button 
                               onClick={() => setLinkConfirmStep({ type: 'apple', action: 'unlink' })}
                               className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                               Disconnect
                            </button>
                         ) : (
                            <button 
                               onClick={() => handleLinkAction('apple', 'link')}
                               className="px-3 py-1.5 bg-zinc-100 text-black hover:bg-white rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                               Connect
                            </button>
                         )}
                      </div>
                      
                      {linkConfirmStep?.type === 'apple' && (
                         <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-3 border-t border-white/5 mt-1">
                            <p className="text-[8px] font-bold text-red-400/80 uppercase text-center mb-3">Unlinking will disable Apple Login for this profile. Continue?</p>
                            <div className="flex gap-2">
                               <button onClick={() => handleLinkAction('apple', 'unlink')} className="flex-1 py-2 bg-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase">Yes, Unlink</button>
                               <button onClick={() => setLinkConfirmStep(null)} className="flex-1 py-2 bg-white/5 text-white/40 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                            </div>
                         </motion.div>
                      )}
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <PauseButton 
                  icon={<Trash2 size={16} />}
                  label="Reset Progress" 
                  danger
                  onClick={() => {
                    audioService.play('error');
                    setSubView('delete_confirm');
                    setDeleteConfirmStep(1);
                  }} 
                />
              </div>

              <PauseButton label="Back to Menu" onClick={() => setSubView('main')} />
            </div>
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
                    ? "Are you sure you want to reset your village to level 1? Your account will NOT be deleted. (Tu cuenta NO será eliminada)" 
                    : "THIS ACTION IS IRREVERSIBLE. YOU WILL LOSE YOUR BUILDINGS AND RESOURCES! (ESTO NO SE PUEDE DESHACER)"}
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

function SettingSlider({ label, icon, value, onChange }: { label: string, icon: React.ReactNode, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-white/40">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-mono">{Math.round(value * 100)}%</span>
      </div>
      <input 
        type="range" 
        min="0" max="2" step="0.1" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none accent-white"
      />
    </div>
  );
}

function SettingToggle({ label, icon, options, selected, onSelect }: { label: string, icon: React.ReactNode, options: string[], selected: string, onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
              selected === opt ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white/60'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
