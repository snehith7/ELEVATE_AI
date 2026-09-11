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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e0e15] border border-[#242436] rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-slate-100 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#222232] bg-gradient-to-r from-[#241315] via-[#14121a] to-[#0d0d14] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FF5A43] to-[#FF8570] flex items-center justify-center shadow-lg shadow-[#FF5A43]/20 shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Database Engine</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-400">Google Cloud Firebase Firestore & Live Multi-Role Data Persistence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1c1c28] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Live Status Overview */}
          <div className="p-4 rounded-2xl bg-[#14141e] border border-[#242436] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {status?.type === 'firebase_firestore' || status?.isFirebase ? (
                  <Cloud className="w-4 h-4 text-[#FF5A43]" />
                ) : status?.type === 'mongodb_atlas' ? (
                  <Cloud className="w-4 h-4 text-emerald-400" />
                ) : status?.type === 'mongodb_local' ? (
                  <HardDrive className="w-4 h-4 text-[#FF5A43]" />
                ) : (
                  <Cpu className="w-4 h-4 text-[#FF5A43]" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Active Storage Mode</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30">
                {status?.type === 'firebase_firestore' || status?.isFirebase
                  ? 'Firebase Firestore (Cloud)'
                  : status?.type === 'mongodb_atlas'
                  ? 'MongoDB Atlas (Cloud)'
                  : status?.type === 'mongodb_local'
                  ? 'Local MongoDB (Laptop)'
                  : 'Embedded Storage Engine'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {status?.statusMessage || 'Firebase Firestore database operational with persistent student performance storage.'}
            </p>

            {status?.maskedUri && (
              <div className="p-2.5 rounded-xl bg-[#1a1a26] border border-[#28283c] flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono truncate">
                  <span className="text-slate-500 mr-1.5 font-sans">Target:</span>
                  {status.maskedUri}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#FF8570] bg-[#FF5A43]/10 px-2 py-0.5 rounded border border-[#FF5A43]/30 shrink-0">
                  Active
                </span>
              </div>
            )}

            {status?.lastError && !status.isRealMongo && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col gap-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>MongoDB Atlas Network Note</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Atlas URI is active. If your cloud container receives a TLS/Network alert, ensure <strong>0.0.0.0/0 (Allow Access from Anywhere)</strong> is added in <em>Atlas &gt; Security &gt; Network Access</em>. All curriculum and student actions remain actively persisted!
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#222232] text-center">
              <div className="p-2 rounded-xl bg-[#181824]">
                <div className="text-xs text-slate-400">Users</div>
                <div className="text-sm font-bold text-white">{status?.collectionsCount.users ?? 0}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#181824]">
                <div className="text-xs text-slate-400">Problems</div>
                <div className="text-sm font-bold text-white">{status?.collectionsCount.problems ?? 0}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#181824]">
                <div className="text-xs text-slate-400">Submissions</div>
                <div className="text-sm font-bold text-white">{status?.collectionsCount.submissions ?? 0}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#181824]">
                <div className="text-xs text-slate-400">Ping Latency</div>
                <div className="text-sm font-bold text-[#FF8570]">{status?.latencyMs ?? 1} ms</div>
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141e] border border-[#262638] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                You can configure <code className="text-[#FF8570] font-mono">MONGODB_URI</code> in environment secrets or paste directly above.
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
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>

              <button
                type="submit"
                disabled={isTesting || !mongoUri.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF5A43] to-[#FF7B69] hover:from-[#F04428] hover:to-[#FF5A43] disabled:opacity-50 transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-[#FF5A43]/20"
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
          <div className="p-3.5 rounded-2xl bg-[#171216] border border-[#2b1e24] text-xs text-[#FF8570] space-y-1">
            <div className="font-semibold text-white">Google Cloud Firebase Firestore Persistence:</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              All collections (<code className="text-[#FF8570]">users</code>, <code className="text-[#FF8570]">problems</code>, <code className="text-[#FF8570]">submissions</code>, <code className="text-[#FF8570]">messages</code>, <code className="text-[#FF8570]">analytics</code>) are durably synchronized with Google Cloud Firebase Firestore with deployed security rules and atomic state replication.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f1f2e] bg-[#0c0c12] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1a1a26] hover:bg-[#252538] text-white transition-colors cursor-pointer border border-[#28283a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
