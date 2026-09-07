import React from 'react';
import {
  Code2,
  Compass,
  BarChart3,
  MessageSquare,
  Flame,
  CheckCircle2,
  Database,
  Sparkles,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User, DatabaseStatus } from '../types';

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
    <header className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors shadow-sm shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18 py-2">
          {/* 1. Left Section: Logo & Brand */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setCurrentTab('roadmap')}
              className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                    CodeElevate
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider">
                    ACADEMY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Adaptive Coding & Instant AI Diagnostics
                </p>
              </div>
            </button>
          </div>

          {/* 2. Center Section: Navigation Links (Roadmap, Playground, Analytics, Community) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:px-6">
            <nav
              id="student-main-nav"
              aria-label="Main Navigation"
              className="flex items-center gap-1.5 lg:gap-2 p-1.5 rounded-2xl bg-slate-900/85 border border-slate-800 shadow-inner shadow-black/40 backdrop-blur-sm"
            >
              <button
                id="nav-tab-roadmap"
                onClick={() => setCurrentTab('roadmap')}
                className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentTab === 'roadmap'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Community</span>
              </button>
            </nav>
          </div>

          {/* 3. Right Section: Quick Utilities, Student Stats & Profile Icons */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            {/* Quick Actions (AI Generator & DB Status) */}
            <div className="flex items-center gap-2.5">
              <button
                id="navbar-btn-ai-generator"
                onClick={onOpenAiGenerate}
                title="Generate custom practice problem with Gemini AI"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Generator</span>
              </button>

              <button
                id="navbar-btn-db-status"
                onClick={onOpenDbModal}
                title="Database Connection Status"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
                  {dbStatus?.type === 'mongodb_atlas' ? 'Atlas' : dbStatus?.type === 'mongodb_local' ? 'Local' : 'DB'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </button>
            </div>

            {/* Profile Icons & User Badge Container */}
            {currentUser && (
              <div className="flex items-center gap-3 sm:gap-4 pl-4 lg:pl-6 border-l border-slate-800">
                {/* Practice Progress Icons */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold"
                    title="Daily Practice Streak"
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
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
                  className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs transition-all shadow-sm"
                  title={`Logged in as ${currentUser.username} (${currentUser.role || 'Student'})`}
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                    {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-white font-semibold text-xs leading-none">
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] text-indigo-300 capitalize font-medium mt-1 leading-none">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/50 transition-all cursor-pointer"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar (Compact Student Tabs for smaller viewports) */}
        <div className="flex md:hidden items-center justify-around py-2.5 px-2 border-t border-slate-800/80 text-xs gap-1.5">
          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              currentTab === 'roadmap'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
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
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
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
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
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
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
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
