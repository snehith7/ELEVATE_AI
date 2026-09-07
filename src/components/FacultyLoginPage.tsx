import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  BookOpen,
  Users
} from 'lucide-react';

interface FacultyLoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onGoToStudentLogin: () => void;
  onGoToAdminLogin: () => void;
}

export const FacultyLoginPage: React.FC<FacultyLoginPageProps> = ({
  onLoginSuccess,
  onGoToStudentLogin,
  onGoToAdminLogin
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide faculty email and security password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/faculty/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Faculty authentication failed.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during faculty authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={onGoToStudentLogin}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Learner & Student Portal</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              Faculty & Instructor Portal
            </span>
          </div>
          <button
            onClick={onGoToAdminLogin}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer ml-3 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40"
          >
            Root Admin Portal
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-cyan-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Brand & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-600/20 mb-3">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Users className="w-3 h-3" />
              <span>Instructor & Batch Mentor Gateway</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Faculty Sign-In</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Access your cohort surveillance dashboard, author curriculum problems, and monitor batch test performance.
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
                <span>Faculty Email Address</span>
                <span className="text-[10px] text-slate-500 font-normal">Instructor credentials</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="faculty@codeelevate.io"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Security Password</span>
                <span className="text-[10px] text-slate-500 font-normal">Assigned by admin</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>{isLoading ? 'Verifying Faculty Credentials...' : 'Sign In to Faculty Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Info Notice */}
          <div className="mt-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-400 text-[11px] text-center">
            <span>Need a faculty account? Please contact your institution's system administrator to enroll your profile and assigned batch.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onGoToStudentLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Student Academy Portal
          </button>
          <span>•</span>
          <button
            onClick={onGoToAdminLogin}
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            System Administrator Gateway
          </button>
        </div>
      </footer>
    </div>
  );
};
