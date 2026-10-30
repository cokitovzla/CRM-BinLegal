import {getStorage,connectStorageEmulator} from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import stagingConfig from '../../firebase.staging-config.json';

export const usingFirebaseEmulators = import.meta.env.MODE === 'emulators';
export const usingFirebaseStaging = import.meta.env.MODE === 'staging';
if(usingFirebaseEmulators && !['localhost','127.0.0.1','[::1]'].includes(window.location.hostname)) throw new Error('El entorno de pruebas solo puede ejecutarse en localhost.');
if(usingFirebaseStaging && !['localhost','127.0.0.1','[::1]'].includes(window.location.hostname)) throw new Error('El entorno Firebase de pruebas solo puede ejecutarse en localhost hasta completar los permisos.');
const config=usingFirebaseEmulators?{projectId:'demo-binlegal-local',apiKey:'demo-local-only',authDomain:'localhost',storageBucket:'demo-binlegal-local.appspot.com',appId:'demo-binlegal-local'}:usingFirebaseStaging?stagingConfig:firebaseConfig;
const app = initializeApp(config);
export const db = getFirestore(app, usingFirebaseEmulators||usingFirebaseStaging?'(default)':firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
if(usingFirebaseEmulators) {
 connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:false});
 connectFirestoreEmulator(db,'127.0.0.1',8080);
 connectStorageEmulator(getStorage(app),'127.0.0.1',9199);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, check network connection.');
    }
  }
}
if(!usingFirebaseEmulators&&!usingFirebaseStaging) testConnection();
