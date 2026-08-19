import React from 'react';
import type { Person, Transaction } from '../types';

import { formatINR } from '../utils/formatters';
import { 
  UserPlus, 
  User, 
  Edit3, 
  Trash2, 
  History, 
  Building,
  CreditCard
} from 'lucide-react';


interface PeopleAccountsProps {
  people: Person[];
  transactions: Transaction[];
  onOpenAddPerson: () => void;
  onEditPerson: (person: Person) => void;
  onToggleActive: (personId: string, currentActiveState: boolean) => void;
  onDeletePerson: (personId: string) => void;
  onViewPersonLedger: (person: Person) => void;
}

export const PeopleAccounts: React.FC<PeopleAccountsProps> = ({
  people,
  transactions,
  onOpenAddPerson,
  onEditPerson,
  onToggleActive,
  onDeletePerson,
  onViewPersonLedger,
}) => {

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            People & Fixed Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fixed family and friend accounts auto-populated for every new IPO.
          </p>
        </div>

        <button
          onClick={onOpenAddPerson}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Person</span>
        </button>
      </div>

      {people.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No People Accounts Added</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Add fixed people accounts (family, friends, self) to easily batch-apply for IPOs.
          </p>
          <button
            onClick={onOpenAddPerson}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add First Person</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => {
            const personTx = transactions.filter((t) => t.personId === person.id);
            const totalSent = personTx.filter((t) => t.type === 'SENT').reduce((s, t) => s + Number(t.amount || 0), 0);
            const totalReceived = personTx.filter((t) => t.type === 'RECEIVED').reduce((s, t) => s + Number(t.amount || 0), 0);
            const balance = totalSent - totalReceived;


            return (
              <div
                key={person.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                  person.isActive
                    ? 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                    : 'border-slate-200/40 dark:border-slate-800/40 opacity-70 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                
                {/* Header Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-base">
                        {person.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {person.name}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{person.bankBroker || 'No Bank Info'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Status Pill */}
                    <button
                      onClick={() => onToggleActive(person.id, person.isActive)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                        person.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                      title="Click to toggle active status"
                    >
                      {person.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* UPI / Default Amount */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>UPI / Acc:</span>
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                        {person.upiOrAccount || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Default IPO Amount:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatINR(person.defaultAmount)}
                      </span>
                    </div>
                  </div>

                  {person.note && (
                    <div className="mt-2 text-xs italic text-slate-400">
                      "{person.note}"
                    </div>
                  )}

                  {/* Ledger Quick Summary */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center py-2.5 px-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Sent</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatINR(totalSent)}</div>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Received</div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{formatINR(totalReceived)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Balance</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">{formatINR(balance)}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onViewPersonLedger(person)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View History ({personTx.length})</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditPerson(person)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit person details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete person "${person.name}" and remove their record?`)) {
                          onDeletePerson(person.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete person"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
