import { BuildingType, TroopStats, MapZone, MapObject, Technology, Quest } from './types';

export const generateMapObjects = (count: number = 20): MapObject[] => {
  const objects: MapObject[] = [];
  const types: ('tree' | 'rock' | 'bush')[] = ['tree', 'rock', 'bush'];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const scale = 0.8 + Math.random() * 1.5; // Random scale between 0.8 and 2.3
    
    const health = Math.floor(scale * 100) + 50;
    
    objects.push({
      id: `map-obj-${i}-${Date.now()}`,
      type,
      position: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200],
      scale,
      resourceYield: { 
        type: type === 'tree' ? 'wood' : (type === 'rock' ? 'stone' : 'food'),
        amount: Math.floor(scale * 30) + 10
      },
      health,
      maxHealth: health,
      reward: Math.floor(scale * 50) + 50,
      removalCost: Math.floor(scale * 15) // Balanced cost
    });
  }
  return objects;
};

export const INITIAL_MAP_OBJECTS = generateMapObjects(150);

export const BUILDING_TYPES: Record<string, BuildingType> = {
  townhall: {
    id: 'townhall',
    name: 'Primal Hub',
    description: 'The heart of your village. Unlocks new buildings.',
    cost: { gold: 0 },
    production: { gold: 0.1 },
    capacityBonus: { wood: 500, stone: 500, food: 500, gold: 1000 },
    model: 'townhall',
    npcCount: 0,
    requiredEra: 'primal',
    size: 3,
  },
  lumberjack: {
    id: 'lumberjack',
    name: 'Lumber Camp',
    description: 'Houses lumberjacks who gather wood from trees.',
    cost: { wood: 50, food: 20 },
    production: { wood: 2.0 },
    capacityBonus: { wood: 200 },
    model: 'lumberjack',
    npcCount: 2,
    requiredEra: 'primal',
    size: 2,
  },
  quarry: {
    id: 'quarry',
    name: 'Stone Mine',
    description: 'Miners extract stone from mineral nodes.',
    cost: { wood: 40, stone: 20, food: 30 },
    production: { stone: 1.2 },
    capacityBonus: { stone: 200 },
    model: 'quarry',
    npcCount: 2,
    requiredEra: 'primal',
    size: 2,
  },
  farm: {
    id: 'farm',
    name: 'Primal Farm',
    description: 'Produces food to sustain your growing tribe.',
    cost: { wood: 30, stone: 10 },
    production: { food: 5.0 },
    capacityBonus: { food: 500 },
    model: 'farm',
    npcCount: 1,
    requiredEra: 'primal',
    size: 2,
  },
  market: {
    id: 'market',
    name: 'Tribal Market',
    description: 'Trade center that generates gold and facilitates exchange.',
    cost: { wood: 100, stone: 50 },
    production: { gold: 1.5 },
    model: 'market',
    npcCount: 1,
    requiredEra: 'stone',
    size: 2,
    capacityBonus: { gold: 500 }
  },
  storage: {
    id: 'storage',
    name: 'Resource Hut',
    description: 'Massively increases total resource capacity.',
    cost: { wood: 80, stone: 40 },
    production: {},
    capacityBonus: { wood: 1000, stone: 1000, food: 1000, gold: 1000 },
    model: 'storage',
    npcCount: 0,
    requiredEra: 'primal',
    size: 2,
  },
  barracks: {
    id: 'barracks',
    name: 'War Hut',
    description: 'Train simple warriors to protect your tribe.',
    cost: { wood: 120, stone: 60, gold: 100 },
    production: {},
    model: 'barracks',
    npcCount: 0,
    requiredEra: 'stone',
    size: 2,
    capacityBonus: {}
  },
  lab: {
    id: 'lab',
    name: 'Shaman Lab',
    description: 'Research new technologies and eras.',
    cost: { wood: 200, stone: 150, gold: 300 },
    production: {},
    model: 'lab',
    npcCount: 0,
    requiredEra: 'stone',
    size: 2,
    capacityBonus: {}
  },
  goblin_hut: {
    id: 'goblin_hut',
    name: 'Goblin Hut',
    description: 'Friendly goblins who trade rare items.',
    cost: { wood: 300, stone: 200, gold: 500 },
    production: { gold: 3.0 },
    model: 'goblin_hut',
    npcCount: 1,
    requiredEra: 'bronze',
    size: 2,
    capacityBonus: {}
  },
  factory: {
    id: 'factory',
    name: 'Bronze Forge',
    description: 'Automated production for advanced resources.',
    cost: { wood: 500, stone: 400, gold: 1000 },
    production: { gold: 10.0 },
    model: 'factory',
    npcCount: 3,
    requiredEra: 'bronze',
    size: 3,
    capacityBonus: { gold: 2000 }
  },
  tower: {
    id: 'tower',
    name: 'Watchtower',
    description: 'Defensive tower that shoots arrows at enemies.',
    cost: { wood: 80, stone: 80, gold: 50 },
    production: {},
    model: 'tower',
    npcCount: 1,
    requiredEra: 'stone',
    size: 1,
    capacityBonus: {}
  },
  mortar: {
    id: 'mortar',
    name: 'Stone Mortar',
    description: 'Heavy defense that deals area damage.',
    cost: { wood: 150, stone: 250, gold: 200 },
    production: {},
    model: 'mortar',
    npcCount: 0,
    requiredEra: 'bronze',
    size: 2,
    capacityBonus: {}
  },
  trap: {
     id: 'trap',
     name: 'Spike Trap',
     description: 'Hidden trap that deals massive damage to single targets.',
     cost: { wood: 20, stone: 10 },
     production: {},
     model: 'trap',
     npcCount: 0,
     requiredEra: 'primal',
     size: 1,
     capacityBonus: {}
  },
  wall: {
     id: 'wall',
     name: 'Wooden Wall',
     description: 'Cheap hurdle to block enemy movement.',
     cost: { wood: 10 },
     production: {},
     model: 'wall',
     npcCount: 0,
     requiredEra: 'primal',
     size: 1,
     capacityBonus: {}
  },
  torch: {
     id: 'torch',
     name: 'Ancient Torch',
     description: 'A simple torch to light up the village at night. Cheap and decorative.',
     cost: { wood: 5 },
     production: {},
     model: 'torch',
     npcCount: 0,
     requiredEra: 'primal',
     size: 1,
     capacityBonus: {}
  }
};

