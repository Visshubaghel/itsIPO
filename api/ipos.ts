import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToMongoDB, setCorsHeaders } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToMongoDB();
    const collection = db.collection('ipos');

    if (req.method === 'GET') {
      const ipos = await collection.find({}).toArray();
      return res.status(200).json(ipos);
    }

    if (req.method === 'POST') {
      const ipo = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!ipo || !ipo.id || !ipo.name) {
        return res.status(400).json({ error: 'Missing ipo id or name' });
      }
      await collection.updateOne({ id: ipo.id }, { $set: ipo }, { upsert: true });
      return res.status(200).json({ success: true, ipo });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id query param' });
      await collection.deleteOne({ id: String(id) });
      await db.collection('applications').deleteMany({ ipoId: String(id) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
