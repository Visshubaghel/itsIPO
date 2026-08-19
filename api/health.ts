import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToMongoDB, setCorsHeaders } from './db.js';


export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToMongoDB();
    const peopleCount = await db.collection('people').countDocuments();
    const iposCount = await db.collection('ipos').countDocuments();
    const appsCount = await db.collection('applications').countDocuments();
    const txsCount = await db.collection('transactions').countDocuments();

    return res.status(200).json({
      connected: true,
      database: db.databaseName,
      counts: {
        people: peopleCount,
        ipos: iposCount,
        applications: appsCount,
        transactions: txsCount,
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      connected: false,
      error: error?.message || String(error) || 'Failed to connect to MongoDB Atlas',
      name: error?.name || 'ConnectionError',
    });
  }
}
