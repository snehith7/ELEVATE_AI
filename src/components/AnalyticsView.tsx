import React from 'react';
import {
  BarChart3,
  BrainCircuit,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Zap,
  Activity,
  Code2
} from 'lucide-react';
import { AnalyticsReport, Problem, User } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsReport | null;
  currentUser: User | null;
  onOpenAiGenerator: () => void;
  onSelectProblemById: (problemId: string) => void;
  allProblems: Problem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  currentUser,
  onOpenAiGenerator,
  onSelectProblemById,
  allProblems
}) => {
  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-3 text-indigo-400 animate-pulse" />
        <p className="text-sm">Compiling performance analytics and AI mistake observations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Coding Talent & Mistake Analysis</h1>
          <p className="text-xs text-slate-400">
            Real-time algorithmic weakness profiling and targeted focus recommendations.
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Synthesize Adaptive AI Question</span>
        </button>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{analytics.accuracyRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {analytics.totalSolved} solved of {analytics.totalAttempted} attempted
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-2xl font-black text-amber-400">{currentUser?.streakDays || 1} Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Consistent daily practice</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Target Goal</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xs font-bold text-slate-200 line-clamp-2 mt-1">
            {currentUser?.targetGoal || 'Elevate algorithmic and problem-solving skills'}
          </div>
          <div className="text-[11px] text-indigo-400 font-semibold capitalize mt-1">
            {currentUser?.skillLevel || 'Intermediate'} Track
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Preferred Language</span>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 capitalize">
            {currentUser?.preferredLanguage || 'JavaScript'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active editor environment</div>
        </div>
      </div>

      {/* Main Grid: Identified Mistakes + Difficulty Roadmap Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: AI Identified Mistakes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
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
                <div className="p-4 rounded-xl bg-slate-800/40 text-center text-xs text-slate-400">
                  No recurring mistakes detected yet. Solve more problems to unlock tailored diagnostics!
                </div>
              ) : (
                analytics.identifiedMistakes.map((mistake, idx) => {
                  const sevColor =
                    mistake.severity === 'high'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : mistake.severity === 'medium'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{mistake.mistakePattern}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {mistake.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sevColor}`}>
                          {mistake.severity} Severity
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-indigo-300">Observation: </span>
                        {mistake.description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                        <span className="font-semibold text-white">How to Overcome: </span>
                        {mistake.remedyAction}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Triggered {mistake.frequency} time{mistake.frequency > 1 ? 's' : ''} in submissions</span>
                        <button
                          onClick={onOpenAiGenerator}
                          className="text-cyan-400 hover:underline font-semibold flex items-center space-x-1"
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
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-900/40 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Zap className="w-5 h-5" />
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
                  <div key={i} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">{title}</span>
                        {difficulty && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            difficulty === 'basic' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                            difficulty === 'intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          }`}>
                            {difficulty}
                          </span>
                        )}
                      </div>
                      {category && (
                        <div className="text-[11px] text-indigo-300 font-medium">{category}</div>
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
          {/* Difficulty Tier Progress */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
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
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
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
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
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
                  <span className="text-rose-400">Advanced Tier</span>
                  <span className="text-slate-400 font-mono">
                    {analytics.difficultyBreakdown.advanced.solved} / {analytics.difficultyBreakdown.advanced.total} Solved
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{
                      width: `${analytics.difficultyBreakdown.advanced.total ? (analytics.difficultyBreakdown.advanced.solved / analytics.difficultyBreakdown.advanced.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Mastery Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Category Mastery Radar</span>
            </h3>

            <div className="space-y-3">
              {analytics.categoryMastery.map((cat, idx) => {
                const statusStyle =
                  cat.status === 'mastered'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : cat.status === 'improving'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-400">{cat.solved}/{cat.total}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                          {cat.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.status === 'mastered' ? 'bg-emerald-500' : cat.status === 'improving' ? 'bg-amber-500' : 'bg-rose-500'
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
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
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
                      className="w-full rounded-t-lg bg-indigo-500/30 hover:bg-indigo-500 transition-colors relative group"
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
            <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
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
