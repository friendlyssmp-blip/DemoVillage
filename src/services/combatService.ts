import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGameStore } from '../store/useGameStore';

export const combatService = {
  async findOpponent(userId: string | null, currentPower: number) {
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
      .filter(doc => doc.id !== userId)
      .map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data };
      })
      .filter((p: any) => p.latest && p.latest.buildings)
      .filter((p: any) => {
        const pPower = p.powerScore || 0;
        const diff = Math.abs(pPower - currentPower);
        return (diff / Math.max(1, currentPower)) < 1.5;
      });

    if (candidates.length === 0) return null;

    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  async fetchLeaderboard() {
    const villagesRef = collection(db, 'villages');
    const q = query(villagesRef, where('rankedPoints', '>', 0), limit(50));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: doc.id,
        name: data.playerName || 'Unnamed Chief',
        gold: data.resources?.gold || 0,
        population: data.npcsCount || 0,
        level: data.level || 1,
        rank: 0,
        points: data.rankedPoints || 0,
        powerScore: data.powerScore || 0
      };
    });
  },

  async reportBattleResult(result: any) {
    try {
      await fetch('/api/combat/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    } catch (err) {
      console.error('Failed to report battle result:', err);
    }
  }
};
