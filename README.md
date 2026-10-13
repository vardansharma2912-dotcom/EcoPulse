<div align="center">
  <img src="docs/logo.png" alt="EcoPulse Logo" width="120" />
  <h1>EcoPulse</h1>
  <p><strong>Smart Energy Saving Reminder</strong></p>
  <p><em>Small reminders, real habits. Track and reduce energy waste without invasive hardware.</em></p>
</div>

> **Course:** CHE110 — Environmental Studies Group Project  
> **Target Submission Date:** 20 October 2026  
> **Status:** Fully functional client-side web application

---

## 1. Project Purpose & The Environmental Problem

Electricity generation accounts for a substantial proportion of global fossil fuel combustion, greenhouse gas emissions, and industrial water cooling demands. On college campuses and in residential settings, a significant fraction of electrical energy is lost to **passive behavioral waste**:
- Study room and laboratory lights remaining on when rooms are unoccupied.
- Ceiling and personal fans spinning in empty rooms (fans cool human skin, not air).
- Laptops, monitors, and chargers continuously drawing vampire/standby power around the clock.

Because individual students rarely see real-time utility bills or metering data, there is a lack of feedback connecting small daily habits to environmental impact. **EcoPulse** bridges this gap by providing an intuitive, transparent, and privacy-respecting reminder and tracking system that encourages mindful electricity conservation without requiring invasive IoT hardware.

---

## 2. Key Features

- **Customizable Reminder Engine:** Set daily, weekday, weekly, or one-time prompts across 8 appliance categories (lighting, cooling, chargers, computing, appliances, standby power, shared spaces, and other).
- **Light Glassmorphic Design:** Elegant, nature-inspired translucent light theme styled with custom CSS glass utilities over natural botanical leaf artwork.
- **Reliable In-App Alerts:** Floating glass toast banner with immediate action buttons (*Mark Done*, *Snooze 15 min*, and *Dismiss*) and accessible `aria-live="polite"` announcements.
- **Native Browser Notifications:** Optional desktop notifications triggered when due reminders fire, automatically bringing the browser tab to focus on click.
- **Standalone Energy Calculator:** What-if estimation tool with 10 appliance presets (LED bulb, tube light, ceiling fan, laptop charger, desktop PC, monitor, AC 1.5 ton, TV, phone charger, custom). Displays real-time step-by-step formula substitutions across daily, weekly, monthly, and annual horizons, with a 1-click button to prefill custom reminders.
- **Conservation Analytics & Trends:**
  - Weekly Mon–Sun bar chart (Recharts) toggling between estimated kWh saved and completed actions.
  - Week-over-week comparative cards (this week vs. last week).
  - Habit streak counter (current active streak and all-time record).
  - Dynamic milestone achievement badges (never stored, derived live from activity).
  - Reverse-chronological action history grouped by date with "Show more" pagination.
- **Interactive 3D Learn Hub:** Glassy 3D carousel powered by `motion` springs, perspective depth, wrap-around navigation, control pill with play/pause, touch drag, keyboard navigation, and dialog expansions for 9 practical conservation habits.
- **Presentation Demo Data:** Settings toggle to load ~14 days of realistic demonstration completions clearly flagged as `isDemo: true`, allowing complete evaluation without compromising authentic user history.
- **Local Client Storage:** Pure browser `localStorage` persistence with backward-compatible schema migration (v1 to v2) and full data reset controls.

---

## 3. Technology Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS glassmorphic tokens
- **Animations:** Motion 14 (spring physics & 3D carousel transforms)
- **Data Visualization:** Recharts 3
- **Icons:** Lucide React
- **Typography:** Inter Variable font
- **Testing:** Vitest 5
- **Linter:** Oxlint

---

## 4. How It Works & Calculation Formulas

EcoPulse evaluates scheduled reminders against the current local calendar date (avoiding UTC timezone offset anomalies). When an action is checked off, the system snapshots the reminder title and evaluates the energy avoided based on the appliance's rated power and estimated avoided operating hours.

### Formulas
1. **Electrical Energy Avoided (kWh):**
   $$\text{kWh} = \frac{\text{Watts (W)} \times \text{Hours avoided (h)}}{1000}$$
2. **Estimated Financial Savings (₹):**
   $$\text{Cost Saved (₹)} = \text{kWh} \times \text{Tariff Rate (₹/kWh)}$$

*Note: The default tariff is set to ₹8.00 per unit (kWh), representative of typical domestic utility slabs in India, and can be adjusted anytime in Settings.*

---

## 5. Honest Architecture & System Limitations

