import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { progressionService } from '../../services/progressionService';
import { audioService } from '../../services/audioService';
import { 
  Trophy, 
  Target, 
  Flashlight, 
  Flame, 
  Gem, 
  Crown,
  ChevronRight,
  Lock,
  CheckCircle2,
  Clock,
  Zap,
  Star
} from 'lucide-react';
import { DailyMission, LiveEvent, SeasonPassReward } from '../../types';

const PASS_REWARDS: SeasonPassReward[] = [
  { level: 1, name: 'Starter Resources', type: 'resource', value: { wood: 500, stone: 300 }, isPremium: false },
  { level: 1, name: 'Golden Favor', type: 'gold', value: 100, isPremium: true },
  { level: 2, name: 'Minor Boost', type: 'boost', value: 1.1, isPremium: false },
  { level: 2, name: 'Merchant Bag', type: 'gold', value: 250, isPremium: true },
  { level: 3, name: 'Builder Pack', type: 'resource', value: { wood: 1000, stone: 1000 }, isPremium: false },
  { level: 3, name: 'Elite Banner', type: 'skin', value: 'banner_royal', isPremium: true },
  { level: 4, name: 'Gold Reserve', type: 'gold', value: 200, isPremium: false },
  { level: 4, name: 'Double XP Boost', type: 'boost', value: 2.0, isPremium: true },
  { level: 5, name: 'Kingdom Chest', type: 'resource', value: { wood: 5000, stone: 5000, food: 5000 }, isPremium: false },
  { level: 5, name: 'Ancient Trophy', type: 'skin', value: 'statue_hero', isPremium: true },
];

