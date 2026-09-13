import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { dbManager } from './db';
import { seedInitialData } from './seed';
import { executeSandboxedCode } from './sandbox';
import { sendVerificationEmail } from './email';
import {
  generatePersonalizedProblem,
  reviewUserCode,
  chatWithCodingTutor,
  analyzeMistakesAndRecommend
} from './gemini';
import {
  computeUserBadges,
  evaluateNewlyUnlockedBadges,
  computeStudentMetrics
} from './badges';

export const apiRouter = Router();

// Helper to strip sensitive auth fields from user document
export function sanitizeUser(user: any): any {
  if (!user) return null;
  const { password: _, verificationOtp: __, verificationOtpExpiresAt: ___, ...safeUser } = user;
  return safeUser;
}

// Secure Password Hashing & Verification Utilities
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const originalHash = parts[2];
    try {
      const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
      return crypto.timingSafeEqual(
        Buffer.from(derivedHash, 'hex'),
        Buffer.from(originalHash, 'hex')
      );
    } catch {
      return false;
    }
  }
  // Plain text fallback for initial seeded default accounts
  return storedHash === password;
}

// In-memory cache for student analytics evaluations to avoid redundant AI queries
const analysisCache = new Map<string, { lastSubCount: number; data: any; timestamp: number }>();

// Helper to get authorization token/userId
export function getUserIdFromReq(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1].trim();
  }
  if (req.headers['x-user-id']) {
    return (req.headers['x-user-id'] as string).trim();
  }
  if (req.headers['x-auth-token']) {
    return (req.headers['x-auth-token'] as string).trim();
  }
  if (req.query && req.query.token) {
    return (req.query.token as string).trim();
  }
  if (req.query && req.query.userId) {
    return (req.query.userId as string).trim();
  }
  return '';
}

// Helper to look up active authenticated user
export async function getAuthUser(req: Request): Promise<any | null> {
  const userId = getUserIdFromReq(req);
  if (!userId) return null;
  const usersCol = dbManager.getCollection('users');
  return await usersCol.findOne({
    $or: [{ id: userId }, { email: userId.toLowerCase() }]
  });
}

// RBAC Middleware: Enforce access based on user role
export function requireRole(allowedRoles: ('student' | 'faculty' | 'admin')[]) {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({
          error: 'Authentication required. Please provide a valid authorization token in headers.'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: `Access denied. Role '${user.role}' is not authorized. Required role(s): ${allowedRoles.join(' or ')}.`
        });
      }

      (req as any).authenticatedUser = user;
      (req as any).user = user;
      (req as any).userId = user.id;
      next();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}

// -------------------------------------------------------------
// AUTH & USER PROFILE ROUTES
// -------------------------------------------------------------

// Student Dedicated Login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({
      $or: [
        { email: normalizedEmail },
        { username: email.trim() }
      ]
    });

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid student email or password.' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({
        error: `Access denied. This account is registered as '${user.role.toUpperCase()}'. Please sign in through the ${user.role === 'faculty' ? 'Faculty Portal' : 'Admin Portal'}.`
      });
    }

    // Check if account has verified their email address
    if (user.status === 'PendingVerification' || (user.isVerified === false && user.role === 'student')) {
      // Re-send / ensure OTP is active so they can verify immediately
      let otp = user.verificationOtp;
      const isExpired = !user.verificationOtpExpiresAt || new Date(user.verificationOtpExpiresAt).getTime() < Date.now();
      if (!otp || isExpired) {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await usersCol.updateOne(
          { id: user.id },
          {
            $set: {
              verificationOtp: otp,
              verificationOtpExpiresAt: expiresAt
            }
          }
        );
        sendVerificationEmail(user.email, otp, user.username).catch(err =>
          console.warn('Background email send on login notice:', err.message)
        );
      }

      return res.status(403).json({
        error: 'Your email address has not been verified yet. Please enter the 6-digit verification code to activate your account.',
        requiresVerification: true,
        email: user.email,
        userId: user.id
      });
    }

    return res.json({
      token: user.id,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Faculty Dedicated Login
apiRouter.post('/faculty/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Faculty email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({
      $or: [
        { email: normalizedEmail },
        { username: email.trim() }
      ]
    });

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid faculty email or password.' });
    }

    if (user.role !== 'faculty') {
      return res.status(403).json({
        error: `Access denied. This account is registered as '${user.role.toUpperCase()}'. Please sign in through the ${user.role === 'admin' ? 'Admin Portal' : 'Student Portal'}.`
      });
    }

    return res.json({
      token: user.id,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// New User Registration with 6-Digit OTP Email Verification
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, skillLevel, preferredLanguage, targetGoal, batch } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const usersCol = dbManager.getCollection('users');
    const normalizedEmail = email.trim().toLowerCase();

    // Generate cryptographically random 6-digit OTP code (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10-minute expiration

    const existing = await usersCol.findOne({ email: normalizedEmail });
    if (existing) {
      // If user account is already fully verified, return error
      if (existing.status === 'Verified' || existing.isVerified) {
        return res.status(400).json({ error: 'An active student account with this email already exists. Please sign in.' });
      }

      // If user started registration earlier but has not yet verified, refresh OTP and re-dispatch
      const initialPassword = password || 'defaultpass';
      await usersCol.updateOne(
        { id: existing.id },
        {
          $set: {
            username: username?.trim() || existing.username || normalizedEmail.split('@')[0],
            password: hashPassword(initialPassword),
            skillLevel: skillLevel || existing.skillLevel || 'intermediate',
            preferredLanguage: preferredLanguage || existing.preferredLanguage || 'javascript',
            targetGoal: targetGoal || existing.targetGoal || 'Elevate my software development and coding interview skills',
            status: 'PendingVerification',
            isVerified: false,
            emailVerified: false,
            verificationOtp: otp,
            verificationOtpExpiresAt: expiresAt,
            updatedAt: new Date().toISOString()
          }
        }
      );

      // Dispatch verification email via Resend
      await sendVerificationEmail(normalizedEmail, otp, username?.trim() || existing.username);

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email: normalizedEmail,
        userId: existing.id,
        message: `A fresh 6-digit verification code has been sent to ${normalizedEmail}. Please enter the code to activate your account.`
      });
    }

    const initialPassword = password || 'defaultpass';
    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: username?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: hashPassword(initialPassword),
      role: 'student',
      batch: batch || 'Batch 2026-A',
      skillLevel: skillLevel || 'beginner',
      preferredLanguage: preferredLanguage || 'javascript',
      targetGoal: targetGoal || 'Elevate my software development and coding interview skills',
      streakDays: 0,
      totalSolved: 0,
      status: 'PendingVerification',
      isVerified: false,
      emailVerified: false,
      verificationOtp: otp,
      verificationOtpExpiresAt: expiresAt,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore and local persistent store
    await usersCol.insertOne(newUser);

    // Dispatch verification email via Resend (with test fallback / server console log)
    await sendVerificationEmail(normalizedEmail, otp, newUser.username);

    // Do NOT return login token: require OTP email verification step first
    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email: normalizedEmail,
      userId: newUser.id,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please enter the code to verify your account.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Verify 6-Digit Email OTP Endpoint
