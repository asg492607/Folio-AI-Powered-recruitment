# Folio: AI-Powered Recruitment Platform

Folio is a next-generation, AI-driven recruitment and candidate experience platform. It bridges the gap between design candidates and recruiters by using advanced portfolio intelligence to auto-generate candidate profiles, scrape real-time job listings, and perform intelligent matchmaking to calculate accurate role-fit scores.

## 🚀 Key Features

*   **Portfolio Intelligence Engine**: Upload a resume PDF, or connect Behance/Personal Website URLs. The AI (powered by Groq) analyzes the portfolio, extracts tools, methodologies, soft skills, and projects, and automatically fills the candidate profile.
*   **Live AI Matchmaking**: Compares the candidate's extracted skills against required skills from job postings to generate a precise `Match Percentage`.
*   **Automated Job Scraping**: A robust backend scraping engine built with JobSpy and Playwright fetches real, remote, and onsite job listings from platforms like LinkedIn, Naukri, and Internshala, while intelligently bypassing anti-bot measures.
*   **Persistent Tracking**: All candidate profiles, onboarding progress, and job application tracking states are securely persisted in Firebase Firestore.
*   **Seamless Application Flow**: Candidates can track applications internally within Folio while being seamlessly redirected to the company's actual external application page.

---

## 🏗️ Architecture

The platform transitioned from a multi-pod setup to a streamlined, unified architecture optimized for deployment (e.g., Render Free Tier).

### 1. Frontend (Candidate Experience Pod)
*   **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS
*   **State Management**: Zustand (with persistence middleware)
*   **Routing**: React Router v6
*   **Hosting**: Render (Static Site)
*   **Key Modules**: Dashboard, Portfolio Manager, Opportunities Board, Application Tracking, AI Assessments.

### 2. Backend (Unified FastAPI Pod)
*   **Tech Stack**: Python, FastAPI, Uvicorn
*   **AI Integration**: Groq API (LLaMA/Mixtral models) for lightning-fast portfolio parsing and report generation.
*   **Scraping**: `jobspy` and `playwright` integrated to fetch live job data.
*   **Hosting**: Render (Web Service)
*   **Key Services**: 
    *   `/api/v1/scraper`: Handles scheduled and manual scraping tasks.
    *   `/api/v1/portfolio`: Analyzes URLs and PDFs.
    *   `/api/v1/assessments`: Generates and evaluates candidate design tests.

### 3. Database
*   **Firebase Firestore**: Acts as the primary database for candidate profiles, user authentication, and application states. 

---

## 💻 Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   Firebase Project Credentials

### 1. Frontend Setup
```bash
cd "candidate uiux"
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd unified_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

Create a `.env` file in the `unified_backend` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
# Add other necessary keys...
```

Start the backend server:
```bash
uvicorn unified_main:app --reload --port 8000
```

---

## 🛠️ Recent Technical Milestones

*   **Zero Mock Data**: Successfully eradicated all hardcoded UI placeholders. The platform now relies 100% on live API data and Firestore.
*   **State Persistence Fixed**: Resolved issues where PDF uploads and portfolio intelligence scores disappeared upon navigation.
*   **TypeScript Hardening**: Refactored major interfaces (`Opportunity`, `CandidateRole`) to ensure strong typing across the dashboard and API integration layers.
*   **Hygiene & Security**: Implemented global `.gitignore` policies to prevent sensitive Firebase credentials and `.env` files from entering version control.

---

## 📝 License
Proprietary & Confidential. All rights reserved.
