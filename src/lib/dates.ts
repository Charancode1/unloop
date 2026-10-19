import { CheckInStore, DayInfo, Milestone, StreakStats, WeekColumn } from "./types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Format Date to local 'YYYY-MM-DD'
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse 'YYYY-MM-DD' string to local Date object
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's local 'YYYY-MM-DD' string
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Format 'YYYY-MM-DD' to "Monday, Oct 19, 2026"
 */
export function formatFriendlyDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Format 'YYYY-MM-DD' to "October 19, 2026"
 */
export function formatFullDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const monthName = FULL_MONTH_NAMES[date.getMonth()];
  return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Format 'YYYY-MM-DD' to "Oct 19"
 */
export function formatShortDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${monthName} ${date.getDate()}`;
}

/**
 * Add or subtract days from a Date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date is in the future compared to today
 */
export function isFutureDate(dateKey: string, todayKey: string): boolean {
  return dateKey > todayKey;
}

/**
 * Build 53-week GitHub-style contribution grid for a given year.
 * Rows are 0 (Sunday) to 6 (Saturday).
 */
export function generateYearGrid(year: number, checkIns: CheckInStore): WeekColumn[] {
  const todayKey = getTodayKey();
  const firstDayOfYear = new Date(year, 0, 1);
  const lastDayOfYear = new Date(year, 11, 31);

  // Sunday on or before Jan 1
  const startDayOfWeek = firstDayOfYear.getDay(); // 0 is Sunday
  const startDate = addDays(firstDayOfYear, -startDayOfWeek);

  const columns: WeekColumn[] = [];
  let currentDate = new Date(startDate);
  let weekIndex = 0;
  let lastLabeledMonth = -1;

  while (currentDate <= lastDayOfYear || currentDate.getDay() !== 0) {
    const days: (DayInfo | null)[] = [];
    let monthLabelForWeek: string | undefined = undefined;

    for (let dayRow = 0; dayRow < 7; dayRow++) {
      const dateKey = formatDateKey(currentDate);
      const isCurrentYear = currentDate.getFullYear() === year;
      const isToday = dateKey === todayKey;
      const isFuture = isFutureDate(dateKey, todayKey);
      const isSuccessful = !!checkIns[dateKey];

      if (isCurrentYear) {
        // Check if this is the 1st of a month, or the first column containing this month
        if (currentDate.getDate() === 1 && currentDate.getMonth() !== lastLabeledMonth) {
          monthLabelForWeek = MONTH_NAMES[currentDate.getMonth()];
          lastLabeledMonth = currentDate.getMonth();
        } else if (weekIndex === 0 && dayRow === 0 && !monthLabelForWeek && isCurrentYear) {
          monthLabelForWeek = MONTH_NAMES[0];
          lastLabeledMonth = 0;
        }

        days.push({
          date: new Date(currentDate),
          dateKey,
          dayOfWeek: currentDate.getDay(),
          dayOfMonth: currentDate.getDate(),
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
          isCurrentYear: true,
          isToday,
          isFuture,
          isSuccessful,
        });
      } else {
        days.push(null);
      }

      currentDate = addDays(currentDate, 1);
    }

    columns.push({
      weekIndex,
      days,
      monthLabel: monthLabelForWeek,
    });

    weekIndex++;
    if (weekIndex > 54) break; // Safety cutoff
  }

  return columns;
}

/**
 * Generate monthly grid for month-by-month detailed view
 */
export function generateMonthGrid(year: number, month: number, checkIns: CheckInStore): {
  monthName: string;
  year: number;
  weeks: (DayInfo | null)[][];
} {
  const todayKey = getTodayKey();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks: (DayInfo | null)[][] = [];
  let currentWeek: (DayInfo | null)[] = [];

  // Pad days before the first day of month
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const isToday = dateKey === todayKey;
    const isFuture = isFutureDate(dateKey, todayKey);
    const isSuccessful = !!checkIns[dateKey];

    currentWeek.push({
      date,
      dateKey,
      dayOfWeek: date.getDay(),
      dayOfMonth: day,
      month,
      year,
      isCurrentYear: true,
      isToday,
      isFuture,
      isSuccessful,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad end of last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return {
    monthName: FULL_MONTH_NAMES[month],
    year,
    weeks,
  };
}

/**
 * Calculate streaks, success counts, and rate
 */
export function calculateStreakStats(
  checkIns: CheckInStore,
  year: number
): StreakStats {
  const todayKey = getTodayKey();
  const today = parseDateKey(todayKey);
  const todayStatus = !!checkIns[todayKey];

  // Total successful days across all time
  const allSuccessfulDates = Object.entries(checkIns)
    .filter(([, successful]) => successful)
    .map(([dateKey]) => dateKey)
    .sort();

  const totalDays = allSuccessfulDates.length;

  // Calculate Current Streak
  let currentStreak = 0;
  let checkPointer = new Date(today);

  // If today is checked in, streak starts with today
  if (todayStatus) {
    currentStreak = 1;
    checkPointer = addDays(checkPointer, -1);
  } else {
    // If today is NOT checked in, check if yesterday was checked in
    const yesterday = addDays(checkPointer, -1);
    const yesterdayKey = formatDateKey(yesterday);
    if (checkIns[yesterdayKey]) {
      currentStreak = 1;
      checkPointer = addDays(yesterday, -1);
    } else {
      currentStreak = 0;
    }
  }

  if (currentStreak > 0) {
    while (true) {
      const key = formatDateKey(checkPointer);
      if (checkIns[key]) {
        currentStreak++;
        checkPointer = addDays(checkPointer, -1);
      } else {
        break;
      }
    }
  }

  // Calculate Best Streak across all time
  let bestStreak = 0;
  if (allSuccessfulDates.length > 0) {
    let runningStreak = 1;
    bestStreak = 1;

    for (let i = 1; i < allSuccessfulDates.length; i++) {
      const prevDate = parseDateKey(allSuccessfulDates[i - 1]);
      const currDate = parseDateKey(allSuccessfulDates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak++;
        if (runningStreak > bestStreak) {
          bestStreak = runningStreak;
        }
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
  }

  // Tracked days in current year
  const startOfYear = new Date(year, 0, 1);
  let totalTrackedDays = 1;

  if (today.getFullYear() === year) {
    const diffTime = today.getTime() - startOfYear.getTime();
    totalTrackedDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  } else if (today.getFullYear() > year) {
    // Full past year
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    totalTrackedDays = isLeap ? 366 : 365;
  } else {
    totalTrackedDays = 1;
  }

  // Count successes for this specific year
  const thisYearSuccesses = allSuccessfulDates.filter((k) => k.startsWith(`${year}-`)).length;
  const successRate = totalTrackedDays > 0 ? Math.round((thisYearSuccesses / totalTrackedDays) * 100) : 0;

  // Month stats
  const currentMonth = today.getMonth();
  const thisMonthPrefix = `${year}-${String(currentMonth + 1).padStart(2, "0")}-`;
  const thisMonthSuccessCount = allSuccessfulDates.filter((k) => k.startsWith(thisMonthPrefix)).length;
  const thisMonthDaysElapsed = today.getFullYear() === year ? today.getDate() : 30;

  return {
    totalDays,
    currentStreak,
    bestStreak,
    successRate,
    totalTrackedDays,
    todayStatus,
    thisMonthSuccessCount,
    thisMonthDaysElapsed,
  };
}

/**
 * Milestone progression based on bestStreak or totalDays
 */
export function getMilestones(bestStreak: number, currentStreak: number): Milestone[] {
  const milestoneConfig = [
    { days: 1, title: "Day One", description: "The silent decision to break free." },
    { days: 3, title: "The Circuit Breaker", description: "Navigating through the acute impulse window." },
    { days: 7, title: "One Week Sovereign", description: "Seven consecutive days reclaimed in full." },
    { days: 14, title: "Two Weeks Clean", description: "Fortitude taking root in your daily routine." },
    { days: 21, title: "Neural Reset", description: "Old automatic loops start to soften and fade." },
    { days: 30, title: "One Month Free", description: "30 unbroken days of disciplined freedom." },
    { days: 60, title: "Two Months Steady", description: "Momentum has become the new baseline." },
    { days: 90, title: "The 90-Day Unloop", description: "Deep subconscious rewiring accomplished." },
    { days: 180, title: "Half-Year Vanguard", description: "Six full months of personal mastery." },
    { days: 365, title: "Full Solar Orbit", description: "365 days of reclaiming your life." },
  ];

  return milestoneConfig.map((m) => {
    const reached = bestStreak >= m.days;
    const progress = reached
      ? 100
      : Math.min(100, Math.round((currentStreak / m.days) * 100));

    return {
      days: m.days,
      title: m.title,
      description: m.description,
      reached,
      progress,
    };
  });
}

export { MONTH_NAMES, FULL_MONTH_NAMES, DAY_NAMES, SHORT_DAY_NAMES };
