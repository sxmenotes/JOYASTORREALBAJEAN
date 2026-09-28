/**
 * patch-external-scripts.mjs
 * 
 * Vite (en modo multi-page) no puede hacer bundle de scripts sin type="module".
 * Solución: marcar scripts externos como defer (no module) para que Vite los ignore.
 * 
 * Scripts afectados:
 * - /_vercel/speed-insights/script.js (Vercel SDK, externo)
 * - js/regions.js (script legacy sin módulos)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const HTML_FILES = [
    'index.html', 'catalogo.html', 'orfebreria.html',
    'galeria.html', 'quien-soy.html', 'contacto.html',
];

function patchHTML(filename) {
    const filepath = join(ROOT, filename);
    if (!existsSync(filepath)) return;
    
    let content = readFileSync(filepath, 'utf-8');
    const original = content;

    // 1. Vercel Speed Insights: marcar como defer (Vite lo ignorará, Vercel lo sirve en producción)
    content = content.replace(
        /<script\s+src="\/_vercel\/speed-insights\/script\.js"[^>]*><\/script>/g,
        `<script defer src="/_vercel/speed-insights/script.js"></script>`
    );

    // 2. regions.js: no tiene módulos ES, necesita ser incluido como script global
    //    Lo marcamos como legacy (defer) para que Vite no intente bundlearlo
    content = content.replace(
        /<script\s+src="js\/regions\.js"[^>]*><\/script>/g,
        `<script defer src="js/regions.js"></script>`
    );

    if (content !== original) {
        writeFileSync(filepath, content, 'utf-8');
        console.log(`✅ Patched external scripts: ${filename}`);
    }
}

console.log('🔧 Parchando scripts externos para compatibilidad con Vite...\n');
HTML_FILES.forEach(patchHTML);
console.log('\n✅ Listo!');
