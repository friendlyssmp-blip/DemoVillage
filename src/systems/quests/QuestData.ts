import { QuestType } from '../../core/types';

export interface QuestTemplate {
  type: QuestType;
  title: string;
  description: string;
  targets: string[];
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    type: 'collect',
    title: 'Natural Resources',
    description: 'Collect {target} for the community.',
    targets: ['wood', 'stone', 'food']
  },
  {
    type: 'build',
    title: 'New Structures',
    description: 'Construct {amount} {target} to expand our reach.',
    targets: ['lumberjack', 'quarry', 'farm', 'barracks', 'storage', 'market']
  },
  {
    type: 'upgrade',
    title: 'Necessary Upgrades',
    description: 'Upgrade your buildings to increase efficiency.',
    targets: ['any']
  },
  {
    type: 'attack',
    title: 'Outpost Defense',
    description: 'Defeat {amount} enemy units or structures.',
    targets: ['enemy']
  },
  {
    type: 'explore',
    title: 'New Horizons',
    description: 'Unlock a new zone on the map.',
    targets: ['zone']
  },
  {
    type: 'collect',
    title: 'Natural Harvest',
    description: 'Mine or chop {target} from the wild.',
    targets: ['tree', 'rock', 'bush']
  },
  {
    type: 'use_boost',
    title: 'Lab Testing',
    description: 'Activate a {target} boost to improve efficiency.',
    targets: ['speed', 'damage', 'build']
  }
];

export const ITEM_POOL = [
  'wood_pack', 
  'stone_pack', 
  'food_pack', 
  'rare_gem',
  'boost_speed_1',
  'boost_speed_2',
  'boost_damage_1',
  'boost_damage_2',
  'boost_build_1',
  'boost_build_2'
];
