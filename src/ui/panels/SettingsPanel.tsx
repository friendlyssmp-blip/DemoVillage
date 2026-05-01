/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { 
  Volume2, Monitor, Move, Maximize, 
  Trash2, AlertTriangle, LogOut,
  Settings as SettingsIcon, Info, ChevronLeft,
  ShieldCheck, Smartphone, CheckCircle2, XCircle, X
} from 'lucide-react';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';
import { auth } from '../../lib/firebase';

interface SettingsPanelProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function SettingsPanel({ onBack, showBack = true }: SettingsPanelProps) {
  const { viewMode, setViewMode, settings, updateSettings, resetVillage } = useGameStore();
  const [resetConfirmStep, setResetConfirmStep] = useState(0);
  const [resetInput, setResetInput] = useState('');
  const [linkConfirmStep, setLinkConfirmStep] = useState<{ type: 'google' | 'apple', action: 'link' | 'unlink' } | null>(null);

  const currentUser = auth.currentUser;
  const isGoogleLinked = currentUser?.providerData.some(p => p.providerId === 'google.com');
  const isAppleLinked = currentUser?.providerData.some(p => p.providerId === 'apple.com');

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

  const handleLogout = async () => {
    await authService.logout();
    setViewMode('menu');
  };

  if (resetConfirmStep > 0) {
    return (
      <div className="flex flex-col gap-10 text-center py-6">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-red-500/10 rounded-[30px] flex items-center justify-center text-red-500 mb-8 border border-red-500/30"
          >
            <AlertTriangle size={48} strokeWidth={2.5} />
          </motion.div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white font-display">System Wipe</h3>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-[240px] mx-auto">
            {resetConfirmStep === 1 
              ? "Are you absolutely sure? This protocol will reset your settlement back to Primal Era status." 
              : "TERMINAL WARNING: THIS ACTION IS IRREVERSIBLE. ALL ARCHITECTURAL DATA WILL BE PURGED."}
          </p>
        </div>

        <div className="space-y-4 px-4">
          {resetConfirmStep === 1 ? (
            <>
              <button 
                onClick={() => setResetConfirmStep(2)}
                className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase italic tracking-[0.2em] text-[11px] active:scale-95 transition-all shadow-2xl shadow-red-500/40 border border-red-400 font-display"
              >
                CONFIRM DESTRUCTION
              </button>
              <button 
                onClick={() => setResetConfirmStep(0)}
                className="w-full py-5 bg-white/5 text-slate-400 rounded-3xl font-black uppercase italic tracking-[0.2em] text-[11px] active:scale-95 transition-all border border-white/5 font-display"
              >
                ABORT PROTOCOL
              </button>
            </>
          ) : (
            <>
              <div className="space-y-3 mb-6 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60 ml-2 font-mono">INPUT 'RESET' TO OVERRIDE</label>
                <input 
                  type="text" 
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  placeholder="RESET"
                  className="w-full bg-black/60 border-2 border-red-500/30 rounded-2xl px-6 py-4 text-white font-black text-center tracking-[0.4em] focus:outline-none focus:border-red-500 transition-all uppercase font-mono text-xl"
                />
              </div>
              <button 
                disabled={resetInput !== 'RESET'}
                onClick={async () => {
                  audioService.play('error');
                  await resetVillage();
                }}
                className={`w-full py-5 rounded-3xl font-black uppercase italic tracking-[0.2em] text-[11px] active:scale-95 transition-all shadow-2xl font-display ${
                  resetInput === 'RESET' ? 'bg-red-600 text-white shadow-red-500/40 border border-red-400' : 'bg-white/5 text-white/10'
                }`}
              >
                TERMINATE PROGRESS
              </button>
              <button 
                onClick={() => setResetConfirmStep(0)}
                className="w-full py-5 bg-white/5 text-slate-500 rounded-3xl font-black uppercase italic tracking-[0.2em] text-[11px] active:scale-95 transition-all font-display"
              >
                NEVERMIND
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white font-display">INTERFACE</h3>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-400 mt-1 font-mono">v0.9.5 ALPHA</p>
        </div>
        {showBack && (
          <button onClick={onBack} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-white/40 active:scale-90">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar pr-1">
        {/* Audio Section */}
        <div className="space-y-3">
          <SectionHeader icon={<Volume2 size={14} />} title="Audio Hardware" />
          <SettingSlider 
            label="Master Vol" 
            icon={<Volume2 size={12} />} 
            value={settings.soundVolume} 
            onChange={(val) => {
              updateSettings({ soundVolume: val });
              audioService.setSFXVolume(val);
            }} 
          />
        </div>

        {/* Visuals Section */}
        <div className="space-y-3">
          <SectionHeader icon={<Monitor size={14} />} title="Visual Engine" />
          <SettingToggle 
            label="Quality" 
            icon={<Monitor size={12} />} 
            options={['low', 'high']} 
            selected={settings.graphicsQuality} 
            onSelect={(val: any) => updateSettings({ graphicsQuality: val })} 
          />
        </div>

        {/* System Actions */}
        <div className="pt-4 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-400 font-black uppercase italic tracking-[0.1em] text-[10px]"
          >
            <LogOut size={16} />
            <span>EXIT SESSION</span>
          </button>
          
          <button 
            onClick={() => setResetConfirmStep(1)}
            className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-black uppercase italic tracking-[0.1em] text-[10px]"
          >
            <Trash2 size={16} />
            <span>WIPE PROTOCOL</span>
          </button>
        </div>
      </div>
      
      {viewMode === 'settings' && (
        <button 
          onClick={() => setViewMode('menu')}
          className="w-full bg-white text-slate-950 font-black py-6 rounded-[30px] uppercase italic tracking-[0.2em] text-sm active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 font-display mt-6"
        >
          RETURN TO INTERFACE
        </button>
      )}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="text-brand-400">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-mono italic">{title}</span>
    </div>
  );
}

function SettingSlider({ label, icon, value, onChange }: { label: string, icon: React.ReactNode, value: number, onChange: (v: number) => void }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-display italic">{label}</span>
        <span className="text-[11px] font-mono font-black text-brand-400 bg-black/40 px-3 py-1 rounded-xl border border-white/5">{Math.round(value * 100)}%</span>
      </div>
      <input 
        type="range" 
        min="0" max="2" step="0.1" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-brand-500 cursor-pointer border border-white/5"
      />
    </div>
  );
}

function SettingToggle({ label, icon, options, selected, onSelect }: { label: string, icon: React.ReactNode, options: string[], selected: string, onSelect: (v: string) => void }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-5">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-display italic">{label}</span>
      <div className="grid grid-cols-3 gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-mono ${
              selected === opt ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function AuthCard({ type, isLinked, onAction, confirmStep, onCancelConfirm, onConfirm }: any) {
  const isGoogle = type === 'google';
  
  return (
    <div className={`border-2 rounded-[32px] p-6 flex flex-col gap-6 transition-all relative overflow-hidden ${
      isLinked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'
    }`}>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isLinked ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-black/40 border-white/5'}`}>
             {isGoogle ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill={isLinked ? "#10b981" : "currentColor"} className={isLinked ? "" : "opacity-20"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               </svg>
             ) : (
                <svg className="w-6 h-6" viewBox="0 0 256 315">
                  <path fill="currentColor" className={isLinked ? "" : "opacity-20"} d="M213.803 167.03c.442 47.58 41.74 63.413 42.147 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.067 0-31.58 12.088-51.889 12.875-20.686.777-35.885-20.705-49.054-39.796-26.938-39.066-47.525-110.37-19.154-159.593 14.077-24.43 39.123-39.846 66.255-40.234 20.686-.388 40.25 13.91 52.88 13.91 12.63 0 36.634-17.18 61.354-14.654 10.378.43 39.51 4.148 58.19 31.426-1.493.926-34.71 20.19-34.354 61.643M174.197 45.445c11.01-13.34 18.423-31.875 16.393-50.38-15.897.644-35.157 10.613-46.54 23.945-10.204 11.79-19.114 30.684-16.71 48.74 17.704 1.378 35.843-8.96 46.857-22.305"/>
                </svg>
             )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-tight font-display italic">{isGoogle ? 'Google Relay' : 'Apple Link'}</span>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] font-mono mt-1 ${isLinked ? 'text-emerald-400' : 'text-white/20'}`}>
              {isLinked ? 'PROTOCOL ACTIVE' : 'INTERFACE OFFLINE'}
            </span>
          </div>
        </div>
        <button 
          onClick={onAction}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all font-display italic ${
            isLinked ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white shadow-xl shadow-brand-500/10'
          }`}
        >
          {isLinked ? 'REVOKE' : 'AUTHORIZE'}
        </button>
      </div>
      
      {confirmStep && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-white/5 relative z-10">
          <p className="text-[9px] font-black text-red-400/80 uppercase text-center mb-5 italic tracking-widest font-mono">CRITICAL: Unlinking will disable this authentication gateway.</p>
          <div className="flex gap-4">
            <button onClick={onConfirm} className="flex-1 py-4 bg-red-600/20 text-red-500 rounded-2xl text-[10px] font-black uppercase font-display border border-red-500/30">CONFIRM REVOKE</button>
            <button onClick={onCancelConfirm} className="flex-1 py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase font-display border border-white/5">CANCEL</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
