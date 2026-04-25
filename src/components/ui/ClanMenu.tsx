/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Shield, Trophy, MessageSquare, 
  Plus, Search, X, ChevronRight, 
  User, Crown, Map, Swords, Star
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { clanService } from '../../services/clanService';

export function ClanMenu() {
  const { setViewMode, activeClan, user, playerName } = useGameStore();
  const [clans, setClans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'clans' | 'members' | 'war'>('clans');
  const [showCreate, setShowCreate] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanDesc, setClanDesc] = useState('');

  useEffect(() => {
    clanService.getClans().then(setClans);
  }, []);

  const handleCreate = async () => {
    if (!clanName.trim()) return;
    const clanId = await clanService.createClan(clanName, clanDesc, '🛡️');
    if (clanId) {
        setShowCreate(false);
        // We'd ideally wait for sync or fetch again
    }
  };

  const handleJoin = async (clan: any) => {
    await clanService.joinClan(clan.id, clan.name);
  };

  if (activeClan) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans"
      >
        <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-2xl" onClick={() => setViewMode('menu')} />
        
        <div className="relative w-full max-w-6xl h-full bg-[#050510] border border-white/10 rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
          {/* Clan Dashboard Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[40px] flex items-center justify-center text-4xl shadow-2xl border-4 border-white/20">
                {activeClan.emblem}
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                   <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{activeClan.name}</h1>
                   <div className="bg-amber-500 text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-widest">
                      Rank #124
                   </div>
                 </div>
                 <p className="text-sm text-white/40 font-medium max-w-md">{activeClan.description}</p>
                 <div className="flex items-center gap-6 mt-4">
                    <Stat label="Members" value={`${activeClan.memberCount}/50`} />
                    <Stat label="Total Points" value={activeClan.points.toLocaleString()} />
                    <Stat label="Type" value={activeClan.type} />
                 </div>
              </div>
           </div>
           <div className="flex gap-4">
              <button className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all">Leave Clan</button>
              <button 
                onClick={() => setViewMode('menu')}
                className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all font-black"
              >
                <X size={32} />
              </button>
           </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 flex overflow-hidden">
           <div className="w-72 border-r border-white/5 p-8 flex flex-col gap-3">
              <DashButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} label="Member List" icon={<User size={20} />} />
              <DashButton active={activeTab === 'war'} onClick={() => setActiveTab('war')} label="Clan Wars" icon={<Swords size={20} />} />
              <DashButton active={activeTab === 'clans'} onClick={() => setActiveTab('clans')} label="Other Clans" icon={<Search size={20} />} />
              
              <div className="mt-auto p-6 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                 <Star className="mb-4" />
                 <h4 className="font-black text-sm uppercase italic">Daily Goal</h4>
                 <p className="text-[10px] opacity-60 leading-relaxed font-bold mt-1">Win 10 War Battles collectively to unlock a Clan Chest.</p>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-12 bg-white/[0.02]">
              {activeTab === 'members' && (
                <div className="max-w-4xl space-y-4">
                   <div className="grid grid-cols-4 px-6 opacity-30 text-[9px] font-black uppercase tracking-widest mb-2">
                     <span>Player</span>
                     <span>Role</span>
                     <span className="text-right">Level</span>
                     <span className="text-right">Donations</span>
                   </div>
                   {[1, 2, 3].map(i => (
                     <div key={i} className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="grid grid-cols-4 items-center flex-1">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                                {i === 1 ? <Crown size={18} className="text-amber-500" /> : <User size={18} />}
                              </div>
                              <span className="font-black text-white italic uppercase">{i === 1 ? playerName : `Brother_${i}`}</span>
                           </div>
                           <span className="text-[10px] font-black uppercase text-white/40">{i === 1 ? 'LEADER' : 'MEMBER'}</span>
                           <span className="text-right text-xs font-black text-white">Lv 12</span>
                           <span className="text-right text-xs font-black text-emerald-400">+520</span>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'war' && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                   <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 border-4 border-red-500/40">
                      <Swords size={64} />
                   </div>
                   <div>
                     <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">War Season 4</h2>
                     <p className="text-sm text-white/40 font-medium">Clans are currently in preparation phase. Matchmaking starts in 12:45:00.</p>
                   </div>
                   <button className="w-full bg-red-500 text-white py-4 rounded-3xl font-black uppercase italic tracking-widest text-xs shadow-xl shadow-red-500/20">Sign Clan for War</button>
                </div>
              )}

              {activeTab === 'clans' && (
                <ClanBrowser clans={clans} onJoin={handleJoin} />
              )}
           </div>
        </div>
      </div>
    </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans"
    >
      <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-2xl" onClick={() => setViewMode('menu')} />
      
      <div className="relative w-full max-w-6xl h-full bg-[#050510] border border-white/10 rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <Shield className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Clan Discovery</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Join a community of warriors</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowCreate(true)}
             className="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase italic text-xs tracking-widest active:scale-95 transition-all"
           >
              Create Clan
           </button>
           <button 
            onClick={() => setViewMode('menu')}
            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="text-white" size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12">
         <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex gap-4">
               <div className="flex-1 relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                 <input 
                   placeholder="Search Clans by Name..."
                   className="w-full bg-white/5 border border-white/10 rounded-[40px] pl-16 pr-8 py-5 text-white font-medium outline-none focus:border-amber-500/50 transition-all text-lg"
                 />
               </div>
               <button className="bg-white/5 text-white px-10 rounded-[40px] font-black uppercase italic tracking-widest text-xs border border-white/10">Filter</button>
            </div>

            <ClanBrowser clans={clans} onJoin={handleJoin} />
         </div>
      </div>
    </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4"
          >
            <div className="max-w-md w-full bg-[#0a0a1a] border border-white/10 rounded-[48px] p-10 space-y-8 shadow-[0_0_100px_rgba(245,158,11,0.1)]">
               <div className="text-center">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Foundation</h3>
                  <p className="text-xs text-white/40 uppercase font-black tracking-widest mt-1">Found a new legacy</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-4">Clan Name</label>
                     <input 
                        value={clanName}
                        onChange={(e) => setClanName(e.target.value)}
                        placeholder="Clan Phoenix..."
                        className="w-full bg-white/5 border border-white/10 rounded-[28px] px-6 py-4 text-white font-medium outline-none focus:border-amber-500/50 transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-4">Motto</label>
                     <textarea 
                        value={clanDesc}
                        onChange={(e) => setClanDesc(e.target.value)}
                        placeholder="Our fire never dies..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-[28px] px-6 py-4 text-white font-medium outline-none focus:border-amber-500/50 transition-all resize-none shadow-inner"
                     />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowCreate(false)} className="flex-1 py-4 bg-white/5 text-white/40 font-black rounded-3xl uppercase text-xs tracking-widest">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 py-4 bg-amber-500 text-black font-black rounded-3xl uppercase italic text-xs tracking-widest shadow-xl shadow-amber-500/20">Establish</button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DashButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-5 rounded-[28px] flex items-center justify-between border transition-all ${active ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white'}`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-xs font-black uppercase italic tracking-tighter">{label}</span>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="flex flex-col">
       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">{label}</span>
       <span className="text-lg font-black text-white italic tracking-tighter leading-none">{value}</span>
    </div>
  );
}

function ClanBrowser({ clans, onJoin }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clans.length === 0 && (
        <div className="col-span-full py-20 opacity-20 text-white italic text-center uppercase font-black text-sm">
           No clans found. Start one today!
        </div>
      )}
      {clans.map(clan => (
        <div key={clan.id} className="p-8 rounded-[40px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-6 group">
           <div className="flex items-start justify-between">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-3xl border border-white/10 group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-500">
                {clan.emblem}
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-amber-500 italic tracking-tighter leading-none">ELITE SECTOR</span>
                 <span className="text-[8px] font-black uppercase text-white/40 tracking-widest mt-1">LV 45</span>
              </div>
           </div>
           <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{clan.name}</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{clan.memberCount}/50 Members</p>
           </div>
           <button 
             onClick={() => onJoin(clan)}
             className="w-full py-4 bg-white/5 group-hover:bg-white group-hover:text-black border border-white/10 text-white font-black uppercase italic tracking-widest text-[10px] rounded-2xl transition-all"
           >
              Join Clan
           </button>
        </div>
      ))}
    </div>
  );
}
