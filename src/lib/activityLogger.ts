import {
  ActivityCategory,
  ActivityLogEntry,
  LocationCaptureStatus,
  saveActivityLogToCloud
} from './firebase';

export const ACTIVITY_LOGS_STORAGE_KEY = 'pks_activity_logs_v1';
const MAX_LOCAL_LOGS = 1500;
const GRANTED_CACHE_TTL_MS = 120 * 1000; // 2 minutes
const FAILED_CACHE_TTL_MS = 45 * 1000; // 45 seconds

export interface ActivityActor {
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'juri' | 'sekolah' | 'user';
}

interface LocationSnapshot {
  locationStatus: LocationCaptureStatus;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  fetchedAt: number;
}

let cachedLocation: LocationSnapshot | null = null;
let lastKnownValidCoords: { latitude: number; longitude: number; accuracy: number | null } | null = null;
let pendingLocationPromise: Promise<LocationSnapshot> | null = null;

export function loadCachedActivityLogs(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistCachedActivityLogs(logs: ActivityLogEntry[]) {
  try {
    const sorted = [...logs]
      .sort((a, b) => (b.timestampIso || '').localeCompare(a.timestampIso || ''))
      .slice(0, MAX_LOCAL_LOGS);
    localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    // ignore storage quota errors
  }
}

export function formatLocalDateTime(now: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return {
    dateLabel: `${year}-${month}-${day}`,
    timeLabel: `${hours}:${minutes}:${seconds}`,
    timestampIso: now.toISOString()
  };
}

export function getShortUserAgent(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  let os = 'Desktop';
  if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return `${browser} · ${os}`;
}

export function getTabReadableLabel(tabKey: string): string {
  const map: Record<string, string> = {
    dashboard: 'Dashboard & Ringkasan',
    pbb: 'Penilaian PBB Terpadu',
    devile: 'Penilaian Devile & Uniform',
    danton: 'Penilaian Danton / Komandan',
    rekap: 'Rekapitulasi & Juara Umum',
    form_polisi_pelajar: 'Form Polisi Pelajar',
    form_calon_pks: 'Form Calon Anggota PKS',
    form_perkemahan_balok1: 'Form Kemah PKS Balok 1',
    form_perkemahan_balok2: 'Form PKS Balok 2',
    anggota_pks: 'Direktori Anggota PKS',
    rekap_pendaftaran: 'Rekap Pendaftaran Sekolah',
    log_aktivitas: 'Log Aktivitas Pengguna'
  };
  return map[tabKey] || tabKey;
}

export async function captureBrowserLocation(forceRefresh = false): Promise<LocationSnapshot> {
  const now = Date.now();

  if (!forceRefresh && cachedLocation) {
    const ttl = cachedLocation.locationStatus === 'granted' ? GRANTED_CACHE_TTL_MS : FAILED_CACHE_TTL_MS;
    if (now - cachedLocation.fetchedAt < ttl) {
      return cachedLocation;
    }
  }

  if (pendingLocationPromise) {
    return pendingLocationPromise;
  }

  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    const unavailableSnapshot: LocationSnapshot = {
      locationStatus: 'unavailable',
      latitude: null,
      longitude: null,
      accuracy: null,
      fetchedAt: now
    };
    cachedLocation = unavailableSnapshot;
    return unavailableSnapshot;
  }

  pendingLocationPromise = new Promise<LocationSnapshot>(resolve => {
    try {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const acc = typeof pos.coords.accuracy === 'number' ? Math.round(pos.coords.accuracy) : null;
          lastKnownValidCoords = { latitude: lat, longitude: lng, accuracy: acc };
          const snap: LocationSnapshot = {
            locationStatus: 'granted',
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            fetchedAt: Date.now()
          };
          cachedLocation = snap;
          pendingLocationPromise = null;
          resolve(snap);
        },
        err => {
          let status: LocationCaptureStatus = 'unavailable';
          if (err && err.code === 1) {
            status = 'denied';
          } else if (err && err.code === 3) {
            status = 'timeout';
          }

          // If GPS temporarily timed out but we already captured valid coords in this session, reuse them
          if (status === 'timeout' && lastKnownValidCoords) {
            const snap: LocationSnapshot = {
              locationStatus: 'granted',
              latitude: lastKnownValidCoords.latitude,
              longitude: lastKnownValidCoords.longitude,
              accuracy: lastKnownValidCoords.accuracy,
              fetchedAt: Date.now()
            };
            cachedLocation = snap;
            pendingLocationPromise = null;
            resolve(snap);
            return;
          }

          const snap: LocationSnapshot = {
            locationStatus: status,
            latitude: null,
            longitude: null,
            accuracy: null,
            fetchedAt: Date.now()
          };
          cachedLocation = snap;
          pendingLocationPromise = null;
          resolve(snap);
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 60000
        }
      );
    } catch {
      const snap: LocationSnapshot = {
        locationStatus: 'unavailable',
        latitude: null,
        longitude: null,
        accuracy: null,
        fetchedAt: Date.now()
      };
      cachedLocation = snap;
      pendingLocationPromise = null;
      resolve(snap);
    }
  });

  return pendingLocationPromise;
}

export interface RecordActivityParams {
  user: ActivityActor | null | undefined;
  actionCategory: ActivityCategory;
  actionTitle: string;
  details: string;
  tabContext?: string;
  forceRefreshLocation?: boolean;
  onRecorded?: (entry: ActivityLogEntry) => void;
}

export async function recordUserActivity({
  user,
  actionCategory,
  actionTitle,
  details,
  tabContext = 'dashboard',
  forceRefreshLocation = false,
  onRecorded
}: RecordActivityParams): Promise<ActivityLogEntry | null> {
  if (!user || !user.username) return null;

  const { dateLabel, timeLabel, timestampIso } = formatLocalDateTime(new Date());
  const loc = await captureBrowserLocation(forceRefreshLocation);

  const safeUsername = String(user.username).trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').slice(0, 100) || 'user';
  const randSuffix = Math.random().toString(36).slice(2, 8);
  const logId = `log_${Date.now()}_${safeUsername.slice(0, 24)}_${randSuffix}`;

  const entry: ActivityLogEntry = {
    id: logId,
    username: String(user.username).trim().toLowerCase().slice(0, 100),
    userName: String(user.name || user.username).trim().slice(0, 150),
    userRole: user.role || 'user',
    actionCategory,
    actionTitle: String(actionTitle).trim().slice(0, 150),
    details: String(details || '').trim().slice(0, 500),
    tabContext: String(tabContext || 'dashboard').trim().slice(0, 80),
    locationStatus: loc.locationStatus,
    latitude: loc.latitude,
    longitude: loc.longitude,
    accuracy: loc.accuracy,
    dateLabel,
    timeLabel,
    timestampIso,
    userAgent: getShortUserAgent().slice(0, 200)
  };

  // Update local cache immediately
  const existing = loadCachedActivityLogs();
  persistCachedActivityLogs([entry, ...existing]);

  if (onRecorded) {
    onRecorded(entry);
  }

  // Persist to Cloud Firestore asynchronously
  void saveActivityLogToCloud(entry);

  return entry;
}
