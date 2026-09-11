import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Play,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Trophy,
  Flame,
  Star,
  Swords,
  ChevronRight,
  Compass,
  Cpu,
  Layers
} from 'lucide-react';
import { Problem } from '../types';
import { TiltCard3D } from './TiltCard3D';
import { playQuestNodeSound, playTickSound } from '../utils/audioEffects';

export interface QuestNode {
  id: string;
  order: number;
  title: string;
  realmName: string;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  status: 'completed' | 'active' | 'locked';
  stars: number; // 0-3
  xpReward: number;
  problemId?: string;
  lore: string;
  coords: { x: number; y: number }; // Percentage in map canvas (0-100)
  icon: 'zap' | 'shield' | 'target' | 'cpu' | 'trophy' | 'swords';
  primaryColor: string;
  skills: string[];
}

interface QuestMapProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onOpenAiGenerator: () => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  problems,
  onSelectProblem,
  onOpenAiGenerator
}) => {
  // Define the exploration quest campaign
  const initialNodes: QuestNode[] = [
    {
      id: 'node-1',
      order: 1,
      title: 'Genesis Citadel',
      realmName: 'Realm of Linear Arrays',
      category: 'Arrays & Two-Pointers',
      difficulty: 'basic',
      status: 'completed',
      stars: 3,
      xpReward: 150,
      problemId: 'p1', // Two Sum
      lore: 'Master fundamental pointer arithmetic, boundary conditions, and O(n) hash lookups.',
      coords: { x: 14, y: 32 },
      icon: 'zap',
      primaryColor: '#10B981',
      skills: ['Array Mutation', 'Two Pointers', 'O(n) Hash Search']
    },
    {
      id: 'node-2',
      order: 2,
      title: 'Recursive Nexus',
      realmName: 'Sanctum of Call Stacks',
      category: 'Strings & Stacks',
      difficulty: 'basic',
      status: 'completed',
      stars: 3,
      xpReward: 200,
      problemId: 'p2', // Valid Parentheses
      lore: 'Conquer LIFO data structures, syntax validations, and divide-and-conquer recursion.',
      coords: { x: 32, y: 68 },
      icon: 'shield',
      primaryColor: '#10B981',
      skills: ['LIFO Stacks', 'Parentheses Invariants', 'Recursion Tree']
    },
    {
      id: 'node-3',
      order: 3,
      title: 'Binary Arbor',
      realmName: 'High Grove of Hierarchies',
      category: 'Trees & BSTs',
      difficulty: 'intermediate',
      status: 'active',
      stars: 1,
      xpReward: 300,
      problemId: 'p4', // Invert Binary Tree
      lore: 'Traverse root-to-leaf paths, compute tree depths, and manipulate left-right mirror nodes.',
      coords: { x: 50, y: 28 },
      icon: 'target',
      primaryColor: '#FF5A43',
      skills: ['DFS Pre/Post-Order', 'BST Validations', 'Mirror Inversion']
    },
    {
      id: 'node-4',
      order: 4,
      title: 'Matrix Catacombs',
      realmName: 'Subterranean Graph Labyrinth',
      category: 'Graph Theory',
      difficulty: 'intermediate',
      status: 'active',
      stars: 0,
      xpReward: 400,
      problemId: 'p7', // Course Schedule
      lore: 'Detect cycles in directed dependency networks and find shortest paths across weighted matrices.',
      coords: { x: 68, y: 65 },
      icon: 'cpu',
      primaryColor: '#F59E0B',
      skills: ['Topological Sort', 'BFS Queue Traversal', 'Cycle Detection']
    },
    {
      id: 'node-5',
      order: 5,
      title: 'Dynamic Pinnacle',
      realmName: 'Tower of Optimal Substructures',
      category: 'Dynamic Programming',
      difficulty: 'advanced',
      status: 'locked',
      stars: 0,
      xpReward: 550,
      problemId: 'p6', // Trapping Rain Water
      lore: 'Formulate state transitions, memoize overlapping subproblems, and master monotonic stacks.',
      coords: { x: 84, y: 35 },
      icon: 'trophy',
      primaryColor: '#8B5CF6',
      skills: ['Memoization Tables', '2D Subproblems', 'Boundary Monotonicity']
    },
    {
      id: 'node-boss',
      order: 6,
      title: 'The Gauntlet Boss',
      realmName: 'Ascendant Apex Arena',
      category: 'Master Boss Quest',
      difficulty: 'advanced',
      status: 'locked',
      stars: 0,
      xpReward: 1000,
      problemId: 'p9', // Word Ladder
      lore: 'The supreme test of multi-stage problem solving, algorithmic optimization, and runtime mastery.',
      coords: { x: 94, y: 72 },
      icon: 'swords',
      primaryColor: '#FF5A43',
      skills: ['Bidirectional BFS', 'State Transitions', 'Runtime Optimization']
    }
  ];

  const [selectedNode, setSelectedNode] = useState<QuestNode>(initialNodes[2]); // Default active node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleNodeClick = (node: QuestNode) => {
    setSelectedNode(node);
    playQuestNodeSound(node.order);
  };

  const getAssociatedProblem = (problemId?: string): Problem | undefined => {
    if (!problemId) return undefined;
    return problems.find(p => p.id === problemId) || problems[0];
  };

  const activeProblem = getAssociatedProblem(selectedNode.problemId);

  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'zap':
        return <Zap className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'swords':
        return <Swords className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Quest HUD Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0c0c14]/90 border border-[#222232] backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#FF5A43]/15 border border-[#FF5A43]/30 text-[#FF5A43]">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF8570] font-bold">
                Arcade Quest Map • Season 04
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PATHWAYS SYNCHRONIZED
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Algorithmic Expedition Trail
            </h2>
          </div>
        </div>

        {/* Quick Campaign Stats */}
        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-2 rounded-2xl bg-[#141420] border border-[#262638] text-right">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Total Bounties</span>
            <strong className="text-sm font-bold font-mono text-emerald-400">+2,600 XP Available</strong>
          </div>
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#FF5A43] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Trial</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Quest Map Stage */}
      <div className="relative rounded-3xl border border-[#26263a] bg-[#07070d] overflow-hidden shadow-2xl p-4 sm:p-8 min-h-[440px] flex flex-col justify-between">
        {/* Deep Cyber Mesh Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141422_1px,transparent_1px),linear-gradient(to_bottom,#141422_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Floating Ambient Nebulas */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#FF5A43]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-[130px] pointer-events-none" />

        {/* SVG Conduit Paths Connecting Nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="pathGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#FF5A43" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="pathGradientLocked" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#333348" />
              <stop offset="100%" stopColor="#222230" />
            </linearGradient>
            <filter id="conduitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connect node-1 to node-2 */}
          <path
            d="M 14% 32% Q 22% 55%, 32% 68%"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse"
          />

          {/* Connect node-2 to node-3 (Active quest energy beam) */}
          <path
            d="M 32% 68% Q 40% 45%, 50% 28%"
            fill="none"
            stroke="url(#pathGradientActive)"
            strokeWidth="4"
            filter="url(#conduitGlow)"
          />

          {/* Connect node-3 to node-4 */}
          <path
            d="M 50% 28% Q 60% 48%, 68% 65%"
            fill="none"
            stroke="#FF5A43"
            strokeWidth="3"
            strokeDasharray="5 5"
          />

          {/* Connect node-4 to node-5 */}
          <path
            d="M 68% 65% Q 76% 50%, 84% 35%"
            fill="none"
            stroke="url(#pathGradientLocked)"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />

          {/* Connect node-5 to node-boss */}
          <path
            d="M 84% 35% Q 89% 55%, 94% 72%"
            fill="none"
            stroke="url(#pathGradientLocked)"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Nodes Layer */}
        <div className="relative z-20 w-full h-80 sm:h-96">
          {initialNodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const isHovered = hoveredNodeId === node.id;

            return (
              <div
                key={node.id}
                id={`quest-map-node-${node.id}`}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => {
                  setHoveredNodeId(node.id);
                  playTickSound(750);
                }}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  left: `${node.coords.x}%`,
                  top: `${node.coords.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute cursor-pointer select-none group flex flex-col items-center"
              >
                {/* Outer Ripple Radar Wave for Active Node */}
                {node.status === 'active' && (
                  <div className="absolute -inset-4 rounded-full bg-[#FF5A43]/20 animate-ping pointer-events-none" />
                )}

                {/* Interactive Node Orb */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl relative ${
                    isSelected
                      ? 'ring-4 ring-[#FF5A43] ring-offset-4 ring-offset-[#07070d] scale-110'
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      node.status === 'completed'
                        ? '#0c2419'
                        : node.status === 'active'
                        ? '#221114'
                        : '#12121c',
                    borderColor:
                      node.status === 'completed'
                        ? '#10B981'
                        : node.status === 'active'
                        ? '#FF5A43'
                        : '#2c2c3d',
                    borderWidth: '2px',
                    boxShadow:
                      isSelected || isHovered
                        ? `0 0 30px ${node.primaryColor}60, inset 0 0 15px ${node.primaryColor}30`
                        : `0 10px 20px rgba(0,0,0,0.6)`
                  }}
                >
                  {/* Status Badge in Node Corner */}
                  <div className="absolute -top-1.5 -right-1.5 z-30">
                    {node.status === 'completed' ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </div>
                    ) : node.status === 'active' ? (
                      <div className="w-5 h-5 rounded-full bg-[#FF5A43] text-white flex items-center justify-center shadow-md animate-bounce">
                        <Flame className="w-3 h-3 fill-current" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Node Main Icon */}
                  <div style={{ color: node.primaryColor }}>
                    {renderIcon(node.icon, 'w-6 h-6 sm:w-7 sm:h-7')}
                  </div>
                </motion.div>

                {/* Node Label Below */}
                <div className="mt-2 text-center pointer-events-none">
                  <span className="block text-xs font-bold text-white tracking-tight drop-shadow-md whitespace-nowrap">
                    {node.title}
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-0.5">
                    {node.status === 'completed' ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        Mastered
                      </span>
                    ) : node.status === 'active' ? (
                      <span className="text-[10px] font-mono text-[#FF8570] font-bold">
                        Active Quest
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Legend Footer */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1c1c2b] text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Mastered Sector</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A43] animate-pulse" />
              <span>Current Exploration</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Locked Sector</span>
            </span>
          </div>
          <span className="text-slate-500 hidden sm:inline">Click any node to open Mission Briefing</span>
        </div>
      </div>

      {/* Active Node Mission Briefing 3D Tilt Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedNode.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          <TiltCard3D
            id="quest-node-mission-briefing-card"
            maxTilt={6}
            glowColor={selectedNode.primaryColor}
            className="rounded-3xl border border-[#28283c] bg-[#0c0c16]/95 p-6 sm:p-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider"
                    style={{
                      backgroundColor: `${selectedNode.primaryColor}20`,
                      color: selectedNode.primaryColor,
                      border: `1px solid ${selectedNode.primaryColor}40`
                    }}
                  >
                    Quest 0{selectedNode.order} • {selectedNode.category}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#141422] text-slate-300 border border-[#272738]">
                    {selectedNode.difficulty.toUpperCase()} TIER
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>+{selectedNode.xpReward} XP BOUNTY</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
                    <span>{selectedNode.title}</span>
                    <span className="text-slate-500 text-lg font-normal">— {selectedNode.realmName}</span>
                  </h3>
                  <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                    {selectedNode.lore}
                  </p>
                </div>

                {/* Skills Targeted */}
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <span className="text-xs font-mono text-slate-400">Target Algorithmic Invariants:</span>
                  {selectedNode.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#141420] text-slate-200 border border-[#262638] font-mono"
                    >
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Action Button & Problem Teleport */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[240px]">
                {activeProblem ? (
                  <button
                    id="quest-node-launch-problem-btn"
                    onClick={() => onSelectProblem(activeProblem)}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] via-[#FF6F59] to-[#FF8570] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-xl shadow-[#FF5A43]/25 transition-all flex items-center justify-center space-x-2.5 cursor-pointer hover:scale-[1.02]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Mission: {activeProblem.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenAiGenerator}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-xs bg-[#161624] hover:bg-[#1e1e30] text-slate-200 border border-[#2d2d42] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#FF5A43]" />
                    <span>Generate Trial via AI</span>
                  </button>
                )}

                <div className="p-3 rounded-xl bg-[#090910] border border-[#1e1e2c] text-center">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Telemetry: {selectedNode.status === 'completed' ? 'Sector Solved' : 'Recommended For Your Level'}
                  </span>
                  <strong className="text-xs font-mono text-emerald-400">
                    {selectedNode.status === 'completed' ? '⭐⭐⭐ All 3 Stars Claimed' : '⭐⭐☆ 1 Star Achieved'}
                  </strong>
                </div>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
