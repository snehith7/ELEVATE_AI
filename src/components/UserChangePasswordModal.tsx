import React, { useState } from 'react';
import { KeyRound, X, AlertCircle, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface UserChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  user?: User | null;
  authToken?: string;
  onSuccess: (msg: string) => void;
}

export const UserChangePasswordModal: React.FC<UserChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  user,
  authToken,
  onSuccess
}) => {
  const activeUser = currentUser || user;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !activeUser) return null;

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your Current Password.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMsg('Please enter a New Password.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('New Password must be at least 4 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('New Password must be different from your Current Password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New Password and Confirm New Password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const token = authToken || activeUser.id;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: activeUser.id,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password. Please verify current password.');
      }

      onSuccess(data.message || 'Password updated successfully!');
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while changing your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="user-change-password-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#0f172a] border border-cyan-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Change Account Password</h3>
              <p className="text-[11px] text-slate-400">
                Security settings for <span className="text-cyan-300 font-semibold">{activeUser.username}</span> ({activeUser.role || 'user'})
              </p>
            </div>
          </div>
          <button
            id="close-change-password-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label htmlFor="current-password-input" className="block font-semibold text-slate-300 mb-1.5">
              Current Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="current-password-input"
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current account password"
                className="w-full pl-8 pr-10 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                tabIndex={-1}
                title={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new-password-input" className="block font-semibold text-slate-300 mb-1.5">
              New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="new-password-input"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 4 characters"
                className="w-full pl-8 pr-10 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                tabIndex={-1}
                title={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirm-new-password-input" className="block font-semibold text-slate-300 mb-1.5">
              Confirm New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="confirm-new-password-input"
                name="confirmNewPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-8 pr-10 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                tabIndex={-1}
                title={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              id="cancel-change-password-btn"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-change-password-btn"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