export const SeasonPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'pass' | 'missions' | 'events'>('pass');
  const season = useGameStore(state => state.season);
  const seasonPass = useGameStore(state => state.seasonPass);
  const dailyMissions = useGameStore(state => state.dailyMissions);
  const liveEvents = useGameStore(state => state.activeLiveEvents);
  const resources = useGameStore(state => state.resources);
  const rankedPoints = useGameStore(state => state.rankedPoints);

  const xpProgress = (seasonPass.xp % 1000) / 10; // 0 to 100%
  const xpRemaining = progressionService.getXPForNextLevel(seasonPass.xp);

  const handleClaimMission = (id: string) => {
    audioService.play('victory');
    progressionService.claimMission(id);
  };

  const isRewardClaimed = (level: number, premium: boolean) => {
    return premium 
      ? seasonPass.claimedPremium.includes(level) 
      : seasonPass.claimedFree.includes(level);
  };

  const handleClaimReward = (level: number, premium: boolean) => {
    if (level > seasonPass.level) return;
    if (premium && !seasonPass.isPremium) return;
    if (isRewardClaimed(level, premium)) return;

    audioService.play('collect', { randomized: true });
    
    // Logic to grant reward based on level/type
    const reward = PASS_REWARDS.find(r => r.level === level && r.isPremium === premium);
    if (!reward) return;

    const newState: any = {
      seasonPass: {
        ...seasonPass,
        claimedFree: premium ? seasonPass.claimedFree : [...seasonPass.claimedFree, level],
        claimedPremium: premium ? [...seasonPass.claimedPremium, level] : seasonPass.claimedPremium,
      }
    };

    if (reward.type === 'gold') {
      newState.resources = { ...resources, gold: resources.gold + reward.value };
    } else if (reward.type === 'resource') {
      newState.resources = {
        ...resources,
        wood: resources.wood + (reward.value.wood || 0),
        stone: resources.stone + (reward.value.stone || 0),
        food: resources.food + (reward.value.food || 0),
      };
    }

    useGameStore.setState(newState);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 md:p-8"
    >
      <div className="max-w-5xl w-full h-[90vh] bg-zinc-900/50 border border-white/10 rounded-[40px] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="p-8 border-b border-white/10 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="text-amber-400" size={24} />
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{season?.name || 'Kingdom Season'}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                  <Clock size={12} className="text-white/40" />
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">
                    Ends in {progressionService.getSeasonRemainingTime(season?.endTime || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full">
                  <Star size={12} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em]">Rank: {rankedPoints} PTS</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-3xl uppercase italic tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              Close
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-8">
            {[
              { id: 'pass', label: 'Season Pass', icon: Crown },
              { id: 'missions', label: 'Daily Missions', icon: Target },
              { id: 'events', label: 'Live Events', icon: Flame },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  audioService.play('click');
                }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-black scale-105' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'pass' && (
              <motion.div 
                key="pass"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Level Display */}
                <div className="p-8 bg-zinc-800/50 border border-white/5 rounded-[32px] flex items-center justify-between gap-8">
                  <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-[32px] bg-gradient-to-br from-amber-400 to-orange-600 shadow-2xl relative">
                    <Crown size={40} className="text-white" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black rounded-full border-4 border-zinc-800 flex items-center justify-center">
                       <span className="text-white font-black text-lg">{seasonPass.level}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xl font-black text-white uppercase italic">Kingdom Progress</span>
                      <span className="text-xs font-black text-white/40 uppercase tracking-widest">{xpRemaining} XP to Level {seasonPass.level + 1}</span>
                    </div>
                    <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                      />
                    </div>
                  </div>

                  {!seasonPass.isPremium && (
                    <button className="shrink-0 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black rounded-2xl uppercase italic tracking-widest text-xs hover:scale-105 transition-all shadow-xl">
                      Unlock Premium
                    </button>
                  )}
                </div>

                {/* Reward Track */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {PASS_REWARDS.map((reward, i) => {
                     const isUnlocked = seasonPass.level >= reward.level;
                     const isClaimed = isRewardClaimed(reward.level, reward.isPremium);
                     const canClaim = isUnlocked && !isClaimed && (reward.isPremium ? seasonPass.isPremium : true);

                     return (
                       <div 
                         key={i}
                         className={`p-6 rounded-[24px] border transition-all flex flex-col gap-4 relative group ${
                           isClaimed 
                             ? 'bg-zinc-800/20 border-white/5 opacity-50' 
                             : isUnlocked
                               ? 'bg-emerald-500/5 border-emerald-500/20'
                               : 'bg-white/5 border-white/5 opacity-40'
                         }`}
                       >
                         <div className="flex justify-between items-start">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reward.isPremium ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}>
                             {reward.type === 'resource' && <Gem size={18} />}
                             {reward.type === 'gold' && <Zap size={18} />}
                             {reward.type === 'skin' && <Crown size={18} />}
                             {reward.type === 'boost' && <Flame size={18} />}
                           </div>
                           <div className="text-right">
                             <span className="block text-[8px] font-black uppercase text-white/40 tracking-widest">Level</span>
                             <span className="text-xl font-black text-white italic">{reward.level}</span>
                           </div>
                         </div>
                         
                         <div>
                           <h4 className="text-sm font-black text-white uppercase italic">{reward.name}</h4>
                           <span className={`text-[8px] font-black uppercase tracking-widest ${reward.isPremium ? 'text-amber-400' : 'text-white/40'}`}>
                             {reward.isPremium ? 'Premium Reward' : 'Free Reward'}
                           </span>
                         </div>

                         {isClaimed ? (
                            <div className="flex items-center gap-2 text-emerald-400 mt-2">
                               <CheckCircle2 size={14} />
                               <span className="text-[10px] font-black uppercase tracking-widest">Claimed</span>
                            </div>
                         ) : (
                           <button 
                             disabled={!canClaim}
                             onClick={() => handleClaimReward(reward.level, reward.isPremium)}
                             className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                               canClaim 
                                ? 'bg-white text-black hover:scale-105' 
                                : 'bg-white/5 text-white/20'
                             }`}
                           >
                             {isUnlocked ? 'Claim Reward' : 'Locked'}
                           </button>
                         )}

                         {!isUnlocked && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity">
                              <Lock className="text-white/40" size={32} />
                           </div>
                         )}
                       </div>
                     );
                   })}
                </div>
              </motion.div>
            )}

            {activeTab === 'missions' && (
              <motion.div 
                key="missions"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyMissions.map(m => (
                    <div 
                      key={m.id}
                      className={`p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all ${
                        m.claimed ? 'opacity-40 grayscale' : m.completed ? 'bg-emerald-500/5 border-emerald-500/20' : ''
                      }`}
                    >
                      {/* Progress Bar Background */}
                      {!m.claimed && (
                        <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                           <div 
                             className="h-full bg-blue-500 transition-all" 
                             style={{ width: `${(m.progress / m.requirement) * 100}%` }}
                           />
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-lg font-black text-white uppercase italic leading-none mb-2">{m.title}</h4>
                          <p className="text-[10px] text-white/40 font-medium leading-relaxed max-w-[200px]">{m.description}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           <div className="flex gap-2">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                                 <Zap size={10} className="text-blue-400" />
                                 <span className="text-[10px] font-black text-blue-400">{m.xpReward} XP</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 border border-amber-400/30 rounded-lg">
                                 <Gem size={10} className="text-amber-400" />
                                 <span className="text-[10px] font-black text-amber-400">{m.goldReward}G</span>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-black text-white italic">{m.progress} / {m.requirement}</span>
                           {m.completed && !m.claimed && (
                             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse flex items-center gap-1">
                                <CheckCircle2 size={12} /> Ready
                             </span>
                           )}
                        </div>

                        {m.claimed ? (
                          <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/20 uppercase tracking-widest">
                             Claimed
                          </div>
                        ) : (
                          <button
                            disabled={!m.completed}
                            onClick={() => handleClaimMission(m.id)}
                            className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                              m.completed 
                                ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-xl' 
                                : 'bg-white/5 text-white/20'
                            }`}
                          >
                            Claim Rewards
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div 
                key="events"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {liveEvents.length > 0 ? (
                  liveEvents.map(event => (
                    <div 
                      key={event.id}
                      className="p-10 bg-gradient-to-r from-orange-600/20 to-amber-600/10 border border-amber-500/20 rounded-[40px] relative overflow-hidden group shadow-2xl"
                    >
                      {/* Decorative Flare */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                      
                      <div className="flex flex-col md:flex-row items-center gap-10 relative">
                        <div className="w-32 h-32 rounded-[32px] bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] shrink-0">
                           {event.type === 'production_boost' && <Flashlight size={60} strokeWidth={2.5} />}
                           {event.type === 'goblin_raid' && <Flame size={60} strokeWidth={2.5} />}
                           {event.type === 'upgrade_speed' && <Zap size={60} strokeWidth={2.5} />}
                           {event.type === 'harvest_fest' && <Target size={60} strokeWidth={2.5} />}
                           {event.type === 'gold_rush' && <Gem size={60} strokeWidth={2.5} />}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                           <div className="flex flex-col md:flex-row items-center gap-4">
                              <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{event.name}</h3>
                              <div className="px-4 py-1.5 bg-emerald-500 text-black font-black uppercase italic text-[10px] tracking-widest rounded-full shadow-lg">Active Now</div>
                           </div>
                           <p className="text-white/60 text-lg font-medium leading-relaxed max-w-xl">{event.description}</p>
                           
                           <div className="flex flex-wrap items-center gap-4 pt-4">
                             <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                                <Clock size={16} className="text-white/40" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">
                                  Remaining: {progressionService.getEventRemainingTime(event.endTime)}
                                </span>
                             </div>
                             <div className="flex items-center gap-3 px-6 py-3 bg-amber-400 text-black rounded-2xl shadow-xl">
                                <Zap size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">
                                  Multiplier: {event.multiplier}x
                                </span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4 opacity-40">
                     <Clock size={48} className="text-white/20" />
                     <span className="text-sm font-black uppercase tracking-widest">No active events. Check back soon!</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
