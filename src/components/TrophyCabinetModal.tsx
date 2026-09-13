import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Target,
  Cpu,
  Compass,
  Crown,
  Lock,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { Badge, BadgeCategory, BadgeRarity, User } from '../types';
import { playSuccessChime, playRankUpSound } from '../utils/audioEffects';

interface TrophyCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  currentUser: User | null;
  onSelectProblemById?: (problemId: string) => void;
  onClaimStreak?: () => Promise<void>;
}

export const TrophyCabinetModal: React.FC<TrophyCabinetModalProps> = ({
  isOpen,
  onClose,
  badges,
  currentUser,
  onSelectProblemById,
  onClaimStreak
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedBadge, setInspectedBadge] = useState<Badge | null>(null);
  const [isClaimingStreak, setIsClaimingStreak] = useState(false);

  // Safely ensure badges array
  const safeBadges = useMemo(() => {
    return Array.isArray(badges)
      ? badges
      : Array.isArray((badges as any)?.badges)
        ? (badges as any).badges
        : [];
  }, [badges]);

  // Compute summary stats
  const unlockedCount = safeBadges.filter(b => b && b.isUnlocked).length;
  const totalCount = safeBadges.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const totalXpEarned = safeBadges
    .filter(b => b && b.isUnlocked)
    .reduce((acc, b) => acc + (b.xpReward || 0), 0);

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    return safeBadges.filter(badge => {
      if (!badge) return false;
      // Category filter
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'unlocked' && !badge.isUnlocked) return false;
      if (statusFilter === 'locked' && badge.isUnlocked) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (badge.name || '').toLowerCase().includes(q);
        const matchTitle = (badge.title || '').toLowerCase().includes(q);
        const matchDesc = (badge.description || '').toLowerCase().includes(q);
        const matchRarity = (badge.rarity || '').toLowerCase().includes(q);
        return matchName || matchTitle || matchDesc || matchRarity;
      }
      return true;
    });
  }, [safeBadges, selectedCategory, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const renderBadgeIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'zap':
        return <Zap className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const rarityMeta: Record<BadgeRarity, { border: string; bg: string; text: string; glow: string }> = {
    Common: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.25)'
    },
    Rare: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      glow: 'rgba(59, 130, 246, 0.25)'
    },
    Epic: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      glow: 'rgba(139, 92, 246, 0.25)'
    },
    Legendary: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'rgba(245, 158, 11, 0.3)'
    },
    Mythic: {
      border: 'border-[#FF5A43]/50',
      bg: 'bg-[#FF5A43]/15',
      text: 'text-[#FF8570]',
      glow: 'rgba(255, 90, 67, 0.35)'
    }
  };

  const handleBadgeClick = (badge: Badge) => {
    playSuccessChime();
    setInspectedBadge(badge);
  };

  const handleClaimStreakClick = async () => {
    if (!onClaimStreak || isClaimingStreak) return;
    setIsClaimingStreak(true);
    try {
      await onClaimStreak();
      playRankUpSound();
    } finally {
      setIsClaimingStreak(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Container Card */}
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0b0b12] border border-[#222232] rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Specular Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF5A43] to-transparent" />

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1c1c2b] bg-gradient-to-r from-[#141420] to-[#0d0d16]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#FF5A43]/15 border border-[#FF5A43]/30 text-[#FF8570] shadow-inner">
              <Trophy className="w-6 h-6 text-[#FF5A43]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Student Trophy Cabinet
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/30">
                  Live Accolades
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track earned milestones, live unlock progress bars, and algorithmic mastery accolades.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#1a1a28] hover:bg-[#252538] border border-[#29293d] transition-colors cursor-pointer"
            aria-label="Close Trophy Cabinet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cabinet Performance KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-6 border-b border-[#1a1a28] bg-[#0e0e16]">
          {/* KPI 1: Accolades Unlocked */}
          <div className="p-3.5 rounded-2xl bg-[#141420] border border-[#222232] space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Unlocked Accolades</span>
              <Award className="w-4 h-4 text-[#FF5A43]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white">{unlockedCount}</span>
              <span className="text-xs text-slate-500 font-mono">/ {totalCount} total</span>
            </div>
            <div className="w-full bg-[#0a0a10] h-1.5 rounded-full overflow-hidden mt-1 border border-[#222232]">
              <div
                className="bg-gradient-to-r from-[#FF5A43] to-[#FF8570] h-full rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* KPI 2: Total Accolade XP */}
          <div className="p-3.5 rounded-2xl bg-[#141420] border border-[#222232] space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Accolade XP Harvested</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-400">+{totalXpEarned}</span>
              <span className="text-xs text-slate-500 font-mono">XP</span>
            </div>
            <p className="text-[11px] text-slate-400">Elevates overall student ranking</p>
          </div>

          {/* KPI 3: Daily Streak */}
          <div className="p-3.5 rounded-2xl bg-[#141420] border border-[#222232] space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Current Streak</span>
              <Flame className="w-4 h-4 text-[#FF5A43] fill-[#FF5A43]/20" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#FF8570]">
                {currentUser?.streakDays || 1} <span className="text-xs font-normal text-slate-400">Days</span>
              </span>
              {onClaimStreak && (
                <button
                  onClick={handleClaimStreakClick}
                  disabled={isClaimingStreak}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#FF5A43]/20 hover:bg-[#FF5A43]/30 text-[#FF8570] border border-[#FF5A43]/30 transition-colors"
                >
                  {isClaimingStreak ? 'Claiming...' : '+1 Day'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Keep daily practice unbroken</p>
          </div>

          {/* KPI 4: Completion Tier */}
          <div className="p-3.5 rounded-2xl bg-[#141420] border border-[#222232] space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Mastery Rating</span>
              <Crown className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-extrabold text-purple-300">
              {completionPercentage >= 75
                ? 'Grandmaster'
                : completionPercentage >= 50
                ? 'Veteran Dev'
                : completionPercentage >= 25
                ? 'Adept Coder'
                : 'Initiate'}
            </div>
            <p className="text-[11px] text-slate-400">{completionPercentage}% total mastery complete</p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#1a1a28] bg-[#0c0c14]">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#141420] border border-[#222232]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-[#FF5A43] to-[#FF8570] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('unlocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'unlocked'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Earned ({unlockedCount})
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'locked'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress ({totalCount - unlockedCount})
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Domains' },
              { id: 'solved_count', label: 'Problem Volume' },
              { id: 'streak', label: 'Daily Streaks' },
              { id: 'difficulty', label: 'Difficulty Tiers' },
              { id: 'mastery', label: 'Mastery' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/40'
                    : 'bg-[#141420] text-slate-400 hover:text-slate-200 border border-[#222232]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search accolades..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#141420] border border-[#222232] text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
            />
          </div>
        </div>

        {/* Badges Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredBadges.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching accolades found</p>
              <p className="text-xs text-slate-500">
                Adjust your filter criteria or search query to explore other achievements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map(badge => {
                const rarity = rarityMeta[badge.rarity] || rarityMeta.Rare;
                const isUnlocked = badge.isUnlocked;

                return (
                  <div
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    className={`group relative rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                      isUnlocked
                        ? 'bg-[#12121e] border-[#29293e] hover:border-[#FF5A43]/60 hover:shadow-xl hover:shadow-[#FF5A43]/10'
                        : 'bg-[#0e0e16]/80 border-[#1c1c28] hover:border-[#2f2f42]'
                    }`}
                  >
                    {/* Top Row: Rarity + Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarity.border} ${rarity.bg} ${rarity.text}`}
                      >
                        {badge.rarity}
                      </span>

                      {isUnlocked ? (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Earned</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Lock className="w-3 h-3" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </div>

                    {/* Middle: Icon & Titles */}
                    <div className="flex items-start space-x-3.5 mb-4">
                      {/* Icon Box */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border relative ${
                          isUnlocked
                            ? `bg-gradient-to-br ${badge.color} text-white shadow-lg`
                            : 'bg-[#161624] border-[#222234] text-slate-500'
                        }`}
                        style={{
                          boxShadow: isUnlocked ? `0 0 16px ${badge.glowColor || rarity.glow}` : 'none'
                        }}
                      >
                        {renderBadgeIcon(badge.iconName, 'w-7 h-7')}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Text Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-white group-hover:text-[#FF8570] transition-colors truncate">
                            {badge.name}
                          </h4>
                          <span className="text-[11px] font-bold text-amber-400 whitespace-nowrap ml-2">
                            +{badge.xpReward} XP
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                          {badge.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Progress Bar Tracking Live Metrics */}
                    <div className="pt-2 border-t border-[#1c1c28] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">
                          {isUnlocked
                            ? 'Milestone Conquered'
                            : `${badge.currentValue} / ${badge.targetValue} ${
                                badge.metricType === 'streakDays'
                                  ? 'Days'
                                  : badge.metricType === 'firstSolve'
                                  ? 'Challenge'
                                  : 'Problems'
                              }`}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isUnlocked ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {badge.progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#0a0a10] h-2 rounded-full overflow-hidden border border-[#202030]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-amber-500 to-[#FF5A43]'
                          }`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inspected Badge Modal Detail Drawer */}
        {inspectedBadge && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-[#0e0e16] border border-[#2b2b3e] rounded-3xl p-6 shadow-2xl space-y-5 text-center">
              {/* Close Drawer */}
              <button
                onClick={() => setInspectedBadge(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-[#1a1a28] hover:bg-[#252538] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rarity & Tier */}
              <div className="flex items-center justify-center space-x-2">
                <span
                  className={`text-[11px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border ${
                    rarityMeta[inspectedBadge.rarity].border
                  } ${rarityMeta[inspectedBadge.rarity].bg} ${rarityMeta[inspectedBadge.rarity].text}`}
                >
                  {inspectedBadge.rarity}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {inspectedBadge.tier}
                </span>
              </div>

              {/* Big 3D Badge Preview */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl blur-lg opacity-50"
                  style={{ backgroundColor: inspectedBadge.borderColor || '#FF5A43' }}
                />
                <div
                  className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-white border ${
                    inspectedBadge.isUnlocked
                      ? `bg-gradient-to-br ${inspectedBadge.color} shadow-xl`
                      : 'bg-[#171724] border-[#29293d] text-slate-500'
                  }`}
                  style={{
                    boxShadow: inspectedBadge.isUnlocked
                      ? `0 0 20px ${inspectedBadge.glowColor || 'rgba(255, 90, 67, 0.4)'}`
                      : 'none'
                  }}
                >
                  {renderBadgeIcon(inspectedBadge.iconName, 'w-10 h-10')}
                </div>
              </div>

              {/* Name & Title */}
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">{inspectedBadge.name}</h3>
                <p className="text-xs font-bold text-[#FF8570]">{inspectedBadge.title}</p>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                  {inspectedBadge.description}
                </p>
                {inspectedBadge.lore && (
                  <p className="text-[11px] italic text-slate-400 pt-1">
                    "{inspectedBadge.lore}"
                  </p>
                )}
              </div>

              {/* Metric Progress Detailed Box */}
              <div className="p-3.5 rounded-2xl bg-[#141420] border border-[#222232] space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Progress Criteria</span>
                  <span className="font-mono font-bold text-white">
                    {inspectedBadge.currentValue} / {inspectedBadge.targetValue}
                  </span>
                </div>
                <div className="w-full bg-[#0a0a10] h-2 rounded-full overflow-hidden border border-[#202030]">
                  <div
                    className={`h-full rounded-full ${
                      inspectedBadge.isUnlocked ? 'bg-emerald-500' : 'bg-[#FF5A43]'
                    }`}
                    style={{ width: `${inspectedBadge.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Award: +{inspectedBadge.xpReward} XP</span>
                  <span className={inspectedBadge.isUnlocked ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {inspectedBadge.isUnlocked ? 'Accomplished' : `${inspectedBadge.targetValue - inspectedBadge.currentValue} remaining`}
                  </span>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => setInspectedBadge(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#1a1a28] hover:bg-[#252538] border border-[#2d2d42] transition-colors cursor-pointer"
              >
                Back to Trophy Cabinet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
