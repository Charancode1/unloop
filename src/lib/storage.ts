import { CheckInStore, UnloopData } from "./types";
import { addDays, formatDateKey, getTodayKey } from "./dates";

const STORAGE_KEY = "unloop_app_data_v1";

let memoryCheckIns: CheckInStore = {};
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((callback) => callback());
}

/**
 * Load saved check-ins from localStorage
 */
export function loadCheckIns(): CheckInStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as UnloopData | CheckInStore;
    if ("checkIns" in parsed && typeof parsed.checkIns === "object") {
      return parsed.checkIns || {};
    }
    return parsed as CheckInStore;
  } catch (err) {
    console.error("Failed to parse Unloop local storage data:", err);
    return {};
  }
}

/**
 * Save check-ins to localStorage and notify listeners
 */
export function saveCheckIns(checkIns: CheckInStore): void {
  memoryCheckIns = checkIns;
  initialized = true;

  if (typeof window !== "undefined") {
    try {
      const data: UnloopData = {
        version: 1,
        checkIns,
        firstTrackedDate: getTodayKey(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save Unloop data to localStorage:", err);
    }
  }

  notify();
}

/**
 * Subscribe to store changes for useSyncExternalStore
 */
export function subscribeCheckIns(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Client snapshot for useSyncExternalStore
 */
export function getCheckInsSnapshot(): CheckInStore {
  if (!initialized && typeof window !== "undefined") {
    memoryCheckIns = loadCheckIns();
    initialized = true;
  }
  return memoryCheckIns;
}

const emptySnapshot: CheckInStore = {};
/**
 * Server snapshot for useSyncExternalStore
 */
export function getServerSnapshot(): CheckInStore {
  return emptySnapshot;
}

/**
 * Clear all data from localStorage
 */
export function clearAllData(): void {
  memoryCheckIns = {};
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  notify();
}

/**
 * Export data as downloadable JSON
 */
export function exportData(): string {
  const checkIns = getCheckInsSnapshot();
  const exportPayload = {
    app: "Unloop",
    version: 1,
    exportDate: new Date().toISOString(),
    totalSuccessfulDays: Object.values(checkIns).filter(Boolean).length,
    checkIns,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Import data from JSON string
 */
export function importData(jsonString: string): CheckInStore {
  const parsed = JSON.parse(jsonString);
  let importedCheckIns: CheckInStore = {};
  if (parsed.checkIns && typeof parsed.checkIns === "object") {
    importedCheckIns = parsed.checkIns;
  } else if (typeof parsed === "object") {
    importedCheckIns = parsed;
  } else {
    throw new Error("Invalid Unloop backup file format.");
  }

  saveCheckIns(importedCheckIns);
  return importedCheckIns;
}

/**
 * Generates an inspiring sample dataset showing a realistic 60+ day journey
 * for previewing the GitHub heatmap without overwriting unless requested.
 */
export function generateSampleData(): CheckInStore {
  const checkIns: CheckInStore = {};
  const today = new Date();

  // Create a realistic habit breaking journey over the past 120 days
  // with a strong recent streak of 24 days, and intermittent good streaks before
  for (let i = 0; i <= 120; i++) {
    const date = addDays(today, -i);
    const key = formatDateKey(date);

    if (i < 24) {
      // Current active streak: last 24 days successful
      checkIns[key] = true;
    } else if (i === 24) {
      // Slip 25 days ago
      checkIns[key] = false;
    } else if (i < 48) {
      // 23 day streak
      checkIns[key] = true;
    } else if (i < 52) {
      // Slips
      checkIns[key] = false;
    } else if (i < 80) {
      // 28 day streak
      checkIns[key] = true;
    } else if (i % 3 !== 0) {
      checkIns[key] = true;
    }
  }

  return checkIns;
}
