import React, { useState } from 'react';
import { UserPlus, X, Mail, User as UserIcon, KeyRound, Target, Code, Award, Flame, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (newUser: any) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('studentpass123');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [batch, setBatch] = useState('Batch 2026-A');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('javascript');
  const [targetGoal, setTargetGoal] = useState('Master Algorithmic Problem Solving & Technical Interviews');
  const [streakDays, setStreakDays] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: 'student' | 'faculty' | 'admin') => {
    setRole(newRole);
    if (newRole === 'faculty') {
      setPassword('FacultyPass123!');
      setBatch('Faculty Department');
      setTargetGoal('Curriculum instruction, problem authoring & batch cohort tracking');
    } else if (newRole === 'admin') {
      setPassword('AdminPass123!');
      setBatch('Administration');
      setTargetGoal('Academy platform oversight & system administration');
    } else {
      setPassword('studentpass123');
      setBatch('Batch 2026-A');
      setTargetGoal('Master Algorithmic Problem Solving & Technical Interviews');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setErrorMsg('Username and email are required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          batch: batch.trim() || 'Batch 2026-A',
          skillLevel,
          preferredLanguage,
          targetGoal,
          streakDays: Number(streakDays) || 0,
          totalSolved: Number(totalSolved) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user.');
      }

      onUserAdded(data.user);
      onClose();
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('studentpass123');
      setRole('student');
      setBatch('Batch 2026-A');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while adding the user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-purple-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Enroll New User</h3>
              <p className="text-[11px] text-slate-400">Add a student or administrator to the database directory</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Username *</label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. jordan_algo"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. jordan@student.io"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Initial Password</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="studentpass123"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">User Status / System Role *</label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="student">Student (Learner)</option>
                <option value="faculty">Faculty (Instructor / Batch Mentor)</option>
                <option value="admin">Admin (System Administrator)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {role === 'faculty' ? 'Assigned Department / Batch' : role === 'admin' ? 'Administrative Unit' : 'Assigned Batch / Cohort *'}
              </label>
              <input
                type="text"
                value={batch}
                onChange={e => setBatch(e.target.value)}
                placeholder="e.g. Batch 2026-A or CS-Section-101"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Initial Skill Tier</label>
              <select
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={e => setPreferredLanguage(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
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
            <label className="block font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Learning Goal</span>
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              placeholder="e.g. Master dynamic programming and trees for interview preparation"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Initial Streak (Days)</span>
              </label>
              <input
                type="number"
                min="0"
                value={streakDays}
                onChange={e => setStreakDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Initial Solved Count</span>
              </label>
              <input
                type="number"
                min="0"
                value={totalSolved}
                onChange={e => setTotalSolved(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Creating User...' : 'Add User to Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
