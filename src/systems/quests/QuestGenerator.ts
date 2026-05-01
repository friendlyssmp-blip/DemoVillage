import { nanoid } from 'nanoid';
import { Quest, QuestType } from '../../core/types';
import { QUEST_TEMPLATES, ITEM_POOL } from './QuestData';

export const QuestGenerator = {
  generateQuest: (playerLevel: number): Quest => {
    const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
    const target = template.targets[Math.floor(Math.random() * template.targets.length)];
    
    // Scale difficulty with level
    const difficultyMultiplier = 1 + (playerLevel * 0.2);
    let requirement = 1;
    
    switch (template.type) {
      case 'collect':
        requirement = Math.floor((Math.random() * 50 + 50) * difficultyMultiplier);
        break;
      case 'build':
        requirement = Math.max(1, Math.floor(Math.random() * 2 + 1));
        break;
      case 'upgrade':
        requirement = Math.max(1, Math.floor(Math.random() * 2 + 1));
        break;
      case 'attack':
        requirement = Math.floor((Math.random() * 5 + 5) * difficultyMultiplier);
        break;
      case 'explore':
        requirement = 1;
        break;
    }

    // Semi-random title/desc based on target
    const title = template.title;
    const description = template.description
      .replace('{target}', target === 'any' ? 'any building' : target)
      .replace('{amount}', requirement.toString());

    // Scale rewards
    const goldReward = Math.floor(requirement * 5 * difficultyMultiplier);
    const items: string[] = [];
    if (Math.random() > 0.7) {
      items.push(ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)]);
    }

    return {
      id: `quest-${nanoid(8)}`,
      title,
      description,
      type: template.type,
      target,
      requiredAmount: requirement,
      progress: 0,
      reward: {
        gold: goldReward,
        items
      },
      completed: false,
      claimed: false
    };
  },

  generateDailyBatch: (playerLevel: number, count: number = 3): Quest[] => {
    const batch: Quest[] = [];
    for (let i = 0; i < count; i++) {
      batch.push(QuestGenerator.generateQuest(playerLevel));
    }
    return batch;
  }
};
