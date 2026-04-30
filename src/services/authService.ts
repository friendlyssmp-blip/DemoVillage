import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  linkWithPopup,
  EmailAuthProvider,
  AuthCredential,
  unlink
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
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  async loginWithApple() {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  async linkGoogle() {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    const provider = new GoogleAuthProvider();
    await linkWithPopup(user, provider);
    return user;
  },

  async linkApple() {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    const provider = new OAuthProvider('apple.com');
    await linkWithPopup(user, provider);
    return user;
  },

  async checkUsernameUnique(username: string): Promise<boolean> {
    const docRef = doc(db, 'usernames', username.toLowerCase());
    try {
      const docSnap = await getDoc(docRef);
      return !docSnap.exists();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `usernames/${username.toLowerCase()}`);
      return true; // Default to true if check fails to not block user, but ideally we show error
    }
  },

  async unlinkGoogle() {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Check if user has other login methods
    if (user.providerData.length <= 1 && !user.email) {
      throw new Error('You must have at least one other login method before disconnecting Google');
    }

    try {
      await unlink(user, GoogleAuthProvider.PROVIDER_ID);
      await user.reload();
      return user;
    } catch (err: any) {
      throw new Error(`Failed to disconnect Google: ${err.message}`);
    }
  },

  async unlinkApple() {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    if (user.providerData.length <= 1 && !user.email) {
      throw new Error('You must have at least one other login method before disconnecting Apple');
    }

    try {
      await unlink(user, 'apple.com');
      await user.reload();
      return user;
    } catch (err: any) {
      throw new Error(`Failed to disconnect Apple: ${err.message}`);
    }
  },

  async register(email: string, password: string, username: string, rememberMe: boolean = true) {
    const isUnique = await this.checkUsernameUnique(username);
    if (!isUnique) {
      throw new Error('Username is already taken');
    }

    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
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
    const email = user.email || (user.providerData[0]?.email ?? null);
    
    if (!email) {
      console.warn("User has no email in Auth profile. Username lookup won't work perfectly.");
    }

    batch.set(usernameRef, { 
      uid: user.uid,
      email: email,
      lastUpdated: Date.now()
    });

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

  async login(identifier: string, password: string, rememberMe: boolean = true) {
    let email = identifier;
    
    if (!identifier.includes('@')) {
      // Treat as username
      const usernameRef = doc(db, 'usernames', identifier.toLowerCase());
      const usernameSnap = await getDoc(usernameRef);
      
      if (!usernameSnap.exists()) {
        throw new Error('Username not found');
      }
      
      const data = usernameSnap.data();
      email = data.email;

      if (!email) {
        // Fallback or repair attempt: if UID is there, we could try to find profile, 
        // but Firebase Auth sign-in requires email. 
        // If the usernames doc is missing email, it's a legacy or broken record.
        throw new Error('Account missing email, contact support');
      }
    }

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Incorrect password');
      }
      if (err.code === 'auth/user-not-found') {
        throw new Error('Account not found');
      }
      throw err;
    }
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
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }
};
