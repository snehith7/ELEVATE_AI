import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { Problem, Difficulty } from '../types';

interface RoadmapViewProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onOpenAiGenerator: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  problems,
  onSelectProblem,
  onOpenAiGenerator
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract all categories
  const categories = Array.from(new Set(problems.map(p => p.category)));

  // Filter problems
  const filteredProblems = problems.filter(p => {
    const matchesDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDiff && matchesCat && matchesSearch;
  });

  // Calculate difficulty progress
  const basicProblems = problems.filter(p => p.difficulty === 'basic');
  const intermediateProblems = problems.filter(p => p.difficulty === 'intermediate');
  const advancedProblems = problems.filter(p => p.difficulty === 'advanced');

  const basicSolved = basicProblems.filter(p => p.solvedByCurrentUser).length;
  const intermediateSolved = intermediateProblems.filter(p => p.solvedByCurrentUser).length;
  const advancedSolved = advancedProblems.filter(p => p.solvedByCurrentUser).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner with AI Adaptive Callout */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Structured Mastery Curricula</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Master Coding Fundamentals to Advanced Systems
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Progress along an adaptive roadmap from Basic to Advanced. Our Gemini AI watches your code submissions in real-time, spots common algorithmic traps, and generates targeted practice to bridge your gaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={onOpenAiGenerator}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Generate AI Practice Question</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle background accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 3-Tier Roadmap Track Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Basic Tier Card */}
        <button
          onClick={() => setSelectedDifficulty('basic')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedDifficulty === 'basic'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Tier 1 • Basic</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {basicSolved}/{basicProblems.length} Solved
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Foundations & Simple Data Structures</h3>
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
            Arrays, Strings, HashMaps, Two-Pointers basics, and boundary condition awareness.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${basicProblems.length ? (basicSolved / basicProblems.length) * 100 : 0}%` }}
            ></div>
          </div>
        </button>

        {/* Intermediate Tier Card */}
        <button
          onClick={() => setSelectedDifficulty('intermediate')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedDifficulty === 'intermediate'
              ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Tier 2 • Intermediate</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {intermediateSolved}/{intermediateProblems.length} Solved
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Core Patterns & Non-Linear Structures</h3>
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
            Sliding Window, Binary Trees, Stacks, Queues, Sorting invariants, and Hash groupings.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${intermediateProblems.length ? (intermediateSolved / intermediateProblems.length) * 100 : 0}%` }}
            ></div>
          </div>
        </button>

        {/* Advanced Tier Card */}
        <button
          onClick={() => setSelectedDifficulty('advanced')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedDifficulty === 'advanced'
              ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Tier 3 • Advanced</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {advancedSolved}/{advancedProblems.length} Solved
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Dynamic Programming & Graph Theory</h3>
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
            State Transitions, Monotonic Stacks, Kahn's Topological Sort, BFS Shortest Path, and Greedy bounds.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${advancedProblems.length ? (advancedSolved / advancedProblems.length) * 100 : 0}%` }}
            ></div>
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-2 flex-1 max-w-md bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search problems by name, category, or tag..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Pill Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'basic', 'intermediate', 'advanced'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {diff === 'all' ? 'All Tiers' : diff}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            aria-label="Filter problems by category"
            className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories ({problems.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing {filteredProblems.length} practice problems</span>
          <span>Click any problem to enter the interactive playground</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredProblems.map((problem) => {
            const isSolved = problem.solvedByCurrentUser;
            const diffColor =
              problem.difficulty === 'basic'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : problem.difficulty === 'intermediate'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            return (
              <div
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className="group p-4 sm:p-5 rounded-xl bg-[#0f172a] hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {problem.title}
                      </h4>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor}`}>
                        {problem.difficulty}
                      </span>

                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {problem.category}
                      </span>

                      {problem.isAiGenerated && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-cyan-300" />
                          <span>AI Generated</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                      {problem.description.replace(/```[\s\S]*?```/g, '').replace(/[*#`]/g, '')}
                    </p>

                    {/* Problem Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {problem.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] text-slate-400 bg-slate-800/40 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {problem.acceptanceRate && (
                    <div className="text-right hidden md:block">
                      <div className="text-[10px] text-slate-400">Acceptance</div>
                      <div className="text-xs font-mono text-slate-200 font-semibold">{problem.acceptanceRate}%</div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProblem(problem);
                    }}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSolved
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    <span>{isSolved ? 'Review Code' : 'Solve'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
