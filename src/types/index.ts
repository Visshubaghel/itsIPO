export type ApplicationStatus = 'Not Applied' | 'Applied' | 'Approved' | 'Allotted' | 'Rejected';

export type TransactionType = 'SENT' | 'RECEIVED';

export interface Person {
  id: string;
  name: string;
  bankBroker: string;
  upiOrAccount: string;
  defaultAmount: number;
  note?: string;
  isActive: boolean;
  createdAt: string;
}

export interface IPO {
  id: string;
  name: string;
  amountRequired: number;
  biddingStartDate?: string;
  biddingEndDate?: string;
  allotmentDate?: string;
  listingDate?: string;
  note?: string;
  createdAt: string;
}

export interface IPOApplication {
  id: string;
  ipoId: string;
  personId: string;
  amount: number;
  status: ApplicationStatus;
  appliedAt?: string;
  note?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  date: string;
  ipoId?: string;
  note?: string;
  createdAt: string;
}

export interface PersonSummary {
  person: Person;
  totalSent: number;
  totalReceived: number;
  balance: number; // totalSent - totalReceived
  appliedCount: number;
  allottedCount: number;
}

export interface DashboardStats {
  totalIPOs: number;
  totalApplications: number;
  totalMoneySent: number;
  totalMoneyReceived: number;
  netBalance: number;
}
