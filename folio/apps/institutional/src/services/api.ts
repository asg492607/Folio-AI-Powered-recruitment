/**
 * Folio Institutional — API Service Layer
 * ----------------------------------------
 * All fetch calls to the FastAPI backend at http://localhost:8000
 * Falls back gracefully: if the backend is offline, throws descriptive errors.
 */

const BASE_URL = 'http://localhost:8000/api/institutional';

// ─── Utility ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// ─── Health ────────────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Institutions ──────────────────────────────────────────────────────────────

export const getInstitutions = () => apiGet<unknown[]>('/institutions');

export const createInstitution = (data: {
  name: string;
  campus?: string;
  code?: string;
  state?: string;
  tpo_name: string;
  tpo_email: string;
  tpo_phone?: string;
  contact_email?: string;
  departments?: string[];
  total_students?: number;
}) => apiPost<unknown>('/institutions', data);

export const getInstitution = (id: string) => apiGet<unknown>(`/institutions/${id}`);

// ─── Companies ─────────────────────────────────────────────────────────────────

export const getCompanies = () => apiGet<unknown[]>('/companies');

export const createCompany = (data: {
  name: string;
  domain?: string;
  industry?: string;
  cin?: string;
  target_institution_id?: string;
  hr_name: string;
  hr_email: string;
  hr_phone?: string;
  headquarters?: string;
  target_disciplines?: string[];
}) => apiPost<unknown>('/companies', data);

export const verifyCompany = (companyId: string, status: 'verified' | 'rejected', reason?: string) =>
  apiPatch<unknown>(`/companies/${companyId}/verify`, { status, reason });

// ─── Students ──────────────────────────────────────────────────────────────────

export const getStudents = (institutionId?: string) => {
  const qs = institutionId ? `?institution_id=${institutionId}` : '';
  return apiGet<unknown[]>(`/students${qs}`);
};

export const createStudent = (data: {
  name: string;
  email: string;
  roll_no?: string;
  institution_id?: string;
  institution_name?: string;
  department?: string;
  design_discipline?: string;
  graduation_year?: number;
  cgpa?: number;
  active_backlogs?: number;
  portfolio_url?: string;
  portfolio_type?: string;
  skills?: string[];
  tools?: string[];
}) => apiPost<unknown>('/students', data);

export const getStudent = (id: string) => apiGet<unknown>(`/students/${id}`);

export const updateStudentPortfolio = (
  studentId: string,
  portfolioReport: Record<string, unknown>,
  portfolioScore: number,
  assessmentScore?: number,
  careerReadiness?: number
) =>
  apiPatch<unknown>(`/students/${studentId}/portfolio`, {
    portfolio_report: portfolioReport,
    portfolio_score: portfolioScore,
    assessment_score: assessmentScore,
    career_readiness: careerReadiness,
  });

export const updateStudentPlacement = (
  studentId: string,
  placementStatus: string,
  placedCompany?: string,
  placedPackageLpa?: number
) =>
  apiPatch<unknown>(`/students/${studentId}/placement`, {
    placementStatus,
    placedCompany,
    placedPackageLpa,
  });

// ─── Campus Drives ─────────────────────────────────────────────────────────────

export const getDrives = () => apiGet<unknown[]>('/drives');

export const createDrive = (data: {
  company_id: string;
  company_name: string;
  company_logo?: string;
  role_title: string;
  design_discipline?: string;
  job_type?: string;
  package_lpa?: string;
  location?: string;
  application_deadline?: string;
  drive_date?: string;
  eligibility?: Record<string, unknown>;
  approved_institution_ids?: string[];
  status?: string;
  description?: string;
  openings?: number;
  rounds?: unknown[];
}) => apiPost<unknown>('/drives', data);

export const approveDrive = (driveId: string, institutionId: string) =>
  apiPost<unknown>(`/drives/${driveId}/approve`, { institution_id: institutionId });

export const updateDriveRounds = (driveId: string, rounds: unknown[]) =>
  apiPatch<unknown>(`/drives/${driveId}/rounds`, { rounds });

// ─── Applications ──────────────────────────────────────────────────────────────

