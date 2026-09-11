import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';
import { CodeElevateLogo, CodeElevateIcon } from './CodeElevateLogo';

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
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col justify-between selection:bg-[#FF5A43]/30 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-[#1c1c28] bg-[#09090e]/80 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={onGoToStudentLogin}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF5A43]" />
          <span>Learner Portal</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={onGoToFacultyLogin}
            className="text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-[#14141e] hover:bg-[#1a1a28] border border-[#252535]"
          >
            Faculty Portal
          </button>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5A43] animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF8570] font-bold">
              Root Authority Mode
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#0f0f16] border border-[#262638] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Ambient Coral Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FF5A43]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#FF5A43]/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Brand & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-4">
              <CodeElevateIcon size={64} className="shadow-2xl shadow-[#FF5A43]/20" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5A43]/10 text-[#FF8570] border border-[#FF5A43]/30">
              <ShieldCheck className="w-3 h-3 text-[#FF5A43]" />
              <span>Privileged System Gateway</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">Administrator Sign-In</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Authenticate with root credentials to manage system users, curriculum databases, and cloud security rules.
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin User Identifier / Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@codeelevate.io"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#161622] border border-[#272738] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Root Master Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#161622] border border-[#272738] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4 hover:scale-[1.01]"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate as Root Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#1c1c28] text-center text-xs text-slate-500">
        <p>CodeElevate Administrative Console • Protected with PBKDF2 cryptography & Role-Based Access Control</p>
      </footer>
    </div>
  );
};
