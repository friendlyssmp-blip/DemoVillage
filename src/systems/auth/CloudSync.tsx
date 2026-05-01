import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useGameStore } from '../../store/useGameStore';
import { villageService } from '../../services/villageService';

export function CloudSync() {
  const { setUser, user } = useGameStore();

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          isVerified: authUser.emailVerified
        });
      } else {
        setUser({
          uid: null,
          email: null,
          isVerified: false,
          profile: null
        });
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  // 1.1 Profile Listener
  useEffect(() => {
    if (!user.uid) return;

    const profilePath = `profiles/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, profilePath), (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data() as any;
        setUser({ profile });
        useGameStore.setState({
          playerName: profile.username,
          villageName: profile.villageName
        });
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, profilePath);
      }
    });

    return () => unsubscribe();
  }, [user.uid, setUser]);

  // 2. Data Loader
  useEffect(() => {
    if (!user.uid || !user.profile) return;

    const villagePath = `villages/${user.uid}`;
    const rewardPath = `users/${user.uid}/dailyRewards/state`;
    
    // 2. Load Data with Backup Fallback
    villageService.loadVillageData(user.uid).then(async (docData) => {
      if (docData) {
        let activeSnapshot = docData.latest;

        const validate = (snap: any) => {
           if (!snap) return false;
           if (!snap.resources || !snap.buildings) return false;
           return true; 
        };

        if (!validate(activeSnapshot)) {
           console.warn("[BACKUP] Latest save corrupted or missing. Attempting fallback...");
           activeSnapshot = docData.fallback;
        }

        if (validate(activeSnapshot)) {
          const data = activeSnapshot;
          useGameStore.setState({
            playerName: data.playerName || 'Chief',
            villageName: data.villageName || 'New Village',
            resources: data.resources,
            maxCapacity: data.maxCapacity,
            buildings: Array.isArray(data.buildings) ? data.buildings : [],
            npcs: Array.isArray(data.npcs) ? data.npcs : [],
            mapObjects: Array.isArray(data.mapObjects) ? data.mapObjects : [],
            technologies: Array.isArray(data.technologies) ? data.technologies : [],
            quests: Array.isArray(data.quests) ? data.quests : [],
            activeLiveEvents: Array.isArray(data.activeLiveEvents) ? data.activeLiveEvents : [],
            unlockedZones: Array.isArray(data.unlockedZones) ? data.unlockedZones : ['core'],
            era: data.era || 'primal',
            weather: data.weather || 'sunny',
            timeOfDay: data.timeOfDay || 12,
            population: data.population || 0,
            tutorialStep: data.tutorialStep || 0,
            lastResourceRegen: data.lastResourceRegen || Date.now(),
            lastActive: data.lastActive || Date.now(),
            rankedPoints: data.rankedPoints || 0,
            rankTier: data.rankTier || 'Bronze',
            army: data.army || { warrior: 0, archer: 0, tank: 0, scout: 0 },
            inventory: Array.isArray(data.inventory) ? data.inventory : [],
            craftingQueue: Array.isArray(data.craftingQueue) ? data.craftingQueue : [],
            researchLevels: data.researchLevels || {},
            settings: data.settings || useGameStore.getState().settings
          });
          
          if (activeSnapshot === docData.fallback) {
             alert("System: Previous backup restored successfully.");
          }
        }
      } else {
        const state = useGameStore.getState();
        villageService.createInitialVillage(user.uid, user.profile, state).catch(err => {
          if (auth.currentUser) {
            handleFirestoreError(err, OperationType.CREATE, villagePath);
          }
        });
      }
    }).catch(error => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, villagePath);
      }
    });

    // Listen to rewards
    const unsubRewards = onSnapshot(doc(db, rewardPath), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        useGameStore.setState({
          dailyRewardStreak: data.streak || 0,
          lastDailyClaim: data.lastClaimed || 0,
        });
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, rewardPath);
      }
    });

    return () => {
      unsubRewards();
    };
  }, [user.uid, user.profile]);

  // 3. Periodic Saver
  useEffect(() => {
    if (!user.uid || !user.profile) return;

    const saveInterval = setInterval(() => {
      const state = useGameStore.getState();
      state.syncVillage();
    }, 60000); // Every 60 seconds (Auto-backup)

    return () => clearInterval(saveInterval);
  }, [user.uid, user.profile]);

  return null;
}
