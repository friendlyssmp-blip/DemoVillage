/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { Play, Settings, LogOut, X, Info, Volume2, Monitor, Move, Maximize, ChevronLeft } from 'lucide-react';
import { authService } from '../../services/authService';

type PauseSubView = 'main' | 'settings' | 'logout_confirm';

export function PauseMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { setViewMode, setPaused, settings, updateSettings } = useGameStore();
  const [subView, setSubView] = useState<PauseSubView>('main');

  if (!isOpen) return null;

  const handleClose = () => {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    icon={<Settings size={18} />} 
                    label="Settings" 
                    onClick={() => setSubView('settings')} 
                  />
                  <PauseButton 
                    icon={<Info size={18} />} 
                    label="Help & Guide" 
                    onClick={() => {}} 
                  />
                  <div className="pt-4 border-t border-white/5 mt-4">
                     <PauseButton 
                       icon={<LogOut size={18} />} 
                       label="Log Out" 
                       onClick={() => setSubView('logout_confirm')} 
                       danger
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
                  onChange={(val) => updateSettings({ soundVolume: val })} 
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

              <PauseButton label="Back to Menu" onClick={() => setSubView('main')} />
            </div>
          )}

          {subView === 'logout_confirm' && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                <LogOut size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sign Out</h3>
                <p className="text-sm text-white/40 mt-1">Are you sure you want to end your current session?</p>
              </div>
              <div className="w-full space-y-2">
                <PauseButton label="Yes, Log Out" onClick={handleLogout} danger />
                <PauseButton label="Go Back" onClick={() => setSubView('main')} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function PauseButton({ icon, label, onClick, primary = false, danger = false }: {
  icon?: React.ReactNode,
  label: string,
  onClick: () => void,
  primary?: boolean,
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border ${
        primary 
          ? 'bg-white text-black border-white shadow-xl' 
          : danger 
            ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
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
