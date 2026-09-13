// Comprehensive Master Badge & Achievement System Engine

export type BadgeRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type BadgeCategory = 'streak' | 'solved_count' | 'difficulty' | 'mastery' | 'speed';

export interface BadgeDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  tier: string;
  iconName: string;
  color: string;
  borderColor: string;
  glowColor: string;
  xpReward: number;
  metricType: 'streakDays' | 'totalSolved' | 'basicSolved' | 'intermediateSolved' | 'advancedSolved' | 'firstSolve' | 'cleanExecution';
  targetValue: number;
  lore: string;
}

export interface UserBadgeState extends BadgeDefinition {
  currentValue: number;
  progress: number; // 0 - 100
  isUnlocked: boolean;
  unlockedAt?: string;
}

export const MASTER_BADGES: BadgeDefinition[] = [
  // --- 1. VOLUME / SOLVED COUNT MILESTONES ---
  {
    id: 'badge_first_spark',
    name: 'Genesis Spark',
    title: 'First Code Conquered',
    description: 'Solve your first algorithmic challenge on CodeElevate.',
    category: 'solved_count',
    rarity: 'Common',
    tier: 'Tier I',
    iconName: 'zap',
    color: 'from-emerald-500 to-teal-400',
    borderColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    xpReward: 50,
    metricType: 'firstSolve',
    targetValue: 1,
    lore: 'The initial spark of syntax that awakens the developer within.'
  },
  {
    id: 'badge_algorithm_apprentice',
    name: 'Algorithm Apprentice',
    title: 'Foundation In Motion',
    description: 'Solve 3 algorithmic coding challenges across any category.',
    category: 'solved_count',
    rarity: 'Common',
    tier: 'Tier I',
    iconName: 'compass',
    color: 'from-blue-500 to-cyan-400',
    borderColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    xpReward: 100,
    metricType: 'totalSolved',
    targetValue: 3,
    lore: 'Building the fundamental pathways of computational logic.'
  },
  {
    id: 'badge_tenacious_coder',
    name: 'Tenacious Coder',
    title: 'Problem Solver Initiate',
    description: 'Solve 6 coding challenges to establish steady progress.',
    category: 'solved_count',
    rarity: 'Rare',
    tier: 'Tier II',
    iconName: 'target',
    color: 'from-[#FF5A43] to-[#FF8570]',
    borderColor: '#FF5A43',
    glowColor: 'rgba(255, 90, 67, 0.35)',
    xpReward: 200,
    metricType: 'totalSolved',
    targetValue: 6,
    lore: 'Relentless persistence in converting abstract requirements into passing tests.'
  },
  {
    id: 'badge_double_digit',
    name: 'Algorithm Architect',
    title: 'Double Digit Titan',
    description: 'Reach 10 solved challenges in your student portfolio.',
    category: 'solved_count',
    rarity: 'Epic',
    tier: 'Tier III',
    iconName: 'cpu',
    color: 'from-purple-500 to-indigo-500',
    borderColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    xpReward: 400,
    metricType: 'totalSolved',
    targetValue: 10,
    lore: 'Mastery of design patterns and scalable algorithmic architectures.'
  },

  // --- 2. DAILY STREAK MILESTONES ---
  {
    id: 'badge_streak_3',
    name: 'Ignition Spark',
    title: '3-Day Practice Habit',
    description: 'Maintain an active coding streak for 3 consecutive days.',
    category: 'streak',
    rarity: 'Common',
    tier: 'Tier I',
    iconName: 'flame',
    color: 'from-amber-500 to-orange-400',
    borderColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    xpReward: 75,
    metricType: 'streakDays',
    targetValue: 3,
    lore: 'Consistency builds momentum. The first milestone towards deep mastery.'
  },
  {
    id: 'badge_streak_7',
    name: 'Weekly Titan',
    title: '7-Day Unbroken Momentum',
    description: 'Maintain a perfect coding streak across a full 7-day cycle.',
    category: 'streak',
    rarity: 'Rare',
    tier: 'Tier II',
    iconName: 'flame',
    color: 'from-rose-500 to-[#FF5A43]',
    borderColor: '#F43F5E',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    xpReward: 250,
    metricType: 'streakDays',
    targetValue: 7,
    lore: 'Seven continuous sunsets of problem-solving without breaking the chain.'
  },
  {
    id: 'badge_streak_14',
    name: 'Fortnight Vanguard',
    title: '14-Day Iron Will',
    description: 'Sustain an active streak for two straight weeks (14 days).',
    category: 'streak',
    rarity: 'Epic',
    tier: 'Tier III',
    iconName: 'crown',
    color: 'from-amber-400 via-rose-500 to-[#FF5A43]',
    borderColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    xpReward: 600,
    metricType: 'streakDays',
    targetValue: 14,
    lore: 'An unbreakable discipline that separates casual coders from industry leaders.'
  },

  // --- 3. DIFFICULTY TIER MILESTONES ---
  {
    id: 'badge_tier_basic',
    name: 'Foundation Forger',
    title: 'Basic Tier Adept',
    description: 'Solve 3 Basic difficulty challenges with passing test cases.',
    category: 'difficulty',
    rarity: 'Common',
    tier: 'Tier I',
    iconName: 'shield',
    color: 'from-emerald-400 to-teal-500',
    borderColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    xpReward: 100,
    metricType: 'basicSolved',
    targetValue: 3,
    lore: 'Rock-solid fundamentals across syntax, iteration, and conditional logic.'
  },
  {
    id: 'badge_tier_intermediate',
    name: 'Median Slayer',
    title: 'Intermediate Conqueror',
    description: 'Solve 3 Intermediate difficulty problems (Arrays, Graphs, Trees).',
    category: 'difficulty',
    rarity: 'Rare',
    tier: 'Tier II',
    iconName: 'award',
    color: 'from-amber-500 to-[#FF5A43]',
    borderColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    xpReward: 250,
    metricType: 'intermediateSolved',
    targetValue: 3,
    lore: 'Conquering the core of technical interview algorithmic benchmarks.'
  },
  {
    id: 'badge_tier_advanced',
    name: 'Apex Conqueror',
    title: 'Advanced Boss Raider',
    description: 'Conquer at least 1 Advanced difficulty challenge.',
    category: 'difficulty',
    rarity: 'Legendary',
    tier: 'Tier III',
    iconName: 'trophy',
    color: 'from-[#FF5A43] via-purple-500 to-pink-500',
    borderColor: '#FF5A43',
    glowColor: 'rgba(255, 90, 67, 0.4)',
    xpReward: 500,
    metricType: 'advancedSolved',
    targetValue: 1,
    lore: 'Defeating complex algorithmic bosses that intimidate standard practitioners.'
  },
  {
    id: 'badge_mythic_titan',
    name: 'Mythic Overlord',
    title: 'Apex Problem Solver',
    description: 'Conquer 3 Advanced difficulty challenges.',
    category: 'difficulty',
    rarity: 'Mythic',
    tier: 'Mythic Elite',
    iconName: 'crown',
    color: 'from-violet-500 via-[#FF5A43] to-amber-400',
    borderColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    xpReward: 1000,
    metricType: 'advancedSolved',
    targetValue: 3,
    lore: 'Ascended to the highest realm of computational prowess.'
  },

  // --- 4. MASTERY & SPECIAL ACCOMPLISHMENTS ---
  {
    id: 'badge_flawless_execution',
    name: 'Flawless Execution',
    title: 'Zero-Defect Code',
    description: 'Pass all test cases on a problem submission with 100% test accuracy.',
    category: 'mastery',
    rarity: 'Rare',
    tier: 'Tier II',
    iconName: 'sparkles',
    color: 'from-cyan-400 to-blue-500',
    borderColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    xpReward: 150,
    metricType: 'cleanExecution',
    targetValue: 1,
    lore: 'Precision engineering where every edge case is anticipated in the first strike.'
  }
];

