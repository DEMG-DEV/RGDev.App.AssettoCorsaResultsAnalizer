# Tech Stack

## Client Runtime & Build

| Layer          | Technology           | Version  | Purpose                                    |
|----------------|----------------------|----------|--------------------------------------------|
| Language       | TypeScript           | 5.x      | Type safety across all code                |
| Runtime        | Node.js              | 20+ LTS  | Build tooling, dev server                  |
| Bundler        | Vite                 | 6.x      | Fast dev server, HMR, optimized builds     |
| Framework      | React                | 19.x     | Component-based UI                         |
| State Mgmt     | Zustand              | 5.x      | Lightweight global state                   |
| Package Manager| pnpm                 | 9.x      | Fast, space-efficient package installation |

## UI & Styling

| Layer          | Technology           | Version  | Purpose                                    |
|----------------|----------------------|----------|--------------------------------------------|
| CSS            | Vanilla CSS          | —        | Full control, CSS custom properties        |
| Icons          | Lucide React         | latest   | Consistent icon set                        |
| Font           | Inter / JetBrains Mono | —      | Modern sans-serif & monospace for lap times |
| Charts         | Recharts             | 2.x      | Premium F1-broadcast style charts          |

## Backend & Persistence (Serverless)

| Service        | Technology           | Package                | Purpose                                     |
|----------------|----------------------|------------------------|---------------------------------------------|
| Hosting        | Vercel               | —                      | Production SPA hosting                      |
| API Runtime    | Vercel Functions     | `@vercel/node`         | Serverless endpoint `/api/sessions`        |
| Shared Cache   | Vercel Blob          | `@vercel/blob`         | Global FIFO storage of last 20 JSON uploads |
| Analytics      | Vercel Web Analytics | `@vercel/analytics`    | Visitor traffic & pageview metrics          |

## Persistence & Image Strategy

### Hybrid Session Caching
- **Primary**: Vercel Blob storage API storing JSON blobs (enforcing a 20-file limit FIFO).
- **Secondary**: Local browser `localStorage` acting as an instant/offline fallback if the Vercel Blob token is missing or if the serverless function fails.

### Car Image Resolution
- **Official Cars**: Static image catalog mapping official Assetto Corsa vehicle IDs to pre-resolved Wikimedia Commons URLs.
- **Mod Cars**: Dynamic integration via the Wikipedia API. The system humanizes mod IDs (e.g. `ks_porsche_919_hybrid_2016` -> `Porsche 919 Hybrid 2016`), searches Wikipedia articles, and caches the returned thumbnail URLs.

## Development & Deployment

| Target     | Method                                         |
|------------|------------------------------------------------|
| Web        | Automatic Vercel deployment (Git integration)   |

## Key Architecture Decisions

### Why React SPA + Vercel Blob?
- Static frontend with instant loading.
- Serverless API requires no dedicated server infrastructure.
- Shared storage is accessible to all users globally without account management.

### Why pnpm?
- Extremely fast installation and space-saving package management.
- Guarantees strict dependency resolution preventing ghost dependencies.
