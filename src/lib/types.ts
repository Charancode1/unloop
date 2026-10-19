export interface CheckInStore {
  [dateKey: string]: boolean; // Format 'YYYY-MM-DD', true = successful day
}

export interface UnloopData {
  version: number;
  checkIns: CheckInStore;
  firstTrackedDate: string; // 'YYYY-MM-DD'
  updatedAt: string;
}

export interface DayInfo {
  date: Date;
  dateKey: string; // 'YYYY-MM-DD'
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayOfMonth: number;
  month: number; // 0-11
  year: number;
  isCurrentYear: boolean;
  isToday: boolean;
  isFuture: boolean;
  isSuccessful: boolean;
}

export interface WeekColumn {
  weekIndex: number;
  days: (DayInfo | null)[]; // 7 days (index 0 = Sun)
  monthLabel?: string; // e.g. "Jan", "Feb" if a new month starts in this week column
}

export interface StreakStats {
  totalDays: number;
  currentStreak: number;
  bestStreak: number;
  successRate: number; // percentage (0 - 100)
  totalTrackedDays: number;
  todayStatus: boolean;
  thisMonthSuccessCount: number;
  thisMonthDaysElapsed: number;
}

export interface Milestone {
  days: number;
  title: string;
  description: string;
  reached: boolean;
  progress: number; // 0 to 100
}
