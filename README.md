# Unloop

> A private daily habit-breaking tracker inspired by GitHub's green contribution calendar.

**Unloop** helps one person track their daily victory over an unwanted habit without ever requiring them to disclose, name, or describe that habit. Silence is strength.

---

## ✨ Features

- **GitHub-Style Contribution Heatmap**: Full 53-week interactive calendar showing the entire year's daily progress at a glance.
- **One-Tap Daily Check-in**: High-satisfaction check-in button with celebratory feedback to lock in each clean day.
- **Easy Corrections & Undo**: Instantly undo today's check-in or click any past square to retroactively record or correct a day.
- **Key Habit Metrics**:
  - Total clean days won
  - Current unbroken streak
  - Best all-time streak
  - Year consistency rate
- **Sovereignty Milestones**: Track psychological benchmarks (Day 1, 3 Days, 7 Days, 14 Days, 21 Days, 30 Days, 60 Days, 90 Days, 180 Days, 365 Days).
- **Dual Calendar Modes**: Switch seamlessly between the **Full Year Heatmap** and a detailed **Month-by-Month Calendar**.
- **Year & Month Navigation**: Browse previous months or switch between tracking years (e.g., 2024, 2025, 2026, 2027).
- **100% Client-Side Privacy**:
  - Zero external databases or third-party cookies.
  - Zero habit fields—Unloop never collects or transmits what you are overcoming.
  - Full backup & restore with JSON export/import.
  - One-click demo preview to explore sample progress without overwriting your real history.

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js 18.18+ or Node.js 20+
- npm (or pnpm / yarn)

### 1. Install dependencies (if not already installed)

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Typecheck for verification

```bash
npm run lint
npm run build
```

---

## 🔒 Privacy Architecture

All tracking data is stored solely inside your browser's `localStorage` (`unloop_app_data_v1`). You can export a full offline backup at any time via the Settings modal (`.json` format) or clear all data in one click.
