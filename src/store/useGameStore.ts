import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { 
  GameState, BuildingInstance, ResourceType, Resources, 
  NPCInstance, WeatherType, BuildingType, MapObject,
  Technology, Quest, Zone, WorldEvent, ViewMode, LeaderboardEntry, OfflineSummary,
  UnitInstance, CombatStatus
} from '../types';
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs, 
  limit, serverTimestamp, updateDoc, increment, arrayUnion, Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

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
  syncVillage: () => Promise<void>;
  saveProgress: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  updateCamera: (pos: [number, number, number]) => void;
  startMatchmaking: () => void;
  cancelMatchmaking: () => void;
  deployUnit: (type: 'soldier' | 'archer' | 'heavy', position: [number, number]) => void;
  setCombatUnit: (type: 'soldier' | 'archer' | 'heavy') => void;
  setUser: (user: Partial<GameState['user']>) => void;
  recalculateCapacity: () => void;
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
  activeEvents: [],
  unlockedZones: ['core'],
  era: 'primal',
  population: 0,
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
    uiScale: 1.0
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
  selectedCombatUnit: 'soldier',

  // Social & Multiplayer
  clans: [],
  activeClan: null,
  friends: [],
  friendRequests: [],
  globalChat: [],
  clanChat: [],
  dailyRewardStreak: 0,
  lastDailyClaim: 0,
  tickCount: 0,
  lastUpdate: Date.now(),

  startMatchmaking: async () => {
    set({ 
       combatStatus: 'searching', 
       viewMode: 'fighting', 
       units: [], 
       selectedCombatUnit: 'soldier',
       matchmakingQueueStartTime: Date.now() 
    });

    try {
      const { user, buildings, npcs } = get();
      const currentPower = buildings.length * 100 + buildings.reduce((sum, b) => sum + b.level, 0) * 50 + npcs.length * 10;
      
      // Real competitive matchmaking: Find players within a power score range
      // and who have been active recently.
      const playersRef = collection(db, 'villages');
      const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterday = Timestamp.fromDate(yesterdayDate);
      
      const q = query(
        playersRef, 
        where('lastSynced', '>=', yesterday),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const candidates = querySnapshot.docs
        .filter(doc => doc.id !== user.uid)
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(p => {
          // Allow +/- 30% power score variance for a match
          const diff = Math.abs(p.powerScore - currentPower);
          return (diff / Math.max(1, currentPower)) < 0.4;
        });

      // Simulation of "waiting" for better immersion and actual search time
      const waitTime = Math.random() * 2000 + 1000;
      await new Promise(r => setTimeout(r, waitTime));

      if (candidates.length > 0) {
        // Pick the closest match by power score
        candidates.sort((a, b) => Math.abs(a.powerScore - currentPower) - Math.abs(b.powerScore - currentPower));
        const opponent = candidates[0];
        
        const enemyBuildings = opponent.buildings.map((b: any) => ({
          ...b,
          id: `enemy-${b.id}`,
          health: 500 * (b.level || 1),
          maxHealth: 500 * (b.level || 1),
        }));

        set({ 
          enemyBuildings, 
          opponentName: opponent.playerName || 'Rival Chief',
          combatStatus: 'attacking',
          matchmakingQueueStartTime: null
        });
      } else {
        set({ combatStatus: 'idle', viewMode: 'playing', matchmakingQueueStartTime: null });
        alert('No suitable real opponents found. Stay training and try again later!');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'villages');
      set({ combatStatus: 'idle', viewMode: 'playing', matchmakingQueueStartTime: null });
    }
  },

  cancelMatchmaking: () => set({ combatStatus: 'idle', viewMode: 'playing', matchmakingQueueStartTime: null }),

  deployUnit: (type: 'soldier' | 'archer' | 'heavy', position: [number, number]) => {
    const { units } = get();
    const newUnit: UnitInstance = {
      id: Math.random().toString(),
      type,
      position,
      health: type === 'heavy' ? 200 : 100,
      maxHealth: type === 'heavy' ? 200 : 100,
      level: 1,
      state: 'idle',
    };
    set({ units: [...units, newUnit] });
  },

  setCombatUnit: (selectedCombatUnit) => set({ selectedCombatUnit }),
  
  setUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),

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
    const { lastActive, buildings, resources, maxCapacity, npcs, technologies } = get();
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
    const { user, buildings, resources, era, villageName, playerName, npcs, unlockedZones, technologies, rankedPoints, rankTier } = get();
    if (!user.uid) return;

    const powerScore = buildings.length * 100 + buildings.reduce((sum, b) => sum + b.level, 0) * 50 + npcs.length * 10;

    try {
      await setDoc(doc(db, 'villages', user.uid), {
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
        lastSynced: serverTimestamp(),
        level: buildings.reduce((sum, b) => sum + (b.isConstructing ? 0 : b.level), 0),
        powerScore: powerScore
      }, { merge: true });
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        console.warn('Sync failed: Permission denied. Ensure you are logged in correctly.');
      } else {
        console.error('Failed to sync village:', err);
      }
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
    const { resources, maxCapacity, syncVillage } = get();
    const newAmount = Math.min(resources[type] + amount, maxCapacity[type]);
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: newAmount
      }
    }));
    // Sync critical resources immediately
    if (type === 'gold') syncVillage();
  },

  spendResources: (cost) => {
    const { resources, syncVillage } = get();
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
    const { npcs } = get();
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
    set(state => ({ npcs: [...state.npcs, ...newNpcs] }));
  },

  placeBuilding: (typeId, position) => {
    const type = BUILDING_TYPES[typeId as keyof typeof BUILDING_TYPES];
    const { tutorialStep, checkPlacement, unlockedZones } = get();
    
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
      npcs: state.npcs.map(npc => 
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
        .map(b => b.id === idA ? { ...b, level: b.level * 2, progress: 0, isConstructing: true } : b),
      npcs: state.npcs.filter(npc => npc.buildingId !== idB),
      selectedBuildingId: idA,
      movingBuildingId: null
    }));

    // Add extra NPCs for the new level
    const type = BUILDING_TYPES[bA.typeId as keyof typeof BUILDING_TYPES];
    addNpcsToBuilding(idA, type.npcCount * (bA.level), bA.typeId, bA.position);
  },

  upgradeBuilding: (id) => {
    const { buildings, addNpcsToBuilding, resources, spendResources } = get();
    const b = buildings.find(item => item.id === id);
    if (!b || b.isConstructing) return; 

    const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
    const cost = {
      wood: (type.cost.wood || 0) * b.level,
      stone: (type.cost.stone || 0) * b.level,
      gold: (type.cost.gold || 0) * b.level,
    };

    if (spendResources(cost)) {
      set((state) => ({
        buildings: state.buildings.map(bi => 
          bi.id === id ? { ...bi, level: bi.level * 2, progress: 0, isConstructing: true } : bi
        )
      }));
      // Add extra NPCs (Lv1->Lv2 adds Lv1's worth of NPCs)
      addNpcsToBuilding(id, type.npcCount * b.level, b.typeId, b.position);
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
      buildings, resources, maxCapacity, npcs, weather, timeOfDay, 
      technologies, quests, lastResourceRegen, activeEvents, era 
    } = get();
    const dt = delta / 1000;
    const now = Date.now();

    // PERFORMANCE: Calculate fixed bonuses once per tick
    const techEfficiencyBonus = technologies
        .filter(t => t.unlocked && t.effect.type === 'efficiency')
        .reduce((sum, t) => sum + t.effect.value, 0);

    const eventMult = activeEvents.reduce((acc, e) => acc * e.multiplier, 1);

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

    const updatedBuildings = buildings.map(b => {
      if (b.isConstructing) {
        const nextProgress = Math.min(b.progress + dt * (1 / 15), 1);
        if (nextProgress >= 1) capacityChanged = true;
        return { ...b, progress: nextProgress, isConstructing: nextProgress < 1, lastUpdate: now };
      }

      const type = BUILDING_TYPES[b.typeId as keyof typeof BUILDING_TYPES];
      
      const workerCount = npcsByBuilding[b.id] || 0;
      const workforceMult = workerCount > 0 ? 0.8 + (workerCount / (type.npcCount || 1)) * 0.2 : 0.2;

      Object.entries(type.production).forEach(([res, rate]) => {
        const key = res as ResourceType;
        const multiplier = b.level * workforceMult * eventMult;
        nextResources[key] = Math.min(nextResources[key] + rate * multiplier * dt, maxCapacity[key]);
      });

      return b;
    });

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

    // 8. Event Management
    let nextEvents = activeEvents.filter(e => now - e.startTime < e.duration * 1000);
    if (Math.random() < 0.0005 * dt && nextEvents.length === 0) {
      const newEvent: WorldEvent = {
        id: nanoid(),
        name: 'Bountiful Harvest',
        description: 'Resource gathering is 50% more effective!',
        type: 'boom',
        duration: 60,
        startTime: now,
        multiplier: 1.5
      };
      nextEvents.push(newEvent);
    }

    // 9. Day/Night & Weather
    const nextTime = (timeOfDay + dt * 0.1) % 24;
    let nextWeather = weather;
    if (Math.random() < 0.001 * dt) {
      const weathers: WeatherType[] = ['sunny', 'windy', 'rainy', 'stormy', 'snowy'];
      nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
    }

    // 11. Handle Combat Units
    const { units, enemyBuildings, combatStatus } = get();
    let combatUpdates = {};
    if (combatStatus === 'attacking' && units.length > 0) {
      const nextEnemyBuildings = [...enemyBuildings];
      const nextUnits = units.map(u => {
        if (u.health <= 0) return u;

        const targets = nextEnemyBuildings.filter(eb => eb.health > 0);
        if (targets.length === 0) return { ...u, state: 'idle' as const };

        let nearestIdx = -1;
        let minDist = Infinity;
        targets.forEach((t, idx) => {
          const dx = t.position[0] - u.position[0];
          const dz = t.position[1] - u.position[1];
          const dist = Math.sqrt(dx*dx + dz*dz);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = nextEnemyBuildings.indexOf(t);
          }
        });

        if (minDist > 2) {
          const nearest = nextEnemyBuildings[nearestIdx];
          const dx = nearest.position[0] - u.position[0];
          const dz = nearest.position[1] - u.position[1];
          const vx = (dx / minDist) * 2 * dt;
          const vz = (dz / minDist) * 2 * dt;
          return {
            ...u,
            position: [u.position[0] + vx, u.position[1] + vz] as [number, number],
            state: 'moving' as const
          };
        } else {
          // Attack!
          const dmg = 15 * dt * (u.type === 'heavy' ? 2 : 1);
          nextEnemyBuildings[nearestIdx] = {
            ...nextEnemyBuildings[nearestIdx],
            health: Math.max(0, (nextEnemyBuildings[nearestIdx].health || 0) - dmg)
          };
          return { ...u, state: 'attacking' as const };
        }
      }).filter(u => u.health > 0);

      const townhall = nextEnemyBuildings.find(eb => eb.typeId === 'townhall');
      let nextStatus: CombatStatus = combatStatus;
      if (townhall && townhall.health <= 0) {
        nextStatus = 'victory';
        // Multiplier Reward for real victory
        const { rankedPoints } = get();
        const gainedPoints = 25 + Math.floor(Math.random() * 10);
        const newPoints = rankedPoints + gainedPoints;
        
        // Calculate new tier
        let nextTier: any = 'Bronze';
        if (newPoints >= 2500) nextTier = 'Elite';
        else if (newPoints >= 2000) nextTier = 'Diamond';
        else if (newPoints >= 1500) nextTier = 'Platinum';
        else if (newPoints >= 1000) nextTier = 'Gold';
        else if (newPoints >= 500) nextTier = 'Silver';

        nextResources.gold += 2000;
        nextResources.wood += 500;

        setTimeout(() => {
          alert(`VICTORY! You have conquered ${get().opponentName}'s village! Rewards: 2000 Gold, 500 Wood, +${gainedPoints} RP.`);
          set({ rankedPoints: newPoints, rankTier: nextTier });
          get().syncVillage();
          set({ combatStatus: 'idle', viewMode: 'playing' });
        }, 100);
      } else if (nextUnits.length === 0 && units.length > 0) {
        nextStatus = 'defeat';
        const { rankedPoints } = get();
        const lostPoints = 15;
        const newPoints = Math.max(0, rankedPoints - lostPoints);
        
        setTimeout(() => {
          alert(`DEFEAT! Your forces were repelled by ${get().opponentName}. -${lostPoints} RP.`);
          set({ rankedPoints: newPoints });
          get().syncVillage();
          set({ combatStatus: 'idle', viewMode: 'playing' });
        }, 100);
      }

      combatUpdates = {
        units: nextUnits,
        enemyBuildings: nextEnemyBuildings,
        combatStatus: nextStatus
      };
    }

    set({ 
      buildings: updatedBuildings, 
      npcs: updatedNpcs,
      resources: nextResources, 
      technologies: updatedTechs,
      quests: updatedQuests,
      activeEvents: nextEvents,
      population: updatedNpcs.length,
      weather: nextWeather,
      timeOfDay: nextTime,
      mapObjects: updatedMapObjects,
      ...combatUpdates,
      tickCount: tickCount + 1,
      lastUpdate: now
    });
  }
}));
