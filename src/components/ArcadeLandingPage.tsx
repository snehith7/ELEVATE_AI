import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  Check,
  Copy,
  Bug,
  Lightbulb,
  MessageSquare,
  Code2,
  ArrowRight,
  Sparkles,
  Terminal,
  Compass,
  BarChart3,
  User,
  KeyRound,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CodeElevateLogo, CodeElevateIcon } from './CodeElevateLogo';
import { VerificationModal } from './VerificationModal';
import { SupportedLanguage, SkillLevel } from '../types';
import { safeFetchJson } from '../utils/apiAuth';

interface ArcadeLandingPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onGoToFacultyLogin: () => void;
  onGoToAdminLogin: () => void;
}

export const ArcadeLandingPage: React.FC<ArcadeLandingPageProps> = ({
  onLoginSuccess,
  onGoToFacultyLogin,
  onGoToAdminLogin
}) => {
  // Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authSkillLevel, setAuthSkillLevel] = useState<SkillLevel>('intermediate');
  const [authPreferredLanguage, setAuthPreferredLanguage] = useState<SupportedLanguage>('javascript');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email OTP Verification State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  // Contact / Feedback State
  const CONTACT_EMAIL = 'storynestteams@gmail.com';
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general'>('bug');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);
  const [feedbackErrorMsg, setFeedbackErrorMsg] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      setFeedbackErrorMsg('Please describe your issue or suggestion.');
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackErrorMsg(null);
    setFeedbackSuccessMsg(null);

    try {
      const result = await safeFetchJson('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          name: feedbackName.trim(),
          email: feedbackEmail.trim(),
          subject: feedbackSubject.trim(),
          message: feedbackMessage.trim()
        })
      });

      if (!result.ok) {
        throw new Error(result.error || 'Failed to submit feedback.');
      }

      setFeedbackSuccessMsg(
        'Thank you! Your feedback has been received. Our engineering team reviews all reports to improve the platform.'
      );
      setFeedbackSubject('');
      setFeedbackMessage('');
      setFeedbackName('');
      setFeedbackEmail('');
    } catch (err: any) {
      setFeedbackErrorMsg(err.message || 'Error submitting feedback. Please try sending directly via email.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Instant 1-Click Demo Login
  const handleFastTrackStudentLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await safeFetchJson('/api/auth/demo-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = result.data;
      if (result.ok && data?.token && data?.user) {
        onLoginSuccess(data.user, data.token);
        setIsAuthModalOpen(false);
      } else {
        throw new Error(result.error || data?.error || 'Demo access failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Demo login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Student Auth Form Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const result = await safeFetchJson('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail.trim().toLowerCase(),
            password: authPassword
          })
        });
        const data = result.data || {};

        if (!result.ok) {
          if (data.requiresVerification) {
            setPendingVerificationEmail(authEmail.trim().toLowerCase());
            setIsAuthModalOpen(false);
            setIsVerificationModalOpen(true);
            return;
          }
          throw new Error(result.error || data.error || 'Login failed. Check your credentials.');
        }

        onLoginSuccess(data.user, data.token);
        setIsAuthModalOpen(false);
      } else {
        // Register Mode
        const result = await safeFetchJson('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authUsername.trim() || authEmail.split('@')[0],
            email: authEmail.trim().toLowerCase(),
            password: authPassword,
            skillLevel: authSkillLevel,
            preferredLanguage: authPreferredLanguage,
            targetGoal: 'Master Algorithmic Interviews & Problem Solving'
          })
        });
        const data = result.data || {};

        if (!result.ok) {
          throw new Error(result.error || data.error || 'Registration failed.');
        }

        if (data.requiresVerification) {
          setPendingVerificationEmail(authEmail.trim().toLowerCase());
          setIsAuthModalOpen(false);
          setIsVerificationModalOpen(true);
        } else {
          onLoginSuccess(data.user, data.token);
          setIsAuthModalOpen(false);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const bugMailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    '[CodeElevate Bug Report]'
  )}&body=${encodeURIComponent(
    'Issue Description:\n\nSteps to Reproduce:\n1.\n2.\n3.\n\nExpected Behavior:\n\nActual Behavior:\n\nDevice / Browser:'
  )}`;

  const suggestionMailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    '[CodeElevate Suggestion]'
  )}&body=${encodeURIComponent(
    'My suggestion to make CodeElevate better:\n\nWhy this would be valuable:\n\nAdditional Ideas:'
  )}`;

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col selection:bg-[#FF5A43]/30 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#07070a]/90 backdrop-blur-md border-b border-[#1c1c28]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CodeElevateLogo size="md" showText={true} showSubtitle={false} />
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition-colors">
              Platform Features
            </a>
            <a href="#curriculum" className="hover:text-slate-200 transition-colors">
              Curriculum Tracks
            </a>
            <a href="#contact" className="text-[#FF8570] hover:text-[#FF5A43] font-medium transition-colors flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Report Issues & Suggestions</span>
            </a>
          </nav>

          <div className="flex items-center space-x-2.5">
            <button
              id="header-faculty-link"
              onClick={onGoToFacultyLogin}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#14141e] transition-colors"
            >
              Faculty
            </button>
            <button
              id="header-admin-link"
              onClick={onGoToAdminLogin}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#14141e] transition-colors"
            >
              Admin
            </button>
            <button
              id="header-enter-academy-btn"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#FF5A43] hover:bg-[#F04428] text-white transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Simple & Minimal Hero Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-b border-[#1c1c28]/70">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#12121c] border border-[#262638] text-[11px] font-mono text-[#FF8570]">
              <Sparkles className="w-3 h-3 text-[#FF5A43]" />
              <span>Adaptive Technical Interview Academy</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Structured Coding Practice for Technical Interviews.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Master data structures and algorithms with interactive roadmaps, instant in-browser code execution,
              and targeted performance diagnostics designed to elevate your problem-solving.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="hero-start-learning-btn"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                  setIsAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-[#FF5A43] hover:bg-[#F04428] text-white transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Enter Academy Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-instant-demo-btn"
                onClick={handleFastTrackStudentLogin}
                disabled={authLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold bg-[#12121c] hover:bg-[#181824] text-slate-200 border border-[#252538] hover:border-[#FF5A43]/50 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>One-Click Student Demo</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-[#0f0f18] border border-[#222234]">
                120+ Curated Problems
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#0f0f18] border border-[#222234]">
                Multi-Language Sandbox
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#0f0f18] border border-[#222234]">
                Automated Test Verification
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#0f0f18] border border-[#222234]">
                Daily Streak Tracking
              </span>
            </div>
          </div>
        </section>

        {/* Minimal Platform Features (3 Clean Cards) */}
        <section id="features" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto border-b border-[#1c1c28]/70">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">How CodeElevate Works</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              A clean, focused environment designed for deliberate practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0e0e16] border border-[#1e1e2c] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5A43]/15 text-[#FF5A43] flex items-center justify-center border border-[#FF5A43]/25">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Structured Roadmaps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step topic progression sequencing fundamental arrays and strings through trees, graphs,
                and complex dynamic programming.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e16] border border-[#1e1e2c] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Sandbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Write and execute code directly in your browser with multi-language support (JavaScript, Python,
                TypeScript, C++, Java, and Go) and immediate automated test feedback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e16] border border-[#1e1e2c] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Targeted Diagnostics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identify recurring weakness patterns, track daily practice consistency, and receive targeted
                problem recommendations to strengthen gaps.
              </p>
            </div>
          </div>
        </section>

        {/* Minimal Curriculum Tracks Overview */}
        <section id="curriculum" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto border-b border-[#1c1c28]/70">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Core Curriculum Tracks</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Curated problem tracks tailored to standard industry technical interview loops.
              </p>
            </div>
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="text-xs text-[#FF8570] hover:text-[#FF5A43] font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore all problem sets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { track: '01', name: 'Arrays & Two Pointers', problems: '24 Problems', level: 'Fundamental' },
              { track: '02', name: 'Linked Lists & Stacks', problems: '18 Problems', level: 'Core' },
              { track: '03', name: 'Trees & Binary Search', problems: '26 Problems', level: 'Intermediate' },
              { track: '04', name: 'Graphs & Catacombs', problems: '22 Problems', level: 'Advanced' },
              { track: '05', name: 'Dynamic Programming', problems: '30 Problems', level: 'Apex' }
            ].map((item) => (
              <div
                key={item.track}
                className="p-4 rounded-xl bg-[#0e0e16] border border-[#1e1e2c] flex flex-col justify-between hover:border-[#2b2b3e] transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">TRACK {item.track}</span>
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                </div>
                <div className="pt-3 mt-3 border-t border-[#1a1a26] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{item.problems}</span>
                  <span className="text-slate-300">{item.level}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* DEDICATED CONTACT, BUG REPORTS & SUGGESTIONS SECTION           */}
        {/* ------------------------------------------------------------- */}
        <section id="contact" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="bg-[#0b0b12] border border-[#202030] rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            <div className="max-w-2xl mb-8 space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF5A43]/10 border border-[#FF5A43]/30 text-[11px] font-mono text-[#FF8570]">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>Direct Support & Community Feedback</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Report Bugs & Share Suggestions
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We are actively building and improving CodeElevate. If you encounter any bugs or platform issues,
                or have suggestions for new features and problem sets that would make the website better, please
                reach out directly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Direct Email Details & Quick Action Mailto Links */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-[#12121d] border border-[#222236] space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Official Contact Email
                  </span>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090f] border border-[#1e1e2e]">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Mail className="w-4 h-4 text-[#FF5A43] shrink-0" />
                      <span className="text-xs sm:text-sm font-mono font-semibold text-white truncate">
                        {CONTACT_EMAIL}
                      </span>
                    </div>
                    <button
                      id="copy-contact-email-btn"
                      onClick={handleCopyEmail}
                      className="p-2 rounded-lg bg-[#181826] hover:bg-[#202032] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                      title="Copy email address"
                      aria-label="Copy email"
                    >
                      {copiedEmail ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {copiedEmail && (
                    <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Copied email address to clipboard!</span>
                    </p>
                  )}

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    Direct emails go straight to our engineering and support inbox. We respond to all bug reports
                    and suggestions within 24 hours.
                  </p>
                </div>

                {/* Pre-Formatted Direct Mailto Actions */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Fast Mail Client Shortcuts:
                  </span>

                  <a
                    id="mailto-bug-report-link"
                    href={bugMailtoUrl}
                    className="w-full p-3.5 rounded-xl bg-[#12121d] hover:bg-[#181826] border border-[#222236] hover:border-[#FF5A43]/50 text-slate-200 hover:text-white transition-all flex items-center justify-between text-xs font-semibold group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bug className="w-4 h-4 text-rose-400" />
                      <span>Email a Bug / Technical Issue Report</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </a>

                  <a
                    id="mailto-suggestion-link"
                    href={suggestionMailtoUrl}
                    className="w-full p-3.5 rounded-xl bg-[#12121d] hover:bg-[#181826] border border-[#222236] hover:border-[#FF5A43]/50 text-slate-200 hover:text-white transition-all flex items-center justify-between text-xs font-semibold group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Email a Suggestion or Improvement Idea</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </a>
                </div>
              </div>

              {/* Right Column: In-Browser Feedback Form */}
              <div className="lg:col-span-7 bg-[#10101a] border border-[#202032] rounded-2xl p-6 sm:p-7">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Send className="w-4 h-4 text-[#FF5A43]" />
                    <span>Send Message Directly From Browser</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Alternatively, submit your suggestions or bug descriptions directly below without opening an external mail client.
                  </p>
                </div>

                {/* Feedback Type Toggle */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFeedbackType('bug')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                      feedbackType === 'bug'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-[#151522] text-slate-400 border border-[#252538] hover:text-slate-200'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Bug Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType('suggestion')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                      feedbackType === 'suggestion'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#151522] text-slate-400 border border-[#252538] hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Suggestion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType('general')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                      feedbackType === 'general'
                        ? 'bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/40'
                        : 'bg-[#151522] text-slate-400 border border-[#252538] hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>General</span>
                  </button>
                </div>

                {/* Status Messages */}
                {feedbackSuccessMsg && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feedbackSuccessMsg}</span>
                  </div>
                )}

                {feedbackErrorMsg && (
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feedbackErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        placeholder="Alex Chen"
                        className="w-full px-3 py-2 rounded-xl bg-[#161624] border border-[#26263a] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Your Email (Optional, for follow-up)
                      </label>
                      <input
                        type="email"
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#161624] border border-[#26263a] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Subject / Short Summary *
                    </label>
                    <input
                      type="text"
                      value={feedbackSubject}
                      onChange={(e) => setFeedbackSubject(e.target.value)}
                      placeholder={
                        feedbackType === 'bug'
                          ? 'e.g. Test case 3 failed on Two Sum problem'
                          : 'e.g. Add dark theme contrast toggle or Python 3.12 support'
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161624] border border-[#26263a] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Details / Description *
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder={
                        feedbackType === 'bug'
                          ? 'Please describe what happened, expected behavior, and steps to reproduce...'
                          : 'Describe your idea, why it would improve the website, and how it would work...'
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161624] border border-[#26263a] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-feedback-btn"
                    disabled={feedbackSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#FF5A43] hover:bg-[#F04428] text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {feedbackSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit {feedbackType === 'bug' ? 'Bug Report' : 'Suggestion'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Minimal Footer */}
      <footer className="border-t border-[#1c1c28] bg-[#07070a] py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CodeElevateLogo size="sm" showText={true} showSubtitle={false} />
            <span>•</span>
            <span>Adaptive Technical Interview Academy</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-slate-400 hover:text-[#FF8570] transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <span>•</span>
            <button
              onClick={onGoToFacultyLogin}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Faculty Portal
            </button>
            <span>•</span>
            <button
              onClick={onGoToAdminLogin}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Admin Gateway
            </button>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* ENTER ACADEMY AUTHENTICATION MODAL                            */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-[#0e0e16] border border-[#252538] rounded-2xl p-6 sm:p-7 shadow-2xl relative text-slate-100"
            >
              {/* Close Button */}
              <button
                id="close-academy-auth-modal-btn"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-1.5 mb-5">
                <div className="flex justify-center mb-1">
                  <CodeElevateIcon size={40} />
                </div>
                <h2 className="text-xl font-black text-white">
                  {authMode === 'login' ? 'Sign In to CodeElevate' : 'Create Student Account'}
                </h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'login'
                    ? 'Access your personalized learning roadmap and interactive sandbox.'
                    : 'Register with 6-digit OTP email verification.'}
                </p>
              </div>

              {/* One-Click Fast Track Demo Account */}
              <button
                type="button"
                id="modal-fast-track-login-btn"
                onClick={handleFastTrackStudentLogin}
                disabled={authLoading}
                className="w-full py-2.5 mb-4 rounded-xl text-xs font-semibold bg-[#171724] hover:bg-[#1f1f32] text-slate-200 hover:text-white border border-[#2b2b40] hover:border-[#FF5A43]/60 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>Instant Demo Student Account</span>
              </button>

              <div className="relative flex py-2 items-center mb-3">
                <div className="flex-grow border-t border-[#222234]" />
                <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-slate-500">
                  Or use credentials
                </span>
                <div className="flex-grow border-t border-[#222234]" />
              </div>

              {/* Error Message */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{authError}</div>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="AlexDeveloper"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43]"
                      required
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Level</label>
                      <select
                        value={authSkillLevel}
                        onChange={(e) => setAuthSkillLevel(e.target.value as SkillLevel)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white focus:outline-none focus:border-[#FF5A43]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Language</label>
                      <select
                        value={authPreferredLanguage}
                        onChange={(e) => setAuthPreferredLanguage(e.target.value as SupportedLanguage)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white focus:outline-none focus:border-[#FF5A43]"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="go">Go</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  id="modal-submit-auth-btn"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#FF5A43] hover:bg-[#F04428] text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-3"
                >
                  <span>
                    {authLoading
                      ? 'Authenticating...'
                      : authMode === 'register'
                      ? 'Register & Send 6-Digit OTP'
                      : 'Sign In to Academy'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-[#FF8570] transition-colors cursor-pointer"
                >
                  {authMode === 'login'
                    ? "Don't have an account? Register"
                    : 'Already have an account? Sign In'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6-Digit OTP Email Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        email={pendingVerificationEmail}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={(user, token) => {
          setIsVerificationModalOpen(false);
          onLoginSuccess(user, token);
        }}
        onEmailChangeRequested={() => {
          setIsVerificationModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
};

export const HomePage = ArcadeLandingPage;
