import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useGameStore } from '../../store/useGameStore';
import { GameState } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firebase';

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
    
    // Listen to village (One-time fetch instead of onSnapshot to prevent fighting)
    getDoc(doc(db, villagePath)).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        useGameStore.setState({
          playerName: data.username || 'Chief',
          villageName: data.villageName || 'New Village',
          resources: data.resources || { wood: 400, stone: 200, food: 400, gold: 1000 },
          maxCapacity: data.maxCapacity || { wood: 1000, stone: 1000, food: 1000, gold: 5000 },
          buildings: data.buildings || [],
          npcs: data.npcs || [],
          mapObjects: data.mapObjects || [],
          technologies: data.technologies || [],
          quests: data.quests,
          activeLiveEvents: data.activeLiveEvents || [],
          unlockedZones: data.unlockedZones || ['core'],
          era: data.era || 'primal',
          weather: data.weather || 'sunny',
          timeOfDay: data.timeOfDay || 12,
          population: data.population || 0,
          gridSize: data.gridSize || 30,
          tutorialStep: data.tutorialStep || 0,
          lastResourceRegen: data.lastResourceRegen || Date.now(),
          lastActive: data.lastActive || Date.now()
        });
      } else {
        // First time user? Save initial state ONLY IF profile is available
        const state = useGameStore.getState();
        setDoc(doc(db, villagePath), {
          userId: user.uid,
          username: user.profile?.username,
          villageName: user.profile?.villageName,
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
        }).catch(err => {
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
      const villagePath = `villages/${user.uid}`;
      const rewardPath = `users/${user.uid}/dailyRewards/state`;
      const state = useGameStore.getState();
      
      // Save village
      setDoc(doc(db, villagePath), {
        userId: user.uid,
        username: user.profile?.username,
        villageName: user.profile?.villageName,
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
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.UPDATE, villagePath));

      // Save rewards
      setDoc(doc(db, rewardPath), {
        streak: state.dailyRewardStreak,
        lastClaimed: state.lastDailyClaim,
        updatedAt: Date.now()
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.UPDATE, rewardPath));
    }, 15000); // Every 15 seconds

    return () => clearInterval(saveInterval);
  }, [user.uid, user.profile]);

  return null;
}
