import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Layers,
  FileCode2,
  Sliders,
  Maximize2,
  Copy,
  Check,
  Zap,
  Loader2,
  Bot,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Problem, SupportedLanguage, Submission, AiCodeReview, User } from '../types';

interface PlaygroundViewProps {
  problem: Problem;
  currentUser: User | null;
  onBackToRoadmap: () => void;
  onSubmissionSuccess?: (sub: Submission) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  problem,
  currentUser,
  onBackToRoadmap,
  onSubmissionSuccess
}) => {
  // Language selection
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (currentUser?.preferredLanguage as SupportedLanguage) || 'javascript'
  );

  // Active code in editor
  const [code, setCode] = useState<string>('');

  // Tabs for left panel: 'description' | 'hints' | 'submissions'
  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'submissions'>('description');

  // Revealed hints counter
  const [revealedHints, setRevealedHints] = useState<number>(0);

  // Test runner state
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTestTab, setActiveTestTab] = useState<string>('t1');

  // Test results
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    passedCount: number;
    totalCount: number;
    executionTimeMs: number;
    memoryKb: number;
    testResults: any[];
  } | null>(null);

  // AI Review state
  const [aiReview, setAiReview] = useState<AiCodeReview | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [showReviewPanel, setShowReviewPanel] = useState<boolean>(false);

  // AI Tutor Drawer
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorMessages, setTutorMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello! I'm your CodeElevate AI Assistant. I'm actively observing your code for **"${problem.title}"**. Feel free to ask for conceptual hints, time-complexity analysis, or help with failing edge cases!`
    }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const tutorBottomRef = useRef<HTMLDivElement>(null);

  // Prior submissions history for this problem
  const [priorSubmissions, setPriorSubmissions] = useState<Submission[]>([]);

  // Load starter code on problem or language change
  useEffect(() => {
    const starter = problem.starterCode?.[selectedLanguage] || problem.starterCode?.javascript || '// Write your solution here';
    setCode(starter);
    setTestResults(null);
    setAiReview(null);
    setRevealedHints(0);
  }, [problem.id, selectedLanguage]);

  useEffect(() => {
    if (isTutorOpen) {
      tutorBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, isTutorOpen]);

  // Handle Code Reset
  const handleResetCode = () => {
    const starter = problem.starterCode?.[selectedLanguage] || problem.starterCode?.javascript || '';
    setCode(starter);
    setTestResults(null);
  };

  // Run Code against test cases
  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.id || 'usr_student_demo'}`
        },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language: selectedLanguage,
          customInput: isCustomMode ? customInput : undefined
        })
      });
      const data = await res.json();
      setTestResults(data);
      if (data.testResults?.[0]?.testId) {
        setActiveTestTab(data.testResults[0].testId);
      }
    } catch (err) {
      console.error('Run code error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code Solution
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setIsReviewing(true);
    setShowReviewPanel(true);
    try {
      const res = await fetch('/api/code/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.id || 'usr_student_demo'}`
        },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language: selectedLanguage
        })
      });

      const submission: Submission = await res.json();
      setTestResults({
        passed: submission.status === 'accepted',
        passedCount: submission.passedCases,
        totalCount: submission.totalCases,
        executionTimeMs: submission.executionTimeMs,
        memoryKb: submission.memoryKb,
        testResults: submission.testResults || []
      });

      if (submission.aiReview) {
        setAiReview(submission.aiReview);
      }

      setPriorSubmissions(prev => [submission, ...prev]);

      if (submission.status === 'accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (onSubmissionSuccess) {
        onSubmissionSuccess(submission);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
      setIsReviewing(false);
    }
  };

  // Send message to AI Tutor
  const handleSendTutorMessage = async (customText?: string) => {
    const query = customText || tutorInput;
    if (!query.trim()) return;

    const newHistory = [...tutorMessages, { role: 'user' as const, text: query }];
    setTutorMessages(newHistory);
    setTutorInput('');
    setIsTutorThinking(true);

    try {
      const res = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          currentCode: code,
          language: selectedLanguage,
          messageHistory: newHistory,
          userQuestion: query
        })
      });
      const data = await res.json();
      setTutorMessages([...newHistory, { role: 'assistant', text: data.reply }]);
    } catch (err: any) {
      setTutorMessages([
        ...newHistory,
        { role: 'assistant', text: 'Sorry, I hit a brief communication hiccup. Try testing your boundary index conditions!' }
      ]);
    } finally {
      setIsTutorThinking(false);
    }
  };

  const diffColor =
    problem.difficulty === 'basic'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : problem.difficulty === 'intermediate'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToRoadmap}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ← Roadmap
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>{problem.title}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
              {problem.difficulty}
            </span>
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select programming language"
              className="bg-slate-800 text-xs font-mono font-medium text-indigo-300 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript (ES6)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ 20</option>
              <option value="go">Go 1.21</option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            title="Reset Starter Template"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Toggle AI Tutor Drawer */}
          <button
            onClick={() => setIsTutorOpen(!isTutorOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isTutorOpen
                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Ask AI Tutor</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Run</span>
          </button>

          {/* Submit Code Button */}
          <button
            onClick={handleFinalSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        {/* LEFT COLUMN: Problem Details, Hints & History (5 cols on lg) */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col h-full bg-[#0d1322] overflow-hidden">
          {/* Subtabs */}
          <div className="flex items-center space-x-1 px-4 py-2 border-b border-slate-800 bg-[#0f172a]/60">
            <button
              onClick={() => setLeftTab('description')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                leftTab === 'description' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setLeftTab('hints')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1 ${
                leftTab === 'hints' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              <span>Hints ({problem.hints?.length || 0})</span>
            </button>
            <button
              onClick={() => setLeftTab('submissions')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                leftTab === 'submissions' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Submissions
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-300">
            {leftTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{problem.category}</span>
                    {problem.acceptanceRate && <span>• {problem.acceptanceRate}% Acceptance</span>}
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                    {problem.description}
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h4>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-indigo-300">Example {idx + 1}:</div>
                      <div className="font-mono text-xs text-slate-200 space-y-1">
                        <div><span className="text-slate-500">Input: </span>{ex.input}</div>
                        <div><span className="text-slate-500">Output: </span>{ex.output}</div>
                        {ex.explanation && (
                          <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                            <span className="text-slate-500">Explanation: </span>{ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints & Invariants</h4>
                  <ul className="space-y-1 text-xs font-mono text-slate-400">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-indigo-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progressive Hints</h4>
                  <span className="text-xs text-indigo-300">
                    Revealed {revealedHints} of {problem.hints?.length || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Hints are revealed progressively from subtle conceptual hints to algorithmic structures so you learn how to reason independently.
                </p>

                {problem.hints && problem.hints.map((hint, idx) => {
                  const isRevealed = idx < revealedHints;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isRevealed ? 'bg-slate-900/80 border-indigo-500/30 text-slate-200' : 'bg-slate-900/40 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-400">Hint {idx + 1}</span>
                        {!isRevealed && (
                          <button
                            onClick={() => setRevealedHints(idx + 1)}
                            className="text-xs text-cyan-400 hover:underline font-semibold"
                          >
                            Reveal Hint
                          </button>
                        )}
                      </div>
                      {isRevealed ? (
                        <p className="text-xs text-slate-300 leading-relaxed">{hint}</p>
                      ) : (
                        <p className="text-xs text-slate-600 italic">Click reveal to unlock this guidance</p>
                      )}
                    </div>
                  );
                })}

                {revealedHints < (problem.hints?.length || 0) && (
                  <button
                    onClick={() => setRevealedHints(prev => prev + 1)}
                    className="w-full py-2.5 rounded-xl border border-indigo-500/30 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                  >
                    Unlock Next Hint ({revealedHints + 1})
                  </button>
                )}
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Submissions</h4>
                {priorSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No submissions recorded yet for this problem. Click "Submit" to evaluate your solution with tests and real-time AI code review!
                  </div>
                ) : (
                  priorSubmissions.map((sub, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center space-x-1 ${sub.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status === 'accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span className="capitalize">{sub.status.replace('_', ' ')}</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                        <span>Passed: {sub.passedCases}/{sub.totalCases}</span>
                        <span>{sub.executionTimeMs} ms</span>
                        <span className="capitalize">{sub.language}</span>
                      </div>
                      {sub.aiReview && (
                        <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2 rounded border border-indigo-800/40">
                          <strong>AI: </strong>{sub.aiReview.summary}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor & Test Console (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-[#0b0f19] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d1322] border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono font-semibold text-slate-200">solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'go' ? 'go' : selectedLanguage === 'typescript' ? 'ts' : 'js'}</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span>Tab Size: 2</span>
              <span>UTF-8</span>
            </div>
          </div>

          {/* Interactive Code Area */}
          <div className="flex-1 relative overflow-hidden bg-[#070b14]">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                // Tab indentation support
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const target = e.target as HTMLTextAreaElement;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  setCode(code.substring(0, start) + '  ' + code.substring(end));
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 2;
                  }, 0);
                }
              }}
              spellCheck={false}
              className="w-full h-full p-4 font-mono text-xs sm:text-sm text-slate-100 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/30"
              placeholder="// Write your solution here..."
            />
          </div>

          {/* Test Runner Bottom Drawer / Console */}
          <div className="h-64 sm:h-72 border-t border-slate-800 bg-[#0d1322] flex flex-col overflow-hidden">
            {/* Console Tabs */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800 bg-[#0f172a] text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-300">Test Cases</span>
                <div className="flex items-center space-x-1">
                  {problem.testCases.map((tc, idx) => {
                    const testResult = testResults?.testResults?.find((r: any) => r.testId === tc.id);
                    return (
                      <button
                        key={tc.id}
                        onClick={() => {
                          setActiveTestTab(tc.id);
                          setIsCustomMode(false);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors flex items-center space-x-1 ${
                          activeTestTab === tc.id && !isCustomMode
                            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {testResult && (
                          testResult.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>Case {idx + 1}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setIsCustomMode(true)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      isCustomMode ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    + Custom Input
                  </button>
                </div>
              </div>

              {testResults && (
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  <span className={testResults.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {testResults.passed ? 'ACCEPTED' : 'TESTS FAILED'} ({testResults.passedCount}/{testResults.totalCount})
                  </span>
                  <span className="text-slate-400">{testResults.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {/* Test Case Body */}
            <div className="flex-1 p-3.5 overflow-y-auto font-mono text-xs space-y-3">
              {isCustomMode ? (
                <div className="space-y-2">
                  <div className="text-slate-400 text-[11px]">Enter Custom Argument Parameters:</div>
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder='e.g. [2,7,11,15], 9'
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500">Run code to test your function directly against this input.</p>
                </div>
              ) : (
                (() => {
                  const currCase = problem.testCases.find(tc => tc.id === activeTestTab) || problem.testCases[0];
                  const currRes = testResults?.testResults?.find((r: any) => r.testId === currCase?.id);

                  return (
                    <div className="space-y-2.5">
                      <div>
                        <div className="text-[11px] text-slate-500 mb-1">Input:</div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200">
                          {currCase?.input}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">Expected Output:</div>
                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400">
                            {currCase?.expectedOutput}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">Actual Output:</div>
                          <div className={`p-2 rounded-lg bg-slate-900/80 border ${
                            currRes ? (currRes.passed ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300') : 'border-slate-800 text-slate-400'
                          }`}>
                            {currRes ? currRes.actual : 'Click "Run" to test'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        {/* SLIDE-OUT AI CODE REVIEW DRAWER */}
        {showReviewPanel && aiReview && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[#0f172a] border-l border-slate-700 shadow-2xl z-30 flex flex-col overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span className="font-bold text-sm text-white">AI Real-Time Code Review</span>
              </div>
              <button
                onClick={() => setShowReviewPanel(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Score and Complexities */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-800/80 text-center border border-slate-700">
                  <div className="text-[10px] text-slate-400">Score</div>
                  <div className={`text-base font-extrabold ${aiReview.correctnessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {aiReview.correctnessScore}/100
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 text-center border border-slate-700">
                  <div className="text-[10px] text-slate-400">Time Complexity</div>
                  <div className="text-xs font-mono font-bold text-indigo-300 truncate" title={aiReview.timeComplexity}>
                    {aiReview.timeComplexity.split(' ')[0]}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 text-center border border-slate-700">
                  <div className="text-[10px] text-slate-400">Space Complexity</div>
                  <div className="text-xs font-mono font-bold text-cyan-300 truncate" title={aiReview.spaceComplexity}>
                    {aiReview.spaceComplexity.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 leading-relaxed text-slate-200">
                <span className="font-semibold text-white">Feedback: </span>
                {aiReview.summary}
              </div>

              {/* Strengths */}
              {aiReview.strengths?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Key Strengths</span>
                  </div>
                  <ul className="space-y-1 pl-4 text-slate-300 list-disc">
                    {aiReview.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {aiReview.improvements?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-amber-400 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Areas to Improve</span>
                  </div>
                  <ul className="space-y-1 pl-4 text-slate-300 list-disc">
                    {aiReview.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Edge Cases Analysis */}
              {aiReview.edgeCasesMissed?.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                  <div className="font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Watch Out for Edge Cases:</span>
                  </div>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                    {aiReview.edgeCasesMissed.map((ec, i) => (
                      <li key={i}>{ec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Code Snippet */}
              {aiReview.suggestedOptimizedSnippet && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-indigo-300">Clean Reference Implementation:</div>
                  <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800">
                    {aiReview.suggestedOptimizedSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOATING AI TUTOR CHAT DRAWER */}
        {isTutorOpen && (
          <div className="absolute right-4 bottom-4 w-80 sm:w-96 h-[460px] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-800 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">Elevate AI Coding Tutor</span>
              </div>
              <button
                onClick={() => setIsTutorOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap gap-1">
              <button
                onClick={() => handleSendTutorMessage('Can you give me a subtle conceptual hint?')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
              >
                💡 Give me a hint
              </button>
              <button
                onClick={() => handleSendTutorMessage('Why might my solution fail on large inputs?')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
              >
                ⏱️ Check complexity
              </button>
              <button
                onClick={() => handleSendTutorMessage('What edge cases should I test for this problem?')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
              >
                🎯 Edge cases
              </button>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {tutorMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-6'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700 mr-4'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
              {isTutorThinking && (
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400 text-xs flex items-center space-x-2 mr-4">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>AI Tutor is analyzing your code...</span>
                </div>
              )}
              <div ref={tutorBottomRef} />
            </div>

            {/* Input box */}
            <div className="p-2.5 border-t border-slate-800 bg-slate-900 flex items-center space-x-1.5">
              <input
                type="text"
                value={tutorInput}
                onChange={e => setTutorInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendTutorMessage()}
                placeholder="Ask about your code or algorithmic logic..."
                className="flex-1 bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSendTutorMessage()}
                disabled={isTutorThinking || !tutorInput.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
