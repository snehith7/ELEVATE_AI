import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/apiAuth';
import {
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  Trash2,
  Database,
  RefreshCw,
  LogOut,
  Code2,
  Check,
  BookOpen,
  Layers,
  FileCode,
  Tag,
  CheckSquare,
  KeyRound,
  BarChart3,
  Terminal,
  MessageSquare,
  Compass,
  ArrowRight,
  Plus,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Problem, Submission, Difficulty, SupportedLanguage } from '../types';
import { AddProblemModal } from './AddProblemModal';
import { DeleteProblemModal } from './DeleteProblemModal';
import { UserChangePasswordModal } from './UserChangePasswordModal';
import { CodeElevateLogo } from './CodeElevateLogo';

interface FacultyOverviewStudent {
  id: string;
  username: string;
  email: string;
  role: string;
  batch: string;
  skillLevel: string;
  preferredLanguage: string;
  totalSubmissions: number;
  totalSolved: number;
  passRate: number;
  struggleCategories: string[];
}

interface FacultyOverviewData {
  faculty: {
    id: string;
    username: string;
    email: string;
    role: string;
    batch: string;
  };
  batchSummary: {
    batchName: string;
    totalStudents: number;
    totalSubmissions: number;
    totalAccepted: number;
    avgPassRate: number;
    topStruggles: { category: string; count: number }[];
  };
  students: FacultyOverviewStudent[];
}

interface FacultyViewProps {
  facultyUser: any;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
  onSelectProblemForSolving?: (problem: Problem) => void;
}

