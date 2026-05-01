import { DailyMission, LiveEvent, GameState, ResourceType } from '../core/types';
import { useGameStore } from '../store/useGameStore';

const MISSION_TEMPLATES: Omit<DailyMission, 'id' | 'progress' | 'completed' | 'claimed'>[] = [
  { title: 'Wood Collector', description: 'Collect 1000 Wood from your village.', type: 'collect', target: 'wood', requirement: 1000, xpReward: 250, goldReward: 50 },
  { title: 'Stone Miner', description: 'Collect 1000 Stone from your village.', type: 'collect', target: 'stone', requirement: 1000, xpReward: 250, goldReward: 50 },
  { title: 'Grand Harvest', description: 'Collect 1000 Food from your village.', type: 'collect', target: 'food', requirement: 1000, xpReward: 250, goldReward: 50 },
  { title: 'Empire Builder', description: 'Construct or upgrade 3 buildings.', type: 'build', target: 'any', requirement: 3, xpReward: 400, goldReward: 100 },
  { title: 'Era Researcher', description: 'Complete 1 technology research.', type: 'research', target: 'any', requirement: 1, xpReward: 500, goldReward: 150 },
  { title: 'Combat Ready', description: 'Win 3 battles against rivals.', type: 'win', target: 'any', requirement: 3, xpReward: 600, goldReward: 200 },
  { title: 'Elite Expansion', description: 'Unlock a new territory zone.', type: 'build', target: 'zone', requirement: 1, xpReward: 700, goldReward: 300 },
  { title: 'Wealth Accumulator', description: 'Earn 500 Gold from any source.', type: 'collect', target: 'gold', requirement: 500, xpReward: 300, goldReward: 100 },
  { title: 'Master Architect', description: 'Upgrade Town Hall to next level.', type: 'upgrade', target: 'townhall', requirement: 1, xpReward: 1000, goldReward: 500 },
];

const EVENT_TEMPLATES: Omit<LiveEvent, 'id' | 'startTime' | 'endTime' | 'status'>[] = [
  { type: 'production_boost', name: 'Golden Harvest', description: 'Village production is doubled for 48 hours!', multiplier: 2.0 },
  { type: 'upgrade_speed', name: 'Rapid Construction', description: 'Construction and upgrade times reduced by 50%!', multiplier: 0.5 },
  { type: 'goblin_raid', name: 'Goblin Incursion', description: 'Goblins are raiding! Defeat them for Triple Loot!', multiplier: 3.0 },
  { type: 'harvest_fest', name: 'Autumn Festival', description: 'Abundant food! Everyone works 25% more efficiently.', multiplier: 1.25 },
  { type: 'gold_rush', name: 'The Gold Rush', description: 'Rare gems and gold deposits are appearing everywhere!', multiplier: 1.5 },
];

export const progressionService = {
  generateDailyMissions(): DailyMission[] {
    const selected = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 8);
    return selected.map((m, i) => ({
      ...m,
      id: `dm_${Date.now()}_${i}`,
      progress: 0,
      completed: false,
      claimed: false,
    }));
  },

  generateLiveEvent(): LiveEvent {
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const now = Date.now();
    const duration = (1 + Math.random() * 2) * 24 * 60 * 60 * 1000; // 1-3 days
    return {
      ...template,
      id: `ev_${now}`,
      startTime: now,
      endTime: now + duration,
      status: 'active',
    };
  },

  calculateSeasonPassLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  },

  getXPForNextLevel(currentXP: number): number {
    const nextLevel = this.calculateSeasonPassLevel(currentXP);
    const targetXP = nextLevel * 1000;
    return targetXP - currentXP;
  },

  claimMission(missionId: string) {
    const state = useGameStore.getState();
    const missions = state.dailyMissions.map(m => {
      if (m.id === missionId && m.completed && !m.claimed) {
        // Grant rewards via store
        useGameStore.getState().addResource('gold', m.goldReward);
        useGameStore.getState().addSeasonXP(m.xpReward);
        
        return { ...m, claimed: true };
      }
      return m;
    });

    useGameStore.setState({ dailyMissions: missions });
  },

  claimPassReward(tierIndex: number, type: 'free' | 'premium') {
    const state = useGameStore.getState();
    const { seasonPass } = state;
    if (!seasonPass) return;

    const list = type === 'free' ? seasonPass.claimedFree : seasonPass.claimedPremium;
    if (list.includes(tierIndex)) return;

    // Logic for granting rewards based on tierIndex
    // For now, simple gold/xp rewards. In real app, would map tierIndex to actual items.
    const goldReward = 500 * (tierIndex + 1);
    const xpReward = 100 * (tierIndex + 1);

    useGameStore.getState().addResource('gold', goldReward);
    useGameStore.getState().addSeasonXP(xpReward);

    const updatedPass = { ...seasonPass };
    if (type === 'free') updatedPass.claimedFree = [...list, tierIndex];
    else updatedPass.claimedPremium = [...list, tierIndex];

    useGameStore.setState({ seasonPass: updatedPass });
  },

  getSeasonRemainingTime(endTime: number): string {
    const diff = endTime - Date.now();
    if (diff <= 0) return "Season Ended";
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  },

  getEventRemainingTime(endTime: number): string {
    const diff = endTime - Date.now();
    if (diff <= 0) return "Event Expired";
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  },

  softResetRank(points: number): number {
    // Soft reset: reset to 70% of previous points above 1000 (Silver floor)
    const basePoints = 1000;
    if (points <= basePoints) return points;
    return basePoints + Math.floor((points - basePoints) * 0.7);
  }
};
