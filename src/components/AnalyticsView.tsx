import React from 'react';
import {
  BarChart3,
  BrainCircuit,
  Target,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Activity,
  Code2,
  Trophy,
  ChevronRight,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { AnalyticsReport, Problem, User, Badge } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsReport | null;
  currentUser: User | null;
  onOpenAiGenerator: () => void;
  onSelectProblemById: (problemId: string) => void;
  allProblems: Problem[];
  badges?: Badge[];
  onOpenTrophyCabinet?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  currentUser,
  onOpenAiGenerator,
  badges = [],
  onOpenTrophyCabinet
}) => {
  const safeBadges = Array.isArray(badges) ? badges : Array.isArray((badges as any)?.badges) ? (badges as any).badges : [];
  const unlockedCount = safeBadges.filter(b => b && b.isUnlocked).length;
  const totalBadgesCount = safeBadges.length || 11;

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-3 text-[#FF5A43] animate-pulse" />
        <p className="text-sm">Compiling performance analytics and AI mistake observations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#170e10] via-[#0d0d14] to-[#07070a] border border-[#2b1c22] shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#FF8570] uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-[#FF5A43]" />
            <span>AI Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Coding Talent & Mistake Analysis</h1>
          <p className="text-xs text-slate-400">
            Real-time algorithmic weakness profiling and targeted focus recommendations.
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF5A43] via-[#FF6F59] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] shadow-lg shadow-[#FF5A43]/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Synthesize Adaptive AI Question</span>
        </button>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{analytics.accuracyRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {analytics.totalSolved} solved of {analytics.totalAttempted} attempted
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-[#FF5A43] fill-[#FF5A43]/20" />
          </div>
          <div className="text-2xl font-black text-[#FF8570]">{currentUser?.streakDays || 1} Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Consistent daily practice</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Target Goal</span>
            <Award className="w-4 h-4 text-[#FF5A43]" />
          </div>
          <div className="text-xs font-bold text-slate-200 line-clamp-2 mt-1">
            {currentUser?.targetGoal || 'Elevate algorithmic and problem-solving skills'}
          </div>
          <div className="text-[11px] text-[#FF8570] font-semibold capitalize mt-1">
            {currentUser?.skillLevel || 'Intermediate'} Track
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Preferred Language</span>
            <Code2 className="w-4 h-4 text-[#FF8570]" />
          </div>
          <div className="text-xl font-bold font-mono text-white capitalize">
            {currentUser?.preferredLanguage || 'JavaScript'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active editor environment</div>
        </div>
      </div>

      {/* Main Grid: Identified Mistakes + Difficulty Roadmap Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: AI Identified Mistakes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e0e15] border border-[#1c1c28] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">AI Observed Mistake Patterns</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {analytics.identifiedMistakes.length} Patterns Tracked
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The AI continually monitors your submission failures and identifies recurring algorithmic misconceptions:
            </p>

            <div className="space-y-3">
              {analytics.identifiedMistakes.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#14141e] text-center text-xs text-slate-400 border border-[#222232]">
                  No recurring mistakes detected yet. Solve more problems to unlock tailored diagnostics!
                </div>
              ) : (
                analytics.identifiedMistakes.map((mistake, idx) => {
                  const sevColor =
                    mistake.severity === 'high'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : mistake.severity === 'medium'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-[#FF5A43]/15 text-[#FF8570] border-[#FF5A43]/30';

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-[#14141e] border border-[#222232] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{mistake.mistakePattern}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[#0a0a10] text-slate-400 border border-[#242436]">
                            {mistake.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sevColor}`}>
                          {mistake.severity} Severity
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-[#FF8570]">Observation: </span>
                        {mistake.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-[#FF5A43]/10 border border-[#FF5A43]/20 text-xs text-[#FF8570]">
                        <span className="font-semibold text-white">How to Overcome: </span>
                        {mistake.remedyAction}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Triggered {mistake.frequency} time{mistake.frequency > 1 ? 's' : ''} in submissions</span>
                        <button
                          onClick={onOpenAiGenerator}
                          className="text-[#FF8570] hover:text-white hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Practice Similar Problems</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Where Student Needs to Focus Next */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1c0f12]/60 via-[#0e0e15] to-[#0a0a10] border border-[#301820] space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-[#FF8570]">
              <Zap className="w-5 h-5 text-[#FF5A43]" />
              <h3 className="text-base font-bold text-white">Where You Need To Focus Next</h3>
            </div>
            <p className="text-xs text-slate-400">
              Personalized action list calculated to rapidly elevate your problem-solving ranking:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {analytics.recommendedFocusList.map((rec: any, i: number) => {
                const isObj = typeof rec === 'object' && rec !== null;
                const title = isObj ? (rec.title || 'Targeted Practice Problem') : String(rec);
                const reason = isObj ? rec.reason : null;
                const category = isObj ? rec.category : null;
                const difficulty = isObj ? rec.difficulty : null;

                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#14141e] border border-[#242436] flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#FF5A43]/20 text-[#FF8570] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#FF5A43]/30">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">{title}</span>
                        {difficulty && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            difficulty === 'basic' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                            difficulty === 'intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-[#FF8570] bg-[#FF5A43]/10 border-[#FF5A43]/20'
                          }`}>
                            {difficulty}
                          </span>
                        )}
                      </div>
                      {category && (
                        <div className="text-[11px] text-[#FF8570] font-medium">{category}</div>
                      )}
                      {reason && (
                        <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Roadmap Progression & Category Mastery (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trophy Cabinet Accolades Showcase */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#17111b] via-[#0e0e16] to-[#0b0b12] border border-[#2c2236] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Student Accolades</h3>
                  <p className="text-[11px] text-slate-400">
                    {unlockedCount} of {totalBadgesCount} Badges Earned
                  </p>
                </div>
              </div>

              {onOpenTrophyCabinet && (
                <button
                  onClick={onOpenTrophyCabinet}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#FF8570] hover:text-white bg-[#FF5A43]/15 hover:bg-[#FF5A43]/30 border border-[#FF5A43]/30 transition-all cursor-pointer"
                >
                  <span>Cabinet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Badges Preview */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {safeBadges.slice(0, 3).map(badge => (
                <div
                  key={badge.id}
                  onClick={onOpenTrophyCabinet}
                  className="p-3 rounded-2xl bg-[#141420] border border-[#242436] hover:border-[#FF5A43]/40 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white truncate">{badge.name}</span>
                      <span className="text-[10px] text-amber-400 font-semibold">+{badge.xpReward} XP</span>
                    </div>
                    {badge.isUnlocked ? (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Earned</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                        <Lock className="w-3 h-3" />
                        <span>{badge.progress}%</span>
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-[#0a0a10] h-1.5 rounded-full overflow-hidden border border-[#202030]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        badge.isUnlocked ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-[#FF5A43]'
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Tier Progress */}
          <div className="p-6 rounded-3xl bg-[#0e0e15] border border-[#1c1c28] space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Curriculum Tier Progression</span>
            </h3>

            <div className="space-y-4 pt-1">
              {/* Basic */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Basic Tier</span>
                  <span className="text-slate-400 font-mono">
                    {analytics.difficultyBreakdown.basic.solved} / {analytics.difficultyBreakdown.basic.total} Solved
                  </span>
                </div>
                <div className="w-full bg-[#14141e] h-2 rounded-full overflow-hidden border border-[#222232]">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${analytics.difficultyBreakdown.basic.total ? (analytics.difficultyBreakdown.basic.solved / analytics.difficultyBreakdown.basic.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Intermediate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-400">Intermediate Tier</span>
                  <span className="text-slate-400 font-mono">
                    {analytics.difficultyBreakdown.intermediate.solved} / {analytics.difficultyBreakdown.intermediate.total} Solved
                  </span>
                </div>
                <div className="w-full bg-[#14141e] h-2 rounded-full overflow-hidden border border-[#222232]">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${analytics.difficultyBreakdown.intermediate.total ? (analytics.difficultyBreakdown.intermediate.solved / analytics.difficultyBreakdown.intermediate.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Advanced */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#FF8570]">Advanced Tier</span>
                  <span className="text-slate-400 font-mono">
                    {analytics.difficultyBreakdown.advanced.solved} / {analytics.difficultyBreakdown.advanced.total} Solved
                  </span>
                </div>
                <div className="w-full bg-[#14141e] h-2 rounded-full overflow-hidden border border-[#222232]">
                  <div
                    className="bg-[#FF5A43] h-full rounded-full transition-all"
                    style={{
                      width: `${analytics.difficultyBreakdown.advanced.total ? (analytics.difficultyBreakdown.advanced.solved / analytics.difficultyBreakdown.advanced.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Mastery Breakdown */}
          <div className="p-6 rounded-3xl bg-[#0e0e15] border border-[#1c1c28] space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#FF5A43]" />
              <span>Category Mastery Radar</span>
            </h3>

            <div className="space-y-3">
              {analytics.categoryMastery.map((cat, idx) => {
                const statusStyle =
                  cat.status === 'mastered'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : cat.status === 'improving'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-[#FF5A43]/15 text-[#FF8570] border-[#FF5A43]/30';

                return (
                  <div key={idx} className="p-3 rounded-2xl bg-[#14141e] border border-[#222232] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-400">{cat.solved}/{cat.total}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                          {cat.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-[#0a0a10] h-1.5 rounded-full overflow-hidden border border-[#222232]">
                      <div
                        className={`h-full rounded-full ${
                          cat.status === 'mastered' ? 'bg-emerald-500' : cat.status === 'improving' ? 'bg-amber-500' : 'bg-[#FF5A43]'
                        }`}
                        style={{ width: `${cat.percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent 7-Day Activity Chart */}
          <div className="p-6 rounded-3xl bg-[#0e0e15] border border-[#1c1c28] space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#FF5A43]" />
              <span>7-Day Submission Volume</span>
            </h3>

            <div className="flex items-end justify-between h-28 pt-4 gap-2">
              {analytics.recentActivity.map((act, i) => {
                const dayName = new Date(act.date).toLocaleDateString('en-US', { weekday: 'short' });
                const heightPercent = Math.min(100, Math.max(15, act.count * 25));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] font-mono text-slate-400">{act.count}</div>
                    <div
                      className="w-full rounded-t-lg bg-[#FF5A43]/30 hover:bg-[#FF5A43] transition-colors relative group"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {act.passed > 0 && (
                        <div
                          className="absolute bottom-0 inset-x-0 bg-emerald-500 rounded-t-lg"
                          style={{ height: `${(act.passed / act.count) * 100}%` }}
                        ></div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{dayName}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-1 border-t border-[#1c1c28]">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#FF5A43]"></span>
                <span>Attempts</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Accepted</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
