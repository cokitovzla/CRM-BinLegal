import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { isVerifiedAdminEmail } from '../lib/authPolicy';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithIdentifier: (identifier: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmailOrUsername: (
    email: string, 
    pass: string, 
    name: string, 
    company: string, 
    username?: string, 
    subscribeNewsletter?: boolean,
    industry?: string,
    sectors?: string[]
  ) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, company: string) => Promise<void>;
  subscribeNewsletter: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemoClient: () => void;
  loginAsDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or create user profile doc in /users/{uid}
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const isAdminEmail = isVerifiedAdminEmail(user.email, user.emailVerified);
            const newProfile: UserProfile = {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'José Rafael Vásquez',
              companyName: 'BinLegal Asesoría',
              role: isAdminEmail ? 'admin' : 'client',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore:', err);
          // Fallback memory profile
          const isAdminEmail = isVerifiedAdminEmail(user.email, user.emailVerified);
          setUserProfile({
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || (isAdminEmail ? 'José Rafael Vásquez' : 'Cliente BinLegal'),
            role: isAdminEmail ? 'admin' : 'client',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  };

  const loginWithIdentifier = async (identifier: string, pass: string) => {
    const raw = identifier.trim();
    if (!raw) throw new Error('Ingresa tu correo o tu nombre de usuario');

    // Case 1: Standard email format
    if (raw.includes('@')) {
      await signInWithEmailAndPassword(auth, raw, pass);
      return;
    }

    // Case 2: Username format (without @)
    const cleanUser = raw.toLowerCase().replace(/^@/, '');

    // Quick demo username handling
    // Demo administrator shortcuts are development-only; never treat them as real production authentication.
    const previewMode = window.location.pathname.replace(/\/$/, '') === '/crm-preview';
    if (previewMode && (cleanUser === 'admin' || cleanUser === 'joserafael' || cleanUser === 'jrv')) {
      loginAsDemoAdmin();
      return;
    }
    if (previewMode && (cleanUser === 'demo' || cleanUser === 'sofia' || cleanUser === 'cliente')) {
      loginAsDemoClient();
      return;
    }

    // Lookup username in Firestore collection 'usernames'
    let resolvedEmail: string | null = null;
    try {
      const uSnap = await getDoc(doc(db, 'usernames', cleanUser));
      if (uSnap.exists() && uSnap.data()?.email) {
        resolvedEmail = uSnap.data().email;
      }
    } catch (err) {
      console.warn('Firestore username lookup fallback:', err);
    }

    // Local storage cache lookup fallback
    if (!resolvedEmail) {
      try {
        const localMap = JSON.parse(localStorage.getItem('binlegal_usernames_map') || '{}');
        if (localMap[cleanUser]) {
          resolvedEmail = localMap[cleanUser];
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!resolvedEmail) {
      throw new Error(`No encontramos una cuenta con el usuario "${raw}". Verifica el alias o ingresa con tu correo.`);
    }

    await signInWithEmailAndPassword(auth, resolvedEmail, pass);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    return loginWithIdentifier(email, pass);
  };

  const registerWithEmailOrUsername = async (
    email: string, 
    pass: string, 
    name: string, 
    company: string,
    username?: string,
    subscribeNewsletterOptIn: boolean = true,
    industry?: string,
    sectors?: string[]
  ) => {
    try {
      const cleanEmail = email.trim();
      const cleanUser = (username || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '').trim();

      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateProfile(res.user, { displayName: name });
      
      const newProfile: UserProfile = {
        userId: res.user.uid,
        email: cleanEmail,
        displayName: name,
        companyName: company,
        ...(industry ? { industry } : {}),
        ...(sectors && sectors.length > 0 ? { sectors } : {}),
        ...(cleanUser ? { username: cleanUser } : {}),
        isSubscribedNewsletter: subscribeNewsletterOptIn,
        role: 'client',
        createdAt: new Date().toISOString()
      };
      
      try {
        // 1. Save user profile
        await setDoc(doc(db, 'users', res.user.uid), newProfile);

        // 2. Index username if given
        if (cleanUser) {
          await setDoc(doc(db, 'usernames', cleanUser), {
            email: cleanEmail,
            username: cleanUser,
            userId: res.user.uid,
            createdAt: new Date().toISOString()
          });

          // Sync local map
          try {
            const localMap = JSON.parse(localStorage.getItem('binlegal_usernames_map') || '{}');
            localMap[cleanUser] = cleanEmail;
            localStorage.setItem('binlegal_usernames_map', JSON.stringify(localMap));
          } catch (e) {}
        }

        // 3. Register in newsletter subscribers if opted in
        if (subscribeNewsletterOptIn) {
          await setDoc(doc(db, 'subscribers', res.user.uid), {
            email: cleanEmail,
            name,
            company,
            subscribedAt: new Date().toISOString(),
            status: 'active'
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
      }
      
      setUserProfile(newProfile);
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, company: string) => {
    return registerWithEmailOrUsername(email, pass, name, company, undefined, true);
  };

  const subscribeNewsletter = async (email: string, name?: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido');
    }

    try {
      const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'subscribers', docId), {
        email: cleanEmail,
        name: name || '',
        subscribedAt: new Date().toISOString(),
        status: 'active'
      });
    } catch (err) {
      console.warn('Newsletter Firestore save notice:', err);
    }

    // Save in localStorage as fallback
    try {
      const subs = JSON.parse(localStorage.getItem('binlegal_newsletter_subscribers') || '[]');
      if (!subs.some((s: any) => s.email === cleanEmail)) {
        subs.push({ email: cleanEmail, name: name || '', date: new Date().toISOString() });
        localStorage.setItem('binlegal_newsletter_subscribers', JSON.stringify(subs));
      }
    } catch (e) {}
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  // Demo helpers for instant evaluation without typing passwords
  const loginAsDemoClient = () => {
    if (window.location.pathname.replace(/\/$/, '') !== '/crm-preview') {
      throw new Error('El acceso ficticio solo está disponible en la maqueta /crm-preview.');
    }
    const demoClient: UserProfile = {
      userId: 'demo-client-uid-01',
      email: 'sofia@koragroup.ve',
      displayName: 'Sofía Colmenares',
      companyName: 'Kora Logistics C.A.',
      industry: 'Logística & Envíos',
      sectors: ['Logística & Envíos', 'Comercio & E-commerce'],
      isSubscribedNewsletter: true,
      role: 'client',
      createdAt: '2026-10-18'
    };
    setUserProfile(demoClient);
    setCurrentUser({
      uid: demoClient.userId,
      email: demoClient.email,
      displayName: demoClient.displayName
    } as User);
  };

  const loginAsDemoAdmin = () => {
    if (window.location.pathname.replace(/\/$/, '') !== '/crm-preview') {
      throw new Error('El acceso ficticio solo está disponible en la maqueta /crm-preview.');
    }
    const demoAdmin: UserProfile = {
      userId: 'demo-admin-uid-01',
      email: 'anat.vacaviejavzla@gmail.com',
      displayName: 'José Rafael Vásquez',
      companyName: 'BinLegal Asesoría',
      role: 'admin',
      createdAt: '2026-10-10'
    };
    setUserProfile(demoAdmin);
    setCurrentUser({
      uid: demoAdmin.userId,
      email: demoAdmin.email,
      displayName: demoAdmin.displayName
    } as User);
  };

  const isAdmin = userProfile?.role === 'admin' || isVerifiedAdminEmail(currentUser?.email, currentUser?.emailVerified === true);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithIdentifier,
        loginWithEmail,
        registerWithEmailOrUsername,
        registerWithEmail,
        subscribeNewsletter,
        logout,
        loginAsDemoClient,
        loginAsDemoAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
