import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onGoToStudentLogin: () => void;
  onGoToFacultyLogin: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onGoToStudentLogin,
  onGoToFacultyLogin
}) => {
  const [email, setEmail] = useState('admin@codeelevate.io');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide administrative email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={onGoToStudentLogin}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Learner Portal</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-semibold">
              Root Administrator Gateway
            </span>
          </div>
          <button
            onClick={onGoToFacultyLogin}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer ml-3 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40"
          >
            Faculty Portal
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Brand & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/20 mb-3">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <Lock className="w-3 h-3" />
              <span>Restricted System Gateway</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Administrator Sign-In</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Authenticate to manage all user accounts (students and faculty), reset passwords, and manage coding curriculum problems.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Administrator Email</span>
                <span className="text-[10px] text-slate-500 font-normal">Root Administrator</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@codeelevate.io"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Master Password</span>
                <span className="text-[10px] text-slate-500 font-normal">Admin Security Key</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Control Center</span>
                </>
              )}
            </button>
          </form>

          {/* Root Admin Note */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Default Root Admin: <span className="font-mono text-slate-400">admin@codeelevate.io</span> / <span className="font-mono text-slate-400">AdminPass123!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>CodeElevate Unified System Administration • Authorized Personnel Only</span>
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoToFacultyLogin}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            Faculty Portal →
          </button>
          <button
            onClick={onGoToStudentLogin}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            Student Sign-In →
          </button>
        </div>
      </footer>
    </div>
  );
};
