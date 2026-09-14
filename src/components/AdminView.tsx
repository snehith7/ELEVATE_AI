import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/apiAuth';
import {
  ShieldCheck,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  Trash2,
  UserPlus,
  Database,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Code2,
  Check,
  BookOpen,
  Layers,
  FileCode,
  Tag,
  CheckSquare,
  KeyRound,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Compass
} from 'lucide-react';
import { AdminOverview, Submission, DatabaseStatus, AdminStudentMetric, Problem, Difficulty } from '../types';
import { AddUserModal } from './AddUserModal';
import { DeleteUserModal } from './DeleteUserModal';
import { AddProblemModal } from './AddProblemModal';
import { DeleteProblemModal } from './DeleteProblemModal';
import { ChangeUserPasswordModal } from './ChangeUserPasswordModal';
import { AdminChangePasswordModal } from './AdminChangePasswordModal';
import { CodeElevateLogo } from './CodeElevateLogo';

interface AdminViewProps {
  adminUser?: any;
  onLogout: () => void;
  onBackToStudent: () => void;
  onOpenDbModal: () => void;
  dbStatus: DatabaseStatus | null;
  onOpenAiGenerator: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  adminUser,
  onLogout,
  onBackToStudent,
  onOpenDbModal,
  dbStatus,
  onOpenAiGenerator
}) => {
  // Admin Navigation: 'students' vs 'problems'
  const [activeAdminTab, setActiveAdminTab] = useState<'students' | 'problems'>('students');

  // Overview Data (Students & Metrics)
  const [data, setData] = useState<AdminOverview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty' | 'admin'>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentDetails, setStudentDetails] = useState<{ user: any; submissions: Submission[] } | null>(null);

  // Curriculum Problems Data
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemSearch, setProblemSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedProblemPreview, setSelectedProblemPreview] = useState<Problem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminStudentMetric | null>(null);
  const [userToChangePassword, setUserToChangePassword] = useState<AdminStudentMetric | null>(null);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, problemsRes] = await Promise.all([
        fetch('/api/admin/overview', { headers: getAuthHeaders('admin') }),
        fetch('/api/problems')
      ]);

      if (overviewRes.ok) {
        const json = await overviewRes.json();
        setData(json);
      }
      if (problemsRes.ok) {
        const probList = await problemsRes.json();
        setProblems(probList);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleInspectStudent = async (student: any) => {
    setSelectedStudent(student);
    try {
      const res = await fetch(`/api/admin/student/${student.id}`, {
        headers: getAuthHeaders('admin')
      });
      const json = await res.json();
      setStudentDetails(json);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    }
  };

  const handleUserAdded = (newUser: any) => {
    showToast(`User '${newUser.username}' was successfully created in the database.`);
    fetchOverview();
  };

  const handleUserDeleted = (studentId: string) => {
    showToast(`User and associated records were successfully removed.`);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
      setStudentDetails(null);
    }
    fetchOverview();
  };

  const handleProblemAdded = (newProblem: any) => {
    showToast(`Problem '${newProblem.title}' successfully added to curriculum.`);
    fetchOverview();
  };

  const handleProblemDeleted = (problemId: string) => {
    showToast(`Problem successfully deleted from curriculum.`);
    if (selectedProblemPreview?.id === problemId) {
      setSelectedProblemPreview(null);
    }
    fetchOverview();
  };

  // Filtered Students
  const filteredStudents = data?.students.filter(s => {
    const matchesSearch =
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.batch && s.batch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.skillLevel?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : s.role === roleFilter;
    const matchesBatch = batchFilter === 'all' ? true : (s.batch || 'Batch 2026-A') === batchFilter;
    return matchesSearch && matchesRole && matchesBatch;
  }) || [];

  // Distinct batches available
  const availableBatches = Array.from(new Set((data?.students || []).map(s => s.batch || 'Batch 2026-A').filter(Boolean)));

  // Distinct categories available in problems
  const availableCategories = Array.from(new Set(problems.map(p => p.category).filter(Boolean)));

  // Filtered Problems based on category, difficulty, language, and search query
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

  const renderAdminSidebarContent = (isMobileView = false) => (
    <>
      {/* TOP SECTION: Brand, Admin Badge, Return to Student Academy, AI Generator, & Navigation Links */}
      <div className="flex flex-col space-y-5">
        {/* Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveAdminTab('students');
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
            ADMIN CONSOLE
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            Governance
          </span>
        </div>

        {/* Return to Student Academy */}
        <button
          onClick={() => {
            onBackToStudent();
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43]/20 via-[#FF5A43]/10 to-[#12121c] hover:from-[#FF5A43]/30 hover:via-[#FF5A43]/20 hover:to-[#1a1a28] text-[#FF8570] hover:text-white border border-[#FF5A43]/35 hover:border-[#FF5A43]/60 shadow-sm shadow-[#FF5A43]/10 transition-all cursor-pointer group"
          title="Return to Student Learning Dashboard"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#FF5A43] group-hover:rotate-45 transition-transform" />
            <span>Student Academy</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF8570] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* AI Challenge Generator */}
        <button
          onClick={() => {
            onOpenAiGenerator();
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#12121c] hover:bg-[#1a1a28] text-slate-300 hover:text-white border border-[#222234] hover:border-[#FF5A43]/40 transition-all cursor-pointer group"
          title="Generate coding challenges with Gemini AI"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5A43] group-hover:scale-110 transition-transform" />
            <span>AI Practice Generator</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1.5" aria-label="Admin Navigation">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Admin Governance
          </div>

          <button
            id="admin-nav-students"
            onClick={() => {
              setActiveAdminTab('students');
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
              activeAdminTab === 'students'
                ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#14141e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 shrink-0 ${activeAdminTab === 'students' ? 'text-white' : 'text-slate-400'}`} />
              <span className="leading-tight">User Directory & RBAC</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeAdminTab === 'students'
                ? 'bg-black/30 text-white'
                : 'bg-[#14141e] text-[#FF8570] border border-[#242436]'
            }`}>
              {filteredStudents.length}
            </span>
          </button>

          <button
            id="admin-nav-problems"
            onClick={() => {
              setActiveAdminTab('problems');
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
              activeAdminTab === 'problems'
                ? 'bg-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#14141e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={`w-4 h-4 shrink-0 ${activeAdminTab === 'problems' ? 'text-white' : 'text-slate-400'}`} />
              <span className="leading-tight">Curriculum Studio</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeAdminTab === 'problems'
                ? 'bg-black/30 text-white'
                : 'bg-[#14141e] text-[#FF8570] border border-[#242436]'
            }`}>
              {filteredProblems.length}
            </span>
          </button>
        </nav>

        {/* Quick Action in Sidebar */}
        {activeAdminTab === 'students' ? (
          <button
            onClick={() => {
              setIsAddUserOpen(true);
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#14141e] hover:bg-[#1c1c28] text-slate-200 hover:text-white border border-[#242436] hover:border-[#FF5A43]/40 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#FF5A43]" />
            <span>Add New User</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsAddProblemOpen(true);
              if (isMobileView) setIsMobileNavOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#14141e] hover:bg-[#1c1c28] text-slate-200 hover:text-white border border-[#242436] hover:border-[#FF5A43]/40 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#FF5A43]" />
            <span>Author New Problem</span>
          </button>
        )}
      </div>

      {/* BOTTOM SECTION: Database Status, Admin Profile, Password, Sign Out */}
      <div className="flex flex-col space-y-3 pt-4 border-t border-[#1e1e2d]">
        {/* Database Status Button */}
        <button
          id="admin-sidebar-db-status"
          onClick={() => {
            onOpenDbModal();
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          title="Firebase Firestore Connection Status"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#101018] hover:bg-[#181824] border border-[#222232] text-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#FF5A43] group-hover:scale-110 transition-transform" />
            <span className="text-slate-300 font-mono text-[11px]">
              {dbStatus?.type === 'firebase_firestore' || dbStatus?.isFirebase ? 'Firestore DB' : 'Database'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#FF8570] font-semibold">Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
        </button>

        {/* Admin Profile Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#101018] border border-[#20202e] text-xs">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A43] to-[#FF8570] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#FF5A43]/25 shrink-0">
            {(adminUser?.username || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-xs truncate">
              {adminUser?.username || 'Administrator'}
            </span>
            <span className="text-[10px] text-[#FF8570] capitalize font-semibold">
              {adminUser?.role || 'Administrator'}
            </span>
          </div>
        </div>

        {/* Change Admin Password */}
        <button
          id="admin-sidebar-password-btn"
          onClick={() => {
            setIsAdminPasswordModalOpen(true);
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101018] hover:bg-[#181824] text-slate-300 hover:text-white border border-[#222232] hover:border-[#FF5A43]/40 transition-colors cursor-pointer"
          title="Change administrator password"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#FF5A43]" />
          <span>Change Password</span>
        </button>

        {/* Sign Out Button */}
        <button
          id="admin-sidebar-logout-btn"
          onClick={() => {
            onLogout();
            if (isMobileView) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101018] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#222232] hover:border-rose-800/40 transition-colors cursor-pointer group"
          title="Sign out of administrative portal"
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
        id="admin-left-sidebar"
        className="hidden md:flex w-64 h-screen sticky top-0 flex-col justify-between p-4 bg-[#08080c] border-r border-[#1c1c28] shrink-0 z-30 select-none shadow-2xl shadow-black/60 overflow-y-auto"
      >
        {renderAdminSidebarContent(false)}
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
            {renderAdminSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area to the right of the sidebar */}
      <div className="flex-1 w-full min-w-0 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile Top Header with Hamburger Menu */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#08080c] border-b border-[#1c1c28] sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="admin-mobile-menu-btn"
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl bg-[#12121a] border border-[#252535] text-slate-300 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <CodeElevateLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDbModal}
              className="p-1.5 rounded-lg bg-[#12121a] border border-[#252535] text-slate-300 hover:text-white"
              title="Database Status"
            >
              <Database className="w-4 h-4 text-[#FF5A43]" />
            </button>
            <button
              onClick={onBackToStudent}
              className="p-1.5 rounded-lg bg-[#1a1318] border border-[#FF5A43]/30 text-[#FF8570] hover:text-white transition-colors cursor-pointer"
              title="Student Academy"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Banner */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#181013] via-[#0f0f16] to-[#0a0a0f] border border-[#2c1d22] shadow-2xl shadow-black/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FF8570] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#FF5A43]" />
              <span>Administrative Operations & Surveillance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Academy Governance & Curriculum Control Center</h1>
            <p className="text-xs text-slate-400">
              Manage student accounts and permissions, or author and organize curriculum coding challenges categorically by difficulty and language.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {activeAdminTab === 'students' ? (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43] via-[#FF6D57] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 transition-all cursor-pointer w-full sm:w-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add New User</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddProblemOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5A43] via-[#FF6D57] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Code2 className="w-4 h-4" />
                <span>+ Add New Problem</span>
              </button>
            )}

            <button
              onClick={fetchOverview}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#14141e] hover:bg-[#1a1a28] text-slate-300 border border-[#242434] transition-colors cursor-pointer w-full sm:w-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Enrolled</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{data?.metrics.totalStudents ?? '...'}</div>
            <div className="text-[11px] text-slate-500 mt-1">Learners in system</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Curriculum Problems</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{problems.length || data?.metrics.totalProblems || '...'}</div>
            <div className="text-[11px] text-slate-500 mt-1">Basic, Inter, Adv</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Submissions Logged</span>
              <Code2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{data?.metrics.totalSubmissions ?? '...'}</div>
            <div className="text-[11px] text-slate-500 mt-1">Automated test runs</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Overall Pass Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{data?.metrics.overallPassRate ?? '...'}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Across all users</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 sm:col-span-2 lg:col-span-4 xl:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Categories</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">{availableCategories.length || 6}</div>
            <div className="text-[11px] text-slate-500 mt-1">Curriculum topics</div>
          </div>
        </div>

        {/* Primary Admin Segmented Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border-b border-[#1f1f2e] pb-3">
          <button
            onClick={() => setActiveAdminTab('students')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'students'
                ? 'bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] text-white shadow-lg shadow-[#FF5A43]/25'
                : 'bg-[#101017] text-slate-400 hover:text-slate-200 border border-[#222232]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student & User Directory ({filteredStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('problems')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'problems'
                ? 'bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] text-white shadow-lg shadow-[#FF5A43]/25'
                : 'bg-[#101017] text-slate-400 hover:text-slate-200 border border-[#222232]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Problem Catalog ({filteredProblems.length})</span>
          </button>
        </div>

        {/* TAB 1: STUDENT & USER DIRECTORY */}
        {activeAdminTab === 'students' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Student & User Management Directory</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {filteredStudents.length} Records
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add, inspect individual progress, review code submissions, and remove user accounts.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  {/* Role filter */}
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as any)}
                    className="flex-1 sm:flex-none px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="admin">Administrators</option>
                  </select>

                  {/* Batch filter */}
                  <select
                    value={batchFilter}
                    onChange={e => setBatchFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="all">All Batches</option>
                    {availableBatches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Search input */}
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-full md:w-64">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, batch..."
                    className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                  />
                </div>

                {/* Add New User Button */}
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer w-full md:w-auto shadow-md shadow-purple-600/20 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New User</span>
                </button>
              </div>
            </div>

            {/* Responsive Students Table */}
            <div className="w-full overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">User Details</th>
                    <th className="py-3 px-3 whitespace-nowrap">Role</th>
                    <th className="py-3 px-3 whitespace-nowrap">Batch / Cohort</th>
                    <th className="py-3 px-3 whitespace-nowrap">Skill Tier</th>
                    <th className="py-3 px-3 whitespace-nowrap">Lang</th>
                    <th className="py-3 px-3 whitespace-nowrap">Solved</th>
                    <th className="py-3 px-3 whitespace-nowrap">Submissions</th>
                    <th className="py-3 px-3 whitespace-nowrap">Pass Rate</th>
                    <th className="py-3 px-3 whitespace-nowrap">Detected Struggles</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No matching user records found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const isRoot = student.id === 'usr_admin_root' || student.email === 'snehithsudulaguntla2108@gmail.com' || (student.role === 'admin' && student.username === 'root_admin');
                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                                {student.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{student.username}</div>
                                <div className="text-[11px] text-slate-500 font-normal">{student.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              student.role === 'admin'
                                ? 'bg-purple-950/60 text-purple-300 border-purple-700/50'
                                : student.role === 'faculty'
                                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50'
                                : 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50'
                            }`}>
                              {student.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-medium text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700 text-[11px]">
                              {student.batch || 'Batch 2026-A'}
                            </span>
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
                                  className="bg-purple-500 h-full rounded-full"
                                  style={{ width: `${student.passRate}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-slate-200">{student.passRate}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {student.struggleCategories?.map((cat: string, i: number) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Change Password button */}
                              <button
                                onClick={() => setUserToChangePassword(student)}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors text-xs font-semibold cursor-pointer"
                                title="Change or reset user password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Password</span>
                              </button>

                              {/* Inspect student button */}
                              <button
                                onClick={() => handleInspectStudent(student)}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors text-xs font-semibold cursor-pointer"
                                title="Inspect submissions and performance"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Inspect</span>
                              </button>

                              {/* Delete student button */}
                              <button
                                onClick={() => setUserToDelete(student)}
                                disabled={isRoot}
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                  isRoot
                                    ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                }`}
                                title={isRoot ? 'System root account cannot be deleted' : 'Delete user account'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM & PROBLEM CATALOG (Categorical Filtering & CRUD) */}
        {activeAdminTab === 'problems' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Curriculum & Coding Problem Catalog</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-700/50">
                    {filteredProblems.length} Active Problems
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter challenges by category, difficulty level, and supported programming languages, or author new problems.
                </p>
              </div>

              {/* Categorical & Language Filters Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  {/* Category Dropdown */}
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Difficulty Dropdown */}
                  <select
                    value={difficultyFilter}
                    onChange={e => setDifficultyFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="basic">Basic Level</option>
                    <option value="intermediate">Intermediate Level</option>
                    <option value="advanced">Advanced Level</option>
                  </select>

                  {/* Language Dropdown */}
                  <select
                    value={languageFilter}
                    onChange={e => setLanguageFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                {/* Search input */}
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-full md:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={problemSearch}
                    onChange={e => setProblemSearch(e.target.value)}
                    placeholder="Search problem title, tags..."
                    className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                  />
                </div>

                {/* Add Problem Button */}
                <button
                  onClick={() => setIsAddProblemOpen(true)}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-md shadow-purple-600/20 w-full md:w-auto whitespace-nowrap"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>+ Add Problem</span>
                </button>
              </div>
            </div>

            {/* Responsive Problems Catalog Table */}
            <div className="w-full overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Problem</th>
                    <th className="py-3 px-3 whitespace-nowrap">Category</th>
                    <th className="py-3 px-3 whitespace-nowrap">Difficulty Level</th>
                    <th className="py-3 px-3 whitespace-nowrap">Languages Supported</th>
                    <th className="py-3 px-3 whitespace-nowrap">Test Cases</th>
                    <th className="py-3 px-3 whitespace-nowrap">Tags</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
                  {filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No problems match the current categorical or language filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map(prob => {
                      const langCount = prob.starterCode ? Object.keys(prob.starterCode).length : 0;
                      return (
                        <tr key={prob.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center shrink-0">
                                <Code2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{prob.title}</div>
                                <div className="text-[10px] text-slate-500 font-mono">slug: {prob.slug}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-950/40 text-purple-300 border border-purple-800/30">
                              {prob.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              prob.difficulty === 'basic'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : prob.difficulty === 'intermediate'
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}>
                              {prob.difficulty}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center space-x-1">
                              <span className="font-mono font-bold text-slate-200">{langCount}</span>
                              <span className="text-[10px] text-slate-500">languages</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-slate-300">
                            {prob.testCases?.length || 0} cases
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {prob.tags?.slice(0, 3).map((t, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  {t}
                                </span>
                              ))}
                              {(prob.tags?.length || 0) > 3 && (
                                <span className="text-[10px] text-slate-500">+{prob.tags.length - 3}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Preview problem */}
                              <button
                                onClick={() => setSelectedProblemPreview(prob)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors text-xs font-semibold cursor-pointer"
                                title="Inspect problem details and test cases"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Preview</span>
                              </button>

                              {/* Delete problem */}
                              <button
                                onClick={() => setProblemToDelete(prob)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="Delete problem from curriculum"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROBLEM PREVIEW MODAL */}
        {selectedProblemPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 to-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-base">{selectedProblemPreview.title}</h3>
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {selectedProblemPreview.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Category: {selectedProblemPreview.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProblemPreview(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">Problem Description</h4>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedProblemPreview.description}
                  </div>
                </div>

                {selectedProblemPreview.examples && selectedProblemPreview.examples.length > 0 && (
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">Examples</h4>
                    <div className="space-y-2">
                      {selectedProblemPreview.examples.map((ex, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 font-mono text-[11px] space-y-1">
                          <div><span className="text-slate-400">Input:</span> <span className="text-white">{ex.input}</span></div>
                          <div><span className="text-slate-400">Output:</span> <span className="text-emerald-300">{ex.output}</span></div>
                          {ex.explanation && <div className="text-slate-400 text-[10px] pt-1">Explanation: {ex.explanation}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProblemPreview.constraints && selectedProblemPreview.constraints.length > 0 && (
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">Constraints</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                      {selectedProblemPreview.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProblemPreview.starterCode && (
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">Starter Code Templates</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(selectedProblemPreview.starterCode).map(lang => (
                        <div key={lang} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center space-x-1.5 font-mono text-[11px]">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="capitalize text-slate-200">{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STUDENT DETAIL INSPECTION MODAL */}
        {selectedStudent && studentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 to-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                    {selectedStudent.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedStudent.username}</h3>
                    <p className="text-xs text-slate-400">{selectedStudent.email} • {selectedStudent.targetGoal}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentDetails(null);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <div className="text-[11px] text-slate-400">Total Solved</div>
                    <div className="text-lg font-bold text-emerald-400">{selectedStudent.totalSolved}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <div className="text-[11px] text-slate-400">Submissions</div>
                    <div className="text-lg font-bold text-white">{studentDetails.submissions.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <div className="text-[11px] text-slate-400">Pass Rate</div>
                    <div className="text-lg font-bold text-purple-400">{selectedStudent.passRate}%</div>
                  </div>
                </div>

                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] pt-2">
                  Submission History & AI Code Evaluations
                </h4>

                <div className="space-y-2.5">
                  {studentDetails.submissions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No submissions found for this student.</div>
                  ) : (
                    studentDetails.submissions.map(sub => (
                      <div key={sub.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className={`font-bold flex items-center space-x-1 ${sub.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {sub.status === 'accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span className="capitalize">{sub.status.replace('_', ' ')}</span>
                            </span>
                            <span className="font-semibold text-white">{sub.problemTitle}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                              {sub.language}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {sub.aiReview && (
                          <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1 text-slate-300">
                            <div className="font-semibold text-indigo-300">AI Feedback:</div>
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
          </div>
        )}

        {/* MODALS */}
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onUserAdded={handleUserAdded}
        />

        <DeleteUserModal
          isOpen={Boolean(userToDelete)}
          student={userToDelete}
          onClose={() => setUserToDelete(null)}
          onUserDeleted={handleUserDeleted}
        />

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

        {/* Change User Password Modal */}
        <ChangeUserPasswordModal
          isOpen={Boolean(userToChangePassword)}
          user={userToChangePassword}
          onClose={() => setUserToChangePassword(null)}
          onPasswordChanged={(msg) => {
            showToast(msg);
            fetchOverview();
          }}
        />

        {/* Admin Self Password Change Modal */}
        <AdminChangePasswordModal
          isOpen={isAdminPasswordModalOpen}
          onClose={() => setIsAdminPasswordModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      </main>
    </div>
  </div>
);
};
