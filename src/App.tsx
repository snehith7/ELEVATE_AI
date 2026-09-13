import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoadmapView } from './components/RoadmapView';
import { PlaygroundView } from './components/PlaygroundView';
import { AnalyticsView } from './components/AnalyticsView';
import { CommunityView } from './components/CommunityView';
import { AdminView } from './components/AdminView';
import { AdminLoginPage } from './components/AdminLoginPage';
import { FacultyLoginPage } from './components/FacultyLoginPage';
import { FacultyView } from './components/FacultyView';
import { StudentLoginPage } from './components/StudentLoginPage';
import { ArcadeLandingPage } from './components/ArcadeLandingPage';
import { AiProblemModal } from './components/AiProblemModal';
import { DatabaseModal } from './components/DatabaseModal';
import { TrophyCabinetModal } from './components/TrophyCabinetModal';
import { BadgeUnlockCelebration } from './components/BadgeUnlockCelebration';
import { Problem, User, AnalyticsReport, DatabaseStatus, Submission, Badge } from './types';
import { ArrowLeft, GraduationCap, Menu, Flame, Sparkles, Code2, Trophy } from 'lucide-react';
import { testFirestoreConnection } from './firebase';
import { CodeElevateLogo } from './components/CodeElevateLogo';
import { safeFetchJson } from './utils/apiAuth';

