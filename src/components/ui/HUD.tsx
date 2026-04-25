/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore, BUILDING_TYPES, MAP_ZONES } from '../../store/useGameStore';
import { 
  Pickaxe, Trees, Apple, Coins, Users, Sun, CloudRain, 
  CloudLightning, Wind, Snowflake, Briefcase, Coffee, 
  Pause, Settings, ChevronRight, BookOpen, ScrollText, 
  Lock, Globe, AlertTriangle, Zap, TrendingUp,
  LogIn, LogOut, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UpgradeModal } from './UpgradeModal';
import { Tutorial } from './Tutorial';
import { PauseMenu } from './PauseMenu';
import { authService } from '../../services/authService';
import { auth } from '../../lib/firebase';

export function HUD() {
  const { 
    resources, maxCapacity, population, weather, buildings, 
    isEditMode, toggleEditMode, selectedObjectId, mapObjects, removeMapObject,
    selectedBuildingId, upgradeBuilding, era, technologies, quests, 
    activeEvents, unlockedZones, unlockZone, startResearch, villageName,
    user: storeUser, playerName, setPaused
  } = useGameStore();

  const [showResearch, setShowResearch] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const [showPause, setShowPause] = useState(false);

  const handleOpenPause = () => {
    setShowPause(true);
    setPaused(true);
  };

  const handleLogout = () => authService.logout();

  const selectedObject = mapObjects.find(o => o.id === selectedObjectId);

  const workingPop = buildings.reduce((acc, b) => {
    if (b.isConstructing) return acc;
    const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
    return acc + (type?.npcCount || 0);
  }, 0);

  const realWorking = Math.min(workingPop, population);
  const idlePop = Math.max(0, population - realWorking);

  const isAnyGuiOpen = showResearch || showQuests || showZones || selectedBuildingId || selectedObjectId || isEditMode || showPause;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 font-sans select-none">
      <UpgradeModal />
      <Tutorial />
      <PauseMenu isOpen={showPause} onClose={() => setShowPause(false)} />
      
      {/* --- TOP LEFT: RESOURCES & STATUS --- */}
      <AnimatePresence>
        {!isAnyGuiOpen && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="absolute top-3 left-3 flex flex-col gap-2 items-start"
          >
            {/* Weather & Population Bar */}
            <div className="flex gap-1.5">
              <motion.div 
                animate={{ rotate: weather === 'windy' ? [0, 5, 0] : 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="backdrop-blur-xl bg-black/40 border border-white/10 p-2 rounded-xl text-white pointer-events-auto flex items-center justify-center shadow-lg"
              >
                 <WeatherIcon weather={weather} size={18} />
              </motion.div>
              
              <div className="backdrop-blur-xl bg-black/40 border border-white/10 pl-3 pr-4 py-1.5 rounded-xl text-white pointer-events-auto flex items-center gap-3 shadow-xl">
                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                  <Users size={14} className="text-blue-300" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter leading-none mb-0.5">Citizens</span>
                    <span className="text-sm font-black tracking-tight leading-none">{population}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5 opacity-80" title="Working">
                     <Briefcase size={12} className="text-emerald-400" />
                     <span className="text-[9px] font-black">{realWorking}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 opacity-80" title="Idle">
                     <Coffee size={12} className="text-amber-400" />
                     <span className="text-[9px] font-black">{idlePop}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="flex flex-col gap-1.5">
              <ResourceItem 
                icon={<Trees size={10} />} 
                value={Math.floor(resources.wood)} 
                max={maxCapacity.wood}
                color="bg-amber-600"
                label="Wood"
              />
              <ResourceItem 
                icon={<Pickaxe size={10} />} 
                value={Math.floor(resources.stone)} 
                max={maxCapacity.stone}
                color="bg-slate-500"
                label="Stone"
              />
              <ResourceItem 
                icon={<Apple size={10} />} 
                value={Math.floor(resources.food)} 
                max={maxCapacity.food}
                color="bg-emerald-600"
                label="Food"
                warning={resources.food < 50}
              />
            </div>

            {/* Gold Counter */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="backdrop-blur-xl bg-amber-400/90 text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg border border-yellow-300/50 pointer-events-auto"
            >
              <div className="bg-black/10 p-1 rounded-lg">
                <Coins size={16} className="drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5">Treasury</span>
                <span className="text-base font-black tracking-tighter leading-none">{Math.floor(resources.gold).toLocaleString()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOP RIGHT: ERA & GLOBAL NAVIGATION --- */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Village Name Header */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Settlement of</span>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              {villageName}
            </h2>
          </motion.div>
        </div>

        <AnimatePresence>
          {!isAnyGuiOpen && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="flex items-center gap-2"
            >
               <button 
                 onClick={handleOpenPause}
                 className="p-2.5 bg-black/40 border border-white/5 rounded-full text-white/40 hover:text-white hover:bg-black/60 transition-all backdrop-blur-md shadow-lg pointer-events-auto active:scale-90"
               >
                 <Pause size={14} fill="currentColor" />
               </button>
               <div className="flex flex-col items-end gap-1.5">
                 <div className="backdrop-blur-xl bg-black/60 border border-white/10 px-4 py-2 rounded-xl text-white shadow-xl flex flex-col items-end border-r-2 border-r-amber-500 leading-none">
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Era</span>
                   <span className="text-lg font-black uppercase italic tracking-tighter text-amber-500">{era}</span>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-end gap-1.5">
          <AnimatePresence>
            {!isAnyGuiOpen && (
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="flex flex-col items-end gap-1.5"
              >
                {activeEvents.map(event => (
                  <motion.div 
                    key={event.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="backdrop-blur-lg bg-emerald-500/90 text-black px-3 py-1.5 rounded-lg border border-emerald-400 flex items-center gap-2 shadow-lg"
                  >
                    <Zap size={12} fill="currentColor" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black leading-none uppercase">{event.name}</span>
                      <span className="text-[7px] font-bold opacity-70 italic">{event.description}</span>
                    </div>
                  </motion.div>
                ))}

                <button 
                  onClick={handleLogout}
                  className={`backdrop-blur-xl border px-3 py-2 rounded-xl flex items-center gap-3 transition-all relative group shadow-md ${
                    storeUser.uid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white border-white/10'
                  }`}
                >
                  <LogOut size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {storeUser.uid ? playerName : 'Guest'}
                  </span>
                  {storeUser.isVerified && (
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full" 
                    />
                  )}
                </button>

                <TabButton 
                  active={showQuests} 
                  onClick={() => setShowQuests(!showQuests)}
                  icon={<ScrollText size={16} />}
                  label="Quests"
                  badge={quests.filter(q => !q.completed).length}
                />
                <TabButton 
                  active={showResearch} 
                  onClick={() => setShowResearch(!showResearch)}
                  icon={<BookOpen size={16} />}
                  label="Tech"
                />
                <TabButton 
                  active={showZones} 
                  onClick={() => setShowZones(!showZones)}
                  icon={<Globe size={16} />}
                  label="Explore"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- FLOATING PANELS --- */}
      <AnimatePresence>
        {showQuests && (
          <SidePanel title="Objectives" onClose={() => setShowQuests(false)} side="right">
            <div className="flex flex-col gap-2">
              {quests.map(q => (
                <div 
                  key={q.id} 
                  className={`p-3 rounded-2xl border transition-all ${
                    q.completed 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-tight ${q.completed ? 'text-emerald-400' : 'text-amber-400'}`}>{q.title}</span>
                    {q.completed ? (
                      <div className="text-[7px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black">DONE</div>
                    ) : (
                      <div className="text-[7px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded-full font-black">ACTIVE</div>
                    )}
                  </div>
                  <p className="text-[9px] font-medium opacity-60 mb-2 leading-tight">{q.description}</p>
                  <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-lg">
                    <span className="text-[7px] font-black uppercase opacity-30">Reward</span>
                    <div className="flex gap-1.5">
                       {Object.entries(q.reward).map(([k, v]) => k !== 'unlock' && (
                         <div key={k} className="text-[8px] font-bold text-emerald-400 flex items-center gap-1">
                           <TrendingUp size={8} />
                           {v} {k[0].toUpperCase()}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SidePanel>
        )}

        {showResearch && (
          <SidePanel title="Research" onClose={() => setShowResearch(false)} side="right">
            <div className="flex flex-col gap-2">
              {technologies.map(tech => (
                <div key={tech.id} className={`p-3 rounded-2xl border transition-all ${tech.unlocked ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-tight">{tech.name}</span>
                    {tech.unlocked ? <span className="text-[7px] text-indigo-400 font-black">KNOWN</span> : <span className="text-[7px] opacity-40 font-black italic">{tech.researchTime}s</span>}
                  </div>
                  <p className="text-[9px] opacity-60 mb-2 leading-tight">{tech.description}</p>
                  
                  {!tech.unlocked && (
                    <button 
                      onClick={() => startResearch(tech.id)}
                      disabled={tech.isResearching || tech.requiredEra !== era || resources.gold < tech.cost.gold}
                      className="w-full py-2 rounded-xl bg-white text-black font-black text-[9px] flex items-center justify-center gap-1.5 disabled:opacity-20 transition-all active:scale-95 shadow-md"
                    >
                      {tech.isResearching ? (
                         <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${tech.progress * 100}%` }} className="h-full bg-indigo-500" />
                         </div>
                      ) : (
                        <>
                          <BookOpen size={10} />
                          <span>UNLOCK ({tech.cost.gold} G)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SidePanel>
        )}

        {showZones && (
          <SidePanel title="Discovery" onClose={() => setShowZones(false)} side="right">
            <div className="flex flex-col gap-2">
              {MAP_ZONES.map(zone => {
                const isUnlocked = unlockedZones.includes(zone.id);
                return (
                  <div key={zone.id} className={`p-3 rounded-2xl border ${isUnlocked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black uppercase italic tracking-tighter opacity-80">{zone.name}</span>
                      {isUnlocked && <span className="text-[7px] text-amber-500 font-black tracking-widest">CLAIMED</span>}
                    </div>
                    {!isUnlocked && (
                      <button 
                        onClick={() => unlockZone(zone.id)}
                        disabled={resources.gold < zone.cost.gold}
                        className="w-full mt-1 py-2 rounded-xl bg-amber-500 text-black font-black text-[9px] flex items-center justify-center gap-1.5 hover:bg-amber-400 disabled:opacity-30 active:scale-95 transition-all shadow-md"
                      >
                        <Globe size={10} />
                        <span>CLAIM ({zone.cost.gold} G)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </SidePanel>
        )}
      </AnimatePresence>

      {/* --- BOTTOM RIGHT: OBJECT INTERACTION & SETTINGS --- */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end pointer-events-auto">
        <AnimatePresence>
          {!selectedObject && !selectedBuildingId && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={toggleEditMode}
              className={`p-3 rounded-2xl backdrop-blur-xl border shadow-xl transition-all active:scale-90 ${
                isEditMode ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-black/60 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {isEditMode ? <Settings size={20} className="animate-spin-slow" /> : <Pickaxe size={20} />}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedObject && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="backdrop-blur-xl bg-black/80 border border-white/10 p-5 rounded-[30px] shadow-2xl flex flex-col gap-4 min-w-[200px]"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  {selectedObject.type === 'tree' ? <Trees size={20} className="text-amber-500" /> : <Pickaxe size={20} className="text-slate-400" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40 leading-none mb-1">{selectedObject.type}</span>
                  <span className="text-sm font-black uppercase tracking-tight italic">Natural Resource</span>
                </div>
              </div>
              <button 
                onClick={() => removeMapObject(selectedObject.id)}
                className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-amber-400 transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-lg"
              >
                <Coins size={14} />
                <span>Harvest (50 Gold)</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResourceItem({ icon, value, max, color, label, warning }: { icon: React.ReactNode, value: number, max: number, color: string, label: string, warning?: boolean }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Custom storage warning colors
  let barColor = color;
  let bgIntensity = 'bg-black/40';
  
  if (percentage > 95) {
    barColor = 'bg-red-500';
    bgIntensity = 'bg-red-950/40 border-red-500/50';
  } else if (percentage > 80) {
    barColor = 'bg-amber-500';
    bgIntensity = 'bg-amber-950/20 border-amber-500/30';
  }

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`backdrop-blur-xl ${bgIntensity} border pl-2 pr-3 py-1 rounded-xl flex items-center gap-3 text-white pointer-events-auto min-w-[130px] transition-all ${percentage > 95 ? 'animate-pulse' : ''}`}
    >
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md ${barColor} text-white shrink-0 transition-colors`}>
        {icon}
      </div>
      <div className="flex flex-col w-full gap-0.5">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black italic tracking-tighter leading-none">{value.toLocaleString()}</span>
            {percentage > 90 && <span className="text-[6px] font-black uppercase text-red-400 animate-bounce">FULL</span>}
          </div>
          <span className="text-[7px] font-bold opacity-30 leading-none">{max.toLocaleString()}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${barColor} rounded-full opacity-80 transition-colors`}
          />
        </div>
      </div>
      {(warning || percentage > 90) && (
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
          <AlertTriangle size={12} className={percentage > 90 ? "text-red-400" : "text-amber-400"} />
        </motion.div>
      )}
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`backdrop-blur-xl border px-3 py-2 rounded-xl flex items-center gap-3 transition-all relative group shadow-md ${
        active ? 'bg-amber-400 text-black border-amber-300' : 'bg-black/60 text-white border-white/10 hover:border-white/20'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-black shadow-md">
          {badge}
        </div>
      )}
    </button>
  );
}

function SidePanel({ title, children, onClose, side }: { title: string, children: React.ReactNode, onClose: () => void, side: 'left' | 'right' }) {
  return (
    <motion.div 
      initial={{ x: side === 'left' ? -350 : 350, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: side === 'left' ? -350 : 350, opacity: 0 }}
      className={`fixed top-16 bottom-16 ${side === 'left' ? 'left-4' : 'right-12'} w-72 backdrop-blur-2xl bg-black/70 border border-white/10 rounded-[30px] shadow-2xl p-6 pointer-events-auto flex flex-col`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-black uppercase tracking-[0.1em] text-white italic border-b border-amber-500 pb-0.5">{title}</h3>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <ChevronRight size={18} className={side === 'right' ? '' : 'rotate-180'} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-2">
        {children}
      </div>
    </motion.div>
  );
}

function WeatherIcon({ weather, size }: { weather: string, size: number }) {
  switch (weather) {
    case 'sunny': return <Sun size={size} className="text-yellow-400" />;
    case 'rainy': return <CloudRain size={size} className="text-blue-400" />;
    case 'stormy': return <CloudLightning size={size} className="text-purple-400" />;
    case 'windy': return <Wind size={size} className="text-slate-200" />;
    case 'snowy': return <Snowflake size={size} className="text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />;
    default: return <Sun size={size} />;
  }
}
