/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, BUILDING_TYPES, MAP_ZONES } from '../../store/useGameStore';
import { 
  Pickaxe, Trees, Apple, Coins, Users, Sun, CloudRain, 
  CloudLightning, Wind, Snowflake, Briefcase, Coffee, 
  Pause, Settings, ChevronRight, BookOpen, ScrollText, 
  Lock, Globe, AlertTriangle, Zap, TrendingUp,
  LogIn, LogOut, Cloud, Crown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  tapAnimation, springTransition, menuTransition, floatUpAnimation 
} from '../../lib/animations';
import { UpgradeModal } from '../panels/UpgradeModal';
import { Tutorial } from '../panels/Tutorial';
import { PauseMenu } from '../menus/PauseMenu';
import { SeasonPanel } from '../panels/SeasonPanel';
import { QuestUI } from '../../systems/quests/QuestUI.tsx';
import { ActiveBoosts } from './ActiveBoosts';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';

export function HUD() {
  const state = useGameStore(useShallow(s => ({
    resources: s.resources,
    maxCapacity: s.maxCapacity,
    population: s.population,
    weather: s.weather,
    buildings: s.buildings,
    isEditMode: s.isEditMode,
    toggleEditMode: s.toggleEditMode,
    selectedObjectId: s.selectedObjectId,
    mapObjects: s.mapObjects,
    removeMapObject: s.removeMapObject,
    collectResource: s.collectResource,
    selectedBuildingId: s.selectedBuildingId,
    upgradeBuilding: s.upgradeBuilding,
    era: s.era,
    technologies: s.technologies,
    quests: s.quests,
    unlockedZones: s.unlockedZones,
    unlockZone: s.unlockZone,
    startResearch: s.startResearch,
    villageName: s.villageName,
    user: s.user,
    playerName: s.playerName,
    setPaused: s.setPaused,
    isPaused: s.isPaused,
    isResearchOpen: s.isResearchOpen,
    setResearchOpen: s.setResearchOpen,
    isQuestsOpen: s.isQuestsOpen,
    setQuestsOpen: s.setQuestsOpen,
    isZonesOpen: s.isZonesOpen,
    setZonesOpen: s.setZonesOpen,
    viewMode: s.viewMode,
    setViewMode: s.setViewMode,
    combatStatus: s.combatStatus,
    rankedPoints: s.rankedPoints,
    rankTier: s.rankTier,
    leaderboard: s.leaderboard,
    resourceNotifications: s.resourceNotifications,
    dailyMissions: s.dailyMissions,
    activeLiveEvents: s.activeLiveEvents
  })));

  const { 
    resources, maxCapacity, population, weather, buildings, 
    isEditMode, toggleEditMode, selectedObjectId, mapObjects, removeMapObject, collectResource,
    selectedBuildingId, upgradeBuilding, era, technologies, quests, 
    activeLiveEvents, unlockedZones, unlockZone, startResearch, villageName,
    user: storeUser, playerName, setPaused, isPaused,
    isResearchOpen, setResearchOpen, isQuestsOpen, setQuestsOpen, isZonesOpen, setZonesOpen,
    viewMode, setViewMode, combatStatus, rankedPoints, rankTier, leaderboard,
    resourceNotifications, dailyMissions
  } = state;

  const [isSeasonOpen, setSeasonOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [floaters, setFloaters] = useState<{ id: string; text: string; color: string; x: number; y: number }[]>([]);
  const lastResources = React.useRef(resources);

    // Resource gain detection for floating text
    React.useEffect(() => {
        if (isPaused) return;
        const diffs: { type: string; amount: number }[] = [];
        const currentResources = resources;
        const lastRes = lastResources.current;

        Object.keys(currentResources).forEach(key => {
            const resKey = key as keyof typeof currentResources;
            const diff = currentResources[resKey] - lastRes[resKey];
            if (diff >= 1) { 
                diffs.push({ type: resKey, amount: Math.floor(diff) });
            }
        });

        if (diffs.length > 0) {
            const newFloaters = diffs.map((d, i) => ({
                id: Math.random().toString(36).substr(2, 9),
                text: `+${d.amount}`,
                color: d.type === 'gold' ? 'text-amber-400' : d.type === 'food' ? 'text-emerald-400' : 'text-white',
                x: 80 + (i * 40), 
                y: 100 + Math.random() * 50
            }));
            setFloaters(prev => [...prev, ...newFloaters].slice(-20)); // Limit total floaters
            setTimeout(() => {
                setFloaters(prev => prev.filter(f => !newFloaters.find(nf => nf.id === f.id)));
            }, 1000);
        }
        lastResources.current = resources;
    }, [resources, isPaused]);

  const handleOpenPause = () => {
    audioService.play('open');
    setPaused(true);
  };

  const handleLogout = () => {
    // Moved to Settings in MainMenu
  };

  const selectedObject = mapObjects.find(o => o.id === selectedObjectId);

  const workingPop = buildings.reduce((acc, b) => {
    if (b.isConstructing) return acc;
    const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
    return acc + (type?.npcCount || 0);
  }, 0);

  const realWorking = Math.min(workingPop, population);
  const idlePop = Math.max(0, population - realWorking);

  const isAnyGuiOpen = isResearchOpen || isQuestsOpen || isZonesOpen || selectedBuildingId || selectedObjectId || isEditMode || isPaused;

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  const selectedBuildingType = selectedBuilding ? BUILDING_TYPES[selectedBuilding.typeId as keyof typeof BUILDING_TYPES] : null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 font-sans select-none">
      <ActiveBoosts />
      <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none overflow-visible z-50">
        <AnimatePresence>
          {resourceNotifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ x: 20, y: 10, opacity: 0, scale: 0.5 }}
              animate={{ x: 60, y: -40, opacity: 1, scale: 1.4 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute font-black italic text-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap font-display ${
                n.type === 'gold' ? 'text-amber-300' : 
                n.type === 'wood' ? 'text-amber-100' : 
                n.type === 'stone' ? 'text-slate-200' : 'text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] opacity-40 leading-none">SYNC</span>
                +{Math.floor(n.amount)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <UpgradeModal />
      <Tutorial />
      <PauseMenu isOpen={isPaused} onClose={() => setPaused(false)} />
      
      {/* --- TOP LEFT: RESOURCES & STATUS --- */}
      <AnimatePresence>
        {!isAnyGuiOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 w-full p-2 flex flex-col gap-2 pointer-events-none"
          >
            {/* Top Stats Bar */}
            <div className="flex justify-between items-center w-full px-2 mt-2">
              <div className="flex gap-2 items-center">
                <div className="glass-panel p-2 rounded-xl text-white pointer-events-auto flex items-center justify-center">
                   <WeatherIcon weather={weather} size={14} />
                </div>
                
                <div className="glass-panel px-3 py-2 rounded-xl text-white pointer-events-auto flex flex-col items-center">
                   <span className="text-[10px] font-black leading-none font-mono">{population}</span>
                   <span className="text-[5px] font-black opacity-30 uppercase tracking-[0.1em] mt-1">POP</span>
                </div>

                <motion.div 
                  onClick={() => setLeaderboardOpen(true)}
                  className="glass-panel bg-indigo-500/10 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 border-indigo-500/30 pointer-events-auto cursor-pointer"
                >
                   <TrendingUp size={10} className="text-brand-300" />
                   <span className="text-[9px] font-black tracking-tight leading-none font-mono">#{rankTier}</span>
                </motion.div>
              </div>

              <div className="flex items-center gap-2">
                <div className="glass-panel px-4 py-2 rounded-xl text-white flex flex-col items-end pointer-events-auto border-amber-500/20">
                  <span className="text-[10px] font-black uppercase italic tracking-tighter text-amber-500 font-display leading-none">{era}</span>
                </div>
                <button 
                  onClick={handleOpenPause}
                  className="p-3 glass-panel rounded-xl text-white/40 hover:text-white pointer-events-auto active:scale-95"
                >
                  <Pause size={14} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Resources Compact Grid */}
            <div className="grid grid-cols-4 gap-1.5 w-full px-2">
              <ResourceItem 
                icon={<Trees size={10} />} 
                value={Math.floor(resources.wood)} 
                max={maxCapacity.wood}
                color="bg-amber-600"
                label="W"
              />
              <ResourceItem 
                icon={<Pickaxe size={10} />} 
                value={Math.floor(resources.stone)} 
                max={maxCapacity.stone}
                color="bg-slate-500"
                label="S"
              />
              <ResourceItem 
                icon={<Apple size={10} />} 
                value={Math.floor(resources.food)} 
                max={maxCapacity.food}
                color="bg-emerald-500"
                label="F"
                warning={resources.food < 50}
                critical={resources.food < 20}
              />
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                key={resources.gold}
                className="glass-panel bg-amber-500/10 text-white px-2 py-1.5 rounded-xl flex items-center justify-center gap-1.5 border-amber-500/30 pointer-events-auto"
              >
                <Coins size={10} className="text-amber-500" />
                <span className="text-[10px] font-black tracking-tighter leading-none font-mono text-white">{formatValue(resources.gold)}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDE NAVIGATION (RELOCATED FOR PORTRAIT) --- */}
      <AnimatePresence>
        {!isAnyGuiOpen && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="absolute bottom-24 right-4 flex flex-col gap-2 items-end pointer-events-auto"
          >
            <TabButton 
              active={isQuestsOpen} 
              onClick={() => setQuestsOpen(!isQuestsOpen)}
              icon={<ScrollText size={14} />}
              label="Quests"
              badge={quests.filter(q => !q.completed).length}
            />
            <TabButton 
              active={isResearchOpen} 
              onClick={() => setResearchOpen(!isResearchOpen)}
              icon={<BookOpen size={14} />}
              label="Tech"
            />
            <TabButton 
              active={viewMode === 'fighting'} 
              onClick={() => {
                if (!storeUser.uid) return alert('Login required');
                setViewMode(viewMode === 'fighting' ? 'playing' : 'fighting');
              }}
              icon={<Zap size={14} />}
              label="PVP"
            />
            <TabButton 
              active={isSeasonOpen} 
              onClick={() => setSeasonOpen(!isSeasonOpen)}
              icon={<Crown size={14} />}
              label="Season"
              badge={dailyMissions.filter(m => m.completed && !m.claimed).length}
            />
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- SEASON PANEL --- */}
      <AnimatePresence>
        {isSeasonOpen && (
          <SeasonPanel onClose={() => setSeasonOpen(false)} />
        )}
      </AnimatePresence>

      {/* --- MATCHMAKING & COMBAT UI --- */}
      <AnimatePresence>
        {viewMode === 'fighting' && combatStatus === 'idle' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                  <Zap size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Arena Gateway</h3>
                <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Real PvP Battles Only</p>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => {
                    audioService.play('combat');
                    const { startMatchmaking } = useGameStore.getState();
                    startMatchmaking();
                  }}
                  className="bg-red-500 hover:bg-red-400 text-black font-black py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-xl shadow-red-500/20"
                 >
                   <span className="text-xs uppercase tracking-tighter italic">Attack Real</span>
                   <span className="text-[10px] opacity-60 uppercase font-black">Find Match</span>
                 </button>
                 <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white font-black py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all">
                   <span className="text-xs uppercase tracking-tighter italic">Defenses</span>
                   <span className="text-[10px] opacity-40 uppercase font-black">History</span>
                 </button>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl text-[9px] font-medium opacity-60">
                <AlertTriangle size={12} className="text-amber-500" />
                <span>You will be matched with a real player based on your village power.</span>
              </div>
            </div>
          </motion.div>
        )}

        {combatStatus === 'searching' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-6">
               <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="w-32 h-32 border-4 border-red-500/20 border-t-red-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={40} className="text-red-500 animate-pulse" />
                  </div>
               </div>
               <div className="flex flex-col items-center">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Searching...</h2>
                 <p className="text-xs text-white/40 font-black uppercase tracking-[0.3em]">Looking for real opponent</p>
               </div>
               <button 
                onClick={() => useGameStore.getState().cancelMatchmaking()}
                className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all"
               >
                 Cancel Search
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING PANELS --- */}
      <AnimatePresence>
        {isQuestsOpen && <QuestUI />}

        {isResearchOpen && (
          <SidePanel title="Research" onClose={() => setResearchOpen(false)} side="right">
            <div className="flex flex-col gap-2">
              {technologies.map((tech, idx) => (
                <div key={tech.id || `tech-${idx}`} className={`p-3 rounded-2xl border transition-all ${tech.unlocked ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
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

        {isZonesOpen && (
          <SidePanel title="Discovery" onClose={() => setZonesOpen(false)} side="right">
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

        {isLeaderboardOpen && (
          <SidePanel title="Global Ladder" onClose={() => setLeaderboardOpen(false)} side="right">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 text-[8px] font-black uppercase opacity-40 mb-1">
                <span>Player</span>
                <span>Power / RP</span>
              </div>
              {leaderboard.sort((a, b) => b.points - a.points).map((entry, idx) => (
                <div 
                  key={entry.userId || `leader-${idx}`} 
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    entry.userId === storeUser.uid 
                      ? 'bg-amber-400 border-amber-300 text-black' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black opacity-40 w-4">#{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase italic tracking-tighter">{entry.name}</span>
                      <span className="text-[8px] font-bold opacity-60">Lv {entry.level} Manager</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black">{entry.points} RP</span>
                    <span className="text-[7px] font-bold opacity-40 uppercase">{entry.powerScore} Power</span>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="p-8 text-center opacity-40 italic text-xs">Fetching world rankings...</div>
              )}
            </div>
          </SidePanel>
        )}
      </AnimatePresence>

      {/* --- BOTTOM RIGHT: OBJECT INTERACTION & SETTINGS --- */}
      <AnimatePresence>
        {!isPaused && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute bottom-4 right-4 flex flex-col gap-2 items-end pointer-events-auto"
          >
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
                  className="backdrop-blur-xl bg-black/80 border border-white/10 p-5 rounded-[30px] shadow-2xl flex flex-col gap-4 min-w-[240px]"
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

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter italic">
                       <span className="opacity-40">Durability</span>
                       <span>{Math.floor(selectedObject.health)} / {selectedObject.maxHealth}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedObject.health / selectedObject.maxHealth) * 100}%` }}
                        className="h-full bg-red-500 rounded-full"
                       />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => collectResource(selectedObject.id)}
                      className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-400 transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-lg"
                    >
                      <Pickaxe size={14} />
                      <span>Collect (+{selectedObject.reward} Gold)</span>
                    </button>
                    
                    <button 
                      onClick={() => removeMapObject(selectedObject.id)}
                      className="w-full bg-white/5 border border-white/10 text-white/40 font-black py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 text-[9px] uppercase tracking-widest"
                    >
                      <Coins size={12} />
                      <span>Instant Remove ({selectedObject.removalCost} Gold)</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.floor(value).toString();
}

function ResourceItem({ icon, value, max, color, label, warning, critical }: { icon: React.ReactNode, value: number, max: number, color: string, label: string, warning?: boolean, critical?: boolean }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Custom storage warning colors
  let barColor = color;
  let bgIntensity = 'bg-slate-900/60';
  
  if (critical) {
    barColor = 'bg-red-500';
    bgIntensity = 'bg-red-950/60 border-red-500/60 animate-pulse-fast';
  } else if (warning) {
    barColor = 'bg-amber-500';
    bgIntensity = 'bg-amber-950/40 border-amber-500/30';
  } else if (percentage > 95) {
    barColor = 'bg-orange-500';
    bgIntensity = 'bg-orange-950/40 border-orange-500/40';
  }

  return (
    <motion.div 
      className={`glass-panel ${bgIntensity} border-white/5 pl-2 pr-3 py-1.5 rounded-2xl flex items-center gap-2 text-white pointer-events-auto transition-all relative group`}
    >
      {critical && (
        <div className="absolute -inset-2 bg-red-600/10 blur-xl animate-pulse pointer-events-none" />
      )}
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg ${barColor} text-white shrink-0 transition-colors z-10`}>
        {icon}
      </div>
      <div className="flex flex-col w-full gap-1 z-10">
        <div className="flex justify-between items-baseline h-3">
          <span className={`font-mono font-black text-[10px] leading-none mb-0.5 ${critical ? 'text-red-400' : 'text-white'}`}>{formatValue(value)}</span>
          <span className="text-[7px] font-black text-white/20 uppercase tracking-tighter leading-none">{label}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${barColor} rounded-full transition-all duration-700`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, onPointerDown?: () => void, icon: React.ReactNode, label: string, badge?: number }) {
  return (
    <motion.button 
      onClick={onClick}
      {...tapAnimation}
      className={`glass-panel border-white/5 p-3 rounded-2xl flex items-center gap-3 transition-all relative group shadow-xl ${
        active ? 'bg-brand-500 text-white border-brand-400' : 'text-slate-400 bg-black/40'
      }`}
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-[0.1em] font-display italic">{label}</span>
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-slate-900 shadow-xl">
          {badge}
        </div>
      )}
    </motion.button>
  );
}

function SidePanel({ title, children, onClose, side }: { title: string, children: React.ReactNode, onClose: () => void, side: 'left' | 'right' }) {
  return (
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 glass-panel border-t border-white/10 rounded-t-[40px] shadow-2xl p-6 pointer-events-auto flex flex-col z-[100] h-[85vh]"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-black uppercase tracking-tight text-white italic font-display">{title}</h3>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-400 mt-0.5">VILLAGE SYSTEMS ACTIVE</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:scale-90 transition-all"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
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
