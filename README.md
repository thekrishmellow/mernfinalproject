# Pathfinder — Full-Stack Personalized Roadmap Platform

Pathfinder is a production-minded full-stack MERN web application for designing personalized visual learning pathways, assigning them to individual clients, managing rich learning materials, enforcing server-authoritative quiz gating, and monitoring learner progress in real-time.

Inspired by the visual graph canvas of **roadmap.sh** and the structured gating of modern education platforms, Pathfinder guarantees that **no client can unlock a protected learning node, complete a required assessment, or access protected resources unless the backend verifies that all mandatory prerequisites have been satisfied.**

---

## 🚀 Key Features

### 1. Admin Studio
- **Visual Roadmap Builder**: Interactive node-based canvas powered by `@xyflow/react` (React Flow) with drag-and-drop, handles, edge routing, auto-fit, and node search.
- **Node Categories**: Introduction (`start`), Learning Module (`learning`), Hands-on Exercise (`practice`), Assessment Gate (`quiz`), Milestone Project (`project`), and Goal Completion (`completion`).
- **Graph & Cycle Validation**: Enforces Directed Acyclic Graph (DAG) integrity, prevents circular dependencies, rejects dangling edges, and detects root nodes.
- **Immutable Version Snapshots**: Publishing a roadmap creates an immutable `RoadmapVersion` snapshot. Active client assignments reference their published snapshot; future draft modifications never break active learners.
- **Distribution Modes**: Supports **Shared** (reusable path assignable to multiple clients) and **Private** (exclusive assignment) distribution modes.
- **Question Bank & Multi-Format Import**:
  - Multiple choice (single-answer), True/False, and Multiple-Select.
  - CSV & JSON structured imports with template downloads, row-by-row validation, and error reporting.
  - **Document-Based Extraction**: Upload PDF, Markdown, or Text files to extract candidate questions with an administrative approval and review screen before inserting.
- **Resource Library**: In-app Markdown notes with GFM formatting, authenticated PDF delivery with MIME checks, and external references.
- **Client Assignments**: Single and bulk assignment engine with cryptographically hashed, single-use, expiring invitation tokens.
- **Analytics & Progression Logs**: Aggregate pass rates, average quiz scores, completion statistics, and live learner timeline.

### 2. Client Learning Dashboard
- **Individual Learning Space**: Gated view displaying only authorized client assignments and personal progress.
- **Visual Roadmap View**: Visualizes the assigned curriculum with clear status indicators: `available`, `in_progress`, `completed`, and `locked`.
- **Gated Prerequisite Explanations**: Locked nodes explain exactly why they are locked (e.g. *"Complete prerequisite: Web Architecture & Fundamentals"*).
- **Interactive Node Workspace**:
  - In-app Markdown reader with code syntax highlighting and table formatting.
  - Authenticated access to PDFs and downloadable files (rejects unauthorized learners).
  - Required checklist task tracking.
  - Assessment Gate: Randomized questions without leaking answers, server-side grading, and passing threshold enforcement (default 80%).

### 3. Server-Authoritative Progression Engine
- Dedicated `progressionService.js` that evaluates all transitions.
- Evaluates:
  1. Checklist task completion.
  2. Mandatory resource attestation.
  3. Server-graded quiz pass (`percentage >= passingPercentage`).
- Recursively recalculates and unlocks downstream nodes using an **AND** rule (all predecessors must be completed).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, `@xyflow/react`, Lucide React, Axios, React Markdown, canvas-confetti |
| **Backend** | Node.js (ES Modules), Express.js, MongoDB, Mongoose 8 |
| **Authentication** | HTTP-Only Cookies, JWT, bcryptjs password hashing, Rate Limiting, Helmet |
| **Validation** | Zod Schema Validation |
| **Storage & Email** | Local/Extensible File Storage Adapter, Development / SMTP Email Adapter |
| **Testing** | Vitest, Supertest (14/14 automated unit & integration tests) |

