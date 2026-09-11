import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { getTestApp } from './helpers/testApp';

describe('Role-Based Access Control (RBAC) Comprehensive Matrix', () => {
  let app: Express;

  const studentHeaders = {
    Authorization: 'Bearer usr_student_active',
    'x-user-id': 'usr_student_active'
  };

  const facultyHeaders = {
    Authorization: 'Bearer usr_faculty_mentor',
    'x-user-id': 'usr_faculty_mentor'
  };

  const adminHeaders = {
    Authorization: 'Bearer usr_admin_root',
    'x-user-id': 'usr_admin_root'
  };

  beforeAll(async () => {
    app = await getTestApp();
  });

  describe('1. Unauthenticated Requests (No Auth Headers)', () => {
    it('rejects unauthenticated requests to /api/admin/overview with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/overview');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Authentication required/i);
    });

    it('rejects unauthenticated requests to /api/admin/users with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .send({ username: 'Hacker', email: 'hacker@anon.io', role: 'admin' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Authentication required/i);
    });

    it('rejects unauthenticated requests to /api/faculty/overview with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/faculty/overview');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Authentication required/i);
    });

    it('rejects unauthenticated requests to /api/faculty/problems with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/faculty/problems')
        .send({ title: 'Unauthorized Problem', category: 'Testing', description: 'Desc' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Authentication required/i);
    });

    it('rejects unauthenticated requests to /api/analytics with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/analytics');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Authentication required/i);
    });
  });

  describe('2. Student Role Forbidden Matrix (Must return 403)', () => {
    it('blocks student from accessing /api/admin/overview', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(studentHeaders);
      expect(res.status).toBe(403);
    });

    it('blocks student from accessing /api/admin/users (POST)', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set(studentHeaders)
        .send({ username: 'StRoleUser', email: 'test@role.com', role: 'student' });
      expect(res.status).toBe(403);
    });

    it('blocks student from accessing /api/admin/users/:id (DELETE)', async () => {
      const res = await request(app)
        .delete('/api/admin/users/some_random_id')
        .set(studentHeaders);
      expect(res.status).toBe(403);
    });

    it('blocks student from accessing /api/faculty/overview', async () => {
      const res = await request(app)
        .get('/api/faculty/overview')
        .set(studentHeaders);
      expect(res.status).toBe(403);
    });

    it('blocks student from creating problems via /api/faculty/problems', async () => {
      const res = await request(app)
        .post('/api/faculty/problems')
        .set(studentHeaders)
        .send({ title: 'Student Made', category: 'Math', description: 'Desc' });
      expect(res.status).toBe(403);
    });

    it('blocks student from inspecting other student dossiers via /api/faculty/student/:id', async () => {
      const res = await request(app)
        .get('/api/faculty/student/usr_student_active')
        .set(studentHeaders);
      expect(res.status).toBe(403);
    });
  });

  describe('3. Faculty Role Forbidden Matrix (Must return 403)', () => {
    it('blocks faculty from accessing /api/admin/overview', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(facultyHeaders);
      expect(res.status).toBe(403);
    });

    it('blocks faculty from creating user accounts via /api/admin/users', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set(facultyHeaders)
        .send({ username: 'FacUserCreate', email: 'fac_create@test.com', role: 'student' });
      expect(res.status).toBe(403);
    });

    it('blocks faculty from deleting user accounts via /api/admin/users/:id', async () => {
      const res = await request(app)
        .delete('/api/admin/users/some_random_user_id')
        .set(facultyHeaders);
      expect(res.status).toBe(403);
    });
  });

  describe('4. Authorized Role Matrix (Must succeed with 200/201)', () => {
    it('allows Admin to access /api/admin/overview', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set(adminHeaders);
      expect(res.status).toBe(200);
    });

    it('allows Admin to access /api/faculty/overview', async () => {
      const res = await request(app)
        .get('/api/faculty/overview')
        .set(adminHeaders);
      expect(res.status).toBe(200);
    });

    it('allows Faculty to access /api/faculty/overview', async () => {
      const res = await request(app)
        .get('/api/faculty/overview')
        .set(facultyHeaders);
      expect(res.status).toBe(200);
    });

    it('allows Student to access /api/problems', async () => {
      const res = await request(app)
        .get('/api/problems')
        .set(studentHeaders);
      expect(res.status).toBe(200);
    });

    it('allows Student to access their /api/analytics', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set(studentHeaders);
      expect(res.status).toBe(200);
    });
  });
});
