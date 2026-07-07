# UI & Charts Specification — Visual-First Design

> **Regla #1**: Si un dato puede graficarse, SE GRAFICA. La app debe sentirse como un dashboard de F1 profesional.

## Design Philosophy

The Assetto Corsa Results Analyzer is a **visual-first application**. Every screen wows the user with rich, colorful, animated graphics. Data tables exist as secondary companions to charts — never as the primary presentation. The styling follows a **premium dark motorsport theme (F1 TV graphics / telemetry aesthetic)**.

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
```

### Premium Chart Visual Overhaul Rules

1. **Unified Glassmorphism Tooltips**:
   - Background: `rgba(15, 15, 20, 0.95)`
   - Border: `1px solid rgba(255,255,255,0.1)`
   - Border Radius: `12px`
   - Shadow: `0 8px 32px rgba(0,0,0,0.4)`
   - Backdrop Filter: `blur(20px)`
2. **Smooth Curves**: All line and area charts use `type="natural"` and `strokeWidth={2.5}` for a liquid, professional look.
3. **Hidden / Glowing Dots**: Default dots are hidden (`dot={false}`). Active states use high-contrast glowing dots: `activeDot={{ r: 6, strokeWidth: 2, stroke: 'white', fill: driverColor }}`.
4. **Gradient Fills**: Area charts use vertical linear gradients (opacity 30% to 0%) for ambient under-line glow.
5. **Rounder Corners**: Bar charts use rounded tops (`radius={[6, 6, 0, 0]}`) and tyre timelines use rounded horizontal endings (`radius={[0, 4, 4, 0]}`).
6. **Subtle Grids**: Grid lines are highly translucent (`strokeOpacity={0.08}`).

---

## Chart Catalog — Detailed Specifications

### 1. 📈 LAP TIMES EVOLUTION CHART
- Multi-line chart mapping lap numbers (X) to lap times (Y).
- Curved smooth lines with no default dots, and active dot on hover.
- Legend styled with smaller fonts for cleaner look.

### 2. 🔄 POSITION CHANGES CHART
- Step-after line chart tracking overtaking actions.
- Inverted Y-axis so P1 is at the top.
- Grid lines styled very subtly.

### 3. ⏱️ SECTOR COMPARISON
- Staggered bar charts representing S1 (purple), S2 (yellow), S3 (green) per driver.
- Bar tops rounded, width constrained to `20` for neat visual spacing.

### 4. 📊 GAP TO LEADER
- Gradient area chart illustrating the gap in seconds to P1.
- Custom linear gradients fade out to transparent at the bottom.

### 5. 🎯 DRIVER CONSISTENCY RADAR
- Multi-axis radar (Best Lap, Avg Lap, Consistency, S1, S2, S3) normalized 0-100 (100 is best).
- Subtle grid lines (`rgba(255,255,255,0.1)`) and bold, clean driver toggle buttons.

### 6. 🍩 FINISH STATUS DISTRIBUTION
- Animated donut chart mapping finished vs DNF vs DQ.
- Center indicator showing total number of drivers.
- Bigger, clean legend with color-coded circular badges.

### 7. 🛞 TYRE STRATEGY TIMELINE
- Horizontal stacked bar chart mapping driver tyre stints.
- Official F1 compound colors (soft=red, medium=yellow, hard=white, etc.).
- Bars have rounded right corners for a sleek pill shape.

---

## Car Preview Images — Wikipedia Lookup

For modded cars not present in the official Assetto Corsa catalogue:
1. Humanize the car ID (e.g. `rss_formula_hybrid_2023` -> `Formula Hybrid 2023`).
2. Query the Wikipedia search API.
3. Retrieve the first matching article thumbnail.
4. Cache the resulting URL.
5. Provide a fallback handler (`onError`) in the UI that loads the Wikipedia thumbnail if the primary catalog URL fails.
