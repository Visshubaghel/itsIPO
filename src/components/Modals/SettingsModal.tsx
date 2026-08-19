import React, { useState } from 'react';
import { X, HardDriveDownload, Download, Upload, RefreshCw, Database, Copy, Check } from 'lucide-react';
import { exportDatabaseJSON, importDatabaseJSON, seedInitialData, db } from '../../db/db';
import { getStoredSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../../db/supabase';
import { syncLocalDataToMongoDBAtlas } from '../../db/mongodb';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onRefreshData }) => {
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseConfig());
  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState('');


  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const jsonStr = await exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ipo_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Failed to export data: ' + e.message);
    }
  };


  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await importDatabaseJSON(text);
        setImportStatus('Data successfully restored from file!');
        onRefreshData();
      } catch (err: any) {
        setImportStatus('File Import Error: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset database to demo initial data? Current records will be replaced.')) {
      await db.people.clear();
      await db.ipos.clear();
      await db.applications.clear();
      await db.transactions.clear();
      await seedInitialData();
      onRefreshData();
      alert('Demo data restored successfully!');
      onClose();
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig.url, supabaseConfig.key);
    alert('Supabase credentials saved successfully!');
  };

  const handleClearSupabase = () => {
    clearSupabaseConfig();
    setSupabaseConfig({ url: '', key: '' });
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HardDriveDownload className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Storage & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: Local Backup & Restore */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">IndexedDB Local Backup & Restore</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data is automatically saved in your browser. Export to JSON anytime for local backup.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleExport}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <label className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Backup File</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={handleResetDemoData}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold rounded-lg hover:bg-rose-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>

            {importStatus && (
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                {importStatus}
              </div>
            )}
          </div>

          {/* Section 2: Vercel & MongoDB Atlas Deployment & Sync */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Vercel + MongoDB Atlas Integration</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">Ready</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To deploy on Vercel with MongoDB Atlas database:
            </p>

            <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
              <li>Deploy this repository to <strong>Vercel</strong> (`git push` or Vercel Dashboard).</li>
              <li>Add Environment Variable <strong><code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600 font-mono">MONGODB_URI</code></strong> in Vercel project settings.</li>
              <li>Your serverless API functions under <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">/api/*</code> automatically connect to MongoDB Atlas!</li>
            </ol>

            <div className="pt-1 flex items-center space-x-3">
              <button
                type="button"
                onClick={async () => {
                  setImportStatus('Syncing with MongoDB Atlas via Vercel serverless API...');
                  const res = await syncLocalDataToMongoDBAtlas();
                  if (res.success) {
                    setImportStatus(`✅ MongoDB Atlas Synced! ${res.message || ''}`);
                  } else {
                    setImportStatus(`⚠️ MongoDB Atlas Sync Note: ${res.message}`);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Local Data to MongoDB Atlas</span>
              </button>
            </div>
          </div>

          {/* Section 3: Optional Supabase PostgreSQL Sync */}
          <form onSubmit={handleSaveSupabase} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Supabase / PostgreSQL Integration</span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">Optional</span>
              </h3>

              <button
                type="button"
                onClick={copySqlToClipboard}
                className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect your Supabase PostgreSQL project to sync data to the cloud.
            </p>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseConfig.url}
                onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseConfig.key}
                onChange={(e) => setSupabaseConfig({ ...supabaseConfig, key: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
              >
                Save Credentials
              </button>
              {supabaseConfig.url && (
                <button
                  type="button"
                  onClick={handleClearSupabase}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Clear Config
                </button>
              )}
            </div>
          </form>


        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
