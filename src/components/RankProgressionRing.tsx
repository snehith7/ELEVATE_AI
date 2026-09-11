import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Zap,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import {
  playRankUpSound,
  playTickSound,
  isSoundEnabled,
  setSoundEnabled
} from '../utils/audioEffects';

interface RankProgressionRingProps {
  currentXp?: number;
  onXpChange?: (newXp: number) => void;
  size?: number; // diameter in px, default 130
  showControls?: boolean;
  className?: string;
}

export interface RankTier {
  name: string;
  badge: string;
  minXp: number;
  maxXp: number;
  color: string;
  accentGlow: string;
  perks: string[];
}

export const RANK_TIERS: RankTier[] = [
  {
    name: 'Bronze Novice',
    badge: 'Tier I',
    minXp: 0,
    maxXp: 500,
    color: '#CD7F32',
    accentGlow: 'rgba(205, 127, 50, 0.4)',
    perks: ['Basic Arrays & Strings Access', 'Interactive Console Execution']
  },
  {
    name: 'Silver Coder',
    badge: 'Tier II',
    minXp: 500,
    maxXp: 1200,
    color: '#94A3B8',
    accentGlow: 'rgba(148, 163, 184, 0.4)',
    perks: ['Binary Search & Two-Pointers', 'AI Mistake Pattern Scanner']
  },
  {
    name: 'Gold Architect',
    badge: 'Tier III',
    minXp: 1200,
    maxXp: 2200,
    color: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    perks: ['Trees, Graphs & Heaps Quests', 'Personalized Roadmap Telemetry']
  },
  {
    name: 'Platinum Maestro',
    badge: 'Tier IV',
    minXp: 2200,
    maxXp: 3500,
    color: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    perks: ['Dynamic Programming & Monotonic Stacks', 'Curriculum Boss Arena Access']
  },
  {
    name: 'Coral Grandmaster',
    badge: 'Mythic Elite',
    minXp: 3500,
    maxXp: 5000,
    color: '#FF5A43',
    accentGlow: 'rgba(255, 90, 67, 0.55)',
    perks: ['System Design & Concurrency', 'Global Leaderboard Hall of Fame']
  }
];

