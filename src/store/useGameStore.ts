import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { 
  GameState, BuildingInstance, ResourceType, Resources, 
  NPCInstance, WeatherType, BuildingType, MapObject,
  Technology, Quest, Zone, WorldEvent, ViewMode, LeaderboardEntry, OfflineSummary,
  UnitInstance, CombatStatus, DailyMission, LiveEvent,
  TroopType, TroopStats, ShopItem, BattleReplay, Equipment, CraftingJob, DeploymentAction
} from '../types';
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs, 
  limit, serverTimestamp, updateDoc, increment, arrayUnion, Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { audioService } from '../services/audioService';

export const BUILDING_TYPES: Record<string, BuildingType> = {
  townhall: {
    id: 'townhall',
    name: 'Primal Hub',
    description: 'The heart of your village. Unlocks new buildings.',
    cost: { gold: 0 },
    production: { gold: 0.1 },
    capacityBonus: { wood: 500, stone: 500, food: 500, gold: 1000 },
    model: 'townhall' as const,
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
    model: 'lumberjack' as const,
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
    model: 'quarry' as const,
    npcCount: 2,
    requiredEra: 'primal',
    size: 2,
  },
  farm: {
    id: 'farm',
    name: 'Communal Farm',
    description: 'Farmers plant and harvest food cycles.',
    cost: { wood: 30, stone: 10 },
    production: { food: 4.0 },
    capacityBonus: { food: 400 },
    model: 'farm' as const,
    npcCount: 3,
    requiredEra: 'primal',
    size: 2,
  },
  market: {
    id: 'market',
    name: 'Trade Post',
    description: 'Sell resources for Gold to expand your village.',
    cost: { wood: 100, stone: 100 },
    production: { gold: 0.5 },
    capacityBonus: { gold: 1000 },
    model: 'market' as const,
    npcCount: 2,
    requiredEra: 'colonial',
    size: 2,
  },
  barracks: {
    id: 'barracks',
    name: 'Guard House',
    description: 'Trains soldiers to defend the village.',
    cost: { wood: 150, stone: 50, gold: 200 },
    production: {},
    capacityBonus: {},
    model: 'barracks' as const,
    npcCount: 4,
    requiredEra: 'colonial',
    size: 3,
  },
  lab: {
    id: 'lab',
    name: 'Research Lab',
    description: 'Develop new technologies to advance your civilization.',
    cost: { wood: 200, stone: 200, gold: 500 },
    production: {},
    capacityBonus: {},
    model: 'lab' as const,
    npcCount: 2,
    requiredEra: 'colonial',
    size: 2,
  },
  factory: {
    id: 'factory',
    name: 'Mass Factory',
    description: 'Automated production of stone and wood.',
    cost: { stone: 1000, gold: 2000 },
    production: { wood: 5.0, stone: 5.0 },
    capacityBonus: { wood: 2000, stone: 2000 },
    model: 'factory' as const,
    npcCount: 5,
    requiredEra: 'industrial',
    size: 3,
  },
  warehouse: {
    id: 'warehouse',
    name: 'Storage Warehouse',
    description: 'Increases total storage capacity for all resources. Essential for growth.',
    cost: { wood: 100, stone: 80, food: 50 },
    production: {},
    capacityBonus: { wood: 2000, stone: 2000, food: 2000, gold: 5000 },
    model: 'storage' as const,
    npcCount: 0,
    requiredEra: 'primal',
    size: 2,
  },
  goblin_hut: {
    id: 'goblin_hut',
    name: 'Goblin Hut',
    description: 'Raids neighboring villages automatically for Gold bonus.',
    cost: { wood: 300, gold: 500 },
    production: { gold: 1.5 },
    capacityBonus: { gold: 2000 },
    model: 'goblin_hut' as const,
    npcCount: 2,
    requiredEra: 'colonial',
    size: 2,
  },
  academy: {
    id: 'academy',
    name: 'Royal Academy',
    description: 'Speeds up research and improves citizen efficiency.',
    cost: { wood: 500, stone: 500, gold: 1500 },
    production: { gold: 2.0 },
    capacityBonus: { gold: 2000 },
    model: 'lab' as const,
    npcCount: 3,
    requiredEra: 'colonial',
    size: 3,
  },
  forge: {
    id: 'forge',
    name: 'Ancient Forge',
    description: 'Processes raw materials into superior goods.',
    cost: { wood: 300, stone: 600, gold: 800 },
    production: { stone: 5.0, gold: 1.0 },
    capacityBonus: { stone: 1000 },
    model: 'factory' as const,
    npcCount: 2,
    requiredEra: 'colonial',
    size: 2,
  },
  observatory: {
    id: 'observatory',
    name: 'Sky Observatory',
    description: 'Studies the heavens to predict weather and events.',
    cost: { wood: 400, stone: 400, gold: 2500 },
    production: { gold: 5.0 },
    capacityBonus: { gold: 5000 },
    model: 'lab' as const,
    npcCount: 2,
    requiredEra: 'industrial',
    size: 2,
  },
  tower: {
    id: 'tower',
    name: 'Archer Tower',
    description: 'Defends the village against invaders with long-range arrows.',
    cost: { wood: 200, stone: 150, gold: 300 },
    production: {},
    capacityBonus: {},
    model: 'tower' as const,
    npcCount: 2,
    requiredEra: 'colonial',
    size: 2,
  },
  mortar: {
    id: 'mortar',
    name: 'Mortar',
    description: 'Deals massive splash damage to slow moving units.',
    cost: { wood: 400, stone: 600, gold: 500 },
    production: {},
    capacityBonus: {},
    model: 'mortar' as const,
    npcCount: 0,
    requiredEra: 'industrial',
    size: 2,
  },
  trap: {
    id: 'trap',
    name: 'Bomb Trap',
    description: 'Explodes when units step on it. One-time use.',
    cost: { wood: 100, stone: 100, gold: 200 },
    production: {},
    capacityBonus: {},
    model: 'trap' as const,
    npcCount: 0,
    requiredEra: 'colonial',
    size: 1,
  },
  torch: {
    id: 'torch',
    name: 'Village Torch',
    description: 'Brings light to the darkness and boosts villager morale slightly.',
    cost: { wood: 20, gold: 10 },
    production: { gold: 0.05 },
    capacityBonus: {},
    model: 'torch' as const,
    npcCount: 0,
    requiredEra: 'primal',
    size: 1,
  }
};

export const TROOP_TYPES: Record<TroopType, TroopStats> = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    health: 120,
    damage: 15,
    speed: 1.5,
    range: 1.2,
    cost: { food: 50 },
    capacity: 1,
    priority: 'any'
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    health: 70,
    damage: 12,
    speed: 1.2,
    range: 8,
    cost: { food: 40, wood: 10 },
    capacity: 1,
    priority: 'any'
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    health: 450,
    damage: 8,
    speed: 0.8,
    range: 1.5,
    cost: { food: 150, stone: 20 },
    capacity: 4,
    priority: 'defense'
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    health: 60,
    damage: 10,
    speed: 2.5,
    range: 1.0,
    cost: { food: 30, gold: 10 },
    capacity: 1,
    priority: 'resource'
  }
};

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
    description: 'Build a Lumber Camp to start gathering resources.',
    requirement: { type: 'build', target: 'lumberjack', amount: 1 },
    reward: { wood: 50, gold: 100 },
    completed: false
  },
  {
    id: 'pop_milestone',
    title: 'Village Growth',
    description: 'Reach a population of 5 NPCs.',
    requirement: { type: 'population', target: '', amount: 5 },
    reward: { gold: 200, unlock: 'colonial' },
    completed: false
  }
];

export const MAP_ZONES: Zone[] = [
  { id: 'core', name: 'Valley Center', bounds: { x: [-30, 30], z: [-30, 30] }, unlocked: true, cost: {} },
  { id: 'north', name: 'Highlands', bounds: { x: [-30, 30], z: [30, 60] }, unlocked: false, cost: { gold: 500, stone: 200 } },
  { id: 'east', name: 'Dark Forest', bounds: { x: [30, 60], z: [-30, 30] }, unlocked: false, cost: { gold: 500, wood: 200 } }
];

