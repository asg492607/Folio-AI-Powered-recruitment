# Candidate Experience Pod: Implementation & Deployment Strategy

## 1. Overview
Since the Recruiter frontend is still pending, the immediate focus is fully on building out and deploying the **Candidate Experience Pod** (`candidate uiux`). 

This document outlines the architecture, deployment strategy on **Render**, and the integration of **Firebase** as the central database and authentication provider.

## 2. Infrastructure Architecture

### A. Frontend Deployment (Render)
The candidate frontend is a React/Vite application. It will be deployed as a **Static Site** on Render, which offers lightning-fast global CDN delivery and free SSL.
*   **Build Command:** `npm run build`
*   **Publish Directory:** `dist`
*   **Routing:** Ensure "Rewrite all requests to index.html" is enabled on Render to support React Router.

### B. Database & Authentication (Firebase)
Using Firebase completely eliminates the need for a complex custom backend for basic CRUD operations, allowing us to move incredibly fast on the candidate side.
*   **Firebase Authentication:** Handles candidate sign-ups (Email/Password and Google OAuth as required by the PRD).
*   **Cloud Firestore (NoSQL):** Acts as the central database. It will store Candidate Profiles, Saved Jobs, and Application Statuses.
*   **Firebase Storage:** Handles the storage of candidate uploaded PDF portfolios and profile pictures securely.

## 3. What We Can Build Right Now (Candidate Side)

Even without the Recruiter side, we can build a fully functional Candidate experience:

1.  **Smart Onboarding & Auth Flow:**
    *   Implement Google OAuth and Email login.
    *   Build the multi-step onboarding wizard to collect education, skills, and discipline.
    *   Save this data directly to a `candidates` collection in Firestore.

2.  **Profile & Portfolio Management:**
    *   Build the dashboard where candidates can edit their About Me, Experience, and Skills.
    *   Integrate Firebase Storage so candidates can upload their PDF portfolios, generating a secure download URL saved to their Firestore profile.

3.  **Opportunity Discovery (Job Board):**
    *   Build the UI for searching and filtering jobs.
    *   *Backend Sync:* The Python **Job Scraper Pod** can be updated to use the `firebase-admin` SDK. Instead of just saving to SQLite, it will push the scraped jobs directly into a `jobs` collection in Firestore. The React app simply reads this collection in real-time.

4.  **Application Tracking:**
    *   Allow candidates to "Apply" to jobs. This creates a document in an `applications` collection in Firestore.
    *   The candidate dashboard can listen to this collection to show real-time status updates (Applied, Under Review, etc.).

## 4. Connecting the Python Pods to Firebase
By using Firebase as the central brain, we change how the backend pods operate:
*   **The Scraper Pod:** Pushes new jobs to Firestore `jobs` collection.
*   **The Matchmaking Pod:** Listens to the `candidates` and `jobs` collections in Firestore. When a candidate updates their profile, the Python pod generates embeddings, calculates the match scores, and writes the scores back into Firestore under `candidate_matches`.
*   **The Assessment Pod:** When a candidate starts an assessment, the React app calls the Python Assessment API. Upon completion, the Python pod writes the final Assessment Score directly into the candidate's Firestore profile.

## 5. Next Steps
1.  **Set up a Firebase Project:** Create a new project in the Firebase Console. Enable Authentication, Firestore, and Storage.
2.  **Configure Environment Variables:** Add the Firebase config keys (`VITE_FIREBASE_API_KEY`, etc.) to the `.env` file in the `candidate uiux` folder and also to the environment variables section on Render.
3.  **Initialize Firebase in React:** Create a `src/lib/firebase.ts` file to initialize the SDK.
4.  **Deploy MVP UI:** Deploy the current state of the `candidate uiux` folder to Render to ensure the CI/CD pipeline is working.
