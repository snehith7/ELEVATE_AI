import React, { useState } from 'react';
import {
  Code2,
  X,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Layers,
  FileCode,
  ListChecks
} from 'lucide-react';
import { Difficulty, SupportedLanguage, ProblemExample, TestCase } from '../types';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded: (newProblem: any) => void;
}

const COMMON_CATEGORIES = [
  'Arrays & Hash Maps',
  'Two Pointers',
  'Sliding Window',
  'Stack & Queue',
  'Binary Search',
  'Linked Lists',
  'Trees & Graphs',
  'Dynamic Programming',
  'Backtracking & Recursion',
  'Strings & Parsing',
  'Greedy & Math',
  'Bit Manipulation'
];

export const AddProblemModal: React.FC<AddProblemModalProps> = ({
  isOpen,
  onClose,
  onProblemAdded
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [selectedCategory, setSelectedCategory] = useState(COMMON_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [tagsInput, setTagsInput] = useState('array, algorithms');
  const [description, setDescription] = useState('');

  // Examples
  const [examples, setExamples] = useState<ProblemExample[]>([
    { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
  ]);

  // Constraints
  const [constraintsText, setConstraintsText] = useState('1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\nTarget time complexity: O(N)');

  // Test cases
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 'tc_1', input: '[2,7,11,15], 9', expectedOutput: '[0,1]', isHidden: false },
    { id: 'tc_2', input: '[3,2,4], 6', expectedOutput: '[1,2]', isHidden: false },
    { id: 'tc_3', input: '[3,3], 6', expectedOutput: '[0,1]', isHidden: true }
  ]);

  // Starter Code Tabs
  const [activeLangTab, setActiveLangTab] = useState<SupportedLanguage>('javascript');
  const [starterCodes, setStarterCodes] = useState<Record<SupportedLanguage, string>>({
    javascript: 'function solution(input) {\n  // Write your solution here\n  return null;\n}',
    python: 'def solution(input):\n    # Write your solution here\n    return None',
    typescript: 'function solution(input: any): any {\n  // Write your solution here\n  return null;\n}',
    java: 'public class Solution {\n    public static Object solution(Object input) {\n        // Write solution here\n        return null;\n    }\n}',
    cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto solution(auto input) {\n        return 0;\n    }\n};',
    go: 'package main\n\nfunc solution(input interface{}) interface{} {\n    return nil\n}'
  });

  // Loading & AI drafting states
  const [isLoading, setIsLoading] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = isCustomCategory ? customCategory : selectedCategory;

  // Auto-generate starter templates based on title
  const handleGenerateBoilerplate = () => {
    if (!title.trim()) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const funcName = slug
      .split('-')
      .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join('') || 'solve';

    setStarterCodes({
      javascript: `/**\n * @param {any} input\n * @return {any}\n */\nfunction ${funcName}(input) {\n  // Implement solution\n  return null;\n}`,
      python: `def ${funcName}(input):\n    # Implement solution\n    return None`,
      typescript: `function ${funcName}(input: any): any {\n  // Implement solution\n  return null;\n}`,
      java: `public class Solution {\n    public static Object ${funcName}(Object input) {\n        // Implement solution\n        return null;\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto ${funcName}(auto input) {\n        // Implement solution\n        return 0;\n    }\n};`,
      go: `package main\n\nfunc ${funcName}(input interface{}) interface{} {\n    // Implement solution\n    return nil\n}`
    });
  };

  // AI Assistant: Automatically drafts categorical problem
  const handleAiDraftProblem = async () => {
    setIsAiDrafting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/problems/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title || currentCategory,
          category: currentCategory,
          difficulty,
          targetLanguage: activeLangTab
        })
      });

      const data = await res.json();
      if (!res.ok || !data.draft) {
        throw new Error(data.error || 'Failed to draft problem with AI.');
      }

      const draft = data.draft;
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.difficulty) setDifficulty(draft.difficulty);
      if (draft.category) {
        if (COMMON_CATEGORIES.includes(draft.category)) {
          setSelectedCategory(draft.category);
          setIsCustomCategory(false);
        } else {
          setIsCustomCategory(true);
          setCustomCategory(draft.category);
        }
      }
      if (draft.examples && Array.isArray(draft.examples)) {
        setExamples(draft.examples);
      }
      if (draft.constraints && Array.isArray(draft.constraints)) {
        setConstraintsText(draft.constraints.join('\n'));
      }
      if (draft.testCases && Array.isArray(draft.testCases)) {
        setTestCases(draft.testCases);
      }
      if (draft.starterCode) {
        setStarterCodes(prev => ({
          ...prev,
          ...draft.starterCode
        }));
      }
      if (draft.tags && Array.isArray(draft.tags)) {
        setTagsInput(draft.tags.join(', '));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AI drafting was unavailable.');
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleAddExample = () => {
    setExamples(prev => [...prev, { input: '', output: '', explanation: '' }]);
  };

  const handleRemoveExample = (idx: number) => {
    setExamples(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddTestCase = () => {
    setTestCases(prev => [
      ...prev,
      { id: `tc_${prev.length + 1}`, input: '', expectedOutput: '', isHidden: false }
    ]);
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Problem title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Problem description is required.');
      return;
    }
    if (!currentCategory.trim()) {
      setErrorMsg('Category is required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const parsedConstraints = constraintsText
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          difficulty,
          category: currentCategory.trim(),
          description: description.trim(),
          examples,
          constraints: parsedConstraints,
          starterCode: starterCodes,
          testCases,
          tags: parsedTags
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create problem.');
      }

      onProblemAdded(data.problem);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the problem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#0f172a] border border-purple-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Add Curriculum Problem</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Categorical Authoring
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Organize challenges by algorithmic category, difficulty tiers, and multi-language boilerplate
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAiDraftProblem}
              disabled={isAiDrafting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiDrafting ? 'Drafting with AI...' : 'Draft with AI'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Section 1: Classification (Difficulty & Category) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5 text-purple-300">
              <Layers className="w-4 h-4" />
              <span>1. Categorical Classification & Difficulty Level</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Difficulty */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Difficulty Level *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['basic', 'intermediate', 'advanced'] as Difficulty[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-xl text-center capitalize font-bold text-xs border transition-all cursor-pointer ${
                        difficulty === lvl
                          ? lvl === 'basic'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : lvl === 'intermediate'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Category *</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    {isCustomCategory ? 'Pick Standard' : '+ Custom Category'}
                  </button>
                </div>
                {isCustomCategory ? (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    placeholder="e.g. Trie & Prefix Trees"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    {COMMON_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Search Tags</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. array, hash-table, two-pointers"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Problem Metadata */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5 text-purple-300">
              <FileCode className="w-4 h-4" />
              <span>2. Problem Title & Statement</span>
            </h4>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Problem Title *</label>
                <button
                  type="button"
                  onClick={handleGenerateBoilerplate}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  Generate Function Name for Starters
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Longest Substring Without Repeating Characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Detailed Description (Markdown Supported) *</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Given a string s, find the length of the longest substring without repeating characters..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-xs leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 3: Multi-Language Starter Code */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5 text-purple-300">
                <Code2 className="w-4 h-4" />
                <span>3. Language-Specific Starter Code</span>
              </h4>
              <button
                type="button"
                onClick={handleGenerateBoilerplate}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Reset Boilerplates
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-800 pb-2 overflow-x-auto">
              {(['javascript', 'python', 'typescript', 'java', 'cpp', 'go'] as SupportedLanguage[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLangTab(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                    activeLangTab === lang
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang}
                </button>
              ))}
            </div>

            <div>
              <textarea
                rows={5}
                value={starterCodes[activeLangTab]}
                onChange={e => {
                  const val = e.target.value;
                  setStarterCodes(prev => ({ ...prev, [activeLangTab]: val }));
                }}
                className="w-full p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Section 4: Examples & Constraints */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5 text-purple-300">
                <ListChecks className="w-4 h-4" />
                <span>4. Examples & Constraints</span>
              </h4>
              <button
                type="button"
                onClick={handleAddExample}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Example</span>
              </button>
            </div>

            <div className="space-y-3">
              {examples.map((ex, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 relative">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>Example {idx + 1}</span>
                    {examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExample(idx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Input:</span>
                      <input
                        type="text"
                        value={ex.input}
                        onChange={e => {
                          const val = e.target.value;
                          setExamples(prev => prev.map((item, i) => i === idx ? { ...item, input: val } : item));
                        }}
                        placeholder="nums = [2,7,11,15], target = 9"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Output:</span>
                      <input
                        type="text"
                        value={ex.output}
                        onChange={e => {
                          const val = e.target.value;
                          setExamples(prev => prev.map((item, i) => i === idx ? { ...item, output: val } : item));
                        }}
                        placeholder="[0, 1]"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Explanation (Optional):</span>
                    <input
                      type="text"
                      value={ex.explanation || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setExamples(prev => prev.map((item, i) => i === idx ? { ...item, explanation: val } : item));
                      }}
                      placeholder="Because nums[0] + nums[1] == 9"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Constraints (one per line)</label>
              <textarea
                rows={3}
                value={constraintsText}
                onChange={e => setConstraintsText(e.target.value)}
                placeholder="1 <= s.length <= 10^5&#10;Target time complexity: O(N)"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          {/* Section 5: Executable Test Cases */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5 text-purple-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>5. Automated Test Cases</span>
              </h4>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-2">
              {testCases.map((tc, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[11px] font-mono text-slate-400 w-8">#{idx + 1}</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={e => {
                        const val = e.target.value;
                        setTestCases(prev => prev.map((item, i) => i === idx ? { ...item, input: val } : item));
                      }}
                      placeholder="Input parameters"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={e => {
                        const val = e.target.value;
                        setTestCases(prev => prev.map((item, i) => i === idx ? { ...item, expectedOutput: val } : item));
                      }}
                      placeholder="Expected Output"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      required
                    />
                  </div>
                  <label className="flex items-center space-x-1 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tc.isHidden}
                      onChange={e => {
                        const checked = e.target.checked;
                        setTestCases(prev => prev.map((item, i) => i === idx ? { ...item, isHidden: checked } : item));
                      }}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Secret</span>
                  </label>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isLoading ? 'Saving Problem...' : 'Publish to Curriculum'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
