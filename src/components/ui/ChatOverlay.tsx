/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Globe, Users, 
  ChevronRight, ChevronLeft, User, ShieldAlert 
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { chatService } from '../../services/socialService';

export function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'clan' | 'private'>('global');
  const [message, setMessage] = useState('');
  const { globalChat, clanChat, playerName, user } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [globalChat, clanChat, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user.uid) return;

    if (activeTab === 'global') {
      await chatService.sendGlobalMessage(message.trim(), playerName);
    }
    // Clan chat implementation would go here
    
    setMessage('');
  };

  const messages = activeTab === 'global' ? globalChat : clanChat;

  return (
    <div className="fixed bottom-4 left-4 z-40 pointer-events-none flex flex-col items-start gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="w-80 h-[400px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
          >
            {/* Header / Tabs */}
            <div className="flex bg-white/5 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('global')}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'global' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/40 hover:text-white'}`}
              >
                Global
              </button>
              <button 
                onClick={() => setActiveTab('clan')}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'clan' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/40 hover:text-white'}`}
              >
                Clan
              </button>
            </div>

            {/* Message List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-white italic">
                   <MessageSquare size={32} className="mb-2" />
                   <p className="text-[10px] font-bold uppercase">No messages yet</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className="flex flex-col gap-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black italic ${msg.senderId === user.uid ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {msg.senderName}
                    </span>
                    <span className="text-[7px] text-white/20 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {msg.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all font-medium"
              />
              <button 
                type="submit"
                className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl pointer-events-auto ${isOpen ? 'bg-white text-black' : 'bg-black/60 text-white border border-white/10'}`}
      >
        {isOpen ? <ChevronLeft size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
