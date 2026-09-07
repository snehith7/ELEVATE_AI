export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export type UserRole = 'student' | 'admin';

export type SupportedLanguage = 'javascript' | 'python' | 'typescript' | 'java' | 'cpp' | 'go';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage: SupportedLanguage;
  targetGoal: string;
  streakDays: number;
  totalSolved: number;
  createdAt: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: Record<SupportedLanguage, string>;
  testCases: TestCase[];
  hints: string[];
  tags: string[];
  isAiGenerated?: boolean;
  generatedReason?: string;
  acceptanceRate?: number;
  solvedByCurrentUser?: boolean;
}

export interface AiCodeReview {
  correctnessScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  edgeCasesCovered: string[];
  edgeCasesMissed: string[];
  suggestedOptimizedSnippet?: string;
}

export interface Submission {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  problemId: string;
  problemTitle: string;
  difficulty: Difficulty;
  category: string;
  code: string;
  language: SupportedLanguage;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit';
  passedCases: number;
  totalCases: number;
  executionTimeMs: number;
  memoryKb: number;
  testResults: {
    testId: string;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    error?: string;
  }[];
  errorDetails?: string;
  aiReview?: AiCodeReview;
  createdAt: string;
}

export interface IdentifiedMistake {
  type: string;
  category: string;
  count: number;
  lastSeen: string;
  advice: string;
  severity: 'low' | 'medium' | 'high';
}

export interface RecommendedFocus {
  title: string;
  difficulty: Difficulty;
  category: string;
  reason: string;
  problemId?: string;
}

export interface UserAnalytics {
  userId: string;
  totalSolved: number;
  totalAttempted: number;
  accuracyRate: number;
  difficultyBreakdown: {
    basic: { solved: number; total: number };
    intermediate: { solved: number; total: number };
    advanced: { solved: number; total: number };
  };
  categoryMastery: {
    category: string;
    solved: number;
    total: number;
    percent: number;
    status: 'needs_focus' | 'improving' | 'mastered';
  }[];
  identifiedMistakes: IdentifiedMistake[];
  weakTopics: string[];
  strongTopics: string[];
  recommendedFocusList: RecommendedFocus[];
  recentActivity: {
    date: string;
    count: number;
    passed: number;
  }[];
}

export interface CommunityMessage {
  id: string;
  channel: 'general' | 'algorithms' | 'interview-prep';
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'mentor' | 'admin' | 'ai';
  text: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  reactions?: Record<string, number>;
  createdAt: string;
}

export type AnalyticsReport = UserAnalytics;

export interface AdminStudentMetric {
  id: string;
  username: string;
  email: string;
  role: string;
  skillLevel: string;
  preferredLanguage: string;
  targetGoal: string;
  streakDays: number;
  totalSolved: number;
  totalSubmissions: number;
  passRate: number;
  struggleCategories: string[];
  lastActive: string;
}

export interface AdminOverview {
  metrics: {
    totalStudents: number;
    totalProblems: number;
    totalSubmissions: number;
    overallPassRate: number;
    aiProblemsGenerated: number;
  };
  students: AdminStudentMetric[];
  recentSubmissions: Submission[];
}

export interface DatabaseStatus {
  connected: boolean;
  type: 'mongodb_atlas' | 'mongodb_local' | 'mongodb_embedded_engine';
  uriConfigured: boolean;
  maskedUri?: string;
  collectionsCount: {
    users: number;
    problems: number;
    submissions: number;
    messages: number;
  };
  latencyMs: number;
  statusMessage: string;
  lastError?: string;
}
