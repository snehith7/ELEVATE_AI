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
  AlertCircle,
  ArrowLeft,
  FileText,
  Terminal,
  Code2,
  RefreshCw
} from 'lucide-react';
import { Problem, SupportedLanguage, Submission, AiCodeReview, User } from '../types';
import { PracticeSheetView } from './PracticeSheetView';
import Editor from '@monaco-editor/react';

function renderMentorMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    const rawLine = isBullet ? line.trim().substring(2) : line;

    // Parse bold **...** and code `...`
    const segments = rawLine.split(/(\*\*.*?\*\*|`.*?`)/g);
    const rendered = segments.map((seg, sIdx) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={sIdx} className="font-bold text-indigo-300">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={sIdx} className="font-mono bg-slate-900 text-amber-300 px-1 py-0.5 rounded text-[11px] border border-slate-700/60">
            {seg.slice(1, -1)}
          </code>
        );
      }
      return seg;
    });

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start space-x-2 ml-1 my-0.5">
          <span className="text-indigo-400 mt-1 text-[8px]">●</span>
          <span className="flex-1 leading-relaxed">{rendered}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="leading-relaxed">
        {rendered}
      </p>
    );
  });
}

interface PlaygroundIdeProps {
  problem: Problem;
  currentUser: User | null;
  onBackToSheet: () => void;
  onBackToRoadmap: () => void;
  onSubmissionSuccess?: (sub: Submission) => void;
}

