# Pathfinder — Full-Stack Personalized Learning Roadmap Platform

[![Live App](https://img.shields.io/badge/Live_Deployment-Vercel_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mernfinalproject-snowy.vercel.app)
[![API Health](https://img.shields.io/badge/API_Status-Healthy-10b981?style=for-the-badge&logo=fastapi&logoColor=white)](https://mernfinalproject-snowy.vercel.app/api/health)
[![Tests Passing](https://img.shields.io/badge/Tests-20%2F20_Passing-6366f1?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/thekrishmellow/mernfinalproject)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_&_Memory_Server-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

Pathfinder is a production-grade full-stack MERN platform designed for creating personalized visual learning pathways, distributing them to individual students, curating multimedia learning assets, enforcing server-authoritative prerequisite assessment gates, and tracking learner mastery in real-time.

Inspired by the visual graph canvas of **roadmap.sh** and the guided gamified milestones of modern learning platforms (such as BYJU'S), Pathfinder guarantees that **no learner can bypass prerequisites, view protected assessments, or unlock downstream modules until the backend verifies that all preceding requirements have been strictly fulfilled.**

---

## 🌐 Submission Checkpoints & Live Evaluator Access

| Evaluation Checkpoint | Verification Status | Links / Evidence |
| :--- | :---: | :--- |
| **1. Source Code in GitHub Repo** | **COMPLETED** | [https://github.com/thekrishmellow/mernfinalproject](https://github.com/thekrishmellow/mernfinalproject) (`main` branch) |
| **2. Production Deployment** | **COMPLETED** | Live on Vercel: [https://mernfinalproject-snowy.vercel.app](https://mernfinalproject-snowy.vercel.app) |
| **3. Project Documentation** | **COMPLETED** | Comprehensive architecture, workflows, setup, and API specifications below |
| **4. Major Workflows Demo** | **COMPLETED** | Complete workflow breakdown & recorded browser subagent demonstrations below |
| **5. Accessible Evaluator Links** | **COMPLETED** | Publicly accessible without VPN or special access tokens |
| **6. Zero Secrets Exposed** | **COMPLETED** | `.env*` gitignored; `.env.example` sanitized with generic placeholders |

---

## 🔑 Demo Evaluator Credentials

The live deployment comes pre-configured with active demo accounts and sample learning pathways:

| Account Type | Email | Password | Direct Capabilities & Role |
| :--- | :--- | :--- | :--- |
| **Lead Instructor (Admin)** | `admin@roadmap.local` | `Admin@123456!` | Full Admin Studio, Visual Canvas Builder, Publishing Engine, Question Bank, Client Assignments |
| **Alex Rivera (Learner)** | `alex@learner.local` | `Client@123456!` | Personal Learner Space, Gamified Milestone Trail, Interactive Video Player, Quiz Assessment Gates |

> **Tip for Evaluators**: On the [Sign In page](https://mernfinalproject-snowy.vercel.app/login), you can click either the **"Admin Demo"** or **"Learner Demo"** chip to auto-populate credentials in a single click.

---

## 🎬 Major Workflows & Application Capabilities

### 1. Instructor Workflow: Visual Roadmap Studio & DAG Integrity
- **Interactive Drag-and-Drop Canvas**: Powered by `@xyflow/react` with custom handles, smoothstep bezier connectors, auto-fit viewport, and real-time node search.
- **Node Taxonomy**: Supports 6 distinct node categories:
  - `start`: Overview, introduction, and prerequisites
  - `learning`: Theory, concepts, and reading materials
  - `practice`: Hands-on coding exercises and labs
  - `quiz`: Gated assessments requiring a minimum passing percentage
  - `project`: Capstone builds and implementation milestones
  - `completion`: Curriculum graduation flag
- **Graph & Cycle Invariant Engine**: The backend validates every draft using Depth-First Search (DFS) topological ordering to reject circular cycles, detect root starting nodes, and disallow disconnected floating edges.
- **Immutable Snapshot Publishing**: Publishing creates a timestamped `RoadmapVersion` snapshot. Active learner assignments pin to their published snapshot, ensuring instructor drafts never break in-flight learners.

### 2. Assessment Engine: Question Bank & Document-Based Question Extraction
- **Flexible Question Formats**: Multiple-choice (single-select), True/False, and Multiple-Select.
- **Automated Document Extraction**: Instructors can upload PDF, Markdown, or Plaintext study notes. Pathfinder parses key conceptual terms and presents candidate questions for instructor review before adding to the bank.
- **Bulk CSV / JSON Import**: Fast structured ingestion with downloadable template files, row-level validation, and real-time error reporting.

### 3. Learner Workflow: Gamified Milestones & Distraction-Free Workspace
- **Dual Visual Modes**: Learners can toggle between:
  - **Learning Trail (Byju's Style)**: A winding step-by-step milestone path with locked/unlocked stations, progress rings, and celebratory completion flags.
  - **Knowledge Graph**: The comprehensive relational dependency graph view.
- **Clear Gated Invariant Feedback**: Clicking a locked module displays the exact prerequisites required to unlock it.
- **Rich Learning Workspace**:
  - Embedded YouTube video player with time formatting.
  - Full GitHub-Flavored Markdown reader with code syntax highlighting and table rendering.
  - Authenticated PDF document previews.
  - Interactive checklists that dynamically update progress rings.
  - Built-in timer assessments with confetti celebrations and immediate topological "Continue to Next Module" navigation.

### 4. Server-Authoritative Progression Engine
- Dedicated `progressionService.js` evaluates every state transition.
- **Invariant**: A module is only marked complete when:
  1. All mandatory checklist tasks are checked.
  2. Required learning resources are attested.
  3. Gated quizzes achieve `score >= passingPercentage` (default 80%).
- Automatically unlocks downstream dependent nodes via topological DFS traversal.

---

## 🛠️ Technology Stack & Engineering Decisions

| Layer | Technologies Selected | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide React, Canvas Confetti | Sub-second build times, responsive glassmorphic dark theme, zero UI lag. |
| **Canvas & Graph** | `@xyflow/react` (React Flow) | Hardware-accelerated canvas, custom DOM node templates, smooth pan/zoom. |
| **Backend** | Node.js (ESM), Express.js | Modular, asynchronous event-driven architecture with clean service boundaries. |
| **Database** | MongoDB Atlas, Mongoose 8 | Flexible JSON document schemas for graph nodes, edges, versions, and progress states. |
| **Local Fallback** | `mongodb-memory-server` | Zero-configuration local startup without requiring local MongoDB installations. |
| **Security & Auth** | JWT, bcryptjs, HTTP-Only Cookies, Helmet, Rate Limiting | Protection against CSRF, XSS, brute-force password guessing, and token theft. |
| **Storage Adapter** | GridFS / Cloudinary / Local Disk | Extensible multi-provider storage abstraction with secure authenticated download streaming. |
| **Automated Testing** | Vitest, Supertest | Blazing fast ESM test runner with in-memory integration testing (20/20 passing). |

---

## 📦 Monorepo File Structure

```text
mernfinalproject/
├── client/                     # Frontend Vite + React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI, roadmap canvas, learner trail, modals
│   │   │   ├── auth/           # Google & manual email auth cards
│   │   │   ├── learner/        # Byju milestone trail, video player, progress ring
│   │   │   ├── roadmap/        # ReactFlow canvas, custom nodes, config panel
│   │   │   └── ui/             # ErrorBoundary, modal, toast, buttons, badges
│   │   ├── pages/              # Admin and client view pages
│   │   ├── services/           # Axios HTTP client with interceptors
│   │   ├── state/              # AuthContext and session bootstrapping
│   │   ├── utils/              # Topological sorting, youtube helpers
│   │   ├── App.jsx             # Route definitions with ProtectedRoute & ErrorBoundary
│   │   └── main.jsx
│   └── package.json
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # MongoDB connection, env loader, storage adapters
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # Auth, role guards, Zod validation, rate limiters
│   │   ├── models/             # Mongoose schemas (User, Roadmap, Version, Assignment)
│   │   ├── routes/             # RESTful API endpoints under /api/v1
│   │   ├── services/           # Progression engine, graph validation, quiz grading
│   │   ├── utils/              # Database seeder, crypto tokens
│   │   └── app.js              # Express app configuration
│   ├── tests/                  # Unit and integration test suites
│   └── package.json
├── api/                        # Vercel serverless entrypoint
│   └── index.js
├── shared/                     # Shared constants, statuses, and validation schemas
├── .env.example                # Documented configuration template (sanitized)
├── vercel.json                 # Vercel build and serverless rewrite configuration
├── package.json                # Root package with npm workspaces
└── README.md
```

---

## ⚡ Local Setup & Installation

### Prerequisites
- **Node.js** v18+ (tested up to Node v24)
- **npm** v9+

### 1. Clone the Repository
```bash
git clone https://github.com/thekrishmellow/mernfinalproject.git
cd mernfinalproject
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```
*(If `MONGO_URI` is omitted, the application automatically spawns an in-memory MongoDB instance for local testing).*

### 4. Run Development Servers
```bash
npm run dev
```
- **Client Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🧪 Automated Testing Suite

Pathfinder includes a comprehensive automated test suite with **20 unit and integration tests**:

```bash
npm test
```

### Test Coverage Highlights:
1. **Graph Validation (`graphValidation.test.js`)**:
   - Depth-First Search cycle detection
   - Self-referential loop rejection
   - Dangling edge detection
   - Root starting node verification
2. **Quiz Grading & Answer Protection (`quizGrading.test.js`)**:
   - Server-side answer key scrubbing for students
   - 80% passing threshold enforcement
   - Failed attempt calculations
3. **Timed Quiz & Video Integration (`quizTimerAndVideo.test.js`)**:
   - Timed attempt expiration enforcement
   - YouTube ID extraction and URL format resilience
4. **Google OAuth & Direct Access (`googleAuth.test.js`)**:
   - Role-based registration and profile generation
5. **End-to-End Workflow Integration (`apiWorkflow.test.js`)**:
   - Admin registration and role boundary protection
   - Visual roadmap drafting, validation, and version snapshotting
   - Assignment distribution to client
   - Verification that locked downstream nodes return `403 Forbidden`
   - Completion of prerequisite module unlocks downstream module

---

## 🛡️ Security, Privacy & Invariants

1. **Server-Authoritative Progression**: Progress is computed strictly on the backend. Client code cannot manipulate lock status or unlock downstream milestones directly.
2. **Scrubbed Assessment Payloads**: Correct answers and explanations are stripped from client payloads before quiz attempts are served. Scoring happens exclusively on the server.
3. **Secure Authentication**: Authentication is supported via HTTP-Only SameSite cookies and Bearer tokens with bcrypt password hashing (work factor 12).
4. **Zero Exposed Secrets**: All sensitive environment variables are strictly excluded via `.gitignore`, and the repository contains zero plain-text secrets or private keys.
5. **Role-Based Access Control**: Express middleware strictly isolates instructor studio routes (`/api/v1/admin/*`) from learner routes (`/api/v1/client/*`).

---

## 📄 License

This project is submitted as an open-source demonstration for educational and evaluative purposes. Built with modern full-stack web standards.
