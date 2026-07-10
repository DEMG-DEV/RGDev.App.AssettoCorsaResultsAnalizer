# 📋 Registro Técnico de Cambios

> Documento generado automáticamente con cada commit realizado en el proyecto.
> Contiene el detalle técnico completo de cada cambio para el equipo de desarrollo.

---

## feat: add car renaming and detailed analytics to track records

| Campo | Detalle |
|-------|---------|
| **Fecha** | 2026-07-10 00:21:00 |
| **Autor** | David Mendez (demg@outlook.com) |
| **Branch** | main |
| **Tipo** | Feature |

### Archivos Modificados

| Archivo | Estado | Descripción del Cambio |
|---------|--------|----------------------|
| `src/stores/session-store.ts` | Modificado | Se agregó el estado `carAliases` y la acción `setCarAlias`. Se implementó el middleware `persist` de zustand para guardar los alias permanentemente. |
| `src/core/utils/car-name-humanizer.ts` | Modificado | Se modificó `humanizeCarId` para extraer y retornar primero el alias personalizado desde `session-store` si existe. |
| `src/components/session-list/SessionCard.tsx` | Modificado | Se integró un botón con el icono `Edit2` al lado del nombre del auto que abre un `window.prompt` para definir el nuevo alias y lo guarda en el store. |
| `src/components/shared/TrackRecordsView.tsx` | Modificado | Se agregó estado `selectedRecordKey` para seleccionar un récord de la tabla. Al seleccionar, se renderizan dinámicamente los componentes `DataAnalysis` y `TelemetryTable` con la sesión original debajo de la tabla unificada. |

### Detalle Técnico

Se implementó un sistema de alias global para los autos. El alias se guarda persistentemente usando `zustand/middleware` (`persist`) parcializado únicamente para la propiedad `carAliases`, evitando así impactar el caché IndexDB existente para los resultados crudos. 

A nivel de visualización, `TrackRecordsView.tsx` fue refactorizado. Originalmente calculaba métricas estáticas por piloto/auto. Ahora, conserva una referencia estricta a la `originalSession` y `originalParticipant`. Las filas de la "Clasificación Unificada" son clickeables y expanden, debajo de la tabla, los componentes de telemetría completa (`DataAnalysis` y `TelemetryTable`), dando una visión muy profunda (lap-by-lap, gráficos de desgaste y análisis del mejor sector) del récord actual sin necesidad de salir de la vista de récords.

### Fragmentos de Código Relevantes

```diff
+      setCarAlias: (carId, alias) =>
+        set((state) => ({
+          carAliases: {
+            ...state.carAliases,
+            [carId]: alias,
+          },
+        })),
```

---

## feat: rebuild UI architecture to native macOS sidebar layout

| Campo | Detalle |
|-------|---------|
| **Fecha** | 2026-07-06 22:49:18 |
| **Autor** | David Mendez (demg@outlook.com) |
| **Branch** | main |
| **Tipo** | Refactor / UI |

### Archivos Modificados

| Archivo | Estado | Descripción del Cambio |
|---------|--------|----------------------|
| `src/index.css` | Modificado | Eliminación de clases legacy (`.app-header`), implementación de layout `flex-direction: row`, adición de `.app-sidebar`, `.app-top-toolbar` y `.app-bottom-bar`. Eliminación de bordes en `.data-table` para diseño estilo lista de sistema. |
| `src/components/layout/AppShell.tsx` | Modificado | Refactorización estructural completa pasando de un `<header>` superior a un componente `<aside>` (Sidebar) y un layout principal adaptativo para PC y Móviles (Bottom Nav). |

### Detalle Técnico

Se realizó un rediseño estructural mayor de la interfaz para abandonar el layout web clásico (top navigation) y adoptar el patrón nativo de aplicaciones de escritorio "Pro" del ecosistema Apple (macOS/iPadOS). 
- **Layout Base:** El `<div className="app-shell">` ahora utiliza `flex-direction: row` para acomodar el nuevo Sidebar.
- **Sidebar:** Se introdujo `.app-sidebar` con un ancho fijo de 260px, usando el efecto "Vibrancy" agresivo (`backdrop-filter: blur(40px)`) típico de macOS. 
- **Responsividad Móvil:** En viewports `< 768px`, el Sidebar se oculta (`display: none`) y se expone una nueva barra de navegación inferior (`.app-bottom-bar`), imitando el "Tab Bar" nativo de iOS con `env(safe-area-inset-bottom)`.
- **Content Toolbar:** Se añadió un `.app-top-toolbar` flotante dentro del wrapper principal, el cual emplea máscaras de degradado para lograr el efecto de desvanecimiento de contenido al hacer scroll, sin bloquear los eventos de click.
- **Tablas:** Se modificó la clase `.data-table` removiendo los bordes (`border-bottom: none`) para dar una estética de Finder List, basándose únicamente en el highlight de fila flotante.

### Fragmentos de Código Relevantes

```diff
- <header className="app-header">
-   <div className="app-header-left">
-     {canGoBack && <button className="btn btn-icon" onClick={goBack}><ArrowLeft size={18} /></button>}
-     <span className="logo" onClick={() => setView('home')}>AC Results Analyzer</span>
-   </div>
- </header>
+ <aside className="app-sidebar">
+   <div className="logo" onClick={() => setView('home')}>
+     <div className="logo-icon">AC</div>
+     <span>Results Analyzer</span>
+   </div>
+   <nav className="sidebar-nav">
+     {/* Nav Items */}
+   </nav>
+ </aside>
```

---
