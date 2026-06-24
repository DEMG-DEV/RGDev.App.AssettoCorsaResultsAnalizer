/**
 * Vite Plugin: AC Local Server
 *
 * Serves local Assetto Corsa data as API endpoints so the browser
 * can load everything automatically without user interaction.
 *
 * Endpoints:
 *   GET /__api/status           → { cmFound, acFound, cmPath, acPath }
 *   GET /__api/cm-sessions      → [{ name, size, modified }]
 *   GET /__api/cm-sessions/:name → raw JSON file content
 *   GET /__api/ac-car-preview/:carId/:skinName → preview.jpg image
 *   GET /__api/ac-car-info/:carId → ui_car.json content
 *   GET /__api/ac-car-skins/:carId → [skinName1, skinName2, ...]
 */

import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

// === Known paths ===
const CM_SESSIONS_PATHS = [
  path.join(process.env.LOCALAPPDATA ?? '', 'AcTools Content Manager', 'Progress', 'Sessions'),
];

const AC_INSTALL_PATHS = [
  'D:\\SteamLibrary\\steamapps\\common\\assettocorsa',
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa',
  'C:\\Program Files\\Steam\\steamapps\\common\\assettocorsa',
  'E:\\SteamLibrary\\steamapps\\common\\assettocorsa',
];

function findExistingPath(candidates: string[]): string | null {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function acLocalServerPlugin(): Plugin {
  const cmPath = findExistingPath(CM_SESSIONS_PATHS);
  const acPath = findExistingPath(AC_INSTALL_PATHS);

  console.log(`[AC Plugin] CM Sessions: ${cmPath ?? 'NOT FOUND'}`);
  console.log(`[AC Plugin] AC Install:  ${acPath ?? 'NOT FOUND'}`);

  return {
    name: 'ac-local-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';

        // === Status endpoint ===
        if (url === '/__api/status') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            cmFound: cmPath !== null,
            acFound: acPath !== null,
            cmPath,
            acPath,
          }));
          return;
        }

        // === CM Session list ===
        if (url === '/__api/cm-sessions') {
          if (!cmPath) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'CM sessions folder not found' }));
            return;
          }

          try {
            const files = fs.readdirSync(cmPath)
              .filter(f => f.toLowerCase().endsWith('.json'))
              .map(name => {
                const stat = fs.statSync(path.join(cmPath, name));
                return { name, size: stat.size, modified: stat.mtimeMs };
              })
              .sort((a, b) => a.name.localeCompare(b.name));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(files));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }

        // === CM Session file content ===
        const cmFileMatch = url.match(/^\/__api\/cm-sessions\/(.+\.json)$/);
        if (cmFileMatch) {
          if (!cmPath) {
            res.statusCode = 404;
            res.end('');
            return;
          }

          const fileName = decodeURIComponent(cmFileMatch[1]!);
          // Security: prevent path traversal
          if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
            res.statusCode = 400;
            res.end('');
            return;
          }

          const filePath = path.join(cmPath, fileName);
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end('');
            return;
          }

          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch {
            res.statusCode = 500;
            res.end('');
          }
          return;
        }

        // === AC Car Preview Image ===
        // URL: /__api/ac-car-preview/:carId or /__api/ac-car-preview/:carId/:skinName
        const previewMatch = url.match(/^\/__api\/ac-car-preview\/([^/]+)(?:\/([^/]+))?$/);
        if (previewMatch) {
          if (!acPath) {
            res.statusCode = 404;
            res.end('');
            return;
          }

          const carId = decodeURIComponent(previewMatch[1]!);
          const skinName = previewMatch[2] ? decodeURIComponent(previewMatch[2]) : null;

          // Security
          if ([carId, skinName].some(s => s && (s.includes('..') || s.includes('/')))) {
            res.statusCode = 400;
            res.end('');
            return;
          }

          // Try exact skin first
          if (skinName) {
            const exactPath = path.join(acPath, 'content', 'cars', carId, 'skins', skinName, 'preview.jpg');
            if (fs.existsSync(exactPath)) {
              res.setHeader('Content-Type', 'image/jpeg');
              res.setHeader('Cache-Control', 'public, max-age=31536000');
              fs.createReadStream(exactPath).pipe(res);
              return;
            }
          }

          // Fallback: first skin with a preview
          const skinsDir = path.join(acPath, 'content', 'cars', carId, 'skins');
          if (fs.existsSync(skinsDir)) {
            try {
              const skins = fs.readdirSync(skinsDir);
              for (const skin of skins) {
                const previewPath = path.join(skinsDir, skin, 'preview.jpg');
                if (fs.existsSync(previewPath)) {
                  res.setHeader('Content-Type', 'image/jpeg');
                  res.setHeader('Cache-Control', 'public, max-age=31536000');
                  fs.createReadStream(previewPath).pipe(res);
                  return;
                }
              }
            } catch { /* ignore */ }
          }

          res.statusCode = 404;
          res.end('');
          return;
        }

        // === AC Car Info (ui_car.json) ===
        const carInfoMatch = url.match(/^\/__api\/ac-car-info\/([^/]+)$/);
        if (carInfoMatch) {
          if (!acPath) {
            res.statusCode = 404;
            res.end('');
            return;
          }

          const carId = decodeURIComponent(carInfoMatch[1]!);
          if (carId.includes('..')) { res.statusCode = 400; res.end(''); return; }

          const infoPath = path.join(acPath, 'content', 'cars', carId, 'ui', 'ui_car.json');
          if (!fs.existsSync(infoPath)) {
            res.statusCode = 404;
            res.end('');
            return;
          }

          try {
            let content = fs.readFileSync(infoPath, 'utf-8');
            // Remove BOM if present
            content = content.replace(/^\uFEFF/, '');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(content);
          } catch {
            res.statusCode = 500;
            res.end('');
          }
          return;
        }

        // === AC Car Skins list ===
        const skinsMatch = url.match(/^\/__api\/ac-car-skins\/([^/]+)$/);
        if (skinsMatch) {
          if (!acPath) {
            res.statusCode = 404;
            res.end('');
            return;
          }

          const carId = decodeURIComponent(skinsMatch[1]!);
          if (carId.includes('..')) { res.statusCode = 400; res.end(''); return; }

          const skinsDir = path.join(acPath, 'content', 'cars', carId, 'skins');
          if (!fs.existsSync(skinsDir)) {
            res.statusCode = 404;
            res.end(JSON.stringify([]));
            return;
          }

          try {
            const skins = fs.readdirSync(skinsDir).filter(f => {
              return fs.statSync(path.join(skinsDir, f)).isDirectory();
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(skins));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify([]));
          }
          return;
        }

        next();
      });
    },
  };
}
