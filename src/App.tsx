import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialData, createIPOWithApplications, addPersonToIPO } from './db/db';
import type { Person, Transaction, ApplicationStatus, TransactionType } from './types';

import { generateId, getTodayInputValue } from './utils/formatters';


// Components
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { IPOApplications } from './components/IPOApplications';
import { PeopleAccounts } from './components/PeopleAccounts';
import { MoneyHistory } from './components/MoneyHistory';

// Modals
import { AddIPOModal } from './components/Modals/AddIPOModal';
import { AddPersonModal } from './components/Modals/AddPersonModal';
import { AddTransactionModal } from './components/Modals/AddTransactionModal';
import { PersonLedgerModal } from './components/Modals/PersonLedgerModal';
import { SettingsModal } from './components/Modals/SettingsModal';

export function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ipos' | 'people' | 'money'>('ipos');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ipo_tracker_dark_mode') === 'true';
  });

  // Modal Visibility States
  const [isAddIPOOpen, setIsAddIPOOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [initialTxType, setInitialTxType] = useState<TransactionType>('SENT');
  const [initialTxPersonId, setInitialTxPersonId] = useState<string>('');
  const [isPersonLedgerOpen, setIsPersonLedgerOpen] = useState(false);
  const [selectedLedgerPerson, setSelectedLedgerPerson] = useState<Person | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize Seed Data on First Launch
  useEffect(() => {
    seedInitialData().catch(console.error);
  }, []);

  // Handle Dark Mode CSS Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ipo_tracker_dark_mode', String(darkMode));
  }, [darkMode]);

  // Live Reactive Queries from IndexedDB
  const people = useLiveQuery(() => db.people.toArray(), []) || [];
  const ipos = useLiveQuery(() => db.ipos.toArray(), []) || [];
  const applications = useLiveQuery(() => db.applications.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];

  // Handlers for IPOs
  const handleCreateIPO = async (ipoData: {
    name: string;
    amountRequired: number;
    biddingStartDate?: string;
    biddingEndDate?: string;
    allotmentDate?: string;
    note?: string;
  }) => {
    await createIPOWithApplications(ipoData);
  };

  const handleDeleteIPO = async (ipoId: string) => {
    await db.transaction('rw', [db.ipos, db.applications], async () => {
      await db.ipos.delete(ipoId);
      await db.applications.where('ipoId').equals(ipoId).delete();
    });
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    await db.applications.update(applicationId, {
      status: newStatus,
      appliedAt: newStatus !== 'Not Applied' ? getTodayInputValue() : undefined,
    });
  };

  const handleUpdateApplicationAmount = async (applicationId: string, newAmount: number) => {
    await db.applications.update(applicationId, { amount: newAmount });
  };

  const handleAddPersonToIPO = async (ipoId: string, personId: string) => {
    await addPersonToIPO(ipoId, personId);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    await db.applications.delete(applicationId);
  };

  // Handlers for People / Accounts
  const handleSavePerson = async (personData: {
    id?: string;
    name: string;
    bankBroker: string;
    upiOrAccount: string;
    defaultAmount: number;
    note?: string;
    isActive: boolean;
  }) => {
    const today = getTodayInputValue();
    if (personData.id) {
      await db.people.update(personData.id, {
        name: personData.name,
        bankBroker: personData.bankBroker,
        upiOrAccount: personData.upiOrAccount,
        defaultAmount: personData.defaultAmount,
        note: personData.note,
        isActive: personData.isActive,
      });
    } else {
      const newPersonId = generateId('person');
      const newPerson: Person = {
        id: newPersonId,
        name: personData.name,
        bankBroker: personData.bankBroker,
        upiOrAccount: personData.upiOrAccount,
        defaultAmount: personData.defaultAmount,
        note: personData.note,
        isActive: personData.isActive,
        createdAt: today,
      };
      await db.people.add(newPerson);
    }
  };

  const handleTogglePersonActive = async (personId: string, currentActiveState: boolean) => {
    await db.people.update(personId, { isActive: !currentActiveState });
  };

  const handleDeletePerson = async (personId: string) => {
    await db.transaction('rw', [db.people, db.applications, db.transactions], async () => {
      await db.people.delete(personId);
      await db.applications.where('personId').equals(personId).delete();
      await db.transactions.where('personId').equals(personId).delete();
    });
  };

  // Handlers for Transactions
  const handleSaveTransaction = async (txData: {
    personId: string;
    type: TransactionType;
    amount: number;
    date: string;
    ipoId?: string;
    note?: string;
  }) => {
    const newTx: Transaction = {
      id: generateId('tx'),
      ...txData,
      createdAt: getTodayInputValue(),
    };
    await db.transactions.add(newTx);
  };

  const handleDeleteTransaction = async (txId: string) => {
    await db.transactions.delete(txId);
  };

  // Helper trigger modals
  const handleOpenAddTransaction = (type?: TransactionType, personId?: string) => {
    if (type) setInitialTxType(type);
    if (personId) setInitialTxPersonId(personId);
    setIsAddTransactionOpen(true);
  };

  const handleViewPersonLedger = (person: Person) => {
    setSelectedLedgerPerson(person);
    setIsPersonLedgerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddIPO={() => setIsAddIPOOpen(true)}
        onOpenAddTransaction={handleOpenAddTransaction}
        onOpenSettings={() => setIsSettingsOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            ipos={ipos}
            applications={applications}
            people={people}
            transactions={transactions}
            onOpenAddIPO={() => setIsAddIPOOpen(true)}
            onOpenAddTransaction={handleOpenAddTransaction}
            onNavigateToIPOs={() => setActiveTab('ipos')}
            onNavigateToMoney={() => setActiveTab('money')}
            onNavigateToPeople={() => setActiveTab('people')}
          />
        )}

        {activeTab === 'ipos' && (
          <IPOApplications
            ipos={ipos}
            applications={applications}
            people={people}
            onOpenAddIPO={() => setIsAddIPOOpen(true)}
            onUpdateStatus={handleUpdateApplicationStatus}
            onUpdateAmount={handleUpdateApplicationAmount}
            onAddPersonToIPO={handleAddPersonToIPO}
            onDeleteIPO={handleDeleteIPO}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {activeTab === 'people' && (
          <PeopleAccounts
            people={people}
            transactions={transactions}
            onOpenAddPerson={() => {
              setPersonToEdit(null);
              setIsAddPersonOpen(true);
            }}
            onEditPerson={(p) => {
              setPersonToEdit(p);
              setIsAddPersonOpen(true);
            }}
            onToggleActive={handleTogglePersonActive}
            onDeletePerson={handleDeletePerson}
            onViewPersonLedger={handleViewPersonLedger}
          />
        )}


        {activeTab === 'money' && (
          <MoneyHistory
            people={people}
            transactions={transactions}
            ipos={ipos}
            onOpenAddTransaction={handleOpenAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onViewPersonLedger={handleViewPersonLedger}
          />
        )}
      </main>

      {/* Modals */}
      <AddIPOModal
        isOpen={isAddIPOOpen}
        onClose={() => setIsAddIPOOpen(false)}
        onAdd={handleCreateIPO}
      />

      <AddPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        personToEdit={personToEdit}
        onSave={handleSavePerson}
      />

      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        people={people}
        ipos={ipos}
        initialType={initialTxType}
        initialPersonId={initialTxPersonId}
        onSave={handleSaveTransaction}
      />

      <PersonLedgerModal
        isOpen={isPersonLedgerOpen}
        onClose={() => setIsPersonLedgerOpen(false)}
        person={selectedLedgerPerson}
        transactions={transactions}
        ipos={ipos}
        onDeleteTransaction={handleDeleteTransaction}
        onOpenAddTransaction={handleOpenAddTransaction}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={() => {
          // Force query refresh if needed
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        IPO Applications & Account Ledger Tracker • Persistent Offline Storage Enabled
      </footer>

    </div>
  );
}
