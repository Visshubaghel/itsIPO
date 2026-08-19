import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToMongoDB, setCorsHeaders } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { db } = await connectToMongoDB();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { people, ipos, applications, transactions } = body || {};

    if (Array.isArray(people) && people.length > 0) {
      const col = db.collection('people');
      for (const p of people) {
        const { _id, ...clean } = p as any;
        await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
      }
    }

    if (Array.isArray(ipos) && ipos.length > 0) {
      const col = db.collection('ipos');
      for (const i of ipos) {
        const { _id, ...clean } = i as any;
        await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
      }
    }

    if (Array.isArray(applications) && applications.length > 0) {
      const col = db.collection('applications');
      for (const a of applications) {
        const { _id, ...clean } = a as any;
        await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
      }
    }

    if (Array.isArray(transactions) && transactions.length > 0) {
      const col = db.collection('transactions');
      for (const t of transactions) {
        const { _id, ...clean } = t as any;
        await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'MongoDB Atlas collections synchronized successfully.',
      syncedCounts: {
        people: people?.length || 0,
        ipos: ipos?.length || 0,
        applications: applications?.length || 0,
        transactions: transactions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('API /api/sync error:', error);
    return res.status(500).json({
      error: error?.message || String(error) || 'Internal MongoDB Connection Error',
      name: error?.name || 'Error',
    });
  }
}
