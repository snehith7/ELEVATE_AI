import React, { useMemo } from 'react';
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
  ChevronRight,
  X,
  Trophy,
  Award
} from 'lucide-react';
import { User, DatabaseStatus } from '../types';
import { CodeElevateLogo } from './CodeElevateLogo';
import { playTickSound } from '../utils/audioEffects';

interface SidebarProps {
  currentTab: 'roadmap' | 'playground' | 'analytics' | 'community';
  setCurrentTab: (tab: 'roadmap' | 'playground' | 'analytics' | 'community') => void;
  currentUser: User | null;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal: () => void;
  onOpenAiGenerate: () => void;
  onOpenTrophyCabinet?: () => void;
  badges?: any[];
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
  onOpenTrophyCabinet,
  badges = [],
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const safeBadgeList = Array.isArray(badges) ? badges : Array.isArray((badges as any)?.badges) ? (badges as any).badges : [];

  const unlockedBadgesCount = useMemo(() => {
    if (safeBadgeList.length > 0) {
      return safeBadgeList.filter((b: any) => Boolean(b && b.isUnlocked)).length;
    }
    if (currentUser?.earnedBadges && Array.isArray(currentUser.earnedBadges)) {
      return currentUser.earnedBadges.length;
    }
    return 0;
  }, [safeBadgeList, currentUser]);
  const navItems = [
    {
      id: 'roadmap' as const,
      label: 'Roadmap & Quests',
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
    playTickSound(780);
    setCurrentTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (isMobileView = false) => (
    <>
      {/* TOP SECTION: Logo, AI Action & Navigation Links */}
      <div className="flex flex-col space-y-6">
        {/* Brand Logo with User Provided Emblem & Mobile Close */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavClick('roadmap')}
            className="flex items-center text-left group cursor-pointer focus:outline-none px-1 transition-transform hover:scale-[1.02]"
          >
            <CodeElevateLogo size="md" showText={true} showSubtitle={true} />
          </button>

          {isMobileView && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181824] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AI Generator Quick Action in Coral */}
        <button
          onClick={() => {
            onOpenAiGenerate();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43]/20 via-[#FF5A43]/10 to-[#12121c] hover:from-[#FF5A43]/30 hover:via-[#FF5A43]/20 hover:to-[#1a1a28] text-[#FF8570] hover:text-white border border-[#FF5A43]/35 hover:border-[#FF5A43]/60 shadow-sm shadow-[#FF5A43]/10 transition-all cursor-pointer group"
          title="Generate personalized practice challenge using Gemini AI"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5A43] group-hover:rotate-12 transition-transform" />
            <span>AI Practice Generator</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#FF8570] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Interactive Trophy Cabinet Button */}
        {onOpenTrophyCabinet && (
          <button
            onClick={() => {
              onOpenTrophyCabinet();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#13131e] hover:bg-[#1a1a28] text-slate-200 hover:text-white border border-[#222232] hover:border-[#FF5A43]/40 transition-all cursor-pointer group"
            title="Inspect student accolades, achievements, and milestone progress"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Trophy Cabinet</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
              {unlockedBadgesCount}/{safeBadgeList.length || 11}
            </span>
          </button>
        )}

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
                    ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#14141e]'
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
      <div className="flex flex-col space-y-4 pt-4 border-t border-[#1e1e2d]">
        {/* Student Learning Badges in Coral */}
        {currentUser && (
          <div className="grid grid-cols-2 gap-2">
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-[#FF5A43]/10 border border-[#FF5A43]/30 text-[#FF8570] text-xs font-semibold"
              title="Daily Practice Streak"
            >
              <Flame className="w-4 h-4 fill-[#FF5A43] text-[#FF5A43] shrink-0 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#FF8570]/70 uppercase leading-none font-bold">Streak</span>
                <span className="font-mono text-xs leading-tight mt-0.5 font-bold">{currentUser.streakDays ?? 0} days</span>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold"
              title="Total Problems Solved"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400/70 uppercase leading-none font-bold">Solved</span>
                <span className="font-mono text-xs leading-tight mt-0.5 font-bold">{currentUser.totalSolved ?? 0} tasks</span>
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
          title="Firebase Firestore Connection Status"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#101018] hover:bg-[#181824] border border-[#222232] text-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#FF5A43] group-hover:scale-110 transition-transform" />
            <span className="text-slate-300 font-mono text-[11px]">
              {dbStatus?.type === 'firebase_firestore' || dbStatus?.isFirebase
                ? 'Firestore DB'
                : 'Database'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#FF8570] font-semibold">Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
        </button>

        {/* User Profile Card with Earned Badges Showcase */}
        {currentUser && (
          <div
            id="sidebar-user-profile"
            onClick={() => {
              if (onOpenTrophyCabinet) {
                onOpenTrophyCabinet();
                if (onCloseMobile) onCloseMobile();
              }
            }}
            className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#101018] hover:bg-[#151520] border border-[#20202e] hover:border-[#FF5A43]/30 text-xs transition-colors cursor-pointer group"
            title="View Student Profile & Accolades"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A43] to-[#FF8570] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#FF5A43]/25 shrink-0">
                {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white font-bold text-xs truncate group-hover:text-[#FF8570] transition-colors">
                  {currentUser.username}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#FF8570] capitalize font-semibold">
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

            {/* Profile Card Accolade Showcase Ribbon */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#1a1a26] text-[11px]">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Accolades</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181826] text-amber-300 border border-[#29293d]">
                {unlockedBadgesCount} Earned
              </span>
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101018] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#222232] hover:border-rose-800/40 transition-colors cursor-pointer group"
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
      {/* DESKTOP SIDEBAR: Pitch black obsidian canvas */}
      <aside
        id="app-left-sidebar"
        className="hidden md:flex w-64 h-screen sticky top-0 flex-col justify-between p-4 bg-[#08080c] border-r border-[#1c1c28] shrink-0 z-30 select-none shadow-2xl shadow-black/60 overflow-y-auto"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#08080c] border-r border-[#202030] p-4 flex flex-col justify-between z-50 shadow-2xl overflow-y-auto">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