apiRouter.post('/auth/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, code, userId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Please enter the 6-digit verification code.' });
    }

    const trimmedCode = String(code).trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      return res.status(400).json({ error: 'Verification code must be exactly 6 digits.' });
    }

    const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
    const usersCol = dbManager.getCollection('users');

    const filter: any = normalizedEmail
      ? { email: normalizedEmail }
      : (userId ? { id: userId } : null);

    if (!filter) {
      return res.status(400).json({ error: 'Email address is required for verification.' });
    }

    const user = await usersCol.findOne(filter);
    if (!user) {
      return res.status(404).json({ error: 'No account found matching this email address.' });
    }

    // Check if account is already verified
    if (user.status === 'Verified' && user.isVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Account is already verified. Logging you in...',
        token: user.id,
        user: sanitizeUser(user)
      });
    }

    // Check if entered OTP matches
    if (!user.verificationOtp || user.verificationOtp !== trimmedCode) {
      return res.status(400).json({
        error: 'Invalid verification code. Please check your email or request a new code.'
      });
    }

    // Check expiration (10 minutes)
    if (user.verificationOtpExpiresAt) {
      const expiresAt = new Date(user.verificationOtpExpiresAt).getTime();
      if (Date.now() > expiresAt) {
        return res.status(400).json({
          error: 'Verification code has expired (10-minute limit exceeded). Please click "Resend Code" to receive a fresh code.',
          expired: true
        });
      }
    }

    // Mark account as Verified in Firestore and database
    await usersCol.updateOne(
      { id: user.id },
      {
        $set: {
          status: 'Verified',
          isVerified: true,
          emailVerified: true,
          verifiedAt: new Date().toISOString()
        },
        $unset: {
          verificationOtp: 1,
          verificationOtpExpiresAt: 1
        }
      }
    );

    const updatedUser = await usersCol.findOne({ id: user.id }) || {
      ...user,
      status: 'Verified',
      isVerified: true,
      emailVerified: true
    };

    console.log(`🎉 Student email verified successfully: ${user.email} (${user.id})`);

    // Grant access with authenticated session token
    return res.json({
      success: true,
      message: 'Email successfully verified! Welcome to LrnKod.',
      token: updatedUser.id,
      user: sanitizeUser(updatedUser)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Resend 6-Digit Email OTP Endpoint
apiRouter.post('/auth/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ error: 'No student account found with this email.' });
    }

    if (user.status === 'Verified' && user.isVerified) {
      return res.status(400).json({ error: 'This account is already verified. You can sign in directly.' });
    }

    // Generate fresh 6-digit OTP code & new 10-minute expiry
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await usersCol.updateOne(
      { id: user.id },
      {
        $set: {
          verificationOtp: newOtp,
          verificationOtpExpiresAt: newExpiresAt,
          updatedAt: new Date().toISOString()
        }
      }
    );

    // Send email
    await sendVerificationEmail(normalizedEmail, newOtp, user.username);

    return res.json({
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${normalizedEmail}.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Change Own Password (for Student, Faculty, or Admin)
apiRouter.post('/auth/change-password', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req) || req.body.userId || req.body.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to update password.' });
    }

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required.' });
    }

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Securely verify old password (supports both hashed and legacy plain passwords)
    if (user.password && !verifyPassword(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect. Please verify your existing password.' });
    }

    // Hash the new password securely
    const hashedPassword = hashPassword(newPassword);
    await usersCol.updateOne(
      { id: userId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    return res.json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const usersCol = dbManager.getCollection('users');
    const submissionsCol = dbManager.getCollection('submissions');
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No session provided' });
    }

    const user = await usersCol.findOne({ $or: [{ id: userId }, { email: userId }] });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Synchronize solved problems list with accepted submissions to guarantee data consistency
    const passedSubs = await submissionsCol.find({
      $or: [{ userId: user.id }, { userId }]
    }).toArray();
    const passedProblemIds = new Set<string>(Array.isArray(user.solvedProblems) ? user.solvedProblems : []);
    passedSubs
      .filter((s: any) => s.status === 'Passed' || s.status === 'accepted')
      .forEach((s: any) => {
        if (s.problemId) passedProblemIds.add(s.problemId);
        if (s.problemSlug) passedProblemIds.add(s.problemSlug);
      });

    const synchronizedSolved = Array.from(passedProblemIds);
    const calculatedTotalSolved = Math.max(user.totalSolved || 0, synchronizedSolved.length);

    // Synchronize earned badges
    const problemsCol = dbManager.getCollection('problems');
    const allProblems = await problemsCol.find({}).toArray();
    const { allBadges, updatedEarnedBadges } = evaluateNewlyUnlockedBadges(
      { ...user, solvedProblems: synchronizedSolved, totalSolved: calculatedTotalSolved },
      passedSubs,
      allProblems
    );

    if (
      synchronizedSolved.length !== (user.solvedProblems?.length || 0) ||
      calculatedTotalSolved !== (user.totalSolved || 0) ||
      (updatedEarnedBadges.length !== (user.earnedBadges?.length || 0))
    ) {
      await usersCol.updateOne(
        { id: user.id },
        {
          $set: {
            solvedProblems: synchronizedSolved,
            totalSolved: calculatedTotalSolved,
            earnedBadges: updatedEarnedBadges
          }
        }
      );
      user.solvedProblems = synchronizedSolved;
      user.totalSolved = calculatedTotalSolved;
      user.earnedBadges = updatedEarnedBadges;
    }

    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/auth/profile', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const usersCol = dbManager.getCollection('users');
    const { skillLevel, preferredLanguage, targetGoal, username, batch } = req.body;

    await usersCol.updateOne(
      { id: userId },
      {
        $set: {
          ...(skillLevel && { skillLevel }),
          ...(preferredLanguage && { preferredLanguage }),
          ...(targetGoal && { targetGoal }),
          ...(username && { username }),
          ...(batch && { batch })
        }
      }
    );

    const updated = await usersCol.findOne({ id: userId });
    const { password: _, ...safeUser } = updated || {};
    return res.json(safeUser);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PROBLEMS & ROADMAP ROUTES
// -------------------------------------------------------------
apiRouter.get('/problems', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { difficulty, category, search } = req.query;
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    let filter: any = {};
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    let problems = await problemsCol.find(filter).toArray();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      problems = problems.filter((p: any) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Mark whether solved by current user
    const usersCol = dbManager.getCollection('users');
    let solvedProblemIds = new Set<string>();
    if (userId) {
      const currentUserDoc = await usersCol.findOne({ $or: [{ id: userId }, { email: userId }] });
      if (currentUserDoc && Array.isArray(currentUserDoc.solvedProblems)) {
        currentUserDoc.solvedProblems.forEach((pid: string) => solvedProblemIds.add(pid));
      }

      const userTargetId = currentUserDoc ? currentUserDoc.id : userId;
      const userSubmissions = await submissionsCol.find({
        $or: [{ userId: userTargetId }, { userId }]
      }).toArray();

      userSubmissions
        .filter((s: any) => s.status === 'Passed' || s.status === 'accepted')
        .forEach((s: any) => {
          if (s.problemId) solvedProblemIds.add(s.problemId);
          if (s.problemSlug) solvedProblemIds.add(s.problemSlug);
        });
    }

    const enriched = problems.map((p: any) => ({
      ...p,
      solvedByCurrentUser: solvedProblemIds.has(p.id) || (p.slug ? solvedProblemIds.has(p.slug) : false)
    }));

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/problems/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromReq(req);
    const problemsCol = dbManager.getCollection('problems');
    const usersCol = dbManager.getCollection('users');
    const submissionsCol = dbManager.getCollection('submissions');

    const problem = await problemsCol.findOne({ $or: [{ id }, { slug: id }] });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    let isSolved = false;
    if (userId) {
      const currentUserDoc = await usersCol.findOne({ $or: [{ id: userId }, { email: userId }] });
      if (currentUserDoc && Array.isArray(currentUserDoc.solvedProblems)) {
        if (currentUserDoc.solvedProblems.includes(problem.id) || (problem.slug && currentUserDoc.solvedProblems.includes(problem.slug))) {
          isSolved = true;
        }
      }
      if (!isSolved) {
        const userTargetId = currentUserDoc ? currentUserDoc.id : userId;
        const userSubs = await submissionsCol.find({
          $or: [{ userId: userTargetId }, { userId }],
          problemId: problem.id
        }).toArray();
        if (userSubs.some((s: any) => s.status === 'Passed' || s.status === 'accepted')) {
          isSolved = true;
        }
      }
    }

    return res.json({
      ...problem,
      solvedByCurrentUser: isSolved
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AI Generate Problem Endpoint
apiRouter.post('/problems/generate', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ id: userId });

    const { desiredDifficulty, topicFocus } = req.body;

    // Gather recent mistakes to feed into AI generation
    const submissionsCol = dbManager.getCollection('submissions');
    const recentSubmissions = await submissionsCol.find({ userId }).sort({ createdAt: -1 }).limit(10).toArray();
    const failedSubmissions = recentSubmissions.filter((s: any) => s.status !== 'Passed' && s.status !== 'accepted');
    const weakTopics: string[] = Array.from(new Set(failedSubmissions.map((s: any) => String(s.category))));

    const newProblem = await generatePersonalizedProblem({
      skillLevel: user?.skillLevel || 'intermediate',
      preferredLanguage: user?.preferredLanguage || 'javascript',
      targetGoal: user?.targetGoal,
      weakTopics,
      desiredDifficulty,
      topicFocus
    });

    // Save to problems collection
    const problemsCol = dbManager.getCollection('problems');
    await problemsCol.insertOne(newProblem);

    return res.status(201).json(newProblem);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CODE EXECUTION & PLAYGROUND TEST RUNNER
// -------------------------------------------------------------
apiRouter.post('/code/run', async (req: Request, res: Response) => {
  try {
    const { problemId, code, language, customInput } = req.body;
    const problemsCol = dbManager.getCollection('problems');
    const problem = await problemsCol.findOne({ $or: [{ id: problemId }, { slug: problemId }] });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCasesToRun = customInput
      ? [{ id: 'custom', input: customInput, expectedOutput: '', isHidden: false }]
      : problem.testCases;

    const execution = await executeSandboxedCode(code, language, testCasesToRun, problem);

    return res.json({
      passed: execution.passed,
      passedCount: execution.passedCount,
      totalCount: execution.totalCount,
      executionTimeMs: execution.executionTimeMs,
      memoryKb: execution.memoryKb,
      testResults: execution.testResults,
      compileError: execution.compileError,
      runtimeError: execution.runtimeError,
      stdout: execution.stdout
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CODE SUBMISSION & AI REAL-TIME REVIEW
// -------------------------------------------------------------
apiRouter.post('/code/submit', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { problemId, code, language } = req.body;

    const usersCol = dbManager.getCollection('users');
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    const user = userId ? await usersCol.findOne({ $or: [{ id: userId }, { email: userId }] }) : null;
    const problem = await problemsCol.findOne({ $or: [{ id: problemId }, { slug: problemId }] });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const execution = await executeSandboxedCode(code, language, problem.testCases, problem);
    const results = execution.testResults;
    const passedCount = execution.passedCount;
    const totalCount = execution.totalCount;
    const allPassed = execution.passed;

    // Status flag indicating if it 'Passed' or 'Failed'
    const status: 'Passed' | 'Failed' = allPassed ? 'Passed' : 'Failed';

    // Real-time AI Code Review
    const failedMessages = results
      .filter(r => !r.passed)
      .map(r => `Input: ${r.input} | Expected: ${r.expected} | Got: ${r.actual} | Status: ${r.status}${r.error ? ` | Error: ${r.error}` : ''}`);

    let aiReview = null;
    try {
      aiReview = await reviewUserCode({
        problemTitle: problem.title,
        problemDescription: problem.description,
        code,
        language,
        passedCount,
        totalCount,
        testFailures: failedMessages
      });
    } catch (aiErr) {
      console.warn('AI review error during submission:', aiErr);
    }

    const submission = {
      id: 'sub_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      userId: user ? user.id : (userId || 'usr_student'),
      userEmail: user?.email || '',
      userName: user?.username || 'Student',
      problemId: problem.id,
      problemTitle: problem.title,
      difficulty: problem.difficulty,
      category: problem.category,
      code,
      language,
      status, // 'Passed' or 'Failed'
      passedCases: passedCount,
      totalCases: totalCount,
      executionTimeMs: execution.executionTimeMs,
      memoryKb: execution.memoryKb,
      testResults: results,
      compileError: execution.compileError,
      runtimeError: execution.runtimeError,
      stdout: execution.stdout,
      errorDetails: execution.compileError?.message || execution.runtimeError?.message,
      aiReview,
      createdAt: new Date().toISOString()
    };

    // Every submitted attempt is saved to the database, regardless of whether solution is correct or incorrect
    await submissionsCol.insertOne(submission);

    // Update user stats and mark problem as solved on user profile in database
    if (allPassed && user) {
      const priorSubs = await submissionsCol.find({
        $or: [{ userId: user.id }, { userId }],
        problemId: problem.id
      }).toArray();
      const priorAccepted = priorSubs.some((s: any) =>
        s.id !== submission.id && (s.status === 'Passed' || s.status === 'accepted')
      );

      const currentSolvedList: string[] = Array.isArray(user.solvedProblems) ? [...user.solvedProblems] : [];
      if (!currentSolvedList.includes(problem.id)) {
        currentSolvedList.push(problem.id);
      }
      if (problem.slug && !currentSolvedList.includes(problem.slug)) {
        currentSolvedList.push(problem.slug);
      }

      const uniqueCount = new Set(currentSolvedList).size;
      const updatedTotalSolved = priorAccepted ? (user.totalSolved || uniqueCount) : Math.max((user.totalSolved || 0) + 1, uniqueCount);
      const updatedStreakDays = (user.streakDays || 1) + (priorAccepted ? 0 : 1);

      // Evaluate newly unlocked accolades & badges
      const userAllSubs = await submissionsCol.find({
        $or: [{ userId: user.id }, { userId }]
      }).toArray();
      const allProblems = await problemsCol.find({}).toArray();

      const userStateForBadges = {
        ...user,
        solvedProblems: currentSolvedList,
        totalSolved: updatedTotalSolved,
        streakDays: updatedStreakDays,
        earnedBadges: user.earnedBadges || []
      };

      const { newlyUnlocked, updatedEarnedBadges } = evaluateNewlyUnlockedBadges(
        userStateForBadges,
        userAllSubs,
        allProblems
      );

      await usersCol.updateOne(
        { id: user.id },
        {
          $set: {
            solvedProblems: currentSolvedList,
            totalSolved: updatedTotalSolved,
            streakDays: updatedStreakDays,
            earnedBadges: updatedEarnedBadges
          }
        }
      );

      user.solvedProblems = currentSolvedList;
      user.totalSolved = updatedTotalSolved;
      user.streakDays = updatedStreakDays;
      user.earnedBadges = updatedEarnedBadges;

      // Invalidate user analytics evaluation cache upon new submission
      if (userId) {
        analysisCache.delete(userId);
      }

      return res.status(201).json({
        success: true,
        submission,
        newlyUnlockedBadges: newlyUnlocked || [],
        earnedBadges: updatedEarnedBadges,
        ...submission
      });
    }

    // Invalidate user analytics evaluation cache upon new submission
    if (userId) {
      analysisCache.delete(userId);
    }

    return res.status(201).json({
      success: true,
      submission,
      newlyUnlockedBadges: [],
      earnedBadges: user?.earnedBadges || [],
      ...submission
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SUBMISSIONS RETRIEVAL FOR PLAYGROUND & USER HISTORY
// -------------------------------------------------------------
apiRouter.get('/problems/:id/submissions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromReq(req);
    const submissionsCol = dbManager.getCollection('submissions');
    const problemsCol = dbManager.getCollection('problems');

    const problem = await problemsCol.findOne({ $or: [{ id }, { slug: id }] });
    const targetProblemId = problem ? problem.id : id;

    const filter: any = { problemId: targetProblemId };
    if (userId) {
      filter.userId = userId;
    }

    const submissions = await submissionsCol
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.json(submissions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/submissions', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { problemId } = req.query;
    const submissionsCol = dbManager.getCollection('submissions');

    const filter: any = {};
    if (userId) {
      filter.userId = userId;
    }
    if (problemId && typeof problemId === 'string') {
      filter.problemId = problemId;
    }

    const submissions = await submissionsCol
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.json(submissions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AI Tutor Interactive Chat
apiRouter.post('/ai/tutor-chat', async (req: Request, res: Response) => {
  try {
    const { problemId, currentCode, language, messageHistory, userQuestion } = req.body;
    const problemsCol = dbManager.getCollection('problems');
    const problem = await problemsCol.findOne({ id: problemId });

    const reply = await chatWithCodingTutor({
      problemTitle: problem?.title || 'Coding Problem',
      problemDescription: problem?.description || '',
      currentCode: currentCode || '',
      language: language || 'javascript',
      messageHistory: messageHistory || [],
      userQuestion: userQuestion || 'Can you explain this problem and give me a hint?'
    });

    return res.json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STUDENT PERFORMANCE ANALYTICS & WEAKNESS OBSERVATION
// -------------------------------------------------------------
apiRouter.get('/analytics', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. Please provide a valid session token.' });
    }

    const usersCol = dbManager.getCollection('users');
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    const user = await usersCol.findOne({
      $or: [{ id: userId }, { email: userId.toLowerCase() }]
    });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    const allProblems = await problemsCol.find().toArray();
    const userSubmissions = await submissionsCol.find({ userId }).sort({ createdAt: -1 }).toArray();

    const acceptedSubmissions = userSubmissions.filter((s: any) => s.status === 'Passed' || s.status === 'accepted');
    const solvedProblemIds = new Set(acceptedSubmissions.map((s: any) => s.problemId));

    const totalAttempted = new Set(userSubmissions.map((s: any) => s.problemId)).size;
    const totalSolved = solvedProblemIds.size;
    const accuracyRate = userSubmissions.length > 0
      ? Math.round((acceptedSubmissions.length / userSubmissions.length) * 100)
      : 0;

    // Difficulty breakdown
    const basicProblems = allProblems.filter((p: any) => p.difficulty === 'basic');
    const intermediateProblems = allProblems.filter((p: any) => p.difficulty === 'intermediate');
    const advancedProblems = allProblems.filter((p: any) => p.difficulty === 'advanced');

    const basicSolved = basicProblems.filter((p: any) => solvedProblemIds.has(p.id)).length;
    const intermediateSolved = intermediateProblems.filter((p: any) => solvedProblemIds.has(p.id)).length;
    const advancedSolved = advancedProblems.filter((p: any) => solvedProblemIds.has(p.id)).length;

    // Categories breakdown
    const categoriesMap: Record<string, { solved: number; total: number }> = {};
    for (const p of allProblems) {
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = { solved: 0, total: 0 };
      }
      categoriesMap[p.category].total++;
      if (solvedProblemIds.has(p.id)) {
        categoriesMap[p.category].solved++;
      }
    }

    const categoryMastery = Object.entries(categoriesMap).map(([category, stats]) => {
      const percent = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
      let status: 'needs_focus' | 'improving' | 'mastered' = 'needs_focus';
      if (percent >= 70) status = 'mastered';
      else if (percent >= 35) status = 'improving';
      return {
        category,
        solved: stats.solved,
        total: stats.total,
        percent,
        status
      };
    });

    // Generate or get dynamic mistake analysis with smart caching
    let mistakeAnalysis: any;
    const cachedAnalysis = analysisCache.get(userId);
    const tenMinutes = 10 * 60 * 1000;
    if (cachedAnalysis && cachedAnalysis.lastSubCount === userSubmissions.length && (Date.now() - cachedAnalysis.timestamp < tenMinutes)) {
      mistakeAnalysis = cachedAnalysis.data;
    } else {
      mistakeAnalysis = await analyzeMistakesAndRecommend(userSubmissions, user);
      analysisCache.set(userId, {
        lastSubCount: userSubmissions.length,
        data: mistakeAnalysis,
        timestamp: Date.now()
      });
    }

    // Recent activity graph
    const activityMap: Record<string, { count: number; passed: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      activityMap[d] = { count: 0, passed: 0 };
    }
    for (const sub of userSubmissions) {
      const dateStr = sub.createdAt.split('T')[0];
      if (activityMap[dateStr]) {
        activityMap[dateStr].count++;
        if (sub.status === 'Passed' || sub.status === 'accepted') {
          activityMap[dateStr].passed++;
        }
      }
    }

    const recentActivity = Object.entries(activityMap).map(([date, counts]) => ({
      date,
      count: counts.count,
      passed: counts.passed
    }));

    const difficultyBreakdown = {
      basic: { solved: basicSolved, total: basicProblems.length },
      intermediate: { solved: intermediateSolved, total: intermediateProblems.length },
      advanced: { solved: advancedSolved, total: advancedProblems.length }
    };

    return res.json({
      userId,
      totalSolved,
      totalAttempted,
      accuracyRate,
      streakDays: user?.streakDays || 0,
      difficultyBreakdown,
      difficulty: difficultyBreakdown,
      categoryMastery,
      radarData: categoryMastery,
      recentSubmissions: userSubmissions.slice(0, 10),
      identifiedMistakes: (mistakeAnalysis.identifiedMistakes || []).map((m: any, idx: number) => ({
        id: m.id || `mistake_${idx}`,
        category: typeof m.category === 'string' ? m.category : 'Algorithms',
        mistakePattern: m.mistakePattern || m.type || 'Algorithmic Edge Case',
        description: m.description || m.advice || 'Observed potential vulnerability in test case coverage or edge conditions.',
        remedyAction: m.remedyAction || m.advice || 'Consider testing with edge cases like empty arrays, single elements, and negatives.',
        severity: m.severity || 'medium',
        frequency: m.frequency || m.count || 1,
        lastObservedAt: m.lastObservedAt || new Date().toISOString()
      })),
      weakTopics: (mistakeAnalysis.weakTopics || []).map((t: any) => typeof t === 'object' ? (t.name || t.title || t.topic || JSON.stringify(t)) : String(t)),
      strongTopics: (mistakeAnalysis.strongTopics || []).map((t: any) => typeof t === 'object' ? (t.name || t.title || t.topic || JSON.stringify(t)) : String(t)),
      recommendedFocusList: mistakeAnalysis.recommendedFocusList || [],
      recentActivity
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & USER MONITORING
// -------------------------------------------------------------
apiRouter.get('/admin/overview', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const usersCol = dbManager.getCollection('users');
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    const users = await usersCol.find().toArray();
    const problems = await problemsCol.find().toArray();
    const submissions = await submissionsCol.find().sort({ createdAt: -1 }).toArray();

    // Enrich each student with aggregated performance
    const studentsWithMetrics = users.map((u: any) => {
      const userSubs = submissions.filter((s: any) => s.userId === u.id);
      const acceptedSubs = userSubs.filter((s: any) => s.status === 'Passed' || s.status === 'accepted');
      const uniqueSolved = new Set(acceptedSubs.map((s: any) => s.problemId)).size;
      const passRate = userSubs.length > 0 ? Math.round((acceptedSubs.length / userSubs.length) * 100) : 0;

      // Identify struggling categories
      const failedSubs = userSubs.filter((s: any) => s.status !== 'Passed' && s.status !== 'accepted');
      const struggleCategories: string[] = Array.from(new Set(failedSubs.map((s: any) => String(s.category)))).slice(0, 3);

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        batch: u.batch || (u.role === 'admin' ? 'Administration' : 'Batch 2026-A'),
        skillLevel: u.skillLevel || 'intermediate',
        preferredLanguage: u.preferredLanguage || 'javascript',
        targetGoal: u.targetGoal || 'Master algorithms and interviews',
        streakDays: u.streakDays || 0,
        totalSolved: uniqueSolved,
        totalSubmissions: userSubs.length,
        passRate,
        struggleCategories: struggleCategories.length ? struggleCategories : ['None detected yet'],
        lastActive: userSubs[0]?.createdAt || u.createdAt
      };
    });

    const totalSubmissions = submissions.length;
    const totalAccepted = submissions.filter((s: any) => s.status === 'Passed' || s.status === 'accepted').length;
    const overallPassRate = totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 100) : 0;

    const summary = {
      totalUsers: users.length,
      totalStudents: users.filter((u: any) => u.role === 'student').length,
      totalFaculty: users.filter((u: any) => u.role === 'faculty').length,
      totalProblems: problems.length,
      totalSubmissions,
      overallPassRate,
      averageAccuracy: overallPassRate,
      aiProblemsGenerated: problems.filter((p: any) => p.isAiGenerated).length
    };

    return res.json({
      metrics: summary,
      summary,
      users: studentsWithMetrics,
      students: studentsWithMetrics,
      problems,
      submissions,
      recentSubmissions: submissions.slice(0, 15)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

const handleGetStudentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usersCol = dbManager.getCollection('users');
    const submissionsCol = dbManager.getCollection('submissions');

    const user = await usersCol.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const studentSubs = await submissionsCol.find({ userId: id }).sort({ createdAt: -1 }).toArray();

    return res.json({
      user,
      submissions: studentSubs
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

apiRouter.get('/admin/student/:id', requireRole(['admin', 'faculty']), handleGetStudentDetails);
apiRouter.get('/admin/users/:id', requireRole(['admin', 'faculty']), handleGetStudentDetails);
apiRouter.get('/faculty/student/:id', requireRole(['admin', 'faculty']), handleGetStudentDetails);

// Dedicated Admin Authentication (Single Root Admin Account)
apiRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const usersCol = dbManager.getCollection('users');

    const user = await usersCol.findOne({
      $or: [
        { email: normalizedEmail },
        { username: email.trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Administrator account not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: `Access denied. This account is registered as '${user.role.toUpperCase()}'. Administrative privileges required.`
      });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid administrator password.' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({
      token: user.id,
      user: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Change Own Password
apiRouter.post('/admin/change-password', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New administrator password must be at least 4 characters long.' });
    }

    const usersCol = dbManager.getCollection('users');
    let admin = userId ? await usersCol.findOne({ id: userId, role: 'admin' }) : null;
    if (!admin) {
      admin = await usersCol.findOne({ role: 'admin' });
    }

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    if (currentPassword && admin.password && !verifyPassword(currentPassword, admin.password)) {
      return res.status(400).json({ error: 'Current administrator password is incorrect.' });
    }

    const hashedPassword = hashPassword(newPassword);
    await usersCol.updateOne(
      { id: admin.id },
      { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
    );

    return res.json({
      success: true,
      message: 'Administrator password updated successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Reset/Change ANY User's Password (student or faculty)
apiRouter.put('/admin/users/:id/password', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const hashedPassword = hashPassword(newPassword);
    await usersCol.updateOne(
      { id },
      { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
    );

    return res.json({
      success: true,
      message: `Password for ${user.username} (${user.role}) has been updated successfully.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Add User (Determining Status: Student vs Faculty vs Admin)
apiRouter.post('/admin/users', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      role = 'student',
      batch,
      skillLevel = 'intermediate',
      preferredLanguage = 'javascript',
      targetGoal = 'Master modern algorithms and technical interviews',
      streakDays = 0,
      totalSolved = 0
    } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required.' });
    }

    const trimmedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole = ['student', 'faculty', 'admin'].includes(role) ? role : 'student';

    const usersCol = dbManager.getCollection('users');
    const existing = await usersCol.findOne({
      $or: [{ email: normalizedEmail }, { username: trimmedUsername }]
    });

    if (existing) {
      return res.status(400).json({ error: 'A user with this email or username already exists.' });
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: trimmedUsername,
      email: normalizedEmail,
      password: password || (assignedRole === 'admin' ? 'AdminPass123!' : assignedRole === 'faculty' ? 'FacultyPass123!' : 'StudentPass123!'),
      role: assignedRole,
      batch: batch || (assignedRole === 'admin' ? 'Administration' : assignedRole === 'faculty' ? 'Faculty Department' : 'Batch 2026-A'),
      skillLevel: skillLevel || 'intermediate',
      preferredLanguage: preferredLanguage || 'javascript',
      targetGoal: targetGoal || (assignedRole === 'faculty' ? 'Instruct curriculum and guide batch performance' : 'Master technical interviews'),
      streakDays: Math.max(0, Number(streakDays) || 0),
      totalSolved: Math.max(0, Number(totalSolved) || 0),
      status: 'Verified',
      isVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    await usersCol.insertOne(newUser);
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: `${assignedRole.toUpperCase()} account '${trimmedUsername}' created successfully.`,
      user: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Delete User
apiRouter.delete('/admin/users/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (id === 'usr_admin_root') {
      return res.status(400).json({ error: 'Cannot delete the primary root system administrator account.' });
    }

    const usersCol = dbManager.getCollection('users');
    const submissionsCol = dbManager.getCollection('submissions');

    const user = await usersCol.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'User not found in system.' });
    }

    // Delete user
    await usersCol.deleteOne({ id });

    // Cascade delete any user submissions
    await submissionsCol.deleteMany({ userId: id });

    // Invalidate analytics cache for this user
    analysisCache.delete(id);

    return res.json({
      success: true,
      message: `User '${user.username}' (${user.role}) has been permanently deleted.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Update User
apiRouter.put('/admin/users/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role, batch, password, skillLevel, preferredLanguage, targetGoal, streakDays, totalSolved } = req.body;
    const usersCol = dbManager.getCollection('users');

    const updateFields: any = {};
    if (username) updateFields.username = username.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (role && ['student', 'faculty', 'admin'].includes(role)) updateFields.role = role;
    if (batch) updateFields.batch = batch.trim();
    if (password) updateFields.password = password;
    if (skillLevel) updateFields.skillLevel = skillLevel;
    if (preferredLanguage) updateFields.preferredLanguage = preferredLanguage;
    if (targetGoal) updateFields.targetGoal = targetGoal;
    if (streakDays !== undefined) updateFields.streakDays = Math.max(0, Number(streakDays));
    if (totalSolved !== undefined) updateFields.totalSolved = Math.max(0, Number(totalSolved));

    const result = await usersCol.updateOne({ id }, { $set: updateFields });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedUser = await usersCol.findOne({ id });
    const { password: _, ...safeUser } = updatedUser;
    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FACULTY DASHBOARD & BATCH PERFORMANCE TRACKING
// -------------------------------------------------------------
apiRouter.get('/faculty/overview', requireRole(['faculty', 'admin']), async (req: Request, res: Response) => {
  try {
    const facultyId = getUserIdFromReq(req);
    const selectedBatch = (req.query.batch as string) || '';

    const usersCol = dbManager.getCollection('users');
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    const faculty = await usersCol.findOne({ id: facultyId });
    const allUsers = await usersCol.find().toArray();
    const allStudents = allUsers.filter((u: any) => u.role === 'student');
    const problems = await problemsCol.find().toArray();
    const submissions = await submissionsCol.find().sort({ createdAt: -1 }).toArray();

    // Distinct list of batches
    const rawBatches = allStudents.map((s: any) => s.batch).filter(Boolean);
    const batches = Array.from(new Set(rawBatches)) as string[];
    if (batches.length === 0) {
      batches.push('Batch 2026-A');
    }

    // Filter students by requested batch if specified
    const targetStudents = selectedBatch && selectedBatch !== 'all'
      ? allStudents.filter((s: any) => (s.batch || 'Batch 2026-A') === selectedBatch)
      : allStudents;

    const targetStudentIds = new Set(targetStudents.map((s: any) => s.id));
    const targetSubmissions = submissions.filter((s: any) => targetStudentIds.has(s.userId));

    const studentsWithMetrics = targetStudents.map((u: any) => {
      const userSubs = targetSubmissions.filter((s: any) => s.userId === u.id);
      const acceptedSubs = userSubs.filter((s: any) => s.status === 'Passed' || s.status === 'accepted');
      const uniqueSolved = new Set(acceptedSubs.map((s: any) => s.problemId)).size;
      const passRate = userSubs.length > 0 ? Math.round((acceptedSubs.length / userSubs.length) * 100) : 0;

      const failedSubs = userSubs.filter((s: any) => s.status !== 'Passed' && s.status !== 'accepted');
      const struggleCategories = Array.from(new Set(failedSubs.map((s: any) => String(s.category)))).slice(0, 3);

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        batch: u.batch || 'Batch 2026-A',
        skillLevel: u.skillLevel || 'intermediate',
        preferredLanguage: u.preferredLanguage || 'javascript',
        targetGoal: u.targetGoal || 'Master algorithms',
        streakDays: u.streakDays || 0,
        totalSolved: uniqueSolved,
        totalSubmissions: userSubs.length,
        passRate,
        struggleCategories: struggleCategories.length ? struggleCategories : ['None detected yet'],
        lastActive: userSubs[0]?.createdAt || u.createdAt
      };
    });

    const totalBatchSubs = targetSubmissions.length;
    const totalAccepted = targetSubmissions.filter((s: any) => s.status === 'Passed' || s.status === 'accepted').length;
    const batchPassRate = totalBatchSubs > 0 ? Math.round((totalAccepted / totalBatchSubs) * 100) : 0;

    return res.json({
      faculty: {
        id: faculty?.id || facultyId,
        username: faculty?.username || 'Faculty Instructor',
        email: faculty?.email || '',
        batch: faculty?.batch || selectedBatch || batches[0]
      },
      metrics: {
        totalBatchStudents: targetStudents.length,
        batchPassRate,
        totalBatchSubmissions: totalBatchSubs,
        activeProblems: problems.length
      },
      students: studentsWithMetrics,
      recentSubmissions: targetSubmissions.slice(0, 20),
      batches
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Problem Management Handlers (Admin and Faculty privileged operations)
const handleCreateProblem = async (req: Request, res: Response) => {
  try {
    const {
      title,
      difficulty,
      category,
      description,
      examples,
      constraints,
      starterCode,
      testCases,
      hints,
      tags
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Problem title is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Problem category is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Problem description is required.' });
    }

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDifficulty = ['basic', 'intermediate', 'advanced'].includes(difficulty)
      ? difficulty
      : 'basic';

    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const problemId = `prob_${slug.substring(0, 18)}_${Math.random().toString(36).substring(2, 7)}`;

    // Build camelCase or snake_case function name for starter code
    const funcName = slug
      .split('-')
      .map((w: string, i: number) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
      .join('') || 'solution';

    const defaultStarterCode: Record<string, string> = {
      javascript: `/**
 * @param {any} input
 * @return {any}
 */
function ${funcName}(input) {
  // Write your solution here
  return null;
}`,
      typescript: `function ${funcName}(input: any): any {
  // Write your solution here
  return null;
}`,
      python: `def ${funcName}(input):
    # Write your solution here
    return None`,
      java: `public class Solution {
    public static Object ${funcName}(Object input) {
        // Write your solution here
        return null;
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    auto ${funcName}(auto input) {
        // Write your solution here
        return 0;
    }
};`,
      go: `package main

func ${funcName}(input interface{}) interface{} {
    // Write your solution here
    return nil
}`
    };

    const finalStarterCode = {
      ...defaultStarterCode,
      ...(starterCode || {})
    };

    // Clean test cases
    const rawTestCases = Array.isArray(testCases) && testCases.length > 0 ? testCases : [
      { id: 'tc_1', input: 'sample_input', expectedOutput: 'sample_output', isHidden: false }
    ];

    const cleanTestCases = rawTestCases.map((tc: any, index: number) => ({
      id: tc.id || `tc_${index + 1}`,
      input: String(tc.input ?? ''),
      expectedOutput: String(tc.expectedOutput ?? ''),
      isHidden: Boolean(tc.isHidden)
    }));

    // Clean examples
    const rawExamples = Array.isArray(examples) && examples.length > 0 ? examples : [
      { input: cleanTestCases[0]?.input || '', output: cleanTestCases[0]?.expectedOutput || '', explanation: 'Standard test case' }
    ];

    const cleanExamples = rawExamples.map((ex: any) => ({
      input: String(ex.input ?? ''),
      output: String(ex.output ?? ''),
      ...(ex.explanation ? { explanation: String(ex.explanation) } : {})
    }));

    // Clean constraints, hints, tags
    const cleanConstraints = Array.isArray(constraints) && constraints.length > 0
      ? constraints.map((c: any) => String(c).trim()).filter(Boolean)
      : ['1 <= input.length <= 10^5', 'Target time complexity: O(N)'];

    const cleanHints = Array.isArray(hints)
      ? hints.map((h: any) => String(h).trim()).filter(Boolean)
      : [];

    const cleanTags = Array.isArray(tags) && tags.length > 0
      ? tags.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean)
      : [cleanCategory.toLowerCase()];

    const newProblem = {
      id: problemId,
      title: cleanTitle,
      slug,
      difficulty: cleanDifficulty,
      category: cleanCategory,
      description: description.trim(),
      examples: cleanExamples,
      constraints: cleanConstraints,
      starterCode: finalStarterCode,
      testCases: cleanTestCases,
      hints: cleanHints,
      tags: cleanTags,
      acceptanceRate: 75,
      createdAt: new Date().toISOString()
    };

    const problemsCol = dbManager.getCollection('problems');
    await problemsCol.insertOne(newProblem);

    return res.status(201).json({
      success: true,
      message: `Problem '${cleanTitle}' added to the curriculum database.`,
      problem: newProblem
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Problem Deletion Handler
const handleDeleteProblem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    const problem = await problemsCol.findOne({ id });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found in curriculum database.' });
    }

    // Delete problem from catalog
    await problemsCol.deleteOne({ id });

    // Cascade delete any submissions for this problem
    await submissionsCol.deleteMany({ problemId: id });

    return res.json({
      success: true,
      message: `Problem '${problem.title}' and associated test logs have been permanently deleted from the curriculum.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// AI Draft Problem Helper Handler
const handleGenerateDraftProblem = async (req: Request, res: Response) => {
  try {
    const { topic, category, difficulty = 'intermediate', targetLanguage = 'javascript' } = req.body;
    
    const draft = await generatePersonalizedProblem({
      skillLevel: difficulty === 'basic' ? 'beginner' : difficulty === 'advanced' ? 'advanced' : 'intermediate',
      preferredLanguage: targetLanguage,
      desiredDifficulty: difficulty,
      topicFocus: topic || category || 'Algorithms and Data Structures'
    });

    if (category) {
      draft.category = category;
    }
    if (difficulty) {
      draft.difficulty = difficulty;
    }

    return res.json({
      success: true,
      draft
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Mount Problem Authoring & Management for Admin and Faculty
apiRouter.post('/admin/problems', requireRole(['admin', 'faculty']), handleCreateProblem);
apiRouter.post('/faculty/problems', requireRole(['faculty', 'admin']), handleCreateProblem);

apiRouter.delete('/admin/problems/:id', requireRole(['admin', 'faculty']), handleDeleteProblem);
apiRouter.delete('/faculty/problems/:id', requireRole(['faculty', 'admin']), handleDeleteProblem);

apiRouter.post('/admin/problems/generate-draft', requireRole(['admin', 'faculty']), handleGenerateDraftProblem);
apiRouter.post('/faculty/problems/generate-draft', requireRole(['faculty', 'admin']), handleGenerateDraftProblem);

// -------------------------------------------------------------
// COMMUNITY MESSAGING & PEER DISCUSSIONS
// -------------------------------------------------------------
apiRouter.get('/messages', async (req: Request, res: Response) => {
  try {
    const { channel = 'general' } = req.query;
    const messagesCol = dbManager.getCollection('messages');
    const messages = await messagesCol.find({ channel }).sort({ createdAt: 1 }).toArray();
    return res.json(messages);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/messages', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { channel = 'general', text, codeSnippet } = req.body;
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ id: userId });

    const messagesCol = dbManager.getCollection('messages');
    const newMessage = {
      id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      channel,
      senderId: userId,
      senderName: user?.username || 'Student',
      senderRole: user?.role || 'student',
      text,
      codeSnippet: codeSnippet || null,
      reactions: { '👍': 1 },
      createdAt: new Date().toISOString()
    };

    await messagesCol.insertOne(newMessage);
    return res.status(201).json(newMessage);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// MONGODB DATABASE MANAGEMENT & STATUS
// -------------------------------------------------------------
apiRouter.get('/database/status', async (req: Request, res: Response) => {
  try {
    const status = await dbManager.getStatus();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/database/configure', async (req: Request, res: Response) => {
  try {
    const { uri } = req.body;
    const success = await dbManager.init(uri);
    if (success) {
      await seedInitialData();
    }
    const status = await dbManager.getStatus();
    return res.json({
      success,
      ...status
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// INTERACTIVE BADGES & TROPHY CABINET API ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/badges', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const usersCol = dbManager.getCollection('users');
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    let user = null;
    if (userId) {
      user = await usersCol.findOne({ $or: [{ id: userId }, { email: userId }] });
    }
    if (!user) {
      user = await usersCol.findOne({ role: 'student' });
    }

    const userSubs = user
      ? await submissionsCol.find({ $or: [{ userId: user.id }, { userId: user.email }] }).toArray()
      : [];
    const allProblems = await problemsCol.find({}).toArray();

    const { badges, totalEarnedXp, unlockedCount } = computeUserBadges(user, userSubs, allProblems);
    const metrics = computeStudentMetrics(user, userSubs, allProblems);

    // If any newly satisfied badges aren't stored, sync them
    if (user && unlockedCount > (user.earnedBadges?.length || 0)) {
      const { updatedEarnedBadges } = evaluateNewlyUnlockedBadges(user, userSubs, allProblems);
      await usersCol.updateOne(
        { id: user.id },
        { $set: { earnedBadges: updatedEarnedBadges } }
      );
      user.earnedBadges = updatedEarnedBadges;
    }

    return res.json({
      success: true,
      badges,
      totalEarnedXp,
      unlockedCount,
      totalBadges: badges.length,
      metrics,
      earnedBadges: user?.earnedBadges || []
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/badges/claim-streak', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const usersCol = dbManager.getCollection('users');
    const problemsCol = dbManager.getCollection('problems');
    const submissionsCol = dbManager.getCollection('submissions');

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Session required' });
    }

    const user = await usersCol.findOne({ $or: [{ id: userId }, { email: userId }] });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedStreak = (user.streakDays || 1) + 1;
    const userSubs = await submissionsCol.find({ $or: [{ userId: user.id }, { userId: user.email }] }).toArray();
    const allProblems = await problemsCol.find({}).toArray();

    const { newlyUnlocked, updatedEarnedBadges } = evaluateNewlyUnlockedBadges(
      { ...user, streakDays: updatedStreak },
      userSubs,
      allProblems
    );

    await usersCol.updateOne(
      { id: user.id },
      {
        $set: {
          streakDays: updatedStreak,
          earnedBadges: updatedEarnedBadges
        }
      }
    );

    return res.json({
      success: true,
      streakDays: updatedStreak,
      newlyUnlockedBadges: newlyUnlocked,
      earnedBadges: updatedEarnedBadges
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FEEDBACK & BUG REPORT ENDPOINTS
// -------------------------------------------------------------

// Submit bug report, feature suggestion, or platform feedback
apiRouter.post('/feedback', async (req: Request, res: Response) => {
  try {
    const {
      type = 'suggestion', // 'bug' | 'suggestion' | 'general'
      email = '',
      name = '',
      subject = '',
      message = '',
      metadata = {}
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please provide details or a description for your feedback.' });
    }

    const feedbackCol = dbManager.getCollection('feedback');
    const feedbackRecord = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: ['bug', 'suggestion', 'general'].includes(type) ? type : 'general',
      email: email ? String(email).trim().toLowerCase() : 'anonymous@codeelevate.io',
      name: name ? String(name).trim() : 'Community Member',
      subject: subject ? String(subject).trim() : `${type.toUpperCase()} Report`,
      message: message.trim(),
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
      status: 'received',
      createdAt: new Date().toISOString()
    };

    await feedbackCol.insertOne(feedbackRecord);

    console.log('\n' + '='.repeat(70));
    console.log(`📬 [CodeElevate Feedback & Bug Report] RECEIVED: [${feedbackRecord.type.toUpperCase()}]`);
    console.log(`👤 From     : ${feedbackRecord.name} <${feedbackRecord.email}>`);
    console.log(`📌 Subject  : ${feedbackRecord.subject}`);
    console.log(`💬 Message  : ${feedbackRecord.message}`);
    console.log(`🆔 ID       : ${feedbackRecord.id}`);
    console.log('='.repeat(70) + '\n');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded. Our team reviews all suggestions and bug reports.',
      feedback: feedbackRecord
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin list feedback
apiRouter.get('/feedback', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const feedbackCol = dbManager.getCollection('feedback');
    const list = await feedbackCol.find({}).sort({ createdAt: -1 }).toArray();
    return res.json({ feedback: list });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


