import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as required by the platform
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling Enums and Types
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo:
        auth?.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache.');
    }
    return false;
  }
}

// ==========================================
// REAL-TIME FIRESTORE LISTENERS & SYNC HELPERS
// ==========================================

// 1. PARTICIPANTS (Peserta Lomba)
export function subscribeToParticipants(
  onUpdate: (participants: any[]) => void,
  onError?: (err: any) => void
) {
  const path = 'participants';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const items: any[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      onUpdate(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

export async function saveParticipantToCloud(participant: any) {
  const path = `participants/${participant.id}`;
  try {
    const cleanDoc = {
      ...participant,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'participants', participant.id), cleanDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteParticipantFromCloud(participantId: string) {
  const path = `participants/${participantId}`;
  try {
    await deleteDoc(doc(db, 'participants', participantId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. USERS (Akun Admin, Juri, Sekolah)
export function subscribeToUsers(
  onUpdate: (users: any[]) => void,
  onError?: (err: any) => void
) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const items: any[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      onUpdate(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

export async function saveUserToCloud(user: any) {
  const path = `users/${user.username}`;
  try {
    const cleanDoc = {
      ...user,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.username), cleanDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserFromCloud(username: string) {
  const path = `users/${username}`;
  try {
    await deleteDoc(doc(db, 'users', username));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. CONFIG (Kriteria & Bobot)
export function subscribeToConfig(
  onUpdate: (config: any) => void,
  onError?: (err: any) => void
) {
  const path = 'config/criteria_config';
  return onSnapshot(
    doc(db, 'config', 'criteria_config'),
    docSnap => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().categories);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveConfigToCloud(categories: any) {
  const path = 'config/criteria_config';
  try {
    await setDoc(doc(db, 'config', 'criteria_config'), {
      id: 'criteria_config',
      categories,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. LOGO (Pengaturan Logo Aplikasi)
export function subscribeToLogo(
  onUpdate: (logoUrl: string | null) => void,
  onError?: (err: any) => void
) {
  const path = 'settings/global_logo';
  return onSnapshot(
    doc(db, 'settings', 'global_logo'),
    docSnap => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().logoUrl || null);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveLogoToCloud(logoUrl: string | null) {
  const path = 'settings/global_logo';
  try {
    await setDoc(doc(db, 'settings', 'global_logo'), {
      id: 'global_logo',
      logoUrl: logoUrl || '',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. REGISTRATIONS (Formulir Pendaftaran PKS)
export function subscribeToRegistrations(
  onUpdate: (submissions: any[]) => void,
  onError?: (err: any) => void
) {
  const path = 'registrations';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const items: any[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      onUpdate(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

export async function saveRegistrationToCloud(submission: any) {
  const path = `registrations/${submission.id}`;
  try {
    const cleanDoc = {
      ...submission,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'registrations', submission.id), cleanDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRegistrationFromCloud(submissionId: string) {
  const path = `registrations/${submissionId}`;
  try {
    await deleteDoc(doc(db, 'registrations', submissionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 6. APP STATUS & MAINTENANCE (Aktivasi / Nonaktivasi Aplikasi dengan Kustomisasi Teks)
export interface AppStatusConfig {
  id?: string;
  isActive: boolean;
  title: string;
  message: string;
  estimateTime?: string;
  contactInfo?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export function subscribeToAppStatus(
  onUpdate: (status: AppStatusConfig) => void,
  onError?: (err: any) => void
) {
  const path = 'settings/app_status';
  return onSnapshot(
    doc(db, 'settings', 'app_status'),
    docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate({
          id: 'app_status',
          isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
          title: data.title || 'Aplikasi Sedang Dinonaktifkan Sementara',
          message:
            data.message ||
            'Sistem E-Rekapitulasi Lomba PBB & PKS sedang ditutup sementara oleh Panitia Pelaksana. Harap hubungi administrator untuk informasi lebih lanjut.',
          estimateTime: data.estimateTime || '',
          contactInfo: data.contactInfo || '',
          updatedAt: data.updatedAt || '',
          updatedBy: data.updatedBy || ''
        });
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveAppStatusToCloud(status: AppStatusConfig) {
  const path = 'settings/app_status';
  try {
    await setDoc(doc(db, 'settings', 'app_status'), {
      id: 'app_status',
      isActive: status.isActive,
      title: status.title,
      message: status.message,
      estimateTime: status.estimateTime || '',
      contactInfo: status.contactInfo || '',
      updatedAt: new Date().toISOString(),
      updatedBy: status.updatedBy || 'admin'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

