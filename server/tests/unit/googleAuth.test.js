import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';

describe('Google Authentication Endpoint (/api/v1/auth/google)', () => {
  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: { $regex: /@google-test\.local$/ } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@google-test\.local$/ } });
    await disconnectDB();
  });

  it('signs up a new user as Learner (client) using Google profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        role: 'client',
        profile: {
          email: 'alex.learner@google-test.local',
          name: 'Alex Learner',
          picture: 'https://lh3.googleusercontent.com/a/learner-photo',
          sub: 'google-sub-1001'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('client');
    expect(res.body.data.user.email).toBe('alex.learner@google-test.local');
    expect(res.body.data.user.googleId).toBe('google-sub-1001');
    expect(res.body.data.token).toBeDefined();
  });

  it('signs up a new user as Admin using Google profile with admin role selected', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        role: 'admin',
        profile: {
          email: 'sarah.instructor@google-test.local',
          name: 'Sarah Instructor',
          picture: 'https://lh3.googleusercontent.com/a/instructor-photo',
          sub: 'google-sub-1002'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.user.email).toBe('sarah.instructor@google-test.local');
    expect(res.body.data.token).toBeDefined();
  });

  it('signs in an existing Google user without changing their existing role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        role: 'admin', // Attempts to ask for admin, but already client in DB
        profile: {
          email: 'alex.learner@google-test.local',
          name: 'Alex Learner',
          sub: 'google-sub-1001'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('client');
    expect(res.body.data.user.email).toBe('alex.learner@google-test.local');
  });
});
