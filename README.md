# Atelier Pianificazione

A staff scheduling app for Italian fashion retail stores, built with React + Vite + Capacitor for Android.

Plan weekly shifts across multiple stores, manage absences and vacations, and export schedules to Excel.

---

## Features

### Schedule Grid
- Weekly grid: stores as rows, days as columns
- Click any cell to assign or remove staff
- Colour-coded person chips with initials
- Amber dot on understaffed cells (assigned < required)
- Today's column highlighted
- Horizontal scroll on mobile

### Auto-Scheduler
- One-tap automatic schedule generation
- Respects all constraints:
  - Maximum working days per week per person
  - Day-of-week availability
  - Specific date absences (vacation / day off)
  - Store priority (critical stores filled first)
  - Load balancing (fewer days worked = higher priority)

### Absence Calendar
- Monthly calendar per person
- Click a day to cycle: none → Vacation → Day off → none
- Stats bar showing vacation and day-off counts per month
- Absences are respected by both the auto-scheduler and manual assignment

### Settings
- **Stores tab** — add, edit, delete stores with name, city, priority (critical / normal) and required staff count
- **People tab** — add, edit, delete staff with name, max days/week, day availability toggles and notes
- Changes saved automatically to localStorage

### Excel Export
- Exports the current week to a `.xlsx` file with two sheets:
  - **Schedule** — stores × days grid with assigned names
  - **Staff** — per-person summary (days worked, rest days, store per day)
- On Android: opens the native share sheet (Drive, Gmail, WhatsApp, etc.)
- On web: direct browser download

### Internationalisation
- Italian, English and Spanish — switchable from the header
- All UI strings, day names and month names are fully translated
- Locale-aware date formatting

### Dark Mode
- Light / dark theme toggle in the header
- Preference saved to localStorage
- Respects system `prefers-color-scheme` on first launch

### Mobile-First Layout
- Bottom tab navigation on mobile (Schedule | Staff)
- Responsive design with breakpoints at 900px and 600px
- Full-screen modals on small screens
- Android Capacitor wrapper ready for Play Store submission

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite 5 |
| Styling | Plain CSS with custom properties |
| Icons | lucide-react |
| Excel export | SheetJS (xlsx) |
| File sharing | @capacitor/filesystem + @capacitor/share |
| Storage | localStorage (offline, no backend) |
| i18n | Custom React Context (no external library) |
| Android | Ionic Capacitor 8 |

---

## Getting Started

### Web (browser preview)
```bash
npm install
npm run dev
```

### Android
```bash
npm run build
npx cap sync android
# Open android/ in Android Studio, then Run
```

### Requirements
- Node.js 18+
- Android Studio (for Android builds)

---

## Permissions (Android)

No special permissions required. The app runs entirely in a WebView and stores all data locally.

No account, no cloud, no tracking. All data stays on the device.
