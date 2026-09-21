import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UserRole,
  UserAccount,
  InstitutionProfile,
  DepartmentProfile,
  BatchProfile,
  CompanyProfile,
  StudentProfile,
  CampusDrive,
  JobApplication,
  FacultyIntervention,
  ExternalOpportunity,
  SystemAuditLog,
  PlacementRoundConfig
} from '../types';
import * as API from '../services/api';

// ─── Context Type ──────────────────────────────────────────────────────────────

interface AppContextType {
  // Authentication & Active User Context
  currentUser: UserAccount | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string, password: string, roleHint?: UserRole) => Promise<{ success: boolean; message?: string }>;
  register: (role: UserRole, data: Record<string, unknown>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchPersona: (role: UserRole, entityId?: string) => void;

  // Backend status
  backendOnline: boolean;

  // Active Entities
  activeInstitution: InstitutionProfile;
  setActiveInstitution: (inst: InstitutionProfile) => void;
  activeCompany: CompanyProfile;
  setActiveCompany: (company: CompanyProfile) => void;
  activeStudent: StudentProfile;
  setActiveStudent: (student: StudentProfile) => void;

  // Data Collections
  institutions: InstitutionProfile[];
  departments: DepartmentProfile[];
  batches: BatchProfile[];
  companies: CompanyProfile[];
  students: StudentProfile[];
  drives: CampusDrive[];
  applications: JobApplication[];
  interventions: FacultyIntervention[];
  externalOpportunities: ExternalOpportunity[];
  auditLogs: SystemAuditLog[];

  // Loading state
  dataLoading: boolean;
  refreshData: () => Promise<void>;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // TPO Institutional Operations
  verifyCompany: (companyId: string, status: 'verified' | 'rejected', reason?: string) => Promise<void>;
  approveDriveForInstitution: (driveId: string, institutionId: string) => Promise<void>;

  // Recruiter Operations
  createPlacementDrive: (driveData: Omit<CampusDrive, 'id' | 'createdAt'>) => Promise<void>;
  updateDriveRounds: (driveId: string, rounds: PlacementRoundConfig[]) => Promise<void>;
  advanceCandidateRound: (appId: string, nextRoundIndex: number, score?: number, feedback?: string) => Promise<void>;
  rejectCandidate: (appId: string, reason: string) => Promise<void>;
  offerCandidatePlacement: (appId: string, offerDetails: { packageLpa: string; roleTitle: string; joiningDate: string; acceptanceDeadline: string }) => Promise<void>;

  // Student Operations
  applyToDrive: (driveId: string) => Promise<{ success: boolean; message: string }>;
  runPortfolioAnalysis: (studentId: string, portfolioUrl: string) => Promise<void>;
  completeStudentIntervention: (taskId: string) => Promise<void>;

  // Faculty Operations
  assignFacultyIntervention: (data: { studentId: string; title: string; description: string; priority: 'High' | 'Medium' | 'Low'; dueDate: string }) => Promise<void>;

  // Utilities
  addAuditLog: (action: string, details: string, category: SystemAuditLog['category']) => Promise<void>;
  resetAllData: () => void;
}

// ─── Default Fallback Objects ──────────────────────────────────────────────────

const EMPTY_INSTITUTION: InstitutionProfile = {
  id: '', name: '', campus: '', code: '', state: '',
  contactEmail: '', tpoName: '', tpoEmail: '', tpoPhone: '',
  departments: [], totalStudents: 0, placementPercentage: 0, verified: false,
};

const EMPTY_COMPANY: CompanyProfile = {
  id: '', name: '', domain: '', industry: '', cin: '',
  verified: false, verificationStatus: 'pending',
  hrName: '', hrEmail: '', hrPhone: '', logo: '',
  headquarters: '', targetDisciplines: [], registeredAt: '',
};

const EMPTY_STUDENT: StudentProfile = {
  id: '', name: '', email: '', rollNo: '', institutionId: '', institutionName: '',
  department: '', designDiscipline: '', graduationYear: 2026, cgpa: 0,
  activeBacklogs: 0, portfolioUrl: '', portfolioType: 'Personal Website',
  portfolioScore: 0, assessmentScore: 0, careerReadiness: 0,
  skills: [], tools: [], avatar: '', placementStatus: 'Unplaced',
};

// ─── Storage Keys (session only — data comes from backend) ─────────────────────

