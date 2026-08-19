import React, { useState } from 'react';
import type { IPO, IPOApplication, Person, ApplicationStatus } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Edit2,
  Calendar,
  Building,
  Info
} from 'lucide-react';


interface IPOApplicationsProps {
  ipos: IPO[];
  applications: IPOApplication[];
  people: Person[];
  onOpenAddIPO: () => void;
  onUpdateStatus: (applicationId: string, newStatus: ApplicationStatus) => void;
  onUpdateAmount: (applicationId: string, newAmount: number) => void;
  onAddPersonToIPO: (ipoId: string, personId: string) => void;
  onDeleteIPO: (ipoId: string) => void;
  onDeleteApplication: (applicationId: string) => void;
}

export const IPOApplications: React.FC<IPOApplicationsProps> = ({
  ipos,
  applications,
  people,
  onOpenAddIPO,
  onUpdateStatus,
  onUpdateAmount,
  onAddPersonToIPO,
  onDeleteIPO,
  onDeleteApplication,
}) => {
  const [editingAmountAppId, setEditingAmountAppId] = useState<string | null>(null);
  const [editingAmountValue, setEditingAmountValue] = useState<string>('');
  const [addingPersonIPOId, setAddingPersonIPOId] = useState<string | null>(null);
  const [selectedPersonForIPO, setSelectedPersonForIPO] = useState<string>('');

  const personMap = new Map(people.map((p) => [p.id, p]));

  const handleStartEditAmount = (app: IPOApplication) => {
    setEditingAmountAppId(app.id);
    setEditingAmountValue(app.amount.toString());
  };

  const handleSaveEditAmount = (appId: string) => {
    const val = parseFloat(editingAmountValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateAmount(appId, val);
    }
    setEditingAmountAppId(null);
  };

  const handleConfirmAddPersonToIPO = (ipoId: string) => {
    if (selectedPersonForIPO) {
      onAddPersonToIPO(ipoId, selectedPersonForIPO);
      setSelectedPersonForIPO('');
      setAddingPersonIPOId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            IPO Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage multi-account IPO submissions, amounts, and live allotment statuses.
          </p>
        </div>

        <button
          onClick={onOpenAddIPO}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New IPO</span>
        </button>
      </div>

      {ipos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No IPOs Added Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Click the button below to create your first IPO. All active people accounts will automatically be added!
          </p>
          <button
            onClick={onOpenAddIPO}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First IPO</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {ipos.map((ipo) => {
            const ipoApps = applications.filter((a) => a.ipoId === ipo.id);
            const activePeopleInIPO = new Set(ipoApps.map((a) => a.personId));
            const availablePeopleToAdd = people.filter((p) => !activePeopleInIPO.has(p.id));

            const totalAppliedAmount = ipoApps
              .filter((a) => a.status !== 'Not Applied')
              .reduce((sum, a) => sum + Number(a.amount || 0), 0);

            const allottedCount = ipoApps.filter((a) => a.status === 'Allotted').length;

            return (
              <div
                key={ipo.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                
                {/* IPO Card Header */}
                <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {ipo.name}
                      </h2>
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {formatINR(ipo.amountRequired)} per lot
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {ipo.biddingStartDate && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Bid: {formatDate(ipo.biddingStartDate)}</span>
                        </span>
                      )}
                      {ipo.allotmentDate && (
                        <span className="flex items-center space-x-1">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>Allotment: {formatDate(ipo.allotmentDate)}</span>
                        </span>
                      )}
                      {ipo.note && (
                        <span className="italic text-slate-400">"{ipo.note}"</span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this IPO */}
                  <div className="flex items-center space-x-2">
                    {/* Add person manually to this IPO */}
                    {availablePeopleToAdd.length > 0 && (
                      <div className="relative">
                        {addingPersonIPOId === ipo.id ? (
                          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 shadow-sm">
                            <select
                              value={selectedPersonForIPO}
                              onChange={(e) => setSelectedPersonForIPO(e.target.value)}
                              className="text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white font-medium"
                            >
                              <option value="">Select Person...</option>
                              {availablePeopleToAdd.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.bankBroker})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleConfirmAddPersonToIPO(ipo.id)}
                              disabled={!selectedPersonForIPO}
                              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setAddingPersonIPOId(null)}
                              className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingPersonIPOId(ipo.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                            <span>+ Add Person to IPO</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Delete IPO */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${ipo.name}" and all its application records?`)) {
                          onDeleteIPO(ipo.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      title="Delete IPO"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Applicants Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-5">Person / Account</th>
                        <th className="py-3 px-5">Bank / Broker</th>
                        <th className="py-3 px-5 text-right">Application Amount</th>
                        <th className="py-3 px-5 text-center">Status</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {ipoApps.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                            No people attached to this IPO. Click "+ Add Person to IPO" above.
                          </td>
                        </tr>
                      ) : (
                        ipoApps.map((app) => {
                          const person = personMap.get(app.personId);
                          const isEditingAmount = editingAmountAppId === app.id;

                          return (
                            <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                              
                              {/* Person Name & UPI */}
                              <td className="py-3.5 px-5">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {person?.name || 'Unknown Person'}
                                </div>
                                {person?.upiOrAccount && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {person.upiOrAccount}
                                  </div>
                                )}
                              </td>

                              {/* Bank / Broker */}
                              <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 text-xs">
                                {person?.bankBroker || '—'}
                              </td>

                              {/* Editable Amount */}
                              <td className="py-3.5 px-5 text-right font-semibold">
                                {isEditingAmount ? (
                                  <div className="flex items-center justify-end space-x-1">
                                    <input
                                      type="number"
                                      value={editingAmountValue}
                                      onChange={(e) => setEditingAmountValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEditAmount(app.id);
                                        if (e.key === 'Escape') setEditingAmountAppId(null);
                                      }}
                                      className="w-28 text-right text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveEditAmount(app.id)}
                                      className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => handleStartEditAmount(app)}
                                    className="inline-flex items-center space-x-1.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                                    title="Click to edit amount"
                                  >
                                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                                      {formatINR(app.amount)}
                                    </span>
                                    <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                )}
                              </td>

                              {/* Status Dropdown Selector */}
                              <td className="py-3.5 px-5 text-center">
                                <div className="inline-block relative">
                                  <select
                                    value={app.status}
                                    onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                                    className={`text-xs font-bold rounded-lg px-2.5 py-1 appearance-none cursor-pointer pr-6 border transition-all ${
                                      app.status === 'Applied'
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                        : app.status === 'Approved'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                        : app.status === 'Allotted'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                        : app.status === 'Rejected'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    }`}
                                  >
                                    <option value="Not Applied">Not Applied</option>
                                    <option value="Applied">Applied</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Allotted">Allotted 🎉</option>
                                    <option value="Rejected">Rejected</option>
                                  </select>
                                </div>
                              </td>

                              {/* Delete Application */}
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  onClick={() => onDeleteApplication(app.id)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                  title="Remove person from this IPO"
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

                {/* Footer Stats for this IPO */}
                <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                  <div>
                    <span>Total Applicants: <strong>{ipoApps.length}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Allotted: <strong className="text-emerald-600 dark:text-emerald-400">{allottedCount}</strong></span>
                  </div>

                  <div>
                    <span>Capital Allocated: <strong className="text-slate-900 dark:text-white font-bold">{formatINR(totalAppliedAmount)}</strong></span>
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
