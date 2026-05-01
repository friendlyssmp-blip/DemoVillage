/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ResourceType = 'wood' | 'stone' | 'food' | 'gold';
export type WeatherType = 'sunny' | 'windy' | 'rainy' | 'stormy' | 'snowy';
export type EraType = 'primal' | 'stone' | 'bronze' | 'iron' | 'medieval' | 'renaissance' | 'colonial' | 'industrial' | 'modern' | 'cyber';

export interface Resources {
  wood: number;
  stone: number;
  food: number;
  gold: number;
}

export type TroopType = 'warrior' | 'archer' | 'tank' | 'scout';

export interface TroopStats {
  id: TroopType;
  name: string;
  description: string;
  icon: string;
  health: number;
  damage: number;
  speed: number;
  range: number;
  trainingTime: number;
  cost: Partial<Resources>;
  capacity: number;
  priority: 'any' | 'defense' | 'resource';
}

export type ViewMode = 'menu' | 'playing' | 'fighting' | 'ranked' | 'settings' | 'shop' | 'clan' | 'friends';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  gold: number;
  population: number;
  level: number;
  rank: number;
  points: number;
  powerScore: number;
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  emblem: string;
  leaderId: string;
  memberCount: number;
  points: number;
  type: 'open' | 'invite' | 'closed';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'global' | 'clan' | 'private';
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

export interface BuildingType {
  id: string;
  name: string;
  description: string;
  cost: Partial<Resources>;
  production: Partial<Record<ResourceType, number>>;
  capacityBonus: Partial<Resources>;
  model: 'townhall' | 'lumberjack' | 'quarry' | 'farm' | 'storage' | 'market' | 'barracks' | 'kitchen' | 'lab' | 'factory' | 'torch' | 'goblin_hut' | 'forge' | 'training' | 'warehouse' | 'tower' | 'mortar' | 'trap' | 'wall';
  npcCount: number;
  requiredEra: EraType;
  size: number; // Footprint: 1 for 1x1, 2 for 2x2, 3 for 3x3
  baseMaintenance?: Partial<Resources>;
}

export interface BuildingInstance {
  id: string;
  typeId: string;
  level: number;
  position: [number, number];
  rotation: number;
  progress: number; // 0 to 1 for construction
  isConstructing: boolean;
  lastUpdate: number;
  health: number;
  maxHealth: number;
}

export interface NPCInstance {
  id: string;
  buildingId: string; // Home building
  type: 'worker' | 'warrior';
  role: 'lumberjack' | 'miner' | 'farmer' | 'guard' | 'scientist' | 'trader';
  state: 'idle' | 'walking' | 'working' | 'depositing' | 'fighting';
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  carrying: { type: ResourceType; amount: number } | null;
  hunger: number; // 0 to 100
  efficiency: number; // 0.5 to 2.0
  age: number;
  lifespan: number;
  health: number;
  combatPower?: number;
}

export interface MapObject {
  id: string;
  type: 'tree' | 'rock' | 'bush' | 'rare_gem';
  position: [number, number];
  resourceYield: { type: ResourceType; amount: number };
  removalCost: number;
  scale?: number;
  respawnTime?: number;
  health: number;
  maxHealth: number;
  reward: number;
}

export type BoostType = 'speed' | 'damage' | 'build';

export interface Boost {
  id: string;
  type: BoostType;
  level: number;
  multiplier: number;
  duration: number; // in seconds
  name: string;
}

export interface ActiveBoost extends Boost {
  startTime: number;
  endTime: number;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: Partial<Resources>;
  researchTime: number;
  requiredEra: EraType;
  unlocked: boolean;
  isResearching: boolean;
  progress: number;
  effect: {
    type: 'production' | 'efficiency' | 'storage' | 'expansion';
    value: number;
  };
}

export type QuestType = 'collect' | 'build' | 'attack' | 'upgrade' | 'explore' | 'use_boost';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: string;
  requiredAmount: number;
  progress: number;
  reward: {
    gold: number;
    items: string[];
  };
  completed: boolean;
  claimed: boolean;
}

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: 'boom' | 'shortage' | 'storm' | 'migration';
  duration: number;
  startTime: number;
  multiplier: number;
}

export interface Zone {
  id: string;
  name: string;
  bounds: { x: [number, number], z: [number, number] };
  unlocked: boolean;
  cost: Partial<Resources>;
}

export type MapZone = Zone;

export type SoundName = 'click' | 'primary' | 'secondary' | 'build' | 'collect' | 'error' | 'victory' | 'defeat' | 'attack' | 'close' | 'open' | 'claim' | 'level-up' | 'upgrade';

export interface OfflineSummary {
  timeAway: number; // in milliseconds
  generated: Resources;
  lost: Resources;
  foodShortage: boolean;
  active: boolean;
}

export interface UnitInstance {
  id: string;
  type: TroopType;
  position: [number, number];
  health: number;
  maxHealth: number;
  targetId: string | null;
  state: 'idle' | 'moving' | 'attacking';
  deployedAt: number;
}

export interface DeploymentAction {
  type: TroopType;
  position: [number, number];
  timestamp: number;
}

