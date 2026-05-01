import { useGameStore } from '../../store/useGameStore';
import { ResourceType } from '../../core/types';

export const RewardSystem = {
  giveReward: (reward: { gold: number; items: string[] }) => {
    const store = useGameStore.getState();
    
    // Give gold
    if (reward.gold > 0) {
      store.addResource('gold', reward.gold);
    }
    
    // Give items (mapping items to resources or inventory)
    reward.items.forEach(item => {
      if (item === 'wood_pack') store.addResource('wood', 100);
      else if (item === 'stone_pack') store.addResource('stone', 100);
      else if (item === 'food_pack') store.addResource('food', 100);
      else if (item.startsWith('boost_')) {
        const [_, type, level] = item.split('_');
        const lvl = parseInt(level);
        const boost = {
          id: `boost-${type}-${lvl}-${Date.now()}-${Math.random()}`,
          type: type as any,
          level: lvl,
          multiplier: 1 + (lvl * 0.5),
          duration: 300 + (lvl * 300), // 5 min per level
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Boost Lv.${lvl}`
        };
        useGameStore.setState(s => ({
          boostInventory: [...s.boostInventory, boost]
        }));
      }
    });
  }
};
