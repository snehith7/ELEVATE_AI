import React from 'react';
import {
  Compass,
  BarChart3,
  MessageSquare,
  Flame,
  CheckCircle2,
  Database,
  Sparkles,
  LogOut,
  Code2
} from 'lucide-react';
import { User, DatabaseStatus } from '../types';
import { CodeElevateLogo } from './CodeElevateLogo';

interface NavbarProps {
  currentTab: 'roadmap' | 'playground' | 'analytics' | 'community';
  setCurrentTab: (tab: 'roadmap' | 'playground' | 'analytics' | 'community') => void;
  currentUser: User | null;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal: () => void;
  onOpenAiGenerate: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  dbStatus,
  onOpenDbModal,
  onOpenAiGenerate,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#08080c]/95 backdrop-blur-md border-b border-[#1d1d28] transition-colors shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18 py-2">
          {/* 1. Left Section: Logo & Brand with User Provided Icon */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setCurrentTab('roadmap')}
              className="flex items-center text-left group cursor-pointer focus:outline-none transition-transform hover:scale-[1.02]"
              title="LrnKod"
            >
              <CodeElevateLogo size="md" showText={true} showSubtitle={true} />
            </button>
          </div>

          {/* 2. Center Section: Navigation Links in Coral & Black */}
          <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:px-6">
            <nav
              id="student-main-nav"
              aria-label="Main Navigation"
              className="flex items-center gap-1.5 lg:gap-2 p-1.5 rounded-2xl bg-[#101017] border border-[#20202d] shadow-inner shadow-black/50 backdrop-blur-sm"
            >
              <button
                id="nav-tab-roadmap"
                onClick={() => setCurrentTab('roadmap')}
                className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentTab === 'roadmap'
                    ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Roadmap</span>
              </button>

              <button
                id="nav-tab-playground"
                onClick={() => setCurrentTab('playground')}
                className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentTab === 'playground'
                    ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <Code2 className="w-4 h-4 shrink-0" />
                <span>Playground</span>
              </button>

              <button
                id="nav-tab-analytics"
                onClick={() => setCurrentTab('analytics')}
                className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentTab === 'analytics'
                    ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Analytics</span>
              </button>

              <button
                id="nav-tab-community"
                onClick={() => setCurrentTab('community')}
                className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentTab === 'community'
                    ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Community</span>
              </button>
            </nav>
          </div>

          {/* 3. Right Section: Quick Utilities, Coral Accents & Profile */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            {/* Quick Actions (AI Generator & DB Status) */}
            <div className="flex items-center gap-2.5">
              <button
                id="navbar-btn-ai-generator"
                onClick={onOpenAiGenerate}
                title="Generate custom practice challenge with Gemini AI"
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43] via-[#FF6D57] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/25 transition-all cursor-pointer whitespace-nowrap hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Generator</span>
              </button>

              <button
                id="navbar-btn-db-status"
                onClick={onOpenDbModal}
                title="Firebase Firestore Connection Status"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-[#1a1a26] border border-[#252535] text-xs transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#FF7B69] shrink-0" />
                <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
                  {dbStatus?.type === 'firebase_firestore' || dbStatus?.isFirebase ? 'Firestore' : 'DB'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </button>
            </div>

            {/* Profile Icons & User Badge Container */}
            {currentUser && (
              <div className="flex items-center gap-3 sm:gap-4 pl-4 lg:pl-6 border-l border-[#20202d]">
                {/* Practice Progress Icons */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FF5A43]/10 border border-[#FF5A43]/30 text-[#FF8570] font-bold"
                    title="Daily Practice Streak"
                  >
                    <Flame className="w-3.5 h-3.5 fill-[#FF5A43] text-[#FF5A43] shrink-0 animate-pulse" />
                    <span className="font-mono">{currentUser.streakDays ?? 0}d</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold"
                    title="Total Problems Solved"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono">{currentUser.totalSolved ?? 0}</span>
                  </div>
                </div>

                {/* Profile Pill with Avatar Icon */}
                <div
                  id="user-profile-pill"
                  className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-[#12121a] hover:bg-[#1a1a26] border border-[#262638] text-xs transition-all shadow-sm"
                  title={`Logged in as ${currentUser.username} (${currentUser.role || 'Student'})`}
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF5A43] to-[#FF8570] text-white font-black text-xs flex items-center justify-center shadow-md shadow-[#FF5A43]/25 shrink-0">
                    {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-white font-semibold text-xs leading-none">
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] text-[#FF8570] capitalize font-semibold mt-1 leading-none">
                      {currentUser.role || 'Student'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Action Button */}
            <button
              id="navbar-btn-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#12121a] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#252535] hover:border-rose-800/50 transition-all cursor-pointer"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 px-2 border-t border-[#1d1d28] text-xs gap-1.5">
          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentTab === 'roadmap'
                ? 'bg-[#FF5A43] text-white font-bold shadow-sm shadow-[#FF5A43]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>
          <button
            onClick={() => setCurrentTab('playground')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentTab === 'playground'
                ? 'bg-[#FF5A43] text-white font-bold shadow-sm shadow-[#FF5A43]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Playground</span>
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentTab === 'analytics'
                ? 'bg-[#FF5A43] text-white font-bold shadow-sm shadow-[#FF5A43]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setCurrentTab('community')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentTab === 'community'
                ? 'bg-[#FF5A43] text-white font-bold shadow-sm shadow-[#FF5A43]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community</span>
          </button>
        </div>
      </div>
    </header>
  );
};
