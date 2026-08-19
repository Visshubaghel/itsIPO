import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToMongoDB } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { db } = await connectToMongoDB();
    const collection = db.collection('transactions');

    if (req.method === 'GET') {
      const txs = await collection.find({}).toArray();
      return res.status(200).json(txs);
    }

    if (req.method === 'POST') {
      const tx = req.body;
      if (!tx.id || !tx.personId || !tx.amount) {
        return res.status(400).json({ error: 'Missing transaction id, personId, or amount' });
      }
      await collection.updateOne({ id: tx.id }, { $set: tx }, { upsert: true });
      return res.status(200).json({ success: true, tx });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id query param' });
      await collection.deleteOne({ id: String(id) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
