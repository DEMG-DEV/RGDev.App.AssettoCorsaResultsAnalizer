# Mission — Assetto Corsa Results Analyzer

## Purpose

Build a **cross-platform application** (Desktop, Mobile, Web) that reads, parses, and visualizes Assetto Corsa race result JSON files. The app provides rich analytics, charts, and session breakdowns for drivers and race enthusiasts.

## Problem Statement

Assetto Corsa generates `race_out.json` files after each session (practice, qualify, race) in `Documents\Assetto Corsa\out\`. These files are **overwritten on every new session**, making historical analysis difficult with vanilla AC.

**Content Manager** (the most popular community launcher) solves the persistence problem by saving a **historical copy** of every session result in:
```
%LOCALAPPDATA%\AcTools Content Manager\Progress\Sessions\
```
(e.g., `C:\Users\devco\AppData\Local\AcTools Content Manager\Progress\Sessions\`)

Each file is named with a timestamp pattern: `YYMMDD-HHMMSS.json` (e.g., `260619-214149.json`).

However, there is **no built-in tool to browse, analyze, or compare** these saved sessions — they just accumulate as raw JSON files. This app fills that gap.

## Target Users

- **Sim racers** who want to analyze their performance after sessions
- **League organizers** who need to aggregate and compare results across events
- **Casual players** who want to see lap breakdowns, sector analysis, and position charts

## Core Value Proposition

1. **Auto-discovery (Content Manager)**: On desktop, automatically detect and scan the Content Manager session history folder:
   - **Primary**: `%LOCALAPPDATA%\AcTools Content Manager\Progress\Sessions\` (timestamped JSON files)
   - **Secondary**: `Documents\Assetto Corsa\out\race_out.json` (latest session only)
2. **Folder scanning**: Scan any user-selected folder containing JSON result files
3. **Upload support**: On mobile/web (where local AC folders don't exist), allow uploading:
   - A single JSON file
   - Multiple JSON files at once
   - A ZIP archive containing multiple JSON files
4. **Rich visualization — CHARTS EVERYWHERE**: The app is a **visual-first experience**. Almost every piece of data gets a chart, graphic, or animated visual. The UI must feel like a premium motorsport analytics dashboard — colorful, informative, and stunning at first glance. Specific visualizations:

   **📊 Per-Session Dashboard**
   - **Position chart** (line chart): Position of each driver over each lap — lines with distinct colors per driver, hover tooltips
   - **Lap times chart** (line chart): Lap time evolution per driver across laps — highlight best laps with a glow/marker
   - **Sector comparison bars** (grouped bar chart): Side-by-side sector times for each driver, color-coded by sector (S1=purple, S2=yellow, S3=green)
   - **Gap to leader chart** (area chart): Cumulative gap in seconds to P1 over laps — filled gradient areas
   - **Tyre strategy timeline** (horizontal bar/Gantt): When each driver used which tyre compound — color-coded blocks
   - **Speed/consistency radar** (radar/spider chart): Multi-axis radar per driver showing consistency, best lap, avg lap, sector strengths
   - **Finishing status donut** (donut chart): Finished vs DNF vs DQ breakdown with animated segments

   **🏎️ Per-Driver Detail View**
   - **Lap time delta bar chart**: Each lap as a bar, colored green (faster than avg) or red (slower) — mini sparkline
   - **Sector breakdown stacked bar**: For every lap, stacked bar of S1 + S2 + S3 with color-coded segments
   - **Personal best progression** (line chart): How the driver's best lap evolved across laps
   - **Cuts/penalties timeline** (scatter/event markers): Visual dots on a lap timeline showing where cuts happened
   - **Tyre degradation curve** (line chart): Lap time trend per tyre stint to show degradation

   **📈 Multi-Session / History Analytics** (when multiple files loaded)
   - **Performance trend** (line chart): Best lap time across sessions over time — show improvement curve
   - **Track frequency heatmap** (treemap/heatmap): Which tracks were raced most — bigger blocks = more sessions
   - **Car usage distribution** (pie/donut): Which cars were driven most frequently
   - **Session type breakdown** (stacked bar): Practice vs Qualify vs Race vs Hotlap per day/week
   - **Lap time box plot per track**: Statistical spread of lap times per track (median, quartiles, outliers)
   - **Win/podium rate** (horizontal bar): For race sessions, % of races finished P1/P2/P3
   - **AI level distribution** (histogram): Distribution of AI levels across opponents from CM metadata
   - **Calendar heatmap** (GitHub-style): Activity grid showing which days had sessions — intensity = number of sessions

   **🌡️ Conditions & Settings Visuals** (from CM metadata)
   - **Weather icon badges**: Visual weather indicators (sunny, cloudy, rainy) with temperature readout
   - **Assist settings gauge cluster**: Visual gauges/toggles showing TC, ABS, stability, auto-clutch, etc.
   - **AI level bar per opponent**: Horizontal bars per AI driver showing their level + aggression
   - **Track state indicator**: Visual scale of grip level, randomness, etc.

   **🏁 Standings Table (rich, not plain)**
   - Color-coded position badges (gold P1, silver P2, bronze P3)
   - Inline mini-sparkline of lap times inside each row
   - Delta column with green/red colored +/- gaps
   - Car name with small color-coded vehicle icon/dot
   - Nationality flag icons (from CM data)
   - Expandable rows showing full lap breakdown
5. **Content Manager extras**: Parse CM-specific metadata (`__raceIni`, `__quickDrive`) to extract:
   - AI level and aggression settings per opponent
   - Driver nationality and nation code
   - Weather conditions and track state
   - Assist settings used
   - Session configuration (penalties, jump start rules, etc.)
6. **Car preview images (local PC)**: When AC is installed on the same PC, auto-discover and display:
   - `preview.jpg` — high-quality 3D renders of each car with its exact skin (from `{AC_ROOT}/content/cars/{car_id}/skins/{skin_name}/preview.jpg`)
   - `livery.png` — small livery thumbnails for inline badges
   - `ui_car.json` — human-readable car names, brand, class, year, power (instead of raw IDs like `ks_toyota_gt86`)
   - Graceful fallback to styled placeholders when AC is not installed (mobile/remote web)

## Supported JSON Formats

Based on analysis of the [simresults](https://github.com/mauserrifle/simresults) library, we support two Assetto Corsa JSON formats:

### Format 1: Client/Offline (`race_out.json`) + Content Manager Sessions
- **Identifier**: Root object has `"players"` key
- **Contains**: `track`, `players[]`, `sessions[]` with laps, sectors, times
- **CM Extras**: `__raceIni` (INI config as string), `__quickDrive` (JSON metadata with AI, weather, assists)
- **Paths**:
  - Vanilla AC: `Documents\Assetto Corsa\out\race_out.json`
  - **Content Manager history**: `%LOCALAPPDATA%\AcTools Content Manager\Progress\Sessions\YYMMDD-HHMMSS.json`

### Format 2: Server JSON (AC Dedicated Server)
- **Identifier**: Root object has `"TrackName"` key
- **Contains**: `TrackName`, `TrackConfig`, `Type`, `Cars[]`, `Result[]`, `Laps[]`, `Events[]`
- **Path**: Server output directory, user-defined

## Non-Goals (Out of Scope)

- Assetto Corsa **Competizione** (ACC) — different game, different format
- AC Server **text log** parsing (`.txt` files from server console output)
- Real-time telemetry / live data integration
- Online multiplayer session hosting or management
- Mod management or Content Manager integration beyond file reading
