import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { getTestApp } from './helpers/testApp';

describe('Student Role Workflows & RBAC Tests', () => {
  let app: Express;

  const studentHeaders = {
    Authorization: 'Bearer usr_student_active',
    'x-user-id': 'usr_student_active'
  };

  beforeAll(async () => {
    app = await getTestApp();
  });

  describe('1. Practice Sheet Access', () => {
    it('allows students to fetch the list of curriculum practice problems', async () => {
      const res = await request(app)
        .get('/api/problems')
        .set(studentHeaders);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const firstProblem = res.body[0];
      expect(firstProblem).toHaveProperty('id');
      expect(firstProblem).toHaveProperty('title');
      expect(firstProblem).toHaveProperty('difficulty');
      expect(firstProblem).toHaveProperty('category');
      expect(firstProblem).toHaveProperty('starterCode');
    });

    it('allows students to retrieve single problem specifications and test cases', async () => {
      const res = await request(app)
        .get('/api/problems/prob_two_sum')
        .set(studentHeaders);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('prob_two_sum');
      expect(res.body.title).toBe('Two Sum');
      expect(Array.isArray(res.body.testCases)).toBe(true);
      expect(res.body.testCases.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Code Execution Sandbox & Submission', () => {
    it('allows students to run code against test cases in the sandbox', async () => {
      const code = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
      `;

      const res = await request(app)
        .post('/api/code/run')
        .set(studentHeaders)
        .send({
          problemId: 'prob_two_sum',
          code,
          language: 'javascript'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('passed');
      expect(res.body).toHaveProperty('passedCount');
      expect(res.body).toHaveProperty('totalCount');
      expect(res.body.passedCount).toBe(res.body.totalCount);
    });

    it('allows students to officially submit code and records the submission', async () => {
      const validCode = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}
      `;

      const res = await request(app)
        .post('/api/code/submit')
        .set(studentHeaders)
        .send({
          problemId: 'prob_two_sum',
          code: validCode,
          language: 'javascript'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.submission).toHaveProperty('id');
      expect(res.body.submission.userId).toBe('usr_student_active');
      expect(res.body.submission.status).toBe('Passed');
      expect(res.body.submission.passedCases).toBe(res.body.submission.totalCases);
    });
  });

  describe('3. Student Performance & Success Metrics', () => {
    it('allows students to view their analytics, accuracy, and streak metrics', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set(studentHeaders);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalSolved');
      expect(res.body).toHaveProperty('totalAttempted');
      expect(res.body).toHaveProperty('accuracyRate');
      expect(res.body).toHaveProperty('streakDays');
      expect(res.body).toHaveProperty('difficulty');
      expect(res.body).toHaveProperty('radarData');
      expect(res.body).toHaveProperty('recentSubmissions');

      expect(typeof res.body.totalSolved).toBe('number');
      expect(typeof res.body.accuracyRate).toBe('number');
      expect(Array.isArray(res.body.recentSubmissions)).toBe(true);
    });
  });

  describe('4. RBAC Protection: Student Access Restrictions', () => {
    it('restricts students from accessing the admin global overview (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(studentHeaders);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*admin/i);
    });

    it('restricts students from creating new users (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set(studentHeaders)
        .send({
          username: 'Unauthorized Student User',
          email: 'unauthorized@test.com',
          role: 'student'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*admin/i);
    });

    it('restricts students from deleting users (403 Forbidden)', async () => {
      const res = await request(app)
        .delete('/api/admin/users/usr_student_active')
        .set(studentHeaders);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*admin/i);
    });

    it('restricts students from accessing faculty cohort surveillance (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/faculty/overview')
        .set(studentHeaders);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*faculty/i);
    });

    it('restricts students from authoring new curriculum problems (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/faculty/problems')
        .set(studentHeaders)
        .send({
          title: 'Unauthorized Student Problem',
          category: 'Algorithms',
          difficulty: 'basic',
          description: 'Students should not create problems'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied/i);
    });
  });
});
