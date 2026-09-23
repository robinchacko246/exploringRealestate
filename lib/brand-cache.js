/**
 * brand-cache.js
 * Caches admin_settings in localStorage so components can
 * initialize with real data on the first render — no flash.
 *
 * TTL: 5 minutes (stale-while-revalidate: always re-fetch in BG)
 */

const CACHE_KEY = "dealwhisper_admin_settings";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

/** Read cached settings synchronously. Returns null if missing / expired. */
export function getCachedSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null; // expired
    return data;
  } catch {
    return null;
  }
}

/** Save settings map to localStorage with a timestamp. */
export function setCachedSettings(map) {
  if (typeof window === "undefined" || !map) return;
  try {
    let existing = {};
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.data && typeof parsed.data === "object") {
          existing = parsed.data;
        }
      } catch {}
    }
    const merged = { ...existing, ...map };
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: merged, timestamp: Date.now() })
    );
  } catch {
    // Ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

/**
 * Merge DEFAULTS → cached → live DB data.
 * Usage (in useState lazy initializer):
 *
 *   const [cfg, setCfg] = useState(() => mergeWithCache(DEFAULTS));
 */
export function mergeWithCache(defaults) {
  const cached = getCachedSettings();
  return cached ? { ...defaults, ...cached } : { ...defaults };
}
