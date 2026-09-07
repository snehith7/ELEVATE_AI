import React, { useState } from 'react';
import {
  Code2,
  Lock,
  Mail,
  KeyRound,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { SupportedLanguage, SkillLevel } from '../types';

interface StudentLoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onGoToFacultyLogin: () => void;
  onGoToAdminLogin: () => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({
  onLoginSuccess,
  onGoToFacultyLogin,
  onGoToAdminLogin
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('javascript');
  const [targetGoal, setTargetGoal] = useState('Master Algorithmic Interviews & Problem Solving');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
      const body = isRegisterMode
        ? {
            username: username.trim() || email.split('@')[0],
            email: email.trim().toLowerCase(),
            password,
            skillLevel,
            preferredLanguage,
            targetGoal
          }
        : { email: email.trim().toLowerCase(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">CodeElevate</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              STUDENT PORTAL
            </span>
          </div>
        </div>

        {/* Links to Separate Faculty & Admin Portals */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onGoToFacultyLogin}
            className="flex items-center space-x-1 text-xs font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40"
          >
            <span>Faculty Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGoToAdminLogin}
            className="flex items-center space-x-1 text-xs font-semibold text-purple-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40"
          >
            <span>Admin Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Learner Authentication</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {isRegisterMode ? 'Create Student Account' : 'Student Sign-In'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {isRegisterMode
                ? 'Register your profile to begin adaptive practice with instant AI code evaluations.'
                : 'Sign in to access your interactive roadmaps, coding playground, and community.'}
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Username *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. dev_jordan"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@codeelevate.io"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {isRegisterMode && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Tier</label>
                    <select
                      value={skillLevel}
                      onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={e => setPreferredLanguage(e.target.value as SupportedLanguage)}
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Learning Target / Goal</label>
                  <input
                    type="text"
                    value={targetGoal}
                    onChange={e => setTargetGoal(e.target.value)}
                    placeholder="e.g. Master dynamic programming and algorithms"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : isRegisterMode ? 'Complete Registration' : 'Sign In as Student'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="text-xs text-slate-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              {isRegisterMode
                ? 'Already registered? Sign In to your account'
                : "New student? Register a new account"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onGoToFacultyLogin}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Faculty Sign-In Portal
          </button>
          <span>•</span>
          <button
            onClick={onGoToAdminLogin}
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Root Administrator Gateway
          </button>
        </div>
      </footer>
    </div>
  );
};
