import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Save } from 'lucide-react';
import type { Person, IPO, TransactionType } from '../../types';
import { getTodayInputValue } from '../../utils/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  ipos: IPO[];
  initialType?: TransactionType;
  initialPersonId?: string;
  onSave: (txData: {
    personId: string;
    type: TransactionType;
    amount: number;
    date: string;
    ipoId?: string;
    note?: string;
  }) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  people,
  ipos,
  initialType = 'SENT',
  initialPersonId = '',
  onSave,
}) => {
  const today = getTodayInputValue();
  const [personId, setPersonId] = useState(initialPersonId);
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [ipoId, setIpoId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setType(initialType);
    if (initialPersonId) {
      setPersonId(initialPersonId);
    } else if (people.length > 0 && !personId) {
      setPersonId(people[0].id);
    }
  }, [initialType, initialPersonId, people, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId || !amount) return;

    onSave({
      personId,
      type,
      amount: parseFloat(amount),
      date,
      ipoId: ipoId || undefined,
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === 'SENT'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
            }`}>
              {type === 'SENT' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {type === 'SENT' ? 'Record Money Sent' : 'Record Money Received'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setType('SENT')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                type === 'SENT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Money Sent</span>
            </button>

            <button
              type="button"
              onClick={() => setType('RECEIVED')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                type === 'RECEIVED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Money Received</span>
            </button>
          </div>

          {/* Select Person */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Person / Account <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium"
            >
              <option value="">Choose a person...</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.bankBroker ? `(${p.bankBroker})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                step="100"
                placeholder="200000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Optional Related IPO */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Optional Related IPO
            </label>
            <select
              value={ipoId}
              onChange={(e) => setIpoId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            >
              <option value="">None / General Transfer</option>
              {ipos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Note / Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. IPO fund transfer / Refund after allotment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center space-x-1.5 px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-sm transition-all ${
                type === 'SENT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Record {type === 'SENT' ? 'Sent' : 'Received'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