const SESSION_KEYS = {
  THEME: 'folio_inst_theme_v3',
  ROLE: 'folio_inst_role_v3',
  CURRENT_USER: 'folio_inst_user_v3',
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── camelCase mappers for API responses ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toInstitution = (r: any): InstitutionProfile => ({
  id: r.id, name: r.name, campus: r.campus || '', code: r.code || '',
  state: r.state || '', nirfRank: r.nirfRank,
  contactEmail: r.contactEmail || '', tpoName: r.tpoName || '',
  tpoEmail: r.tpoEmail || '', tpoPhone: r.tpoPhone || '',
  departments: r.departments || [], totalStudents: r.totalStudents || 0,
  placementPercentage: r.placementPercentage || 0, verified: r.verified || false,
  logo: r.logo || '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toCompany = (r: any): CompanyProfile => ({
  id: r.id, name: r.name, domain: r.domain || '', industry: r.industry || '',
  cin: r.cin || '', verified: r.verified || false,
  verificationStatus: r.verificationStatus || 'pending',
  rejectionReason: r.rejectionReason,
  targetInstitutionId: r.targetInstitutionId,
  hrName: r.hrName || '', hrEmail: r.hrEmail || '', hrPhone: r.hrPhone || '',
  logo: r.logo || '', headquarters: r.headquarters || '',
  targetDisciplines: r.targetDisciplines || [], registeredAt: r.registeredAt || '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toStudent = (r: any): StudentProfile => ({
  id: r.id, name: r.name, email: r.email, rollNo: r.rollNo || '',
  institutionId: r.institutionId || '', institutionName: r.institutionName || '',
  department: r.department || '', designDiscipline: r.designDiscipline || '',
  graduationYear: r.graduationYear || 2026, cgpa: r.cgpa || 0,
  activeBacklogs: r.activeBacklogs || 0, portfolioUrl: r.portfolioUrl || '',
  portfolioType: r.portfolioType || 'Personal Website',
  portfolioScore: r.portfolioScore || 0, assessmentScore: r.assessmentScore || 0,
  careerReadiness: r.careerReadiness || 0,
  skills: r.skills || [], tools: r.tools || [], avatar: r.avatar || '',
  placementStatus: r.placementStatus || 'Unplaced',
  placedCompany: r.placedCompany, placedPackageLpa: r.placedPackageLpa,
  portfolioReport: r.portfolioReport && Object.keys(r.portfolioReport).length ? r.portfolioReport : undefined,
  assessmentReport: r.assessmentReport && Object.keys(r.assessmentReport).length ? r.assessmentReport : undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toDrive = (r: any): CampusDrive => ({
  id: r.id, companyId: r.companyId, companyName: r.companyName,
  companyLogo: r.companyLogo || '', roleTitle: r.roleTitle,
  designDiscipline: r.designDiscipline || '', jobType: r.jobType || 'Full-Time FTE',
  packageLpa: r.packageLpa || '', location: r.location || '',
  applicationDeadline: r.applicationDeadline || '', driveDate: r.driveDate || '',
  eligibility: r.eligibility || { minPortfolioScore: 0, minCgpa: 0, minReadiness: 0, allowedDepartments: [], graduationYear: 2026, requiredSkills: [], requiredTools: [] },
  approvedInstitutionIds: r.approvedInstitutionIds || [],
  status: r.status || 'Active', description: r.description || '',
  openings: r.openings || 1, rounds: r.rounds || [],
  createdAt: r.createdAt || '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toApplication = (r: any): JobApplication => ({
  id: r.id, driveId: r.driveId, studentId: r.studentId,
  studentName: r.studentName || '', studentEmail: r.studentEmail || '',
  studentRollNo: r.studentRollNo || '', institutionId: r.institutionId || '',
  institutionName: r.institutionName || '', department: r.department || '',
  designDiscipline: r.designDiscipline || '', cgpa: r.cgpa || 0,
  portfolioUrl: r.portfolioUrl || '', portfolioScore: r.portfolioScore || 0,
  careerReadiness: r.careerReadiness || 0, skills: r.skills || [],
  appliedAt: r.appliedAt || '', currentRoundIndex: r.currentRoundIndex || 0,
  status: r.status || 'Applied', roundEvaluations: r.roundEvaluations || [],
  matchScore: r.matchScore || 0,
  offerDetails: r.offerDetails && Object.keys(r.offerDetails).length ? r.offerDetails : undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toIntervention = (r: any): FacultyIntervention => ({
  id: r.id, facultyId: r.facultyId || '', facultyName: r.facultyName || '',
  studentId: r.studentId, studentName: r.studentName || '',
  studentRollNo: r.studentRollNo || '', department: r.department || '',
  title: r.title, description: r.description || '',
  priority: r.priority || 'Medium', status: r.status || 'Pending',
  createdAt: r.createdAt || '', dueDate: r.dueDate || '', feedback: r.feedback,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAuditLog = (r: any): SystemAuditLog => ({
  id: r.id, timestamp: r.timestamp, actor: r.actor,
  action: r.action, details: r.details, category: r.category,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem(SESSION_KEYS.THEME) as 'light' | 'dark') || 'light'
  );

  const [role, setRoleState] = useState<UserRole>(() =>
    (localStorage.getItem(SESSION_KEYS.ROLE) as UserRole) || 'guest'
  );

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(SESSION_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  // Data state — loaded from backend
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [departments] = useState<DepartmentProfile[]>([]);
  const [batches] = useState<BatchProfile[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interventions, setInterventions] = useState<FacultyIntervention[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [externalOpportunities] = useState<ExternalOpportunity[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  // Active entity state
  const [activeInstitution, setActiveInstitution] = useState<InstitutionProfile>(EMPTY_INSTITUTION);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(EMPTY_COMPANY);
  const [activeStudent, setActiveStudent] = useState<StudentProfile>(EMPTY_STUDENT);

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(SESSION_KEYS.THEME, theme);
  }, [theme]);

  // Sync session to localStorage
  useEffect(() => {
    localStorage.setItem(SESSION_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // ─── Load All Data from Backend ─────────────────────────────────────────────

  const refreshData = useCallback(async () => {
    setDataLoading(true);
    try {
      const online = await API.checkBackendHealth();
      setBackendOnline(online);

      if (!online) {
        setDataLoading(false);
        return;
      }

      const [rawInst, rawComp, rawStu, rawDrives, rawApps, rawIntv, rawLogs] = await Promise.all([
        API.getInstitutions().catch(() => []),
        API.getCompanies().catch(() => []),
        API.getStudents().catch(() => []),
        API.getDrives().catch(() => []),
        API.getApplications().catch(() => []),
        API.getInterventions().catch(() => []),
        API.getAuditLogs(200).catch(() => []),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insts = (rawInst as any[]).map(toInstitution);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comps = (rawComp as any[]).map(toCompany);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stus = (rawStu as any[]).map(toStudent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const drvs = (rawDrives as any[]).map(toDrive);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apps = (rawApps as any[]).map(toApplication);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const intvs = (rawIntv as any[]).map(toIntervention);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logs = (rawLogs as any[]).map(toAuditLog);

      setInstitutions(insts);
      setCompanies(comps);
      setStudents(stus);
      setDrives(drvs);
      setApplications(apps);
      setInterventions(intvs);
      setAuditLogs(logs);

      // Sync active entities from restored session
      const savedUser = localStorage.getItem(SESSION_KEYS.CURRENT_USER);
      if (savedUser) {
        const user = JSON.parse(savedUser) as UserAccount;
        if (user.role === 'student') {
          const stu = stus.find(s => s.id === user.id);
          if (stu) setActiveStudent(stu);
        } else if (user.role === 'recruiter') {
          const comp = comps.find(c => c.id === user.companyId);
          if (comp) setActiveCompany(comp);
        } else if (user.role === 'placement_officer') {
          const inst = insts.find(i => i.id === user.institutionId);
          if (inst) setActiveInstitution(inst);
        }
      }
    } catch (err) {
      console.error('Failed to load data from backend:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ─── Utilities ──────────────────────────────────────────────────────────────

  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  const addAuditLog = async (action: string, details: string, category: SystemAuditLog['category']) => {
    const actor = currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'SYSTEM';
    try {
      const raw = await API.createAuditLog(actor, action, details, category);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const log = toAuditLog(raw as any);
      setAuditLogs(prev => [log, ...prev]);
    } catch {
      // Silently fail audit logs — they're non-critical
    }
  };

  // ─── Authentication ──────────────────────────────────────────────────────────

  const login = async (email: string, _pass: string, roleHint?: UserRole): Promise<{ success: boolean; message?: string }> => {
    const trimmed = email.trim().toLowerCase();

    // Check student match
    const studentMatch = students.find(s => s.email.toLowerCase() === trimmed);
    if (studentMatch && (!roleHint || roleHint === 'student')) {
      const user: UserAccount = {
        id: studentMatch.id, email: studentMatch.email, name: studentMatch.name,
        role: 'student', avatar: studentMatch.avatar,
        institutionId: studentMatch.institutionId, department: studentMatch.department,
      };
      setCurrentUser(user);
      setActiveStudent(studentMatch);
      setRoleState('student');
      await addAuditLog('USER_LOGIN', `Student ${user.name} authenticated.`, 'COMPLIANCE');
      return { success: true };
    }

    // Check company recruiter
    const companyMatch = companies.find(c => c.hrEmail.toLowerCase() === trimmed);
    if (companyMatch && (!roleHint || roleHint === 'recruiter')) {
      const user: UserAccount = {
        id: `rec-${companyMatch.id}`, email: companyMatch.hrEmail, name: companyMatch.hrName,
        role: 'recruiter', companyId: companyMatch.id,
        title: `Head of Design Recruitment at ${companyMatch.name}`,
        avatar: companyMatch.logo,
      };
      setCurrentUser(user);
      setActiveCompany(companyMatch);
      setRoleState('recruiter');
      await addAuditLog('USER_LOGIN', `Recruiter ${user.name} (${companyMatch.name}) signed in.`, 'COMPLIANCE');
      return { success: true };
    }

    // Check TPO / Placement Officer
    const tpoMatch = institutions.find(i => i.tpoEmail.toLowerCase() === trimmed);
    if (tpoMatch && (!roleHint || roleHint === 'placement_officer')) {
      const user: UserAccount = {
        id: `tpo-${tpoMatch.id}`, email: tpoMatch.tpoEmail, name: tpoMatch.tpoName,
        role: 'placement_officer', institutionId: tpoMatch.id,
        title: 'Head of Career Services & Placements', avatar: tpoMatch.logo,
      };
      setCurrentUser(user);
      setActiveInstitution(tpoMatch);
      setRoleState('placement_officer');
      await addAuditLog('USER_LOGIN', `Placement Officer ${user.name} accessed dashboard.`, 'COMPLIANCE');
      return { success: true };
    }

    // Role-hint fallback for faculty / admin (fixed credentials)
    if (roleHint === 'faculty') {
      const user: UserAccount = {
        id: `fac-${Date.now()}`, email: email || 'faculty@institution.edu',
        name: email.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ') : 'Faculty Mentor',
        role: 'faculty', institutionId: institutions[0]?.id || 'inst-default',
        department: 'Design Faculty', title: 'Design Faculty & Academic Mentor',
      };
      setCurrentUser(user);
      setRoleState('faculty');
      await addAuditLog('USER_LOGIN', `Faculty ${user.name} logged in.`, 'COMPLIANCE');
      return { success: true };
    }

    if (roleHint === 'admin') {
      const user: UserAccount = {
        id: 'adm-institutional', email: email || 'admin@institution.edu',
        name: email.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ') : 'System Administrator',
        role: 'admin', institutionId: institutions[0]?.id || 'inst-default',
        title: 'Dean of Academic Affairs & Systems',
      };
      setCurrentUser(user);
      setRoleState('admin');
      await addAuditLog('USER_LOGIN', `Administrator ${user.name} logged in.`, 'COMPLIANCE');
      return { success: true };
    }

    // Fallback for roleHint with no exact email match
    if (roleHint === 'student' && students.length > 0) {
      const stu = students[0];
      setCurrentUser({ id: stu.id, email: stu.email, name: stu.name, role: 'student', avatar: stu.avatar, institutionId: stu.institutionId, department: stu.department });
      setActiveStudent(stu);
      setRoleState('student');
      return { success: true };
    }
    if (roleHint === 'recruiter' && companies.length > 0) {
      const comp = companies[0];
      setCurrentUser({ id: `rec-${comp.id}`, email: comp.hrEmail, name: comp.hrName, role: 'recruiter', companyId: comp.id, avatar: comp.logo });
      setActiveCompany(comp);
      setRoleState('recruiter');
      return { success: true };
    }
    if (roleHint === 'placement_officer' && institutions.length > 0) {
      const inst = institutions[0];
      setCurrentUser({ id: `tpo-${inst.id}`, email: inst.tpoEmail, name: inst.tpoName, role: 'placement_officer', institutionId: inst.id, avatar: inst.logo });
      setActiveInstitution(inst);
      setRoleState('placement_officer');
      return { success: true };
    }

    return { success: false, message: 'No account found with this email. Please register first or select the correct role.' };
  };

  const register = async (regRole: UserRole, data: Record<string, unknown>): Promise<{ success: boolean; message?: string }> => {
    if (regRole === 'student') {
      const name = (data.name as string) || 'Student';
      const email = (data.email as string) || '';
      if (!email) return { success: false, message: 'Email is required.' };

      try {
        const raw = await API.createStudent({
          name,
          email,
          roll_no: data.rollNo as string,
          institution_id: (data.institutionId as string) || institutions[0]?.id || 'inst-default',
          institution_name: (data.institutionName as string) || institutions[0]?.name || '',
          department: data.department as string,
          design_discipline: (data.designDiscipline as string) || 'UI/UX & Product Design',
          graduation_year: (data.graduationYear as number) || 2026,
          cgpa: (data.cgpa as number) || 0,
          portfolio_url: (data.portfolioUrl as string) || '',
          portfolio_type: (data.portfolioType as string) || 'Personal Website',
          skills: (data.skills as string[]) || [],
          tools: (data.tools as string[]) || [],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newStudent = toStudent(raw as any);
        setStudents(prev => [newStudent, ...prev]);
        setActiveStudent(newStudent);
        setCurrentUser({
          id: newStudent.id, email: newStudent.email, name: newStudent.name,
          role: 'student', avatar: newStudent.avatar,
          institutionId: newStudent.institutionId, department: newStudent.department,
        });
        setRoleState('student');

        // Run portfolio analysis if URL provided
        if (newStudent.portfolioUrl) {
          runPortfolioAnalysis(newStudent.id, newStudent.portfolioUrl);
        }

        return { success: true };
      } catch (err: unknown) {
        return { success: false, message: err instanceof Error ? err.message : 'Registration failed.' };
      }
    }

    if (regRole === 'recruiter') {
      const hrName = (data.hrName as string) || 'HR Contact';
      const hrEmail = (data.hrEmail as string) || '';
      const companyName = (data.companyName as string) || 'Company';
      if (!hrEmail) return { success: false, message: 'HR email is required.' };

      try {
        const raw = await API.createCompany({
          name: companyName,
          domain: (data.domain as string) || '',
          industry: (data.industry as string) || 'Design & Technology',
          cin: (data.cin as string) || '',
          target_institution_id: (data.targetInstitutionId as string) || institutions[0]?.id,
          hr_name: hrName,
          hr_email: hrEmail,
          hr_phone: (data.hrPhone as string) || '',
          headquarters: (data.headquarters as string) || '',
          target_disciplines: (data.targetDisciplines as string[]) || [],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newCompany = toCompany(raw as any);
        setCompanies(prev => [newCompany, ...prev]);
        setActiveCompany(newCompany);
        setCurrentUser({
          id: `rec-${newCompany.id}`, email: newCompany.hrEmail, name: newCompany.hrName,
          role: 'recruiter', companyId: newCompany.id, title: `Talent Partner at ${newCompany.name}`,
        });
        setRoleState('recruiter');
        return { success: true };
      } catch (err: unknown) {
        return { success: false, message: err instanceof Error ? err.message : 'Registration failed.' };
      }
    }

    if (regRole === 'placement_officer') {
      const tpoName = (data.name as string) || 'Placement Officer';
      const tpoEmail = (data.email as string) || '';
      const instName = (data.institutionName as string) || 'Institution';
      if (!tpoEmail) return { success: false, message: 'TPO email is required.' };

      try {
        const raw = await API.createInstitution({
          name: instName,
          campus: (data.campus as string) || '',
          code: (data.code as string) || '',
          state: (data.state as string) || '',
          tpo_name: tpoName,
          tpo_email: tpoEmail,
          tpo_phone: (data.tpoPhone as string) || '',
          contact_email: tpoEmail,
          departments: (data.departments as string[]) || [],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newInst = toInstitution(raw as any);
        setInstitutions(prev => [newInst, ...prev]);
        setActiveInstitution(newInst);
        setCurrentUser({
          id: `tpo-${newInst.id}`, email: newInst.tpoEmail, name: newInst.tpoName,
          role: 'placement_officer', institutionId: newInst.id,
          title: 'Head of Career Services & Placements',
        });
        setRoleState('placement_officer');
        return { success: true };
      } catch (err: unknown) {
        return { success: false, message: err instanceof Error ? err.message : 'Registration failed.' };
      }
    }

    if (regRole === 'faculty') {
      const name = (data.name as string) || 'Faculty Member';
      const email = (data.email as string) || '';
      const user: UserAccount = {
        id: `fac-${Date.now()}`, email,
        name, role: 'faculty',
        institutionId: (data.institutionId as string) || institutions[0]?.id || 'inst-default',
        department: (data.department as string) || 'Design Faculty',
        title: 'Design Faculty & Academic Mentor',
      };
      setCurrentUser(user);
      setRoleState('faculty');
      await addAuditLog('FACULTY_REGISTRATION', `Faculty ${user.name} joined the platform.`, 'COMPLIANCE');
      return { success: true };
    }

    return { success: false, message: 'Unsupported role for registration.' };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', `${currentUser.name} signed out.`, 'COMPLIANCE');
    }
    setCurrentUser(null);
    setRoleState('guest');
  };

  const switchPersona = (targetRole: UserRole, entityId?: string) => {
    if (targetRole === 'guest') { logout(); return; }
    if (targetRole === 'student') {
      const stu = entityId ? students.find(s => s.id === entityId) || activeStudent : activeStudent;
      if (!stu?.id) return;
      setActiveStudent(stu);
      setCurrentUser({ id: stu.id, email: stu.email, name: stu.name, role: 'student', avatar: stu.avatar, institutionId: stu.institutionId, department: stu.department });
      setRoleState('student');
    } else if (targetRole === 'recruiter') {
      const comp = entityId ? companies.find(c => c.id === entityId) || activeCompany : activeCompany;
      if (!comp?.id) return;
      setActiveCompany(comp);
      setCurrentUser({ id: `rec-${comp.id}`, email: comp.hrEmail, name: comp.hrName, role: 'recruiter', companyId: comp.id, avatar: comp.logo });
      setRoleState('recruiter');
    } else if (targetRole === 'placement_officer') {
      const inst = entityId ? institutions.find(i => i.id === entityId) || activeInstitution : activeInstitution;
      if (!inst?.id) return;
      setActiveInstitution(inst);
      setCurrentUser({ id: `tpo-${inst.id}`, email: inst.tpoEmail, name: inst.tpoName, role: 'placement_officer', institutionId: inst.id, avatar: inst.logo });
      setRoleState('placement_officer');
    } else if (targetRole === 'faculty') {
      setCurrentUser({ id: `fac-${Date.now()}`, email: 'faculty@institution.edu', name: 'Faculty Mentor', role: 'faculty', institutionId: institutions[0]?.id });
      setRoleState('faculty');
    } else if (targetRole === 'admin') {
      setCurrentUser({ id: 'adm-institutional', email: 'admin@institution.edu', name: 'System Administrator', role: 'admin', institutionId: institutions[0]?.id, title: 'Dean of Academic Affairs & Systems' });
      setRoleState('admin');
    }
  };

  // ─── TPO Operations ───────────────────────────────────────────────────────────

  const verifyCompany = async (companyId: string, status: 'verified' | 'rejected', reason?: string) => {
    await API.verifyCompany(companyId, status, reason);
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, verified: status === 'verified', verificationStatus: status, rejectionReason: reason } : c));
    await addAuditLog(
      status === 'verified' ? 'COMPANY_VERIFICATION_APPROVED' : 'COMPANY_VERIFICATION_REJECTED',
      `Company ${status}. Reason: ${reason || 'N/A'}`,
      'VERIFICATION'
    );
  };

  const approveDriveForInstitution = async (driveId: string, institutionId: string) => {
    await API.approveDrive(driveId, institutionId);
    setDrives(prev => prev.map(d => {
      if (d.id !== driveId) return d;
      const approved = d.approvedInstitutionIds.includes(institutionId) ? d.approvedInstitutionIds : [...d.approvedInstitutionIds, institutionId];
      return { ...d, approvedInstitutionIds: approved };
    }));
    const drive = drives.find(d => d.id === driveId);
    await addAuditLog('CAMPUS_DRIVE_APPROVED', `Drive "${drive?.roleTitle || driveId}" approved for campus recruitment.`, 'DRIVE');
  };

  // ─── Recruiter Operations ─────────────────────────────────────────────────────

  const createPlacementDrive = async (driveData: Omit<CampusDrive, 'id' | 'createdAt'>) => {
    const raw = await API.createDrive({
      company_id: driveData.companyId,
      company_name: driveData.companyName,
      company_logo: driveData.companyLogo,
      role_title: driveData.roleTitle,
      design_discipline: driveData.designDiscipline,
      job_type: driveData.jobType,
      package_lpa: driveData.packageLpa,
      location: driveData.location,
      application_deadline: driveData.applicationDeadline,
      drive_date: driveData.driveDate,
      eligibility: driveData.eligibility as unknown as Record<string, unknown>,
      approved_institution_ids: driveData.approvedInstitutionIds,
      status: driveData.status,
      description: driveData.description,
      openings: driveData.openings,
      rounds: driveData.rounds,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newDrive = toDrive(raw as any);
    setDrives(prev => [newDrive, ...prev]);
    await addAuditLog('CAMPUS_DRIVE_CREATED', `Drive "${newDrive.roleTitle}" created by ${newDrive.companyName}.`, 'DRIVE');
  };

  const updateDriveRounds = async (driveId: string, rounds: PlacementRoundConfig[]) => {
    await API.updateDriveRounds(driveId, rounds);
    setDrives(prev => prev.map(d => d.id === driveId ? { ...d, rounds } : d));
    await addAuditLog('DRIVE_ROUNDS_UPDATED', `Selection rounds updated for drive ${driveId}.`, 'ROUND_ENGINE');
  };

  const advanceCandidateRound = async (appId: string, nextRoundIndex: number, score?: number, feedback?: string) => {
    const raw = await API.advanceCandidateRound(appId, nextRoundIndex, score, feedback);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = toApplication(raw as any);
    setApplications(prev => prev.map(a => a.id === appId ? updated : a));
    const app = applications.find(a => a.id === appId);
    await addAuditLog('PLACEMENT_ROUND_ADVANCED', `${app?.studentName || appId} advanced to Round ${nextRoundIndex + 1}.`, 'ROUND_ENGINE');
  };

  const rejectCandidate = async (appId: string, reason: string) => {
    const raw = await API.rejectCandidate(appId, reason);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = toApplication(raw as any);
    setApplications(prev => prev.map(a => a.id === appId ? updated : a));
    const app = applications.find(a => a.id === appId);
    await addAuditLog('CANDIDATE_REJECTED', `${app?.studentName || appId} disqualified. ${reason}`, 'ROUND_ENGINE');
  };

  const offerCandidatePlacement = async (
    appId: string,
    offerDetails: { packageLpa: string; roleTitle: string; joiningDate: string; acceptanceDeadline: string }
  ) => {
    const raw = await API.extendOffer(appId, offerDetails.packageLpa, offerDetails.roleTitle, offerDetails.joiningDate, offerDetails.acceptanceDeadline);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = toApplication(raw as any);
    setApplications(prev => prev.map(a => a.id === appId ? updated : a));

    // Update student placement status locally
    const app = applications.find(a => a.id === appId);
    if (app) {
      setStudents(prev => prev.map(s => s.id === app.studentId ? { ...s, placementStatus: 'Placed' } : s));
    }
    await addAuditLog('OFFICIAL_OFFER_EXTENDED', `Offer extended to ${app?.studentName} for ${offerDetails.roleTitle}.`, 'APPLICATION');
  };

  // ─── Student Operations ───────────────────────────────────────────────────────

  const applyToDrive = async (driveId: string): Promise<{ success: boolean; message: string }> => {
    if (!activeStudent?.id) return { success: false, message: 'Please log in as a student to apply.' };
    try {
      const raw = await API.applyToDrive(driveId, activeStudent.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newApp = toApplication(raw as any);
      setApplications(prev => [newApp, ...prev]);
      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, placementStatus: 'In Process' } : s));
      const drive = drives.find(d => d.id === driveId);
      await addAuditLog('STUDENT_APPLICATION', `${activeStudent.name} applied to "${drive?.roleTitle || driveId}".`, 'APPLICATION');
      return { success: true, message: 'Application submitted successfully!' };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Application failed.' };
    }
  };

  const runPortfolioAnalysis = async (studentId: string, portfolioUrl: string) => {
    try {
      // Try real backend first
      const online = await API.checkBackendHealth();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let report: any;

      if (online) {
        try {
          // Try portfolio analysis pod
          const { jobId } = await API.analyzePortfolioUrl(portfolioUrl);
          // Poll for result (max 30s)
          let result: unknown = null;
          for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
              result = await API.getPortfolioResult(jobId);
              break;
            } catch { /* still processing */ }
          }
          if (result) {
            report = result;
          }
        } catch {
          // Portfolio pod not available, fall through to simulation
        }
      }

      // Fallback simulation
      if (!report) {
        const stu = students.find(s => s.id === studentId);
        const sim = API.simulatePortfolioAnalysis(portfolioUrl, stu?.skills || []);
        report = {
          portfolioReport: sim.portfolioReport,
          portfolioScore: sim.portfolioScore,
          assessmentScore: sim.assessmentScore,
          careerReadiness: sim.careerReadiness,
        };
      }

      const portfolioScore = report.portfolioScore ?? report.portfolio_score ?? 75;
      const assessmentScore = report.assessmentScore ?? report.assessment_score ?? 70;
      const careerReadiness = report.careerReadiness ?? report.career_readiness ?? Math.round((portfolioScore + assessmentScore) / 2);
      const portfolioReport = report.portfolioReport || report.portfolio_report || {};

      await API.updateStudentPortfolio(studentId, portfolioReport, portfolioScore, assessmentScore, careerReadiness);
      setStudents(prev => prev.map(s => s.id === studentId ? {
        ...s,
        portfolioScore,
        assessmentScore,
        careerReadiness,
        portfolioReport: portfolioReport as StudentProfile['portfolioReport'],
      } : s));

      await addAuditLog('PORTFOLIO_ANALYZED', `Portfolio analysis completed for student ${studentId}. Score: ${portfolioScore}`, 'COMPLIANCE');
    } catch (err) {
      console.error('Portfolio analysis error:', err);
    }
  };

  const completeStudentIntervention = async (taskId: string) => {
    await API.completeIntervention(taskId);
    setInterventions(prev => prev.map(i => i.id === taskId ? { ...i, status: 'Completed' } : i));
    await addAuditLog('INTERVENTION_COMPLETED', `Task ${taskId} marked complete by student.`, 'FACULTY_TASK');
  };

  // ─── Faculty Operations ───────────────────────────────────────────────────────

  const assignFacultyIntervention = async (data: { studentId: string; title: string; description: string; priority: 'High' | 'Medium' | 'Low'; dueDate: string }) => {
    const actorName = currentUser?.name || 'Faculty';
    const actorId = currentUser?.id || 'fac-system';

    const raw = await API.createIntervention(actorName, actorId, {
      student_id: data.studentId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      due_date: data.dueDate,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newIntv = toIntervention(raw as any);
    setInterventions(prev => [newIntv, ...prev]);
    await addAuditLog('FACULTY_INTERVENTION_ASSIGNED', `Task "${data.title}" assigned to student ${data.studentId}.`, 'FACULTY_TASK');
  };

  // ─── Reset ────────────────────────────────────────────────────────────────────

  const resetAllData = () => {
    // Clear session
    localStorage.removeItem(SESSION_KEYS.ROLE);
    localStorage.removeItem(SESSION_KEYS.CURRENT_USER);
    setCurrentUser(null);
    setRoleState('guest');
    // Note: backend SQLite data is NOT cleared — this only clears the session
  };

  // ─── Context Value ────────────────────────────────────────────────────────────

  const value: AppContextType = {
    currentUser, role, setRole: setRoleState,
    login, register, logout, switchPersona,
    backendOnline,
    activeInstitution, setActiveInstitution,
    activeCompany, setActiveCompany,
    activeStudent, setActiveStudent,
    institutions, departments, batches,
    companies, students, drives,
    applications, interventions, externalOpportunities, auditLogs,
    dataLoading, refreshData,
    theme, setTheme: setThemeState, toggleTheme,
    verifyCompany, approveDriveForInstitution,
    createPlacementDrive, updateDriveRounds,
    advanceCandidateRound, rejectCandidate, offerCandidatePlacement,
    applyToDrive, runPortfolioAnalysis, completeStudentIntervention,
    assignFacultyIntervention,
    addAuditLog, resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
