import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { getTestApp } from './helpers/testApp';
import { dbManager } from '../server/db';

describe('Faculty Role Workflows & RBAC Tests', () => {
  let app: Express;

  const facultyHeaders = {
    Authorization: 'Bearer usr_faculty_mentor',
    'x-user-id': 'usr_faculty_mentor'
  };

  beforeAll(async () => {
    app = await getTestApp();
    const usersCol = dbManager.getCollection('users');
    await usersCol.updateOne(
      { id: 'usr_faculty_mentor' },
      { $set: { password: 'FacultyPass123!' } }
    );
  });

  afterAll(async () => {
    const usersCol = dbManager.getCollection('users');
    await usersCol.updateOne(
      { id: 'usr_faculty_mentor' },
      { $set: { password: 'FacultyPass123!' } }
    );
  });

  describe("1. Cohort Surveillance Data", () => {
    it("allows faculty to view their assigned cohort's surveillance overview", async () => {
      const res = await request(app)
        .get('/api/faculty/overview')
        .set(facultyHeaders);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('faculty');
      expect(res.body).toHaveProperty('metrics');
      expect(res.body).toHaveProperty('students');
      expect(res.body).toHaveProperty('batches');

      // Validate metrics structure
      expect(res.body.metrics).toHaveProperty('totalBatchStudents');
      expect(res.body.metrics).toHaveProperty('batchPassRate');
      expect(res.body.metrics).toHaveProperty('totalBatchSubmissions');
      expect(res.body.metrics).toHaveProperty('activeProblems');
      expect(typeof res.body.metrics.totalBatchStudents).toBe('number');

      // Validate student surveillance records
      expect(Array.isArray(res.body.students)).toBe(true);
      if (res.body.students.length > 0) {
        const student = res.body.students[0];
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('username');
        expect(student).toHaveProperty('totalSolved');
        expect(student).toHaveProperty('passRate');
        expect(student).toHaveProperty('struggleCategories');
      }
    });

    it('allows faculty to filter cohort surveillance by batch', async () => {
      const res = await request(app)
        .get('/api/faculty/overview?batch=Batch%202026-A')
        .set(facultyHeaders);

      expect(res.status).toBe(200);
      expect(res.body.students.every((s: any) => s.batch === 'Batch 2026-A')).toBe(true);
    });
  });

  describe('2. Student Submissions Inspection', () => {
    it('allows faculty to inspect individual student profiles and historical submissions', async () => {
      const res = await request(app)
        .get('/api/faculty/student/usr_student_active')
        .set(facultyHeaders);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('submissions');
      expect(res.body.user.id).toBe('usr_student_active');
      expect(Array.isArray(res.body.submissions)).toBe(true);

      if (res.body.submissions.length > 0) {
        const sub = res.body.submissions[0];
        expect(sub).toHaveProperty('problemId');
        expect(sub).toHaveProperty('status');
      }
    });
  });

  describe('3. Curriculum Problem Authoring', () => {
    let createdProblemId = '';

    it('allows faculty to author a new curriculum problem', async () => {
      const newProblemPayload = {
        title: 'Reverse Linked List Test Problem',
        difficulty: 'intermediate',
        category: 'Linked Lists',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        examples: [
          {
            input: 'head = [1,2,3,4,5]',
            output: '[5,4,3,2,1]',
            explanation: 'Reversed list nodes.'
          }
        ],
        constraints: ['The number of nodes in the list is the range [0, 5000].'],
        testCases: [
          {
            id: 'tc1',
            input: '[1,2,3,4,5]',
            expectedOutput: '[5,4,3,2,1]',
            isHidden: false
          }
        ]
      };

      const res = await request(app)
        .post('/api/faculty/problems')
        .set(facultyHeaders)
        .send(newProblemPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.problem).toHaveProperty('id');
      expect(res.body.problem.title).toBe('Reverse Linked List Test Problem');
      expect(res.body.problem.category).toBe('Linked Lists');
      expect(res.body.problem.difficulty).toBe('intermediate');

      createdProblemId = res.body.problem.id;
    });

    it('allows faculty to delete a problem from the curriculum database', async () => {
      expect(createdProblemId).toBeTruthy();

      const res = await request(app)
        .delete(`/api/faculty/problems/${createdProblemId}`)
        .set(facultyHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion from catalog
      const checkRes = await request(app)
        .get(`/api/problems/${createdProblemId}`)
        .set(facultyHeaders);

      expect(checkRes.status).toBe(404);
    });
  });

  describe('4. RBAC Protection: Faculty Access Restrictions', () => {
    it('restricts faculty from accessing the admin global dashboard (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(facultyHeaders);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*admin/i);
    });

    it('restricts faculty from creating new system user accounts (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set(facultyHeaders)
        .send({
          username: 'Faculty Unauthorized User',
          email: 'faculty_unauth@codeelevate.io',
          role: 'student'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*admin/i);
    });

    it('restricts faculty from deleting user accounts (403 Forbidden)', async () => {
      const res = await request(app)
        .delete('/api/admin/users/usr_student_active')
        .set(facultyHeaders);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied.*admin/i);
    });
  });

  describe('5. Faculty Password Change Workflow', () => {
    it('rejects password change if current password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set(facultyHeaders)
        .send({
          currentPassword: 'WrongOldPassword999!',
          newPassword: 'BrandNewPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Current password is incorrect/i);
    });

    it('rejects password change if new password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set(facultyHeaders)
        .send({
          currentPassword: 'FacultyPass123!',
          newPassword: 'ab'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 4 characters/i);
    });

    it('successfully changes password with valid current password and hashes new password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set(facultyHeaders)
        .send({
          currentPassword: 'FacultyPass123!',
          newPassword: 'NewFacultyPass2026!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Password changed successfully/i);

      // Verify that login with old password now fails
      const oldLoginRes = await request(app)
        .post('/api/faculty/login')
        .send({
          email: 'faculty@codeelevate.io',
          password: 'FacultyPass123!'
        });
      expect(oldLoginRes.status).toBe(401);

      // Verify that login with new hashed password succeeds
      const newLoginRes = await request(app)
        .post('/api/faculty/login')
        .send({
          email: 'faculty@codeelevate.io',
          password: 'NewFacultyPass2026!'
        });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.user.email).toBe('faculty@codeelevate.io');

      // Reset password back to standard seed for idempotency
      await request(app)
        .post('/api/auth/change-password')
        .set(facultyHeaders)
        .send({
          currentPassword: 'NewFacultyPass2026!',
          newPassword: 'FacultyPass123!'
        });
    });
  });
});