export interface BattleReplay {
  id: string;
  opponentName: string;
  opponentVillage: BuildingInstance[];
  deployments: DeploymentAction[];
  randomSeed: number;
  result: CombatStatus;
  destruction: number;
  date: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'boost' | 'equipment';
  cost: { type: ResourceType; amount: number };
  value: any;
  icon: string;
}

export interface Equipment {
  id: string;
  type: 'weapon' | 'armor' | 'accessory';
  name: string;
  bonus: {
    damage?: number;
    health?: number;
    speed?: number;
  };
}

export interface CraftingJob {
  id: string;
  equipmentId: string;
  startTime: number;
  duration: number;
}

export type CombatStatus = 'idle' | 'searching' | 'attacking' | 'victory' | 'defeat' | 'draw' | 'matchmaking_failed';

export interface UserProfile {
  uid?: string;
  username: string;
  villageName: string;
  level: number;
  joinedAt: number;
  clanId?: string;
  clanName?: string;
  fame: number;
  lastActive: number;
  friendsCount?: number;
  avatar?: string;
}

export interface GameState {
  user: {
    uid: string | null;
    email: string | null;
    isVerified: boolean;
    profile: UserProfile | null;
  };
  resources: Resources;
  maxCapacity: Resources;
  buildings: BuildingInstance[];
  npcs: NPCInstance[];
  mapObjects: MapObject[];
  technologies: Technology[];
  quests: Quest[];
  activeLiveEvents: LiveEvent[];
  unlockedZones: string[];
  era: EraType;
  weather: WeatherType;
  timeOfDay: number; // 0 to 24
  population: number;
  selectedBuildingId: string | null;
  selectedObjectId: string | null;
  isPlacementMode: boolean;
  isEditMode: boolean;
  placementTypeId: string | null;
  movingBuildingId: string | null;
  gridSize: number;
  tutorialStep: number;
  lastResourceRegen: number;
  lastActive: number;
  offlineSummary: OfflineSummary | null;
  viewMode: ViewMode;
  isCameraLocked: boolean;
  isPaused: boolean;
  isResearchOpen: boolean;
  isQuestsOpen: boolean;
  isZonesOpen: boolean;
  tickCount: number;
  lastUpdate: number;
  resourceNotifications: { id: string, type: ResourceType, amount: number, timestamp: number }[];
  
  // Infinite World & Optimization
  cameraPosition: [number, number, number];
  visibleChunks: string[];
  
  // Real Multiplayer
  matchmakingQueueStartTime: number | null;
  rankedPoints: number;
  rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Elite';
  opponentVillage: BuildingInstance[] | null;
  opponentName: string | null;

  settings: {
    soundVolume: number;
    graphicsQuality: 'low' | 'medium' | 'high';
    sensitivity: number;
    uiScale: number;
  };
  
  // Anti-Cheat & Production Systems
  lastActionTime: number;
  violationCount: number;
  isFlagged: boolean;
  shopItems: ShopItem[];
  shopSeed: number;
  lastShopTick: number;

  leaderboard: LeaderboardEntry[];
  playerName: string;
  villageName: string;
  units: UnitInstance[];
  enemyBuildings: BuildingInstance[];
  combatStatus: CombatStatus;
  selectedCombatUnit: TroopType;
  
  // Battle System
  army: Record<TroopType, number>;
  troopTraining: { type: TroopType, startTime: number, duration: number }[];
  maxArmyCapacity: number;
  battleTimeLeft: number;
  destructionPercentage: number;
  lastDeploymentTime: number;
  battleStartTime: number | null;
  
  // Social & Multiplayer
  clans: Clan[];
  activeClan: Clan | null;
  clanMembers: any[];
  friends: UserProfile[];
  friendRequests: FriendRequest[];
  globalChat: ChatMessage[];
  clanChat: ChatMessage[];
  dailyRewardStreak: number;
  lastDailyClaim: number;
  
  // New Systems
  replays: BattleReplay [];
  isReplaying: boolean;
  activeReplay: BattleReplay | null;
  replayTime: number;
  replaySpeed: number;
  recordedActions: DeploymentAction[];
  
  dailyShop: {
    items: ShopItem[];
    lastReset: number;
  };
  
  inventory: Equipment[];
  craftingQueue: CraftingJob[];
  researchLevels: Record<string, number>;
  boostInventory: Boost[];
  activeBoosts: ActiveBoost[];

  // Seasons & Live Events
  season: {
    current: number;
    startTime: number;
    endTime: number;
    name: string;
  };
  seasonPass: {
    level: number;
    xp: number;
    nextLevelXp: number;
    isPremium: boolean;
    claimedFree: number[]; // indices of claimed rewards
    claimedPremium: number[];
  };
  dailyMissions: DailyMission[];
}

export interface SeasonPassReward {
  level: number;
  type: 'resource' | 'gold' | 'skin' | 'boost';
  value: any;
  isPremium: boolean;
  name: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'build' | 'fight' | 'upgrade' | 'research' | 'win' | 'buy';
  target: string;
  requirement: number;
  progress: number;
  xpReward: number;
  goldReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface LiveEvent {
  id: string;
  type: 'production_boost' | 'upgrade_speed' | 'goblin_raid' | 'harvest_fest' | 'gold_rush';
  name: string;
  description: string;
  multiplier: number;
  status: 'active' | 'upcoming' | 'expired';
  startTime: number;
  endTime: number;
}