const PlaygroundIde: React.FC<PlaygroundIdeProps> = ({
  problem,
  currentUser,
  onBackToSheet,
  onBackToRoadmap,
  onSubmissionSuccess
}) => {
  // Mobile active tab: 'problem' | 'code' | 'tests'
  const [mobilePane, setMobilePane] = useState<'problem' | 'code' | 'tests'>('problem');

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
  const [consoleTab, setConsoleTab] = useState<'cases' | 'logs'>('cases');

  // Test results
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    passedCount: number;
    totalCount: number;
    executionTimeMs: number;
    memoryKb: number;
    testResults: any[];
    compileError?: {
      message: string;
      line?: number;
      column?: number;
      stack?: string;
    };
    runtimeError?: {
      message: string;
      stack?: string;
    };
    stdout?: string;
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
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [loadedNotice, setLoadedNotice] = useState<string | null>(null);
  const [isProblemSolved, setIsProblemSolved] = useState<boolean>(Boolean(problem.solvedByCurrentUser));

  useEffect(() => {
    setIsProblemSolved(Boolean(problem.solvedByCurrentUser));
  }, [problem.id, problem.solvedByCurrentUser]);

  // Fetch prior submissions for this problem
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/problems/${problem.id}/submissions`, {
        headers: currentUser?.id ? { 'Authorization': `Bearer ${currentUser.id}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPriorSubmissions(data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch prior submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Define custom dark theme for Monaco Editor that matches CodeElevate UI aesthetic
  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('codeelevate-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'identifier', foreground: 'f1f5f9' },
        { token: 'delimiter', foreground: '94a3b8' }
      ],
      colors: {
        'editor.background': '#070b14',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#0f172a60',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818cf8',
        'editorIndentGuide.background': '#1e293b60',
        'editorIndentGuide.activeBackground': '#334155',
        'editorBracketMatch.background': '#312e81',
        'editorBracketMatch.border': '#6366f1',
        'editorCursor.foreground': '#60a5fa',
        'editor.selectionBackground': '#3730a370'
      }
    });
  };

  // Strictly reset state and load clean starter code for unsolved problem
  useEffect(() => {
    const starter = problem.starterCode?.[selectedLanguage] || problem.starterCode?.javascript || '// Write your solution here';
    setCode(starter);
    setTestResults(null);
    setAiReview(null);
    setShowReviewPanel(false);
    setRevealedHints(0);
    setCustomInput('');
    setIsCustomMode(false);
    setExpandedSubmissionId(null);
    setLoadedNotice(null);
    setActiveTestTab(problem.testCases?.[0]?.id || 't1');
    setTutorMessages([
      {
        role: 'assistant',
        text: `Hello! I'm your CodeElevate AI Assistant. I'm actively observing your code for **"${problem.title}"**. Feel free to ask for conceptual hints, time-complexity analysis, or help with failing edge cases!`
      }
    ]);
    fetchSubmissions();
  }, [problem.id, currentUser?.id]);

  // When language changes, update editor to starter code for that language
  useEffect(() => {
    const starter = problem.starterCode?.[selectedLanguage] || problem.starterCode?.javascript || '// Write your solution here';
    setCode(starter);
  }, [selectedLanguage]);

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
    setLoadedNotice('Reset editor to clean boilerplate starter code.');
    setTimeout(() => setLoadedNotice(null), 3000);
  };

  // Load past submission back into the active editor
  const handleLoadSubmissionToEditor = (sub: Submission) => {
    setCode(sub.code);
    if (sub.language) {
      setSelectedLanguage(sub.language);
    }
    setLoadedNotice(`Loaded attempt from ${new Date(sub.createdAt).toLocaleTimeString()} into the code editor.`);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobilePane('code');
    }
    setTimeout(() => setLoadedNotice(null), 4000);
  };

  // Copy past submission code
  const handleCopySubmissionCode = (sub: Submission) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sub.code);
      setCopySuccessId(sub.id);
      setTimeout(() => setCopySuccessId(null), 2000);
    }
  };

  // Run Code against test cases
  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.id ? { 'Authorization': `Bearer ${currentUser.id}` } : {})
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
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setMobilePane('tests');
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
          ...(currentUser?.id ? { 'Authorization': `Bearer ${currentUser.id}` } : {})
        },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language: selectedLanguage
        })
      });

      const submission: Submission = await res.json();
      const isPassed = submission.status === 'Passed' || submission.status === 'accepted';

      setTestResults({
        passed: isPassed,
        passedCount: submission.passedCases,
        totalCount: submission.totalCases,
        executionTimeMs: submission.executionTimeMs,
        memoryKb: submission.memoryKb,
        testResults: submission.testResults || [],
        compileError: (submission as any).compileError,
        runtimeError: (submission as any).runtimeError,
        stdout: (submission as any).stdout
      });

      // Switch to first failed test case if any failed, or first case
      const firstFailed = submission.testResults?.find(r => !r.passed);
      if (firstFailed?.testId) {
        setActiveTestTab(firstFailed.testId);
      } else if (submission.testResults?.[0]?.testId) {
        setActiveTestTab(submission.testResults[0].testId);
      }

      if (submission.aiReview) {
        setAiReview(submission.aiReview);
      }

      setPriorSubmissions(prev => [submission, ...prev]);

      if (isPassed) {
        setIsProblemSolved(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onSubmissionSuccess) {
          onSubmissionSuccess(submission);
        }
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
    <div className="flex flex-col h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0f172a] border-b border-slate-800 gap-2 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={onBackToSheet}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 transition-all cursor-pointer shrink-0"
            title="Return to Problem Practice Sheet"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Practice Sheet</span>
          </button>
          <button
            onClick={onBackToRoadmap}
            className="text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer hidden md:block shrink-0"
          >
            Roadmap
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <span className="truncate max-w-[110px] xs:max-w-[160px] sm:max-w-xs md:max-w-md">{problem.title}</span>
            <span className={`text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${diffColor}`}>
              {problem.difficulty}
            </span>
            {isProblemSolved && (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Solved</span>
              </span>
            )}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select programming language"
              className="bg-slate-800 text-[11px] sm:text-xs font-mono font-medium text-indigo-300 rounded-lg px-2 sm:px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            title="Reset Starter Template"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Toggle AI Tutor Drawer */}
          <button
            id="ask-ai-tutor-btn"
            onClick={() => setIsTutorOpen(!isTutorOpen)}
            title="Open Live AI Mentor & Code Tutor"
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isTutorOpen
                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm shadow-indigo-500/20'
                : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold">AI Mentor</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Run</span>
          </button>

          {/* Submit Code Button */}
          <button
            onClick={handleFinalSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (< lg) */}
      <div className="lg:hidden flex items-center justify-around border-b border-slate-800 bg-[#0c1220] px-2 py-1.5 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setMobilePane('problem')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobilePane === 'problem'
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Problem</span>
        </button>
        <button
          onClick={() => setMobilePane('code')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobilePane === 'code'
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setMobilePane('tests')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobilePane === 'tests'
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
          {testResults && (
            <span className={`w-2 h-2 rounded-full ${testResults.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          )}
        </button>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        {/* LEFT COLUMN: Problem Details, Hints & History (5 cols on lg) */}
        <div className={`${mobilePane === 'problem' ? 'flex' : 'hidden'} lg:flex lg:col-span-5 border-r border-slate-800 flex-col h-full bg-[#0d1322] overflow-hidden`}>
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

                {/* Direct AI Mentor Prompt */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsTutorOpen(true);
                      handleSendTutorMessage('Can you guide me on the key algorithmic strategy for this problem without giving away the complete solution?');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 text-xs font-bold text-emerald-300 bg-emerald-950/20 hover:bg-emerald-900/40 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ask AI Mentor For Personalized Guidance</span>
                  </button>
                </div>
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attempt History</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold">
                      {priorSubmissions.length}
                    </span>
                  </div>
                  <button
                    onClick={fetchSubmissions}
                    disabled={isLoadingSubmissions}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Refresh attempts"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingSubmissions ? 'animate-spin text-indigo-400' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadedNotice && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-xs text-indigo-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{loadedNotice}</span>
                    </div>
                    <button onClick={() => setLoadedNotice(null)} className="text-indigo-400 hover:text-indigo-200 text-xs font-bold ml-2 cursor-pointer">✕</button>
                  </div>
                )}

                {priorSubmissions.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800 text-slate-500 space-y-2">
                    <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-400">No attempts submitted yet</p>
                    <p className="text-[11px] leading-relaxed text-slate-500 max-w-xs mx-auto">
                      Write your code in the editor and click "Submit" to run the test suite. Every attempt (Passed or Failed) will be permanently saved here for review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {priorSubmissions.map((sub, idx) => {
                      const isPassed = sub.status === 'Passed' || sub.status === 'accepted';
                      const isExpanded = expandedSubmissionId === (sub.id || String(idx));

                      return (
                        <div
                          key={sub.id || idx}
                          className={`rounded-xl border transition-all ${
                            isPassed
                              ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold flex items-center space-x-1.5 text-xs ${
                                isPassed ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                <span>{isPassed ? 'Passed' : 'Failed'}</span>
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                {new Date(sub.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pt-0.5">
                              <div className="flex items-center space-x-3">
                                <span>Passed: <strong className={isPassed ? 'text-emerald-300' : 'text-slate-200'}>{sub.passedCases}/{sub.totalCases}</strong></span>
                                <span>{sub.executionTimeMs} ms</span>
                                <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{sub.language}</span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleLoadSubmissionToEditor(sub)}
                                  className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer"
                                  title="Load this solution into the editor"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Load</span>
                                </button>

                                <button
                                  onClick={() => setExpandedSubmissionId(isExpanded ? null : (sub.id || String(idx)))}
                                  className="flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-semibold cursor-pointer"
                                >
                                  <span>{isExpanded ? 'Hide Code' : 'Review Code'}</span>
                                  <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Collapsible submitted code & review preview */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <span className="font-mono text-slate-300 font-semibold">Submitted Code ({sub.language}):</span>
                                  <button
                                    onClick={() => handleCopySubmissionCode(sub)}
                                    className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                  >
                                    {copySuccessId === sub.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="p-3 rounded-lg bg-black/70 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56 leading-relaxed select-text">
                                  <code>{sub.code}</code>
                                </pre>

                                {sub.aiReview && (
                                  <div className="text-[11px] text-indigo-200 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/40 mt-2 space-y-1">
                                    <div className="font-semibold text-indigo-300 flex items-center space-x-1">
                                      <Sparkles className="w-3 h-3 text-indigo-400" />
                                      <span>AI Diagnostic Summary</span>
                                    </div>
                                    <p className="leading-relaxed">{sub.aiReview.summary}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor & Test Console (7 cols on lg) */}
        <div className={`${mobilePane !== 'problem' ? 'flex' : 'hidden'} lg:flex lg:col-span-7 flex-col h-full bg-[#0b0f19] overflow-hidden`}>
          {/* Interactive Code Area */}
          <div className={`${mobilePane === 'tests' ? 'hidden' : 'flex'} lg:flex flex-1 relative overflow-hidden bg-[#070b14] flex-col min-h-0`}>
            {/* Editor Header Bar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#0d1322] border-b border-slate-800 text-xs text-slate-400 shrink-0">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono font-semibold text-slate-200">
                  solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'go' ? 'go' : selectedLanguage === 'typescript' ? 'ts' : 'js'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 font-mono font-semibold uppercase tracking-wider">
                  {selectedLanguage}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="hidden sm:inline-flex items-center space-x-1 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Monaco Editor</span>
                </span>
                <span>Tab: 2</span>
                <span>UTF-8</span>
              </div>
            </div>

            {/* Rich Monaco Code Editor */}
            <div className="flex-1 w-full h-full relative min-h-0 bg-[#070b14]">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                theme="codeelevate-dark"
                beforeMount={handleEditorWillMount}
                onChange={(val) => setCode(val ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontLigatures: true,
                  tabSize: 2,
                  insertSpaces: true,
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  autoClosingOvertype: 'always',
                  autoIndent: 'full',
                  formatOnPaste: true,
                  formatOnType: true,
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  matchBrackets: 'always',
                  bracketPairColorization: { enabled: true },
                  automaticLayout: true,
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  fixedOverflowWidgets: true
                }}
                loading={
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs space-x-2 bg-[#070b14]">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Loading Monaco Code Editor...</span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Test Runner Bottom Drawer / Console */}
          <div className={`${mobilePane === 'code' ? 'hidden' : 'flex'} lg:flex ${mobilePane === 'tests' ? 'flex-1' : 'h-72 sm:h-80'} border-t border-slate-800 bg-[#0d1322] flex-col overflow-hidden shrink-0 lg:shrink-0`}>
            {/* Console Tabs */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-800 bg-[#0f172a] text-xs shrink-0 flex-wrap gap-2">
              <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                <span className="font-bold text-slate-300 hidden sm:inline text-xs">Console</span>
                <div className="flex items-center space-x-1">
                  {/* Test case tabs from testResults or problem */}
                  {(() => {
                    const casesToDisplay = testResults?.testResults?.length
                      ? testResults.testResults
                      : problem.testCases;

                    return casesToDisplay.map((tc: any, idx: number) => {
                      const caseId = tc.testId || tc.id;
                      const isSelected = activeTestTab === caseId && !isCustomMode && consoleTab === 'cases';
                      const res = testResults?.testResults?.find((r: any) => r.testId === caseId) || (tc.passed !== undefined ? tc : null);

                      let statusIcon = null;
                      if (res) {
                        if (res.passed) {
                          statusIcon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
                        } else if (res.status === 'Syntax Error') {
                          statusIcon = <AlertCircle className="w-3 h-3 text-rose-400" />;
                        } else if (res.status === 'Runtime Error') {
                          statusIcon = <AlertCircle className="w-3 h-3 text-amber-400" />;
                        } else if (res.status === 'Time Limit Exceeded') {
                          statusIcon = <Clock className="w-3 h-3 text-purple-400" />;
                        } else {
                          statusIcon = <XCircle className="w-3 h-3 text-rose-400" />;
                        }
                      }

                      return (
                        <button
                          key={caseId}
                          onClick={() => {
                            setActiveTestTab(caseId);
                            setIsCustomMode(false);
                            setConsoleTab('cases');
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors flex items-center space-x-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm'
                              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          {statusIcon}
                          <span>{tc.isHidden ? `Hidden ${idx + 1}` : `Case ${idx + 1}`}</span>
                        </button>
                      );
                    });
                  })()}

                  <button
                    onClick={() => {
                      setIsCustomMode(true);
                      setConsoleTab('cases');
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors shrink-0 ${
                      isCustomMode && consoleTab === 'cases'
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    + Custom Input
                  </button>

                  {/* Stdout Logs Tab */}
                  {(testResults?.stdout || testResults?.testResults?.some((r: any) => r.stdout)) && (
                    <button
                      onClick={() => setConsoleTab('logs')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors flex items-center space-x-1 shrink-0 ${
                        consoleTab === 'logs'
                          ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/50'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Stdout</span>
                    </button>
                  )}
                </div>
              </div>

              {testResults && (
                <div className="flex items-center space-x-3 text-[11px] font-mono shrink-0">
                  {testResults.compileError ? (
                    <span className="text-rose-400 font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>SYNTAX ERROR</span>
                    </span>
                  ) : testResults.runtimeError ? (
                    <span className="text-amber-400 font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>RUNTIME ERROR</span>
                    </span>
                  ) : (
                    <span className={testResults.passed ? 'text-emerald-400 font-bold flex items-center space-x-1' : 'text-rose-400 font-bold flex items-center space-x-1'}>
                      {testResults.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{testResults.passed ? 'ACCEPTED' : 'TESTS FAILED'}</span>
                      <span className="text-slate-400 font-normal">({testResults.passedCount}/{testResults.totalCount})</span>
                    </span>
                  )}
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{testResults.executionTimeMs} ms</span>
                  </span>
                </div>
              )}
            </div>

            {/* Test Case & Error Body */}
            <div className="flex-1 p-3.5 overflow-y-auto font-mono text-xs space-y-3">
              {consoleTab === 'logs' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-200 font-semibold">Standard Output (Console Logs)</span>
                    </span>
                    <span>Captured from sandbox</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-black/80 border border-slate-800 text-cyan-300 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {testResults?.stdout || 'No stdout printed during execution.'}
                  </pre>
                </div>
              ) : isCustomMode ? (
                <div className="space-y-2.5">
                  <div className="text-slate-400 text-[11px]">Enter Custom Argument Parameters:</div>
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder='e.g. [2,7,11,15], 9'
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500">Run code to test your function directly against this input.</p>

                  {testResults?.testResults?.[0] && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="text-[11px] text-slate-400 font-semibold">Custom Run Result:</div>
                      <div className="p-2 rounded-lg bg-black/60 font-mono text-slate-200 text-xs">
                        {testResults.testResults[0].actual}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                (() => {
                  const currCase = (problem.testCases.find(tc => tc.id === activeTestTab) ||
                    testResults?.testResults?.find((r: any) => r.testId === activeTestTab) ||
                    problem.testCases[0]) as any;
                  const currRes = testResults?.testResults?.find((r: any) => r.testId === currCase?.id || r.testId === currCase?.testId);

                  return (
                    <div className="space-y-3">
                      {/* Global or Test-specific Syntax Error Banner */}
                      {(testResults?.compileError || currRes?.status === 'Syntax Error') && (
                        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2">
                          <div className="flex items-center justify-between text-rose-300 font-semibold text-xs">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span>Syntax / Compilation Error</span>
                            </div>
                            {testResults?.compileError?.line && (
                              <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 text-[10px] font-mono">
                                Line {testResults.compileError.line}{testResults.compileError.column ? `, Col ${testResults.compileError.column}` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-rose-200 font-mono text-xs">
                            {testResults?.compileError?.message || currRes?.error}
                          </p>
                          {(testResults?.compileError?.stack || currRes?.stack) && (
                            <pre className="p-2.5 rounded-lg bg-black/80 border border-rose-900/50 text-rose-300 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                              {testResults?.compileError?.stack || currRes?.stack}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* Runtime Error Banner */}
                      {!testResults?.compileError && (currRes?.status === 'Runtime Error' || (testResults?.runtimeError && !currRes?.passed)) && (
                        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2">
                          <div className="flex items-center space-x-2 text-amber-300 font-semibold text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Runtime Error</span>
                          </div>
                          <p className="text-amber-200 font-mono text-xs">
                            {currRes?.error || testResults?.runtimeError?.message}
                          </p>
                          {(currRes?.stack || testResults?.runtimeError?.stack) && (
                            <pre className="p-2.5 rounded-lg bg-black/80 border border-amber-900/50 text-amber-300 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                              {currRes?.stack || testResults?.runtimeError?.stack}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* Test Case Status & Metadata Header */}
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                        <div className="flex items-center space-x-2">
                          {currRes ? (
                            currRes.passed ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-semibold flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Passed</span>
                              </span>
                            ) : currRes.status === 'Wrong Answer' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/50 font-semibold flex items-center space-x-1">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Logic Failure: Output Mismatch</span>
                              </span>
                            ) : currRes.status === 'Time Limit Exceeded' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 font-semibold flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-purple-400" />
                                <span>Time Limit Exceeded (3000ms)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/50 font-semibold flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                <span>{currRes.status || 'Failed'}</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[11px]">Pending execution</span>
                          )}
                          {(currCase?.isHidden || currRes?.isHidden) && (
                            <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-[10px]">
                              Hidden Evaluation Case
                            </span>
                          )}
                        </div>

                        {currRes?.executionTimeMs !== undefined && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {currRes.executionTimeMs} ms
                          </span>
                        )}
                      </div>

                      {/* Inputs & Outputs Grid */}
                      <div>
                        <div className="text-[11px] text-slate-500 mb-1 font-semibold">Input:</div>
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 select-text overflow-x-auto">
                          {currCase?.input}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1 font-semibold">Expected Output:</div>
                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400 font-mono select-text overflow-x-auto">
                            {currCase?.expectedOutput}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 mb-1 font-semibold">Actual Output:</div>
                          <div className={`p-2.5 rounded-lg bg-slate-900/80 border font-mono select-text overflow-x-auto ${
                            currRes
                              ? (currRes.passed ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' : 'border-rose-500/40 text-rose-300 bg-rose-950/20')
                              : 'border-slate-800 text-slate-400'
                          }`}>
                            {currRes ? currRes.actual : 'Click "Run" to test'}
                          </div>
                        </div>
                      </div>

                      {/* Logic failure explanation */}
                      {currRes && !currRes.passed && currRes.status === 'Wrong Answer' && (
                        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300 text-[11px] space-y-1">
                          <span className="font-semibold text-rose-200">Logic Failure: </span>
                          <span>The returned value does not match the expected result for this test case. Inspect the difference between Expected and Actual above.</span>
                        </div>
                      )}

                      {/* Per-test case stdout logs */}
                      {currRes?.stdout && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Terminal className="w-3 h-3 text-cyan-400" />
                            <span>Case Console Output:</span>
                          </div>
                          <pre className="p-2 rounded-lg bg-black/70 border border-slate-800 text-cyan-300 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                            {currRes.stdout}
                          </pre>
                        </div>
                      )}
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
                    {aiReview.strengths.map((s: any, i: number) => (
                      <li key={i}>{typeof s === 'object' && s !== null ? (s.text || s.description || JSON.stringify(s)) : String(s)}</li>
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
                    {aiReview.improvements.map((imp: any, i: number) => (
                      <li key={i}>{typeof imp === 'object' && imp !== null ? (imp.text || imp.description || JSON.stringify(imp)) : String(imp)}</li>
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
                    {aiReview.edgeCasesMissed.map((ec: any, i: number) => (
                      <li key={i}>{typeof ec === 'object' && ec !== null ? (ec.case || ec.text || JSON.stringify(ec)) : String(ec)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Code Snippet */}
              {aiReview.suggestedOptimizedSnippet && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-indigo-300">Clean Reference Implementation:</div>
                  <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800">
                    {typeof aiReview.suggestedOptimizedSnippet === 'object' && aiReview.suggestedOptimizedSnippet !== null
                      ? (aiReview.suggestedOptimizedSnippet.code || JSON.stringify(aiReview.suggestedOptimizedSnippet, null, 2))
                      : String(aiReview.suggestedOptimizedSnippet)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOATING AI TUTOR CHAT DRAWER */}
        {isTutorOpen && (
          <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 w-[calc(100vw-1rem)] sm:w-96 max-w-sm h-[440px] max-h-[75vh] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
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
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 mr-3 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-line">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">
                      {renderMentorMarkdown(msg.text)}
                    </div>
                  )}
                </div>
              ))}
              {isTutorThinking && (
                <div className="p-2.5 rounded-xl bg-slate-800/90 text-slate-400 text-xs flex items-center space-x-2 mr-3 border border-slate-700/60">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>AI Mentor is analyzing your code and question...</span>
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

export interface PlaygroundViewProps {
  problems?: Problem[];
  problem?: Problem | null;
  currentUser: User | null;
  onBackToRoadmap: () => void;
  onSelectProblem?: (problem: Problem | null) => void;
  onSubmissionSuccess?: (sub: Submission) => void;
  onOpenAiGenerator?: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  problems = [],
  problem: initialProblem = null,
  currentUser,
  onBackToRoadmap,
  onSelectProblem,
  onSubmissionSuccess,
  onOpenAiGenerator
}) => {
  const [activeProblem, setActiveProblem] = useState<Problem | null>(initialProblem);

  // Synchronize when initialProblem prop changes externally (e.g. from Roadmap selection)
  useEffect(() => {
    setActiveProblem(initialProblem);
  }, [initialProblem]);

  const handleSelectProblem = (p: Problem) => {
    setActiveProblem(p);
    if (onSelectProblem) {
      onSelectProblem(p);
    }
  };

  const handleBackToSheet = () => {
    setActiveProblem(null);
    if (onSelectProblem) {
      onSelectProblem(null);
    }
  };

  if (!activeProblem) {
    return (
      <PracticeSheetView
        problems={problems}
        onSelectProblem={handleSelectProblem}
        onOpenAiGenerator={onOpenAiGenerator}
      />
    );
  }

  return (
    <PlaygroundIde
      problem={activeProblem}
      currentUser={currentUser}
      onBackToSheet={handleBackToSheet}
      onBackToRoadmap={onBackToRoadmap}
      onSubmissionSuccess={onSubmissionSuccess}
    />
  );
};
