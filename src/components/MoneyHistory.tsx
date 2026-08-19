import React, { useState } from 'react';
import type { Person, Transaction, IPO } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Trash2, 
  History, 
  Tag
} from 'lucide-react';


interface MoneyHistoryProps {
  people: Person[];
  transactions: Transaction[];
  ipos: IPO[];
  onOpenAddTransaction: (type?: 'SENT' | 'RECEIVED', personId?: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onViewPersonLedger: (person: Person) => void;
}

export const MoneyHistory: React.FC<MoneyHistoryProps> = ({
  people,
  transactions,
  ipos,
  onOpenAddTransaction,
  onDeleteTransaction,
  onViewPersonLedger,
}) => {
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SENT' | 'RECEIVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const personMap = new Map(people.map((p) => [p.id, p]));
  const ipoMap = new Map(ipos.map((i) => [i.id, i]));

  // Calculate per-person balances
  const personSummaries = people.map((person) => {
    const personTxs = transactions.filter((t) => t.personId === person.id);
    const sent = personTxs.filter((t) => t.type === 'SENT').reduce((s, t) => s + Number(t.amount || 0), 0);
    const received = personTxs.filter((t) => t.type === 'RECEIVED').reduce((s, t) => s + Number(t.amount || 0), 0);
    return {
      person,
      totalSent: sent,
      totalReceived: received,
      balance: sent - received,
      txCount: personTxs.length,
    };
  });

  // Overall totals
  const totalSentAll = transactions.filter((t) => t.type === 'SENT').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalReceivedAll = transactions.filter((t) => t.type === 'RECEIVED').reduce((s, t) => s + Number(t.amount || 0), 0);
  const netBalanceAll = totalSentAll - totalReceivedAll;

  // Filtered transactions for the full history log
  const filteredTransactions = transactions
    .filter((tx) => {
      if (selectedPersonFilter !== 'ALL' && tx.personId !== selectedPersonFilter) return false;
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const person = personMap.get(tx.personId);
        const relatedIPO = tx.ipoId ? ipoMap.get(tx.ipoId) : null;
        const matchesName = person?.name.toLowerCase().includes(query);
        const matchesNote = tx.note?.toLowerCase().includes(query);
        const matchesIPO = relatedIPO?.name.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);
        if (!matchesName && !matchesNote && !matchesIPO && !matchesAmount) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Money Exchanged & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track capital sent and received per account with automated balance calculations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenAddTransaction('SENT')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Money Sent</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('RECEIVED')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Money Received</span>
          </button>
        </div>
      </div>

      {/* Part 1: Person-by-Person Ledger Summary Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Balances Summary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total capital distributed across people</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">Net Outstanding:</span>
            <span className="ml-2 font-extrabold text-slate-900 dark:text-white text-base">{formatINR(netBalanceAll)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Person</th>
                <th className="py-3 px-5 text-right">Total Money Sent</th>
                <th className="py-3 px-5 text-right">Total Money Received</th>
                <th className="py-3 px-5 text-right">Current Balance</th>
                <th className="py-3 px-5 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {personSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No people added yet.
                  </td>
                </tr>
              ) : (
                personSummaries.map(({ person, totalSent, totalReceived, balance }) => (
                  <tr key={person.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <div 
                        onClick={() => onViewPersonLedger(person)}
                        className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {person.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {person.upiOrAccount || person.bankBroker || '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatINR(totalSent)}
                    </td>

                    <td className="py-3.5 px-5 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {formatINR(totalReceived)}
                    </td>

                    <td className="py-3.5 px-5 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatINR(balance)}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onOpenAddTransaction('SENT', person.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                        >
                          + Sent
                        </button>
                        <button
                          onClick={() => onOpenAddTransaction('RECEIVED', person.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold border border-blue-200 dark:border-blue-800"
                        >
                          + Received
                        </button>
                        <button
                          onClick={() => onViewPersonLedger(person)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium"
                          title="Full history"
                        >
                          <History className="w-3.5 h-3.5 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part 2: Complete Filterable History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Complete Transaction History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">All past records are safely saved and accessible</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes, names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Person Filter */}
            <select
              value={selectedPersonFilter}
              onChange={(e) => setSelectedPersonFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
            >
              <option value="ALL">All People</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="SENT">Sent Only</option>
              <option value="RECEIVED">Received Only</option>
            </select>

          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Person</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Related IPO</th>
                <th className="py-3 px-4">Note / Reason</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const person = personMap.get(tx.personId);
                  const relatedIPO = tx.ipoId ? ipoMap.get(tx.ipoId) : null;
                  const isSent = tx.type === 'SENT';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      
                      {/* Date */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Person */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {person?.name || 'Unknown'}
                      </td>

                      {/* Type Pill */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isSent 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                        }`}>
                          {isSent ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          <span>{isSent ? 'Sent' : 'Received'}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`py-3 px-4 text-right font-extrabold ${
                        isSent ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {isSent ? '-' : '+'}{formatINR(tx.amount)}
                      </td>

                      {/* Related IPO */}
                      <td className="py-3 px-4 text-xs">
                        {relatedIPO ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
                            <Tag className="w-3 h-3" />
                            <span>{relatedIPO.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {tx.note || <span className="text-slate-400 italic">No note</span>}
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete transaction of ${formatINR(tx.amount)} for ${person?.name}?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
