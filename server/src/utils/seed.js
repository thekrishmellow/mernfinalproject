import { User } from '../models/User.js';
import { Roadmap } from '../models/Roadmap.js';
import { RoadmapVersion } from '../models/RoadmapVersion.js';
import { Resource } from '../models/Resource.js';
import { Quiz } from '../models/Quiz.js';
import { Assignment } from '../models/Assignment.js';
import { initializeAssignmentProgress } from '../services/progression/progressionService.js';
import { env } from '../config/env.js';

export async function seedInitialData() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('ℹ️ Database already contains data. Skipping default seed.');
    return;
  }

  console.log('🌱 Seeding initial administrator, client, resources, and roadmap...');

  // 1. Create Default Administrator
  const adminPasswordHash = await User.hashPassword(env.ADMIN_PASSWORD);
  const admin = await User.create({
    name: 'Lead Instructor (Admin)',
    email: env.ADMIN_EMAIL,
    passwordHash: adminPasswordHash,
    role: 'admin',
    isEmailVerified: true,
    accountStatus: 'active'
  });

  // 2. Create Sample Learner
  const clientPasswordHash = await User.hashPassword('Client@123456!');
  const client = await User.create({
    name: 'Alex Rivera',
    email: 'alex@learner.local',
    passwordHash: clientPasswordHash,
    role: 'client',
    isEmailVerified: true,
    accountStatus: 'active'
  });

  // 3. Create Sample Resources
  const resourceMd1 = await Resource.create({
    title: 'Modern Web Architecture & HTTP Essentials',
    description: 'Core concepts of clients, servers, HTTP/2, REST protocols, and headers.',
    type: 'markdown',
    content: `# Modern Web Architecture

Welcome to the foundation of full-stack engineering!

## Key Pillars:
1. **Client-Server Architecture**: The separation of concerns between user-facing client applications and backend systems.
2. **Stateless HTTP**: Every request must contain all context necessary to understand and fulfill it.
3. **HTTP Methods & Idempotency**:
   - \`GET\`: Safe, idempotent read operations.
   - \`POST\`: Resource creation or action triggers.
   - \`PUT\`: Complete resource replacement.
   - \`PATCH\`: Partial updates.
   - \`DELETE\`: Resource removal.

\`\`\`javascript
// Centralized fetch pattern
const response = await fetch('/api/v1/health', {
  headers: { 'Accept': 'application/json' }
});
const data = await response.json();
console.log('System Status:', data.status);
\`\`\`

> **Core Rule**: Never trust user input on the server! Always enforce validation at the boundary.`,
    uploader: admin._id,
    estimatedMinutes: 15,
    tags: ['web', 'architecture', 'http']
  });

  const resourceMd2 = await Resource.create({
    title: 'JavaScript Event Loop & Concurrency Model',
    description: 'In-depth explanation of microtasks, macrotasks, Promises, and async execution.',
    type: 'markdown',
    content: `# JavaScript Event Loop & Concurrency

JavaScript is single-threaded with a non-blocking I/O event loop model.

## Phases of Execution:
- **Call Stack**: Executes synchronous function frames.
- **Microtask Queue**: \`Promise.then\`, \`queueMicrotask\`, \`MutationObserver\`. Highest priority after current stack empty.
- **Macrotask Queue**: \`setTimeout\`, \`setInterval\`, I/O callbacks.

\`\`\`javascript
console.log('1: Sync');
setTimeout(() => console.log('2: Macrotask Timeout'), 0);
Promise.resolve().then(() => console.log('3: Microtask Promise'));
console.log('4: Sync Finish');

// Output order: 1 -> 4 -> 3 -> 2
\`\`\``,
    uploader: admin._id,
    estimatedMinutes: 20,
    tags: ['javascript', 'event-loop', 'async']
  });

  const resourceLink = await Resource.create({
    title: 'MDN Web Docs: JavaScript Guide',
    description: 'Official Mozilla Developer Network comprehensive documentation.',
    type: 'link',
    externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    uploader: admin._id,
    estimatedMinutes: 25,
    tags: ['reference', 'mdn']
  });

  // 4. Create 20-Question Comprehensive Assessment Quiz
  const sampleQuestions = [
    {
      id: 'q1',
      prompt: 'Which HTTP status code signifies a successful resource creation?',
      type: 'single_choice',
      options: [
        { id: 'A', text: '200 OK' },
        { id: 'B', text: '201 Created' },
        { id: 'C', text: '204 No Content' },
        { id: 'D', text: '301 Moved Permanently' }
      ],
      correctAnswers: ['B'],
      explanation: 'HTTP 201 Created indicates that the request succeeded and led to the creation of a new resource.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q2',
      prompt: 'What queue does Promise.then() callbacks execute in?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'Macrotask Queue' },
        { id: 'B', text: 'Microtask Queue' },
        { id: 'C', text: 'Render Queue' },
        { id: 'D', text: 'Network Buffer' }
      ],
      correctAnswers: ['B'],
      explanation: 'Promise handlers run in the Microtask queue, which has higher priority than setTimeout macrotasks.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q3',
      prompt: 'True or False: HTTP PUT is generally designed to be idempotent.',
      type: 'true_false',
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ],
      correctAnswers: ['true'],
      explanation: 'Repeated PUT requests with the exact same payload should produce the exact same server state.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q4',
      prompt: 'Which flag protects an authentication cookie from being read by clientside JavaScript?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'Secure' },
        { id: 'B', text: 'HttpOnly' },
        { id: 'C', text: 'SameSite' },
        { id: 'D', text: 'Domain' }
      ],
      correctAnswers: ['B'],
      explanation: 'The HttpOnly flag prevents scripts from reading document.cookie, mitigating XSS token theft.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q5',
      prompt: 'Which MongoDB method ensures only unique values can be stored in a field?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'schema.addUnique()' },
        { id: 'B', text: 'Unique index: { unique: true }' },
        { id: 'C', text: 'db.isolate()' },
        { id: 'D', text: 'Mongoose $distinct' }
      ],
      correctAnswers: ['B'],
      explanation: 'A unique index in MongoDB enforces field uniqueness at the database engine level.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q6',
      prompt: 'What is the purpose of the CORS protocol?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'To encrypt WebSocket streams' },
        { id: 'B', text: 'To allow browsers to request resources from a different origin safely' },
        { id: 'C', text: 'To compress images in transit' },
        { id: 'D', text: 'To cache database queries' }
      ],
      correctAnswers: ['B'],
      explanation: 'Cross-Origin Resource Sharing permits browsers to negotiate requests across different domain/port origins.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q7',
      prompt: 'True or False: Password hashes should be computed using fast MD5 or SHA1 algorithms.',
      type: 'true_false',
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ],
      correctAnswers: ['false'],
      explanation: 'Passwords require slow, salted, work-factor algorithms like Argon2id or bcrypt to resist brute-forcing.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q8',
      prompt: 'Which React hook memoizes an expensive calculated value between re-renders?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'useCallback' },
        { id: 'B', text: 'useMemo' },
        { id: 'C', text: 'useRef' },
        { id: 'D', text: 'useEffect' }
      ],
      correctAnswers: ['B'],
      explanation: 'useMemo stores the calculated return value, while useCallback caches function references.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q9',
      prompt: 'What is the role of a middleware in Express.js?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'Only to compile TypeScript' },
        { id: 'B', text: 'To intercept, process, and pass along req/res objects in the pipeline' },
        { id: 'C', text: 'To replace the MongoDB driver' },
        { id: 'D', text: 'To render HTML templates on the client' }
      ],
      correctAnswers: ['B'],
      explanation: 'Middleware functions have access to req, res, and the next() function to chain behaviors.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q10',
      prompt: 'What does IDOR stand for in web security?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'Insecure Direct Object Reference' },
        { id: 'B', text: 'Internal Database Object Request' },
        { id: 'C', text: 'Integrated Dynamic Online Routing' },
        { id: 'D', text: 'Indexed Document Order Record' }
      ],
      correctAnswers: ['A'],
      explanation: 'IDOR occurs when an application exposes a reference to an internal object without access authorization checks.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q11',
      prompt: 'Which header tells browsers to prevent MIME-sniffing attacks?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'X-Frame-Options' },
        { id: 'B', text: 'X-Content-Type-Options: nosniff' },
        { id: 'C', text: 'Referrer-Policy' },
        { id: 'D', text: 'Content-Security-Policy' }
      ],
      correctAnswers: ['B'],
      explanation: 'X-Content-Type-Options: nosniff forces browsers to adhere strictly to the declared Content-Type.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q12',
      prompt: 'True or False: React state updates are asynchronous and can be batched.',
      type: 'true_false',
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ],
      correctAnswers: ['true'],
      explanation: 'React batches state updates together to optimize UI rendering performance.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q13',
      prompt: 'In Express, what must be called in middleware to pass control to the next handler?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'res.send()' },
        { id: 'B', text: 'next()' },
        { id: 'C', text: 'return true' },
        { id: 'D', text: 'process.continue()' }
      ],
      correctAnswers: ['B'],
      explanation: 'next() passes control to the next registered middleware in the pipeline.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q14',
      prompt: 'Which data structure does a Directed Acyclic Graph (DAG) prohibit?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'Linear paths' },
        { id: 'B', text: 'Closed cycles / loops' },
        { id: 'C', text: 'Multiple roots' },
        { id: 'D', text: 'Multiple branching paths' }
      ],
      correctAnswers: ['B'],
      explanation: 'A DAG cannot contain any cycles; traversing directed edges must never return to a previously visited node.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q15',
      prompt: 'What is the primary difference between localStorage and HTTP-only cookies?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'localStorage expires automatically after 5 minutes' },
        { id: 'B', text: 'HTTP-only cookies are inaccessible to clientside JavaScript, protecting against XSS token leakage' },
        { id: 'C', text: 'Cookies can hold 50MB of data' },
        { id: 'D', text: 'localStorage is sent with every HTTP request automatically' }
      ],
      correctAnswers: ['B'],
      explanation: 'HTTP-only cookies cannot be read via document.cookie, making them vastly safer against script injection.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q16',
      prompt: 'True or False: In a gated learning platform, the frontend can be trusted to calculate passing scores and unlock nodes.',
      type: 'true_false',
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ],
      correctAnswers: ['false'],
      explanation: 'All grading, prerequisite verification, and node unlocking MUST be authoritative and calculated on the server.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q17',
      prompt: 'Which Git command creates and switches to a new branch?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'git branch switch <name>' },
        { id: 'B', text: 'git checkout -b <name> or git switch -c <name>' },
        { id: 'C', text: 'git commit -b <name>' },
        { id: 'D', text: 'git merge --new <name>' }
      ],
      correctAnswers: ['B'],
      explanation: 'git switch -c or git checkout -b creates the branch and immediately moves HEAD to it.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q18',
      prompt: 'What does the SameSite=Lax cookie attribute protect against?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'Cross-Site Request Forgery (CSRF)' },
        { id: 'B', text: 'SQL Injection' },
        { id: 'C', text: 'Buffer Overflow' },
        { id: 'D', text: 'DDoS attacks' }
      ],
      correctAnswers: ['A'],
      explanation: 'SameSite=Lax restricts cookie transmission on cross-site requests, mitigating CSRF vulnerability.',
      difficulty: 'medium',
      points: 1
    },
    {
      id: 'q19',
      prompt: 'What is the purpose of rate limiting in backend APIs?',
      type: 'single_choice',
      options: [
        { id: 'A', text: 'To slow down database speed' },
        { id: 'B', text: 'To prevent abuse, brute force attacks, and resource exhaustion' },
        { id: 'C', text: 'To compress JSON responses' },
        { id: 'D', text: 'To validate Zod schemas' }
      ],
      correctAnswers: ['B'],
      explanation: 'Rate limiting constrains request frequency per IP or token to prevent abuse and denial of service.',
      difficulty: 'easy',
      points: 1
    },
    {
      id: 'q20',
      prompt: 'If a quiz has 20 questions and requires an 80% passing threshold, how many questions must be answered correctly to pass?',
      type: 'single_choice',
      options: [
        { id: 'A', text: '14' },
        { id: 'B', text: '15' },
        { id: 'C', text: '16' },
        { id: 'D', text: '18' }
      ],
      correctAnswers: ['C'],
      explanation: '20 questions * 80% = 16 correct questions required to pass.',
      difficulty: 'easy',
      points: 1
    }
  ];

  const quiz = await Quiz.create({
    title: 'Full-Stack Engineering Competency Exam',
    description: '20 comprehensive questions covering web architecture, JavaScript event loop, security headers, and MongoDB indexing.',
    owner: admin._id,
    questions: sampleQuestions,
    passingPercentage: 80,
    defaultQuestionsPerAttempt: 20,
    maxAttempts: 0,
    randomizeQuestions: true,
    randomizeOptions: true,
    showExplanationsAfterSubmission: true,
    allowRetake: true
  });

  // 5. Create Sample Connected Roadmap with 4 Nodes
  const sampleNodes = [
    {
      id: 'node_1_foundations',
      title: 'Web Architecture & Fundamentals',
      description: 'Understanding client-server separation, HTTP status codes, and network protocols.',
      type: 'start',
      position: { x: 300, y: 50 },
      estimatedDuration: '1 week',
      learningObjectives: [
        'Understand client-server architecture and HTTP request/response lifecycles',
        'Learn the difference between idempotent methods and state mutations'
      ],
      resourceIds: [resourceMd1._id, resourceLink._id],
      tasks: [
        { id: 't1_1', text: 'Read the Web Architecture & HTTP Essentials guide', isRequired: true },
        { id: 't1_2', text: 'Inspect network tab requests in browser devtools', isRequired: true }
      ],
      completionConditions: {
        requireAllTasks: true,
        requireAllResources: false,
        requireQuizPass: false
      },
      completionMessage: 'Great job! You have mastered the fundamentals of the web.'
    },
    {
      id: 'node_2_js_core',
      title: 'JavaScript Concurrency & Async Engine',
      description: 'Deep dive into the event loop, microtask queues, and asynchronous programming.',
      type: 'learning',
      position: { x: 300, y: 220 },
      estimatedDuration: '2 weeks',
      learningObjectives: [
        'Master the JS Event Loop, call stack, and task queues',
        'Write robust asynchronous code using Promises and async/await'
      ],
      resourceIds: [resourceMd2._id],
      tasks: [
        { id: 't2_1', text: 'Review Event Loop & Concurrency Model documentation', isRequired: true },
        { id: 't2_2', text: 'Build a promise-based retry utility in scratch editor', isRequired: true }
      ],
      completionConditions: {
        requireAllTasks: true,
        requireAllResources: true,
        requireQuizPass: false
      },
      completionMessage: 'Excellent work! You now understand JavaScript execution mechanics.'
    },
    {
      id: 'node_3_quiz_assessment',
      title: 'Full-Stack Security & Assessment Gate',
      description: 'Demonstrate competency in modern web security, cookies, and architecture. Must pass with >= 80%.',
      type: 'quiz',
      position: { x: 300, y: 390 },
      estimatedDuration: '1 week',
      learningObjectives: [
        'Demonstrate understanding of HttpOnly cookies, CORS, and IDOR prevention',
        'Pass the 20-question assessment with at least 80% score'
      ],
      resourceIds: [resourceMd1._id, resourceMd2._id],
      tasks: [
        { id: 't3_1', text: 'Review all core architecture guides before taking the exam', isRequired: true }
      ],
      quizConfig: {
        quizId: quiz._id,
        isRequired: true,
        passingPercentage: 80,
        questionsPerAttempt: 20,
        maxAttempts: 0
      },
      completionConditions: {
        requireAllTasks: true,
        requireAllResources: false,
        requireQuizPass: true
      },
      completionMessage: 'Outstanding achievement! You scored at least 80% on the core assessment.'
    },
    {
      id: 'node_4_capstone',
      title: 'Full-Stack Capstone Milestone',
      description: 'Assemble an end-to-end production application applying all learned concepts.',
      type: 'project',
      position: { x: 300, y: 560 },
      estimatedDuration: '3 weeks',
      learningObjectives: [
        'Deploy a full-stack MERN application with gated permissions and tests'
      ],
      resourceIds: [resourceLink._id],
      tasks: [
        { id: 't4_1', text: 'Design database schema with Mongoose models', isRequired: true },
        { id: 't4_2', text: 'Implement backend progression engine with unit tests', isRequired: true },
        { id: 't4_3', text: 'Build interactive visual canvas in React', isRequired: true }
      ],
      completionConditions: {
        requireAllTasks: true,
        requireAllResources: false,
        requireQuizPass: false
      },
      completionMessage: 'Congratulations! You have completed the Full-Stack Engineering Roadmap!'
    }
  ];

  const sampleEdges = [
    { id: 'edge_1_to_2', source: 'node_1_foundations', target: 'node_2_js_core', type: 'smoothstep', animated: true },
    { id: 'edge_2_to_3', source: 'node_2_js_core', target: 'node_3_quiz_assessment', type: 'smoothstep', animated: true },
    { id: 'edge_3_to_4', source: 'node_3_quiz_assessment', target: 'node_4_capstone', type: 'smoothstep', animated: true }
  ];

  const roadmap = await Roadmap.create({
    title: 'Full-Stack JavaScript & MERN Engineering',
    description: 'Comprehensive, structured path from web fundamentals to advanced concurrency, gated security assessments, and capstone deployment.',
    owner: admin._id,
    visibility: 'shared',
    category: 'Full-Stack Development',
    estimatedDuration: '6 weeks',
    accentColor: '#3b82f6',
    draftNodes: sampleNodes,
    draftEdges: sampleEdges
  });

  // Publish as Version 1
  const version1 = await RoadmapVersion.create({
    parentRoadmap: roadmap._id,
    versionNumber: 1,
    nodes: sampleNodes,
    edges: sampleEdges,
    author: admin._id,
    publicationNotes: 'Initial production curriculum release'
  });

  roadmap.status = 'published';
  roadmap.currentPublishedVersion = version1._id;
  await roadmap.save();

  // Assign to Alex Rivera
  const assignment = await Assignment.create({
    client: client._id,
    targetEmail: client.email,
    roadmap: roadmap._id,
    publishedVersion: version1._id,
    assignedBy: admin._id,
    status: 'active'
  });

  await initializeAssignmentProgress(assignment, version1);

  console.log('✅ Seed completed successfully:');
  console.log(`   Admin:  ${admin.email} / ${env.ADMIN_PASSWORD}`);
  console.log(`   Client: ${client.email} / Client@123456!`);
  console.log(`   Roadmap: "${roadmap.title}" (Version 1 published & assigned)`);
}

// Allow direct CLI execution: node src/utils/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const { connectDB, disconnectDB } = await import('../config/db.js');
  await connectDB();
  await seedInitialData();
  await disconnectDB();
  process.exit(0);
}
