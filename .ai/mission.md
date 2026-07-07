# Mission — Assetto Corsa Results Analyzer

## Purpose

Build a **modern web application** (React SPA) deployed on Vercel that reads, parses, and visualizes Assetto Corsa race result JSON files. The app provides rich analytics, charts, and session breakdowns for drivers, leagues, and race enthusiasts.

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

- **Sim racers** who want to analyze their performance after sessions.
- **League organizers** who need to aggregate and compare results across events.
- **Casual players** who want to see lap breakdowns, sector analysis, and position charts.

## Core Value Proposition

1. **Shared Session Storage (Vercel Blob)**: Persist the last 20 uploaded JSON files globally across all users using a hybrid caching system (Vercel Blob as the primary serverless shared store with automatic FIFO queue pruning, and local browser `localStorage` as an instant/offline fallback).
2. **File & Folder scanning**: Scan any user-selected folder containing JSON result files using the browser's File System Access API, or upload ZIP archives containing multiple session files at once.
3. **F1 Broadcast-Inspired Visuals**: Almost every piece of data is visualized using a premium, motorsport-themed UI (dark theme, glassmorphism tooltips, glowing active dots, rounded bars, custom legends, and vertical gradient fills).
4. **Mod Car Previews (Wikipedia API)**: Display real-world car previews dynamically. For official cars, use a static image catalog. For modded cars (non-official), query the Wikipedia API dynamically to fetch and cache article thumbnails.
5. **Content Manager extras**: Parse CM-specific metadata (`__raceIni`, `__quickDrive`) to extract weather, temperature, track state, assist settings, and driver nationalities.

## Supported JSON Formats

### Format 1: Client/Offline (`race_out.json`) + Content Manager Sessions
- **Identifier**: Root object has `"players"` key.
- **Contains**: `track`, `players[]`, `sessions[]` with laps, sectors, times.
- **CM Extras**: `__raceIni` (INI config as string), `__quickDrive` (JSON metadata with AI, weather, assists).

### Format 2: Server JSON (AC Dedicated Server)
- **Identifier**: Root object has `"TrackName"` key.
- **Contains**: `TrackName`, `TrackConfig`, `Type`, `Cars[]`, `Result[]`, `Laps[]`, `Events[]`.

## Non-Goals (Out of Scope)
- Native mobile or desktop wrappers (Tauri, Electron, Capacitor).
- Assetto Corsa **Competizione** (ACC) support.
- AC Server **text log** parsing (`.txt` files).
- Real-time telemetry / live data integration.
