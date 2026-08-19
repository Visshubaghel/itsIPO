import { MongoClient, Db } from 'mongodb';
import type { VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'ipo_tracker';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

export async function connectToMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