export interface EvaluatedMetrics {
  streakDays: number;
  totalSolved: number;
  basicSolved: number;
  intermediateSolved: number;
  advancedSolved: number;
  firstSolve: number;
  cleanExecution: number;
}

export function computeStudentMetrics(
  user: any,
  submissions: any[],
  problems: any[]
): EvaluatedMetrics {
  const userSolvedSet = new Set<string>();

  // 1. Gather solved problem IDs from user profile and accepted submissions
  if (Array.isArray(user?.solvedProblems)) {
    user.solvedProblems.forEach((id: string) => userSolvedSet.add(String(id)));
  }

  const passedSubs = submissions.filter(
    s => s.status === 'Passed' || s.status === 'accepted'
  );

  passedSubs.forEach(s => {
    if (s.problemId) userSolvedSet.add(String(s.problemId));
  });

  const totalSolved = Math.max(userSolvedSet.size, user?.totalSolved || 0);

  // 2. Count difficulty breakdowns among solved problems
  let basicSolved = 0;
  let intermediateSolved = 0;
  let advancedSolved = 0;

  userSolvedSet.forEach(pId => {
    const prob = problems.find(p => String(p.id) === pId || String(p.slug) === pId);
    if (prob) {
      if (prob.difficulty === 'basic') basicSolved++;
      else if (prob.difficulty === 'intermediate') intermediateSolved++;
      else if (prob.difficulty === 'advanced') advancedSolved++;
    }
  });

  // Check for clean executions
  const hasCleanExecution = passedSubs.some(
    s => s.passedCases > 0 && s.passedCases === s.totalCases
  );

  const streakDays = user?.streakDays || 1;

  return {
    streakDays,
    totalSolved,
    basicSolved,
    intermediateSolved,
    advancedSolved,
    firstSolve: totalSolved >= 1 ? 1 : 0,
    cleanExecution: hasCleanExecution || totalSolved > 0 ? 1 : 0
  };
}

