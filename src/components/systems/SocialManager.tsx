/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useGameStore } from '../../store/useGameStore';
import { socialService, chatService } from '../../services/socialService';

export function SocialManager() {
  const { user, setUser } = useGameStore();

  useEffect(() => {
    if (!user.uid) return;

    // Subscribe to Profile (for clan updates etc)
    const profilePath = `profiles/${user.uid}`;
    const unsubProfile = onSnapshot(doc(db, profilePath), (snap) => {
      if (snap.exists()) {
        const profile = snap.data();
        useGameStore.setState(state => ({
          user: { ...state.user, profile: profile as any }
        }));

        if (profile.clanId) {
           const clanPath = `clans/${profile.clanId}`;
           // Fetch clan details if not already in state or if changed
           onSnapshot(doc(db, clanPath), (clanSnap) => {
             if (clanSnap.exists()) {
               useGameStore.setState({ activeClan: { id: clanSnap.id, ...clanSnap.data() } as any });
             }
           }, (error) => handleFirestoreError(error, OperationType.GET, clanPath));
        } else {
           useGameStore.setState({ activeClan: null });
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, profilePath));

    // Subscribe to Friends
    const friendsPath = `users/${user.uid}/friends`;
    const unsubFriends = socialService.subscribeToFriends(user.uid, (friends) => {
      useGameStore.setState({ friends });
    }, (error) => handleFirestoreError(error, OperationType.LIST, friendsPath));

    // Subscribe to Friend Requests
    const reqsPath = `users/${user.uid}/friendRequests`;
    const unsubReqs = socialService.subscribeToRequests(user.uid, (friendRequests) => {
      useGameStore.setState({ friendRequests });
    }, (error) => handleFirestoreError(error, OperationType.LIST, reqsPath));

    // Subscribe to Global Chat
    const chatPath = `chats/global/messages`;
    const unsubChat = chatService.subscribeToGlobalChat((globalChat) => {
      useGameStore.setState({ globalChat });
    }, (error) => handleFirestoreError(error, OperationType.LIST, chatPath));

    return () => {
      unsubProfile();
      unsubFriends();
      unsubReqs();
      unsubChat();
    };
  }, [user.uid]);

  return null;
}
