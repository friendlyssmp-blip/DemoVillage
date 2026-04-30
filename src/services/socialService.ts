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
import { UserProfile, FriendRequest, ChatMessage } from '../types';

export const socialService = {
  // Search for users
  async searchUsers(username: string) {
    const q = query(
      collection(db, 'profiles'),
      where('username', '>=', username),
      where('username', '<=', username + '\uf8ff'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile & { uid: string }));
  },

  // Friends & Requests
  async sendFriendRequest(toUserId: string, toName: string, fromName: string) {
    const fromId = auth.currentUser?.uid;
    if (!fromId) return;

    const reqId = `${fromId}_${toUserId}`;
    await setDoc(doc(db, `users/${toUserId}/friendRequests`, reqId), {
      fromId,
      fromName,
      toId: toUserId,
      status: 'pending',
      timestamp: Date.now()
    });
  },

  async respondToFriendRequest(requestId: string, status: 'accepted' | 'declined', requestBody: FriendRequest) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const batch = writeBatch(db);
    
    if (status === 'accepted') {
      // 1. Add to recipient's friends list
      batch.set(doc(db, `users/${userId}/friends`, requestBody.fromId), {
        uid: requestBody.fromId,
        username: requestBody.fromName,
        joinedAt: Date.now()
      });
      
      // 2. Add to sender's friends list (since friendship is mutual in this design)
      batch.set(doc(db, `users/${requestBody.fromId}/friends`, userId), {
        uid: userId,
        // we'd ideally pass our name here too or fetch it
        joinedAt: Date.now()
      });
    }

    // 3. Remove the request
    batch.delete(doc(db, `users/${userId}/friendRequests`, requestId));
    
    await batch.commit();
  },

  async removeFriend(friendId: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const batch = writeBatch(db);
    batch.delete(doc(db, `users/${userId}/friends`, friendId));
    batch.delete(doc(db, `users/${friendId}/friends`, userId));
    await batch.commit();
  },

  subscribeToFriends(userId: string, callback: (friends: any[]) => void, onError?: (error: any) => void) {
    return onSnapshot(collection(db, `users/${userId}/friends`), (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, onError);
  },

  subscribeToRequests(userId: string, callback: (requests: any[]) => void, onError?: (error: any) => void) {
    return onSnapshot(collection(db, `users/${userId}/friendRequests`), (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, onError);
  }
};

export const chatService = {
  async sendGlobalMessage(text: string, senderName: string) {
    const user = auth.currentUser;
    if (!user) return;

    const msgId = Date.now().toString();
    await setDoc(doc(db, 'chats/global/messages', msgId), {
      senderId: user.uid,
      senderName,
      text,
      timestamp: Date.now(),
      type: 'global'
    });
  },

  subscribeToGlobalChat(callback: (messages: ChatMessage[]) => void, onError?: (error: any) => void) {
    const q = query(
      collection(db, 'chats/global/messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse();
      callback(msgs);
    }, onError);
  },

  async sendClanMessage(clanId: string, text: string, senderName: string) {
    const user = auth.currentUser;
    if (!user) return;

    const msgId = Date.now().toString();
    await setDoc(doc(db, `clans/${clanId}/messages`, msgId), {
      senderId: user.uid,
      senderName,
      text,
      timestamp: Date.now(),
      type: 'clan'
    });
  },

  subscribeToClanChat(clanId: string, callback: (messages: ChatMessage[]) => void, onError?: (error: any) => void) {
    const q = query(
      collection(db, `clans/${clanId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse();
      callback(msgs);
    }, onError);
  }
};
