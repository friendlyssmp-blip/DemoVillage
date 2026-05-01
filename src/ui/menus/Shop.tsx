import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Coins, Zap, Paintbrush, 
  Package, ChevronRight, ShoppingBag, Clock, ShieldCheck
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ResourceType, ShopItem } from '../../core/types';

import { audioService } from '../../services/audioService';

export function Shop() {
  const { setViewMode, resources, shopItems, lastShopTick, buyShopItem } = useGameStore();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const nextReset = (lastShopTick || 0) + (6 * 3600 * 1000);
      const diff = nextReset - now;
      
      if (diff <= 0) {
        setTimeLeft('REFRESHING...');
        return;
      }

      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastShopTick]);

  const handleBuy = (item: ShopItem) => {
    buyShopItem(item);
    audioService.play('collect');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans"
    >
      <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-3xl" onClick={() => setViewMode('menu')} />
      
      <div className="relative w-full max-w-5xl h-full bg-[#050510] border border-white/10 rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <ShoppingBag className="text-amber-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Daily Store</h1>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="text-white/30" size={12} />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Refresh In: <span className="text-amber-400/80">{timeLeft}</span></p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Village Vault</span>
              <div className="flex items-center gap-2">
                <Coins className="text-amber-500" size={16} />
                <span className="text-2xl font-black text-white italic">{Math.floor(resources.gold).toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={() => setViewMode('menu')}
              className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
            >
              <X className="text-white group-hover:scale-110 transition-transform" size={24} />
            </button>
          </div>
        </div>

        {/* Shop Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-transparent to-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="text-blue-400" size={20} />
                 <h2 className="text-xs font-black text-white/60 uppercase tracking-[0.3em]">Verified Daily Offers</h2>
               </div>
               <div className="h-[1px] flex-1 bg-white/10 mx-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shopItems.map((item) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="relative group p-6 rounded-[32px] bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                    <ShoppingBag size={120} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-4xl">{item.icon}</div>
                      <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[9px] font-black text-white/60 uppercase tracking-widest">
                        {item.type}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white uppercase italic leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-white/40 font-medium line-clamp-2 mb-8">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10">
                    <button 
                      onClick={() => handleBuy(item)}
                      className="w-full h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic tracking-widest active:scale-95 transition-all hover:bg-amber-400"
                    >
                      <span>Buy for {item.cost.amount} {item.cost.type}</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {shopItems.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <p className="text-white/20 font-black uppercase tracking-widest">Generating items...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Select an item to view details • All purchases are final</p>
        </div>
      </div>
    </motion.div>
  );
}