export default function App() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Top-level Page: 'student' | 'faculty' | 'admin'
  const [currentPage, setCurrentPage] = useState<'student' | 'faculty' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
      if (window.location.hash === '#faculty' || window.location.pathname.startsWith('/faculty')) {
        return 'faculty';
      }
    }
    return 'student';
  });

  // Dedicated Student Auth Session
  const [studentSession, setStudentSession] = useState<{ user: any; token: string } | null>(() => {
    try {
      const stored = localStorage.getItem('codeelevate_student_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Dedicated Faculty Auth Session
  const [facultySession, setFacultySession] = useState<{ user: any; token: string } | null>(() => {
    try {
      const stored = localStorage.getItem('codeelevate_faculty_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Dedicated Admin Auth Session
  const [adminSession, setAdminSession] = useState<{ user: any; token: string } | null>(() => {
    try {
      const stored = localStorage.getItem('codeelevate_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Student Dashboard tabs
  const [currentTab, setCurrentTab] = useState<'roadmap' | 'playground' | 'analytics' | 'community'>('roadmap');

  // Active user for student/learning features
  const [currentUser, setCurrentUser] = useState<User | null>(
    studentSession?.user || facultySession?.user || null
  );
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsReport | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isTrophyCabinetOpen, setIsTrophyCabinetOpen] = useState(false);
  const [celebratingBadges, setCelebratingBadges] = useState<Badge[]>([]);

  // Synchronize URL hash with page state
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      } else if (window.location.hash === '#faculty') {
        setCurrentPage('faculty');
      } else {
        setCurrentPage('student');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setCurrentPage('admin');
  };

  const navigateToFaculty = () => {
    window.location.hash = 'faculty';
    setCurrentPage('faculty');
  };

  const navigateToStudent = () => {
    window.location.hash = 'student';
    setCurrentPage('student');
  };

  // Student Auth Handlers
  const handleStudentLoginSuccess = (user: any, token: string) => {
    const session = { user, token };
    setStudentSession(session);
    setCurrentUser(user);
    try {
      localStorage.setItem('codeelevate_student_session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to persist student session', e);
    }
    fetchProblems();
    fetchAnalytics(user.id);
  };

  const handleStudentLogout = () => {
    setStudentSession(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('codeelevate_student_session');
    } catch (e) {
      console.error('Failed to clear student session', e);
    }
  };

  // Faculty Auth Handlers
  const handleFacultyLoginSuccess = (user: any, token: string) => {
    const session = { user, token };
    setFacultySession(session);
    try {
      localStorage.setItem('codeelevate_faculty_session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to persist faculty session', e);
    }
  };

  const handleFacultyLogout = () => {
    setFacultySession(null);
    try {
      localStorage.removeItem('codeelevate_faculty_session');
    } catch (e) {
      console.error('Failed to clear faculty session', e);
    }
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (user: any, token: string) => {
    const session = { user, token };
    setAdminSession(session);
    try {
      localStorage.setItem('codeelevate_admin_session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to persist admin session', e);
    }
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    try {
      localStorage.removeItem('codeelevate_admin_session');
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
  };

  // Fetch student user profile if session exists
  const fetchUserProfile = async () => {
    const token = studentSession?.token || facultySession?.token || currentUser?.id;
    if (!token) return;
    try {
      const result = await safeFetchJson('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (result.ok && result.data) {
        const user = result.data;
        setCurrentUser(user);
        if (studentSession) {
          const updated = { ...studentSession, user };
          setStudentSession(updated);
          localStorage.setItem('codeelevate_student_session', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  // Fetch problems
  const fetchProblems = async () => {
    try {
      const token = studentSession?.token || facultySession?.token || currentUser?.id;
      const result = await safeFetchJson('/api/problems', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (result.ok && result.data) {
        const json = result.data;
        const list: Problem[] = json.problems || json;
        setProblems(list);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async (userId?: string) => {
    const uid = userId || currentUser?.id || studentSession?.user?.id;
    if (!uid) return;
    try {
      const result = await safeFetchJson('/api/analytics', {
        headers: {
          'x-user-id': uid
        }
      });
      if (result.ok && result.data) {
        const report: AnalyticsReport = result.data;
        setAnalytics(report);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  // Fetch database status
  const fetchDbStatus = async () => {
    try {
      const result = await safeFetchJson('/api/database/status');
      if (result.ok && result.data) {
        const stat: DatabaseStatus = result.data;
        setDbStatus(stat);
      }
    } catch (err) {
      console.error('Failed to fetch db status:', err);
    }
  };

  // Fetch badges and achievement progression
  const fetchBadges = async () => {
    try {
      const token = studentSession?.token || facultySession?.token || currentUser?.id;
      const result = await safeFetchJson('/api/badges', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (result.ok && result.data) {
        const data = result.data;
        const badgeList: Badge[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.badges)
            ? data.badges
            : [];
        setBadges(badgeList);
      }
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    }
  };

  // Claim daily streak reward and check for streak achievements
  const handleClaimStreak = async () => {
    try {
      const token = studentSession?.token || facultySession?.token || currentUser?.id;
      const result = await safeFetchJson('/api/badges/claim-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (result.ok && result.data) {
        const data = result.data;
        if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
          setCelebratingBadges(data.newlyUnlockedBadges);
        }
        await Promise.all([fetchUserProfile(), fetchBadges(), fetchAnalytics()]);
      }
    } catch (err) {
      console.error('Failed to claim streak:', err);
    }
  };

  useEffect(() => {
    testFirestoreConnection().catch(console.warn);
    if (studentSession) {
      fetchUserProfile();
      fetchAnalytics(studentSession.user.id);
    } else if (facultySession) {
      fetchUserProfile();
      fetchAnalytics(facultySession.user.id);
    }
    fetchProblems();
    fetchDbStatus();
    fetchBadges();
  }, [studentSession?.token, facultySession?.token]);

  // When a problem is selected to practice
  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCurrentTab('playground');
  };

  // When AI generates a problem
  const handleProblemGenerated = (newProblem: Problem) => {
    setProblems(prev => [newProblem, ...prev]);
    setSelectedProblem(newProblem);
    setCurrentTab('playground');
  };

  // When a submission succeeds
  const handleSubmissionSuccess = (submission: Submission, newlyUnlockedBadges?: Badge[]) => {
    // 1. Immediately update problem state so PracticeSheetView and lists reflect 'solved'
    setProblems(prev =>
      prev.map(p =>
        p.id === submission.problemId || p.slug === submission.problemId
          ? { ...p, solvedByCurrentUser: true }
          : p
      )
    );

    // 2. Update selectedProblem if active
    setSelectedProblem(prev =>
      prev && (prev.id === submission.problemId || prev.slug === submission.problemId)
        ? { ...prev, solvedByCurrentUser: true }
        : prev
    );

    // 3. Trigger badge unlock celebration modal if new achievements were earned!
    if (newlyUnlockedBadges && newlyUnlockedBadges.length > 0) {
      setCelebratingBadges(newlyUnlockedBadges);
    }

    // 4. Immediately update user stats optimistically so counters and progress immediately update
    setCurrentUser(prev => {
      if (!prev) return prev;
      const existing = prev.solvedProblems || [];
      const alreadySolved = existing.includes(submission.problemId);
      const newSolvedList = alreadySolved ? existing : [...existing, submission.problemId];
      return {
        ...prev,
        solvedProblems: newSolvedList,
        totalSolved: alreadySolved ? (prev.totalSolved ?? 1) : (prev.totalSolved ?? 0) + 1
      };
    });

    // 5. Trigger background refetches to guarantee backend persistence & accurate analytics & badges
    fetchProblems();
    fetchUserProfile();
    fetchAnalytics();
    fetchBadges();
  };

  // When user switches navigation tab via sidebar
  const handleTabChange = (tab: 'roadmap' | 'playground' | 'analytics' | 'community') => {
    if (tab === 'playground') {
      setSelectedProblem(null); // Clear selected problem so Playground opens in Practice Sheet view
    }
    setCurrentTab(tab);
  };

  // -------------------------------------------------------------
  // 1. DEDICATED ROOT ADMIN ROUTE (#admin)
  // -------------------------------------------------------------
  if (currentPage === 'admin') {
    if (!adminSession) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onGoToStudentLogin={navigateToStudent}
          onGoToFacultyLogin={navigateToFaculty}
        />
      );
    }

    return (
      <AdminView
        adminUser={adminSession.user}
        onLogout={handleAdminLogout}
        onBackToStudent={navigateToStudent}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        dbStatus={dbStatus}
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
      />
    );
  }

  // -------------------------------------------------------------
  // 2. DEDICATED FACULTY PORTAL ROUTE (#faculty)
  // -------------------------------------------------------------
  if (currentPage === 'faculty') {
    if (!facultySession) {
      return (
        <FacultyLoginPage
          onLoginSuccess={handleFacultyLoginSuccess}
          onGoToStudentLogin={navigateToStudent}
          onGoToAdminLogin={navigateToAdmin}
        />
      );
    }

    return (
      <FacultyView
        facultyUser={facultySession.user}
        onLogout={handleFacultyLogout}
        onSwitchToStudentView={() => {
          setCurrentUser(facultySession.user);
          navigateToStudent();
        }}
        onSelectProblemForSolving={(problem) => {
          setCurrentUser(facultySession.user);
          setSelectedProblem(problem);
          setCurrentTab('playground');
          navigateToStudent();
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // 3. DEDICATED STUDENT ACADEMY ROUTE (#student or default)
  // -------------------------------------------------------------
  const activeSession = studentSession || facultySession;

  // If no active session, show the gamified Arcade Academy student landing page
  if (!activeSession) {
    return (
      <ArcadeLandingPage
        onLoginSuccess={handleStudentLoginSuccess}
        onGoToFacultyLogin={navigateToFaculty}
        onGoToAdminLogin={navigateToAdmin}
      />
    );
  }

  // Authenticated Student Academy Dashboard
  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-row selection:bg-[#FF5A43]/30 selection:text-white">
      {/* Fixed Left Vertical Sidebar (Hidden on mobile, slide-in drawer supported) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        currentUser={currentUser}
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenAiGenerate={() => setIsAiModalOpen(true)}
        onOpenTrophyCabinet={() => setIsTrophyCabinetOpen(true)}
        badges={badges}
        onLogout={studentSession ? handleStudentLogout : handleFacultyLogout}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area to the right of sidebar */}
      <div className="flex-1 w-full min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Top Header with Hamburger Navigation Menu */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#08080c] border-b border-[#1c1c28] sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="mobile-menu-hamburger-btn"
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
              onClick={() => setIsTrophyCabinetOpen(true)}
              className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:text-white transition-colors cursor-pointer"
              title="View Trophy Cabinet"
              aria-label="Trophy Cabinet"
            >
              <Trophy className="w-4 h-4" />
            </button>
            {currentUser && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF5A43]/10 border border-[#FF5A43]/25 text-[#FF8570] text-xs font-semibold"
                title="Active Streak"
              >
                <Flame className="w-3.5 h-3.5 fill-[#FF5A43] text-[#FF5A43]" />
                <span>{currentUser.streakDays ?? 0}d</span>
              </div>
            )}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="p-1.5 rounded-lg bg-[#FF5A43]/20 border border-[#FF5A43]/30 text-[#FF8570] hover:text-white transition-colors cursor-pointer"
              title="Generate Practice Challenge with AI"
              aria-label="Generate AI Challenge"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Faculty Mode Banner if faculty is previewing student features */}
        {!studentSession && facultySession && (
          <div className="bg-cyan-950/80 border-b border-cyan-800/50 px-6 py-2.5 text-xs flex items-center justify-between text-cyan-200 shrink-0">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>
                Faculty Preview Mode: Logged in as <strong>{facultySession.user.username}</strong> ({facultySession.user.batch || 'Batch 2026-A'})
              </span>
            </div>
            <button
              onClick={navigateToFaculty}
              className="flex items-center space-x-1 font-semibold px-2.5 py-1 rounded bg-cyan-800 hover:bg-cyan-700 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Faculty Dashboard</span>
            </button>
          </div>
        )}

        {/* Main Student Learning Views */}
        <main className="flex-1 min-w-0">
          {currentTab === 'roadmap' && (
            <RoadmapView
              problems={problems}
              onSelectProblem={handleSelectProblem}
              onOpenAiGenerator={() => setIsAiModalOpen(true)}
            />
          )}

          {currentTab === 'playground' && (
            <PlaygroundView
              problems={problems}
              problem={selectedProblem}
              currentUser={currentUser}
              onBackToRoadmap={() => setCurrentTab('roadmap')}
              onSelectProblem={setSelectedProblem}
              onSubmissionSuccess={handleSubmissionSuccess}
              onOpenAiGenerator={() => setIsAiModalOpen(true)}
              onOpenTrophyCabinet={() => setIsTrophyCabinetOpen(true)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              currentUser={currentUser}
              onOpenAiGenerator={() => setIsAiModalOpen(true)}
              onSelectProblemById={(id) => {
                const p = problems.find(prob => prob.id === id);
                if (p) handleSelectProblem(p);
              }}
              allProblems={problems}
              badges={badges}
              onOpenTrophyCabinet={() => setIsTrophyCabinetOpen(true)}
            />
          )}

          {currentTab === 'community' && (
            <CommunityView currentUser={currentUser} />
          )}
        </main>

        {/* Student Dashboard Footer (omitted when actively solving problem in IDE) */}
        {!(currentTab === 'playground' && selectedProblem) && (
          <footer className="border-t border-[#1c1c28] bg-[#08080c]/90 py-6 text-xs text-slate-500 mt-auto shrink-0">
            <div className="px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-300">LrnKod</span>
                <span className="text-[#FF5A43]">•</span>
                <span>Adaptive Coding, Instant Diagnostics & Automated Evaluations</span>
              </div>

              <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
                <a
                  href="mailto:storynestteams@gmail.com?subject=[LrnKod%20Feedback]"
                  className="text-slate-400 hover:text-[#FF8570] transition-colors"
                >
                  Feedback & Bug Reports: storynestteams@gmail.com
                </a>
                <span>•</span>
                <span>Active Session: <strong className="text-slate-300">{currentUser?.username}</strong> ({currentUser?.role || 'student'})</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* AI Problem Generation Modal */}
      <AiProblemModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentUser={currentUser}
        onProblemGenerated={handleProblemGenerated}
        weakTopics={analytics?.weakTopics || []}
      />

      {/* Database Setup & Atlas Status Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        status={dbStatus}
        onRefresh={fetchDbStatus}
      />

      {/* Interactive Trophy Cabinet Modal */}
      <TrophyCabinetModal
        isOpen={isTrophyCabinetOpen}
        onClose={() => setIsTrophyCabinetOpen(false)}
        currentUser={currentUser}
        badges={badges}
        onClaimDailyStreak={handleClaimStreak}
      />

      {/* Badge Unlock Celebration Dialog & Sound/Particle Triggers */}
      {celebratingBadges.length > 0 && (
        <BadgeUnlockCelebration
          unlockedBadges={celebratingBadges}
          onClose={() => setCelebratingBadges([])}
          onOpenTrophyCabinet={() => {
            setCelebratingBadges([]);
            setIsTrophyCabinetOpen(true);
          }}
        />
      )}
    </div>
  );
}