interface GameStore extends GameState {
  addResource: (type: ResourceType, amount: number) => void;
  spendResources: (cost: Partial<Resources>) => boolean;
  placeBuilding: (typeId: string, position: [number, number]) => void;
  selectBuilding: (id: string | null) => void;
  selectObject: (id: string | null) => void;
  startPlacement: (typeId: string) => void;
  cancelPlacement: () => void;
  upgradeBuilding: (id: string) => void;
  addNpcsToBuilding: (buildingId: string, count: number, typeId: string, position: [number, number]) => void;
  nextTutorial: () => void;
  skipTutorial: () => void;
  sellResource: (type: ResourceType, amount: number, pricePerUnit: number) => void;
  removeMapObject: (id: string) => void;
  toggleEditMode: () => void;
  startMoving: (id: string) => void;
  confirmMove: (position: [number, number]) => void;
  mergeBuildings: (idA: string, idB: string) => void;
  startResearch: (techId: string) => void;
  unlockZone: (zoneId: string) => void;
  tick: (delta: number) => void;
  checkPlacement: (position: [number, number], excludeBuildingId?: string) => { isNear: boolean, isOverlap: boolean };
  calculateOfflineProgress: () => void;
  closeOfflineSummary: () => void;
  setViewMode: (mode: ViewMode) => void;
  setCameraLocked: (locked: boolean) => void;
  setPaused: (paused: boolean) => void;
  setResearchOpen: (open: boolean) => void;
  setQuestsOpen: (open: boolean) => void;
  setZonesOpen: (open: boolean) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  isAnyMenuOpen: () => boolean;
  syncVillage: () => Promise<void>;
  saveProgress: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  updateCamera: (pos: [number, number, number]) => void;
  startMatchmaking: () => void;
  cancelMatchmaking: () => void;
  deployUnit: (type: TroopType, position: [number, number]) => void;
  trainTroop: (type: TroopType) => void;
  setCombatUnit: (type: TroopType) => void;
  setUser: (user: Partial<GameState['user']>) => void;
  recalculateCapacity: () => void;
  handleMissionProgress: (type: DailyMission['type'], target: string, amount: number) => void;
  addSeasonXP: (amount: number) => void;
  resetVillage: () => Promise<void>;

  // New Systems Methods
  tickShop: () => void;
  buyShopItem: (item: ShopItem) => void;
  
  startReplay: (replay: BattleReplay) => void;
  stopReplay: () => void;
  
  startCrafting: (equipment: Equipment) => void;
  collectCraftedItem: (jobId: string) => void;
  
  researchLaboratory: (researchId: string) => void;
  tradeMarket: (from: ResourceType, to: ResourceType, amount: number) => void;
}

const generateMapObjects = (count: number, gridSize: number) => {
  const objects: MapObject[] = [];
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.4 ? 'tree' : 'rock';
    objects.push({
      id: nanoid(),
      type,
      position: [
        (Math.random() - 0.5) * gridSize,
        (Math.random() - 0.5) * gridSize
      ],
      resourceYield: {
        type: type === 'tree' ? 'wood' : 'stone',
        amount: Math.floor(Math.random() * 20) + 10
      },
      removalCost: Math.floor(Math.random() * 50) + 50
    });
  }
  return objects;
};

