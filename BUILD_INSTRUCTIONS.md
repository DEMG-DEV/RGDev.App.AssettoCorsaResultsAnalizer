# 🏎️ AC Results Analyzer — Build Instructions

## Web (Browser)

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

---

## ☁️ Deploy to Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Via GitHub

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Vite + React
4. Deploy!

### Configuration

The `vercel.json` already handles:
- SPA routing (all routes → `index.html`)
- Static asset caching (1 year for `/assets/*`)

---

## 📁 Estructura del proyecto

```
ac-results-analyzer/
├── src/                    # React/TypeScript source
│   ├── components/         # UI components
│   ├── core/               # Parsers, analyzers, models
│   ├── services/           # File loader, car image catalog
│   ├── stores/             # Zustand state management
│   ├── i18n/               # Spanish translations
│   └── index.css           # Design system
├── dist/                   # Production build output
├── vercel.json             # Vercel SPA configuration
└── package.json            # Dependencies & scripts
```

## 📜 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo web |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build de producción |
| `pnpm test` | Ejecutar tests |
