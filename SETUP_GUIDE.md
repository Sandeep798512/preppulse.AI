# 📘 Complete Buyer Setup Guide & Manual — PrepPulse.AI
### *Comprehensive Installation, Demonstration & Viva Presentation Guide*

---

## 🎯 Welcome & Congratulations!
Thank you for acquiring **PrepPulse.AI** — the complete, enterprise-grade AI Placement Preparation and Interview Intelligence System.

This guide is specially crafted so that **anyone can run this project on their laptop in under 2 minutes**, even if they are setting up a Node.js project for the first time.

---

## ⚡ Method 1: The 1-Click Instant Run (Recommended)

### 💻 For Windows Users:
1. Locate the file **`start-windows.bat`** in the main project folder.
2. **Double-click** on `start-windows.bat`.
3. The script will automatically:
   - Check if Node.js is installed.
   - Install all missing libraries (`npm install`) if running for the first time.
   - Start the Backend server on port `5000`.
   - Start the Frontend interface on port `3000` or `3001`.
   - Automatically launch your web browser to the dashboard!

---

## 🛠️ Method 2: Standard Manual Setup (Windows, macOS, Linux)

If you prefer opening terminals and running the project step-by-step, follow these 3 simple steps:

### 1️⃣ Prerequisites Check:
Make sure you have **Node.js** installed on your computer.
- Open your terminal / command prompt and type:
  ```bash
  node -v
  ```
  *(It should display `v18.0.0` or higher, e.g. `v20.x` or `v22.x`)*
