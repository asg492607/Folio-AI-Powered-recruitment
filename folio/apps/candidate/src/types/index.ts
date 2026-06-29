export type AuthProvider = 'email' | 'google';
export type CandidateRole = 'design_student' | 'freelancer' | 'fresh_graduate' | 'junior_professional';
export type ExperienceLevel = 'student' | 'entry' | '1-3yrs' | '3+yrs';
export type WorkType = 'internship' | 'freelance' | 'full_time';
export type LocationType = 'remote' | 'hybrid' | 'onsite';
export type ApplicationStatus =
  | 'Applied'
  | 'Matched'
  | 'Assessment Completed'
  | 'Shortlisted'
  | 'Interviewing'
  | 'Offered'
  | 'Hired'
  | 'Withdrawn';

export interface Candidate {
  id: string;
  email: string;
  authProvider: AuthProvider;
  role: CandidateRole;
  personalInfo: { name: string; phone?: string; location?: string; avatarUrl?: string };
  education: { institution: string; degree: string; year: number }[];
  designDiscipline: string[];
  skills: string[];
  careerGoals: string;
  experienceLevel: ExperienceLevel;
  aboutMe: string;
  experience: { company: string; title: string; duration: string; description: string }[];
  certifications: { name: string; issuer: string; year: number }[];
  projects: { title: string; description: string; links: string[] }[];
  achievements: string[];
  portfolioLinks: { type: 'behance' | 'dribbble' | 'website' | 'pdf'; url: string }[];
  profileCompletionPercent: number;
  lastPortfolioReport?: any;
}

export interface PortfolioItem {
  id: string;
  candidateId: string;
  source: 'behance' | 'dribbble' | 'personal_website' | 'pdf';
  url: string;
  caseStudy?: { title: string; description: string; coverImageUrl: string };
}

export interface Opportunity {
  id: string;
  companyName: string;
  companyOverview: string;
  title: string;
  description: string;
  requiredSkills: string[];
  compensation: string;
  workType: WorkType;
  locationType: LocationType;
  location?: string;
  discipline: string;
  teamInfo: string;
  hiringProcess: string[];
  postedAt: string;
  questions?: string[];
  matchPercentage?: number;
  companyDescription?: string;
  companyTags?: string[];
  roleDescription?: string;
  keyResponsibilities?: string[];
  hiringSteps?: { step: number; title: string; duration: string }[];
  sidebarDetails?: { label: string; icon: string }[];
  applyUrl?: string;
  logo?: string;
  tags?: string[];
}

export interface Application {
  id: string;
  candidateId: string;
  opportunityId: string;
  resumeUrl: string;
  portfolioAttachmentUrl?: string;
  answers: { question: string; answer: string }[];
  status: ApplicationStatus;
  appliedAt: string;
  statusHistory: { status: string; timestamp: string }[];
}

export interface Notification {
  id: string;
  candidateId: string;
  type: 'application_update' | 'interview_update' | 'new_opportunity' | 'profile_suggestion' | 'match_alert';
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}