---

## 📦 Monorepo Architecture

```text
mernfinalproject/
├── client/                     # Frontend Vite + React application
│   ├── src/
│   │   ├── components/         # UI primitives, layout, roadmap canvas, quizzes
│   │   ├── pages/              # Admin and Client view pages
│   │   ├── services/           # Axios API client
│   │   ├── state/              # AuthContext and session state
│   │   ├── App.jsx             # React Router route definitions
│   │   └── main.jsx
│   └── package.json
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # DB connection with auto-memory fallback & env
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, validation, rate limiting, error handler
│   │   ├── models/             # Mongoose schemas (User, Roadmap, Quiz, etc.)
│   │   ├── routes/             # REST API endpoints under /api/v1
│   │   ├── services/           # Progression, graph validation, quiz grading, storage
│   │   ├── utils/              # Token hashing & initial database seeder
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                  # Unit tests and E2E integration tests
│   └── package.json
├── shared/
│   └── constants/              # Shared roles, statuses, and types
├── docker-compose.yml          # Optional local MongoDB container
├── .env.example                # Documented environment configuration
├── package.json                # Root package.json with npm workspaces
└── README.md
```

---

## ⚡ Quick Start & Development Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

> **Zero-Config Database**: If MongoDB is not running locally, Pathfinder **automatically starts an in-memory MongoDB instance** (`mongodb-memory-server`) on launch! No Docker or manual database installation is required for local evaluation.

### 1. Install Dependencies
Run from the project root:
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(By default, the server runs on port `5001` and connects to the auto-starting in-memory MongoDB if `MONGO_URI` is omitted).*

### 3. Run Development Servers
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```
Or start them individually:
```bash
# Terminal 1: Backend API
npm run dev:server

# Terminal 2: Frontend Client
npm run dev:client
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
- **Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🔑 Default Seed Accounts

On initial startup, the database is automatically seeded with a comprehensive sample curriculum, 20-question assessment quiz, and two pre-configured accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@roadmap.local` | `Admin@123456!` | Full Admin Studio, Canvas Builder, Client Assignments |
| **Learner (Client)** | `alex@learner.local` | `Client@123456!` | Client Learning Dashboard, Gated Roadmap View |

---

## 🧪 Automated Testing

Run the test suite:
```bash
npm test
```
All **14 automated tests** will execute and pass via Vitest:
- **Unit Tests**:
  - `graphValidation.test.js`: DAG validation, DFS cycle detection, self-referential loop rejection, dangling edge prevention.
  - `quizGrading.test.js`: Answer key scrubbing for students, 80% passing threshold evaluation, failed attempt calculations.
- **Integration Tests**:
  - `apiWorkflow.test.js`:
    1. Registers first user as Admin and second user as Client.
    2. Role Boundary: Blocks clients from accessing `/admin` endpoints (403).
    3. Admin creates, drafts, validates, and publishes a roadmap version.
    4. Admin assigns the roadmap to the client, creating independent progress.
    5. Learner verifies Node 1 is available and Node 2 is locked.
    6. Security Invariant: Learner is rejected with 403 when attempting to access locked Node 2 workspace.
    7. Completing requirements for Node 1 unlocks Node 2!

To build the client production bundle:
```bash
npm run build
```

---

## 🛡️ Security & Access Control

1. **HTTP-Only Cookies & Token Verification**: Authentication is maintained through HTTP-only, SameSite cookies.
2. **Server-Authoritative Grading**: Question answer keys and explanations are stripped from client payloads before quiz attempts are served. Scoring and pass determinations happen exclusively on the server.
3. **IDOR & Path Traversal Protection**: File downloads require an active assignment with an unlocked node. Storage keys use sanitized basename checks to prevent path traversal.
4. **Rate Limiting**: Rate limiters protect authentication, API access, and quiz submissions against brute-force attacks.
