import React from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Trash2, History } from 'lucide-react';
import type { Person, Transaction, IPO } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

interface PersonLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  transactions: Transaction[];
  ipos: IPO[];
  onDeleteTransaction: (txId: string) => void;
  onOpenAddTransaction: (type?: 'SENT' | 'RECEIVED', personId?: string) => void;
}

export const PersonLedgerModal: React.FC<PersonLedgerModalProps> = ({
  isOpen,
  onClose,
  person,
  transactions,
  ipos,
  onDeleteTransaction,
  onOpenAddTransaction,
}) => {
  if (!isOpen || !person) return null;

  const ipoMap = new Map(ipos.map((i) => [i.id, i]));
  const personTxs = transactions
    .filter((t) => t.personId === person.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSent = personTxs.filter((t) => t.type === 'SENT').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalReceived = personTxs.filter((t) => t.type === 'RECEIVED').reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = totalSent - totalReceived;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              {person.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{person.name}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">({person.bankBroker || 'Account'})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                UPI/Acc: <span className="font-mono text-slate-700 dark:text-slate-300">{person.upiOrAccount || 'N/A'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Balance Summary Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Sent</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(totalSent)}</div>
          </div>
          <div className="border-x border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Received</div>
            <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{formatINR(totalReceived)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Balance</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">{formatINR(balance)}</div>
          </div>
        </div>

        {/* Complete History Table */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <History className="w-3.5 h-3.5" />
              <span>Full Transaction History ({personTxs.length})</span>
            </h3>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAddTransaction('SENT', person.id)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                + Sent
              </button>
              <button
                onClick={() => onOpenAddTransaction('RECEIVED', person.id)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                + Received
              </button>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-semibold uppercase">
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-center">Type</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5">Related IPO</th>
                <th className="py-2.5">Note</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {personTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No transactions recorded for {person.name} yet.
                  </td>
                </tr>
              ) : (
                personTxs.map((tx) => {
                  const relatedIPO = tx.ipoId ? ipoMap.get(tx.ipoId) : null;
                  const isSent = tx.type === 'SENT';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isSent 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {isSent ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          <span>{isSent ? 'Sent' : 'Received'}</span>
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold ${
                        isSent ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {isSent ? '-' : '+'}{formatINR(tx.amount)}
                      </td>
                      <td className="py-3 text-xs">
                        {relatedIPO ? (
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {relatedIPO.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-slate-600 dark:text-slate-300">
                        {tx.note || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
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

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
          >
            Close Ledger
          </button>
        </div>

      </div>
    </div>
  );
};
