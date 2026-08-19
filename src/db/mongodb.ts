import { db, exportDatabaseJSON } from './db';
import type { Person, IPO, IPOApplication, Transaction } from '../types';

/**
 * Fetches all collections from MongoDB Atlas via Vercel serverless API
 * and syncs them into local IndexedDB for live multi-device access.
 */
export async function fetchFromMongoDBAtlas(): Promise<boolean> {
  try {
    const [peopleRes, iposRes, appsRes, txsRes] = await Promise.all([
      fetch('/api/people'),
      fetch('/api/ipos'),
      fetch('/api/applications'),
      fetch('/api/transactions'),
    ]);

    if (!peopleRes.ok || !iposRes.ok || !appsRes.ok || !txsRes.ok) {
      return false;
    }

    const people: Person[] = await peopleRes.json();
    const ipos: IPO[] = await iposRes.json();
    const applications: IPOApplication[] = await appsRes.json();
    const transactions: Transaction[] = await txsRes.json();

    // Clean MongoDB _id field if present
    const cleanPeople = people.map(({ _id, ...p }: any) => p);
    const cleanIPOs = ipos.map(({ _id, ...i }: any) => i);
    const cleanApps = applications.map(({ _id, ...a }: any) => a);
    const cleanTxs = transactions.map(({ _id, ...t }: any) => t);

    // Sync into IndexedDB
    await db.transaction('rw', [db.people, db.ipos, db.applications, db.transactions], async () => {
      if (cleanPeople.length > 0) {
        await db.people.clear();
        await db.people.bulkAdd(cleanPeople);
      }
      if (cleanIPOs.length > 0) {
        await db.ipos.clear();
        await db.ipos.bulkAdd(cleanIPOs);
      }
      if (cleanApps.length > 0) {
        await db.applications.clear();
        await db.applications.bulkAdd(cleanApps);
      }
      if (cleanTxs.length > 0) {
        await db.transactions.clear();
        await db.transactions.bulkAdd(cleanTxs);
      }
    });

    return true;
  } catch (error) {
    console.warn('MongoDB Atlas live fetch skipped (local mode):', error);
    return false;
  }
}

/**
 * Triggers full bulk push of local IndexedDB data to MongoDB Atlas via Vercel /api/sync endpoint
 */
export async function syncLocalDataToMongoDBAtlas(): Promise<{
  success: boolean;
  message: string;
  syncedCounts?: any;
}> {
  try {
    const jsonStr = await exportDatabaseJSON();
    const data = JSON.parse(jsonStr);

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        people: data.people || [],
        ipos: data.ipos || [],
        applications: data.applications || [],
        transactions: data.transactions || [],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status} error from Vercel API`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('MongoDB Atlas sync error:', error);
    return {
      success: false,
      message: error.message || 'Failed to connect to /api/sync endpoint.',
    };
  }
}

// API Helper functions to push live changes to MongoDB Atlas
export async function apiSavePerson(person: Person) {
  fetch('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(person),
  }).catch(console.error);
}

export async function apiDeletePerson(id: string) {
  fetch(`/api/people?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(console.error);
}

export async function apiSaveIPO(ipo: IPO, newApplications: IPOApplication[]) {
  // Push IPO
  fetch('/api/ipos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ipo),
  }).catch(console.error);

  // Push Applications
  for (const app of newApplications) {
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app),
    }).catch(console.error);
  }
}

export async function apiDeleteIPO(id: string) {
  fetch(`/api/ipos?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(console.error);
}

export async function apiUpdateApplication(appId: string, updates: Partial<IPOApplication>) {
  fetch('/api/applications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: appId, ...updates }),
  }).catch(console.error);
}

export async function apiSaveApplication(app: IPOApplication) {
  fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(app),
  }).catch(console.error);
}

export async function apiDeleteApplication(id: string) {
  fetch(`/api/applications?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(console.error);
}

export async function apiSaveTransaction(tx: Transaction) {
  fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  }).catch(console.error);
}

export async function apiDeleteTransaction(id: string) {
  fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(console.error);
}
