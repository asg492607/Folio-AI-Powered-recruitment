# Unified Platform Integration Architecture

This document outlines the strategy for connecting the disparate microservices ("Pods") into a single, cohesive web platform for the Folio AI-Powered Recruitment ecosystem.

## 1. System Components
Currently, the ecosystem consists of the following independent modules:
- **Frontend (Candidate UI/UX):** React/Vite application.
- **Assessment Pod:** Python backend for AI quizzes and hackathons.
- **Job Scraper Pod:** Python service for aggregating jobs from 20+ platforms.
- **Portfolio & AI Matchmaking Pod:** Python backend handling vector embeddings and matching logic.
- **Sharing & Communication Pod:** Python service managing application lifecycles and notifications.

## 2. The API Gateway Strategy
To unify these services without tightly coupling their codebases, an **API Gateway** should be introduced.
The React frontend will make all requests to a single base URL (e.g., `api.folio.app`). The API Gateway (which could be built using Nginx, Traefik, or an AWS API Gateway) will route traffic to the appropriate internal Python service based on the URL path:

*   `/api/jobs/*` -> Routes to the **Job Scraper Pod**
*   `/api/assessments/*` -> Routes to the **Assessment Pod**
*   `/api/portfolio/*` and `/api/match/*` -> Routes to the **Portfolio & Matchmaking Pod**
*   `/api/communication/*` -> Routes to the **Sharing & Communication Pod**

## 3. Detailed Integration Points & Data Flow

### A. Candidate UI ↔ Job Scraper Pod
*   **Connection Need:** The frontend needs to display the latest job opportunities.
*   **Data Flow:** The Candidate UI sends a `GET /api/jobs` request. The Job Scraper pod queries its SQLite database and returns JSON data containing the enriched job listings.

### B. Candidate UI ↔ Portfolio & AI Matchmaking Pod
*   **Connection Need:** When a candidate uploads a portfolio, it must be analyzed and matched against jobs.
*   **Data Flow:** The UI sends a `POST /api/portfolio/upload` with the Behance link or PDF. The Matchmaking pod processes this, generates a "Portfolio Intelligence Report", and returns the match scores. The UI then updates the candidate's dashboard with their new score.

### C. Job Scraper Pod ↔ AI Matchmaking Pod
*   **Connection Need:** The Matchmaking pod needs to know about new jobs to match them against existing candidates.
*   **Data Flow:** Rather than direct HTTP calls, these two should connect via a **Shared Database** or an **Event Queue** (like RabbitMQ/Redis). When the Scraper adds a job, it triggers an event. The Matchmaking pod listens for this event, generates embeddings for the new job, and updates the match rankings.

### D. Candidate UI ↔ Assessment Pod
*   **Connection Need:** Candidates must take adaptive quizzes and AI hackathons directly in the browser.
*   **Data Flow:** The UI sends a `POST /api/assessments/start`. The Assessment pod returns the first question. As the candidate answers, the UI sends `POST /api/assessments/answer`, and the backend calculates the adaptive difficulty to return the next question.

### E. Recruiter Platform (To Be Built/Integrated) ↔ Sharing & Communication Pod
*   **Connection Need:** When a recruiter shortlists a candidate, an interview needs to be scheduled.
*   **Data Flow:** The Recruiter UI sends a `POST /api/communication/schedule`. The Sharing & Communication pod generates an email/notification payload and sends it to the candidate.

## 4. Shared State & Database
For a truly unified system, the backend pods must share access to core data. 
*   **Candidate Profiles:** A central PostgreSQL/MongoDB database should store user accounts and profiles.
*   **Vector Data:** A shared ChromaDB/Milvus instance should hold all embeddings (jobs and portfolios) so the Matchmaking pod can efficiently query them.

## 5. Recommended Next Steps for Implementation
1. **Standardize APIs:** Ensure every Python pod uses FastAPI and has clear, documented REST endpoints (Swagger/OpenAPI).
2. **CORS Configuration:** Update the FastAPI servers to accept requests from the Vite development server (`http://localhost:5173`).
3. **Environment Variables:** In the `candidate uiux` frontend, create an `.env` file mapping out the backend URLs for local development (e.g., `VITE_ASSESSMENT_API_URL=http://localhost:8000`).
4. **Build API Clients:** Inside the React `src/` folder, create Axios or Fetch interceptors to securely call these backend endpoints.