export function computeUserBadges(
  user: any,
  submissions: any[] = [],
  problems: any[] = []
): { badges: UserBadgeState[]; totalEarnedXp: number; unlockedCount: number } {
  const metrics = computeStudentMetrics(user, submissions, problems);

  // Parse already earned badges from user
  const earnedMap = new Map<string, string>(); // badgeId -> unlockedAt
  if (Array.isArray(user?.earnedBadges)) {
    user.earnedBadges.forEach((entry: any) => {
      if (typeof entry === 'string') {
        earnedMap.set(entry, user.createdAt || new Date().toISOString());
      } else if (entry && typeof entry === 'object' && entry.badgeId) {
        earnedMap.set(entry.badgeId, entry.unlockedAt || new Date().toISOString());
      }
    });
  }

  let totalEarnedXp = 0;
  let unlockedCount = 0;

  const badges: UserBadgeState[] = MASTER_BADGES.map(def => {
    let metricValue = 0;
    switch (def.metricType) {
      case 'streakDays':
        metricValue = metrics.streakDays;
        break;
      case 'totalSolved':
        metricValue = metrics.totalSolved;
        break;
      case 'basicSolved':
        metricValue = metrics.basicSolved;
        break;
      case 'intermediateSolved':
        metricValue = metrics.intermediateSolved;
        break;
      case 'advancedSolved':
        metricValue = metrics.advancedSolved;
        break;
      case 'firstSolve':
        metricValue = metrics.firstSolve;
        break;
      case 'cleanExecution':
        metricValue = metrics.cleanExecution;
        break;
      default:
        metricValue = 0;
    }

    const wasPreviouslyEarned = earnedMap.has(def.id);
    const meetsRequirement = metricValue >= def.targetValue;
    const isUnlocked = wasPreviouslyEarned || meetsRequirement;

    const currentValue = isUnlocked ? def.targetValue : Math.min(metricValue, def.targetValue);
    const progress = isUnlocked ? 100 : Math.min(100, Math.round((currentValue / def.targetValue) * 100));

    if (isUnlocked) {
      unlockedCount++;
      totalEarnedXp += def.xpReward;
    }

    const unlockedAt = earnedMap.get(def.id) || (meetsRequirement ? new Date().toISOString() : undefined);

    return {
      ...def,
      currentValue,
      progress,
      isUnlocked,
      unlockedAt
    };
  });

  return { badges, totalEarnedXp, unlockedCount };
}

export function evaluateNewlyUnlockedBadges(
  user: any,
  submissions: any[],
  problems: any[]
): {
  newlyUnlocked: UserBadgeState[];
  allBadges: UserBadgeState[];
  updatedEarnedBadges: Array<{ badgeId: string; unlockedAt: string }>;
} {
  const earnedSet = new Set<string>();
  const updatedEarnedBadges: Array<{ badgeId: string; unlockedAt: string }> = [];

  if (Array.isArray(user?.earnedBadges)) {
    user.earnedBadges.forEach((entry: any) => {
      const id = typeof entry === 'string' ? entry : entry?.badgeId;
      const at = typeof entry === 'string' ? user.createdAt || new Date().toISOString() : entry?.unlockedAt;
      if (id) {
        earnedSet.add(id);
        updatedEarnedBadges.push({ badgeId: id, unlockedAt: at || new Date().toISOString() });
      }
    });
  }

  const { badges } = computeUserBadges(user, submissions, problems);
  const newlyUnlocked: UserBadgeState[] = [];

  badges.forEach(badge => {
    if (badge.isUnlocked && !earnedSet.has(badge.id)) {
      newlyUnlocked.push(badge);
      earnedSet.add(badge.id);
      updatedEarnedBadges.push({
        badgeId: badge.id,
        unlockedAt: badge.unlockedAt || new Date().toISOString()
      });
    }
  });

  return {
    newlyUnlocked,
    allBadges: badges,
    updatedEarnedBadges
  };
}
