import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useGameStore } from '../store/useGameStore';
import { handleFirestoreError, OperationType } from '../lib/firebase';

export const authService = {
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  async checkUsernameUnique(username: string): Promise<boolean> {
    const docRef = doc(db, 'usernames', username.toLowerCase());
    try {
      const docSnap = await getDoc(docRef);
      return !docSnap.exists();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `usernames/${username.toLowerCase()}`);
      return false;
    }
  },

  async register(email: string, password: string, username: string) {
    const isUnique = await this.checkUsernameUnique(username);
    if (!isUnique) {
      throw new Error('Username is already taken');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return user;
  },

  async finalizeProfile(username: string, villageName: string) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to create a profile');
    }

    const batch = writeBatch(db);
    
    // 1. Claim username (LOWERCASE)
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    batch.set(usernameRef, { uid: user.uid });

    // 2. Create profile
    const profileRef = doc(db, 'profiles', user.uid);
    batch.set(profileRef, {
      username,
      villageName,
      level: 1,
      joinedAt: Date.now()
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${user.uid}`);
    }
  },

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout() {
    await signOut(auth);
  },

  async reloadUser() {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser;
    }
    return null;
  },

  async resendVerification() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No user logged in to resend verification to');
    }
  }
};
