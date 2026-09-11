import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Sparkles,
  Zap,
  Trophy,
  Shield,
  Target,
  ArrowRight,
  Code2,
  CheckCircle2,
  Play,
  RotateCcw,
  Users,
  Compass,
  Cpu,
  BarChart3,
  Award,
  Lock,
  ChevronRight,
  Star,
  Terminal,
  Layers,
  X,
  User,
  KeyRound,
  Mail,
  AlertCircle,
  MapPin,
  Swords
} from 'lucide-react';
import { CodeElevateLogo, CodeElevateIcon } from './CodeElevateLogo';
import { VerificationModal } from './VerificationModal';
import { SupportedLanguage, SkillLevel } from '../types';
import { TiltCard3D } from './TiltCard3D';
import { ParticleMeshCanvas } from './ParticleMeshCanvas';
import { RankProgressionRing } from './RankProgressionRing';
import { playTickSound, playRankUpSound, playSuccessChime } from '../utils/audioEffects';

interface ArcadeLandingPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onGoToFacultyLogin: () => void;
  onGoToAdminLogin: () => void;
}

interface ProgressionBadge {
  id: string;
  name: string;
  title: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  color: string;
  borderColor: string;
  glowColor: string;
  progress: number; // 0 - 100
  isUnlocked: boolean;
  tier: string;
  iconName: 'zap' | 'flame' | 'shield' | 'target' | 'cpu' | 'trophy';
  description: string;
}

