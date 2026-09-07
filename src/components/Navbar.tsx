import React from 'react';
import {
  Code2,
  Compass,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Database,
  Sparkles,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { User, DatabaseStatus } from '../types';

interface NavbarProps {
  currentTab: 'roadmap' | 'playground' | 'analytics' | 'community' | 'admin';
  setCurrentTab: (tab: 'roadmap' | 'playground' | 'analytics' | 'community' | 'admin') => void;
  currentUser: User | null;
  onSwitchRole: (role: 'student' | 'admin') => void;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal: () => void;
  onOpenAiGenerate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onSwitchRole,
  dbStatus,
  onOpenDbModal,
  onOpenAiGenerate
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentTab('roadmap')}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">CodeElevate</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AI ACADEMY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Adaptive Coding & Real-time AI Feedback</p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('roadmap')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'roadmap'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => setCurrentTab('playground')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'playground'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Playground</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'analytics'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Mistakes</span>
            </button>

            <button
              onClick={() => setCurrentTab('community')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'community'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'admin'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Quick AI Question Generator Button */}
            <button
              onClick={onOpenAiGenerate}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow hover:opacity-95 transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Problem Generator</span>
            </button>

            {/* Database Status indicator */}
            <button
              onClick={onOpenDbModal}
              title="MongoDB Connection Status"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
                {dbStatus?.type === 'mongodb_atlas' ? 'Atlas' : dbStatus?.type === 'mongodb_local' ? 'Local' : 'MongoDB'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* User Stats & Role Switcher */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              {currentUser && (
                <div className="hidden sm:flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1 text-amber-400 font-semibold" title="Daily Streak">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{currentUser.streakDays}d</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-400 font-semibold" title="Problems Solved">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{currentUser.totalSolved}</span>
                  </div>
                </div>
              )}

              {/* Role Badge & Switcher */}
              <div className="relative group">
                <button
                  onClick={() => onSwitchRole(currentUser?.role === 'admin' ? 'student' : 'admin')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    currentUser?.role === 'admin'
                      ? 'bg-purple-950/60 text-purple-300 border-purple-700/50 hover:bg-purple-900/60'
                      : 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50 hover:bg-indigo-900/60'
                  }`}
                  title="Click to toggle between Student and Admin testing mode"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="capitalize">{currentUser?.role || 'Student'}</span>
                  <span className="text-[10px] bg-slate-800 px-1 py-0.2 rounded text-slate-400">Toggle</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`px-2 py-1 rounded ${currentTab === 'roadmap' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setCurrentTab('playground')}
            className={`px-2 py-1 rounded ${currentTab === 'playground' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            Playground
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`px-2 py-1 rounded ${currentTab === 'analytics' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setCurrentTab('community')}
            className={`px-2 py-1 rounded ${currentTab === 'community' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            Community
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-2 py-1 rounded ${currentTab === 'admin' ? 'text-purple-400 font-bold' : 'text-slate-400'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
