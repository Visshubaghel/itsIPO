import { exportDatabaseJSON } from './db';

/**
 * Triggers full sync of local IndexedDB data to MongoDB Atlas via Vercel /api/sync endpoint
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
