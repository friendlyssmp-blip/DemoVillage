/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export const rewardService = {
  async getDailyState() {
    const user = auth.currentUser;
    if (!user) return null;

    const snap = await getDoc(doc(db, `users/${user.uid}/dailyRewards`, 'state'));
    if (snap.exists()) {
      return snap.data();
    }
    return { streak: 0, lastClaimed: 0 };
  },

  async claimDaily(streak: number) {
    const user = auth.currentUser;
    if (!user) return;

    const now = Date.now();
    await setDoc(doc(db, `users/${user.uid}/dailyRewards`, 'state'), {
      streak: streak + 1,
      lastClaimed: now
    });

    // Returns the reward amounts based on streak
    const rewards = [
        { wood: 100, stone: 50 },
        { wood: 200, stone: 100, gold: 50 },
        { wood: 400, stone: 200, gold: 150 },
        { wood: 800, stone: 400, gold: 300 },
        { wood: 1500, stone: 800, gold: 600 },
        { wood: 3000, stone: 1500, gold: 1200 },
        { wood: 10000, stone: 5000, gold: 5000, special: 'Bronze Chest' }
    ];

    return rewards[streak % 7];
  }
};
