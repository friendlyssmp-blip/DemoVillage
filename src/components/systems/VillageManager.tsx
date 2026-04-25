/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { useGameStore } from '../../store/useGameStore';
import { rewardService } from '../../services/rewardService';

export function VillageManager() {
  const { calculateOfflineProgress, recalculateCapacity } = useGameStore();

  useEffect(() => {
    // Initial capacity calculation
    recalculateCapacity();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        calculateOfflineProgress();
        recalculateCapacity();
      }
    });

    return () => unsubscribe();
  }, [calculateOfflineProgress]);

  return null;
}
