import axios from 'axios';

// Unified Backend API Base URL
// For local development, it assumes the unified backend is running on port 8000.
// In production, this should be replaced with the Render deployment URL via env vars.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Matchmaking & Portfolio endpoints
export const portfolioApi = {
  analyzePdf: async (formData: FormData) => {
    return api.post('/api/portfolio/api/v1/analyze/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  analyzeUrl: async (url: string) => {
    return api.post('/api/portfolio/api/v1/analyze/url', { url });
  },
  getReport: async (jobId: string) => {
    return api.get(`/api/portfolio/api/v1/report/${jobId}`);
  },
  matchJobs: async (portfolio_text: string, skills: string[], top_k: number = 25) => {
    return api.post('/api/portfolio/v1/match', {
      portfolio_text,
      skills,
      top_k
    });
  },
};

// Assessment endpoints
export const assessmentApi = {
  startAssessment: async (candidateId: string, topic: string) => {
    return api.post('/api/assessment/start', { candidateId, topic });
  },
  submitAnswer: async (assessmentId: string, answer: string) => {
    return api.post(`/api/assessment/${assessmentId}/submit`, { answer });
  },
};

// Scraper endpoints
export const scraperApi = {
  triggerScrape: async () => {
    // Calling the scraper pod manually
    return api.post('/api/scraper/api/v1/opportunities/scrape');
  },
  getOpportunities: async () => {
    return api.get('/api/scraper/api/v1/opportunities');
  }
};

// Communication endpoints
export const communicationApi = {
  notifyRecruiter: async (candidateId: string, message: string) => {
    return api.post('/api/communication/notify', { candidateId, message });
  },
};

export default api;
