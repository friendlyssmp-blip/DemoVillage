import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGameStore } from '../store/useGameStore';

export const villageService = {
  async saveVillage(userId: string, villageData: any) {
    if (!userId) return;
    
    const docRef = doc(db, 'villages', userId);
    await setDoc(docRef, {
      ...villageData,
      lastSynced: serverTimestamp(),
      userId
    }, { merge: true });
  },

  async loadVillage(userId: string) {
    if (!userId) return null;
    const docRef = doc(db, 'villages', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  },

  async resetVillage(userId: string) {
    if (!userId) return;
    const docRef = doc(db, 'villages', userId);
    await setDoc(docRef, {
      userId,
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
  },

  async createInitialVillage(userId: string, profile: any, state: any) {
    const docRef = doc(db, 'villages', userId);
    await setDoc(docRef, {
      userId,
      username: profile.username,
      villageName: profile.villageName,
      resources: state.resources,
      maxCapacity: state.maxCapacity,
      buildings: state.buildings,
      npcs: state.npcs,
      mapObjects: state.mapObjects,
      technologies: state.technologies,
      quests: state.quests,
      activeLiveEvents: state.activeLiveEvents,
      unlockedZones: state.unlockedZones,
      era: state.era,
      weather: state.weather,
      timeOfDay: state.timeOfDay,
      population: state.population,
      gridSize: state.gridSize,
      tutorialStep: state.tutorialStep,
      lastResourceRegen: state.lastResourceRegen,
      lastSynced: serverTimestamp(),
      lastActive: Date.now()
    });
  },

  async loadVillageData(userId: string) {
    const docRef = doc(db, 'villages', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data();
  }
};
