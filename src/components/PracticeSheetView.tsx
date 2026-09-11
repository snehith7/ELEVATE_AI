import React, { useState, useMemo } from 'react';
import {
  Code2,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  Search,
  BookOpen
} from 'lucide-react';
import { Problem, Difficulty } from '../types';

interface PracticeSheetViewProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onOpenAiGenerator?: () => void;
}

export const PracticeSheetView: React.FC<PracticeSheetViewProps> = ({
  problems,
  onSelectProblem,
  onOpenAiGenerator
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  // Distinct categories
  const categories = useMemo(() => {
    return Array.from(new Set(problems.map(p => p.category))).filter(Boolean);
  }, [problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Difficulty match
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Solved status match
      if (statusFilter === 'solved' && !p.solvedByCurrentUser) {
        return false;
      }
      if (statusFilter === 'unsolved' && p.solvedByCurrentUser) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTags = p.tags?.some(t => t.toLowerCase().includes(q));
        const matchesDesc = p.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesTags && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [problems, selectedDifficulty, selectedCategory, statusFilter, searchQuery]);

  // Summary Metrics
  const totalCount = problems.length;
  const solvedCount = problems.filter(p => p.solvedByCurrentUser).length;
  const basicCount = problems.filter(p => p.difficulty === 'basic').length;
  const intermediateCount = problems.filter(p => p.difficulty === 'intermediate').length;
  const advancedCount = problems.filter(p => p.difficulty === 'advanced').length;

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'basic':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Basic
          </span>
        );
      case 'intermediate':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Intermediate
          </span>
        );
      case 'advanced':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30">
            Advanced
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner in Coral/Black */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#170e10] via-[#0d0d14] to-[#07070a] border border-[#2b1c22] p-4 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF5A43]/15 border border-[#FF5A43]/30 text-[#FF8570] text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5 text-[#FF5A43]" />
              <span>Interactive Practice Sheet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curated Problem Practice Sheet
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Explore our comprehensive problem repository. Select any algorithm challenge to launch the full-featured code editor with test cases and real-time AI tutor guidance.
            </p>
          </div>

          {onOpenAiGenerator && (
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={onOpenAiGenerator}
                className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF5A43] via-[#FF6F59] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] shadow-lg shadow-[#FF5A43]/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Custom AI Challenge</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Progress Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#20202e]">
          <div className="p-3 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
            <div className="text-[11px] text-slate-400 font-medium">Total Problems</div>
            <div className="text-xl font-extrabold text-white font-mono mt-0.5">{totalCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#141a15] border border-emerald-800/30">
            <div className="text-[11px] text-emerald-400 font-medium">Solved by You</div>
            <div className="text-xl font-extrabold text-emerald-300 font-mono mt-0.5">
              {solvedCount} <span className="text-xs text-emerald-500 font-normal font-sans">({totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%)</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
            <div className="text-[11px] text-slate-400 font-medium">Basic / Inter / Adv</div>
            <div className="text-sm font-bold text-slate-200 font-mono mt-1">
              <span className="text-emerald-400">{basicCount}</span> / <span className="text-amber-400">{intermediateCount}</span> / <span className="text-[#FF8570]">{advancedCount}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0e0e15] border border-[#1c1c28]">
            <div className="text-[11px] text-slate-400 font-medium">Active Sheet Results</div>
            <div className="text-xl font-extrabold text-[#FF8570] font-mono mt-0.5">{filteredProblems.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e0e15] border border-[#1c1c28] space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search challenges by title, category, or algorithmic tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141e] border border-[#242436] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Filter problems by category"
              className="px-3.5 py-2.5 rounded-xl bg-[#14141e] border border-[#242436] text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#FF5A43] cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              aria-label="Filter problems by completion status"
              className="px-3.5 py-2.5 rounded-xl bg-[#14141e] border border-[#242436] text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#FF5A43] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved Only</option>
              <option value="unsolved">Unsolved Only</option>
            </select>
          </div>
        </div>

        {/* Difficulty Pill Selectors */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#1c1c28] overflow-x-auto">
          <span className="text-xs text-slate-400 font-semibold mr-1">Difficulty:</span>
          {(['all', 'basic', 'intermediate', 'advanced'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? diff === 'basic'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : diff === 'intermediate'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : diff === 'advanced'
                    ? 'bg-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/20'
                    : 'bg-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/20'
                  : 'bg-[#14141e] text-slate-400 hover:text-white hover:bg-[#1b1b28] border border-[#222232]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Practice Sheet Table / Card View */}
      {filteredProblems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0e0e15] border border-[#1c1c28] space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">No challenges match your filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords, clearing difficulty filters, or generating a custom problem with Gemini AI.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#14141e] text-[#FF8570] hover:text-white hover:bg-[#1c1c28] transition-colors cursor-pointer mt-2 border border-[#222232]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0e0e15] border border-[#1c1c28] overflow-hidden shadow-xl">
          {/* MOBILE STACKED CARDS (< md) */}
          <div className="md:hidden divide-y divide-[#1c1c28]">
            {filteredProblems.map(problem => {
              const isSolved = Boolean(problem.solvedByCurrentUser);
              return (
                <div key={problem.id} className="p-4 space-y-3 hover:bg-[#14141e] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onSelectProblem(problem)}
                          className="text-sm font-bold text-white hover:text-[#FF8570] text-left transition-colors cursor-pointer line-clamp-2"
                        >
                          {problem.title}
                        </button>
                        {problem.isAiGenerated && (
                          <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30">
                            AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getDifficultyBadge(problem.difficulty)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[#14141e] text-slate-300 border border-[#222232]">
                      {problem.category}
                    </span>
                    {problem.tags?.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#14141e] text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.acceptanceRate !== undefined && (
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">
                        {problem.acceptanceRate}% acc
                      </span>
                    )}
                  </div>

                  <button
                    id={`mobile-solve-btn-${problem.id}`}
                    onClick={() => onSelectProblem(problem)}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43] to-[#FF7B69] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isSolved ? 'Solve Again' : 'Solve Challenge'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (>= md) with Strict CSS Grid Alignment & Horizontal Scroll Container */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Table Header (Strict CSS Grid alignment) */}
              <div className="grid grid-cols-[60px_2fr_1fr_1fr_120px] gap-4 px-6 py-3.5 bg-[#0a0a10] border-b border-[#1c1c28] text-xs font-bold text-slate-400 uppercase tracking-wider items-center">
                <div className="text-center">Status</div>
                <div>Title & Topic Tags</div>
                <div>Category</div>
                <div>Difficulty</div>
                <div className="text-right pr-2">Action</div>
              </div>

              {/* Problem Rows (Strict CSS Grid matching header columns) */}
              <div className="divide-y divide-[#1c1c28]">
                {filteredProblems.map(problem => {
                  const isSolved = Boolean(problem.solvedByCurrentUser);
                  return (
                    <div
                      key={problem.id}
                      className="grid grid-cols-[60px_2fr_1fr_1fr_120px] gap-4 px-6 py-4 items-center hover:bg-[#14141e] transition-colors group"
                    >
                      {/* Status */}
                      <div className="flex items-center justify-center">
                        {isSolved ? (
                          <div className="flex items-center justify-center text-emerald-400" title="Solved">
                            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-slate-500" title="Unsolved">
                            <Circle className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Title and Tags */}
                      <div className="flex flex-col space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectProblem(problem)}
                            className="text-sm font-bold text-white group-hover:text-[#FF8570] text-left transition-colors cursor-pointer truncate"
                            title={problem.title}
                          >
                            {problem.title}
                          </button>
                          {problem.isAiGenerated && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30 shrink-0">
                              AI
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {problem.tags?.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#14141e] text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.acceptanceRate !== undefined && (
                            <span className="text-[10px] text-slate-500 ml-1">
                              {problem.acceptanceRate}% acc
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center min-w-0 pr-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#14141e] text-slate-300 border border-[#222232] truncate max-w-full">
                          {problem.category}
                        </span>
                      </div>

                      {/* Difficulty */}
                      <div className="flex items-center min-w-0">
                        {getDifficultyBadge(problem.difficulty)}
                      </div>

                      {/* Action: Solve Button */}
                      <div className="flex items-center justify-end">
                        <button
                          id={`solve-btn-${problem.id}`}
                          onClick={() => onSelectProblem(problem)}
                          className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FF5A43] to-[#FF7B69] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-md shadow-[#FF5A43]/20 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{isSolved ? 'Solve Again' : 'Solve'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
