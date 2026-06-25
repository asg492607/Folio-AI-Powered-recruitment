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

// External Portfolio System API
const portfolioAxios = axios.create({
  baseURL: 'https://portfolio-intelligencesystem.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Matchmaking & Portfolio endpoints
export const portfolioApi = {
  analyzePdf: async (formData: FormData) => {
    return portfolioAxios.post('/api/v1/analyze/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  analyzeUrl: async (url: string) => {
    return portfolioAxios.post('/api/v1/analyze/url', { url });
  },
  getReport: async (jobId: string) => {
    return portfolioAxios.get(`/api/v1/report/${jobId}`);
  },
  matchJobs: async (portfolio_text: string, skills: string[], top_k: number = 25) => {
    return api.post('/api/portfolio/v1/match', {
      portfolio_text,
      skills,
      top_k
    });
  },
};

// External Assessment Engine API
const assessmentAxios = axios.create({
  baseURL: 'https://assesment-engine-internship.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Assessment endpoints
export const assessmentApi = {
  applyToJob: async (jobId: number) => {
    return assessmentAxios.post('/api/assessment/apply', { job_id: jobId });
  },
  getQuizQuestion: async (candidateId: string) => {
    return assessmentAxios.get(`/api/quiz/question?candidate_id=${candidateId}`);
  },
  submitAnswer: async (candidateId: string, question: string, answer: string, score: number) => {
    return assessmentAxios.post('/api/quiz/submit', {
      candidate_id: candidateId,
      question: question,
      selected_option: answer,
      score_assigned: score
    });
  },
  triggerAnalysis: async (candidateId: string) => {
    return assessmentAxios.post(`/api/assessment/trigger_analysis?candidate_id=${candidateId}`);
  },
  getReport: async (candidateId: string) => {
    return assessmentAxios.get(`/api/assessment/report/${candidateId}`);
  }
};

// Scraper endpoints
export const scraperApi = {
  triggerScrape: async () => {
    // Calling the scraper pod manually (background)
    return api.post('/api/scraper/api/v1/opportunities/force-scrape');
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
