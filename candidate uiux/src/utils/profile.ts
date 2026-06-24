import type { Candidate } from '../types';

export function calculateProfileCompletion(candidate?: Candidate | null) {
  if (!candidate) return 0;
  const checks = [
    Boolean(candidate.personalInfo.name),
    Boolean(candidate.personalInfo.location),
    candidate.designDiscipline.length > 0,
    candidate.skills.length >= 3,
    Boolean(candidate.careerGoals),
    Boolean(candidate.aboutMe),
    candidate.education.length > 0,
    candidate.projects.length > 0,
    candidate.portfolioLinks.length > 0,
    candidate.experienceLevel !== undefined,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function displayRole(role: Candidate['role']) {
  return role
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
