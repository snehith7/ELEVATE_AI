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
  User as UserIcon,
  ChevronRight,
  X
} from 'lucide-react';
import { User, DatabaseStatus } from '../types';

interface SidebarProps {
  currentTab: 'roadmap' | 'playground' | 'analytics' | 'community';
  setCurrentTab: (tab: 'roadmap' | 'playground' | 'analytics' | 'community') => void;
  currentUser: User | null;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal: () => void;
  onOpenAiGenerate: () => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  dbStatus,
  onOpenDbModal,
  onOpenAiGenerate,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'roadmap' as const,
      label: 'Roadmap',
      icon: Compass,
      description: 'Skill learning path'
    },
    {
      id: 'playground' as const,
      label: 'Playground',
      icon: Code2,
      description: 'Live code & AI tutor'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Mistakes & diagnostics'
    },
    {
      id: 'community' as const,
      label: 'Community',
      icon: MessageSquare,
      description: 'Peer forum & study'
    }
  ];

  const handleNavClick = (tab: 'roadmap' | 'playground' | 'analytics' | 'community') => {
    setCurrentTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (isMobileView = false) => (
    <>
      {/* TOP SECTION: Logo, AI Action & Navigation Links */}
      <div className="flex flex-col space-y-6">
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavClick('roadmap')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none px-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  CodeElevate
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider">
                  ACADEMY
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Adaptive AI Coding
              </span>
            </div>
          </button>

          {isMobileView && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AI Generator Quick Action */}
        <button
          onClick={() => {
            onOpenAiGenerate();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500/15 via-indigo-600/20 to-purple-600/15 hover:from-cyan-500/25 hover:via-indigo-600/30 hover:to-purple-600/25 text-indigo-200 hover:text-white border border-indigo-500/30 hover:border-indigo-400/50 shadow-sm transition-all cursor-pointer group"
          title="Generate personalized practice challenge using Gemini AI"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>AI Practice Generator</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Main Navigation Links */}
        <nav className="flex flex-col space-y-1.5" aria-label="Main Navigation">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="flex flex-col">
                    <span className="leading-tight">{item.label}</span>
                  </div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION: Stats, Database Status, User Profile & Sign Out */}
      <div className="flex flex-col space-y-4 pt-4 border-t border-slate-800/80">
        {/* Student Learning Badges */}
        {currentUser && (
          <div className="grid grid-cols-2 gap-2">
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold"
              title="Daily Practice Streak"
            >
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400/70 uppercase leading-none">Streak</span>
                <span className="font-mono text-xs leading-tight mt-0.5">{currentUser.streakDays ?? 0} days</span>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold"
              title="Total Problems Solved"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400/70 uppercase leading-none">Solved</span>
                <span className="font-mono text-xs leading-tight mt-0.5">{currentUser.totalSolved ?? 0} tasks</span>
              </div>
            </div>
          </div>
        )}

        {/* Database Status Button */}
        <button
          id="sidebar-btn-db-status"
          onClick={() => {
            onOpenDbModal();
            if (onCloseMobile) onCloseMobile();
          }}
          title="MongoDB Database Connection Status"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-300 font-mono text-[11px]">
              {dbStatus?.type === 'mongodb_atlas'
                ? 'MongoDB Atlas'
                : dbStatus?.type === 'mongodb_local'
                ? 'MongoDB Local'
                : 'MongoDB Live'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-medium">Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
        </button>

        {/* User Profile Card */}
        {currentUser && (
          <div
            id="sidebar-user-profile"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white font-semibold text-xs truncate">
                {currentUser.username}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-indigo-300 capitalize font-medium">
                  {currentUser.role || 'Student'}
                </span>
                {currentUser.batch && (
                  <>
                    <span className="text-[9px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {currentUser.batch}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          id="sidebar-btn-logout"
          onClick={() => {
            onLogout();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/40 transition-colors cursor-pointer group"
          title="Sign out of current account session"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR: Hidden on mobile (hidden md:flex), w-64, h-screen sticky */}
      <aside
        id="app-left-sidebar"
        className="hidden md:flex w-64 h-screen sticky top-0 flex-col justify-between p-4 bg-[#0c1222] border-r border-slate-800/80 shrink-0 z-30 select-none shadow-xl shadow-black/30 overflow-y-auto"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* MOBILE DRAWER: Slide-in navigation drawer for small screens */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#0c1222] border-r border-slate-800 p-4 flex flex-col justify-between z-50 shadow-2xl overflow-y-auto">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

