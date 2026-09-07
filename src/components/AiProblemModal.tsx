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
          'Authorization': `Bearer ${currentUser?.id || 'usr_student_demo'}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>AI Adaptive Problem Generator</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Gemini 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">Synthesizes targeted coding questions based on your coding talent & mistakes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* User Profile Awareness Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-slate-400">Current Talent Profile: </span>
                <span className="font-semibold text-white capitalize">{currentUser?.skillLevel || 'Intermediate'} Coder</span>
                <span className="text-slate-500 mx-1.5">•</span>
                <span className="text-indigo-300 capitalize">{currentUser?.preferredLanguage || 'JavaScript'}</span>
              </div>
            </div>
            <div className="text-[11px] text-amber-300 font-medium flex items-center space-x-1">
              <Target className="w-3.5 h-3.5" />
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    difficulty === diff
                      ? diff === 'basic'
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : diff === 'intermediate'
                        ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-rose-600/20 text-rose-300 border-rose-500/50 shadow-sm'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800'
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
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium capitalize border transition-all ${
                    selectedLanguage === lang
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
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
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Observed Struggle Areas From Your Submissions</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTopicFocus(topic);
                      handleGenerate(topic);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center space-x-1.5"
                  >
                    <span>Practice: {topic}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {popularTopics.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopicFocus(t)}
                  className="text-[11px] px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
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
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
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
