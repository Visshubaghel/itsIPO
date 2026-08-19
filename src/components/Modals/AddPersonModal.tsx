import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import type { Person } from '../../types';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
  onSave: (personData: {
    id?: string;
    name: string;
    bankBroker: string;
    upiOrAccount: string;
    defaultAmount: number;
    note?: string;
    isActive: boolean;
  }) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [bankBroker, setBankBroker] = useState('');
  const [upiOrAccount, setUpiOrAccount] = useState('');
  const [defaultAmount, setDefaultAmount] = useState('200000');
  const [note, setNote] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setBankBroker(personToEdit.bankBroker || '');
      setUpiOrAccount(personToEdit.upiOrAccount || '');
      setDefaultAmount(personToEdit.defaultAmount.toString());
      setNote(personToEdit.note || '');
      setIsActive(personToEdit.isActive);
    } else {
      setName('');
      setBankBroker('');
      setUpiOrAccount('');
      setDefaultAmount('200000');
      setNote('');
      setIsActive(true);
    }
  }, [personToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: personToEdit?.id,
      name: name.trim(),
      bankBroker: bankBroker.trim(),
      upiOrAccount: upiOrAccount.trim(),
      defaultAmount: parseFloat(defaultAmount) || 200000,
      note: note.trim(),
      isActive,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {personToEdit ? 'Edit Person Profile' : 'Add Fixed Person Account'}
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
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Bank / Broker
              </label>
              <input
                type="text"
                placeholder="HDFC / Zerodha"
                value={bankBroker}
                onChange={(e) => setBankBroker(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                UPI ID or Account Nickname
              </label>
              <input
                type="text"
                placeholder="rahul@hdfcbank"
                value={upiOrAccount}
                onChange={(e) => setUpiOrAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Default IPO Application Amount (₹)
            </label>
            <input
              type="number"
              required
              placeholder="200000"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Primary self account"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active Account (Auto-include in new IPOs)
            </label>
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
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{personToEdit ? 'Save Changes' : 'Add Person'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
