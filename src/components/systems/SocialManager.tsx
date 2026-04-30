/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useShallow } from 'zustand/react/shallow';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useGameStore } from '../../store/useGameStore';
import { socialService, chatService } from '../../services/socialService';
import { clanService } from '../../services/clanService';

export function SocialManager() {
  const { user, setUser } = useGameStore(useShallow(s => ({
    user: s.user,
    setUser: s.setUser
  })));

  useEffect(() => {
    if (!user.uid) return;

    let unsubClan: (() => void) | null = null;

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
           if (unsubClan) unsubClan();
           unsubClan = onSnapshot(doc(db, clanPath), (clanSnap) => {
             if (clanSnap.exists()) {
               useGameStore.setState({ activeClan: { id: clanSnap.id, ...clanSnap.data() } as any });
             }
           }, (error) => {
             // Only report if we still have a uid (not logging out)
             if (auth.currentUser) {
               handleFirestoreError(error, OperationType.GET, clanPath);
             }
           });

           // Subscribe to Clan Members
           const unsubMembers = clanService.subscribeToClanMembers(profile.clanId, (clanMembers) => {
              const fetchMemberProfiles = async () => {
                const membersWithProfiles = await Promise.all(clanMembers.map(async (m) => {
                   try {
                     const pSnap = await getDoc(doc(db, 'profiles', m.uid));
                     return { ...m, ...pSnap.data() };
                   } catch (e) {
                     return m;
                   }
                }));
                useGameStore.setState({ clanMembers: membersWithProfiles });
              };
              fetchMemberProfiles();
           });

           const baseUnsubClan = unsubClan;
           unsubClan = () => {
             baseUnsubClan?.();
             unsubMembers();
           };
        } else {
           if (unsubClan) unsubClan();
           unsubClan = null;
           useGameStore.setState({ activeClan: null });
        }
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, profilePath);
      }
    });

    // Subscribe to Friends
    const friendsPath = `users/${user.uid}/friends`;
    const unsubFriends = socialService.subscribeToFriends(user.uid, (friends) => {
      useGameStore.setState({ friends });
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, friendsPath);
      }
    });

    // Subscribe to Friend Requests
    const reqsPath = `users/${user.uid}/friendRequests`;
    const unsubReqs = socialService.subscribeToRequests(user.uid, (friendRequests) => {
      useGameStore.setState({ friendRequests });
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, reqsPath);
      }
    });

    // Subscribe to Global Chat
    const chatPath = `chats/global/messages`;
    const unsubChat = chatService.subscribeToGlobalChat((globalChat) => {
      useGameStore.setState({ globalChat });
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, chatPath);
      }
    });

    let unsubClanChat: (() => void) | null = null;
    if (user.profile?.clanId) {
       const clanChatPath = `clans/${user.profile.clanId}/messages`;
       unsubClanChat = chatService.subscribeToClanChat(user.profile.clanId, (clanChat) => {
         useGameStore.setState({ clanChat });
       }, (error) => {
         if (auth.currentUser) {
           handleFirestoreError(error, OperationType.LIST, clanChatPath);
         }
       });
    }

    return () => {
      unsubProfile();
      if (unsubClan) unsubClan();
      unsubFriends();
      unsubReqs();
      unsubChat();
      if (unsubClanChat) unsubClanChat();
    };
  }, [user.uid, user.profile?.clanId]);

  return null;
}