export const RankProgressionRing: React.FC<RankProgressionRingProps> = ({
  currentXp = 1450,
  onXpChange,
  size = 140,
  showControls = true,
  className = ''
}) => {
  const [xp, setXp] = useState<number>(currentXp);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(isSoundEnabled());
  const [isSurgeClaimed, setIsSurgeClaimed] = useState<boolean>(false);
  const [showTierModal, setShowTierModal] = useState<boolean>(false);

  // Determine current tier
  const currentTier =
    RANK_TIERS.find(t => xp >= t.minXp && xp < t.maxXp) || RANK_TIERS[RANK_TIERS.length - 1];
  const nextTierIndex = Math.min(
    RANK_TIERS.findIndex(t => t.name === currentTier.name) + 1,
    RANK_TIERS.length - 1
  );
  const nextTier = RANK_TIERS[nextTierIndex];

  // Calculate percentage within current tier
  const tierSpan = currentTier.maxXp - currentTier.minXp;
  const progressInTier = Math.min(1, Math.max(0, (xp - currentTier.minXp) / tierSpan));
  const progressPercent = Math.round(progressInTier * 100);

  // SVG Ring calculations
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressInTier * circumference;

  const toggleAudio = () => {
    const nextState = !isAudioActive;
    setIsAudioActive(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playTickSound(880);
    }
  };

  const handleRankSurgeBoost = () => {
    if (isSurgeClaimed) return;
    setIsSurgeClaimed(true);

    const bonus = 150;
    const newXp = xp + bonus;
    setXp(newXp);
    if (onXpChange) onXpChange(newXp);

    // Play rank-up sound and fire confetti
    playRankUpSound();
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#FF5A43', '#FFA07A', '#F59E0B', '#FFFFFF']
    });
  };

  return (
    <div
      className={`relative p-4 rounded-3xl bg-[#0d0d15]/90 border border-[#232334] backdrop-blur-xl shadow-2xl flex flex-col items-center justify-between space-y-3 ${className}`}
      style={{
        boxShadow: `0 15px 35px -10px rgba(0,0,0,0.8), 0 0 25px -5px ${currentTier.accentGlow}, inset 0 1px 1px rgba(255,255,255,0.12)`
      }}
    >
      {/* Header Bar with Audio Toggle */}
      <div className="w-full flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5">
          <Trophy className="w-3.5 h-3.5 text-[#FF5A43]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
            Live Rank Status
          </span>
        </div>

        <button
          onClick={toggleAudio}
          className="p-1 rounded-lg bg-[#141420] border border-[#252538] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isAudioActive ? 'Mute micro-interaction sound' : 'Enable tactile audio feedback'}
        >
          {isAudioActive ? (
            <Volume2 className="w-3.5 h-3.5 text-[#FF8570]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Circular Progress Ring */}
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        onClick={() => {
          playTickSound(700);
          setShowTierModal(!showTierModal);
        }}
        title="Click to view all Rank Tiers & Perks"
      >
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1a1a28"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glowing Filter Definitions */}
          <defs>
            <linearGradient id="rankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3E24" />
              <stop offset="50%" stopColor="#FF5A43" />
              <stop offset="100%" stopColor={currentTier.color} />
            </linearGradient>
            <filter id="rankGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Animated Glowing Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#rankGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#rankGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span
            className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border mb-0.5"
            style={{
              borderColor: `${currentTier.color}50`,
              color: currentTier.color,
              backgroundColor: `${currentTier.color}15`
            }}
          >
            {currentTier.badge}
          </span>
          <span className="text-xl font-black font-mono text-white tracking-tight leading-none mt-0.5">
            {progressPercent}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {xp.toLocaleString()} XP
          </span>
        </div>

        {/* Orbiting particle ring decoration */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-spin"
          style={{ animationDuration: '8s' }}
        >
          <div
            className="w-2 h-2 rounded-full shadow-lg"
            style={{
              backgroundColor: '#FF5A43',
              boxShadow: '0 0 10px #FF5A43'
            }}
          />
        </div>
      </div>

      {/* Tier Label and Next Threshold */}
      <div className="text-center space-y-0.5 w-full">
        <h4 className="text-sm font-bold text-white flex items-center justify-center space-x-1">
          <span>{currentTier.name}</span>
          <Award className="w-3.5 h-3.5 text-[#FF5A43]" />
        </h4>
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between px-2 pt-1 border-t border-[#1c1c2b] w-full">
          <span>Next: {nextTier.name}</span>
          <span className="text-[#FF8570] font-bold">
            {Math.max(0, currentTier.maxXp - xp)} XP to go
          </span>
        </div>
      </div>

      {/* Optional Interactive Micro-interaction Surge Boost */}
      {showControls && (
        <button
          onClick={handleRankSurgeBoost}
          disabled={isSurgeClaimed}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
            isSurgeClaimed
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-gradient-to-r from-[#FF5A43] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-[#FF5A43]/20 hover:scale-[1.02]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{isSurgeClaimed ? 'Surge Claimed (+150 XP)' : 'Claim Daily Rank Surge'}</span>
        </button>
      )}

      {/* Tier Breakdown Modal */}
      <AnimatePresence>
        {showTierModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -bottom-2 translate-y-full left-1/2 -translate-x-1/2 w-72 p-4 rounded-2xl bg-[#0d0d15] border border-[#2b2b3d] shadow-2xl z-50 text-left space-y-2.5 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#202030] pb-2">
              <span className="text-xs font-bold text-white font-mono">
                Academy Rank Hierarchy
              </span>
              <button
                onClick={() => setShowTierModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {RANK_TIERS.map(tier => (
                <div
                  key={tier.name}
                  className={`p-2 rounded-lg text-[11px] border ${
                    tier.name === currentTier.name
                      ? 'bg-[#181824] border-[#FF5A43] text-white font-bold'
                      : 'bg-[#101018] border-[#1d1d28] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: tier.color }}>{tier.name}</span>
                    <span className="font-mono text-[10px]">
                      {tier.minXp} - {tier.maxXp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
