import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { AdminStudentMetric } from '../types';

interface DeleteUserModalProps {
  isOpen: boolean;
  student: AdminStudentMetric | null;
  onClose: () => void;
  onUserDeleted: (studentId: string) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  student,
  onClose,
  onUserDeleted
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const isProtectedRoot = student.id === 'usr_admin_root';

  const handleDelete = async () => {
    if (isProtectedRoot) {
      setErrorMsg('This primary system administrator account cannot be deleted.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${student.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user.');
      }

      onUserDeleted(student.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while deleting the user.');
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
              <h3 className="font-bold text-white text-base">Delete User Account</h3>
              <p className="text-[11px] text-slate-400">Irreversible database purge operation</p>
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
              <span className="font-bold text-white text-sm">{student.username}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {student.role}
              </span>
            </div>
            <div className="text-slate-400">{student.email}</div>
            <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-300">
              <div>Solved: <span className="font-bold text-emerald-400">{student.totalSolved}</span></div>
              <div>Submissions: <span className="font-bold text-indigo-400">{student.totalSubmissions}</span></div>
              <div>Pass Rate: <span className="font-bold text-amber-400">{student.passRate}%</span></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/30 text-rose-200 space-y-1">
            <div className="font-semibold flex items-center space-x-1 text-rose-300">
              <ShieldAlert className="w-4 h-4" />
              <span>Warning: Permanent Cascade Purge</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-200/80">
              Deleting this user will permanently remove their profile, authentication tokens, problem solving history, and all code submissions from the database. This action cannot be undone.
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
              disabled={isLoading || isProtectedRoot}
              className="px-4 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Purging User...' : 'Permanently Delete User'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
