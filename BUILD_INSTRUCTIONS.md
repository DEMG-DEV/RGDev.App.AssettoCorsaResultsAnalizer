# 🏎️ AC Results Analyzer — Build Instructions

## Web (Browser)

```bash
# Development
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

---

## 🖥️ Desktop — Tauri 2.x

### Prerequisites

1. **Instalar Rust**: https://rustup.rs/
   ```bash
   winget install Rustlang.Rustup
   ```
2. **Visual Studio Build Tools** (C++ workload):
   ```bash
   winget install Microsoft.VisualStudio.2022.BuildTools
   ```
3. **WebView2** (incluido en Windows 10/11 moderno)

### Desarrollo

```bash
pnpm tauri:dev
```
> Abre la app en una ventana de escritorio con hot-reload.

### Compilar .msi (Windows)

```bash
pnpm tauri:build
```
> Genera el instalador `.msi` en `src-tauri/target/release/bundle/msi/`.

### Compilar para macOS (.dmg)

```bash
# Desde una Mac con Xcode instalado
pnpm tauri:build
```

### Compilar para Linux (.AppImage / .deb)

```bash
# Desde Linux con build-essential instalado
pnpm tauri:build
```

---

## 📱 Android — Capacitor

### Prerequisites

1. **Android Studio**: https://developer.android.com/studio
2. **JDK 17+**: (Android Studio lo incluye)
3. Configurar `ANDROID_HOME` en variables de entorno

### Setup inicial (solo una vez)

```bash
# Build web + sync con Android
pnpm cap:sync

# Si es la primera vez, agregar la plataforma:
npx cap add android
```

### Desarrollo

```bash
# Abrir en Android Studio
pnpm cap:open

# O ejecutar directamente en emulador/dispositivo
npx cap run android
```

### Compilar APK

```bash
pnpm build
npx cap sync
# Luego en Android Studio: Build > Build Bundle(s) / APK(s)
```

---

## 📁 Estructura del proyecto

```
ac-results-analyzer/
├── src/                    # React/TypeScript source
├── src-tauri/              # Tauri (Rust) backend
│   ├── src/                # Rust source files
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri configuration
│   └── icons/              # App icons
├── android/                # Capacitor Android project (auto-generated)
├── capacitor.config.ts     # Capacitor configuration
├── dist/                   # Production build output
└── package.json            # Node.js dependencies & scripts
```

## 📜 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo web |
| `pnpm build` | Build de producción |
| `pnpm test` | Ejecutar tests |
| `pnpm tauri:dev` | Desarrollo desktop (Tauri) |
| `pnpm tauri:build` | Compilar instalador desktop |
| `pnpm cap:sync` | Build + sync con Android |
| `pnpm cap:open` | Abrir proyecto Android |
