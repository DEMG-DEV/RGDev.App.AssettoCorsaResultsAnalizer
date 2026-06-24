# Tech Stack

## Runtime & Build

| Layer          | Technology           | Version  | Purpose                                    |
|----------------|----------------------|----------|--------------------------------------------|
| Language       | TypeScript           | 5.x      | Type safety across all code                |
| Runtime        | Node.js              | 20+ LTS  | Build tooling, dev server                  |
| Bundler        | Vite                 | 6.x      | Fast dev server, HMR, optimized builds     |
| Framework      | React                | 19.x     | Component-based UI                         |
| Routing        | React Router         | 7.x      | Client-side navigation                     |
| State Mgmt     | Zustand              | 5.x      | Lightweight global state                   |

## UI & Styling

| Layer          | Technology           | Version  | Purpose                                    |
|----------------|----------------------|----------|--------------------------------------------|
| CSS            | Vanilla CSS          | —        | Full control, CSS custom properties        |
| Icons          | Lucide React         | latest   | Consistent icon set                        |
| Font           | Inter (Google Fonts) | —        | Modern, highly-readable sans-serif         |
| Charts         | Recharts             | 2.x      | Lap time charts, position charts           |
| Tables         | TanStack Table       | 8.x      | Sortable, filterable data tables           |

## File Handling

| Library        | Purpose                                                  |
|----------------|----------------------------------------------------------|
| JSZip          | Extract .zip archives containing multiple JSON files     |
| File System Access API | Desktop: browse folders (with fallback to `<input>`) |

## Cross-Platform Strategy

### Web (Primary)
- Standard Vite + React SPA
- Progressive Web App (PWA) with service worker for offline capability
- File System Access API for folder selection on supported browsers (Chrome, Edge)
- Fallback: `<input type="file" multiple accept=".json,.zip">` for Safari/Firefox

### Desktop (Secondary)
- **Tauri 2.x** wrapper around the web app
- Native file dialogs and folder access
- Auto-discovery of `Documents\Assetto Corsa\out\race_out.json`
- System tray integration (optional, future)
- Targets: Windows (primary), macOS, Linux

### Mobile (Tertiary)
- PWA installable on Android/iOS (no native app needed initially)
- File upload only (no local folder scanning — AC doesn't run on mobile)
- Touch-optimized responsive layout
- If native app needed later: **Capacitor** wrapping the same web app

## Development Tools

| Tool               | Purpose                                      |
|--------------------|----------------------------------------------|
| ESLint             | Code linting (strict TypeScript rules)       |
| Prettier           | Code formatting                              |
| Vitest             | Unit testing (Vite-native)                   |
| Playwright         | E2E testing                                  |
| Storybook (opt.)   | Component development in isolation           |

## Deployment

| Target     | Method                                         |
|------------|------------------------------------------------|
| Web        | Static hosting (Vercel / Netlify / GitHub Pages) |
| Desktop    | Tauri build → `.msi` (Windows), `.dmg` (macOS) |
| Mobile     | PWA (add to home screen)                       |

## Key Architecture Decisions

### Why Vite + React (not Next.js)?
- No server-side rendering needed — all data is local/client-side
- Simpler deployment (static files)
- Better Tauri integration (no Node.js server)
- Faster build times

### Why Zustand (not Redux)?
- Minimal boilerplate for our scope
- First-class TypeScript support
- No action/reducer ceremony for simple state trees

### Why Tauri (not Electron)?
- Much smaller binary size (~5MB vs ~150MB)
- Better performance (Rust backend)
- Native OS file dialogs
- Lower memory usage

### Why Recharts?
- React-first library (composable, declarative)
- Good TypeScript support
- Handles our chart needs: line charts (lap times), bar charts (sectors), scatter plots (consistency)