export const getApplications = (driveId?: string, studentId?: string) => {
  const params = new URLSearchParams();
  if (driveId) params.set('drive_id', driveId);
  if (studentId) params.set('student_id', studentId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiGet<unknown[]>(`/applications${qs}`);
};

export const applyToDrive = (driveId: string, studentId: string) =>
  apiPost<unknown>('/applications', { drive_id: driveId, student_id: studentId });

export const advanceCandidateRound = (
  appId: string,
  nextRoundIndex: number,
  score?: number,
  feedback?: string
) =>
  apiPatch<unknown>(`/applications/${appId}/advance`, {
    next_round_index: nextRoundIndex,
    score,
    feedback,
  });

export const rejectCandidate = (appId: string, reason: string) =>
  apiPatch<unknown>(`/applications/${appId}/reject`, { reason });

export const extendOffer = (
  appId: string,
  packageLpa: string,
  roleTitle: string,
  joiningDate: string,
  acceptanceDeadline: string
) =>
  apiPatch<unknown>(`/applications/${appId}/offer`, {
    package_lpa: packageLpa,
    role_title: roleTitle,
    joining_date: joiningDate,
    acceptance_deadline: acceptanceDeadline,
  });

// ─── Faculty Interventions ────────────────────────────────────────────────────

export const getInterventions = (studentId?: string) => {
  const qs = studentId ? `?student_id=${studentId}` : '';
  return apiGet<unknown[]>(`/interventions${qs}`);
};

export const createIntervention = (
  actorName: string,
  actorId: string,
  data: {
    student_id: string;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
  }
) =>
  apiFetch<unknown>(
    `/interventions?actor_name=${encodeURIComponent(actorName)}&actor_id=${encodeURIComponent(actorId)}`,
    { method: 'POST', body: JSON.stringify(data) }
  );

export const completeIntervention = (intvId: string) =>
  apiPatch<unknown>(`/interventions/${intvId}/complete`, {});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const getAuditLogs = (limit = 100) => apiGet<unknown[]>(`/audit-logs?limit=${limit}`);

export const createAuditLog = (
  actor: string,
  action: string,
  details: string,
  category = 'COMPLIANCE'
) => apiPost<unknown>('/audit-logs', { actor, action, details, category });

// ─── Portfolio Analysis (delegates to the real portfolio pod) ─────────────────

const PORTFOLIO_BASE = 'http://localhost:8000/api/portfolio';

export async function analyzePortfolioUrl(url: string): Promise<{ jobId: string }> {
  const res = await fetch(`${PORTFOLIO_BASE}/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Portfolio analysis failed to start.');
  return res.json();
}

export async function getPortfolioResult(jobId: string): Promise<unknown> {
  const res = await fetch(`${PORTFOLIO_BASE}/result/${jobId}`);
  if (!res.ok) throw new Error('Portfolio result not ready.');
  return res.json();
}

// ─── Simulated Portfolio Analysis (fallback when backend is offline) ──────────

export function simulatePortfolioAnalysis(portfolioUrl: string, skills: string[] = []) {
  // Deterministic scoring based on URL type
  const urlLower = portfolioUrl.toLowerCase();
  const baseScore = urlLower.includes('behance') ? 72
    : urlLower.includes('dribbble') ? 68
    : urlLower.includes('figma') ? 74
    : urlLower.includes('github') ? 65
    : 70;

  const randomize = (n: number, variance = 8) =>
    Math.min(100, Math.max(0, n + Math.floor(Math.random() * variance * 2 - variance)));

  const portfolioScore = randomize(baseScore, 6);
  const assessmentScore = randomize(baseScore - 3, 8);
  const careerReadiness = Math.round((portfolioScore + assessmentScore) / 2);

  const detectedTools = skills.length ? skills.slice(0, 5) : ['Figma', 'Miro'];
  const allStrengths = [
    'Clear visual hierarchy and layout structure',
    'Strong case study documentation',
    'Good use of design systems and component libraries',
    'Effective use of typography and color theory',
    'User-centered approach evident in case studies',
  ];
  const allWeaknesses = [
    'Could include more quantitative usability metrics',
    'Add more depth to interaction design documentation',
    'Portfolio presentation could benefit from motion design context',
    'Include more accessibility considerations in case studies',
  ];

  return {
    portfolioScore,
    assessmentScore,
    careerReadiness,
    portfolioReport: {
      score: portfolioScore,
      visualHierarchy: randomize(baseScore, 8),
      uxResearch: randomize(baseScore - 5, 10),
      typography: randomize(baseScore + 2, 7),
      designSystems: randomize(baseScore - 2, 9),
      toolsProficiency: randomize(baseScore + 5, 6),
      strengths: allStrengths.slice(0, 2 + Math.floor(Math.random() * 2)),
      weaknesses: allWeaknesses.slice(0, 1 + Math.floor(Math.random() * 2)),
      detectedTools,
      projects: [],
      lastAnalyzedAt: new Date().toISOString().substring(0, 10),
    },
    assessmentReport: {
      overallScore: assessmentScore,
      quizScore: randomize(assessmentScore + 2, 6),
      challengeScore: randomize(assessmentScore - 2, 8),
      interviewScore: randomize(assessmentScore - 4, 10),
      knowledge: randomize(assessmentScore + 5, 7),
      problemSolving: randomize(assessmentScore, 8),
      creativity: randomize(baseScore + 3, 7),
      execution: randomize(assessmentScore - 2, 9),
      communication: randomize(assessmentScore - 3, 10),
    },
  };
}
