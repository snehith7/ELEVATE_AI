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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
      {/* Hero Banner with Coral Theme */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#170e10] via-[#0d0d14] to-[#07070a] border border-[#2b1c22] p-4 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF5A43]/15 border border-[#FF5A43]/30 text-[#FF8570] text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#FF5A43]" />
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
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF5A43] via-[#FF6F59] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] shadow-lg shadow-[#FF5A43]/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Generate AI Practice Question</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative coral background accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF5A43]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-[#FF5A43]/8 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 3-Tier Roadmap Track Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Basic Tier Card */}
        <button
          onClick={() => setSelectedDifficulty('basic')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedDifficulty === 'basic'
              ? 'bg-[#151c16] border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
              : 'bg-[#0e0e15] border-[#1c1c28] hover:border-[#2a2a3d] hover:bg-[#14141e]'
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
          <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
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
              ? 'bg-[#1e1710] border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
              : 'bg-[#0e0e15] border-[#1c1c28] hover:border-[#2a2a3d] hover:bg-[#14141e]'
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
          <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
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
              ? 'bg-[#201014] border-[#FF5A43] shadow-lg shadow-[#FF5A43]/10 ring-1 ring-[#FF5A43]'
              : 'bg-[#0e0e15] border-[#1c1c28] hover:border-[#2a2a3d] hover:bg-[#14141e]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A43]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF8570]">Tier 3 • Advanced</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {advancedSolved}/{advancedProblems.length} Solved
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Dynamic Programming & Graph Theory</h3>
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
            State Transitions, Monotonic Stacks, Kahn's Topological Sort, BFS Shortest Path, and Greedy bounds.
          </p>
          <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#FF5A43] h-full rounded-full transition-all duration-500"
              style={{ width: `${advancedProblems.length ? (advancedSolved / advancedProblems.length) * 100 : 0}%` }}
            ></div>
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
        <div className="flex items-center space-x-2 flex-1 max-w-md bg-[#14141e] px-3.5 py-2.5 rounded-xl border border-[#242436]">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/25 font-bold'
                  : 'bg-[#14141e] text-slate-400 hover:text-slate-200 hover:bg-[#1b1b28] border border-[#222232]'
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
            className="bg-[#14141e] text-xs text-slate-200 rounded-xl px-3 py-2 border border-[#242436] focus:outline-none focus:border-[#FF5A43]"
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
                : 'bg-[#FF5A43]/15 text-[#FF8570] border-[#FF5A43]/30';

            return (
              <div
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className="group p-4 sm:p-5 rounded-2xl bg-[#0e0e15] hover:bg-[#14141e] border border-[#1c1c28] hover:border-[#FF5A43]/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-[#FF5A43] transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#FF8570] transition-colors">
                        {problem.title}
                      </h4>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor}`}>
                        {problem.difficulty}
                      </span>

                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#14141e] text-slate-300 border border-[#222232]">
                        {problem.category}
                      </span>

                      {problem.isAiGenerated && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-[#FF5A43]" />
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
                          <span key={idx} className="text-[10px] text-slate-400 bg-[#161622] px-2 py-0.5 rounded-md border border-[#222232]">
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
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSolved
                        ? 'bg-[#181824] text-slate-300 hover:bg-[#202030] border border-[#252538]'
                        : 'bg-gradient-to-r from-[#FF5A43] to-[#FF7B69] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/20 font-bold'
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
