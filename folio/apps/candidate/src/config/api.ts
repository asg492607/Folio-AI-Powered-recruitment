// Centralized API configuration for Candidate App
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : (import.meta.env.PROD ? 'https://folio-git-main-not-so-vaibhavs-projects.vercel.app' : '');
