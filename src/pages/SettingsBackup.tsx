import { useState } from 'react';
import { Database, Upload, Download, AlertTriangle } from 'lucide-react';

export default function SettingsBackup() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBackup = async () => {
    setBackupLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/backup/create', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Backup created successfully: ${data.filename}`);
        window.location.href = `/api/backup/download/${data.filename}`;
      } else {
        setError(data.error || 'Failed to create backup.');
      }
    } catch (err) {
      setError('An error occurred during backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('WARNING: Restoring a backup will overwrite all current database records. Are you sure you want to proceed?')) {
      e.target.value = '';
      return;
    }

    setRestoreLoading(true);
    setMessage('');
    setError('');
    
    const formData = new FormData();
    formData.append('backupFile', file);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Database restored successfully.');
      } else {
        setError(data.error || 'Failed to restore database.');
      }
    } catch (err) {
      setError('An error occurred during restore.');
    } finally {
      setRestoreLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Backup</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your system backups and administrative settings.</p>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-lg border text-sm ${error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {error || message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <Database className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">Database Backup</h2>
          </div>
          <p className="text-sm text-slate-500">
            Create a complete archive of your SQLite database and all managed files. Store backups securely.
          </p>
        </div>
        <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackup}
            disabled={backupLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {backupLoading ? 'Creating Backup...' : 'Download Backup'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-200 bg-red-50/30">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-900">Restore from Backup</h2>
          </div>
          <p className="text-sm text-red-700 mt-2">
            Restoring a backup will <strong>permanently overwrite</strong> the current database. A safety snapshot will be created, but any changes made since the backup was taken will be lost.
          </p>
        </div>
        <div className="p-6 bg-white flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer disabled:opacity-50 transition-colors relative">
            <Upload className="w-4 h-4" />
            {restoreLoading ? 'Restoring...' : 'Upload & Restore Zip'}
            <input 
              type="file" 
              accept=".zip" 
              onChange={handleRestore}
              disabled={restoreLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