export const FacultyView: React.FC<FacultyViewProps> = ({
  facultyUser,
  onLogout,
  onSwitchToStudentView,
  onSelectProblemForSolving
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'problems'>('batch');
  const [data, setData] = useState<FacultyOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Curriculum State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemSearch, setProblemSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedProblemPreview, setSelectedProblemPreview] = useState<Problem | null>(null);

  // Student Inspection Modal
  const [selectedStudent, setSelectedStudent] = useState<FacultyOverviewStudent | null>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Mobile navigation drawer
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFacultyOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/faculty/overview', {
        headers: getAuthHeaders('faculty')
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch faculty overview', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/problems');
      if (res.ok) {
        const json = await res.json();
        setProblems(json.problems || []);
      }
    } catch (err) {
      console.error('Failed to load problems', err);
    }
  };

  useEffect(() => {
    fetchFacultyOverview();
    fetchProblems();
  }, []);

  const handleInspectStudent = async (student: FacultyOverviewStudent) => {
    setSelectedStudent(student);
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/admin/student/${student.id}`, {
        headers: getAuthHeaders('faculty')
      });
      if (res.ok) {
        const json = await res.json();
        setStudentSubmissions(json.submissions || []);
      }
    } catch (err) {
      console.error('Failed to fetch student details', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleProblemAdded = (newProb: Problem) => {
    setProblems(prev => [newProb, ...prev]);
    showToast(`Curriculum problem "${newProb.title}" published successfully.`);
  };

  const handleProblemDeleted = (problemId: string) => {
    setProblems(prev => prev.filter(p => p.id !== problemId));
    if (selectedProblemPreview?.id === problemId) {
      setSelectedProblemPreview(null);
    }
    showToast('Problem removed from curriculum.');
  };

  const filteredStudents = (data?.students || []).filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.username.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.skillLevel?.toLowerCase().includes(q) ||
      s.preferredLanguage?.toLowerCase().includes(q)
    );
  });

  const availableCategories = Array.from(new Set(problems.map(p => p.category).filter(Boolean)));

  const filteredProblems = problems.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(problemSearch.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' ? true : p.difficulty === difficultyFilter;
    const matchesLanguage =
      languageFilter === 'all'
        ? true
        : Boolean(p.starterCode && (p.starterCode as any)[languageFilter]);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesLanguage;
  });

  const batchName = data?.batchSummary?.batchName || facultyUser?.batch || 'Batch 2026-A';

  const renderFacultySidebarContent = (isMobileView = false) => (
    <>
      {/* TOP SECTION: Logo, Portal Badge, Student Academy Switch, & Navigation Links */}
      <div className="flex flex-col space-y-5">
        {/* Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveTab('batch');
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className="flex items-center text-left group cursor-pointer focus:outline-none px-1 transition-transform hover:scale-[1.02]"
          >
            <CodeElevateLogo size="md" showText={true} showSubtitle={true} />
          </button>

          {isMobileView && (
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181824] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Portal Identification Badge */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30">
            FACULTY PORTAL
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-semibold truncate max-w-[120px]" title={batchName}>
            {batchName}
          </span>
        </div>

        {/* Quick Action: Switch to Student Academy */}
        <button
          onClick={() => {
            onSwitchToStudentView();
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43]/20 via-[#FF5A43]/10 to-[#12121c] hover:from-[#FF5A43]/30 hover:via-[#FF5A43]/20 hover:to-[#1a1a28] text-[#FF8570] hover:text-white border border-[#FF5A43]/35 hover:border-[#FF5A43]/60 shadow-sm shadow-[#FF5A43]/10 transition-all cursor-pointer group"
          title="Experience Student Learning, Playground & Community Features"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#FF5A43] group-hover:rotate-45 transition-transform" />
            <span>Student Academy</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF8570] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1.5" aria-label="Faculty Navigation">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Faculty Workspace
          </div>

          <button
            id="faculty-nav-batch"
            onClick={() => {
              setActiveTab('batch');
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
              activeTab === 'batch'
                ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#14141e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'batch' ? 'text-white' : 'text-slate-400'}`} />
              <span className="leading-tight">Batch Surveillance</span>
            </div>
            {activeTab === 'batch' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            )}
          </button>

          <button
            id="faculty-nav-problems"
            onClick={() => {
              setActiveTab('problems');
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
              activeTab === 'problems'
                ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#14141e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'problems' ? 'text-white' : 'text-slate-400'}`} />
              <span className="leading-tight">Curriculum Studio</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'problems'
                ? 'bg-black/30 text-white'
                : 'bg-[#14141e] text-[#FF8570] border border-[#242436]'
            }`}>
              {problems.length}
            </span>
          </button>
        </nav>

        {/* Quick Authoring Trigger in Sidebar */}
        <button
          onClick={() => {
            setIsAddProblemOpen(true);
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#14141e] hover:bg-[#1c1c28] text-slate-200 hover:text-white border border-[#242436] hover:border-[#FF5A43]/40 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#FF5A43]" />
          <span>Author New Problem</span>
        </button>
      </div>

      {/* BOTTOM SECTION: Batch Stats, Profile, Password & Sign Out */}
      <div className="flex flex-col space-y-3 pt-4 border-t border-[#1e1e2d]">
        {/* Batch Quick Stats Pill */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-[#101018] border border-[#20202e] text-center">
            <span className="text-[10px] text-slate-400 block">Learners</span>
            <span className="font-mono text-xs font-bold text-white mt-0.5 block">{data?.batchSummary?.totalStudents ?? 0}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#101018] border border-[#20202e] text-center">
            <span className="text-[10px] text-slate-400 block">Pass Rate</span>
            <span className="font-mono text-xs font-bold text-emerald-400 mt-0.5 block">{data?.batchSummary?.avgPassRate ?? 0}%</span>
          </div>
        </div>

        {/* Faculty User Profile Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#101018] border border-[#20202e] text-xs">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A43] to-[#FF8570] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#FF5A43]/25 shrink-0">
            {(facultyUser?.username || 'F').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-xs truncate">
              {facultyUser?.username || 'Faculty Mentor'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-[#FF8570] font-semibold">
                Faculty
              </span>
              <span className="text-[9px] text-slate-500">•</span>
              <span className="text-[10px] text-slate-400 truncate">
                {batchName}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <button
          id="faculty-sidebar-password-btn"
          onClick={() => {
            setIsPasswordModalOpen(true);
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101018] hover:bg-[#181824] text-slate-300 hover:text-white border border-[#222232] hover:border-[#FF5A43]/40 transition-colors cursor-pointer"
          title="Change your account password"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#FF5A43]" />
          <span>Change Password</span>
        </button>

        {/* Sign Out Button */}
        <button
          id="faculty-sidebar-logout-btn"
          onClick={() => {
            onLogout();
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101018] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#222232] hover:border-rose-800/40 transition-colors cursor-pointer group"
          title="Sign out of faculty session"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-row selection:bg-[#FF5A43]/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-3.5 rounded-xl bg-[#14141e] border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl flex items-center space-x-2.5 backdrop-blur-md animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Vertical Sidebar (Hidden on mobile) */}
      <aside
        id="faculty-left-sidebar"
        className="hidden md:flex w-64 h-screen sticky top-0 flex-col justify-between p-4 bg-[#08080c] border-r border-[#1c1c28] shrink-0 z-30 select-none shadow-2xl shadow-black/60 overflow-y-auto"
      >
        {renderFacultySidebarContent(false)}
      </aside>

      {/* Responsive Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#08080c] border-r border-[#202030] p-4 flex flex-col justify-between z-50 shadow-2xl overflow-y-auto">
            {renderFacultySidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area to the right of the sidebar */}
      <div className="flex-1 w-full min-w-0 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile Top Header with Hamburger Menu */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#08080c] border-b border-[#1c1c28] sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="faculty-mobile-menu-btn"
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl bg-[#12121a] border border-[#252535] text-slate-300 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <CodeElevateLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5A43]/15 text-[#FF8570] border border-[#FF5A43]/30 tracking-wider">
              FACULTY
            </span>
            <button
              onClick={onSwitchToStudentView}
              className="p-1.5 rounded-lg bg-[#1a1318] border border-[#FF5A43]/30 text-[#FF8570] hover:text-white transition-colors cursor-pointer"
              title="Student Features"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Container with p-4 md:p-8 */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Navigation Tabs Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#1f1f2e] pb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'batch'
                    ? 'bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] text-white shadow-lg shadow-[#FF5A43]/25'
                    : 'bg-[#101017] text-slate-400 hover:text-slate-200 border border-[#222232]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Batch Performance Surveillance</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-[#FFD2CC] font-mono">
                  {batchName}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('problems')}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'problems'
                    ? 'bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] text-white shadow-lg shadow-[#FF5A43]/25'
                    : 'bg-[#101017] text-slate-400 hover:text-slate-200 border border-[#222232]'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Curriculum & Problem Authoring</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-[#FFD2CC] font-mono">
                  {problems.length}
                </span>
              </button>
            </div>

            {activeTab === 'problems' && (
              <button
                onClick={() => setIsAddProblemOpen(true)}
                className="flex items-center justify-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF5A43] hover:bg-[#F03E23] text-white shadow-lg shadow-[#FF5A43]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Author New Problem</span>
              </button>
            )}
          </div>

        {/* TAB 1: BATCH PERFORMANCE SURVEILLANCE */}
        {activeTab === 'batch' && (
          <div className="space-y-6">
            {/* Batch Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Batch Learners</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {data?.batchSummary?.totalStudents ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Assigned to {batchName}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Batch Submissions</span>
                  <Code2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {data?.batchSummary?.totalSubmissions ?? 0}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                  {data?.batchSummary?.totalAccepted ?? 0} Accepted Solutions
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Batch Pass Rate</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {data?.batchSummary?.avgPassRate ?? 0}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${data?.batchSummary?.avgPassRate ?? 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Top Batch Struggles</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(data?.batchSummary?.topStruggles || []).length === 0 ? (
                    <span className="text-xs text-slate-500">No recurring bottlenecks detected yet</span>
                  ) : (
                    data?.batchSummary?.topStruggles.map((st, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium"
                      >
                        {st.category} ({st.count})
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Batch Student Cohort Directory</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Individual completion rates, language preferences, and AI evaluations for {batchName}
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search student or skill..."
                    className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap">Student</th>
                      <th className="py-3 px-3 whitespace-nowrap">Skill Tier</th>
                      <th className="py-3 px-3 whitespace-nowrap">Preferred Lang</th>
                      <th className="py-3 px-3 whitespace-nowrap">Solved</th>
                      <th className="py-3 px-3 whitespace-nowrap">Submissions</th>
                      <th className="py-3 px-3 whitespace-nowrap">Pass Rate</th>
                      <th className="py-3 px-3 whitespace-nowrap">Identified Struggles</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No students found matching your filter in {batchName}.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 font-bold flex items-center justify-center text-xs">
                                {student.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{student.username}</div>
                                <div className="text-[11px] text-slate-500 font-normal">{student.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                              {student.skillLevel || 'Intermediate'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono capitalize text-slate-300">
                            {student.preferredLanguage || 'JavaScript'}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                            {student.totalSolved}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-slate-400">
                            {student.totalSubmissions}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-cyan-500 h-full rounded-full"
                                  style={{ width: `${student.passRate}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-slate-200">
                                {student.passRate}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {student.struggleCategories?.map((cat: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleInspectStudent(student)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/40 transition-colors text-xs font-semibold cursor-pointer"
                              title="Review code submissions and AI evaluations"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM & PROBLEM AUTHORING */}
        {activeTab === 'problems' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Curriculum Problem Management</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {filteredProblems.length} Problems
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Author coding challenges categorically across multiple languages with starter templates and test cases.
                </p>
              </div>

              {/* Author New Problem Button */}
              <button
                onClick={() => setIsAddProblemOpen(true)}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Author New Problem</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2.5 flex-wrap pt-2">
              {/* Category */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Difficulty */}
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Language */}
              <select
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>

              {/* Search */}
              <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={problemSearch}
                  onChange={e => setProblemSearch(e.target.value)}
                  placeholder="Search problem title, tag, or topic..."
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Problems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredProblems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No problems match the selected criteria.
                </div>
              ) : (
                filteredProblems.map(p => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-850/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`capitalize px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.difficulty === 'easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.difficulty === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {p.difficulty}
                        </span>
                        <span className="text-[11px] text-cyan-300 font-medium px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                          {p.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm leading-snug">{p.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {p.description}
                      </p>

                      {/* Language badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-3">
                        {p.starterCode && Object.keys(p.starterCode).map(lang => (
                          <span
                            key={lang}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono uppercase"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.testCases?.length || 0} Test Cases
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {/* Preview / Solve button */}
                        <button
                          onClick={() => {
                            if (onSelectProblemForSolving) {
                              onSelectProblemForSolving(p);
                            } else {
                              setSelectedProblemPreview(p);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Solve / Test
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => setProblemToDelete(p)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                          title="Delete problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Student Inspection Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#0e0e15] border border-[#242436] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1c1c28] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A43] to-[#FF8570] text-white font-bold flex items-center justify-center text-sm shadow-md shadow-[#FF5A43]/20">
                    {selectedStudent.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedStudent.username}</h3>
                    <p className="text-xs text-slate-400">{selectedStudent.email} • {batchName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-[#181824] hover:bg-[#202030] text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#12121c] border border-[#202030] text-center">
                  <div className="text-xs text-slate-400">Solved Problems</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{selectedStudent.totalSolved}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#12121c] border border-[#202030] text-center">
                  <div className="text-xs text-slate-400">Total Submissions</div>
                  <div className="text-lg font-bold text-slate-200 font-mono">{selectedStudent.totalSubmissions}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#12121c] border border-[#202030] text-center">
                  <div className="text-xs text-slate-400">Pass Rate</div>
                  <div className="text-lg font-bold text-[#FF8570] font-mono">{selectedStudent.passRate}%</div>
                </div>
              </div>

              {/* Submissions list */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Submission History & AI Code Evaluations
                </h4>

                {isLoadingSubmissions ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Loading submissions...</div>
                ) : studentSubmissions.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">No submissions recorded yet for this student.</div>
                ) : (
                  studentSubmissions.map(sub => (
                    <div key={sub.id} className="p-3 rounded-xl bg-[#12121c] border border-[#202030] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold flex items-center space-x-1 ${sub.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sub.status === 'accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="capitalize">{sub.status}</span>
                          </span>
                          <span className="font-semibold text-white">{sub.problemTitle}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#181824] text-slate-400 uppercase font-mono">
                            {sub.language}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {sub.aiReview && (
                        <div className="p-2.5 rounded-lg bg-[#FF5A43]/10 border border-[#FF5A43]/20 text-xs text-slate-300 space-y-1">
                          <div className="font-semibold text-[#FF8570]">AI Code Analysis:</div>
                          <p className="leading-relaxed">{sub.aiReview.summary}</p>
                          <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-400">
                            <span>Time: {sub.aiReview.timeComplexity}</span>
                            <span>Space: {sub.aiReview.spaceComplexity}</span>
                            <span>Score: {sub.aiReview.correctnessScore}/100</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <AddProblemModal
          isOpen={isAddProblemOpen}
          onClose={() => setIsAddProblemOpen(false)}
          onProblemAdded={handleProblemAdded}
        />

        <DeleteProblemModal
          isOpen={Boolean(problemToDelete)}
          problem={problemToDelete}
          onClose={() => setProblemToDelete(null)}
          onProblemDeleted={handleProblemDeleted}
        />

        <UserChangePasswordModal
          isOpen={isPasswordModalOpen}
          currentUser={facultyUser}
          user={facultyUser}
          authToken={facultyUser?.id}
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={(msg) => showToast(msg || 'Password updated successfully!')}
        />
      </main>
    </div>
  </div>
);
};
