import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Code2 } from 'lucide-react';
import { Problem } from '../types';

interface DeleteProblemModalProps {
  isOpen: boolean;
  problem: Problem | null;
  onClose: () => void;
  onProblemDeleted: (problemId: string) => void;
}

export const DeleteProblemModal: React.FC<DeleteProblemModalProps> = ({
  isOpen,
  problem,
  onClose,
  onProblemDeleted
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !problem) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/problems/${problem.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete problem.');
      }

      onProblemDeleted(problem.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while deleting the problem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-rose-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-rose-400">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Delete Curriculum Problem</h3>
              <p className="text-[11px] text-slate-400">Irreversible catalog removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>{problem.title}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                problem.difficulty === 'basic'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : problem.difficulty === 'intermediate'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="text-slate-400 font-medium">Category: <span className="text-purple-300">{problem.category}</span></div>
            <div className="text-[11px] text-slate-500 line-clamp-2">{problem.description}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/30 text-rose-200 space-y-1">
            <div className="font-semibold flex items-center space-x-1 text-rose-300">
              <ShieldAlert className="w-4 h-4" />
              <span>Permanent Deletion Warning</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-200/80">
              Removing this problem will permanently purge it from the student curriculum roadmap, and all student test submissions and evaluations for this problem will be cascade deleted.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Deleting Problem...' : 'Permanently Delete Problem'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
