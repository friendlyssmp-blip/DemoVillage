/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ResourceType = 'wood' | 'stone' | 'food' | 'gold';
export type WeatherType = 'sunny' | 'windy' | 'rainy' | 'stormy' | 'snowy';
export type EraType = 'primal' | 'colonial' | 'industrial' | 'modern' | 'cyber';

export interface Resources {
  wood: number;
  stone: number;
  food: number;
  gold: number;
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
  model: 'townhall' | 'lumberjack' | 'quarry' | 'farm' | 'storage' | 'market' | 'barracks' | 'kitchen' | 'lab' | 'factory';
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
  respawnTime?: number;
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

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirement: {
    type: 'build' | 'collect' | 'population' | 'era';
    target: string;
    amount: number;
  };
  reward: Partial<Resources> & { unlock?: string };
  completed: boolean;
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

export interface OfflineSummary {
  timeAway: number; // in milliseconds
  generated: Resources;
  lost: Resources;
  foodShortage: boolean;
  active: boolean;
}

export interface UnitInstance {
  id: string;
  type: 'soldier' | 'archer' | 'heavy';
  position: [number, number];
  health: number;
  maxHealth: number;
  level: number;
  state: 'idle' | 'moving' | 'attacking';
}

export type CombatStatus = 'idle' | 'searching' | 'attacking' | 'victory' | 'defeat';

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
  activeEvents: WorldEvent[];
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
  leaderboard: LeaderboardEntry[];
  playerName: string;
  villageName: string;
  units: UnitInstance[];
  enemyBuildings: BuildingInstance[];
  combatStatus: CombatStatus;
  selectedCombatUnit: 'soldier' | 'archer' | 'heavy';
  
  // Social & Multiplayer
  clans: Clan[];
  activeClan: Clan | null;
  friends: UserProfile[];
  friendRequests: FriendRequest[];
  globalChat: ChatMessage[];
  clanChat: ChatMessage[];
  dailyRewardStreak: number;
  lastDailyClaim: number;
}
