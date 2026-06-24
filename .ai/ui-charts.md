# UI & Charts Specification — Visual-First Design

> **Regla #1**: Si un dato puede graficarse, SE GRAFICA. La app debe sentirse como un dashboard de F1 profesional.

## Design Philosophy

The Assetto Corsa Results Analyzer is a **visual-first application**. Every screen should wow the user with rich, colorful, animated graphics. Data tables exist as secondary companions to charts — never as the primary presentation. Think: **F1 TV graphics meets Spotify Wrapped** for sim racing.

### Design Tokens

```css
/* === RACING COLOR PALETTE === */

/* Position colors — inspired by F1 podium */
--color-p1: #FFD700;         /* Gold */
--color-p2: #C0C0C0;         /* Silver */
--color-p3: #CD7F32;         /* Bronze */
--color-p4-plus: #4A90D9;    /* Steel blue */

/* Sector colors — F1 standard */
--color-sector-1: #9B59B6;   /* Purple — S1 */
--color-sector-2: #F1C40F;   /* Yellow — S2 */
--color-sector-3: #2ECC71;   /* Green — S3 */

/* Delta / performance */
--color-faster: #00E676;     /* Neon green — improved */
--color-slower: #FF5252;     /* Red — degraded */
--color-neutral: #78909C;    /* Blue grey — no change */
--color-personal-best: #E040FB; /* Magenta — PB indicator */
--color-overall-best: #7C4DFF;  /* Deep purple — session best */

/* Tyre compounds (AC standard names) */
--color-tyre-soft: #FF1744;      /* Red */
--color-tyre-medium: #FFD600;    /* Yellow */
--color-tyre-hard: #ECEFF1;     /* White */
--color-tyre-supersoft: #D500F9; /* Magenta */
--color-tyre-superhard: #00B0FF; /* Cyan */
--color-tyre-vintage: #8D6E63;  /* Brown */
--color-tyre-eco: #76FF03;      /* Lime */

/* Finish status */
--color-finished: #4CAF50;
--color-dnf: #FF5722;
--color-dq: #F44336;
--color-none: #9E9E9E;

/* Background & surface (dark theme — motorsport aesthetic) */
--bg-primary: #0A0E17;       /* Near-black with blue undertone */
--bg-secondary: #111827;     /* Dark slate */
--bg-card: #1A1F2E;          /* Card surface */
--bg-card-hover: #242B3D;    /* Card hover */
--bg-glass: rgba(26, 31, 46, 0.85); /* Glassmorphism */
--border-subtle: rgba(255, 255, 255, 0.08);

/* Text */
--text-primary: #F1F5F9;
--text-secondary: #94A3B8;
--text-muted: #64748B;
--text-accent: #60A5FA;

/* Gradients */
--gradient-racing: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-fire: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-ocean: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--gradient-gold: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
--gradient-card: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));

/* Shadows */
--shadow-glow-blue: 0 0 20px rgba(96, 165, 250, 0.3);
--shadow-glow-purple: 0 0 20px rgba(124, 77, 255, 0.3);
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
```

### Typography
- **Primary Font**: Inter (Google Fonts) — clean, modern, highly readable
- **Monospace (times)**: JetBrains Mono — for lap times, sector times, deltas
- **Display (headers)**: Outfit — bold, impactful for session titles and stats

### Micro-Animations
- Chart segments animate on mount (bars grow, lines draw)
- Cards have subtle hover scale (1.02) + glow border
- Position changes animate with smooth transitions
- Numbers count up on first render (odometer effect)
- Loading states use pulsing skeleton screens with gradient shimmer
- Tab switches use crossfade transitions

---

## Chart Catalog — Detailed Specifications

### 1. 📊 SESSION OVERVIEW HEADER
**Type**: Hero card with key stats
- Large track name with track layout silhouette (if available) or gradient background
- Stat pills: Session type badge, Date/time, Duration, Laps, Number of drivers
- Weather strip: Temperature gauge + weather icon (from CM data)
- Animated counter for total laps driven in the session

### 2. 🏁 STANDINGS TABLE (Rich)
**Type**: Interactive data table with embedded graphics
- **Position column**: Large badge with P1=gold, P2=silver, P3=bronze gradient backgrounds, rest=muted
- **Driver column**: Name + nationality flag emoji (from CM `__raceIni` NATION_CODE)
- **Car column**: Car `preview.jpg` thumbnail (48px circle crop) + model name — auto-loaded from AC install folder. Hover shows full `preview.jpg` in a popover (640x480 render)
- **Livery badge**: Small `livery.png` (24px) next to car name for quick visual ID
- **Best Lap column**: Time in monospace + green highlight if session best
- **Total Time column**: Time with gap to leader shown as `+X.XXXs` in green/red
- **Laps column**: Number + mini progress bar showing completion %
- **Sparkline column**: Tiny inline line chart of their lap times (50px wide)
- **Status column**: Colored pill badge — ✅ Finished / ❌ DNF / 🚫 DQ
- **Expandable row**: Click to reveal full lap-by-lap table with sector colors + full car preview image

