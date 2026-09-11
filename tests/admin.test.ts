import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { getTestApp } from './helpers/testApp';

describe('Admin Role Workflows & RBAC Tests', () => {
  let app: Express;

  const adminHeaders = {
    Authorization: 'Bearer usr_admin_root',
    'x-user-id': 'usr_admin_root'
  };

  beforeAll(async () => {
    app = await getTestApp();
  });

  describe('1. Global Dashboard & Platform Metrics Access', () => {
    it('allows admin to access the global dashboard overview', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(adminHeaders);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('problems');
      expect(res.body).toHaveProperty('submissions');
      expect(res.body).toHaveProperty('summary');

      expect(Array.isArray(res.body.users)).toBe(true);
      expect(Array.isArray(res.body.problems)).toBe(true);
      expect(Array.isArray(res.body.submissions)).toBe(true);
    });

    it('allows admin to view comprehensive total platform metrics', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(adminHeaders);

      expect(res.status).toBe(200);
      const { summary } = res.body;

      expect(summary).toHaveProperty('totalUsers');
      expect(summary).toHaveProperty('totalStudents');
      expect(summary).toHaveProperty('totalFaculty');
      expect(summary).toHaveProperty('totalProblems');
      expect(summary).toHaveProperty('totalSubmissions');
      expect(summary).toHaveProperty('averageAccuracy');

      expect(summary.totalUsers).toBeGreaterThanOrEqual(2);
      expect(summary.totalStudents).toBeGreaterThanOrEqual(1);
      expect(summary.totalFaculty).toBeGreaterThanOrEqual(1);
      expect(summary.totalProblems).toBeGreaterThan(0);
    });
  });

  describe('2. User Role Management (Add, Update Password, Delete)', () => {
    let createdStudentId = '';
    let createdFacultyId = '';

    it('allows admin to create a new Student user', async () => {
      const payload = {
        username: 'Test Enrolled Student',
        email: 'test.student@codeelevate.io',
        password: 'StudentSecurePass1!',
        role: 'student',
        batch: 'Batch 2026-A',
        skillLevel: 'beginner'
      };

      const res = await request(app)
        .post('/api/admin/users')
        .set(adminHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toBe(payload.username);
      expect(res.body.user.email).toBe(payload.email);
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.batch).toBe('Batch 2026-A');
      expect(res.body.user).not.toHaveProperty('password'); // Must not leak password

      createdStudentId = res.body.user.id;
    });

    it('allows admin to create a new Faculty user', async () => {
      const payload = {
        username: 'Test Faculty Instructor',
        email: 'test.faculty@codeelevate.io',
        password: 'FacultySecurePass1!',
        role: 'faculty',
        batch: 'Faculty Department'
      };

      const res = await request(app)
        .post('/api/admin/users')
        .set(adminHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('faculty');

      createdFacultyId = res.body.user.id;
    });

    it('allows admin to change any user password', async () => {
      expect(createdStudentId).toBeTruthy();

      const res = await request(app)
        .put(`/api/admin/users/${createdStudentId}/password`)
        .set(adminHeaders)
        .send({
          newPassword: 'UpdatedSecurePass99!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/updated successfully/i);
    });

    it('allows admin to delete a managed user and cleans up their data', async () => {
      expect(createdStudentId).toBeTruthy();

      const res = await request(app)
        .delete(`/api/admin/users/${createdStudentId}`)
        .set(adminHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/permanently deleted/i);

      // Verify deletion from system
      const checkRes = await request(app)
        .get(`/api/admin/student/${createdStudentId}`)
        .set(adminHeaders);

      expect(checkRes.status).toBe(404);
    });

    it('prevents deletion of the primary root system administrator', async () => {
      const res = await request(app)
        .delete('/api/admin/users/usr_admin_root')
        .set(adminHeaders);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Cannot delete the primary root system administrator/i);
    });

    it('cleans up test faculty user', async () => {
      if (createdFacultyId) {
        const res = await request(app)
          .delete(`/api/admin/users/${createdFacultyId}`)
          .set(adminHeaders);

        expect(res.status).toBe(200);
      }
    });
  });

  describe('3. Admin Problem Authoring & Inspection', () => {
    let testProblemId = '';

    it('allows admin to inspect any student record', async () => {
      const res = await request(app)
        .get('/api/admin/student/usr_student_active')
        .set(adminHeaders);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe('usr_student_active');
    });

    it('allows admin to author curriculum problems directly', async () => {
      const res = await request(app)
        .post('/api/admin/problems')
        .set(adminHeaders)
        .send({
          title: 'Admin Authored Binary Search',
          difficulty: 'intermediate',
          category: 'Binary Search',
          description: 'Given an array of sorted integers, find target index in O(log n).',
          examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }],
          testCases: [{ id: 'tc1', input: '[-1,0,3,5,9,12], 9', expectedOutput: '4', isHidden: false }]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testProblemId = res.body.problem.id;
    });

    it('allows admin to delete curriculum problems directly', async () => {
      expect(testProblemId).toBeTruthy();

      const res = await request(app)
        .delete(`/api/admin/problems/${testProblemId}`)
        .set(adminHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