export const ArcadeLandingPage: React.FC<ArcadeLandingPageProps> = ({
  onLoginSuccess,
  onGoToFacultyLogin,
  onGoToAdminLogin
}) => {
  // -------------------------------------------------------------
  // 1. GLOBAL STREAK COUNTER STATE
  // -------------------------------------------------------------
  const [globalStreak, setGlobalStreak] = useState<number>(18492);
  const [userStreakClaimed, setUserStreakClaimed] = useState<boolean>(false);
  const [virtualXp, setVirtualXp] = useState<number>(1250);
  const [recentLiveTicker, setRecentLiveTicker] = useState<string>(
    '⚡ Dev in Tokyo just extended a 14-day streak!'
  );

  // Live streak ticker updates
  useEffect(() => {
    const tickers = [
      '⚡ Dev in Tokyo extended a 14-day streak!',
      '🔥 Student in London solved Dynamic Programming Boss!',
      '🚀 Dev in San Francisco claimed 250 XP in Binary Search!',
      '✨ Student in Bengaluru completed Daily Recursion Quest!',
      '🛡️ Dev in Berlin unlocked "Algorithm Alchemist" Badge!',
      '🌟 Student in Toronto passed 5 tests in Graph Theory!'
    ];

    const interval = setInterval(() => {
      setGlobalStreak(prev => prev + Math.floor(Math.random() * 2) + 1);
      const randomTicker = tickers[Math.floor(Math.random() * tickers.length)];
      setRecentLiveTicker(randomTicker);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleClaimDailyStreak = () => {
    if (userStreakClaimed) return;
    setUserStreakClaimed(true);
    setVirtualXp(prev => prev + 50);
    setGlobalStreak(prev => prev + 1);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF5A43', '#FFA07A', '#FFFFFF']
    });
  };

  // -------------------------------------------------------------
  // 2. ANIMATED PROGRESSION BADGES DATA
  // -------------------------------------------------------------
  const [badges, setBadges] = useState<ProgressionBadge[]>([
    {
      id: 'b1',
      name: 'Algorithm Alchemist',
      title: 'Master of Graphs & Trees',
      rarity: 'Legendary',
      color: 'from-[#FF5A43] to-[#FF8570]',
      borderColor: '#FF5A43',
      glowColor: 'rgba(255, 90, 67, 0.35)',
      progress: 100,
      isUnlocked: true,
      tier: 'Tier III',
      iconName: 'zap',
      description: 'Awarded for conquering 30 complex tree and graph traversal challenges.'
    },
    {
      id: 'b2',
      name: 'Binary Blitzmaster',
      title: 'Speed & Precision',
      rarity: 'Epic',
      color: 'from-amber-500 to-orange-400',
      borderColor: '#F59E0B',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      progress: 90,
      isUnlocked: true,
      tier: 'Tier II',
      iconName: 'flame',
      description: 'Solved 10 intermediate algorithmic challenges in under 15 minutes each.'
    },
    {
      id: 'b3',
      name: 'Recursion Ronin',
      title: 'Call Stack Conqueror',
      rarity: 'Rare',
      color: 'from-rose-500 to-pink-500',
      borderColor: '#F43F5E',
      glowColor: 'rgba(244, 63, 94, 0.3)',
      progress: 100,
      isUnlocked: true,
      tier: 'Tier II',
      iconName: 'shield',
      description: 'Zero stack overflow errors across 15 backtracking and divide-and-conquer quests.'
    },
    {
      id: 'b4',
      name: 'Graph Glitcher',
      title: 'Shortest Path Voyager',
      rarity: 'Epic',
      color: 'from-violet-500 to-indigo-500',
      borderColor: '#8B5CF6',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      progress: 85,
      isUnlocked: false,
      tier: 'Tier I',
      iconName: 'cpu',
      description: 'Implement Dijkstra and BFS on dense cyclic weighted topologies.'
    },
    {
      id: 'b5',
      name: 'Bitwise Berserker',
      title: 'Low-Level Binary Ninja',
      rarity: 'Rare',
      color: 'from-teal-500 to-emerald-400',
      borderColor: '#14B8A6',
      glowColor: 'rgba(20, 184, 166, 0.3)',
      progress: 60,
      isUnlocked: false,
      tier: 'Tier I',
      iconName: 'target',
      description: 'Master bit shifts, masks, and XOR tricks without conditional branches.'
    },
    {
      id: 'b6',
      name: 'Dynamic Dynamo',
      title: 'Memoization Mastermind',
      rarity: 'Mythic',
      color: 'from-[#FF5A43] via-purple-500 to-pink-500',
      borderColor: '#EC4899',
      glowColor: 'rgba(236, 72, 153, 0.3)',
      progress: 40,
      isUnlocked: false,
      tier: 'Locked Boss',
      iconName: 'trophy',
      description: 'Solve the 7 hardest multi-dimensional Dynamic Programming puzzles.'
    }
  ]);

  const [activeBadgeDetail, setActiveBadgeDetail] = useState<ProgressionBadge | null>(null);

  // -------------------------------------------------------------
  // 3. INTERACTIVE MINI DAILY CHALLENGE PREVIEW
  // -------------------------------------------------------------
  const [selectedSolutionOption, setSelectedSolutionOption] = useState<number>(0);
  const [challengeState, setChallengeState] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [testResults, setTestResults] = useState<Array<{ name: string; input: string; expected: string; passed: boolean }>>([]);
  const [challengeXpAwarded, setChallengeXpAwarded] = useState<boolean>(false);

  const solutionOptions = [
    {
      id: 0,
      label: 'Hash Map Lookup - O(n) Time, O(n) Space',
      codeSnippet: `const map = new Map();
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (map.has(complement)) {
    return [map.get(complement), i];
  }
  map.set(nums[i], i);
}`,
      isCorrect: true,
      explanation: 'Optimal one-pass hash map check yields lightning-fast O(n) performance!'
    },
    {
      id: 1,
      label: 'Double Nested Loop - O(n²) Time, O(1) Space',
      codeSnippet: `for (let i = 0; i < nums.length; i++) {
  for (let j = i + 1; j < nums.length; j++) {
    if (nums[i] + nums[j] === target) return [i, j];
  }
}`,
      isCorrect: false,
      explanation: 'Passes small test cases but causes Time Limit Exceeded on larger arcade inputs.'
    },
    {
      id: 2,
      label: 'Sorted Pointers without Index Tracking - Broken Indices',
      codeSnippet: `nums.sort((a, b) => a - b);
let l = 0, r = nums.length - 1;
while (l < r) {
  const s = nums[l] + nums[r];
  if (s === target) return [l, r]; // Fails original indices!
  s < target ? l++ : r--;
}`,
      isCorrect: false,
      explanation: 'Sorting in-place scrambles original element index references!'
    }
  ];

  const handleRunMiniChallenge = () => {
    setChallengeState('running');
    setTestResults([]);

    setTimeout(() => {
      const selected = solutionOptions[selectedSolutionOption];
      if (selected.isCorrect) {
        setTestResults([
          { name: 'Case 1', input: 'nums=[2, 7, 11, 15], target=9', expected: '[0, 1]', passed: true },
          { name: 'Case 2', input: 'nums=[3, 2, 4], target=6', expected: '[1, 2]', passed: true },
          { name: 'Case 3 (Bounty)', input: 'nums=[3, 3], target=6', expected: '[0, 1]', passed: true }
        ]);
        setChallengeState('success');

        if (!challengeXpAwarded) {
          setChallengeXpAwarded(true);
          setVirtualXp(prev => prev + 150);

          // Unlock an extra badge in state
          setBadges(prev =>
            prev.map(b => (b.id === 'b4' ? { ...b, isUnlocked: true, progress: 100 } : b))
          );

          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF5A43', '#FFA07A', '#4ADE80', '#FFFFFF']
          });
        }
      } else {
        setTestResults([
          { name: 'Case 1', input: 'nums=[2, 7, 11, 15], target=9', expected: '[0, 1]', passed: false },
          { name: 'Case 2', input: 'nums=[3, 2, 4], target=6', expected: '[1, 2]', passed: false }
        ]);
        setChallengeState('failed');
      }
    }, 800);
  };

  // -------------------------------------------------------------
  // 4. ENTER ACADEMY PORTAL & AUTH MODAL STATE
  // -------------------------------------------------------------
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authSkillLevel, setAuthSkillLevel] = useState<SkillLevel>('intermediate');
  const [authPreferredLanguage, setAuthPreferredLanguage] = useState<SupportedLanguage>('javascript');
  const [authTargetGoal, setAuthTargetGoal] = useState('Master Algorithmic Interviews & Problem Solving');

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email OTP verification state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Fast-track demo student access
  const handleFastTrackStudentLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student@codeelevate.io',
          password: 'StudentPass123!'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize student academy session.');
      }
      setIsAuthModalOpen(false);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Could not connect to academy portal.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body =
        authMode === 'register'
          ? {
              username: authUsername.trim() || authEmail.split('@')[0],
              email: authEmail.trim().toLowerCase(),
              password: authPassword,
              skillLevel: authSkillLevel,
              preferredLanguage: authPreferredLanguage,
              targetGoal: authTargetGoal
            }
          : { email: authEmail.trim().toLowerCase(), password: authPassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          setVerificationEmail(data.email || authEmail.trim().toLowerCase());
          setIsVerificationModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Authentication failed.');
      }

      if (data.requiresVerification) {
        setVerificationEmail(data.email || authEmail.trim().toLowerCase());
        setIsVerificationModalOpen(true);
        return;
      }

      setIsAuthModalOpen(false);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-5 h-5 text-[#FF5A43]" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-rose-400" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'target':
        return <Target className="w-5 h-5 text-teal-400" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-[#FF8570]" />;
      default:
        return <Award className="w-5 h-5 text-[#FF5A43]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 selection:bg-[#FF5A43]/30 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* Animated Particle Mesh Backdrop */}
      <ParticleMeshCanvas
        particleCount={45}
        accentColor="#FF5A43"
        className="fixed inset-0 pointer-events-none z-0 opacity-50"
      />

      {/* Dynamic Background Grid & Ambient Glows */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#14141f_1px,transparent_1px),linear-gradient(to_bottom,#14141f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-[#FF5A43]/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 -left-40 w-[500px] h-[300px] bg-[#FF5A43]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top HUD Header */}
      <header className="relative z-20 px-4 sm:px-8 py-3.5 border-b border-[#1c1c28] bg-[#09090e]/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CodeElevateLogo size="sm" showText={true} showSubtitle={false} />
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#161622] border border-[#252535] text-[11px] font-mono font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#FF8570]">ARCADE ACADEMY</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">S4 ACTIVE</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-xl bg-[#12121a] border border-[#222230] text-xs font-mono">
            <Flame className="w-4 h-4 text-[#FF5A43] animate-pulse" />
            <span className="text-slate-400">Global Streak:</span>
            <strong className="text-white font-bold">{globalStreak.toLocaleString()}</strong>
          </div>

          <button
            id="header-faculty-portal-btn"
            onClick={onGoToFacultyLogin}
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-2.5 sm:px-3 rounded-lg bg-[#14141e] hover:bg-[#1a1a28] border border-[#252535]"
          >
            Faculty
          </button>

          <button
            id="header-admin-portal-btn"
            onClick={onGoToAdminLogin}
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-2.5 sm:px-3 rounded-lg bg-[#14141e] hover:bg-[#1a1a28] border border-[#252535]"
          >
            Admin
          </button>

          <button
            id="header-enter-academy-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold py-1.5 px-3.5 rounded-lg bg-gradient-to-r from-[#FF5A43] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Enter Academy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Arcade Content Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-5 pt-4 sm:pt-8 max-w-4xl mx-auto">
          {/* Top Pill / Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#171724] border border-[#FF5A43]/40 text-[11px] sm:text-xs font-mono font-semibold text-[#FF8570] shadow-lg shadow-[#FF5A43]/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A43] animate-spin" />
            <span>LEVEL UP YOUR ALGORITHMIC COMBAT // 2.5X XP MULTIPLIER ACTIVE</span>
          </motion.div>

          {/* Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]"
          >
            THE ARCADE <span className="text-[#FF5A43]">ACADEMY</span> FOR TECHNICAL MASTERY.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Step into the next-generation competitive coding arena. Earn animated progression badges,
            fuel real-time global streak counters, and conquer personalized AI-driven roadmaps designed
            for elite technical interviews.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              id="hero-enter-academy-portal-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wide bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-xl shadow-[#FF5A43]/30 transition-all flex items-center justify-center space-x-3 cursor-pointer hover:scale-[1.02] border border-[#FF8570]/30"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>ENTER ACADEMY // LAUNCH ROADMAP</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-fast-track-demo-btn"
              onClick={handleFastTrackStudentLogin}
              disabled={authLoading}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-[#12121b] hover:bg-[#181824] text-slate-200 hover:text-white border border-[#272738] hover:border-[#FF5A43]/50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-[#FF5A43]" />
              <span>Instant Academy Demo Access</span>
            </button>
          </motion.div>

          {/* Live Global Activity Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-2 flex items-center justify-center space-x-2 text-xs font-mono text-slate-400"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5A43] animate-ping" />
            <span>{recentLiveTicker}</span>
          </motion.div>
        </section>

        {/* Global Streak Counter & Player XP Banner */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Global Streak Counter 3D Tilt Card */}
          <TiltCard3D
            maxTilt={10}
            glowColor="rgba(255, 90, 67, 0.2)"
            borderColor="#FF5A43"
            className="p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-[#FF5A43]/15 text-[#FF5A43] border border-[#FF5A43]/30 shadow-inner">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Global Streak Pulse</span>
                  <h3 className="text-base font-bold text-white">Daily Consistency</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                LIVE
              </span>
            </div>

            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-center space-x-2">
                <span className="text-[#FF5A43]">🔥</span>
                <span>{globalStreak.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Active students worldwide keeping their algorithmic streak blazing today.
              </p>
            </div>

            <button
              id="claim-global-streak-btn"
              onClick={() => {
                playTickSound(880);
                handleClaimDailyStreak();
              }}
              disabled={userStreakClaimed}
              className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                userStreakClaimed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-inner'
                  : 'bg-[#181826] hover:bg-[#202032] text-slate-200 hover:text-white border border-[#2d2d40] hover:border-[#FF5A43] shadow-md'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${userStreakClaimed ? 'text-emerald-400' : 'text-[#FF5A43]'}`} />
              <span>{userStreakClaimed ? 'Daily Streak Extended (+50 XP)' : 'Check In Your Daily Streak'}</span>
            </button>
          </TiltCard3D>

          {/* Live Rank Progression Ring Card */}
          <TiltCard3D
            maxTilt={10}
            glowColor="rgba(245, 158, 11, 0.2)"
            borderColor="#F59E0B"
            className="p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Tier Progress</span>
                  <h3 className="text-base font-bold text-white">Student Standing</h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#FF8570]">{virtualXp} XP</span>
            </div>

            <div className="my-1 flex items-center justify-center">
              <RankProgressionRing
                currentXp={virtualXp}
                targetXp={1500}
                currentRank="Gold Scholar"
                tier={4}
                size={120}
                strokeWidth={9}
                color="#FF5A43"
              />
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-[#1e1e2c]">
              <span>Next Milestone:</span>
              <strong className="text-slate-200 font-mono">Unlock Dynamic Dynamo Badge</strong>
            </div>
          </TiltCard3D>

          {/* Fast Portal Access 3D Card */}
          <TiltCard3D
            maxTilt={10}
            glowColor="rgba(255, 90, 67, 0.3)"
            borderColor="#FF5A43"
            className="p-5 flex flex-col justify-between bg-gradient-to-br from-[#12121b] via-[#16121a] to-[#1e1216]"
          >
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-2 rounded-xl bg-[#FF5A43]/20 text-[#FF5A43] border border-[#FF5A43]/40">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Adaptive Learning Portal</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dive directly into interactive Monaco code execution, AI mistake diagnosis, and 120+ tiered problems.
              </p>
            </div>

            <button
              id="portal-card-direct-enter-btn"
              onClick={() => {
                playRankUpSound();
                setIsAuthModalOpen(true);
              }}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] to-[#FF8570] text-white hover:from-[#F04428] hover:to-[#FF5A43] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-[#FF5A43]/25 hover:scale-[1.02]"
            >
              <span>Launch Your Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </TiltCard3D>
        </section>

        {/* Interactive Mini Daily Challenge Preview */}
        <section className="bg-[#0b0b12] border border-[#222230] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#FF5A43]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Challenge Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f1f2e]">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#FF5A43]/15 text-[#FF8570] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#FF5A43]/30">
                <Terminal className="w-3 h-3 text-[#FF5A43]" />
                <span>INTERACTIVE ARCADE BOUNTY // EARN VIRTUAL XP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Daily Quest: Two-Sum Warp Accelerator
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Given an array of integers <code className="text-[#FF8570] font-mono">nums</code> and an integer{' '}
                <code className="text-[#FF8570] font-mono">target</code>, return indices of the two numbers such that they add up to target. Select the optimal strategy below to test against automated test cases.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="px-3 py-2 rounded-xl bg-[#141420] border border-[#272738] text-right">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Quest Reward</span>
                <strong className="text-sm font-bold font-mono text-emerald-400">+150 Virtual XP</strong>
              </div>
            </div>
          </div>

          {/* Interactive Code Preview & Strategy Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            {/* Strategy Selectors (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Select Your Code Strategy:
              </span>

              {solutionOptions.map((opt, idx) => (
                <button
                  key={opt.id}
                  id={`select-strategy-option-${idx}`}
                  onClick={() => {
                    setSelectedSolutionOption(idx);
                    setChallengeState('idle');
                    setTestResults([]);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col space-y-1.5 ${
                    selectedSolutionOption === idx
                      ? 'bg-[#181826] border-[#FF5A43] shadow-lg shadow-[#FF5A43]/10 ring-1 ring-[#FF5A43]/30'
                      : 'bg-[#101018] border-[#222232] hover:border-[#2f2f45] hover:bg-[#141420]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">
                      Strategy {idx + 1}
                    </span>
                    {selectedSolutionOption === idx && (
                      <span className="w-2 h-2 rounded-full bg-[#FF5A43]" />
                    )}
                  </div>
                  <span className="text-xs text-slate-300 font-medium leading-tight">
                    {opt.label}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {opt.explanation}
                  </p>
                </button>
              ))}

              {/* Action Button */}
              <button
                id="run-mini-daily-challenge-btn"
                onClick={handleRunMiniChallenge}
                disabled={challengeState === 'running'}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {challengeState === 'running' ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Executing Arcade Test Runner...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Test Cases & Claim +150 XP</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Terminal Display & Test Results (Right 7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              {/* Fake Terminal Window */}
              <div className="rounded-2xl border border-[#252538] bg-[#08080f] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="px-4 py-2.5 bg-[#12121c] border-b border-[#222232] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">two_sum_arcade.js</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">JavaScript (ES6+)</span>
                </div>

                <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed bg-[#0a0a10]">
                  <pre className="text-slate-300">
                    <span className="text-[#FF8570]">function</span> <span className="text-amber-300">twoSum</span>(nums, target) {'{\n'}
                    {solutionOptions[selectedSolutionOption].codeSnippet
                      .split('\n')
                      .map((line, i) => (
                        <div key={i} className="flex">
                          <span className="w-6 text-slate-600 select-none text-right mr-3">{i + 1}</span>
                          <span className="text-slate-200">{line}</span>
                        </div>
                      ))}
                    {'\n}'}
                  </pre>
                </div>
              </div>

              {/* Test Results Output */}
              {challengeState !== 'idle' && (
                <div className="p-4 rounded-xl bg-[#11111a] border border-[#242436] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300">
                      Automated Execution Output:
                    </span>
                    {challengeState === 'success' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ALL 3 TESTS PASSED
                      </span>
                    )}
                    {challengeState === 'failed' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        TESTS FAILED (OPTIMIZATION REQUIRED)
                      </span>
                    )}
                  </div>

                  {testResults.map((tr, i) => (
                    <div
                      key={i}
                      className="text-xs font-mono flex items-center justify-between p-2 rounded-lg bg-[#161622] border border-[#272738]"
                    >
                      <div className="flex items-center space-x-2">
                        {tr.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="text-slate-200">{tr.name}:</span>
                        <span className="text-slate-400">{tr.input}</span>
                      </div>
                      <span className={tr.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {tr.passed ? 'PASSED (0.1ms)' : 'FAILED'}
                      </span>
                    </div>
                  ))}

                  {challengeState === 'success' && (
                    <div className="pt-2 flex items-center justify-between text-xs text-emerald-300">
                      <span className="font-semibold">🏆 Quest Completed! +150 Virtual XP Added to Your Profile.</span>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-[#FF8570] underline font-bold cursor-pointer hover:text-white"
                      >
                        Keep XP in Academy →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Quest Map Node Expedition Preview */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#FF8570] mb-1">
                <Compass className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>INTERACTIVE EXPLORATION PATHWAY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Gamified Quest Map Navigation
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Replace rigid menus with an immersive node-based campaign trail. Complete prerequisites, claim bounties, and climb to the Apex Boss.
            </p>
          </div>

          {/* Interactive Quest Map Preview Stage */}
          <div className="bg-[#0b0b12] border border-[#222234] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-1/4 w-96 h-60 bg-[#FF5A43]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Campaign Path Nodes */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  id: 'node-1',
                  step: '01',
                  title: 'Genesis Citadel',
                  category: 'Arrays & Two-Pointers',
                  status: 'completed',
                  xp: '+100 XP',
                  desc: 'Master basic linear memory layouts, two-pointer convergence, and binary search.',
                  icon: Target
                },
                {
                  id: 'node-2',
                  step: '02',
                  title: 'Recursive Nexus',
                  category: 'Divide & Conquer',
                  status: 'completed',
                  xp: '+150 XP',
                  desc: 'Unravel call stacks, backtracking permutations, and tree decompositions.',
                  icon: Cpu
                },
                {
                  id: 'node-3',
                  step: '03',
                  title: 'Binary Arbor',
                  category: 'Trees & BSTs',
                  status: 'active',
                  xp: '+200 XP',
                  desc: 'Current quest node: traverse hierarchical nodes, invert trees, and compute diameters.',
                  icon: Zap
                },
                {
                  id: 'node-4',
                  step: '04',
                  title: 'Graph Catacombs',
                  category: 'BFS / DFS / Shortest Path',
                  status: 'locked',
                  xp: '+250 XP',
                  desc: 'Traverse topological graphs, cycle detections, and Dijkstra routing.',
                  icon: Shield
                },
                {
                  id: 'node-5',
                  step: '05',
                  title: 'Apex Citadel',
                  category: 'Dynamic Programming',
                  status: 'boss',
                  xp: '+500 XP',
                  desc: 'Ultimate boss battle: multi-dimensional state transitions, knapsack, and memoization.',
                  icon: Trophy
                }
              ].map((node, i) => {
                const Icon = node.icon;
                const isCompleted = node.status === 'completed';
                const isActive = node.status === 'active';
                const isBoss = node.status === 'boss';

                return (
                  <TiltCard3D
                    key={node.id}
                    maxTilt={12}
                    glowColor={
                      isActive
                        ? 'rgba(255, 90, 67, 0.4)'
                        : isCompleted
                        ? 'rgba(16, 185, 129, 0.25)'
                        : isBoss
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(255, 255, 255, 0.05)'
                    }
                    borderColor={
                      isActive
                        ? '#FF5A43'
                        : isCompleted
                        ? '#10B981'
                        : isBoss
                        ? '#F59E0B'
                        : '#222232'
                    }
                    className={`p-4 flex flex-col justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'ring-2 ring-[#FF5A43]/50 shadow-xl shadow-[#FF5A43]/20'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          SECTOR {node.step}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isActive
                              ? 'bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/50 animate-pulse'
                              : isBoss
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          {node.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5 mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${
                            isActive
                              ? 'bg-[#FF5A43]/20 border-[#FF5A43] text-white shadow-[#FF5A43]/30'
                              : isCompleted
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : isBoss
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                              : 'bg-[#151522] border-[#252535] text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {node.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {node.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {node.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1b1b2a] flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {node.xp}
                      </span>
                      <button
                        onClick={() => {
                          playTickSound(840);
                          setIsAuthModalOpen(true);
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#FF5A43] text-white hover:bg-[#F04428]'
                            : 'bg-[#181826] text-slate-300 hover:text-white border border-[#27273a]'
                        }`}
                      >
                        {isActive ? 'Enter Quest' : 'Explore'}
                      </button>
                    </div>
                  </TiltCard3D>
                );
              })}
            </div>
          </div>
        </section>

        {/* Animated Progression Badges Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#FF8570] mb-1">
                <Trophy className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>ARCADE PROGRESSION & TROPHY CABINET</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Earn & Showcase Algorithmic Badges
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Level up your developer profile. Unlock special accolades by solving problem sets, sustaining streaks, and beating weekly arcade tournaments.
            </p>
          </div>

          {/* Badges Grid with 3D Tilt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {badges.map((badge, idx) => (
              <TiltCard3D
                key={badge.id}
                maxTilt={12}
                glowColor={badge.isUnlocked ? badge.glowColor : 'rgba(255, 255, 255, 0.05)'}
                borderColor={badge.isUnlocked ? badge.borderColor : '#222232'}
                className="p-5 flex flex-col justify-between cursor-pointer"
                onClick={() => {
                  playTickSound(700 + idx * 40);
                  setActiveBadgeDetail(badge);
                }}
              >
                <div>
                  {/* Badge Top Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-md"
                      style={{
                        backgroundColor: '#161622',
                        borderColor: badge.isUnlocked ? badge.borderColor : '#28283a'
                      }}
                    >
                      {renderBadgeIcon(badge.iconName)}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider"
                        style={{
                          backgroundColor: `${badge.borderColor}20`,
                          color: badge.borderColor,
                          border: `1px solid ${badge.borderColor}40`
                        }}
                      >
                        {badge.rarity}
                      </span>
                      {badge.isUnlocked ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>LOCKED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge Info */}
                  <h3 className="text-base font-bold text-white mb-0.5">{badge.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{badge.title}</p>
                </div>

                {/* Progress Bar & Tier */}
                <div className="space-y-1.5 pt-2 border-t border-[#1a1a26]">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{badge.tier}</span>
                    <span className={badge.isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {badge.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#181824] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${badge.progress}%`,
                        backgroundColor: badge.borderColor
                      }}
                    />
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </section>

        {/* Academy Core Pillars Preview */}
        <section className="bg-[#0b0b12] border border-[#1e1e2c] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF8570]">
              ACADEMY HIGHLIGHTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Everything You Need to Ace Technical Interviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#11111a] border border-[#222230] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF5A43]/15 text-[#FF5A43] flex items-center justify-center border border-[#FF5A43]/30">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Adaptive Learning Roadmap</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step curriculum with prerequisites spanning Arrays, Linked Lists, Trees, and Dynamic Programming.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11111a] border border-[#222230] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Monaco Code Sandbox</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-featured editor supporting JavaScript, Python, Java, C++, and Go with instant test suite execution.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11111a] border border-[#222230] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">AI Weakness Diagnosis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated mistake pattern detection, accuracy radar charts, and personalized target problem suggestions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11111a] border border-[#222230] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Peer Community & Mentors</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time collaborative discussions, algorithmic hints, and direct guidance from faculty instructors.
              </p>
            </div>
          </div>

          {/* Bottom Portal CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-[#141420] via-[#1a141c] to-[#1e1315] border border-[#FF5A43]/30 gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Ready to begin your training run?</h3>
              <p className="text-xs text-slate-400">Launch into your personalized dashboard and track your streak in real-time.</p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] to-[#FF8570] text-white hover:from-[#F04428] hover:to-[#FF5A43] shadow-lg shadow-[#FF5A43]/20 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <span>Enter Academy Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-[#1c1c28] text-center text-xs text-slate-500 bg-[#07070a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CodeElevateLogo size="sm" showText={true} showSubtitle={false} />
            <span>•</span>
            <span className="text-slate-400">CodeElevate AI Arcade Academy</span>
          </div>

          <div className="flex items-center space-x-4">
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
              Root Administrator Gateway
            </button>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 5. ENTER ACADEMY AUTHENTICATION MODAL                          */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0e0e16] border border-[#252538] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black relative overflow-hidden text-slate-100"
            >
              {/* Subtle Ambient Coral Glow */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#FF5A43]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#FF5A43]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                id="close-academy-auth-modal-btn"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-1.5 mb-5">
                <div className="flex justify-center mb-2">
                  <CodeElevateIcon size={48} className="shadow-lg shadow-[#FF5A43]/20" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {authMode === 'login' ? 'Enter Academy Portal' : 'Create Student Account'}
                </h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'login'
                    ? 'Sign in to access your personalized learning roadmap and interactive sandbox.'
                    : 'Register with 6-digit OTP verification to begin adaptive training.'}
                </p>
              </div>

              {/* Instant One-Click Demo Access Button */}
              <button
                type="button"
                id="modal-fast-track-login-btn"
                onClick={handleFastTrackStudentLogin}
                disabled={authLoading}
                className="w-full py-2.5 mb-4 rounded-xl text-xs font-bold bg-[#171724] hover:bg-[#1f1f32] text-slate-200 hover:text-white border border-[#2b2b40] hover:border-[#FF5A43]/60 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#FF5A43]" />
                <span>One-Click Demo Academy Access (student@codeelevate.io)</span>
              </button>

              <div className="relative flex py-2 items-center mb-3">
                <div className="flex-grow border-t border-[#222234]" />
                <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-slate-500">
                  Or Sign In With Credentials
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

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Display Username *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={authUsername}
                        onChange={e => setAuthUsername(e.target.value)}
                        placeholder="e.g. dev_jordan"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] transition-colors"
                        required={authMode === 'register'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="student@codeelevate.io"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] transition-colors"
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
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A43] transition-colors"
                      required
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Tier</label>
                        <select
                          value={authSkillLevel}
                          onChange={e => setAuthSkillLevel(e.target.value as SkillLevel)}
                          className="w-full px-2.5 py-2 rounded-xl bg-[#14141e] border border-[#262638] text-xs text-white focus:outline-none focus:border-[#FF5A43]"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
                        <select
                          value={authPreferredLanguage}
                          onChange={e => setAuthPreferredLanguage(e.target.value as SupportedLanguage)}
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
                  </>
                )}

                <button
                  type="submit"
                  id="modal-submit-auth-btn"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
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
                    ? 'New student? Register a new account'
                    : 'Already registered? Sign In to your account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {activeBadgeDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0e0e16] border border-[#252538] rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100"
            >
              <button
                onClick={() => setActiveBadgeDetail(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a26]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3 pt-2">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border shadow-xl"
                  style={{
                    backgroundColor: '#161624',
                    borderColor: activeBadgeDetail.borderColor
                  }}
                >
                  {renderBadgeIcon(activeBadgeDetail.iconName)}
                </div>

                <div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider"
                    style={{
                      backgroundColor: `${activeBadgeDetail.borderColor}20`,
                      color: activeBadgeDetail.borderColor,
                      border: `1px solid ${activeBadgeDetail.borderColor}40`
                    }}
                  >
                    {activeBadgeDetail.rarity} • {activeBadgeDetail.tier}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5">{activeBadgeDetail.name}</h3>
                  <p className="text-xs text-slate-400">{activeBadgeDetail.title}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#141420] p-3 rounded-xl border border-[#232335]">
                  {activeBadgeDetail.description}
                </p>

                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Progression</span>
                    <span className="text-white font-bold">{activeBadgeDetail.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#181824] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${activeBadgeDetail.progress}%`,
                        backgroundColor: activeBadgeDetail.borderColor
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveBadgeDetail(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] to-[#FF8570] text-white hover:from-[#F04428] hover:to-[#FF5A43] transition-all cursor-pointer mt-2"
                >
                  Level Up in Academy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6-Digit Email OTP Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        email={verificationEmail}
        onClose={() => setIsVerificationModalOpen(false)}
        onEmailChangeRequested={() => {
          setIsVerificationModalOpen(false);
          setIsAuthModalOpen(true);
          setAuthMode('register');
        }}
        onSuccess={(user, token) => {
          setIsVerificationModalOpen(false);
          setIsAuthModalOpen(false);
          onLoginSuccess(user, token);
        }}
      />
    </div>
  );
};
