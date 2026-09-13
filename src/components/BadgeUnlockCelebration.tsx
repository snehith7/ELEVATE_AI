import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Target,
  Cpu,
  Compass,
  Award,
  Crown,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Badge } from '../types';
import { playBadgeFanfareSound, playConfettiPopSound } from '../utils/audioEffects';

interface BadgeUnlockCelebrationProps {
  unlockedBadges?: Badge[];
  badges?: Badge[];
  onClose?: () => void;
  onDismiss?: () => void;
  onOpenTrophyCabinet?: () => void;
}

export const BadgeUnlockCelebration: React.FC<BadgeUnlockCelebrationProps> = ({
  unlockedBadges,
  badges,
  onClose,
  onDismiss,
  onOpenTrophyCabinet
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const rawBadges = unlockedBadges || badges || [];
  const safeBadges = Array.isArray(rawBadges) ? rawBadges : [];
  const handleClose = onClose || onDismiss || (() => {});

  if (safeBadges.length === 0) return null;

  const currentBadge = safeBadges[currentIndex] || safeBadges[0];

  useEffect(() => {
    // Sound trigger
    playBadgeFanfareSound();
    playConfettiPopSound();

    // Multi-stage confetti celebration
    const end = Date.now() + 1800;

    const colors = ['#FF5A43', '#FF8570', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#38BDF8'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Big center burst
    confetti({
      particleCount: 65,
      spread: 100,
      origin: { y: 0.5 },
      colors
    });
  }, [currentIndex]);

  const renderBadgeIcon = (iconName: string, className: string = 'w-10 h-10') => {
    switch (iconName) {
      case 'zap':
        return <Zap className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const rarityGradients: Record<string, { badge: string; text: string; ring: string }> = {
    Common: {
      badge: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
      text: 'text-emerald-400',
      ring: 'rgba(16, 185, 129, 0.4)'
    },
    Rare: {
      badge: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/40',
      text: 'text-blue-400',
      ring: 'rgba(59, 130, 246, 0.4)'
    },
    Epic: {
      badge: 'from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-500/40',
      text: 'text-purple-400',
      ring: 'rgba(139, 92, 246, 0.4)'
    },
    Legendary: {
      badge: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
      text: 'text-amber-400',
      ring: 'rgba(245, 158, 11, 0.45)'
    },
    Mythic: {
      badge: 'from-[#FF5A43]/20 via-pink-500/20 to-purple-500/20 text-[#FF8570] border-[#FF5A43]/50',
      text: 'text-[#FF8570]',
      ring: 'rgba(255, 90, 67, 0.5)'
    }
  };

  const currentRarity = rarityGradients[currentBadge.rarity] || rarityGradients.Rare;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Background Animated Halo */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-40 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${currentBadge.glowColor || 'rgba(255, 90, 67, 0.4)'} 0%, transparent 70%)`
        }}
      />

      {/* Main Celebration Card */}
      <div className="relative w-full max-w-lg bg-[#0e0e16] border border-[#262638] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center z-10 space-y-6">
        {/* Specular Rim Light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#FF5A43]/30 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-[#161622] hover:bg-[#202030] transition-colors"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Multi-badge pagination header if unlocked > 1 */}
        {safeBadges.length > 1 && (
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
            <span>
              Accolade {currentIndex + 1} of {safeBadges.length}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-1 rounded bg-[#1a1a28] disabled:opacity-30 hover:bg-[#242436] text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(safeBadges.length - 1, prev + 1))}
                disabled={currentIndex === safeBadges.length - 1}
                className="p-1 rounded bg-[#1a1a28] disabled:opacity-30 hover:bg-[#242436] text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Celebratory Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF5A43]/20 via-amber-500/20 to-[#FF8570]/20 border border-[#FF5A43]/40 text-xs font-bold text-[#FF8570] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A43] animate-spin" />
            <span>New Achievement Unlocked!</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Accolade Conquered
          </h2>
        </div>

        {/* 3D Illuminated Badge Display */}
        <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
          {/* Animated Ring */}
          <div
            className="absolute inset-0 rounded-3xl border-2 border-dashed animate-spin"
            style={{
              borderColor: currentBadge.borderColor || '#FF5A43',
              animationDuration: '12s'
            }}
          />

          {/* Badge Glow Aura */}
          <div
            className="absolute inset-2 rounded-2xl blur-lg opacity-60"
            style={{ backgroundColor: currentBadge.borderColor || '#FF5A43' }}
          />

          {/* Inner Badge Container */}
          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${currentBadge.color || 'from-[#FF5A43] to-[#FF8570]'} p-0.5 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform`}
          >
            <div className="w-full h-full rounded-[14px] bg-[#0e0e16]/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-white">
              <div
                className="p-3 rounded-xl mb-1 shadow-inner"
                style={{ backgroundColor: `${currentBadge.borderColor || '#FF5A43'}25` }}
              >
                {renderBadgeIcon(currentBadge.iconName, 'w-10 h-10 text-white')}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                {currentBadge.tier || 'Tier I'}
              </span>
            </div>
          </div>
        </div>

        {/* Badge Metadata Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span
              className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${currentRarity.badge}`}
            >
              {currentBadge.rarity}
            </span>
            <span className="text-xs text-slate-400 font-mono capitalize">
              {currentBadge.category.replace('_', ' ')}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">{currentBadge.name}</h3>
          <p className="text-xs sm:text-sm font-semibold text-[#FF8570]">{currentBadge.title}</p>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            {currentBadge.description}
          </p>

          {currentBadge.lore && (
            <p className="text-[11px] italic text-slate-400 pt-1">"{currentBadge.lore}"</p>
          )}
        </div>

        {/* XP Reward Banner */}
        <div className="flex items-center justify-center space-x-3 p-3 rounded-2xl bg-[#141420] border border-[#262638]">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>+{currentBadge.xpReward} Student XP</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Added to Profile Showcase</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {onOpenTrophyCabinet ? (
            <button
              onClick={() => {
                handleClose();
                onOpenTrophyCabinet();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#FF5A43] via-[#FF6F59] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] shadow-lg shadow-[#FF5A43]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Open Trophy Cabinet</span>
            </button>
          ) : null}

          <button
            onClick={handleClose}
            className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-slate-300 bg-[#171724] hover:bg-[#222234] border border-[#2b2b3e] transition-colors cursor-pointer"
          >
            Keep Coding
          </button>
        </div>
      </div>
    </div>
  );
};
