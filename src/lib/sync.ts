import { getSupabase } from "./supabase";
import { CheckInStore } from "./types";

export interface SyncStatus {
  state: "synced" | "syncing" | "offline" | "error";
  lastSyncedAt?: Date;
  errorMessage?: string;
}

/**
 * Fetch all check-in records for a given user from Supabase
 */
export async function fetchCloudCheckIns(userId: string): Promise<CheckInStore | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("daily_check_ins")
      .select("date_key, is_successful")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching check-ins from Supabase:", error);
      throw error;
    }

    const store: CheckInStore = {};
    if (data) {
      for (const row of data) {
        store[row.date_key] = Boolean(row.is_successful);
      }
    }
    return store;
  } catch (err) {
    console.error("fetchCloudCheckIns failure:", err);
    throw err;
  }
}

/**
 * Save or update a single day's check-in status in Supabase
 */
export async function upsertCloudCheckIn(
  userId: string,
  dateKey: string,
  isSuccessful: boolean
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("daily_check_ins").upsert(
    {
      user_id: userId,
      date_key: dateKey,
      is_successful: isSuccessful,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date_key" }
  );

  if (error) {
    console.error("Error saving check-in to Supabase:", error);
    throw error;
  }
}

/**
 * Migrate local check-ins into the cloud database safely without duplicates
 */
export async function migrateLocalCheckInsToCloud(
  userId: string,
  localCheckIns: CheckInStore
): Promise<{ insertedCount: number; mergedStore: CheckInStore }> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  // 1. Fetch current cloud state
  const cloudStore = (await fetchCloudCheckIns(userId)) || {};

  // 2. Identify entries from local that should be uploaded
  const rowsToUpsert = Object.entries(localCheckIns).map(([date_key, is_successful]) => ({
    user_id: userId,
    date_key,
    is_successful,
    updated_at: new Date().toISOString(),
  }));

  if (rowsToUpsert.length > 0) {
    // Upsert in chunks of 200 for reliability
    const chunkSize = 200;
    for (let i = 0; i < rowsToUpsert.length; i += chunkSize) {
      const chunk = rowsToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("daily_check_ins")
        .upsert(chunk, { onConflict: "user_id,date_key" });

      if (error) {
        console.error("Batch migration error:", error);
        throw error;
      }
    }
  }

  // 3. Merged result combines cloud and local records (local clean days preserved)
  const mergedStore: CheckInStore = { ...cloudStore, ...localCheckIns };
  return {
    insertedCount: rowsToUpsert.length,
    mergedStore,
  };
}

/**
 * Subscribe to real-time changes on daily_check_ins for cross-device synchronization
 */
export function subscribeToCloudChanges(
  userId: string,
  onDayUpdated: (dateKey: string, isSuccessful: boolean) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`unloop-sync-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "daily_check_ins",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const row = payload.new as { date_key: string; is_successful: boolean };
          if (row && row.date_key) {
            onDayUpdated(row.date_key, Boolean(row.is_successful));
          }
        } else if (payload.eventType === "DELETE") {
          const row = payload.old as { date_key: string };
          if (row && row.date_key) {
            onDayUpdated(row.date_key, false);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
