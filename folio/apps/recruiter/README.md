# RecruiterOS – Intelligence & Hiring Operations Platform

RecruiterOS is a modern, enterprise-grade Recruiter Intelligence & Hiring Operations Platform built specifically for recruitment teams. It serves as a centralized command center where recruiters can manage jobs, define hiring requirements, review candidate intelligence reports, manage ATS pipelines, schedule interviews, issue offers, and analyze recruitment performance.

> **Note**: This platform is ONLY responsible for the recruiter side of the ecosystem. Candidate-side functionality and complex backend AI algorithms (like Portfolio Intelligence, Matchmaking, and Assessment engines) are designed as independent pods and are mocked in this frontend-first MVP.

---

## 🚀 Features

- **Role-Based Access Control**: Different views and capabilities for Admins, Recruiters, and Hiring Managers.
- **Dashboard & Analytics**: Real-time KPI tracking, Hiring Funnel Recharts, Monthly Hiring Trends, and Recruiter Performance metrics.
- **Hiring Requirement Builder**: Interactive 8-slider blueprint engine that strictly enforces a 100% skill distribution for precise role definitions.
- **Talent Discovery**: Semantic search interface with dynamic candidate match scoring (out of 100).
- **Candidate Intelligence Viewer**: 360° candidate report showing overview, portfolio intelligence, matchmaking alignment radar charts, and recruiter review logs.
- **ATS Pipeline (Kanban)**: Drag-and-drop 8-column Kanban board for managing candidates across stages (Applied -> Hired).
- **Interview Management**: Dual-view module with a list-based Scheduler and a visual Calendar view. Includes interactive scorecards.
- **Offer Management**: Offer generator and acceptance tracking timeline.
- **Campus Hiring Module**: Track university drives, partner institutes, and batch student pipelines.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & React Context
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database/Mocking**: Firebase interface wrappers with a seamless LocalStorage persistence fallback layer.

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── cards/           # KPI & generic cards
│   ├── charts/          # Recharts visualizations
│   ├── kanban/          # Kanban board components
│   └── layout/          # Sidebar, Navbar, and App wrapper
├── contexts/            # React Contexts (e.g., AuthContext)
├── features/            # Feature-based module organization
│   ├── analytics/       # Reports and funnels
│   ├── auth/            # Login and setup pages
│   ├── campus/          # Campus hiring
│   ├── candidates/      # 360° candidate intelligence viewer
│   ├── dashboard/       # Main overview dashboard
│   ├── interviews/      # Scheduler and calendar
│   ├── jobs/            # Job list and creation
│   ├── notifications/   # Sliding notification drawer
│   ├── offers/          # Offer management
│   ├── pipeline/        # ATS Kanban board
│   ├── requirements/    # Hiring requirement builder
│   └── search/          # Talent discovery
├── routes/              # React Router definitions
├── services/            # API, Firebase wrappers, and mock data
└── types/               # TypeScript interfaces and type definitions
```

---

## 💻 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd "recruiter internship"
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Mock Data Authentication
The platform is currently seeded with a local fallback data layer. You do not need to configure Firebase credentials to view the MVP.
Use the mock credentials pre-filled on the login screen to access the application. You can toggle between `Admin`, `Recruiter`, and `Hiring Manager` roles via the dropdown to test different access levels.

---

## 🧪 Development Commands

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the app for production.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run preview`: Previews the production build locally.
