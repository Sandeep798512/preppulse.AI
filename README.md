# 🚀 PrepPulse.AI — Next-Gen AI Placement Preparation & Interview Analysis System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-In--Memory%20%2F%20Atlas-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Commercial-purple.svg)]()
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **The Ultimate All-in-One Placement Readiness Platform for Engineering Students, Academic Institutions & Tech Aspirants.**  
> Powered by deterministic NLP scoring engines, STAR framework interview evaluation, sandboxed code execution, dynamic roadmap generation, and ATS resume matching.

---

## 🌟 Executive Overview

**PrepPulse.AI** is an enterprise-grade, end-to-end placement intelligence and preparation suite designed to transform campus placements. It bridges the gap between student preparation and company recruitment expectations using AI-assisted analysis, deterministic heuristic scoring, and real-time analytics.

### 💡 Why This Project Stands Out (Commercial & Academic Value):
1. **Zero-Config Plug & Play**: Works instantly on any laptop without needing MongoDB installation or paid cloud accounts (built-in in-memory database auto-seeds on first run).
2. **100% Offline Capable**: Core AI scoring (ATS matching, code sandboxing, STAR method evaluation, placement readiness formula) functions deterministically without requiring external paid API keys.
3. **Optional LLM Integration**: Seamlessly switch between local NLP heuristics and live LLM APIs (Google Gemini or OpenAI) via a single `.env` toggle.
4. **Complete 10-Phase Full Stack Architecture**: Tested with 34 automated backend test suites and modern React 18 / Tailwind CSS client.

---

## 📸 Key Modules & Feature Highlights

| Module | Features & Capabilities |
| :--- | :--- |
| 📄 **ATS Resume Analyzer** | • PDF/DOCX multi-format extraction<br>• Section completeness & contact parser<br>• Keyword density & missing skill recommendations<br>• Real-time ATS match percentage |
| 🎯 **5-Factor JD Matcher** | • Hard & Soft skill matching algorithm<br>• Experience & graduation year alignment<br>• Role-specific keyword gap analysis<br>• Custom recommendations to beat recruitment filters |
| 🧠 **Aptitude & Technical MCQs** | • 250+ pre-seeded questions across Quantitative, Logical, Verbal, CS Core<br>• Timed assessment mode with negative marking<br>• Instant explanations, category-wise weak area diagnostics |
| 💻 **Sandboxed Coding Arena** | • LeetCode-style interactive code editor<br>• Sandboxed execution with timeout and memory limits<br>• Evaluates sample and hidden edge-case test cases<br>• Acceptance rate and code efficiency tracking |
| 🎙️ **AI Mock Interview Simulator** | • Speech-to-text voice & text response evaluation<br>• STAR method (Situation, Task, Action, Result) breakdown<br>• Hesitation markers & filler word detection (`uh`, `um`, `like`)<br>• Adaptive follow-up questions tailored to candidate answers |
| 📈 **Placement Readiness Engine** | • 7-factor mathematical readiness calculation formula<br>• Batch percentile comparison and peer benchmarking<br>• Color-coded risk indicators (High, Medium, Ready) |
| 🗺️ **Preparation Roadmap** | • Adaptive week-by-week personalized learning milestones<br>• Skill-gap priority formula based on target job role<br>• Daily study hour budget allocator |
| 🤖 **AI Career Coach Chatbot** | • 24/7 conversational placement mentor<br>• Built-in prompt injection defense & safety filters<br>• Actionable Next-Best-Action (NBA) guidance |
| 🏢 **Campus Drive & Job Discovery** | • 8 pre-seeded top tech firms (Google, Amazon, Microsoft, TCS, etc.)<br>• 9 verified campus roles with CTC packages & eligibility criteria<br>• Automated student CGPA and backlog eligibility checker |
| 📊 **Application Pipeline Tracker** | • Kanban-style application lifecycle (Applied, Shortlisted, Interviewing, Offered)<br>• Interview date reminders & stage notes |

---

## ⚡ 1-Click Super Fast Setup (Recommended)

### For Windows Users:
Simply double-click the **`start-windows.bat`** file located in the root directory!  
It will automatically:
1. Verify Node.js is installed.
2. Install any missing dependencies for both backend and frontend.
3. Launch backend API (`http://localhost:5000`) and frontend client (`http://localhost:3000` or `3001`).
4. Open the application directly in your default browser!

