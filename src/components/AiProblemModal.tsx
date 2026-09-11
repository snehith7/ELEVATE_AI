import React, { useState } from 'react';
import { Sparkles, X, BrainCircuit, Target, Code2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Difficulty, SupportedLanguage, User } from '../types';

interface AiProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProblemGenerated: (problem: any) => void;
  weakTopics?: string[];
}

export const AiProblemModal: React.FC<AiProblemModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProblemGenerated,
  weakTopics = []
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [topicFocus, setTopicFocus] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentUser?.preferredLanguage || 'javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const popularTopics = [
    'Boundary & Off-by-one edge cases',
    'Sliding Window dynamic arrays',
    'Two Pointers convergence',
    'Recursion & Dynamic Programming states',
    'Hash Maps & Frequency counting',
    'Binary Search on Answer',
    'Graph Traversal (BFS / DFS)'
  ];

  const handleGenerate = async (focusTopicOverride?: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    const chosenTopic = focusTopicOverride || topicFocus || 'Adaptive problem matching student weak spots';

    try {
      const res = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.id ? { 'Authorization': `Bearer ${currentUser.id}` } : {})
        },
        body: JSON.stringify({
          desiredDifficulty: difficulty,
          preferredLanguage: selectedLanguage,
          topicFocus: chosenTopic,
          skillLevel: currentUser?.skillLevel || 'intermediate'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate problem. Please try again.');
      }

      const generated = await res.json();
      onProblemGenerated(generated);
      onClose();
    } catch (err: any) {
      setGenerationError(err.message || 'Error generating AI problem');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e0e15] border border-[#242436] rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1c1c28] bg-gradient-to-r from-[#170e10] via-[#0d0d14] to-[#07070a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FF5A43]/20 border border-[#FF5A43]/30 text-[#FF8570] flex items-center justify-center shadow-lg shadow-[#FF5A43]/10 shrink-0">
              <Sparkles className="w-5 h-5 text-[#FF5A43]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>AI Problem Generator</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/30">
                  Gemini
                </span>
              </h2>
              <p className="text-xs text-slate-400">Synthesizes targeted coding questions based on your talent profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#14141e] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
          {/* User Profile Awareness Card */}
          <div className="p-3.5 rounded-2xl bg-[#14141e] border border-[#242436] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <BrainCircuit className="w-4 h-4 text-[#FF5A43]" />
              <div>
                <span className="text-slate-400">Current Talent Profile: </span>
                <span className="font-semibold text-white capitalize">{currentUser?.skillLevel || 'Intermediate'} Coder</span>
                <span className="text-slate-500 mx-1.5">•</span>
                <span className="text-[#FF8570] capitalize">{currentUser?.preferredLanguage || 'JavaScript'}</span>
              </div>
            </div>
            <div className="text-[11px] text-[#FF8570] font-medium flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-[#FF5A43]" />
              <span>Targeting Weak Spots</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['basic', 'intermediate', 'advanced'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                    difficulty === diff
                      ? diff === 'basic'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : diff === 'intermediate'
                        ? 'bg-[#FF5A43]/20 text-[#FF8570] border-[#FF5A43]/50 shadow-sm'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                      : 'bg-[#14141e] text-slate-400 border-[#242436] hover:bg-[#1c1c28]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Primary Language For Starter Boilerplate
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['javascript', 'python', 'typescript', 'java', 'cpp', 'go'] as SupportedLanguage[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium capitalize border transition-all cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-[#FF5A43]/20 text-[#FF8570] border-[#FF5A43]/50'
                      : 'bg-[#14141e] text-slate-400 border-[#242436] hover:bg-[#1c1c28]'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Weak Spot Quick Suggestions */}
          {weakTopics.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#FF8570] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>Observed Struggle Areas From Your Submissions</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic: any, i: number) => {
                  const topicStr = typeof topic === 'object' && topic !== null ? (topic.name || topic.title || topic.topic || JSON.stringify(topic)) : String(topic);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTopicFocus(topicStr);
                        handleGenerate(topicStr);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-[#FF5A43]/10 text-[#FF8570] border border-[#FF5A43]/30 hover:bg-[#FF5A43]/20 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Practice: {topicStr}</span>
                      <ArrowRight className="w-3 h-3 text-[#FF5A43]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Focus or Topic Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Specific Concept or Topic to Reinforce (Optional)
            </label>
            <input
              type="text"
              value={topicFocus}
              onChange={e => setTopicFocus(e.target.value)}
              placeholder="e.g. In-place reversal, DP state compression, Triplet sum bounds..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141e] border border-[#242436] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
            />
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {popularTopics.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopicFocus(t)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#14141e] hover:bg-[#1c1c28] text-slate-300 border border-[#242436] transition-colors cursor-pointer"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {generationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {generationError}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-[#1c1c28] bg-[#07070a] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#14141e] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5A43] hover:bg-[#F03E23] shadow-lg shadow-[#FF5A43]/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Adaptive Question...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Tailored Question</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
