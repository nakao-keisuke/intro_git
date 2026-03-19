import type {
  ProfileAttribution,
  ProfileAttributionInput,
} from '@/types/profileAttributionType';

const STORAGE_KEY = 'profile_attribution_v1';
const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000; // 30分

export function setProfileAttribution(
  input: ProfileAttributionInput,
): ProfileAttribution {
  if (typeof window === 'undefined') {
    return { ...input, ts: Date.now(), nonce: '' };
  }
  const value: ProfileAttribution = {
    ...input,
    ts: Date.now(),
    nonce: crypto.randomUUID(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
  return value;
}

export function getProfileAttribution(
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): ProfileAttribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as ProfileAttribution;
    if (Date.now() - value.ts > maxAgeMs) {
      clearProfileAttribution();
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function clearProfileAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function normalizePathToSource(path: string): string {
  const noHead = (path || '').replace(/^\/+/, '');
  const replaced = noHead.replaceAll('/', '_');
  return replaced || 'girls_all';
}

export function formatProfileAttributionSource(
  attribution: ProfileAttribution | null,
): string | null {
  if (!attribution) return null;
  const baseSource = normalizePathToSource(attribution.source_path);
  // セクション名がある場合は連結
  if (attribution.section_name) {
    return `${baseSource}_${attribution.section_name}`;
  }
  return baseSource;
}