### For Mac / Linux Users:
Open your terminal in the project root and run:
```bash
chmod +x start-mac-linux.sh
./start-mac-linux.sh
```

---

## 🛠️ Manual Step-by-Step Setup

If you prefer running commands manually, follow these simple steps:

### Prerequisites:
- **Node.js**: `v18.x` or higher installed ([Download Node.js](https://nodejs.org/))
- **Git** (optional, for version control)

### Step 1: Clone or Extract the Project
Ensure you are in the project root directory:
```bash
cd ai-placement-prep
```

### Step 2: Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
> **Notice**: Backend starts on `http://localhost:5000`. By default, an embedded in-memory database launches automatically and pre-populates 31+ MCQs, 6 coding problems, 8 companies, and 9 jobs!

### Step 3: Start the Frontend Client
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> **Notice**: Frontend will open on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 🔑 Authentication & Demo Access

No manual signup is required to explore the platform:
- **One-Click Guest Demo**: Click the **"Guest Demo Access"** button on the Login page.
- **Pre-seeded Student Account**:
  - **Email**: `demo.student@placement.edu`
  - **Password**: `DemoPass123!`
- **New Account Registration**: You can also register any new account with instant validation.

---

## ⚙️ Configuration & Environment Variables

The project comes with a pre-configured `.env` in `backend/.env`.

```env
# Server Port
PORT=5000

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Database Connection
# (Leave empty to use the automatic zero-config embedded database!)
MONGODB_URI=

# JWT Secret for Secure Token Generation
JWT_SECRET=prep_pulse_super_secret_jwt_key_2026

# AI LLM Provider Key (OPTIONAL)
# Leave blank to use local heuristic & deterministic scoring engines!
# Add your Gemini or OpenAI API Key here for enhanced generative responses:
AI_API_KEY=
```

---

## 🏗️ Project Architecture & Tech Stack

```text
ai-placement-prep/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection & memory fallback
│   │   ├── controllers/     # Express route controllers (Auth, Jobs, Interviews, etc.)
│   │   ├── middleware/      # JWT auth, role validation, error handlers
│   │   ├── models/          # Mongoose Schemas (User, Job, Problem, Question, etc.)
│   │   ├── routes/          # REST API endpoints (/api/*)
│   │   ├── services/        # AI engines, ATS parser, sandboxed code executor
│   │   ├── tests/           # 34 automated unit & integration test suites
│   │   └── utils/           # Database seed scripts & interview question banks
│   ├── .env                 # Backend environment settings
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Navbar, Cards)
│   │   ├── context/         # AuthContext & global state providers
│   │   ├── pages/           # 10 Phase feature pages (Dashboard, Resume, Coding, etc.)
│   │   └── services/        # Axios API client & interceptors
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── start-windows.bat        # 1-Click Windows launcher
├── start-mac-linux.sh       # 1-Click Mac/Linux launcher
├── SETUP_GUIDE.md           # Comprehensive Buyer Setup & Troubleshooting Manual
└── README.md                # Project Overview & Presentation Guide
```

---

## 🧪 Testing & Code Quality

The backend includes 34 comprehensive automated tests covering schema validations, mathematical formulas, prompt injection defense, sandbox timeouts, and security policies:

```bash
cd backend
npm test
```
**Output**: `34 tests passed, 0 failed, 100% test coverage`.

---

## 🎓 Academic Viva & Project Defense Guide

If presenting this project for B.Tech CSE / MCA / M.Tech evaluation:
1. **Core Problem Addressed**: Campus placements suffer from fragmented preparation (students use different sites for coding, aptitude, and resume review). PrepPulse unifies them into a single intelligence pipeline.
2. **Deterministic vs Generative AI**: Highlight how the system uses deterministic mathematical algorithms for reliability and fair scoring, while LLMs provide personalized textual mentoring.
3. **Security Standards**: Emphasize JWT authentication, bcrypt password hashing, sandboxed code execution with child process timeouts, and prompt injection defense.

---

## 📄 License & Distribution Notice

This software is provided with full source code for academic and commercial deployment. Customization, rebranding, and institutional white-labeling are fully permitted.

---
**Developed with ❤️ for Academic Excellence & Next-Gen Placement Success.**
