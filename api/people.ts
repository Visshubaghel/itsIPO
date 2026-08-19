import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToMongoDB } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { db } = await connectToMongoDB();
    const collection = db.collection('people');

    if (req.method === 'GET') {
      const people = await collection.find({}).toArray();
      return res.status(200).json(people);
    }

    if (req.method === 'POST') {
      const person = req.body;
      if (!person.id || !person.name) {
        return res.status(400).json({ error: 'Missing person id or name' });
      }
      await collection.updateOne({ id: person.id }, { $set: person }, { upsert: true });
      return res.status(200).json({ success: true, person });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await collection.updateOne({ id }, { $set: updates });
      return res.status(200).json({ success: true });
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