### 3. 📈 LAP TIMES EVOLUTION CHART
**Type**: Multi-line chart (Recharts `LineChart`)
- One line per driver, each with a distinct color from a curated palette
- X-axis: Lap number
- Y-axis: Lap time (mm:ss.SSS format)
- Invalid laps shown as dashed/translucent segments
- Best lap marker: ⭐ dot + tooltip with exact time
- Hover crosshair shows all drivers' times for that lap
- Legend with checkboxes to show/hide drivers
- Optional: smoothed trend line overlay

### 4. 🔄 POSITION CHANGES CHART
**Type**: Multi-line chart (bump chart style)
- Y-axis INVERTED (P1 at top, Pn at bottom)
- Lines cross as drivers overtake — visually dramatic
- Thick lines (3px) with colored dots at each lap point
- Tooltip shows "Lap X: Driver gained/lost N positions"
- Start and end positions highlighted with larger circles

### 5. ⏱️ SECTOR COMPARISON
**Type**: Grouped/stacked bar chart
- One group per driver (horizontal or vertical)
- 3 bars per group: S1 (purple), S2 (yellow), S3 (green)
- Best sector across all drivers highlighted with a glow/border
- Sort options: by total time, by S1, S2, S3 individually
- Tooltip shows exact sector time + delta to best

### 6. 📊 GAP TO LEADER
**Type**: Area chart with gradient fill
- One filled area per driver
- Colors with transparency (0.3 alpha)
- Shows how the gap grows/shrinks over laps
- Zero line = leader
- Hover shows exact gap at each lap point

### 7. 🎯 DRIVER CONSISTENCY RADAR
**Type**: Radar/Spider chart
- Axes: Best Lap, Average Lap, Consistency (std dev inverse), Sector 1, Sector 2, Sector 3
- One polygon per selected driver (up to 4 for readability)
- Filled with translucent team/driver color
- Shows strengths and weaknesses visually

### 8. 🍩 FINISH STATUS DISTRIBUTION
**Type**: Animated donut chart
- Segments: Finished (green), DNF (orange), DQ (red), None (grey)
- Center number: total participants
- Segments animate on render (grow from 0)
- Tooltips show count + percentage

### 9. 🏎️ PER-DRIVER LAP DELTA BARS
**Type**: Vertical bar chart (positive/negative from average)
- Each bar = one lap
- Above zero (green) = faster than driver's average
- Below zero (red) = slower than driver's average
- Personal best lap highlighted with a ⭐ icon and glow
- Invalid laps shown with a hatched/striped pattern

### 10. 📉 PER-DRIVER SECTOR STACKED TIMELINE
**Type**: Stacked bar chart (horizontal)
- One stacked bar per lap
- 3 segments per bar: S1, S2, S3 with standard sector colors
- Total length = total lap time
- Shows which sector is costing the driver time
- Best sector per lap gets a subtle border

### 11. 🏆 PERSONAL BEST PROGRESSION
**Type**: Step/line chart
- Shows how the driver's PB evolved lap by lap
- Steps down when a new PB is set
- Markers at each PB improvement point
- Final PB highlighted with a large dot + time label

### 12. 🛞 TYRE STRATEGY TIMELINE
**Type**: Horizontal Gantt-like bars
- One row per driver
- Colored blocks represent tyre stints
- Colors from tyre compound palette (soft=red, medium=yellow, etc.)
- Block width = number of laps on that compound
- Useful for comparing strategies across the field

---

## Multi-Session / History Charts

### 13. 📅 CALENDAR HEATMAP
**Type**: GitHub-style contribution grid
- One cell per day, color intensity = number of sessions
- Months labeled, weeks aligned
- Click a day to filter to those sessions
- Color scale: transparent → light blue → intense blue → purple

### 14. 📈 PERFORMANCE TREND LINE
**Type**: Line chart across sessions
- X-axis: session dates
- Y-axis: best lap time per session
- Trend line overlay showing improvement
- Different lines per track (filterable)
- Confidence band (min/max lap range)

### 15. 🗺️ TRACK FREQUENCY TREEMAP
**Type**: Treemap / proportional rectangles
- Bigger rectangle = more sessions on that track
- Color coded by average performance (green=fast, red=slow relative to field)
- Click to drill into that track's history

### 16. 🚗 CAR USAGE DISTRIBUTION
**Type**: Donut chart or horizontal bar
- Show most-used cars ranked
- Color by car brand/category
- Show session count + percentage
- Small car icon/emoji per entry

### 17. 📊 SESSION TYPE BREAKDOWN
**Type**: Stacked bar chart by date/week
- X-axis: weeks or months
- Stacked bars: Practice (blue), Qualify (yellow), Race (red), Hotlap (purple)
- Shows driving habits over time

