import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { Roadmap } from '../../src/models/Roadmap.js';
import { RoadmapVersion } from '../../src/models/RoadmapVersion.js';
import { Assignment } from '../../src/models/Assignment.js';
import { NodeProgress } from '../../src/models/NodeProgress.js';

describe('End-to-End API Workflows & Gated Progression Security', () => {
  let adminToken = '';
  let clientToken = '';
  let adminUser = null;
  let clientUser = null;
  let createdRoadmapId = '';
  let assignmentId = '';

  beforeAll(async () => {
    await connectDB();
    // Clean test collections
    await Promise.all([
      User.deleteMany({}),
      Roadmap.deleteMany({}),
      RoadmapVersion.deleteMany({}),
      Assignment.deleteMany({}),
      NodeProgress.deleteMany({})
    ]);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('1. Registers first user as Admin and second user as Client', async () => {
    // Register Admin
    const resAdmin = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Super Admin',
        email: 'admin@test.local',
        password: 'Password@123'
      });

    expect(resAdmin.status).toBe(201);
    expect(resAdmin.body.data.user.role).toBe('admin');
    adminToken = resAdmin.body.data.token;
    adminUser = resAdmin.body.data.user;

    // Register Client
    const resClient = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Learner',
        email: 'jane@test.local',
        password: 'Password@123'
      });

    expect(resClient.status).toBe(201);
    expect(resClient.body.data.user.role).toBe('client');
    clientToken = resClient.body.data.token;
    clientUser = resClient.body.data.user;
  });

  it('2. Enforces Role Boundary: Client cannot access admin studio endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/roadmaps')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('3. Admin creates, drafts, validates, and publishes a roadmap with 2 nodes', async () => {
    // Create roadmap
    const createRes = await request(app)
      .post('/api/v1/admin/roadmaps')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Backend Mastery',
        description: 'Roadmap to backend mastery',
        category: 'Backend',
        visibility: 'shared'
      });

    expect(createRes.status).toBe(201);
    createdRoadmapId = createRes.body.data.roadmap._id;

    // Save draft with Node A -> Node B
    const nodes = [
      {
        id: 'node_a',
        title: 'Node A: Fundamentals',
        type: 'start',
        position: { x: 100, y: 100 },
        tasks: [{ id: 'task_a_1', text: 'Read overview', isRequired: true }],
        completionConditions: { requireAllTasks: true }
      },
      {
        id: 'node_b',
        title: 'Node B: Advanced',
        type: 'learning',
        position: { x: 100, y: 300 },
        tasks: [{ id: 'task_b_1', text: 'Build project', isRequired: true }],
        completionConditions: { requireAllTasks: true }
      }
    ];

    const edges = [
      { id: 'edge_a_b', source: 'node_a', target: 'node_b' }
    ];

    const draftRes = await request(app)
      .put(`/api/v1/admin/roadmaps/${createdRoadmapId}/draft`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nodes, edges });

    expect(draftRes.status).toBe(200);

    // Publish roadmap
    const publishRes = await request(app)
      .post(`/api/v1/admin/roadmaps/${createdRoadmapId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ publicationNotes: 'Version 1 Release' });

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.version.versionNumber).toBe(1);
  });

  it('4. Admin assigns the roadmap to the client, creating independent progress', async () => {
    const assignRes = await request(app)
      .post('/api/v1/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roadmapId: createdRoadmapId,
        clientId: clientUser._id
      });

    expect(assignRes.status).toBe(201);
    expect(assignRes.body.data.status).toBe('assigned');
    assignmentId = assignRes.body.data.assignment._id;
  });

  it('5. Learner can see assigned roadmap with Node A available and Node B locked', async () => {
    const res = await request(app)
      .get(`/api/v1/client/assignments/${assignmentId}/roadmap`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    const nodes = res.body.data.version.nodes;
    const nodeA = nodes.find((n) => n.id === 'node_a');
    const nodeB = nodes.find((n) => n.id === 'node_b');

    expect(nodeA.status).toBe('available');
    expect(nodeB.status).toBe('locked');
    expect(nodeB.lockReasons.length).toBeGreaterThan(0);
  });

  it('6. Security Invariant: Learner is rejected with 403 when attempting to access locked Node B workspace', async () => {
    const res = await request(app)
      .get(`/api/v1/client/assignments/${assignmentId}/nodes/node_b`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.lockReasons).toBeDefined();
  });

  it('7. Completing requirements for Node A unlocks Node B', async () => {
    // Complete task for Node A
    const completeRes = await request(app)
      .post(`/api/v1/client/assignments/${assignmentId}/nodes/node_a/tasks/task_a_1/complete`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ isCompleted: true });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.completed).toBe(true);
    expect(completeRes.body.data.progress.status).toBe('completed');

    // Inspect Node B now - it should have unlocked to 'available'!
    const roadmapRes = await request(app)
      .get(`/api/v1/client/assignments/${assignmentId}/roadmap`)
      .set('Authorization', `Bearer ${clientToken}`);

    const nodeB = roadmapRes.body.data.version.nodes.find((n) => n.id === 'node_b');
    expect(nodeB.status).toBe('available');

    // Now workspace access to Node B must succeed!
    const workspaceRes = await request(app)
      .get(`/api/v1/client/assignments/${assignmentId}/nodes/node_b`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(workspaceRes.status).toBe(200);
    expect(workspaceRes.body.data.node.id).toBe('node_b');
  });
});
