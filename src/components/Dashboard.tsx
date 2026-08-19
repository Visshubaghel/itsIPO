import React from 'react';
import type { IPO, IPOApplication, Person, Transaction } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  TrendingUp, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  ipos: IPO[];
  applications: IPOApplication[];
  people: Person[];
  transactions: Transaction[];
  onOpenAddIPO: () => void;
  onOpenAddTransaction: (type?: 'SENT' | 'RECEIVED') => void;
  onNavigateToIPOs: () => void;
  onNavigateToMoney: () => void;
  onNavigateToPeople: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  ipos,
  applications,
  people,
  transactions,
  onOpenAddIPO,
  onOpenAddTransaction,
  onNavigateToIPOs,
  onNavigateToMoney,
}) => {

  // Calculate key summary metrics
  const totalIPOs = ipos.length;
  const totalApplications = applications.length;

  const totalMoneySent = transactions
    .filter((t) => t.type === 'SENT')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalMoneyReceived = transactions
    .filter((t) => t.type === 'RECEIVED')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalMoneySent - totalMoneyReceived;

  // Recent 4 IPOs
  const recentIPOs = [...ipos].reverse().slice(0, 4);

  // Recent 5 Transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const personMap = new Map(people.map((p) => [p.id, p]));
  const ipoMap = new Map(ipos.map((i) => [i.id, i]));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            IPO & Account Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of active IPO applications, capital allocations, and person ledgers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAddIPO}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New IPO</span>
          </button>
          <button
            onClick={() => onOpenAddTransaction('SENT')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-sm font-semibold border border-emerald-200 dark:border-emerald-800 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Money Sent</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total IPOs */}
        <div 
          onClick={onNavigateToIPOs}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total IPOs
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalIPOs}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <span>Manage IPO batches</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Total Applications */}
        <div 
          onClick={onNavigateToIPOs}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalApplications}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across {people.filter(p => p.isActive).length} active accounts
          </div>
        </div>

        {/* Total Money Sent */}
        <div 
          onClick={onNavigateToMoney}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Money Sent
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
              {formatINR(totalMoneySent)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Capital provided to accounts
          </div>
        </div>

        {/* Total Money Received & Net Balance */}
        <div 
          onClick={onNavigateToMoney}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Money Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 tracking-tight">
              {formatINR(totalMoneyReceived)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Net Balance:</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatINR(netBalance)}</span>
          </div>
        </div>

      </div>

      {/* Main Content Sections: Recent IPOs & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Recent IPOs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent IPOs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest active IPO campaigns</p>
            </div>
            <button
              onClick={onNavigateToIPOs}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentIPOs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No IPOs created yet. Click "+ New IPO" to get started.
              </div>
            ) : (
              recentIPOs.map((ipo) => {
                const ipoApps = applications.filter((a) => a.ipoId === ipo.id);
                const appliedCount = ipoApps.filter((a) => a.status === 'Applied').length;
                const allottedCount = ipoApps.filter((a) => a.status === 'Allotted').length;
                const approvedCount = ipoApps.filter((a) => a.status === 'Approved').length;

                return (
                  <div
                    key={ipo.id}
                    onClick={onNavigateToIPOs}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/60 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {ipo.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>Required: <strong className="text-slate-700 dark:text-slate-300">{formatINR(ipo.amountRequired)}</strong></span>
                        <span>•</span>
                        <span>Applicants: <strong>{ipoApps.length}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {allottedCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                          {allottedCount} Allotted
                        </span>
                      )}
                      {appliedCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                          {appliedCount} Applied
                        </span>
                      )}
                      {approvedCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                          {approvedCount} Approved
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest money sent & received</p>
            </div>
            <button
              onClick={onNavigateToMoney}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const person = personMap.get(tx.personId);
                const relatedIPO = tx.ipoId ? ipoMap.get(tx.ipoId) : null;
                const isSent = tx.type === 'SENT';

                return (
                  <div
                    key={tx.id}
                    onClick={onNavigateToMoney}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSent 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {person?.name || 'Unknown Person'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
                          <span>{formatDate(tx.date)}</span>
                          {relatedIPO && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">{relatedIPO.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold text-sm ${
                        isSent ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {isSent ? '-' : '+'}{formatINR(tx.amount)}
                      </div>
                      <div className="text-xs text-slate-400 capitalize">
                        {isSent ? 'Money Sent' : 'Money Received'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
