export type UserRole = 'guest' | 'student' | 'placement_officer' | 'faculty' | 'recruiter' | 'admin';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  institutionId?: string;
  companyId?: string;
  department?: string;
  title?: string;
}

export interface InstitutionProfile {
  id: string;
  name: string;
  campus: string;
  code: string;
  state: string;
  nirfRank?: number;
  contactEmail: string;
  tpoName: string;
  tpoEmail: string;
  tpoPhone: string;
  departments: string[];
  totalStudents: number;
  placementPercentage: number;
  verified: boolean;
  logo?: string;
}

export interface DepartmentProfile {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  degree: 'B.Des' | 'M.Des' | 'PhD Design';
  totalStudents: number;
}

export interface BatchProfile {
  id: string;
  departmentId: string;
  departmentName: string;
  graduationYear: number;
  totalStudents: number;
  readinessIndex: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  domain: string;
  industry: string;
  cin: string; // Corporate Identification Number / GSTIN
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  targetInstitutionId?: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  logo: string;
  headquarters: string;
  targetDisciplines: string[];
  registeredAt: string;
}

export interface DesignProject {
  id: string;
  title: string;
  domain: 'UI/UX' | 'Product Design' | 'Design Systems' | 'Visual Communication' | 'Motion Design' | '3D & Spatial';
  role: string;
  description: string;
  tags: string[];
  previewUrl?: string;
  metrics?: string;
}

export interface PortfolioReport {
  score: number; // 0 - 100
  visualHierarchy: number;
  uxResearch: number;
  typography: number;
  designSystems: number;
  toolsProficiency: number;
  strengths: string[];
  weaknesses: string[];
  detectedTools: string[];
  projects: DesignProject[];
  lastAnalyzedAt: string;
}

export interface AssessmentReport {
  overallScore: number; // 0 - 100
  quizScore: number;
  challengeScore: number;
  interviewScore: number;
  knowledge: number;
  problemSolving: number;
  creativity: number;
  execution: number;
  communication: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  institutionId: string;
  institutionName: string;
  department: string;
  designDiscipline: string;
  graduationYear: number;
  cgpa: number;
  activeBacklogs: number;
  portfolioUrl: string;
  portfolioType: 'Figma' | 'Behance' | 'Dribbble' | 'Personal Website' | 'PDF';
  portfolioScore: number;
  assessmentScore: number;
  careerReadiness: number; // 0 - 100
  skills: string[];
  tools: string[];
  avatar: string;
  portfolioReport?: PortfolioReport;
  assessmentReport?: AssessmentReport;
  placementStatus: 'Unplaced' | 'In Process' | 'Shortlisted' | 'Placed';
  placedCompany?: string;
  placedPackageLpa?: number;
}

export type PlacementRoundType = 
  | 'Screening' 
  | 'Portfolio Review' 
  | 'Design Challenge' 
  | 'Assessment' 
  | 'Design Interview' 
  | 'HR Round' 
  | 'Final Selection';

export interface PlacementRoundConfig {
  id: string;
  roundNumber: number;
  name: string;
  type: PlacementRoundType;
  description: string;
  scheduledDate: string;
  maxQualifiers?: number;
  instructions?: string;
}

export interface DriveEligibility {
  minPortfolioScore: number;
  minCgpa: number;
  minReadiness: number;
  allowedDepartments: string[];
  graduationYear: number;
  requiredSkills: string[];
  requiredTools: string[];
}

export interface CampusDrive {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  roleTitle: string;
  designDiscipline: string;
  jobType: 'Full-Time FTE' | 'Graduation Internship' | '6-Month Pre-Placement Offer (PPO)';
  packageLpa: string; // e.g. "18.5 LPA" or "₹60,000 / mo"
  location: string;
  applicationDeadline: string;
  driveDate: string;
  eligibility: DriveEligibility;
  approvedInstitutionIds: string[];
  status: 'Active' | 'Under Screening' | 'Rounds Active' | 'Completed';
  rounds: PlacementRoundConfig[];
  description: string;
  openings: number;
  createdAt: string;
}

export interface RoundEvaluation {
  roundId: string;
  roundName: string;
  roundType: PlacementRoundType;
  status: 'Passed' | 'Failed' | 'Under Evaluation' | 'Pending';
  score?: number; // 0 - 100
  evaluatorNotes?: string;
  evaluatedAt?: string;
  submissionLink?: string;
}

export interface JobApplication {
  id: string;
  driveId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRollNo: string;
  institutionId: string;
  institutionName: string;
  department: string;
  designDiscipline: string;
  cgpa: number;
  portfolioUrl: string;
  portfolioScore: number;
  careerReadiness: number;
  skills: string[];
  appliedAt: string;
  currentRoundIndex: number;
  status: 
    | 'Applied' 
    | 'Under Review' 
    | 'In Rounds' 
    | 'Shortlisted' 
    | 'Offered' 
    | 'Rejected';
  roundEvaluations: RoundEvaluation[];
  matchScore: number; // 0 - 100
  offerDetails?: {
    packageLpa: string;
    roleTitle: string;
    joiningDate: string;
    acceptanceDeadline: string;
  };
}

export interface FacultyIntervention {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  department: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  dueDate: string;
  feedback?: string;
}

export interface ExternalOpportunity {
  id: string;
  title: string;
  company: string;
  source: 'Behance' | 'Dribbble' | 'LinkedIn' | 'Wellfound' | 'Internshala';
  location: string;
  jobType: string;
  discipline: string;
  applyUrl: string;
  postedDate: string;
  requiredSkills: string[];
  stipendOrSalary: string;
  logo: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  category: 'VERIFICATION' | 'DRIVE' | 'ROUND_ENGINE' | 'APPLICATION' | 'FACULTY_TASK' | 'COMPLIANCE';
}
