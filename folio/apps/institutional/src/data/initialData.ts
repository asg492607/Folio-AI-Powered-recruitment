/**
 * initialData.ts — intentionally empty.
 *
 * All data is now persisted in the SQLite backend (institutional.db).
 * The app starts fresh — users register and create data through the UI.
 *
 * These exports remain for type compatibility with AppContext.
 */
import type {
  InstitutionProfile,
  CompanyProfile,
  StudentProfile,
  CampusDrive,
  JobApplication,
  FacultyIntervention,
  ExternalOpportunity,
  SystemAuditLog,
  DepartmentProfile,
  BatchProfile
} from '../types';

export const INITIAL_INSTITUTIONS: InstitutionProfile[] = [];
export const INITIAL_DEPARTMENTS: DepartmentProfile[] = [];
export const INITIAL_BATCHES: BatchProfile[] = [];
export const INITIAL_COMPANIES: CompanyProfile[] = [];
export const INITIAL_STUDENTS: StudentProfile[] = [];
export const INITIAL_DRIVES: CampusDrive[] = [];
export const INITIAL_APPLICATIONS: JobApplication[] = [];
export const INITIAL_INTERVENTIONS: FacultyIntervention[] = [];
export const INITIAL_EXTERNAL_OPPORTUNITIES: ExternalOpportunity[] = [];
export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [];
