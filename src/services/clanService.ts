/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  query, where, getDocs, onSnapshot, writeBatch,
  serverTimestamp, increment, getDoc, orderBy, limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Clan, UserProfile } from '../types';
import { nanoid } from 'nanoid';

export const clanService = {
  async createClan(name: string, description: string, emblem: string) {
    const user = auth.currentUser;
    if (!user) return;

    const clanId = nanoid();
    const batch = writeBatch(db);

    const clanData = {
      id: clanId,
      name,
      description,
      emblem,
      leaderId: user.uid,
      memberCount: 1,
      points: 0,
      type: 'open'
    };

    batch.set(doc(db, 'clans', clanId), clanData);
    
    // Add creator as leader member
    batch.set(doc(db, `clans/${clanId}/members`, user.uid), {
      uid: user.uid,
      role: 'leader',
      joinedAt: Date.now()
    });

    // Update user's profile with clan info
    batch.update(doc(db, 'profiles', user.uid), {
      clanId,
      clanName: name
    });

    await batch.commit();
    return clanId;
  },

  async joinClan(clanId: string, clanName: string) {
    const user = auth.currentUser;
    if (!user) return;

    const batch = writeBatch(db);
    
    batch.set(doc(db, `clans/${clanId}/members`, user.uid), {
      uid: user.uid,
      role: 'member',
      joinedAt: Date.now()
    });

    batch.update(doc(db, 'clans', clanId), {
      memberCount: increment(1)
    });

    batch.update(doc(db, 'profiles', user.uid), {
      clanId,
      clanName
    });

    await batch.commit();
  },

  async promoteMember(clanId: string, memberId: string, role: string) {
    await updateDoc(doc(db, `clans/${clanId}/members`, memberId), {
      role
    });
  },

  async kickMember(clanId: string, memberId: string) {
    const batch = writeBatch(db);
    batch.delete(doc(db, `clans/${clanId}/members`, memberId));
    batch.update(doc(db, 'clans', clanId), {
      memberCount: increment(-1)
    });
    batch.update(doc(db, 'profiles', memberId), {
      clanId: null,
      clanName: null
    });
    await batch.commit();
  },

  async leaveClan(clanId: string) {
    const user = auth.currentUser;
    if (!user) return;

    const batch = writeBatch(db);
    batch.delete(doc(db, `clans/${clanId}/members`, user.uid));
    batch.update(doc(db, 'clans', clanId), {
      memberCount: increment(-1)
    });
    batch.update(doc(db, 'profiles', user.uid), {
      clanId: null,
      clanName: null
    });
    await batch.commit();
  },

  async getClans() {
    const q = query(collection(db, 'clans'), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Clan);
  },

  subscribeToClanMembers(clanId: string, callback: (members: any[]) => void) {
    return onSnapshot(collection(db, `clans/${clanId}/members`), (snap) => {
      callback(snap.docs.map(d => d.data()));
    });
  }
};
