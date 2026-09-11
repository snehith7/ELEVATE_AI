import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { getTestApp } from './helpers/testApp';
import { dbManager } from '../server/db';

describe('6-Digit OTP Email Verification Registration Tests', () => {
  let app: Express;
  const testEmail = `new_student_${Date.now()}@example.com`;
  const testPassword = 'SecureStudentPass123!';

  beforeAll(async () => {
    app = await getTestApp();
  });

  it('1. POST /api/auth/register generates a 6-digit OTP, sets 10-minute expiry, and requires verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'OTP Test Student',
        email: testEmail,
        password: testPassword,
        skillLevel: 'intermediate',
        preferredLanguage: 'typescript',
        targetGoal: 'Master algorithms'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.email).toBe(testEmail);
    // Crucial: Must NOT return an authentication token before verification
    expect(res.body.token).toBeUndefined();

    // Verify stored user in DB has 6-digit OTP and 10-minute expiration
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ email: testEmail });
    expect(user).toBeDefined();
    expect(user.status).toBe('PendingVerification');
    expect(user.isVerified).toBe(false);
    expect(user.emailVerified).toBe(false);
    expect(user.verificationOtp).toBeDefined();
    expect(user.verificationOtp).toMatch(/^\d{6}$/);
    expect(user.verificationOtpExpiresAt).toBeDefined();

    // Ensure expiry is roughly 10 minutes from now (between 9 and 11 minutes)
    const expiresMs = new Date(user.verificationOtpExpiresAt).getTime();
    const diffMinutes = (expiresMs - Date.now()) / (60 * 1000);
    expect(diffMinutes).toBeGreaterThan(8);
    expect(diffMinutes).toBeLessThanOrEqual(10.5);
  });

  it('2. POST /api/auth/login blocks unverified accounts and prompts for verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(403);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.token).toBeUndefined();
    expect(res.body.error).toMatch(/verified/i);
  });

  it('3. POST /api/auth/verify-email rejects an incorrect 6-digit code', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: testEmail,
        code: '000000' // Deliberately wrong
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid verification code/i);
    expect(res.body.token).toBeUndefined();
  });

  it('4. POST /api/auth/verify-email succeeds with correct OTP, updates status to Verified, and grants access', async () => {
    const usersCol = dbManager.getCollection('users');
    const user = await usersCol.findOne({ email: testEmail });
    const correctOtp = user.verificationOtp;

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: testEmail,
        code: correctOtp
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe(user.id);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.status).toBe('Verified');
    expect(res.body.user.isVerified).toBe(true);
    expect(res.body.user.emailVerified).toBe(true);
    expect(res.body.user.verificationOtp).toBeUndefined();

    // Verify Firestore/DB record was updated
    const updatedUser = await usersCol.findOne({ email: testEmail });
    expect(updatedUser.status).toBe('Verified');
    expect(updatedUser.isVerified).toBe(true);
    expect(updatedUser.emailVerified).toBe(true);
    expect(updatedUser.verificationOtp).toBeUndefined();
  });

  it('5. POST /api/auth/login now succeeds for the newly verified student account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.status).toBe('Verified');
  });

  it('6. POST /api/auth/resend-verification generates a fresh 6-digit OTP for pending accounts', async () => {
    const pendingEmail = `pending_${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'Pending Student',
        email: pendingEmail,
        password: 'Password123!'
      });

    const usersCol = dbManager.getCollection('users');
    const initialUser = await usersCol.findOne({ email: pendingEmail });
    const initialOtp = initialUser.verificationOtp;

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: pendingEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const refreshedUser = await usersCol.findOne({ email: pendingEmail });
    expect(refreshedUser.verificationOtp).toBeDefined();
    expect(refreshedUser.verificationOtp).toMatch(/^\d{6}$/);
    expect(refreshedUser.status).toBe('PendingVerification');
  });
});
