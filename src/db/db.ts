import Dexie, { type Table } from 'dexie';
import type { Person, IPO, IPOApplication, Transaction } from '../types';
import { generateId, getTodayInputValue } from '../utils/formatters';

export class IPODatabase extends Dexie {
  people!: Table<Person, string>;
  ipos!: Table<IPO, string>;
  applications!: Table<IPOApplication, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('IPOMoneyTrackerDB');
    this.version(1).stores({
      people: 'id, name, isActive',
      ipos: 'id, name, createdAt',
      applications: 'id, ipoId, personId, status',
      transactions: 'id, personId, type, date, ipoId',
    });
  }
}

export const db = new IPODatabase();

/**
 * Pre-populate initial realistic seed data if database is empty
 */
export async function seedInitialData() {
  const count = await db.people.count();
  if (count > 0) return;

  const today = getTodayInputValue();

  // 1. Initial Fixed People List
  const samplePeople: Person[] = [
    {
      id: 'person_1',
      name: 'Rahul Sharma',
      bankBroker: 'HDFC Bank / Zerodha',
      upiOrAccount: 'rahul@hdfcbank',
      defaultAmount: 200000,
      note: 'Primary self account',
      isActive: true,
      createdAt: today,
    },
    {
      id: 'person_2',
      name: 'Amit Patel',
      bankBroker: 'ICICI Bank / Groww',
      upiOrAccount: 'amit@icici',
      defaultAmount: 200000,
      note: 'Family account (Brother)',
      isActive: true,
      createdAt: today,
    },
    {
      id: 'person_3',
      name: 'Rohit Verma',
      bankBroker: 'SBI / AngelOne',
      upiOrAccount: 'rohit@sbi',
      defaultAmount: 200000,
      note: 'Friend account',
      isActive: true,
      createdAt: today,
    },
    {
      id: 'person_4',
      name: 'Priya Singh',
      bankBroker: 'Axis Bank / Zerodha',
      upiOrAccount: 'priya@axisbank',
      defaultAmount: 150000,
      note: 'Sister account',
      isActive: true,
      createdAt: today,
    },
  ];

  // 2. Initial Sample IPO
  const sampleIPO: IPO = {
    id: 'ipo_abc',
    name: 'ABC Housing Finance IPO',
    amountRequired: 200000,
    biddingStartDate: today,
    biddingEndDate: today,
    allotmentDate: today,
    listingDate: today,
    note: 'Mainboard IPO - High HNI & Retail Demand',
    createdAt: today,
  };

  // 3. Initial IPO Applications for all people
  const sampleApplications: IPOApplication[] = [
    {
      id: 'app_1',
      ipoId: 'ipo_abc',
      personId: 'person_1',
      amount: 200000,
      status: 'Allotted',
      appliedAt: today,
      note: 'Applied via UPI',
      createdAt: today,
    },
    {
      id: 'app_2',
      ipoId: 'ipo_abc',
      personId: 'person_2',
      amount: 200000,
      status: 'Applied',
      appliedAt: today,
      note: 'ASBA bank mandate approved',
      createdAt: today,
    },
    {
      id: 'app_3',
      ipoId: 'ipo_abc',
      personId: 'person_3',
      amount: 200000,
      status: 'Approved',
      appliedAt: today,
      note: 'Mandate accepted',
      createdAt: today,
    },
    {
      id: 'app_4',
      ipoId: 'ipo_abc',
      personId: 'person_4',
      amount: 150000,
      status: 'Not Applied',
      appliedAt: today,
      note: 'Funds pending',
      createdAt: today,
    },
  ];

  // 4. Sample Money Transactions
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx_1',
      personId: 'person_1',
      type: 'SENT',
      amount: 200000,
      date: today,
      ipoId: 'ipo_abc',
      note: 'IPO Application Funds Sent',
      createdAt: today,
    },
    {
      id: 'tx_2',
      personId: 'person_2',
      type: 'SENT',
      amount: 200000,
      date: today,
      ipoId: 'ipo_abc',
      note: 'Fund transfer for ABC IPO',
      createdAt: today,
    },
    {
      id: 'tx_3',
      personId: 'person_2',
      type: 'RECEIVED',
      amount: 50000,
      date: today,
      ipoId: 'ipo_abc',
      note: 'Partial refund received',
      createdAt: today,
    },
    {
      id: 'tx_4',
      personId: 'person_3',
      type: 'SENT',
      amount: 200000,
      date: today,
      ipoId: 'ipo_abc',
      note: 'Money sent to Rohit for ABC IPO',
      createdAt: today,
    },
  ];

  await db.people.bulkAdd(samplePeople);
  await db.ipos.add(sampleIPO);
  await db.applications.bulkAdd(sampleApplications);
  await db.transactions.bulkAdd(sampleTransactions);
}

/**
 * Creates a new IPO and automatically populates application entries for all active people
 */
export async function createIPOWithApplications(ipoData: Omit<IPO, 'id' | 'createdAt'>) {
  const ipoId = generateId('ipo');
  const today = getTodayInputValue();

  const newIPO: IPO = {
    ...ipoData,
    id: ipoId,
    createdAt: today,
  };

  // Get all currently active people
  const activePeople = await db.people.where('isActive').equals(1).toArray();

  const newApplications: IPOApplication[] = activePeople.map((person) => ({
    id: generateId('app'),
    ipoId: ipoId,
    personId: person.id,
    amount: ipoData.amountRequired || person.defaultAmount || 200000,
    status: 'Not Applied',
    createdAt: today,
  }));

  await db.transaction('rw', [db.ipos, db.applications], async () => {
    await db.ipos.add(newIPO);
    if (newApplications.length > 0) {
      await db.applications.bulkAdd(newApplications);
    }
  });

  return newIPO;
}

/**
 * Adds a person manually to an existing IPO if not already added
 */
export async function addPersonToIPO(ipoId: string, personId: string, customAmount?: number) {
  const existing = await db.applications
    .where('[ipoId+personId]')
    .equals([ipoId, personId])
    .first();

  if (existing) return existing;

  const person = await db.people.get(personId);
  const ipo = await db.ipos.get(ipoId);

  const amount = customAmount || ipo?.amountRequired || person?.defaultAmount || 200000;
  const today = getTodayInputValue();

  const newApp: IPOApplication = {
    id: generateId('app'),
    ipoId,
    personId,
    amount,
    status: 'Not Applied',
    createdAt: today,
  };

  await db.applications.add(newApp);
  return newApp;
}

/**
 * Export full DB data as downloadable JSON
 */
export async function exportDatabaseJSON(): Promise<string> {
  const people = await db.people.toArray();
  const ipos = await db.ipos.toArray();
  const applications = await db.applications.toArray();
  const transactions = await db.transactions.toArray();

  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      people,
      ipos,
      applications,
      transactions,
    },
    null,
    2
  );
}

/**
 * Import JSON data into database
 */
export async function importDatabaseJSON(jsonStr: string) {
  const data = JSON.parse(jsonStr);
  if (!data.people || !data.ipos) {
    throw new Error('Invalid JSON backup file structure.');
  }

  await db.transaction('rw', [db.people, db.ipos, db.applications, db.transactions], async () => {
    await db.people.clear();
    await db.ipos.clear();
    await db.applications.clear();
    await db.transactions.clear();

    if (data.people?.length) await db.people.bulkAdd(data.people);
    if (data.ipos?.length) await db.ipos.bulkAdd(data.ipos);
    if (data.applications?.length) await db.applications.bulkAdd(data.applications);
    if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
  });
}