export const TROOP_STATS: Record<string, TroopStats> = {
  warrior: {
    id: 'warrior',
    name: 'Tribal Warrior',
    health: 200,
    damage: 25,
    speed: 0.08,
    range: 1.5,
    trainingTime: 10,
    cost: { food: 50 },
    capacity: 1,
    description: 'Fast and reliable melee attacker.',
    icon: '⚔️',
    priority: 'any'
  },
  archer: {
    id: 'archer',
    name: 'Tribe Archer',
    health: 120,
    damage: 18,
    speed: 0.1,
    range: 6.0,
    trainingTime: 15,
    cost: { food: 40, wood: 20 },
    capacity: 1,
    description: 'Fragile but keeps distance from targets.',
    icon: '🏹',
    priority: 'defense'
  },
  tank: {
    id: 'tank',
    name: 'Shield Bearer',
    health: 600,
    damage: 12,
    speed: 0.05,
    range: 1.2,
    trainingTime: 30,
    cost: { food: 100, stone: 50 },
    capacity: 5,
    description: 'Absorbs massive damage for the team.',
    icon: '🛡️',
    priority: 'defense'
  },
  scout: {
    id: 'scout',
    name: 'Swift Scout',
    health: 80,
    damage: 40,
    speed: 0.15,
    range: 1.2,
    trainingTime: 20,
    cost: { food: 60, gold: 20 },
    capacity: 1,
    description: 'Extremely fast. Targets resource buildings.',
    icon: '🏃',
    priority: 'resource'
  }
};

export const MAP_ZONES: MapZone[] = [
  { id: 'core', name: 'Valley Hub', bounds: { x: [-20, 20], z: [-20, 20] }, cost: { gold: 0 }, unlocked: true },
  { id: 'north', name: 'Pine Tundra', bounds: { x: [-20, 20], z: [20, 60] }, cost: { gold: 1000 }, unlocked: false },
  { id: 'south', name: 'Sandy Beach', bounds: { x: [-20, 20], z: [-60, -20] }, cost: { gold: 1500 }, unlocked: false },
  { id: 'east', name: 'Mineral Peak', bounds: { x: [20, 60], z: [-20, 20] }, cost: { gold: 2000 }, unlocked: false },
  { id: 'west', name: 'Dense Jungle', bounds: { x: [-60, -20], z: [-20, 20] }, cost: { gold: 2500 }, unlocked: false }
];

export const INITIAL_TECHS: Technology[] = [
  {
    id: 'faster_gathering',
    name: 'Reinforced Tools',
    description: 'Increases NPC gathering efficiency by 20%.',
    cost: { wood: 100, stone: 50 },
    researchTime: 30,
    requiredEra: 'primal',
    unlocked: false,
    isResearching: false,
    progress: 0,
    effect: { type: 'efficiency', value: 0.2 }
  },
  {
    id: 'expanded_silos',
    name: 'Preservation Methods',
    description: 'Increases food storage capacity by 50%.',
    cost: { wood: 200, food: 100 },
    researchTime: 45,
    requiredEra: 'primal',
    unlocked: false,
    isResearching: false,
    progress: 0,
    effect: { type: 'storage', value: 0.5 }
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'start_village',
    title: 'First Steps',
    description: 'Build a Lumber Camp to start your journey.',
    type: 'build',
    target: 'lumberjack',
    requiredAmount: 1,
    progress: 0,
    reward: { gold: 100, items: [] },
    completed: false,
    claimed: false
  },
  {
    id: 'gathering_basics',
    title: 'Resource Gathering',
    description: 'Gather 50 wood for your community.',
    type: 'collect',
    target: 'wood',
    requiredAmount: 50,
    progress: 0,
    reward: { gold: 200, items: ['stone_pack'] },
    completed: false,
    claimed: false
  }
];
