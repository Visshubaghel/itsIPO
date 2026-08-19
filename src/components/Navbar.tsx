import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  LayoutDashboard, 
  Plus, 
  Moon, 
  Sun, 
  HardDriveDownload,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'ipos' | 'people' | 'money';
  setActiveTab: (tab: 'dashboard' | 'ipos' | 'people' | 'money') => void;
  onOpenAddIPO: () => void;
  onOpenAddTransaction: (type?: 'SENT' | 'RECEIVED') => void;
  onOpenSettings: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddIPO,
  onOpenAddTransaction,
  onOpenSettings,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">IPO Tracker</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Pro
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('ipos')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ipos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>IPO Applications</span>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'people'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>People / Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab('money')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'money'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Money & History</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddIPO}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add IPO</span>
            </button>

            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={() => onOpenAddTransaction('SENT')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-all"
                title="Money Sent"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+ Sent</span>
              </button>

              <button
                onClick={() => onOpenAddTransaction('RECEIVED')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-all"
                title="Money Received"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>+ Received</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Backup & Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Settings & Backup"
            >
              <HardDriveDownload className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 overflow-x-auto justify-around bg-slate-50 dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('ipos')}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === 'ipos' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          IPOs
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === 'people' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          People
        </button>
        <button
          onClick={() => setActiveTab('money')}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === 'money' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Money
        </button>
      </div>
    </header>
  );
};
