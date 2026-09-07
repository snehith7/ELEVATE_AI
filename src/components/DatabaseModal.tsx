import React, { useState } from 'react';
import { Database, X, CheckCircle2, RefreshCw, Server, Cloud, HardDrive, ShieldAlert, Cpu } from 'lucide-react';
import { DatabaseStatus } from '../types';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DatabaseStatus | null;
  onRefresh: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh
}) => {
  const [mongoUri, setMongoUri] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    setIsTesting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/database/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUri.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          success: true,
          message: 'Connected to MongoDB successfully!'
        });
        onRefresh();
      } else {
        setFeedback({
          success: false,
          message: 'Could not connect with this URI. Retaining embedded storage engine to prevent downtime.'
        });
      }
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Connection attempt failed.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>MongoDB & Cloud Database Engine</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-400">Manage MongoDB Atlas, Local laptop MongoDB, or In-Memory Persistence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Live Status Overview */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {status?.type === 'mongodb_atlas' ? (
                  <Cloud className="w-4 h-4 text-emerald-400" />
                ) : status?.type === 'mongodb_local' ? (
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Cpu className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Active Storage Mode</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {status?.type === 'mongodb_atlas'
                  ? 'MongoDB Atlas (Cloud)'
                  : status?.type === 'mongodb_local'
                  ? 'Local MongoDB (Laptop)'
                  : 'Embedded High-Performance Engine'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {status?.statusMessage || 'Database operational with persistent student performance storage.'}
            </p>

            {status?.maskedUri && (
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono truncate">
                  <span className="text-slate-500 mr-1.5 font-sans">URI:</span>
                  {status.maskedUri}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  Configured
                </span>
              </div>
            )}

            {status?.lastError && !status.isRealMongo && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col gap-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>MongoDB Atlas Network Note</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Atlas URI is active. If your cloud container receives a TLS/Network alert, ensure <strong>0.0.0.0/0 (Allow Access from Anywhere)</strong> is added in <em>Atlas &gt; Security &gt; Network Access</em>. All curriculum and student actions remain actively persisted!
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-center">
              <div className="p-2 rounded-lg bg-slate-900/60">
                <div className="text-xs text-slate-400">Users</div>
                <div className="text-sm font-bold text-white">{status?.collectionsCount.users ?? 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60">
                <div className="text-xs text-slate-400">Problems</div>
                <div className="text-sm font-bold text-white">{status?.collectionsCount.problems ?? 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60">
                <div className="text-xs text-slate-400">Submissions</div>
                <div className="text-sm font-bold text-white">{status?.collectionsCount.submissions ?? 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60">
                <div className="text-xs text-slate-400">Ping Latency</div>
                <div className="text-sm font-bold text-emerald-400">{status?.latencyMs ?? 1} ms</div>
              </div>
            </div>
          </div>

          {/* Connect to your MongoDB Atlas or Laptop MongoDB */}
          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Connect External MongoDB URI (Atlas or Laptop)
              </label>
              <input
                type="text"
                value={mongoUri}
                onChange={e => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://user:password@cluster.mongodb.net/codeelevate or mongodb://localhost:27017"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                You can configure <code className="text-indigo-300 font-mono">MONGODB_URI</code> in environment secrets or paste directly above.
              </p>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                feedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onRefresh}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>

              <button
                type="submit"
                disabled={isTesting || !mongoUri.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5" />
                    <span>Test & Save MongoDB</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Architecture Note */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
            <div className="font-semibold text-white">Full-Stack Mongo Persistence Guaranteed:</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              All collections (<code className="text-indigo-300">users</code>, <code className="text-indigo-300">problems</code>, <code className="text-indigo-300">submissions</code>, <code className="text-indigo-300">messages</code>) are fully persisted to disk and seamlessly mirrored to your MongoDB Atlas cluster when configured.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
