import type { Opportunity } from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const JOB_SCRATCHER_URL = 'https://job-scratcher.onrender.com';
const FIRESTORE_COLLECTION = 'opportunities';

// ─── Firestore helpers ───────────────────────────────────────────────────────

/** Read all cached opportunities from Firestore */
async function readFromFirestore(): Promise<Opportunity[]> {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('postedAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Opportunity));
  } catch {
    // If order-by fails (no index), fall back to unordered
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      if (snap.empty) return [];
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Opportunity));
    } catch {
      return [];
    }
  }
}

/** Persist a list of opportunities to Firestore (upsert by id) */
async function persistToFirestore(ops: Opportunity[]): Promise<void> {
  try {
    const writes = ops.map((op) =>
      setDoc(
        doc(db, FIRESTORE_COLLECTION, op.id),
        { ...op, _cachedAt: serverTimestamp() },
        { merge: true }
      )
    );
    await Promise.all(writes);
    console.log(`[opportunities] Persisted ${ops.length} jobs to Firestore.`);
  } catch (e) {
    console.warn('[opportunities] Could not persist to Firestore:', e);
  }
}

// ─── API helpers ─────────────────────────────────────────────────────────────

function mapApiItem(item: any, candidateSkills: string[]): Opportunity {
  let calculatedMatch = 0;
  
  const rawSkills = item.skills || item.requiredSkills || item.keywords || [];
  const parsedSkills = (Array.isArray(rawSkills) ? rawSkills : [])
    .map((s: any) => s.name || s)
    .filter(Boolean);

  if (candidateSkills && candidateSkills.length > 0) {
    const textToSearch = (
      (item.description || '') +
      ' ' +
      (item.title || '') +
      ' ' +
      parsedSkills.join(' ')
    ).toLowerCase();
    const matches = candidateSkills.filter((sk) => textToSearch.includes(sk.toLowerCase())).length;
    const ratio = matches / candidateSkills.length;
    calculatedMatch = Math.round(ratio * 100);
  } else {
    calculatedMatch = item.matchPercentage || 0;
  }

  const companySlug = (item.company || item.companyName || '').replace(/\s+/g, '').toLowerCase();
  
  // Procedural generation based on ID so it's stable
  const seed = (item.id || companySlug).charCodeAt(0) || 1;
  const rating = parseFloat((4.0 + (seed % 10) / 10).toFixed(1));
  const reviewCount = 100 + (seed * 47) % 3000;
  const employeesRecommend = ((reviewCount * 0.8) / 1000).toFixed(1) + 'k';
  
  const testimonials = [
    { text: "Amazing culture & work-life balance.", author: "Designer, 2 yrs" },
    { text: "Great place to learn and grow.", author: "Engineer, 1 yr" },
    { text: "Fantastic team and benefits.", author: "Product Manager, 3 yrs" },
    { text: "Challenging but very rewarding.", author: "Developer, 4 yrs" },
    { text: "Leadership truly cares about you.", author: "Analyst, 2 yrs" }
  ];
  const t = testimonials[seed % testimonials.length];

  return {
    id: item.id || crypto.randomUUID(),
    title: item.title || 'Unknown Role',
    companyName: item.company || item.companyName || 'Unknown Company',
    companyOverview: item.description?.substring(0, 200) || '',
    location: item.location || 'Remote',
    locationType: (item.remote_status || 'remote') as any,
    workType:
      item.category === 'internship'
        ? 'internship'
        : item.category === 'freelance'
        ? 'freelance'
        : 'full_time',
    discipline:
      item.domain?.replace('_', '/').replace('ux/ui', 'UI/UX') || 'UI/UX',
    matchPercentage: calculatedMatch,
    logo: `https://logo.clearbit.com/${companySlug}.com`,
    postedAt: item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    tags: parsedSkills,
    description: item.description || 'No description provided.',
    requiredSkills: parsedSkills,
    compensation: item.salaryRange || item.salary_range || 'Competitive',
    applyUrl: item.apply_url || item.applyUrl || '',
    teamInfo: '',
    hiringProcess: [
      'Resume Review',
      'Technical Interview',
      'Culture Fit',
    ],
    rating: item.rating || rating,
    reviewCount: item.reviewCount || reviewCount,
    employeesRecommend: item.employeesRecommend || employeesRecommend,
    testimonial: item.testimonial || t.text,
    testimonialAuthor: item.testimonialAuthor || t.author,
    questions: [],
  };
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

/**
 * Fetch opportunities with a cache-first + persist strategy:
 * 1. Try the live job-scratcher API
 * 2. If it returns data → recalculate match scores → persist to Firestore → return
 * 3. If API is empty or fails → fall back to Firestore cache (permanent storage)
 */
export async function fetchOpportunities(skills?: string[]): Promise<Opportunity[]> {
  // ── Step 1: Try live API (Scraper + Unified Backend) ────────────────────────
  let combinedOps: any[] = [];
  try {
    const res = await fetch(`${JOB_SCRATCHER_URL}/api/v1/opportunities?limit=200`, {
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) combinedOps = [...data];
    }
  } catch (err) {
    console.warn('[opportunities] Scraper API unreachable:', err);
  }

  try {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${API_BASE}/api/collections/jobs`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) combinedOps = [...combinedOps, ...data];
    }
  } catch (err) {
    console.warn('[opportunities] Unified Backend collections unreachable:', err);
  }

  if (combinedOps.length > 0) {
    // Map and enrich with match scores
    const ops = combinedOps.map((item) => mapApiItem(item, skills || []));

    // ── Step 2: Persist to Firestore in background ─────────────────────
    persistToFirestore(ops).catch(() => {});

    console.log(`[opportunities] Fetched ${ops.length} jobs from combined APIs.`);
    return ops.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  console.warn('[opportunities] Live APIs returned 0 jobs, falling back to Firestore cache.');
    import('../store/notificationStore').then(({ useNotificationStore }) => {
      useNotificationStore.getState().pushNotification({
        type: 'match_alert',
        message: 'Live job feed unavailable. Displaying cached jobs from database.',
      });
    });
  // ── Step 3: Fall back to Firestore permanent cache ──────────────────────────
  const cached = await readFromFirestore();

  if (cached.length > 0) {
    // Re-calculate match scores with current candidate skills
    const enriched = cached.map((op) => {
      if (!skills || skills.length === 0) return op;
      const textToSearch = (
        (op.description || '') +
        ' ' +
        (op.title || '') +
        ' ' +
        (op.tags || []).join(' ')
      ).toLowerCase();
      const matches = skills.filter((sk) => textToSearch.includes(sk.toLowerCase())).length;
      const ratio = matches / skills.length;
      return { ...op, matchPercentage: Math.round(ratio * 100) };
    });

    console.log(`[opportunities] Serving ${enriched.length} jobs from Firestore cache.`);
    return enriched;
  }

  // Both API and cache are empty
  console.error('[opportunities] No jobs available from API or Firestore cache.');
  return [];
}

export async function fetchOpportunity(
  id: string,
  skills?: string[]
): Promise<Opportunity | undefined> {
  const all = await fetchOpportunities(skills);
  return all.find((o) => o.id === id);
}
