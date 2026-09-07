import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RoadmapView } from './components/RoadmapView';
import { PlaygroundView } from './components/PlaygroundView';
import { AnalyticsView } from './components/AnalyticsView';
import { CommunityView } from './components/CommunityView';
import { AdminView } from './components/AdminView';
import { AiProblemModal } from './components/AiProblemModal';
import { DatabaseModal } from './components/DatabaseModal';
import { Problem, User, AnalyticsReport, DatabaseStatus, Submission } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'roadmap' | 'playground' | 'analytics' | 'community' | 'admin'>('roadmap');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsReport | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Fetch initial profile
  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  // Fetch problems
  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/problems');
      if (res.ok) {
        const list: Problem[] = await res.json();
        setProblems(list);
        if (!selectedProblem && list.length > 0) {
          setSelectedProblem(list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const report: AnalyticsReport = await res.json();
        setAnalytics(report);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  // Fetch database status
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const stat: DatabaseStatus = await res.json();
        setDbStatus(stat);
      }
    } catch (err) {
      console.error('Failed to fetch db status:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchProblems();
    fetchAnalytics();
    fetchDbStatus();
  }, []);

  // Switch demo user (student vs admin)
  const handleSwitchRole = async (role: 'student' | 'admin') => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (role === 'admin') {
          setCurrentTab('admin');
        }
        fetchProblems();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  // When a user selects a problem to practice
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
  const handleSubmissionSuccess = (submission: Submission) => {
    fetchAnalytics();
    fetchProblems();
    fetchUserProfile();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenAiGenerate={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'roadmap' && (
          <RoadmapView
            problems={problems}
            onSelectProblem={handleSelectProblem}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
          />
        )}

        {currentTab === 'playground' && (
          selectedProblem ? (
            <PlaygroundView
              problem={selectedProblem}
              currentUser={currentUser}
              onBackToRoadmap={() => setCurrentTab('roadmap')}
              onSubmissionSuccess={handleSubmissionSuccess}
            />
          ) : (
            <div className="flex items-center justify-center h-[70vh] text-slate-400 text-sm">
              Please select a problem from the roadmap to begin practice.
            </div>
          )
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
          />
        )}

        {currentTab === 'community' && (
          <CommunityView currentUser={currentUser} />
        )}

        {currentTab === 'admin' && (
          <AdminView
            onOpenDbModal={() => setIsDbModalOpen(true)}
            dbStatus={dbStatus}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
          />
        )}
      </main>

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
    </div>
  );
}
