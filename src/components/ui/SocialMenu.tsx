/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Search, User, 
  X, Check, Trash2, Globe, MessageCircle, 
  Eye, Trophy, Copy, CheckCircle
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { socialService } from '../../services/socialService';

export function SocialMenu() {
  const { setViewMode, friends, friendRequests, user, playerName } = useGameStore();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);

  const friendCode = user.uid ? user.uid.slice(0, 8).toUpperCase() : '----';

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await socialService.searchUsers(searchQuery);
    setSearchResults(results.filter(r => r.uid !== user.uid));
    setSearching(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans"
    >
      <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-2xl" onClick={() => setViewMode('menu')} />
      
      <div className="relative w-full max-w-5xl h-full bg-[#050510] border border-white/10 rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <Users className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Social Club</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Connect with other Chiefs</p>
          </div>
        </div>
        <button 
          onClick={() => setViewMode('menu')}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
        >
          <X className="text-white" size={24} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 border-r border-white/5 p-6 space-y-2">
          <TabButton 
            active={activeTab === 'friends'} 
            onClick={() => setActiveTab('friends')}
            label="Friend List" 
            icon={<Users size={18} />} 
            count={friends.length}
          />
          <TabButton 
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')}
            label="Inbound Requests" 
            icon={<UserPlus size={18} />} 
            count={friendRequests.length}
          />
          <TabButton 
            active={activeTab === 'search'} 
            onClick={() => setActiveTab('search')}
            label="Find Players" 
            icon={<Search size={18} />} 
          />

          <div className="mt-12 p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4">
             <div className="space-y-1">
               <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em]">Your Friend Code</span>
               <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/10">
                  <span className="text-xs font-black text-white italic tracking-widest">{friendCode}</span>
                  <button onClick={copyCode} className="text-white/40 hover:text-white transition-all">
                    {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
               </div>
             </div>
             <p className="text-[9px] text-white/30 font-medium leading-relaxed italic">Share this code with friends so they can easily find your village.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'friends' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 text-white italic">
                    <Users size={64} className="mb-4" />
                    <p className="text-lg font-black uppercase">No friends yet</p>
                    <p className="text-sm">Start searching for allies!</p>
                  </div>
                )}
                {friends.map((friend, idx) => (
                  <FriendCard key={friend.uid || `friend-${idx}`} friend={friend} />
                ))}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                {friendRequests.length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center opacity-20 text-white italic">
                      <UserPlus size={64} className="mb-4" />
                      <p className="text-lg font-black uppercase">Inbox clear</p>
                   </div>
                )}
                {friendRequests.map((req, idx) => (
                  <RequestCard key={req.id || `req-${idx}`} request={req} />
                ))}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-8">
                <div className="flex gap-4">
                   <div className="flex-1 relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                     <input 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                       placeholder="Enter username or friend code..."
                       className="w-full bg-white/5 border border-white/10 rounded-[28px] pl-12 pr-6 py-4 text-white font-medium outline-none focus:border-indigo-500/50 transition-all"
                     />
                   </div>
                   <button 
                     onClick={handleSearch}
                     className="bg-white text-black px-8 rounded-[28px] font-black uppercase italic tracking-widest text-xs hover:bg-indigo-400 transition-all active:scale-95"
                   >
                     {searching ? 'SEARCHING...' : 'SEARCH'}
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result, idx) => (
                    <div key={result.uid || `search-${idx}`} className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white text-xl">
                          {result.username?.[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white italic uppercase">{result.username}</h3>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{result.villageName || 'New Settler'}</p>
                        </div>
                      </div>
                      <button 
                         onClick={() => socialService.sendFriendRequest(result.uid, result.username, playerName)}
                         className="p-3 bg-indigo-500 rounded-xl text-white hover:bg-indigo-400 transition-all active:scale-90"
                      >
                         <UserPlus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
  );
}

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group ${active ? 'bg-indigo-500 text-white' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-xs font-black uppercase italic tracking-tighter">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-white text-indigo-500' : 'bg-white/10 text-white'}`}>
           {count}
        </span>
      )}
    </button>
  );
}

function FriendCard({ friend }: any) {
  return (
    <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg border border-white/20">
              {friend.username?.[0].toUpperCase() || 'U'}
           </div>
           <div>
             <h3 className="text-lg font-black text-white italic truncate uppercase">{friend.username}</h3>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Online Now</span>
             </div>
           </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-black text-white/30 uppercase leading-none mb-1">Ranked</span>
           <span className="text-sm font-black text-amber-500 italic tracking-tighter">ELITE IV</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
         <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
            <Eye size={14} />
            Visit
         </button>
         <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white text-black py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
            <MessageCircle size={14} />
            Chat
         </button>
      </div>
    </div>
  );
}

function RequestCard({ request }: any) {
  const respond = (status: 'accepted' | 'declined') => {
    socialService.respondToFriendRequest(request.id, status, request);
  };

  return (
    <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
          <User className="text-white/40" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white italic uppercase">{request.fromName}</h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Wants to be friends</p>
        </div>
      </div>
      <div className="flex gap-2">
         <button 
           onClick={() => respond('declined')}
           className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
         >
           <X size={18} />
         </button>
         <button 
           onClick={() => respond('accepted')}
           className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg"
         >
           <Check size={18} />
         </button>
      </div>
    </div>
  );
}
