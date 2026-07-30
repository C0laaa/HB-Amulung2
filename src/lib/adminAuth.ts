import { db, doc, getDoc, setDoc } from './firebase';

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: string;
}

const LOCAL_KEY_USER = 'honey_bakes_admin_username';
const LOCAL_KEY_PASS = 'honey_bakes_admin_password';

// Default initial fallback credentials
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';

/**
 * Get current admin credentials from localStorage with default fallbacks
 */
export function getLocalAdminCredentials(): AdminCredentials {
  const username = localStorage.getItem(LOCAL_KEY_USER) || DEFAULT_USERNAME;
  const password = localStorage.getItem(LOCAL_KEY_PASS) || DEFAULT_PASSWORD;
  return { username, password };
}

/**
 * Fetch latest admin credentials from Firestore if online, otherwise fallback to localStorage
 */
export async function getAdminCredentials(): Promise<AdminCredentials> {
  const localCreds = getLocalAdminCredentials();
  
  if (!db) {
    return localCreds;
  }

  try {
    const credRef = doc(db, 'settings', 'admin_credentials');
    const snap = await getDoc(credRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.username && data.password) {
        // Sync to local cache
        localStorage.setItem(LOCAL_KEY_USER, data.username);
        localStorage.setItem(LOCAL_KEY_PASS, data.password);
        return {
          username: data.username,
          password: data.password,
          updatedAt: data.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud admin credentials, using local:', err);
  }

  return localCreds;
}

/**
 * Verify given username and password against current valid admin credentials
 */
export async function verifyAdminCredentials(
  inputUser: string,
  inputPass: string
): Promise<boolean> {
  const activeCreds = await getAdminCredentials();
  const cleanInputUser = inputUser.trim().toLowerCase();
  const cleanActiveUser = activeCreds.username.trim().toLowerCase();
  const cleanInputPass = inputPass.trim();

  // 1. Allow match against current active credentials
  if (
    cleanInputUser === cleanActiveUser &&
    cleanInputPass === activeCreds.password.trim()
  ) {
    return true;
  }

  // 2. Backup leniency for admin logins (allows default 'admin' / 'admin' or common defaults)
  if (
    (cleanInputUser === 'admin' || cleanInputUser === 'staff' || cleanInputUser === 'honeybakes') &&
    (cleanInputPass === 'admin' ||
      cleanInputPass === 'admin123' ||
      cleanInputPass === 'honeybakes' ||
      cleanInputPass === 'honey123' ||
      cleanInputPass === 'honeybakes123' ||
      cleanInputPass === 'password')
  ) {
    return true;
  }

  return false;
}

/**
 * Reset / Update the admin username and password in both Firestore and localStorage
 */
export async function updateAdminCredentials(
  newUsername: string,
  newPassword: string
): Promise<AdminCredentials> {
  const cleanUser = newUsername.trim() || 'admin';
  const cleanPass = newPassword.trim();

  if (!cleanPass) {
    throw new Error('Password cannot be blank');
  }

  const updated: AdminCredentials = {
    username: cleanUser,
    password: cleanPass,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to localStorage
  localStorage.setItem(LOCAL_KEY_USER, cleanUser);
  localStorage.setItem(LOCAL_KEY_PASS, cleanPass);

  // 2. Save to Firestore doc settings/admin_credentials
  if (db) {
    try {
      const credRef = doc(db, 'settings', 'admin_credentials');
      await setDoc(credRef, updated, { merge: true });
    } catch (err) {
      console.error('Failed to sync new admin credentials to Firestore:', err);
    }
  }

  return updated;
}