- If not installed, download the recommended LTS version from [https://nodejs.org/](https://nodejs.org/) and install it (takes 1 minute).

---

### 2️⃣ Step 1: Start the Backend Server:
1. Open a terminal or Command Prompt.
2. Navigate to the `backend` directory:
   ```bash
   cd ai-placement-prep/backend
   ```
3. Install dependencies (only required the first time):
   ```bash
   npm install
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
5. You will see this output:
   ```text
   ⚡ MONGODB_URI not specified. Starting embedded MongoMemoryServer for instant execution...
   ✅ MongoDB Connected: 127.0.0.1
   🌱 Seeding Question Bank with 250+ original Aptitude & Technical MCQs...
   ✅ Successfully seeded 31 initial MCQs!
   🌱 Seeding Coding Problem Bank with original placement challenges...
   ✅ Successfully seeded 6 initial coding problems!
   ⚡ Seeding initial placement companies...
   ✅ Successfully seeded 8 top tech companies.
   ⚡ Seeding initial campus job openings...
   ✅ Successfully seeded 9 verified placement job openings.
   🚀 AI Placement Prep Server running on port 5000
   ```
   > 💡 **Keep this terminal open!** The backend is now actively listening on `http://localhost:5000`.

---

### 3️⃣ Step 2: Start the Frontend Client:
1. Open a **second terminal / Command Prompt window**.
2. Navigate to the `frontend` directory:
   ```bash
   cd ai-placement-prep/frontend
   ```
3. Install frontend libraries (only required the first time):
   ```bash
   npm install
   ```
4. Launch the development server:
   ```bash
   npm run dev
   ```
5. You will see:
   ```text
   VITE v5.4.x ready in 600 ms
   ➜  Local:   http://localhost:3000/ (or http://localhost:3001/)
   ```
6. Open your browser and go to: **[http://localhost:3000](http://localhost:3000)** (or the URL shown in terminal).

---

## 🔑 Login & Demo Credentials

When the website opens, you have two quick ways to access the dashboard:

| Option | Method | Details |
| :--- | :--- | :--- |
| **Instant 1-Click** | Click **"Guest Demo Access"** | Logins in immediately as a pre-configured student with sample scores, roadmap, and test history. |
| **Pre-loaded Account** | Email & Password | **Email**: `demo.student@placement.edu`<br>**Password**: `DemoPass123!` |
| **New Registration** | Click **"Create Account"** | Enter any Name, Email, Password, and target role (e.g. SDE, Data Analyst). |

---

## 🌐 Database Configuration (Zero-Config vs Real MongoDB)

### Does the buyer need to install MongoDB?
**NO!** 
- The project includes an **embedded In-Memory Database** (`mongodb-memory-server`).
- When `MONGODB_URI` is left blank in `.env`, the system automatically runs its own high-speed embedded database inside Node.js. It requires **zero external software installation**.

### If a college examiner insists on seeing a real MongoDB database:
1. Install **MongoDB Community Server** and **MongoDB Compass** on your laptop.
2. Open `backend/.env`.
3. Set your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/prep_pulse
   ```
4. Or connect to MongoDB Atlas (cloud):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/prep_pulse
   ```
5. Restart the backend. The database will automatically seed with all companies, questions, and test data!

---

## 🤖 AI API Configuration (Offline Heuristic vs Google Gemini / OpenAI)

### Do I need to pay for an API key?
**NO!** 
The platform is built with **100% offline deterministic engines**:
- Resume ATS parsing works locally.
- Job Description 5-Factor matching works locally.
- Code execution sandbox runs locally.
- Aptitude & Technical MCQs work locally.
- Interview STAR heuristic evaluation works locally.

### How to enable Cloud AI (Gemini or OpenAI):
If you want to demonstrate live generative LLM responses to a client or evaluator:
1. Open `backend/.env`.
2. Find `AI_API_KEY=`.
3. Paste your Gemini or OpenAI API Key:
   ```env
   AI_API_KEY=your_gemini_or_openai_key_here
   ```
4. Save the file. The system will automatically use the LLM for deep interview follow-ups and conversational coaching!

---

## 🧭 Live Demonstration Walkthrough (How to Show Off Features)

To give an impressive 5-minute demo to a client, teacher, or evaluator:

1. **Dashboard Overview**:
   - Show the 3D-styled hero banner, quick stats (Readiness Index, Mock Interviews count, Coding Problems solved).
   - Point out the active Next-Best-Action recommendation badge.

2. **ATS Resume Analyzer (`/resume-analyzer`)**:
   - Upload any sample student resume (PDF or DOCX).
   - Show the instant ATS match score, extracted contact info, detected skills, and missing keyword alert.

3. **Job Description Matcher (`/jd-matching`)**:
   - Paste a sample Job Description from Google or TCS.
   - Click "Analyze Fit". Show the 5-Factor Radar breakdown (Skills, Experience, Education, Role Alignment, Keyword Density).

4. **Coding Practice Arena (`/coding`)**:
   - Open a coding problem like "Two Sum" or "Maximum Subarray Sum".
   - Show the LeetCode-style code editor, click "Run Code" to execute test cases live in the sandboxed runner!

5. **AI Mock Interview Simulator (`/interview`)**:
   - Choose Technical or HR round.
   - Read the question and speak or type the answer.
   - Show the instant STAR methodology evaluation, confidence rating, and filler word detection (`uh`, `um`).

6. **Placement Readiness & Intelligence (`/analytics`)**:
   - Show the 7-Factor Readiness Score, peer percentile comparison, and weak-area heatmap.

7. **Campus Drives & Job Discovery (`/jobs`)**:
   - Explore 9 pre-seeded job postings from Google, Amazon, TCS, etc.
   - Show the automatic eligibility verification based on the student's CGPA and backlog status.

---

## ❓ Troubleshooting & Common Questions (FAQ)

### 🔴 Error 1: "Port 5000 or Port 3000 is already in use"
- **Reason**: Another program or a previous run of the server is still open.
- **Fix for Windows**:
  1. Open PowerShell and run:
     ```powershell
     Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
     ```
  2. Or change the port in `backend/.env` from `PORT=5000` to `PORT=5001`.

### 🔴 Error 2: "Script cannot be loaded because running scripts is disabled on this system"
- **Reason**: Windows PowerShell execution policy restriction.
- **Fix**: Open PowerShell as Administrator and run:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

### 🔴 Error 3: "npm install fails with ERESOLVE or peer dependency error"
- **Fix**: Run npm install with legacy peer dependencies:
  ```bash
  npm install --legacy-peer-deps
  ```

### 🔴 Error 4: "Can I run this without internet?"
- **Yes!** After the initial `npm install`, the entire project runs completely offline without any internet connection.

---

## 📞 Support & Customization
If you need any customization, college branding, or added modules, the codebase is modular, clean, and thoroughly commented.

**All the best with your placements, project submissions, and presentations! 🚀**
