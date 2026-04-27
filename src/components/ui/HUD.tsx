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
  LogIn, LogOut, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UpgradeModal } from './UpgradeModal';
import { Tutorial } from './Tutorial';
import { PauseMenu } from './PauseMenu';
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
    selectedBuildingId: s.selectedBuildingId,
    upgradeBuilding: s.upgradeBuilding,
    era: s.era,
    technologies: s.technologies,
    quests: s.quests,
    activeEvents: s.activeEvents,
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
    leaderboard: s.leaderboard
  })));

  const { 
    resources, maxCapacity, population, weather, buildings, 
    isEditMode, toggleEditMode, selectedObjectId, mapObjects, removeMapObject,
    selectedBuildingId, upgradeBuilding, era, technologies, quests, 
    activeEvents, unlockedZones, unlockZone, startResearch, villageName,
    user: storeUser, playerName, setPaused, isPaused,
    isResearchOpen, setResearchOpen, isQuestsOpen, setQuestsOpen, isZonesOpen, setZonesOpen,
    viewMode, setViewMode, combatStatus, rankedPoints, rankTier, leaderboard
  } = state;

  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);

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
      <UpgradeModal />
      <Tutorial />
      <PauseMenu isOpen={isPaused} onClose={() => setPaused(false)} />
      
      {/* --- TOP LEFT: RESOURCES & STATUS --- */}
      <AnimatePresence>
        {!isAnyGuiOpen && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="absolute top-3 left-3 flex flex-col gap-2 items-start max-md:top-2 max-md:left-2"
          >
            {/* Weather & Population Bar */}
            <div className="flex gap-1.5 max-md:gap-1">
              <motion.div 
                animate={{ rotate: weather === 'windy' ? [0, 5, 0] : 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="backdrop-blur-xl bg-black/40 border border-white/10 p-2 rounded-xl text-white pointer-events-auto flex items-center justify-center shadow-lg max-md:p-1.5"
              >
                 <WeatherIcon weather={weather} size={16} />
              </motion.div>
              
              <div className="backdrop-blur-xl bg-black/40 border border-white/10 pl-3 pr-4 py-1.5 rounded-xl text-white pointer-events-auto flex items-center gap-3 shadow-xl max-md:pl-2 max-md:pr-3 max-md:py-1 max-md:gap-2">
                <div className="flex items-center gap-2 border-r border-white/10 pr-3 max-md:pr-2">
                  <Users size={12} className="text-blue-300" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter leading-none mb-0.5">Citizens</span>
                    <span className="text-xs font-black tracking-tight leading-none">{population}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 max-md:gap-1.5">
                  <div className="flex flex-col items-center gap-0.5 opacity-80" title="Working">
                     <Briefcase size={10} className="text-emerald-400" />
                     <span className="text-[8px] font-black">{realWorking}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 opacity-80" title="Idle">
                     <Coffee size={10} className="text-amber-400" />
                     <span className="text-[8px] font-black">{idlePop}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="flex flex-col gap-1.5 max-md:grid max-md:grid-cols-2 max-md:gap-1">
              <motion.div 
                onClick={() => setLeaderboardOpen(true)}
                className="backdrop-blur-xl bg-indigo-600/90 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-indigo-400/50 pointer-events-auto cursor-pointer hover:bg-indigo-500 transition-all active:scale-95 max-md:col-span-2"
              >
                 <TrendingUp size={12} className="text-indigo-200" />
                 <div className="flex flex-col">
                   <span className="text-[6px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5">{rankTier} Rank</span>
                   <span className="text-[10px] font-black tracking-tighter leading-none">{rankedPoints} RP</span>
                 </div>
              </motion.div>
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
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="backdrop-blur-xl bg-amber-400/90 text-black px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-yellow-300/50 pointer-events-auto"
              >
                <div className="bg-black/10 p-0.5 rounded-lg">
                  <Coins size={12} className="drop-shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[6px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5">Gold</span>
                  <span className="text-xs font-black tracking-tighter leading-none">{Math.floor(resources.gold).toLocaleString()}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOP RIGHT: ERA & GLOBAL NAVIGATION --- */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-auto max-md:top-2 max-md:right-2">
        {/* Village Name Header */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none w-full">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-[6px] font-black uppercase tracking-[0.4em] text-white/40 mb-0.5">Village of</span>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] max-md:text-lg">
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
                {activeEvents.map((event, idx) => (
                  <motion.div 
                    key={event.id || `event-${idx}`}
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

                {/* Logout moved to Settings */}

                <TabButton 
                  active={isQuestsOpen} 
                  onClick={() => {
                    audioService.play('open');
                    setQuestsOpen(!isQuestsOpen);
                  }}
                  icon={<ScrollText size={16} />}
                  label="Quests"
                  badge={quests.filter(q => !q.completed).length}
                />
                <TabButton 
                  active={isResearchOpen} 
                  onClick={() => {
                    audioService.play('open');
                    setResearchOpen(!isResearchOpen);
                  }}
                  icon={<BookOpen size={16} />}
                  label="Tech"
                />
                <TabButton 
                  active={viewMode === 'fighting'} 
                  onClick={() => {
                    audioService.play('click');
                    if (!storeUser.uid) {
                       alert('Please login to play Multiplayer');
                       return;
                    }
                    if (!storeUser.isVerified) {
                       alert('Please verify your email to access Ranked/PvP');
                       return;
                    }
                    if (viewMode === 'fighting') setViewMode('playing');
                    else setViewMode('fighting');
                  }}
                  icon={<Zap size={16} />}
                  label="Multiplayer"
                />
                <TabButton 
                  active={isLeaderboardOpen} 
                  onClick={() => {
                    const next = !isLeaderboardOpen;
                    setLeaderboardOpen(next);
                    if (next) useGameStore.getState().fetchLeaderboard();
                  }}
                  icon={<Globe size={16} />}
                  label="Leaderboard"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
        {isQuestsOpen && (
          <SidePanel title="Objectives" onClose={() => setQuestsOpen(false)} side="right">
            <div className="flex flex-col gap-2">
              {quests.map((q, idx) => (
                <div 
                  key={q.id || `quest-${idx}`} 
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
      className={`backdrop-blur-xl ${bgIntensity} border pl-1.5 pr-2 py-1 rounded-xl flex items-center gap-1.5 text-white pointer-events-auto min-w-[100px] max-md:min-w-0 transition-all ${percentage > 95 ? 'animate-pulse' : ''}`}
    >
      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-md ${barColor} text-white shrink-0 transition-colors`}>
        {icon}
      </div>
      <div className="flex flex-col w-full gap-0.5">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-black italic tracking-tighter leading-none">{value.toLocaleString()}</span>
          </div>
        </div>
        <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${barColor} rounded-full opacity-80 transition-colors`}
          />
        </div>
      </div>
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
      className={`fixed top-16 bottom-16 ${side === 'left' ? 'left-4' : 'right-12'} w-72 max-md:right-4 max-md:left-4 max-md:w-auto backdrop-blur-2xl bg-black/70 border border-white/10 rounded-[30px] shadow-2xl p-6 pointer-events-auto flex flex-col z-50`}
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