export const useGameStore = create<GameStore>((set, get) => ({
  user: {
    uid: null,
    email: null,
    isVerified: false,
    profile: null
  },
  resources: { wood: 400, stone: 200, food: 400, gold: 1000 },
  maxCapacity: { wood: 1000, stone: 1000, food: 1000, gold: 5000 },
  buildings: [
    {
      id: 'initial-townhall',
      typeId: 'townhall',
      level: 1,
      position: [0, 0],
      rotation: 0,
      progress: 1,
      isConstructing: false,
      lastUpdate: Date.now(),
      health: 1000,
      maxHealth: 1000
    }
  ],
  npcs: [],
  mapObjects: generateMapObjects(60, 100),
  technologies: INITIAL_TECHS,
  quests: INITIAL_QUESTS,
  activeLiveEvents: [],
  unlockedZones: ['core'],
  era: 'primal',
  population: 0,
  season: {
    current: 1,
    startTime: Date.now(),
    endTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
    name: 'Season 1: Pioneers'
  },
  seasonPass: {
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    isPremium: false,
    claimedFree: [],
    claimedPremium: []
  },
  dailyMissions: [],
  weather: 'sunny',
  timeOfDay: 12,
  selectedBuildingId: null,
  selectedObjectId: null,
  isPlacementMode: false,
  isEditMode: false,
  placementTypeId: null,
  movingBuildingId: null,
  gridSize: 30,
  tutorialStep: 0,
  lastResourceRegen: Date.now(),
  lastActive: Date.now(),
  offlineSummary: null,
  viewMode: 'menu',
  isCameraLocked: false,
  isPaused: false,
  isResearchOpen: false,
  isQuestsOpen: false,
  isZonesOpen: false,
  
  // Tactical Battle System
  army: { warrior: 10, archer: 5, tank: 0, scout: 0 },
  troopTraining: [],
  maxArmyCapacity: 20,
  battleTimeLeft: 0,
  destructionPercentage: 0,
  lastDeploymentTime: 0,
  battleStartTime: null,
  
  // Infinite World
  cameraPosition: [25, 25, 25],
  visibleChunks: [],
  
  // Real Multiplayer
  matchmakingQueueStartTime: null,
  rankedPoints: 0,
  rankTier: 'Bronze',
  opponentVillage: null,
  opponentName: null,

  settings: {
    soundVolume: 0.8,
    graphicsQuality: 'high',
    sensitivity: 1.0,
    uiScale: 0.85 // Reduced by 15% for cleaner mobile feel
  },

  isAnyMenuOpen: () => {
    const { isPaused, isResearchOpen, isQuestsOpen, isZonesOpen, viewMode, tutorialStep, selectedBuildingId, selectedObjectId } = get();
    // Also consider build menu/selection as "menu open" if it obscures view
    return isPaused || isResearchOpen || isQuestsOpen || isZonesOpen || viewMode !== 'playing' || (tutorialStep > 0 && tutorialStep < 10) || !!selectedBuildingId || !!selectedObjectId;
  },
  playerName: 'Chief Village',
  villageName: 'The Sanctuary',
  leaderboard: [
    { userId: '1', name: 'Zaltar', gold: 50000, population: 150, level: 12, rank: 1, points: 2500, powerScore: 5000 },
    { userId: '2', name: 'Elder Oak', gold: 35000, population: 120, level: 10, rank: 2, points: 2100, powerScore: 4200 },
    { userId: '3', name: 'Nova', gold: 28000, population: 90, level: 8, rank: 3, points: 1800, powerScore: 3600 },
  ],
  units: [],
  enemyBuildings: [],
  combatStatus: 'idle',
  selectedCombatUnit: 'warrior',

  // Social & Multiplayer
  clans: [],
  activeClan: null,
  clanMembers: [],
  friends: [],
  friendRequests: [],
  globalChat: [],
  clanChat: [],
  dailyRewardStreak: 0,
  lastDailyClaim: 0,
  tickCount: 0,
  lastUpdate: Date.now(),
  resourceNotifications: [],
  
  // Replay System
  replays: [],
  isReplaying: false,
  activeReplay: null,
  replayTime: 0,
  replaySpeed: 1,
  recordedActions: [],

  // Daily Shop
  dailyShop: {
    items: [],
    lastReset: 0
  },

  // Equipment & Crafting
  inventory: [],
  craftingQueue: [],
  researchLevels: {},

  startMatchmaking: async () => {
    const startTime = Date.now();
    set({ 
       combatStatus: 'searching', 
       viewMode: 'fighting', 
       units: [], 
       battleTimeLeft: 180, // 3 minutes
       destructionPercentage: 0,
       matchmakingQueueStartTime: startTime,
       recordedActions: []
    });

    // Check for matchmaking timeout (30 seconds)
    const timeoutCheck = setInterval(() => {
       const { combatStatus, matchmakingQueueStartTime } = get();
       if (combatStatus !== 'searching') {
          clearInterval(timeoutCheck);
          return;
       }
       if (matchmakingQueueStartTime && Date.now() - matchmakingQueueStartTime > 30000) {
          clearInterval(timeoutCheck);
          set({ combatStatus: 'idle', viewMode: 'playing', matchmakingQueueStartTime: null });
          alert('No opponent found, try again later.');
       }
    }, 1000);

    try {
      const { user, buildings, npcs: rawNpcs } = get();
      const npcs = rawNpcs || [];
      const currentPower = buildings.length * 100 + buildings.reduce((sum, b) => sum + b.level, 0) * 50 + npcs.length * 10;
      
      const playersRef = collection(db, 'villages');
      const yesterdayDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h active
      const yesterday = Timestamp.fromDate(yesterdayDate);
      
      const q = query(
        playersRef, 
        where('lastSynced', '>=', yesterday),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const candidates = querySnapshot.docs
        .filter(doc => doc.id !== user.uid)
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(p => {
          const diff = Math.abs(p.powerScore - currentPower);
          return (diff / Math.max(1, currentPower)) < 0.6; // Slightly wider range for demo
        });

      // Simulation of search time
      const waitTime = Math.random() * 5000 + 2000;
      await new Promise(r => setTimeout(r, waitTime));

      // Re-check if user cancelled
      if (get().combatStatus !== 'searching') return;

      if (candidates.length > 0) {
        clearInterval(timeoutCheck);
        candidates.sort((a, b) => Math.abs(a.powerScore - currentPower) - Math.abs(b.powerScore - currentPower));
        const opponent = candidates[0];
        
        const enemyBuildings = (opponent.buildings || []).map((b: any) => ({
          ...b,
          id: `enemy-${b.id}`,
          health: 800 * (b.level || 1),
          maxHealth: 800 * (b.level || 1),
        }));

        set({ 
          enemyBuildings, 
          opponentName: opponent.playerName || 'Rival Chief',
          combatStatus: 'attacking',
          matchmakingQueueStartTime: null,
          destructionPercentage: 0,
          battleStartTime: Date.now(),
          recordedActions: []
        });
        audioService.play('victory');
      }
    } catch (err) {
      clearInterval(timeoutCheck);
      handleFirestoreError(err, OperationType.LIST, 'villages');
      set({ combatStatus: 'idle', viewMode: 'playing', matchmakingQueueStartTime: null });
    }
  },

  cancelMatchmaking: () => set({ combatStatus: 'idle', viewMode: 'playing', matchmakingQueueStartTime: null }),

  deployUnit: (type: TroopType, position: [number, number]) => {
    const { units, army, lastDeploymentTime, combatStatus } = get();
    if (combatStatus !== 'attacking') return;
    
    // Deployment rules
    if (army[type] <= 0) return;
    
    // Deployment cooldown (200ms)
    const now = Date.now();
    if (now - lastDeploymentTime < 200) return;

    const stats = TROOP_TYPES[type];
    const newUnit: UnitInstance = {
      id: nanoid(),
      type,
      position,
      health: stats.health,
      maxHealth: stats.health,
      targetId: null,
      state: 'idle',
      deployedAt: now
    };

    set({ 
      units: [...units, newUnit],
      army: { ...army, [type]: army[type] - 1 },
      lastDeploymentTime: now,
      recordedActions: [...get().recordedActions, { type, position, timestamp: now - (get().battleStartTime || now) }]
    });
  },

  trainTroop: (type: TroopType) => {
    const stats = TROOP_TYPES[type];
    const { army, resources, maxArmyCapacity } = get();
    
    // Check capacity
    const currentArmySize = Object.entries(army).reduce((sum, [t, count]) => sum + (count * TROOP_TYPES[t as TroopType].capacity), 0);
    if (currentArmySize + stats.capacity > maxArmyCapacity) return;

    if (get().spendResources(stats.cost)) {
      set({ army: { ...army, [type]: army[type] + 1 } });
    }
  },

  setCombatUnit: (selectedCombatUnit) => set({ selectedCombatUnit }),
  
  setUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),

  resetVillage: async () => {
    const { user, syncVillage } = get();
    if (!user.uid) return;

    // Completely wipe player progress data on Firestore
    try {
      await setDoc(doc(db, 'villages', user.uid), {
        userId: user.uid,
        buildings: [
          {
            id: 'initial-townhall',
            typeId: 'townhall',
            level: 1,
            position: [0, 0],
            rotation: 0,
            progress: 1,
            isConstructing: false,
            lastUpdate: Date.now(),
            health: 1000,
            maxHealth: 1000
          }
        ],
        resources: { wood: 400, stone: 200, food: 400, gold: 1000 },
        era: 'primal',
        npcsCount: 0,
        unlockedZones: ['core'],
        technologies: [],
        rankedPoints: 0,
        rankTier: 'Bronze',
        tutorialStep: 1,
        lastSynced: serverTimestamp(),
        level: 1,
        powerScore: 100
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `villages/${user.uid}`);
    }

    // Reset local state
    set({
      resources: { wood: 400, stone: 200, food: 400, gold: 1000 },
      maxCapacity: { wood: 1000, stone: 1000, food: 1000, gold: 5000 },
      buildings: [
        {
          id: 'initial-townhall',
          typeId: 'townhall',
          level: 1,
          position: [0, 0],
          rotation: 0,
          progress: 1,
          isConstructing: false,
          lastUpdate: Date.now(),
          health: 1000,
          maxHealth: 1000
        }
      ],
      npcs: [],
      mapObjects: generateMapObjects(60, 100),
      technologies: INITIAL_TECHS,
      quests: INITIAL_QUESTS,
      era: 'primal',
      population: 0,
      seasonPass: {
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        isPremium: false,
        claimedFree: [],
        claimedPremium: []
      },
      dailyMissions: [],
      rankedPoints: 0,
      rankTier: 'Bronze',
      tutorialStep: 1,
      viewMode: 'playing',
      inventory: [],
      craftingQueue: [],
      researchLevels: {}
    });

    await syncVillage();
    window.location.reload(); 
  },

  addSeasonXP: (amount) => {
    // Security: Filter suspicious XP gains
    if (amount <= 0 || amount > 5000) return;
    set(state => {
      if (!state.seasonPass) return state;
      const { level, xp, nextLevelXp } = state.seasonPass;
      let newXp = xp + amount;
      let newLevel = level;
      let newNextLevelXp = nextLevelXp;

      while (newXp >= newNextLevelXp && newLevel < 50) {
        newXp -= newNextLevelXp;
        newLevel++;
        newNextLevelXp = Math.floor(newNextLevelXp * 1.1);
      }

      return {
        seasonPass: {
          ...state.seasonPass,
          level: newLevel,
          xp: newXp,
          nextLevelXp: newNextLevelXp
        }
      };
    });
  },

  handleMissionProgress: (type, target, amount) => {
    set(state => {
      const { dailyMissions, seasonPass } = state;
      let missionCompleted = false;
      const updatedMissions = dailyMissions.map(m => {
        if (m.completed || m.type !== type) return m;
        if (m.target && m.target !== target) return m;
        
        const newProgress = m.progress + amount;
        const completed = newProgress >= m.requirement;
        if (completed) missionCompleted = true;
        
        return { ...m, progress: newProgress, completed };
      });

      if (!missionCompleted && JSON.stringify(updatedMissions) === JSON.stringify(dailyMissions)) return state;

      return { dailyMissions: updatedMissions };
    });
  },

  recalculateCapacity: () => {
    const { buildings, technologies, syncVillage } = get();
    const baseCapacity = { wood: 1000, stone: 1000, food: 1000, gold: 2000 };
    const newMaxCapacity = { ...baseCapacity };

    buildings.forEach(b => {
      if (b.isConstructing) return;
      const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
      if (type && type.capacityBonus) {
        Object.entries(type.capacityBonus).forEach(([res, bonus]) => {
          const key = res as ResourceType;
          // Scale bonus with building level (exponentialish growth)
          const levelMult = Math.pow(2, Math.log2(b.level)); // This is just b.level, but let's make it smarter if needed
          newMaxCapacity[key] += (bonus || 0) * b.level;
        });
      }
    });

    // Tech bonuses for storage
    technologies.forEach(t => {
      if (t.unlocked && t.effect.type === 'storage') {
        newMaxCapacity.food = Math.floor(newMaxCapacity.food * (1 + t.effect.value));
      }
    });

    set({ maxCapacity: newMaxCapacity });
  },

  calculateOfflineProgress: () => {
    const { lastActive, buildings: rawBuildings, resources, maxCapacity, npcs: rawNpcs, technologies: rawTechs } = get();
    const buildings = rawBuildings || [];
    const npcs = rawNpcs || [];
    const technologies = rawTechs || [];
    const now = Date.now();
    const elapsedTime = now - lastActive;
    let secondsAway = Math.floor(elapsedTime / 1000);
    
    // Anticheat / Cap
    const MAX_OFFLINE_SECONDS = 12 * 3600; // 12 hours
    if (secondsAway > MAX_OFFLINE_SECONDS) secondsAway = MAX_OFFLINE_SECONDS;
    if (secondsAway < 60) {
      set({ lastActive: now });
      return;
    }

    const generated: Resources = { wood: 0, stone: 0, food: 0, gold: 0 };
    const lost: Resources = { wood: 0, stone: 0, food: 0, gold: 0 };
    let foodShortage = false;

    // Simulation logic
    const dt = secondsAway;
    const techBonus = technologies
      .filter(t => t.unlocked && t.effect.type === 'efficiency')
      .reduce((sum, t) => sum + t.effect.value, 0);

    const foodProducedPerSec = buildings.reduce((acc, b) => {
        if (b.isConstructing) return acc;
        const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
        if (!type.production.food) return acc;
        return acc + (type.production.food * b.level * (1 + techBonus));
    }, 0);

    const foodConsumedPerSec = npcs.length * 0.08; 
    const netFoodPerSec = foodProducedPerSec - foodConsumedPerSec;
    
    let totalFoodGenerated = netFoodPerSec * dt;
    let actualSecondsWithFood = dt;

    if (netFoodPerSec < 0 && resources.food + totalFoodGenerated < 0) {
        actualSecondsWithFood = Math.floor(resources.food / Math.abs(netFoodPerSec));
        foodShortage = true;
    }

    buildings.forEach(b => {
      if (b.isConstructing) return;
      const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
      Object.entries(type.production).forEach(([res, rate]) => {
        if (res === 'food') return;
        const key = res as ResourceType;
        const gain = rate * b.level * (1 + techBonus) * actualSecondsWithFood;
        generated[key] += gain;
      });
    });
    
    generated.food = Math.max(0, netFoodPerSec * actualSecondsWithFood);

    const nextResources = { ...resources };
    Object.entries(generated).forEach(([res, amount]) => {
      const key = res as ResourceType;
      const availableSpace = maxCapacity[key] - nextResources[key];
      const actualGain = Math.min(amount, availableSpace);
      nextResources[key] += actualGain;
      lost[key] = Math.max(0, amount - availableSpace);
    });

    set({
      resources: nextResources,
      lastActive: now,
      offlineSummary: {
        timeAway: elapsedTime,
        generated,
        lost,
        foodShortage,
        active: true
      }
    });
  },

  closeOfflineSummary: () => set({ offlineSummary: null }),

  setViewMode: (viewMode) => set({ viewMode }),
  setCameraLocked: (isCameraLocked) => set({ isCameraLocked }),
  setPaused: (isPaused) => set({ isPaused }),
  setResearchOpen: (isResearchOpen) => set({ isResearchOpen }),
  setQuestsOpen: (isQuestsOpen) => set({ isQuestsOpen }),
  setZonesOpen: (isZonesOpen) => set({ isZonesOpen }),
  updateSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),

  saveProgress: async () => {
    const { syncVillage } = get();
    await syncVillage();
  },

  // Village Synchronization
  syncVillage: async () => {
    const { user, buildings: rawBuildings, resources, era, villageName, playerName, npcs: rawNpcs, unlockedZones: rawZones, technologies: rawTechs, rankedPoints, rankTier, activeLiveEvents: rawEvents, seasonPass, season, dailyMissions: rawMissions } = get();
    const buildings = rawBuildings || [];
    const npcs = rawNpcs || [];
    const unlockedZones = rawZones || ['core'];
    const technologies = rawTechs || [];
    const activeLiveEvents = rawEvents || [];
    const dailyMissions = rawMissions || [];
    if (!user.uid) return;

    const powerScore = buildings.length * 100 + buildings.reduce((sum, b) => sum + b.level, 0) * 50 + npcs.length * 10;

    try {
      await setDoc(doc(db, 'villages', user.uid), {
        userId: user.uid,
        buildings,
        resources,
        era,
        villageName,
        playerName,
        npcsCount: npcs.length,
        unlockedZones,
        technologies: technologies.map(t => ({ id: t.id, unlocked: t.unlocked })),
        rankedPoints,
        rankTier,
        activeLiveEvents,
        seasonPass,
        season,
        dailyMissions,
        lastSynced: serverTimestamp(),
        level: buildings.reduce((sum, b) => sum + (b.isConstructing ? 0 : b.level), 0),
        powerScore: powerScore
      }, { merge: true });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `villages/${user.uid}`);
    }
  },

  fetchLeaderboard: async () => {
    try {
      const villagesRef = collection(db, 'villages');
      // Sort by rankedPoints (descending) and limit to top 50
      const q = query(villagesRef, where('rankedPoints', '>', 0), limit(50));
      const querySnapshot = await getDocs(q);
      
      const entries: LeaderboardEntry[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          userId: doc.id,
          name: data.playerName || 'Unnamed Chief',
          gold: data.resources?.gold || 0,
          population: data.npcsCount || 0,
          level: data.level || 1,
          rank: 0, // Calculated on display or sort
          points: data.rankedPoints || 0,
          powerScore: data.powerScore || 0
        };
      });

      // Local sort to handle any firestore index lag or complex multi-field sorts
      entries.sort((a, b) => b.points - a.points);
      
      set({ leaderboard: entries });
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  },

  updateCamera: (pos: [number, number, number]) => {
    const CHUNK_SIZE = 40;
    const { visibleChunks, cameraPosition } = get();
    
    // Throttling: Only update if camera moved significantly (e.g., 5 units)
    const distSq = (pos[0] - cameraPosition[0])**2 + (pos[2] - cameraPosition[2])**2;
    if (distSq < 25) return;

    const chunkX = Math.floor(pos[0] / CHUNK_SIZE);
    const chunkZ = Math.floor(pos[2] / CHUNK_SIZE);
    
    const newVisible: string[] = [];
    const RENDER_DISTANCE = 1; // 3x3 chunks
    
    for(let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for(let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        newVisible.push(`${chunkX + x},${chunkZ + z}`);
      }
    }

    const visibleChanged = JSON.stringify(newVisible) !== JSON.stringify(visibleChunks);
    if (visibleChanged || distSq > 100) {
      set({ visibleChunks: newVisible, cameraPosition: pos });
    }
  },

  addResource: (type, amount) => {
    // Security: Basic anti-cheat
    if (amount <= 0 || isNaN(amount)) return;
    if (amount > 1000000) return; // Suspiciously large gain

    const { resources, maxCapacity, syncVillage, handleMissionProgress } = get();
    const newAmount = Math.min(resources[type] + amount, maxCapacity[type]);
    const actualGain = newAmount - resources[type];
    
    if (actualGain > 0) {
      // Track gathering for missions
      handleMissionProgress('collect', type, actualGain);

      // Trigger notification for UI floating text (only for significant discrete gains)
      if (amount >= 1) {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          resourceNotifications: [
            ...state.resourceNotifications,
            { id, type, amount: actualGain, timestamp: Date.now() }
          ].slice(-5) // Keep last 5
        }));
        
        // Auto-remove after 2s
        setTimeout(() => {
          set((state) => ({
            resourceNotifications: state.resourceNotifications.filter(n => n.id !== id)
          }));
        }, 2000);
      }
    }

    set((state) => ({
      resources: {
        ...state.resources,
        [type]: newAmount
      }
    }));
    // Sync critical resources immediately
    if (type === 'gold' && actualGain >= 5) syncVillage();
  },

  spendResources: (cost) => {
    const { resources, syncVillage } = get();
    // Security: Check for negative costs (hack attempt)
    const hasNegativeCost = Object.values(cost).some(v => (v || 0) < 0);
    if (hasNegativeCost) return false;

    const canAfford = Object.entries(cost).every(([type, amt]) => resources[type as keyof Resources] >= (amt || 0));
    
    if (canAfford) {
      const nextResources = { ...resources };
      Object.entries(cost).forEach(([type, amt]) => {
        nextResources[type as keyof Resources] -= (amt || 0);
      });
      set({ resources: nextResources });
      syncVillage(); // Push change immediately
      return true;
    }
    return false;
  },

  addNpcsToBuilding: (buildingId, count, typeId, position) => {
    const rawNpcs = get().npcs || [];
    const npcs = rawNpcs || [];
    // Population Cap: 50 NPCs max for performance
    if (npcs.length >= 50) return;
    
    const type = BUILDING_TYPES[typeId as keyof typeof BUILDING_TYPES];
    const newNpcs: NPCInstance[] = [];
    const actualCount = Math.min(count, 50 - npcs.length);

    for(let i=0; i<actualCount; i++) {
        let role: any = 'worker';
        let npcType: 'worker' | 'warrior' = 'worker';
        if (typeId === 'lumberjack') role = 'lumberjack';
        else if (typeId === 'quarry') role = 'miner';
        else if (typeId === 'farm') role = 'farmer';
        else if (typeId === 'market') role = 'trader';
        else if (typeId === 'lab') role = 'scientist';
        else if (typeId === 'barracks') { role = 'guard'; npcType = 'warrior'; }

        newNpcs.push({
          id: nanoid(),
          buildingId: buildingId,
          type: npcType,
          role,
          state: 'idle',
          position: [position[0] + (Math.random() - 0.5) * 2, 0, position[1] + (Math.random() - 0.5) * 2],
          targetPosition: null,
          carrying: null,
          hunger: 100,
          efficiency: 1.0,
          age: 0,
          lifespan: Math.random() * 800 + 600,
          health: 100,
          combatPower: npcType === 'warrior' ? 10 : 0
        });
    }
    set(state => ({ npcs: [...(state.npcs || []), ...newNpcs] }));
  },

  placeBuilding: (typeId, position) => {
    const type = BUILDING_TYPES[typeId as keyof typeof BUILDING_TYPES];
    const { tutorialStep, checkPlacement, unlockedZones, buildings } = get();
    
    // Building Limit Check (Max 256 per type, except torches)
    if (typeId !== 'torch') {
      const count = buildings.filter(b => b.typeId === typeId).length;
      if (count >= 256) {
        alert('Max limit reached for this building type!');
        return;
      }
    }
    
    // Zone check
    const currentZone = MAP_ZONES.find(z => 
      position[0] >= z.bounds.x[0] && position[0] <= z.bounds.x[1] &&
      position[1] >= z.bounds.z[0] && position[1] <= z.bounds.z[1]
    );

    if (!currentZone || !unlockedZones.includes(currentZone.id)) return;

    const { isNear, isOverlap } = checkPlacement(position);
    if (!isNear || isOverlap) return;

    if (get().spendResources(type.cost)) {
      const newBuilding: BuildingInstance = {
        id: nanoid(),
        typeId,
        level: 1,
        position,
        rotation: 0,
        progress: 0,
        isConstructing: true,
        lastUpdate: Date.now(),
        health: 500,
        maxHealth: 500
      };

      set((state) => ({
        buildings: [...state.buildings, newBuilding],
        isPlacementMode: false,
        placementTypeId: null,
        tutorialStep: tutorialStep === 2 ? 3 : tutorialStep
      }));

      get().addNpcsToBuilding(newBuilding.id, type.npcCount, typeId, position);
      get().syncVillage();
    }
  },

  selectBuilding: (id) => set({ selectedBuildingId: id, selectedObjectId: null }),
  selectObject: (id) => set({ selectedObjectId: id, selectedBuildingId: null }),

  checkPlacement: (position, excludeBuildingId) => {
    const { buildings, mapObjects, placementTypeId, movingBuildingId } = get();
    const activeTypeId = placementTypeId || (movingBuildingId ? buildings.find(b => b.id === movingBuildingId)?.typeId : null);
    if (!activeTypeId) return { isNear: true, isOverlap: false };

    const type = BUILDING_TYPES[activeTypeId];
    const size = type.size || 1;
    const halfSize = size / 2;

    // Overlap with other buildings
    const isOverlapBuilding = buildings.some(b => {
      if (b.id === excludeBuildingId) return false;
      const otherType = BUILDING_TYPES[b.typeId];
      const otherSize = otherType.size || 1;
      const otherHalfSize = otherSize / 2;

      // Axis-aligned bounding box check
      const overlapX = Math.abs(b.position[0] - position[0]) < (halfSize + otherHalfSize);
      const overlapZ = Math.abs(b.position[1] - position[1]) < (halfSize + otherHalfSize);
      return overlapX && overlapZ;
    });

    // Overlap with map objects
    const isOverlapObject = mapObjects.some(o => {
      const dx = Math.abs(o.position[0] - position[0]);
      const dz = Math.abs(o.position[1] - position[1]);
      return dx < (halfSize + 0.8) && dz < (halfSize + 0.8);
    });

    const isOverlap = isOverlapBuilding || isOverlapObject;

    // Proximity check (must be within 15 units of ANY building to "connect")
    const isNearBuilding = buildings.length === 0 || buildings.some(b => {
      if (b.id === excludeBuildingId) return false;
      const dx = b.position[0] - position[0];
      const dz = b.position[1] - position[1];
      const dist = Math.sqrt(dx*dx + dz*dz);
      return dist < 20;
    });

    return { isNear: isNearBuilding, isOverlap };
  },
  startPlacement: (typeId) => set({ isPlacementMode: true, placementTypeId: typeId, isEditMode: false }),
  cancelPlacement: () => set({ isPlacementMode: false, placementTypeId: null, movingBuildingId: null }),

  nextTutorial: () => set(state => ({ tutorialStep: state.tutorialStep + 1 })),
  skipTutorial: () => set({ tutorialStep: 10 }),

  removeMapObject: (id) => {
    const obj = get().mapObjects.find(o => o.id === id);
    if (!obj) return;
    
    if (get().spendResources({ gold: obj.removalCost })) {
      const { type, amount } = obj.resourceYield;
      get().addResource(type, amount);
      set((state) => ({
        mapObjects: state.mapObjects.filter(o => o.id !== id),
        selectedObjectId: null,
        tutorialStep: state.tutorialStep === 1 ? 2 : state.tutorialStep
      }));
    }
  },

  toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode, selectedBuildingId: null, movingBuildingId: null })),
  startMoving: (id) => set({ movingBuildingId: id, isEditMode: true }),
  confirmMove: (position) => {
    const { movingBuildingId, checkPlacement, buildings } = get();
    if (!movingBuildingId) return;

    const { isNear, isOverlap } = checkPlacement(position, movingBuildingId);

    if (!isNear || isOverlap) return;

    const oldBuilding = buildings.find(b => b.id === movingBuildingId);
    if (!oldBuilding) return;

    const dx = position[0] - oldBuilding.position[0];
    const dz = position[1] - oldBuilding.position[1];

    set(state => ({
      buildings: state.buildings.map(b => 
        b.id === movingBuildingId ? { ...b, position } : b
      ),
      npcs: (state.npcs || []).map(npc => 
        npc.buildingId === movingBuildingId 
          ? { ...npc, position: [npc.position[0] + dx, npc.position[1], npc.position[2] + dz] } 
          : npc
      ),
      movingBuildingId: null
    }));
  },

  mergeBuildings: (idA, idB) => {
    const { buildings, npcs, addNpcsToBuilding } = get();
    const bA = buildings.find(b => b.id === idA);
    const bB = buildings.find(b => b.id === idB);

    if (!bA || !bB || bA.typeId !== bB.typeId || bA.level !== bB.level || bA.isConstructing || bB.isConstructing) return;

    // Merge NPCs from building B to A or just remove them
    set(state => ({
      buildings: state.buildings
        .filter(b => b.id !== idB)
        .map(b => b.id === idA ? { ...b, level: b.level + 1, progress: 0, isConstructing: true } : b),
      npcs: (state.npcs || []).filter(npc => npc.buildingId !== idB),
      selectedBuildingId: idA,
      movingBuildingId: null
    }));

    // Add extra NPCs for the new level
    const type = BUILDING_TYPES[bA.typeId as keyof typeof BUILDING_TYPES];
    addNpcsToBuilding(idA, type.npcCount, bA.typeId, bA.position);
    get().recalculateCapacity();
  },

  upgradeBuilding: (id) => {
    const { buildings, addNpcsToBuilding, spendResources } = get();
    const b = buildings.find(item => item.id === id);
    if (!b || b.isConstructing) return; 

    const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
    
    // Scale costs based on size, level and a utility factor
    const utilityMap: Record<string, number> = {
      townhall: 2.5,
      market: 1.8,
      lab: 1.8,
      factory: 2.0,
      barracks: 1.6,
      academy: 2.2,
      forge: 1.5,
      observatory: 2.0,
      storage: 1.2,
      warehouse: 1.3,
      lumberjack: 1.4,
      quarry: 1.4,
      farm: 1.4,
      torch: 0.6
    };

    const factor = utilityMap[b.typeId] || 1.0;
    const sizeFactor = Math.sqrt(type.size || 1);
    
    // Level cap for specific buildings (e.g., Torch max level 2)
    if (b.typeId === 'torch' && b.level >= 2) return;

    // Exponential growth for level progression (1.6 factor for slower curve)
    const levelCostMult = Math.pow(1.6, b.level);
    
    const cost = {
      wood: Math.floor((type.cost.wood || 0) * levelCostMult * factor * sizeFactor),
      stone: Math.floor((type.cost.stone || 0) * levelCostMult * factor * sizeFactor),
      gold: Math.floor((type.cost.gold || 0) * levelCostMult * factor * sizeFactor),
      food: Math.floor((type.cost.food || 0) * levelCostMult * factor * sizeFactor),
    };

    if (spendResources(cost)) {
      set((state) => ({
        buildings: state.buildings.map(bi => 
          bi.id === id ? { ...bi, level: bi.level + 1, progress: 0, isConstructing: true } : bi
        )
      }));
      // Add extra NPCs (Lv1->Lv2 adds some NPCs)
      if (type.npcCount > 0) {
        addNpcsToBuilding(id, Math.ceil(type.npcCount * 0.5), b.typeId, b.position);
      }
    }
  },

  sellResource: (type, amount, pricePerUnit) => {
    if (get().resources[type as keyof Resources] >= amount) {
      set((state) => ({
        resources: {
          ...state.resources,
          [type]: state.resources[type as keyof Resources] - amount,
          gold: Math.min(state.resources.gold + (amount * pricePerUnit), state.maxCapacity.gold)
        }
      }));
    }
  },

  startResearch: (techId) => {
    const tech = get().technologies.find(t => t.id === techId);
    if (!tech || tech.unlocked || tech.isResearching) return;

    if (get().spendResources(tech.cost)) {
      set(state => ({
        technologies: state.technologies.map(t => 
          t.id === techId ? { ...t, isResearching: true, progress: 0 } : t
        )
      }));
    }
  },

  unlockZone: (zoneId) => {
    const zone = MAP_ZONES.find(z => z.id === zoneId);
    if (!zone || get().unlockedZones.includes(zoneId)) return;

    if (get().spendResources(zone.cost)) {
      set(state => ({
        unlockedZones: [...state.unlockedZones, zoneId]
      }));
    }
  },

  tick: (delta) => {
    if (get().isPaused) return;
    const { 
      buildings: rawBuildings, resources, maxCapacity, npcs: rawNpcs, weather, timeOfDay, 
      technologies: rawTechs, quests: rawQuests, lastResourceRegen, activeLiveEvents: rawEvents, era 
    } = get();
    const buildings = rawBuildings || [];
    const npcs = rawNpcs || [];
    const technologies = rawTechs || [];
    const quests = rawQuests || [];
    const activeLiveEvents = rawEvents || [];
    const dt = delta / 1000;
    const now = Date.now();

    // PERFORMANCE: Calculate fixed bonuses once per tick
    const techEfficiencyBonus = technologies
        .filter(t => t.unlocked && t.effect.type === 'efficiency')
        .reduce((sum, t) => sum + t.effect.value, 0);

    const eventMult = activeLiveEvents.reduce((acc, e) => acc * e.multiplier, 1);
    const upgradeSpeedMult = activeLiveEvents.find(e => e.type === 'upgrade_speed')?.multiplier || 1;

    // 1. Update NPC Stats (Hunger, Age, Efficiency) - THROTTLED every 10 ticks
    const tickCount = (get() as any).tickCount || 0;
    const shouldUpdateNpcStats = tickCount % 10 === 0;

    let updatedNpcs = npcs;
    if (shouldUpdateNpcStats) {
        updatedNpcs = npcs.map(npc => {
          const hungerLoss = (0.05 + Math.random() * 0.05) * dt * 10;
          const nextHunger = Math.max(npc.hunger - hungerLoss, 0);
          
          let efficiencyMult = 1.0;
          if (nextHunger < 20) efficiencyMult = 0.5;
          else if (nextHunger < 50) efficiencyMult = 0.8;
    
          efficiencyMult += techEfficiencyBonus;
          
          // Harvest fest event
          if (activeLiveEvents.some(e => e.type === 'harvest_fest')) {
            efficiencyMult *= 1.5;
          }
    
          return {
            ...npc,
            hunger: nextHunger,
            age: npc.age + dt * 10,
            efficiency: efficiencyMult
          };
        }).filter(npc => npc.age < npc.lifespan);
    }

    // Pre-group NPCs by building for O(1) production lookup per building
    const npcsByBuilding: Record<string, number> = {};
    updatedNpcs.forEach(n => {
        npcsByBuilding[n.buildingId] = (npcsByBuilding[n.buildingId] || 0) + 1;
    });

    // 2. Resource Consumption
    let foodShortage = false;
    const foodConsumed = updatedNpcs.length * 0.08 * dt; 
    let nextFood = resources.food - foodConsumed;
    if (nextFood < 0) {
      nextFood = 0;
      foodShortage = true;
    }

    let nextGold = resources.gold;
 
    // 4. Update Research
    const updatedTechs = technologies.map(tech => {
      if (tech.isResearching) {
        const nextProgress = tech.progress + (dt / tech.researchTime);
        if (nextProgress >= 1) return { ...tech, progress: 1, isResearching: false, unlocked: true };
        return { ...tech, progress: nextProgress };
      }
      return tech;
    });

    // 5. Update Buildings and Production
    let capacityChanged = false;
    const nextResources = { 
        ...resources, 
        food: nextFood, 
        gold: Math.max(nextGold, 0) 
    };

    const isGoldPayoutTick = tickCount > 0 && tickCount % (60 * 10) === 0;
    const goldNotifications: any[] = [];

    const completedBuildings: string[] = [];

    const updatedBuildings = buildings.map(b => {
      if (b.isConstructing) {
        // Construction speed depends on level: Base 15s * level factor
        const levelFactor = 1 + (b.level * 0.5);
        const nextProgress = Math.min(b.progress + dt * (1 / (15 * levelFactor)) * upgradeSpeedMult, 1);
        if (nextProgress >= 1 && b.progress < 1) {
          capacityChanged = true;
          completedBuildings.push(b.typeId);
        }
        return { ...b, progress: nextProgress, isConstructing: nextProgress < 1, lastUpdate: now };
      }

      const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
      
      const workerCount = npcsByBuilding[b.id] || 0;
      const workforceMult = workerCount > 0 ? 0.8 + (workerCount / (type.npcCount || 1)) * 0.2 : 0.2;

      Object.entries(type.production).forEach(([res, rate]) => {
        const key = res as ResourceType;
        if (key === 'gold') {
           if (isGoldPayoutTick) {
              const amount = rate * 10 * workforceMult * eventMult;
              const prevGold = nextResources.gold;
              nextResources.gold = Math.min(nextResources.gold + amount, maxCapacity.gold);
              const actualGain = nextResources.gold - prevGold;
              if (actualGain >= 1) {
                goldNotifications.push({ id: nanoid(), type: 'gold', amount: actualGain, timestamp: now });
              }
           }
        } else {
           const multiplier = b.level * workforceMult * eventMult;
           nextResources[key] = Math.min(nextResources[key] + rate * multiplier * dt, maxCapacity[key]);
        }
      });

      return b;
    });

    if (goldNotifications.length > 0) {
      set({ resourceNotifications: [...get().resourceNotifications, ...goldNotifications].slice(-10) });
      goldNotifications.forEach(n => {
        setTimeout(() => {
          set((state) => ({
            resourceNotifications: state.resourceNotifications.filter(rn => rn.id !== n.id)
          }));
        }, 2000);
      });
    }

    // Throttled Auto-Sync: Every 2 minutes (120 seconds)
    const shouldAutoSync = tickCount > 0 && tickCount % (60 * 120) === 0; // Assuming 60 ticks per second (approx)
    if (shouldAutoSync) {
        setTimeout(() => get().syncVillage(), 0);
    }

    if (capacityChanged) {
      setTimeout(() => get().recalculateCapacity(), 0);
    }

    // 6. Natural Resource Regeneration (Every 30 seconds)
    let updatedMapObjects = get().mapObjects;
    if (now - lastResourceRegen > 30000) {
      // Regenerate trees/bushes
      if (updatedMapObjects.length < 80) {
        const newObj = generateMapObjects(1, 100)[0];
        updatedMapObjects = [...updatedMapObjects, newObj];
      }
      set({ lastResourceRegen: now });
    }

    const updatedQuests = quests.map(q => {
      if (q.completed) return q;
      let progress = 0;
      switch (q.requirement.type) {
        case 'build':
          progress = updatedBuildings.filter(b => b.typeId === q.requirement.target && !b.isConstructing).length;
          break;
        case 'population':
          progress = updatedNpcs.length;
          break;
        case 'collect':
          progress = nextResources[q.requirement.target as keyof Resources];
          break;
      }
      if (progress >= q.requirement.amount) {
        // Grant reward
        Object.entries(q.reward).forEach(([key, val]) => {
          if (key === 'unlock' && val === 'colonial') set({ era: 'colonial' });
          else if (key !== 'unlock') nextResources[key as keyof Resources] += (val as number);
        });
        return { ...q, completed: true };
      }
      return q;
    });

    // 9. Day/Night & Weather
    const nextTime = (timeOfDay + dt * 0.1) % 24;
    let nextWeather = weather;
    if (Math.random() < 0.001 * dt) {
      const weathers: WeatherType[] = ['sunny', 'windy', 'rainy', 'stormy', 'snowy'];
      nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
    }

    // 11. Handle Combat Units
    const { units, enemyBuildings, combatStatus, battleTimeLeft, army, isReplaying, activeReplay, replayTime, replaySpeed, inventory, researchLevels } = get();
    let combatUpdates = {};
    if (combatStatus === 'attacking') {
      const actualDt = isReplaying ? dt * replaySpeed : dt;
      const nextBattleTime = Math.max(0, battleTimeLeft - actualDt);
      const nextEnemyBuildings = [...enemyBuildings];

      // Calculate global bonuses
      const equipmentDmgBonus = inventory.reduce((sum, item) => sum + (item.bonus.damage || 0), 0);
      const equipmentHpBonus = inventory.reduce((sum, item) => sum + (item.bonus.health || 0), 0);
      const researchDmgMult = 1 + (researchLevels['combat_dmg'] || 0) * 0.1;

      // Replay Logic: Auto-deploy
      if (isReplaying && activeReplay) {
        const nextReplayTime = replayTime + actualDt;
        activeReplay.deployments.forEach(d => {
          if (d.timestamp / 1000 > replayTime && d.timestamp / 1000 <= nextReplayTime) {
            // Deploy!
            const stats = TROOP_TYPES[d.type];
            const newUnit: UnitInstance = {
              id: nanoid(),
              type: d.type,
              position: d.position,
              health: stats.health,
              maxHealth: stats.health,
              targetId: null,
              state: 'idle',
              deployedAt: Date.now()
            };
            units.push(newUnit);
          }
        });
        set({ replayTime: nextReplayTime });
      }

      // Calculate destruction percentage
      const totalInitialBuildings = enemyBuildings.length;
      const destroyedBuildings = enemyBuildings.filter(b => b.health <= 0).length;
      const nextDestruction = Math.floor((destroyedBuildings / totalInitialBuildings) * 100);

      const nextUnits = units.map(u => {
        if (u.health <= 0) return u;

        const stats = TROOP_TYPES[u.type];
        const currentMaxHp = (stats.health + equipmentHpBonus);
        const currentDamage = (stats.damage + equipmentDmgBonus) * researchDmgMult;
        
        // --- DEFENSE ATTACK ON UNITS ---
        // Enemy buildings (defenses) attack units
        nextEnemyBuildings.forEach(eb => {
           if (eb.health <= 0) return;
           const isDefense = eb.typeId === 'barracks' || eb.typeId === 'tower' || eb.typeId === 'mortar';
           if (!isDefense) return;
           
           const dRange = eb.typeId === 'mortar' ? 18 : eb.typeId === 'tower' ? 12 : 5;
           const dDmg = (eb.typeId === 'mortar' ? 40 : eb.typeId === 'tower' ? 20 : 10) * eb.level * actualDt;
           
           const dx = eb.position[0] - u.position[0];
           const dz = eb.position[1] - u.position[1];
           const distSq = dx*dx + dz*dz;
           
           if (distSq < dRange * dRange) {
              u.health -= dDmg;
           }

           // Trap logic: explode and remove itself
           if (eb.typeId === 'trap' && distSq < 4) {
              u.health -= 50; 
              eb.health = 0; // Triggered
           }
        });
        // -------------------------------

        if (u.health <= 0) return u;
        let targetBuilding = nextEnemyBuildings.find(b => b.id === u.targetId && b.health > 0);
        if (!targetBuilding) {
           // Target prioritization
           const potentialTargets = nextEnemyBuildings.filter(eb => eb.health > 0);
           if (potentialTargets.length === 0) return { ...u, state: 'idle' as const };

           // Sort by proximity
           potentialTargets.sort((a, b) => {
              const da = Math.sqrt((a.position[0] - u.position[0])**2 + (a.position[1] - u.position[1])**2);
              const db = Math.sqrt((b.position[0] - u.position[0])**2 + (b.position[1] - u.position[1])**2);
              
              // Priority override
              if (stats.priority === 'defense') {
                 const isADefense = ['barracks', 'tower', 'mortar', 'trap'].includes(a.typeId);
                 const isBDefense = ['barracks', 'tower', 'mortar', 'trap'].includes(b.typeId);
                 if (isADefense && !isBDefense) return -1;
                 if (!isADefense && isBDefense) return 1;
              }
              if (stats.priority === 'resource') {
                 const isARes = ['lumberjack', 'quarry', 'farm', 'market'].includes(a.typeId);
                 const isBRes = ['lumberjack', 'quarry', 'farm', 'market'].includes(b.typeId);
                 if (isARes && !isBRes) return -1;
                 if (!isARes && isBRes) return 1;
              }

              return da - db;
           });

           targetBuilding = potentialTargets[0];
        }

        const dx = targetBuilding.position[0] - u.position[0];
        const dz = targetBuilding.position[1] - u.position[1];
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist > stats.range) {
          const vx = (dx / dist) * stats.speed * actualDt;
          const vz = (dz / dist) * stats.speed * actualDt;
          return {
            ...u,
            targetId: targetBuilding.id,
            position: [u.position[0] + vx, u.position[1] + vz] as [number, number],
            state: 'moving' as const
          };
        } else {
          // Attack!
          const dmg = currentDamage * actualDt;
          const targetIdx = nextEnemyBuildings.findIndex(b => b.id === targetBuilding!.id);
          nextEnemyBuildings[targetIdx] = {
            ...nextEnemyBuildings[targetIdx],
            health: Math.max(0, nextEnemyBuildings[targetIdx].health - dmg)
          };
          return { ...u, targetId: targetBuilding.id, state: 'attacking' as const };
        }
      }).filter(u => u.health > 0);

      // Check end conditions
      const allDestroyed = nextEnemyBuildings.every(b => b.health <= 0);
      const townHallDestroyed = nextEnemyBuildings.some(b => b.typeId === 'townhall' && b.health <= 0);
      const noMoreUnits = nextUnits.length === 0 && Object.values(army).every(v => v === 0);
      const timeOut = nextBattleTime <= 0;

      let finalStatus: CombatStatus = combatStatus;
      if (allDestroyed || townHallDestroyed) finalStatus = 'victory';
      else if (timeOut || noMoreUnits) {
         if (nextDestruction >= 50) finalStatus = 'victory';
         else if (nextDestruction > 0) finalStatus = 'draw';
         else finalStatus = 'defeat';
      }

      if (finalStatus !== 'attacking') {
         // Handle end results
         const { rankedPoints, addSeasonXP, opponentName } = get();
         let gainedPoints = 0;
         let rewardGold = 0;
         let message = "";

         if (finalStatus === 'victory') {
            gainedPoints = 30 + Math.floor(Math.random() * 10);
            rewardGold = 2500;
            addSeasonXP(150);
            message = `VICTORY! You destroyed ${nextDestruction}% of ${opponentName}'s village! Rewards: ${rewardGold} Gold, +${gainedPoints} RP.`;
         } else if (finalStatus === 'draw') {
            gainedPoints = 5;
            rewardGold = 1000;
            message = `DRAW! You destroyed ${nextDestruction}% of ${opponentName}'s village. Rewards: ${rewardGold} Gold, +${gainedPoints} RP.`;
         } else {
            gainedPoints = -15;
            message = `DEFEAT! You failed to breach ${opponentName}'s defenses. -15 RP.`;
         }

         setTimeout(() => {
           if (!get().isReplaying) {
             const { recordedActions, opponentName, enemyBuildings, destructionPercentage, replays } = get();
             const newReplay = {
               id: nanoid(),
               opponentName: opponentName || 'Rival Chief',
               opponentVillage: JSON.parse(JSON.stringify(enemyBuildings.map(b => ({ ...b, health: b.maxHealth })))), // Reset health for replay
               deployments: recordedActions,
               randomSeed: Math.random(),
               result: finalStatus,
               destruction: destructionPercentage,
               date: Date.now()
             };
             set({ replays: [newReplay, ...replays].slice(0, 10) });
           }

           alert(message);
           set({ 
             rankedPoints: Math.max(0, rankedPoints + gainedPoints),
             combatStatus: 'idle',
             viewMode: 'playing',
             units: [],
             isReplaying: false,
             activeReplay: null
           });
           get().syncVillage();
         }, 500);
      }

      combatUpdates = {
        units: nextUnits,
        enemyBuildings: nextEnemyBuildings,
        combatStatus: finalStatus,
        battleTimeLeft: nextBattleTime,
        destructionPercentage: nextDestruction
      };
    }

    set({ 
      buildings: updatedBuildings, 
      npcs: updatedNpcs,
      resources: nextResources, 
      technologies: updatedTechs,
      quests: updatedQuests,
      activeLiveEvents,
      population: updatedNpcs.length,
      weather: nextWeather,
      timeOfDay: nextTime,
      mapObjects: updatedMapObjects,
      ...combatUpdates,
      tickCount: tickCount + 1,
      lastUpdate: now
    });

    // Sub-system periodic ticks
    get().tickShop();

    // Process completed buildings for missions
    completedBuildings.forEach(typeId => {
      get().handleMissionProgress('build', typeId, 1);
    });

    if (capacityChanged) {
      get().recalculateCapacity();
    }
  },

  tickShop: () => {
    const state = get();
    const { dailyShop } = state;
    const now = Date.now();
    const lastResetDate = new Date(dailyShop.lastReset || 0).setHours(0,0,0,0);
    const nowDate = new Date(now).setHours(0,0,0,0);

    if (dailyShop.items.length === 0 || nowDate > lastResetDate) {
      // Small guard to avoid multiple sets in same frame if logic is called twice
      if (dailyShop.items.length === 0 && (state as any)._shopLoading) return;
      (state as any)._shopLoading = true;

      const items: ShopItem[] = [
        { id: 'gold_pack', name: 'Gold Chest', description: 'Immediate gold injection.', type: 'resource', cost: { type: 'wood', amount: 1000 }, value: { type: 'gold', amount: 2000 }, icon: '💰' },
        { id: 'wood_super', name: 'Super Wood', description: 'Lots of wood.', type: 'resource', cost: { type: 'gold', amount: 500 }, value: { type: 'wood', amount: 5000 }, icon: '🌳' },
        { id: 'stone_bulk', name: 'Bulk Stone', description: 'For heavy walls.', type: 'resource', cost: { type: 'gold', amount: 500 }, value: { type: 'stone', amount: 5000 }, icon: '🗿' },
        { id: 'basic_sword', name: 'Steel Sword', description: 'Boosts warrior damage by 5.', type: 'equipment', cost: { type: 'gold', amount: 1500 }, value: { id: 'sword_1', type: 'weapon', name: 'Steel Sword', bonus: { damage: 5 } }, icon: '⚔️' }
      ];
      set({ dailyShop: { items, lastReset: now } });
      setTimeout(() => { (get() as any)._shopLoading = false; }, 100);
    }
  },

  buyShopItem: (item) => {
    const { spendResources, addResource, inventory } = get();
    if (spendResources(item.cost.type === 'gold' ? { gold: item.cost.amount } : { [item.cost.type]: item.cost.amount })) {
      if (item.type === 'resource') {
        addResource(item.value.type, item.value.amount);
      } else if (item.type === 'equipment') {
        set({ inventory: [...inventory, item.value] });
      }
    }
  },

  startReplay: (replay) => {
    set({
      isReplaying: true,
      activeReplay: replay,
      replayTime: 0,
      replaySpeed: 1,
      combatStatus: 'attacking',
      viewMode: 'fighting',
      enemyBuildings: replay.opponentVillage,
      units: [],
      battleTimeLeft: 180,
      destructionPercentage: 0
    });
  },

  stopReplay: () => {
    set({
      isReplaying: false,
      activeReplay: null,
      combatStatus: 'idle',
      viewMode: 'playing'
    });
  },

  startCrafting: (equipment) => {
    const cost = { gold: 500, stone: 200 };
    if (get().spendResources(cost)) {
      const job: CraftingJob = {
        id: nanoid(),
        equipmentId: equipment.id,
        startTime: Date.now(),
        duration: 30000 // 30 seconds for demo
      };
      set({ craftingQueue: [...get().craftingQueue, job] });
    }
  },

  collectCraftedItem: (jobId) => {
    const job = get().craftingQueue.find(j => j.id === jobId);
    if (job && Date.now() - job.startTime >= job.duration) {
      // Find equipment template (simplified)
      const equipment: Equipment = { id: job.equipmentId, name: "Crafted Item", type: 'weapon', bonus: { damage: 2 } };
      set({
        inventory: [...get().inventory, equipment],
        craftingQueue: get().craftingQueue.filter(j => j.id !== jobId)
      });
    }
  },

  researchLaboratory: (researchId) => {
    const { researchLevels } = get();
    const current = researchLevels[researchId] || 0;
    const cost = { gold: (current + 1) * 1000 };
    if (get().spendResources(cost)) {
      set({
        researchLevels: { ...researchLevels, [researchId]: current + 1 }
      });
    }
  },

  tradeMarket: (from, to, amount) => {
    if (get().spendResources({ [from]: amount })) {
      get().addResource(to, Math.floor(amount * 0.4));
    }
  }
}));
