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

function mapApiItem(item: any, skills: string[]): Opportunity {
  let calculatedMatch = 0;
  if (skills && skills.length > 0) {
    const textToSearch = (
      (item.description || '') +
      ' ' +
      (item.title || '') +
      ' ' +
      (Array.isArray(item.skills) ? item.skills.map((s: any) => s.name || s).join(' ') : '')
    ).toLowerCase();
    const matches = skills.filter((sk) => textToSearch.includes(sk.toLowerCase())).length;
    const ratio = matches / skills.length;
    calculatedMatch = Math.round(40 + ratio * 58);
  } else {
    calculatedMatch = item.matchPercentage || Math.floor(Math.random() * 30 + 55);
  }

  const companySlug = (item.company || item.companyName || '').replace(/\s+/g, '').toLowerCase();

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
    tags: (Array.isArray(item.skills) ? item.skills : [])
      .map((s: any) => s.name || s)
      .filter(Boolean),
    description: item.description || 'No description provided.',
    requiredSkills: (Array.isArray(item.skills) ? item.skills : [])
      .map((s: any) => s.name || s)
      .filter(Boolean),
    compensation: item.salary || item.stipend || 'Not specified',
    applyUrl: item.apply_url || item.applyUrl || '',
    teamInfo: '',
    hiringProcess: [],
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
  // ── Step 1: Try live API ────────────────────────────────────────────────────
  try {
    const res = await fetch(`${JOB_SCRATCHER_URL}/api/v1/opportunities?limit=200`, {
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (res.ok) {
      const data: any[] = await res.json();

      if (data && data.length > 0) {
        // Map and enrich with match scores
        const ops = data.map((item) => mapApiItem(item, skills || []));

        // ── Step 2: Persist to Firestore in background ─────────────────────
        persistToFirestore(ops); // fire-and-forget

        console.log(`[opportunities] Fetched ${ops.length} jobs from live API.`);
        return ops;
      }

      // API returned empty array — fall through to Firestore cache
      console.warn('[opportunities] Live API returned 0 jobs, falling back to Firestore cache.');
    }
  } catch (err) {
    console.warn('[opportunities] Live API unreachable, falling back to Firestore cache:', err);
  }

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
      return { ...op, matchPercentage: Math.round(40 + ratio * 58) };
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
