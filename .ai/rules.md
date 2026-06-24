# Rules — Development Guidelines

## Language & Naming

- All code, comments, and commit messages: **English**
- All user-facing UI text: **Spanish (es-MX)** as primary, with English (en-US) as secondary/fallback
- Use `camelCase` for JavaScript variables and functions
- Use `PascalCase` for TypeScript types, interfaces, and component names
- Use `kebab-case` for file names and CSS classes
- Use `SCREAMING_SNAKE_CASE` for constants and enum values

## Code Style

- Always use TypeScript strict mode
- Prefer `const` over `let`; never use `var`
- Use async/await over raw promises
- All functions must have JSDoc documentation
- Use early returns to avoid deep nesting
- Maximum function length: 40 lines (extract helpers)
- No `any` type — use `unknown` if type is truly unknown, then narrow with type guards

## Architecture Principles

- **Separation of concerns**: parsing logic, UI components, and state management live in separate modules
- **Pure functions first**: data transformation must be side-effect-free
- **Single Responsibility**: each module/class/function does exactly one thing
- **Dependency Injection**: parsers and services are injected, never directly instantiated in components
- **Error boundaries**: every I/O operation (file read, ZIP extraction) must have explicit error handling

## File Organization

```
src/
├── core/              # Pure business logic (no framework deps)
│   ├── parsers/       # JSON parsing (AC client & server formats)
│   ├── models/        # TypeScript interfaces & domain types
│   ├── analyzers/     # Computation: stats, gaps, best laps
│   └── utils/         # Formatters, time helpers, validators
├── services/          # I/O: file reading, ZIP handling, path discovery
├── stores/            # State management
├── components/        # Reusable UI components
├── pages/             # Page-level components / views
├── assets/            # Static assets, icons, fonts
└── i18n/              # Internationalization strings
```

## Data Handling

- **Never mutate input data** — always create new objects/arrays
- Time values internally stored as **milliseconds (integer)**
- Time display formatted as `mm:ss.SSSS` (4 decimal places, matching AC precision)
- Sector times displayed as `ss.SSS` (3 decimal places)
- All computations (best lap, gaps, averages) happen in `core/analyzers/` — NOT in UI components
- Support both JSON formats with a unified internal data model

## Testing

- Unit tests for all parsers with real AC JSON fixtures
- Unit tests for all analyzer/computation functions
- Snapshot tests for critical UI components
- E2E tests for the file-upload → results-display flow

## Error Handling

- User-facing errors must be in Spanish with clear recovery instructions
- Log technical errors in English to console
- Invalid JSON files: show file name + specific parse error
- Partial data (e.g., missing sectors): gracefully degrade, show available data with a warning badge
- ZIP with mixed content: parse valid JSONs, report skipped files

## Performance

- Lazy-load chart/visualization libraries
- Parse files in a Web Worker if available (avoid blocking UI)
- Virtualize long lists (>50 drivers, >100 laps)
- Debounce search/filter inputs

## Accessibility

- All interactive elements must be keyboard-navigable
- Use semantic HTML (tables for data, sections for layout)
- Color is never the sole indicator — always pair with icons or text
- Minimum contrast ratio: 4.5:1 (WCAG AA)

## Git Workflow

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Branch naming: `feature/xxx`, `fix/xxx`, `refactor/xxx`
- No direct pushes to `main` — always PR
