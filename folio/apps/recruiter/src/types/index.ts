export type Role = 'Admin' | 'Recruiter' | 'Hiring Manager';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

export type JobCategory =
  | 'Engineering'
  | 'Design'
  | 'Data'
  | 'Sales'
  | 'Marketing'
  | 'Product'
  | 'Operations'
  | 'Finance'
  | 'HR'
  | 'Other';

export type WorkMode = 'On-site' | 'Remote' | 'Hybrid';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

export interface Job {
  id: string;
  title: string;
  category: JobCategory;
  department: string;
  location: string;
  workMode: WorkMode;
  type: EmploymentType;
  status: 'Active' | 'Draft' | 'Closed' | 'Archived';
  applicantsCount: number;
  createdAt: string;
  hiringManager: string;
  priority: 'Critical' | 'High' | 'Medium';
  company?: string;

  experienceRequired: 'Fresher' | '0-1 years' | '1-3 years' | '3-5 years' | '5-7 years' | '7+ years';
  salaryRange: string;
  keyResponsibilities: string;
  requiredSkills: string[];
  educationalQualifications: string;
  numberOfOpenings: number;
  applicationDeadline: string;

  targetDate: string;
  description: string;
  experienceLevel?: 'Junior' | 'Mid-level' | 'Senior' | 'Lead';
  keywords?: string[];
  certifications?: string;
  requirementsWeights?: Record<string, number>;
}



export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: 'Applied' | 'Matched' | 'Assessment Pending' | 'Assessment Completed' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Hired';
  matchScore: number;
  appliedDate: string;
  source: 'LinkedIn' | 'Referral' | 'Campus' | 'Careers Site';
  location: string;
  skills: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  interviewer: string;
  stage: 'Recruiter Screen' | 'Technical' | 'Hiring Manager' | 'Culture';
  scheduledAt: string;
  mode: 'Video' | 'On-site';
  status: 'Scheduled' | 'Feedback Due' | 'Completed';
}

export interface CampusDrive {
  id: string;
  institution: string;
  role: string;
  date: string;
  registrations: number;
  shortlisted: number;
  owner: string;
  status: 'Planning' | 'Live' | 'Completed';
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  channel: 'Email' | 'Slack' | 'In-app';
  audience: Role | 'All';
  status: 'Draft' | 'Scheduled' | 'Sent';
  sendAt: string;
}