### 18. 📦 LAP TIME BOX PLOT
**Type**: Box-and-whisker plot per track
- Shows median, Q1, Q3, whiskers, outliers
- One box per track (filtered by car if needed)
- Great for comparing consistency across venues

### 19. 🎯 WIN/PODIUM RATE
**Type**: Horizontal progress bars
- P1 rate: gold bar showing % of races won
- P2 rate: silver bar
- P3 rate: bronze bar
- DNF rate: red bar
- Animated fill on render

### 20. 🤖 AI LEVEL HISTOGRAM
**Type**: Histogram / distribution chart (from CM `__raceIni`)
- X-axis: AI level (80–100)
- Y-axis: number of opponents at that level
- Color gradient from easy (green) to hard (red)
- Mean/median markers

---

## Conditions & Settings Visuals

### 21. 🌡️ WEATHER CARD
**Type**: Visual card with iconography
- Large weather icon (sun, clouds, rain based on CM weather name)
- Temperature readout: ambient + road with thermometer gauge
- Wind speed + direction indicator
- Time of day with sun position arc

### 22. 🎮 ASSISTS GAUGE CLUSTER
**Type**: Collection of toggle/gauge indicators
- TC level: gauge (0/1/2)
- ABS level: gauge (0/1/2)
- Stability control: percentage arc
- Auto-clutch, auto-blip, auto-shifter: on/off toggle indicators
- Damage multiplier: percentage bar
- Tyre wear: percentage bar
- Ideal line: on/off indicator

### 23. 🤖 AI OPPONENTS BAR
**Type**: Horizontal bar chart per opponent
- One bar per AI driver
- Bar length = AI level (0–100)
- Color from green (easy) to red (hard)
- Aggression shown as a secondary thin bar or overlay
- Nationality flag next to name

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (>1200px) | 2-3 column grid, full charts, expanded tables |
| Tablet (768-1200px) | 2 column grid, charts resize, table scrolls horizontally |
| Mobile (<768px) | Single column stack, charts full-width, simplified legends, swipeable tabs |

### Mobile-Specific Adaptations
- Charts use touch-optimized tooltips (tap instead of hover)
- Standings table becomes card-based layout (one card per driver) — car preview as card header image
- Sector comparison becomes horizontal scrollable
- Tab navigation for switching between chart categories
- Pull-to-refresh for file scanning

---

## Car Preview Images — Auto-Discovery from AC Install

> When the app runs on the same PC where Assetto Corsa is installed, it **automatically finds** and displays the rendered preview images for each car+skin combination. This makes the app feel premium and deeply integrated.

### Where the images live

```
{AC_ROOT}/content/cars/{car_id}/skins/{skin_name}/preview.jpg   → Full 3D render (~640x480)
{AC_ROOT}/content/cars/{car_id}/skins/{skin_name}/livery.png    → Livery thumbnail (~64x64)
```

The `car_id` and `skin_name` map **directly** from the JSON result fields:
- AC Client format: `players[].car` → `car_id`, `players[].skin` → `skin_name`
- AC Server format: `Cars[].Model` → `car_id`, `Cars[].Skin` → `skin_name`

### How previews are used in the UI

| Location | Image Used | Size | Behavior |
|----------|-----------|------|----------|
| Standings table car column | `preview.jpg` | 48px circle crop | Hover → full preview popover |
| Standings table livery badge | `livery.png` | 24px inline | Visual car identification |
| Driver detail view header | `preview.jpg` | Full width (~640px) | Hero banner for driver card |
| Car usage distribution chart | `preview.jpg` | 80px thumbnails | Below each bar/segment |
| Session overview grid | `livery.png` | 32px per car | Show car variety at a glance |
| Multi-session car history | `preview.jpg` | 120px grid | Gallery of cars driven over time |

### Fallback behavior (AC NOT installed or mobile/remote)

```
1. Exact skin preview.jpg → found? ✅ Use it
2. Any skin preview.jpg → found? ✅ Use first available
3. Car badge.png from ui/ → found? ✅ Use it
4. Nothing found → 🎨 Show styled placeholder:
   - Dark card with car model ID as text
   - Gradient background matching car brand color
   - Generic car silhouette SVG icon
   - Never show broken image icons ❌
```

### Car name resolution

Raw IDs like `ks_toyota_gt86` are ugly. When AC is available, read `ui/ui_car.json` for:
- **Display name**: "Toyota GT86" (instead of `ks_toyota_gt86`)
- **Brand**: "Toyota" (for grouping)
- **Class**: "street" / "race" / "gt3" etc.
- **Year**: 2015
- **Power**: "200bhp"

If `ui_car.json` is not available, humanize the ID: `ks_toyota_gt86` → `Toyota Gt86`
