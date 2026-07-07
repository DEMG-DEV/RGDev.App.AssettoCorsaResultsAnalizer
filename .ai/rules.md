# Rules — Development Guidelines

## Language & Naming

- All code, comments, and commit messages: **English**
- All user-facing UI text: **Spanish (es-MX)** as primary
- Use `camelCase` for JavaScript variables and functions
- Use `PascalCase` for TypeScript types, interfaces, and component names
- Use `kebab-case` for file names and CSS classes
- Use `SCREAMING_SNAKE_CASE` for constants and enum values

## Code Style

- Always use TypeScript strict mode.
- Prefer `const` over `let`; never use `var`.
- Use async/await over raw promises.
- Use early returns to avoid deep nesting.
- No `any` type — use `unknown` if type is truly unknown, then narrow with type guards.

## Architecture Principles

- **Separation of concerns**: parsing logic, UI components, and state management live in separate modules.
- **Pure functions first**: data transformation must be side-effect-free.
- **Single Responsibility**: each module/class/function does exactly one thing.
- **Error boundaries**: every API and I/O operation (Vercel Blob API call, ZIP extraction, File System Access API read) must have explicit error handling.

## File Organization

```
api/                   # Vercel Serverless Functions
└── sessions.ts        # GET/POST/DELETE Vercel Blob controller
src/
├── core/              # Pure business logic (no framework deps)
│   ├── parsers/       # JSON parsing (AC client & server formats)
│   ├── models/        # TypeScript interfaces & domain types
│   ├── analyzers/     # Computation: stats, gaps, best laps
│   └── utils/         # Formatters, time helpers, validators
├── services/          # I/O: file reading, ZIP handling, Vercel Blob / Wiki cache
├── stores/            # State management (Zustand)
├── components/        # Reusable UI components
├── assets/            # Static assets, icons, fonts
└── i18n/              # Internationalization strings
```

## Data Handling

- **Never mutate input data** — always create new objects/arrays.
- Time values internally stored as **milliseconds (integer)**.
- Time display formatted as `mm:ss.SSSS` (4 decimal places, matching AC precision).
- Sector times displayed as `ss.SSS` (3 decimal places).
- All computations (best lap, gaps, averages) happen in `core/analyzers/` — NOT in UI components.
- Support both JSON formats with a unified internal data model.

## Error Handling

- User-facing errors must be in Spanish with clear recovery instructions (e.g. falling back to localStorage if Vercel Blob is not configured).
- Log technical errors in English to console.
- Invalid JSON files: show file name + specific parse error.
- Partial data (e.g., missing sectors): gracefully degrade, show available data with a warning badge.
