import { connectToMongoDB, setCorsHeaders } from './db.js';
export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    try {
        const { db } = await connectToMongoDB();
        const collection = db.collection('applications');
        if (req.method === 'GET') {
            const apps = await collection.find({}).toArray();
            return res.status(200).json(apps);
        }
        if (req.method === 'POST') {
            const app = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (!app || !app.id || !app.ipoId || !app.personId) {
                return res.status(400).json({ error: 'Missing application id, ipoId, or personId' });
            }
            await collection.updateOne({ id: app.id }, { $set: app }, { upsert: true });
            return res.status(200).json({ success: true, app });
        }
        if (req.method === 'PUT') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { id, ...updates } = body || {};
            if (!id)
                return res.status(400).json({ error: 'Missing id' });
            await collection.updateOne({ id }, { $set: updates });
            return res.status(200).json({ success: true });
        }
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id)
                return res.status(400).json({ error: 'Missing id query param' });
            await collection.deleteOne({ id: String(id) });
            return res.status(200).json({ success: true });
        }
        return res.status(405).json({ error: 'Method not allowed' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Server error' });
    }
}
