# Pathfinder

**video:**
https://drive.google.com/file/d/1o6bEzHknvmTcia5nPZBCLullwQOFGLD1/view?usp=drive_link

> **Personalized learning pathways, educator-controlled curricula, and server-authoritative mastery progression.**

[![Live Production](https://img.shields.io/badge/Production_Deployment-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mernfinalproject-snowy.vercel.app)
[![API Health](https://img.shields.io/badge/API_Status-Healthy-10b981?style=for-the-badge&logo=fastapi&logoColor=white)](https://mernfinalproject-snowy.vercel.app/api/health)
[![Automated Tests](https://img.shields.io/badge/Test_Suite-20%2F20_Passing-6366f1?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/thekrishmellow/mernfinalproject)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas_%26_Memory_Server-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

---

## 1. Project Title

**Pathfinder** (Repository: `mernfinalproject` / `personalized-roadmap-platform`)

---

## 2. Tagline

**A full-stack personalized learning pathway engine that empowers educators to design modular roadmaps, enforce prerequisite assessment gates, and guide learners through structured mastery journeys.**

---

## 3. Project Overview

Pathfinder is a full-stack MERN application built to solve the rigidity and fragmentation of modern learning management systems. Rather than forcing every student down an identical, static syllabus, Pathfinder enables instructors, mentors, parents, and educational organizations to design customized, visual learning roadmaps and assign them to specific learners.

The platform combines an interactive drag-and-drop node canvas (inspired by `roadmap.sh`), a gamified step-by-step milestone trail (inspired by BYJU'S), an assessment engine with automated PDF question extraction, and a server-authoritative progression engine.

### Core Philosophy
> *"Every learner should receive a deliberately designed learning journey, and every educator should have a clear view of how that journey is progressing."*

---

## 4. The Problem

Traditional learning management systems (LMS) and static curriculum repositories suffer from persistent pedagogical and architectural bottlenecks:

1. **One-Size-Fits-All Curricula**: Courses are arranged in linear lists that fail to accommodate varying student backgrounds, pacing, or remediation needs.
2. **Cognitive Overload**: Students presented with large course catalogs often lose sight of their immediate objective, their current milestone, and the path forward.
3. **Scattered Learning Artifacts**: Study resources are fragmented across YouTube videos, local PDF files, external websites, and disparate quiz tools.
4. **Superficial Progression ("Click-Through" Learning)**: Platforms allow students to mark lessons complete without demonstrating comprehension or satisfying prerequisites.
5. **Disconnected Instructor Oversight**: Educators lack a single dashboard that correlates visual curriculum structure with real-time assignment completion and quiz pass rates.
6. **Fragile Draft Edits**: In traditional systems, when an instructor edits an active syllabus, in-flight students experience broken links, altered requirements, or lost progress.

---

## 5. The Solution

Pathfinder addresses these challenges through a unified, prerequisite-driven architecture:

- **Visual Directed Acyclic Graph (DAG) Roadmaps**: Curricula are modeled as directed graphs where nodes represent distinct topics, exercises, or milestone assessments, and edges represent strict prerequisite relationships.
- **Server-Authoritative Progression Invariants**: Downstream nodes remain locked with explicit prerequisite explanations until the backend verifies that all preceding requirements (checklists, resource attestation, and passing quiz thresholds) have been satisfied.
- **Immutable Version Snapshots**: Publishing a roadmap creates an immutable `RoadmapVersion`. When roadmaps are republished, the progression engine intelligently synchronizes active student assignments while preserving previously completed work.
- **Centralized Multimedia Workspaces**: Each node encapsulates embedded YouTube videos, GitHub-Flavored Markdown notes, authenticated PDF file previews, and timed quizzes within a distraction-free student workspace.
- **Passwordless & Invitation-Based Access**: Flexible authentication supports passwordless magic links, single-use cohort invitation tokens, Google OAuth 2.0, and standard email/password authentication.
- **Real-Time Instructor Analytics**: Instructors monitor active assignments, cohort pass percentages, average scores, and recent student activity from an integrated control center.

---

## 6. Key Features

### ✅ Implemented Features (Verified in Codebase)

#### Visual Roadmap Studio & Authoring
- **Interactive Drag-and-Drop Canvas**: Built with `@xyflow/react` (React Flow) featuring custom node types, smoothstep bezier connectors, auto-fit viewports, minimap, and live node search.
- **Node Taxonomy**:
  - `start`: Overview, prerequisites, and orientation.
  - `learning`: Theoretical concepts and reading materials.
  - `practice`: Hands-on coding exercises, assignments, and labs.
  - `quiz`: Gated assessments requiring a minimum passing percentage.
  - `project`: Capstone builds and implementation milestones.
  - `completion`: Curriculum graduation flag.
- **Graph & Cycle Validation**: Backend validation engine ([graphValidationService.js](file:///Users/krishnabhatia/mernfinalproject/server/src/services/roadmap/graphValidationService.js)) enforces DAG integrity using Depth-First Search (DFS) topological sorting to reject circular dependencies, self-loops, and dangling edges.
- **Roadmap Duplication & Drafts**: Instructors can duplicate existing roadmaps, modify draft canvases independently, and publish version snapshots.

#### Assessment Engine & Question Bank
- **Question Types**: Single-choice (radio), True/False, and Multiple-choice (multi-select with full-set matching).
- **Automated PDF & Text Extraction**: Upload PDF or text/markdown study notes. The backend ([documentExtractionService.js](file:///Users/krishnabhatia/mernfinalproject/server/src/services/extraction/documentExtractionService.js)) parses candidate prompts, choices, and detected answer keys using `pdf-parse` for educator review before insertion.
- **Structured CSV / JSON Import**: Bulk question import with downloadable templates and row-level validation.
- **Server-Side Grading & Answer Protection**: Answer keys and explanations are stripped from client payloads before quiz attempts are served. Grading and threshold verification happen exclusively on the backend ([quizGradingService.js](file:///Users/krishnabhatia/mernfinalproject/server/src/services/quizzes/quizGradingService.js)).
- **Timed Attempts & Randomization**: Configurable quiz timers with automatic expiration, question shuffling, and option shuffling.

#### Learner Experience & Gamified Milestones
- **Dual Visual Modes**:
  - **Learning Trail (Byju's Style)**: A winding step-by-step milestone path with locked/unlocked stations, progress rings, and celebratory confetti animations.
  - **Knowledge Graph View**: The full relational dependency graph view.
- **Interactive Node Workspace**:
  - Embedded YouTube video player with clean time formatting.
  - GitHub-Flavored Markdown reader with code syntax highlighting and table formatting.
  - Authenticated PDF previews and secure file downloads.
  - Interactive checklists that recalculate node progress in real time.
  - Dynamic **"Continue to Next Module"** topological navigation upon completion.
- **Explicit Lock Reasons**: Locked nodes display clear prerequisite reasons (e.g., `Complete prerequisite: "Web Architecture"`).

#### Progression & Access Control
- **Server-Authoritative Progression Engine**: [progressionService.js](file:///Users/krishnabhatia/mernfinalproject/server/src/services/progression/progressionService.js) evaluates checklist tasks, mandatory resource attestation, and quiz passing scores (`score >= passingPercentage`, default 80%) before marking nodes complete and recursively unlocking downstream nodes.
- **Assignment Version Synchronization**: Intelligently synchronizes active student assignments when instructors publish updated roadmap versions without corrupting completed work.
- **Single & Bulk Client Assignments**: Assign roadmaps to individual students or cohorts with expiring single-use invitation tokens.
- **Flexible Authentication**: Support for email/password, passwordless magic login tokens, Google OAuth 2.0, and invitation links.
- **Role-Based Guards**: Strict middleware separation (`requireAdmin` vs. `requireAuth`) isolating instructor studio controls from learner views.

### 🔮 Planned Features (Conceptual / Future Roadmap)
- **Dedicated Parent Sub-Role**: A scoped guardian role with read-only oversight limited to their children's progress.
- **Automated Remediation Branching**: Dynamic branch generation inserting practice modules when a learner fails an assessment multiple times.
- **In-App Direct Code Execution**: Sandboxed containerized execution runner for browser-based programming assignments.
- **LTI 1.3 / SCORM Integration**: Export roadmaps to integrate directly with Canvas, Blackboard, or Google Classroom.
- **Production Email Delivery**: Automated transactional email dispatch for invitation links and progress digests (currently operates in local development capture mode).

---

## 7. How It Works

Pathfinder enforces a strict prerequisite-driven learning journey. The workflow below illustrates how a learner progresses through an assigned roadmap:

```mermaid
flowchart TD
    A["Assigned Learning Pathway"] --> B["Node 1: Foundational Theory (Available)"]
    A -.-> C["Node 2: Hands-on Practice (Locked)"]
    A -.-> D["Node 3: Milestone Assessment (Locked)"]

    B --> B1["Read In-App Markdown Notes"]
    B --> B2["Watch Embedded Video Lecture"]
    B --> B3["Complete Task Checklist"]

    B1 --> B4{"All Node 1 Requirements Met?"}
    B2 --> B4
    B3 --> B4
    B4 -- No --> B["Remain In Progress"]
    B4 -- Yes --> B5["Backend Marks Node 1 Completed"]

    B5 --> E["Progression Engine Recalculates Downstream Nodes"]
    E --> C["Node 2 Unlocks: Status Changed to Available"]

    C --> C1["Complete Coding Exercise Checklist"]
    C1 --> C2["Backend Marks Node 2 Completed"]

    C2 --> F["Progression Engine Evaluates Node 3 Prerequisites"]
    F --> D["Node 3 Assessment Gate Unlocks"]

    D --> G["Start Timed Quiz Attempt (Answer Keys Scrubbed)"]
    G --> H["Submit Answers to Backend"]
    H --> I{"Score >= Passing Threshold (e.g. 80%)?"}
    I -- No --> J["Attempt Failed: Review Materials & Retake"]
    J --> G
    I -- Yes --> K["Quiz Passed: Node 3 Completed"]
    K --> L["Unlock Capstone / Final Graduation Milestone"]
```

---

## 8. System Architecture

The application is structured as a decoupled full-stack architecture with a React Single-Page Application (SPA) frontend, an Express.js REST API backend, and a MongoDB persistence layer.

```mermaid
graph TB
    subgraph ClientLayer["Frontend Client (React 18 + Vite)"]
        UI["Tailwind CSS + Lucide Icons + Three.js"]
        Canvas["Roadmap Studio (@xyflow/react)"]
        Trail["Byju's Milestone Track"]
        Workspace["Node Workspace (Markdown + Video + Quiz)"]
        AuthContext["Auth Context & Token Bootstrapping"]
        ErrorBoundary["Global Error Boundary"]
    end

    subgraph APILayer["Backend Server (Express.js REST API)"]
        RateLimit["Rate Limiting & Helmet Security"]
        AuthMiddleware["JWT & Cookie Authentication Middleware"]
        RoleGuard["Role Boundary Guard (Admin vs Client)"]
        
        subgraph Controllers["Route Controllers"]
            AuthCtrl["Auth & Invitations"]
            RoadmapCtrl["Roadmap & Version Studio"]
            ClientCtrl["Client Learning Workspace"]
            QuizCtrl["Quiz & Question Bank"]
            ResourceCtrl["Resource Library"]
            AnalyticsCtrl["Admin Analytics"]
        end

        subgraph CoreServices["Domain Services"]
            GraphVal["graphValidationService (DFS Cycle Check)"]
            ProgEngine["progressionService (Gated Unlocking)"]
            QuizEngine["quizGradingService (Scrubbed Scoring)"]
            DocExtract["documentExtractionService (PDF/Text Parser)"]
            Storage["storageService (GridFS / Local Disk)"]
            EmailServ["emailService (SMTP / Dev Logger)"]
        end
    end

    subgraph DataLayer["Persistence Layer"]
        Atlas[("MongoDB Atlas / In-Memory Server")]
        GridFS[("GridFS Bucket: Cloud Uploads")]
    end

    ClientLayer -->|HTTPS REST / JSON| RateLimit
    RateLimit --> AuthMiddleware
    AuthMiddleware --> RoleGuard
    RoleGuard --> Controllers
    Controllers --> CoreServices
    CoreServices --> DataLayer
```

---

## 9. Technology Stack

### Frontend Client
| Technology | Version | Purpose in Platform |
| :--- | :--- | :--- |
| **React** | `^18.3.1` | Core declarative component UI library. |
| **Vite** | `^6.0.7` | High-performance build tool and ESM dev server with backend API proxy. |
| **React Router DOM** | `^6.28.1` | Client-side routing with role-protected route guards. |
| **@xyflow/react** | `^12.4.2` | Interactive node-based graph canvas (React Flow). |
| **Tailwind CSS** | `^3.4.17` | Utility-first styling with custom dark-mode aesthetics. |
| **Lucide React** | `^0.474.0` | Clean, modern iconography throughout the UI. |
| **React Markdown & Remark GFM** | `^9.0.3` / `^4.0.0` | In-app rendering of study notes with GitHub-Flavored Markdown tables. |
| **Axios** | `^1.7.9` | HTTP client with cookie interceptors and error handling. |
| **canvas-confetti** | `^1.9.4` | Milestone completion celebration animations. |
| **Three.js & @designcodeio/threeui** | `^0.186.1` / `^1.2.0` | Ambient background visuals and 3D UI elements. |

### Backend API
| Technology | Version | Purpose in Platform |
| :--- | :--- | :--- |
| **Node.js** | `>=18.0.0` | Scalable JavaScript server runtime (ES Modules). |
| **Express.js** | `^4.21.2` | Web application framework for RESTful routing. |
| **MongoDB / Mongoose** | `^8.9.5` | ODM for structured schema modeling and validation. |
| **mongodb-memory-server** | `^10.1.3` | Automatic zero-configuration in-memory database fallback. |
| **jsonwebtoken** | `^9.0.2` | Signed JWT session token generation and verification. |
| **bcryptjs** | `^3.0.2` | Salted password hashing (cost factor 12). |
| **Zod** | `^3.24.2` | Strict runtime request schema validation. |
| **pdf-parse** | `^1.1.1` | Buffer-level text extraction from uploaded PDF documents. |
| **multer** | `^1.4.5-lts.1` | Multipart/form-data handler for file and document uploads. |
| **nodemailer** | `^6.10.0` | Transactional email delivery for invitations and password resets. |
| **Helmet & Rate Limit** | `^8.0.0` / `^7.5.0` | HTTP security headers and brute-force request limiting. |

### Testing & Infrastructure
| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Vitest** | `^3.0.5` | Fast ESM unit and integration testing engine. |
| **Supertest** | `^7.0.0` | End-to-end HTTP endpoint integration assertions. |
| **Vercel** | Serverless | Production static hosting and serverless API execution. |
| **Docker Compose** | Standard | Local multi-container database orchestration. |

---

## 10. Repository Structure

```text
mernfinalproject/
├── client/                             # Frontend React Single-Page Application
│   ├── src/
│   │   ├── components/                 # Reusable UI primitives and view components
│   │   │   ├── auth/                   # GoogleAuthCard & login forms
│   │   │   ├── landing/                # Interactive product landing sections
│   │   │   ├── layout/                 # Navbar, Sidebar, LearnerNavbar, AppLayout
│   │   │   ├── learner/                # ByjuJourneyTrack, ByjuVideoPlayer, ProgressRing
│   │   │   ├── quizzes/                # QuizModal, ImportQuestionsModal
│   │   │   ├── resources/              # MarkdownViewer, AddYouTubeVideoModal
│   │   │   ├── roadmap/                # RoadmapCanvas, CustomRoadmapNode, NodeConfigPanel
│   │   │   └── ui/                     # ErrorBoundary, Modal, Toast, Button, Badge
│   │   ├── pages/                      # Top-level view routes
│   │   │   ├── admin/                  # AdminDashboard, RoadmapBuilder, AssignmentsPage
│   │   │   ├── auth/                   # LoginPage, RegisterPage, MagicLoginPage
│   │   │   └── client/                 # ClientDashboard, ClientRoadmapView, ClientNodeWorkspace
│   │   ├── services/                   # Axios API service configuration
│   │   ├── state/                      # AuthContext, session management
│   │   ├── utils/                      # Topological roadmap order, YouTube parser
│   │   ├── App.jsx                     # Route definitions, guards, and error boundary
│   │   ├── main.jsx                    # Application entrypoint
│   │   └── index.css                   # Tailwind directives and custom scrollbars
│   ├── package.json
│   └── vite.config.js                  # Vite dev server with /api proxy to port 5001
├── server/                             # Backend Express REST API
│   ├── src/
│   │   ├── config/                     # Environment loader, MongoDB connection, Storage
│   │   ├── controllers/                # Express controllers (Auth, Roadmap, Client, Quiz)
│   │   ├── middleware/                 # requireAuth, requireAdmin, validateRequest, rateLimiter
│   │   ├── models/                     # Mongoose schemas (User, Roadmap, Assignment, etc.)
│   │   ├── routes/                     # REST routes under /api/v1
│   │   ├── services/                   # Progression engine, graph validator, quiz grader
│   │   ├── utils/                      # Database seeder (seed.js) & crypto tokens
│   │   ├── validators/                 # Zod validation schemas
│   │   ├── app.js                      # Express middleware setup
│   │   └── server.js                   # Local server listener
│   ├── tests/                          # Automated test suites
│   │   ├── unit/                       # graphValidation, quizGrading, googleAuth tests
│   │   └── integration/                # apiWorkflow end-to-end integration tests
│   └── package.json
├── api/                                # Vercel serverless function entrypoint
│   └── index.js
├── shared/                             # Constants shared across packages
│   └── constants/                      # Roles, statuses, node categories, question types
├── .env.example                        # Sanitized environment variable template
├── docker-compose.yml                  # Local MongoDB container configuration
├── vercel.json                         # Vercel deployment routing and rewrites
└── package.json                        # Root npm workspaces configuration
```

---

## 11. Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (verified on Node `v18` through `v24`)
- **npm**: `v9.0.0` or higher
- **MongoDB** *(Optional)*: If no `MONGO_URI` is supplied, the server automatically starts an in-memory MongoDB instance (`mongodb-memory-server`) for zero-configuration evaluation.

### 1. Clone the Repository
```bash
git clone https://github.com/thekrishmellow/mernfinalproject.git
cd mernfinalproject
```

### 2. Install Dependencies
Install dependencies across both client and server workspaces from the root directory:
```bash
npm install
```

### 3. Configure Environment Variables
Copy the sanitized template file to create your local `.env`:
```bash
cp .env.example .env
```
*(Review Section 12 for configuration details).*

### 4. Seed the Database (Optional)
The server automatically seeds sample data on first boot if the database is empty. You can also manually seed sample roadmaps and accounts:
```bash
npm run seed
```

### 5. Run Development Servers
Start both the Express API and the Vite frontend concurrently via root `concurrently`:
```bash
npm run dev
```

Alternatively, run each service independently in separate terminals:
```bash
# Terminal 1: Backend API (runs on http://localhost:5001)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev:client
```

> **Note on Vite Proxying**: The Vite client dev server proxies all `/api` requests to `http://localhost:5001`. This ensures that session cookies, CORS headers, and API calls function seamlessly in local development without cross-origin configuration.

### 6. Access the Platform
- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Base**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### 7. Seed Demo Credentials (Development Only)
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Instructor / Admin** | `admin@roadmap.local` | `Admin@123456!` | Full studio authoring, assignment management, analytics |
| **Learner / Client** | `alex@learner.local` | `Client@123456!` | Assigned learning trail, node workspace, quiz attempts |

> [!WARNING]
> The demo credentials above are created strictly for local development and demonstration. For production deployments, configure unique administrator credentials via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your production environment variables.

---

## 12. Environment Variables

Store these variables in a `.env` file at the repository root.

| Variable | Description | Default / Example | Scope / Requirement |
| :--- | :--- | :--- | :---: |
| `PORT` | Backend HTTP listening port. | `5001` | Optional |
| `NODE_ENV` | Environment mode (`development` or `production`). | `development` | Optional |
| `CLIENT_URL` | Base URL of the client frontend for CORS and redirects. | `http://localhost:5173` | **Required** |
| `VITE_API_URL` | Base URL for client Axios calls. Defaults to `/api/v1` (proxied by Vite). | `/api/v1` | Optional |
| `MONGO_URI` | MongoDB connection string. If omitted, starts in-memory DB. | `mongodb://localhost:27017/pathfinder` | Optional |
| `JWT_SECRET` | Secret key used to sign and verify JWT session tokens. | *Random string (32+ chars)* | **Required in Prod** (Dev fallback provided) |
| `JWT_EXPIRES_IN` | Duration before issued JWT tokens expire. | `7d` | Optional |
| `COOKIE_SECRET` | Secret key used to sign session cookies. | *Random string* | **Required in Prod** (Dev fallback provided) |
| `COOKIE_SAME_SITE` | Cookie SameSite policy (`lax` or `none`). | `lax` | Optional |
| `STORAGE_ADAPTER` | Storage provider (`gridfs`, `local`, `cloudinary`). | `gridfs` (cloud) / `local` | Optional |
| `UPLOAD_DIR` | Directory for local file storage fallback. | `./uploads` | Optional |
| `MAX_FILE_SIZE_MB` | Maximum permitted file upload size in megabytes. | `15` | Optional |
| `CLOUDINARY_URL` | Cloudinary integration string for cloud assets. | `cloudinary://key:secret@cloud` | Optional |
| `ADMIN_EMAIL` | Bootstrap administrator account email. | `admin@roadmap.local` | Optional |
| `ADMIN_PASSWORD` | Bootstrap administrator account password. | `Admin@123456!` | Optional |
| `EMAIL_PROVIDER` | Email provider (`development` or `smtp`). | `development` | Optional |
| `EMAIL_FROM` | Outgoing sender email address. | `support@roadmaplearning.local` | Optional |
| `SMTP_HOST` / `PORT` | SMTP server settings for transactional invitation emails. | `smtp.gmail.com` / `587` | Optional |
| `SMTP_USER` / `PASS` | SMTP authentication credentials. | *(Your credentials)* | Optional |
| `VITE_GOOGLE_CLIENT_ID`| Google Cloud OAuth 2.0 Client ID for popup login. | *(Your Google Client ID)* | Optional |

---

## 13. Application Workflow

### Step 1: Educator Designs a Learning Pathway
1. The instructor signs in (`admin@roadmap.local`) and enters the **Admin Studio**.
2. Using the **Roadmap Builder**, they drag node templates onto the canvas (`start`, `learning`, `practice`, `quiz`, `project`, `completion`).
3. Connecting nodes with edges defines prerequisite dependencies. The backend evaluates DFS graph traversal to guarantee DAG compliance.
4. The instructor attaches learning resources (embedded YouTube videos, Markdown notes, or uploaded PDFs) and links assessment quizzes.
5. The instructor clicks **Publish**. The backend generates an immutable `RoadmapVersion` snapshot.

### Step 2: Distribution & Assignment
1. The instructor navigates to **Assignments** and assigns the published roadmap to an existing student or invites a new student via email.
2. The system creates an `Assignment` and initializes `NodeProgress` records:
   - Root nodes (no incoming edges) are set to `available`.
   - Downstream nodes are set to `locked` with descriptive `lockReasons`.
3. If the recipient does not have an account, the system creates an `Invitation` token, allowing them to accept and create their password.

### Step 3: Learner Progresses Through the Pathway
1. The learner signs in (`alex@learner.local`) and sees their assigned roadmap on the **Client Dashboard**.
2. Opening the path displays the **Learning Milestones Trail**.
3. The learner enters an available node workspace, completes the task checklist, attests learning materials, and completes the gated assessment quiz.
4. Upon meeting all node completion conditions, the backend transitions the node to `completed`.
5. The progression engine recursively evaluates downstream locked nodes using an **AND rule**: when all incoming prerequisites are completed, the downstream station unlocks automatically.

### Step 4: Iterative Syllabus Updates
If an instructor publishes a new version of an assigned roadmap, `syncAssignmentProgress` reconciles active student progress—preserving completed tasks and quiz passes, updating lock reasons, and adding new nodes seamlessly.

---

## 14. Data Model

Pathfinder models relationships across users, curriculum graph snapshots, student assignments, invitations, and quiz attempts:

```mermaid
erDiagram
    User ||--o{ Roadmap : "creates (owner)"
    User ||--o{ Assignment : "enrolled as client"
    User ||--o{ Assignment : "assignedBy"
    User ||--o{ Invitation : "invitingAdmin"
    User ||--o{ Resource : "uploads"
    Roadmap ||--o{ RoadmapVersion : "has versions"
    Roadmap ||--o{ Assignment : "targets"
    Roadmap ||--o{ Invitation : "targets"
    RoadmapVersion ||--o{ Assignment : "pinned to"
    RoadmapVersion ||--o{ Invitation : "pinned to"
    Assignment ||--o{ NodeProgress : "tracks"
    Assignment ||--o{ QuizAttempt : "records"
    Quiz ||--o{ QuizAttempt : "graded against"

    User {
        ObjectId _id PK
        string name
        string email
        string passwordHash
        string role "admin or client"
        string accountStatus "active, suspended, pending_invitation"
        string googleId
        string magicLoginToken
    }

    Roadmap {
        ObjectId _id PK
        string title
        string description
        string category
        string visibility "private or shared"
        string status "draft, published, archived"
        ObjectId owner FK
        ObjectId currentPublishedVersion FK
        Array draftNodes
        Array draftEdges
    }

    RoadmapVersion {
        ObjectId _id PK
        ObjectId parentRoadmap FK
        int versionNumber
        Array nodes "id, title, type, tasks, resources, quizConfig, completionConditions"
        Array edges "id, source, target, type"
        ObjectId author FK
        string publicationNotes
    }

    Invitation {
        ObjectId _id PK
        string targetEmail
        string tokenHash
        ObjectId roadmap FK
        ObjectId publishedVersion FK
        ObjectId invitingAdmin FK
        string status "pending, accepted, expired, revoked"
        Date expiresAt
        ObjectId acceptedUser FK
    }

    Assignment {
        ObjectId _id PK
        ObjectId client FK
        string targetEmail
        ObjectId roadmap FK
        ObjectId publishedVersion FK
        ObjectId assignedBy FK
        ObjectId invitation FK
        string status "active, completed, archived, revoked"
        int progressPercentage
    }

    NodeProgress {
        ObjectId _id PK
        ObjectId assignment FK
        string nodeId
        string status "locked, available, in_progress, completed, failed"
        Array completedTasks
        Array completedResources
        boolean passedQuiz
        Array lockReasons
    }

    Quiz {
        ObjectId _id PK
        string title
        ObjectId owner FK
        int passingPercentage
        int timeLimitMinutes
        boolean randomizeQuestions
        boolean randomizeOptions
        Array questions "prompt, type, options, correctAnswers, points"
    }

    QuizAttempt {
        ObjectId _id PK
        ObjectId assignment FK
        ObjectId quizId FK
        ObjectId clientId FK
        string nodeId
        int attemptNumber
        int score
        int maxScore
        int percentage
        boolean passed
        Date submittedAt
    }

    Resource {
        ObjectId _id PK
        string title
        string type "markdown, pdf, text, link, video, book, exercise, file"
        string content
        string externalUrl
        string storageKey
        ObjectId uploader FK
    }
```

---

## 15. API Documentation

All application endpoints are served under `/api/v1` (with health routes accessible at `/api/health` and `/api/v1/health`) and return standardized JSON responses:

```json
{
  "success": true,
  "data": {},
  "message": "Optional status message"
}
```

### 1. Authentication & Session Endpoints
| Method | Route | Description | Auth Required | Parameters / Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Healthcheck and server status. | None | None |
| `POST` | `/api/v1/auth/google` | Google OAuth & direct profile authentication. | None | `{ role, profile }` |
| `POST` | `/api/v1/auth/register` | Register a new user account. | None | `{ name, email, password, role }` |
| `POST` | `/api/v1/auth/login` | Sign in with email and password. | None | `{ email, password }` |
| `POST` | `/api/v1/auth/magic-login/request` | Request passwordless login token via email. | None | `{ email }` |
| `POST` | `/api/v1/auth/magic-login/verify` | Authenticate using passwordless magic token. | None | `{ token }` |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token. | None | `{ email }` |
| `POST` | `/api/v1/auth/reset-password` | Reset account password using token. | None | `{ token, newPassword }` |
| `GET` | `/api/v1/auth/invitations/:token` | Verify single-use assignment invitation token. | None | Param: `token` |
| `POST` | `/api/v1/auth/invitations/accept` | Accept invitation & activate client account. | None | `{ token, name, password }` |
| `POST` | `/api/v1/auth/logout` | Clear HTTP-only session cookie. | None | None |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile. | `requireAuth` | None |

### 2. Admin Roadmap Studio Endpoints
| Method | Route | Description | Auth Required | Parameters / Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/roadmaps` | List roadmaps created by instructor. | `requireAdmin` | Query: `?status=&search=` |
| `POST` | `/api/v1/admin/roadmaps` | Create a new roadmap container. | `requireAdmin` | `{ title, description, category }` |
| `GET` | `/api/v1/admin/roadmaps/:roadmapId` | Fetch roadmap draft canvas and metadata. | `requireAdmin` | Param: `roadmapId` |
| `PATCH` | `/api/v1/admin/roadmaps/:roadmapId` | Update roadmap metadata (title, category). | `requireAdmin` | `{ title, description, category }` |
| `DELETE` | `/api/v1/admin/roadmaps/:roadmapId` | Delete roadmap and draft state. | `requireAdmin` | Param: `roadmapId` |
| `PUT` | `/api/v1/admin/roadmaps/:roadmapId/draft` | Save canvas nodes, edges, and node configs. | `requireAdmin` | `{ nodes, edges }` |
| `POST` | `/api/v1/admin/roadmaps/:roadmapId/publish` | Validate DAG & publish version snapshot. | `requireAdmin` | `{ publicationNotes }` |
| `POST` | `/api/v1/admin/roadmaps/:roadmapId/duplicate` | Clone roadmap with all nodes and config. | `requireAdmin` | Param: `roadmapId` |

### 3. Assignments & Invitations Endpoints
| Method | Route | Description | Auth Required | Parameters / Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/assignments` | List all student assignments and statuses. | `requireAdmin` | Query: `?status=&roadmapId=` |
| `POST` | `/api/v1/assignments` | Assign roadmap to an individual student email. | `requireAdmin` | `{ roadmapId, clientEmail }` |
| `POST` | `/api/v1/assignments/bulk` | Bulk assign roadmap to multiple emails. | `requireAdmin` | `{ roadmapId, clientEmails: [] }` |
| `POST` | `/api/v1/assignments/:assignmentId/revoke` | Revoke student access to an assignment. | `requireAdmin` | Param: `assignmentId` |
| `POST` | `/api/v1/assignments/:assignmentId/resend-invitation` | Resend expiring invitation token. | `requireAdmin` | Param: `assignmentId` |

### 4. Client Learning Workspace Endpoints
| Method | Route | Description | Auth Required | Parameters / Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/client/dashboard` | Fetch student assignments & statistics. | `requireAuth` | None |
| `POST` | `/api/v1/client/assignments/:assignmentId/accept` | Accept and activate assigned pathway. | `requireAuth` | Param: `assignmentId` |
| `GET` | `/api/v1/client/assignments/:assignmentId/roadmap` | Fetch roadmap view with node statuses. | `requireAuth` | Param: `assignmentId` |
| `GET` | `/api/v1/client/assignments/:assignmentId/nodes/:nodeId` | Enter node workspace (enforces lock gate). | `requireAuth` | Params: `assignmentId`, `nodeId` |
| `POST` | `/api/v1/client/assignments/:assignmentId/nodes/:nodeId/tasks/:taskId/complete` | Toggle checklist task completion. | `requireAuth` | `{ isCompleted: boolean }` |
| `POST` | `/api/v1/client/assignments/:assignmentId/nodes/:nodeId/resources/:resourceId/complete` | Attest resource view/completion. | `requireAuth` | Params: `assignmentId`, `nodeId`, `resourceId` |
| `POST` | `/api/v1/client/assignments/:assignmentId/nodes/:nodeId/quiz/start` | Start timed assessment (answers stripped). | `requireAuth` | None |
| `POST` | `/api/v1/client/assignments/:assignmentId/nodes/:nodeId/quiz/attempts/:attemptId/submit` | Submit answers for server grading. | `requireAuth` | `{ answers: [] }` |

### 5. Quizzes & Question Extraction Endpoints
| Method | Route | Description | Auth Required | Parameters / Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/quizzes` | List instructor quiz question banks. | `requireAdmin` | None |
| `POST` | `/api/v1/quizzes` | Create a new quiz with passing percentage. | `requireAdmin` | `{ title, questions: [], passingPercentage }` |
| `GET` | `/api/v1/quizzes/:quizId` | Fetch full quiz details with answer keys. | `requireAdmin` | Param: `quizId` |
| `PATCH` | `/api/v1/quizzes/:quizId` | Update quiz settings and question items. | `requireAdmin` | `{ title, questions, passingPercentage }` |
| `DELETE` | `/api/v1/quizzes/:quizId` | Delete quiz from question bank. | `requireAdmin` | Param: `quizId` |
| `POST` | `/api/v1/quizzes/import` | Bulk import questions from CSV / JSON. | `requireAdmin` | `{ questions: [] }` |
| `POST` | `/api/v1/quizzes/extract-document` | Extract candidate questions from PDF/Text. | `requireAdmin` | Multipart: `document` file |

### 6. Resources & Analytics Endpoints
| Method | Route | Description | Auth Required | Parameters / Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/resources` | List uploaded learning resources. | `requireAdmin` | None |
| `POST` | `/api/v1/resources` | Upload file (PDF/Markdown/Media) or link. | `requireAdmin` | Multipart: `file` or `{ title, type, content }` |
| `GET` | `/api/v1/resources/:resourceId/download` | Stream protected PDF/file resource. | `requireAuth` | Param: `resourceId` |
| `GET` | `/api/v1/analytics/dashboard` | Overall cohort pass rates and assignments. | `requireAdmin` | None |
| `GET` | `/api/v1/analytics/roadmaps/:roadmapId` | Detailed metrics for a specific roadmap. | `requireAdmin` | Param: `roadmapId` |

---

## 16. Authentication and Permissions

### Role-Based Access Control (RBAC)
Pathfinder defines two distinct user roles in [`shared/constants/index.js`](file:///Users/krishnabhatia/mernfinalproject/shared/constants/index.js):

| Role | Intended Users | Capabilities & Permissions |
| :--- | :--- | :--- |
| `admin` | Instructors, Mentors, Teachers, Parents | Access to the **Admin Studio**, Visual Roadmap Builder, Question Bank, Document Question Extraction, Assignment Creation, and Cohort Analytics. |
| `client` | Students, Learners, Trainees, Employees | Access to the **Client Workspace**, Personal Dashboard, Assigned Learning Trails, Multimedia Content, Checklists, and Quiz Attempts. Protected from accessing `/api/v1/admin/*`. |

### Security Measures
- **HTTP-Only Cookies & Bearer Tokens**: Auth tokens are stored in signed, HTTP-only, SameSite cookies with fallback Bearer token authorization in request headers.
- **Answer Key Masking**: The quiz engine scrubs all answer keys and explanations before transmitting assessment payloads to learners.
- **Direct IDOR Protection**: Learners cannot access nodes or download resources belonging to roadmaps they are not explicitly assigned to.
- **Brute-Force Rate Limiting**: Dedicated rate limiters protect authentication (`authLimiter`) and quiz submission (`quizSubmissionLimiter`) endpoints.

---

## 17. Testing

Pathfinder includes an automated test suite executed via **Vitest** and **Supertest**. Tests run against an isolated in-memory MongoDB server (`mongodb-memory-server`) to ensure reproducible results without external database dependencies.

### Running the Test Suite
```bash
npm test
```

### Verified Test Results (20 / 20 Passing):
- **Graph Invariant Tests (`tests/unit/graphValidation.test.js` - 4 tests)**:
  - Validates valid Directed Acyclic Graphs (DAG).
  - Detects and rejects circular dependency loops (A -> B -> C -> A).
  - Rejects self-referential cycles (A -> A).
  - Rejects dangling edges pointing to non-existent nodes.
- **Assessment Engine Tests (`tests/unit/quizGrading.test.js` - 3 tests)**:
  - Verifies answer keys are scrubbed from learner payloads.
  - Validates 80% passing threshold calculations.
  - Records failed attempts without granting node completion.
- **Timed Quiz & Video Tests (`tests/unit/quizTimerAndVideo.test.js` - 3 tests)**:
  - Enforces quiz attempt expiration when timer runs out.
  - Validates extraction of 11-character YouTube IDs across multiple URL formats.
- **Google OAuth Tests (`tests/unit/googleAuth.test.js` - 3 tests)**:
  - Validates direct registration and login with role propagation.
- **End-to-End Workflow Integration (`tests/integration/apiWorkflow.test.js` - 7 tests)**:
  - Full lifecycle test: Admin registers -> builds roadmap -> publishes version -> assigns to student -> student attempts locked node (returns `403 Forbidden`) -> student completes prerequisite -> downstream module unlocks automatically.

---

## 18. Deployment

Pathfinder is deployed to **Vercel** with a serverless monorepo configuration:

- **Frontend**: Built via `vite build` into `dist/` and served as a high-performance static SPA.
- **Backend**: Managed via [`api/index.js`](file:///Users/krishnabhatia/mernfinalproject/api/index.js) and configured through [`vercel.json`](file:///Users/krishnabhatia/mernfinalproject/vercel.json), routing API calls (`/api/*`) to Express serverless handlers.
- **Database**: Connected to a cloud-hosted MongoDB Atlas cluster.
- **Read-Only Serverless File Protection**: The storage adapter uses `/tmp/uploads` for local disk operations and streams uploads directly to MongoDB GridFS in production.

### Live Production Deployment
- **Production URL**: [https://mernfinalproject-snowy.vercel.app](https://mernfinalproject-snowy.vercel.app)
- **API Health**: [https://mernfinalproject-snowy.vercel.app/api/health](https://mernfinalproject-snowy.vercel.app/api/health)

---

## 19. Real-World Applications

### 1. Personalized Computer Science Education
A coding mentor designs a foundational roadmap (*Web Architecture -> JavaScript Concurrency -> REST APIs -> Database Modeling*). A student who struggles with async programming is gated at the assessment level and provided targeted video resources before unlocking database integration.

### 2. Differentiated Classroom Instruction
A high school teacher assigns different pathways to students based on prerequisite diagnostics. Advanced students receive accelerated pathways with capstone project milestones, while students needing reinforcement follow paths with additional prerequisite practice exercises.

### 3. Parent-Supervised Homeschooling
A parent manages a structured weekly learning plan with educational videos and reading checkpoints. The parent reviews completed checklist items and quiz scores without needing to manage complex external spreadsheets.

### 4. Technical Mentorship & Career Preparation
A technical mentor constructs an interview preparation path (*Data Structures -> System Design -> Mock Interviews*). The mentee demonstrates mastery at each checkpoint, giving the mentor tangible evidence of readiness for technical roles.

### 5. Corporate Onboarding & Compliance Training
An engineering team builds an onboarding roadmap (*Security Policies -> Git Workflows -> Local Dev Setup -> First Pull Request*). New hires cannot submit PRs until compliance and security checkpoints have been verified by the server.

### 6. Tutoring & Private Coaching
Independent tutors organize distinct student curriculums under a single account. Tutors attach PDF worksheets, evaluate practice milestones, and track student completion dates from a centralized dashboard.

### 7. Intensive Bootcamp Programs
Bootcamp instructors track student progress across complex, multi-week software engineering paths. The admin analytics dashboard identifies students falling behind early, enabling targeted interventions before milestones are missed.

---

## 20. Current Limitations and Roadmap

### Current Limitations
- **Two Concrete Roles**: The platform implements `admin` and `client`. While parents, tutors, and teachers all use the `admin` role, dedicated sub-roles with restricted visibility are not yet separated in the database schema.
- **Static Passing Criteria**: The passing benchmark is currently configured per quiz (default 80%) rather than dynamically adjusting based on previous student attempts.
- **Local Video Storage**: Videos are supported via embedded YouTube links; direct self-hosted multi-gigabyte video streaming is not natively transcoded on the backend.

### Future Roadmap
- [ ] **Multi-Tenant Organizations**: Subdomain-based tenancy for schools, universities, and corporate teams.
- [ ] **Adaptive Remediation Branches**: Automatic insertion of review nodes when a learner fails a quiz attempt multiple times.
- [ ] **In-Browser Code Execution**: WebAssembly / containerized execution runners for evaluating coding submissions directly on the platform.
- [ ] **Automated Email Notifications**: Digest emails sent to instructors and learners when milestones are achieved or assignments are overdue.

---

## 21. Contributing

Contributions to Pathfinder are welcome! To contribute:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Your Changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Run the Automated Test Suite**:
   ```bash
   npm test
   ```
5. **Push to Your Branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** with a description of your changes and test coverage.

---

## 22. License

No license file was found in the repository at the time of documentation. All rights are reserved by the repository owner. To use, modify, or distribute this software, please obtain explicit permission from the author.

---

## 23. Acknowledgments

Pathfinder is built using open-source tools and libraries:

- [@xyflow/react](https://reactflow.dev/) — Interactive graph canvas for visual roadmap authoring.
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework.
- [Lucide Icons](https://lucide.dev/) — Icon design system.
- [Vitest](https://vitest.dev/) — Testing framework for modern JavaScript.
- [roadmap.sh](https://roadmap.sh) — Inspiration for visual learning roadmaps.
- [BYJU'S](https://byjus.com/) — Inspiration for gamified learning milestone tracks.