EcoPulse adheres to strict academic honesty and technical transparency:
1. **User-Reported Verification:** The system relies on self-reported action completions; it does not interface with smart meters or current-sensing hardware.
2. **Estimates Only:** kWh calculations are theoretical estimates derived from user-specified appliance wattage labels and user-reported avoided usage times.
3. **Tab Lifecycle Constraints:** Browser notifications and alerts execute entirely on client-side timers. Alerts fire only while EcoPulse is open in an active browser tab. Closed browser tabs and sleeping laptops cannot be alerted (no background push servers or native service workers).
4. **Device-Local Storage:** All preferences, reminders, and history reside strictly inside browser `localStorage`. Data does not synchronize across separate devices or browsers.

---

## 6. Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Run Commands

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vardansharma2912-dotcom/EcoPulse-energy-saver.git
   cd EcoPulse-energy-saver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Run automated unit tests:**
   ```bash
   npm test
   ```

5. **Run the production build:**
   ```bash
   npm run build
   ```

6. **Run linter checks:**
   ```bash
   npm run lint
   ```

> [!NOTE]
> **Static 404 Page (`public/404.html`):**  
> EcoPulse includes both an in-app catch-all 404 page (`/#/*`) for hash-route navigation and a self-contained static `public/404.html` for unknown real paths served by hosting platforms like Vercel. The static `404.html` includes an inline script to seamlessly redirect known real paths (e.g. `/reminders`, `/calculator`) to their hash-route equivalents (`/#/reminders`, `/#/calculator`).  
> *Note:* The static `404.html` can only be verified on the deployed Vercel site, because `vite dev` and `vite preview` inherently fall back to `index.html` for single-page applications.

---

## 7. Project Structure

```
EcoPulse/
├── public/                 # Static web assets (favicon, SVG icons, 404.html)
├── src/
│   ├── assets/             # Botanical leaf background assets (leaf-bg.webp)
│   ├── components/
│   │   ├── layout/         # Navigation, AppLayout, PageHeader, LeafBackground,
│   │   │                   # InAppAlertBanner, DemoBanner
│   │   ├── reminders/      # Reminder cards, lists, dialogs, action buttons
│   │   └── ui/             # Glass cards, buttons, badges, inputs, dialogs
│   ├── lib/
│   │   ├── __tests__/      # Vitest suites (alerts, analytics, dates, energy,
│   │   │                   # schedule, storage, workflow)
│   │   ├── alerts.ts       # Pure alert detection & deduplication logic
│   │   ├── analytics.ts    # Chart aggregation, streak, badge, and comparison pure functions
│   │   ├── dates.ts        # Local timezone calendar date utilities
│   │   ├── energy.ts       # Energy conversion & financial math
│   │   ├── sampleData.ts   # Demonstration data generator & demo filters
│   │   ├── schedule.ts     # Recurrence rules & due date evaluation
│   │   ├── storage.ts      # LocalStorage layer & v1-to-v2 migration
│   │   └── useReminderAlerts.ts # 30s interval & visibility change alert hook
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Daily overview, metrics, due actions, quick add
│   │   ├── RemindersPage.tsx   # Full reminders management CRUD
│   │   ├── CalculatorPage.tsx  # Standalone appliance what-if calculator
│   │   ├── AnalyticsPage.tsx   # Weekly Recharts bar graph, streaks, badges
│   │   ├── LearnPage.tsx       # 10 practical energy conservation habit guides
│   │   └── SettingsPage.tsx    # Tariffs, notification controls, reset & demo data
│   ├── state/              # Global React Context, action types & reducer
│   ├── App.tsx             # Root router configuration (HashRouter)
│   ├── index.css           # Tailwind v4 theme, glassmorphic utility tokens
│   ├── main.tsx            # Application entrypoint
│   └── types.ts            # Core TypeScript interfaces & data models
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 8. Presentation & Academic Submissions Placeholders

- **Live Application URL:**  
  `TODO: Add deployed Vercel URL upon final hosting`

- **Interface Screenshots:**  
  - *Dashboard View:* `TODO: Add screenshot`
  - *Conservation Analytics & Recharts:* `TODO: Add screenshot`
  - *Appliance Energy Calculator:* `TODO: Add screenshot`
  - *In-App Glass Alert Banner:* `TODO: Add screenshot`

- **Group Member Contributions (CHE110 Group):**  
  - `TODO: List student names, registration numbers, and respective project contributions`

- **Asset & Artwork Credits:**  
  - Logo: `TODO (author / tool used)`
  - Botanical Watercolor Leaf Artwork: `TODO: Add credit / source reference`
  - Icons: [Lucide Icons](https://lucide.dev)
  - Fonts: Inter Variable by Rasmus Andersson via [@fontsource-variable/inter](https://fontsource.org)

---

## 9. License

Developed for educational and environmental studies academic purposes (CHE110). Open for student and campus sustainability research.
