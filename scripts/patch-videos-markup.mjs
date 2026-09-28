/**
 * patch-videos-markup.mjs — Fase 4 (parte 2)
 * 
 * Actualiza los HTML del proyecto Vite para:
 * - Reemplazar rutas de videos originales por variantes optimizadas en assets/videos-optimized/
 * - Agregar <source> WebM (primero) + MP4 (fallback) para videos directos
 * - Agregar poster generado con ffmpeg
 * - Actualizar data-src y posters en videos perezosos (lazy-video)
 * 
 * NO modifica archivos originales del sitio en producción.
 * Solo modifica los .html dentro de torrealba-joyas-optimizado/.
 * 
 * Run: node scripts/patch-videos-markup.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_BASE = 'assets/videos-optimized';

const HTML_FILES = [
    'index.html', 'catalogo.html', 'orfebreria.html',
    'galeria.html', 'quien-soy.html', 'contacto.html',
];

function patchHTML(filename) {
    const filepath = join(ROOT, filename);
    if (!existsSync(filepath)) {
        console.log(`⏭️  No encontrado: ${filename}`);
        return;
    }

    let content = readFileSync(filepath, 'utf-8');
    const original = content;

    // 1. Reemplazar <video ... src="assets/{name}.mp4" ...></video> con <source> WebM + MP4 + poster
    content = content.replace(/<video([^>]*?)src=["']assets\/([a-zA-Z0-9_-]+)\.mp4["']([^>]*?)>([\s\S]*?)<\/video>/g, (match, beforeSrc, videoName, afterSrc, inner) => {
        const videoDir = join(ROOT, OUTPUT_BASE, videoName);
        if (!existsSync(videoDir)) return match; // conservar si no hay versión optimizada

        const webmSrc = `${OUTPUT_BASE}/${videoName}/${videoName}.webm`;
        const mp4Src  = `${OUTPUT_BASE}/${videoName}/${videoName}.mp4`;
        const posterSrc = `${OUTPUT_BASE}/${videoName}/${videoName}-poster.jpg`;

        let attrs = `${beforeSrc} ${afterSrc}`.trim();
        // Asegurar poster si existe el archivo
        if (existsSync(join(ROOT, posterSrc)) && !attrs.includes('poster=')) {
            attrs += ` poster="${posterSrc}"`;
        }
        // Asegurar preload="metadata" en lugar de "none" para que no descargue todo de golpe pero tenga dimensiones
        if (!attrs.includes('preload=')) {
            attrs += ` preload="metadata"`;
        }

        // Limpiar espacios dobles
        attrs = attrs.replace(/\s+/g, ' ');

        return `<video ${attrs}>
  <source src="${webmSrc}" type="video/webm">
  <source src="${mp4Src}" type="video/mp4">
</video>`;
    });

    // 2. Reemplazar videos con data-src="assets/{name}.mp4"
    content = content.replace(/data-src=["']assets\/([a-zA-Z0-9_-]+)\.mp4["']/g, (match, videoName) => {
        const videoDir = join(ROOT, OUTPUT_BASE, videoName);
        if (!existsSync(videoDir)) return match;
        return `data-src="${OUTPUT_BASE}/${videoName}/${videoName}.mp4"`;
    });

    // 3. Reemplazar posters de video asociados
    const POSTER_REPLACEMENTS = {
        'assets/catalogo_rings.png': `${OUTPUT_BASE}/catalogo_bg/catalogo_bg-poster.jpg`,
        'assets/taller_1.jpg': `${OUTPUT_BASE}/talleres_bg/talleres_bg-poster.jpg`,
        'assets/quiensoy_portrait.png': `${OUTPUT_BASE}/quiensoy_video/quiensoy_video-poster.jpg`,
    };

    for (const [origPoster, newPoster] of Object.entries(POSTER_REPLACEMENTS)) {
        if (existsSync(join(ROOT, newPoster))) {
            const escaped = origPoster.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Solo reemplazar si está dentro de un atributo poster="..." de un video
            content = content.replace(
                new RegExp(`poster=["']${escaped}["']`, 'g'),
                `poster="${newPoster}"`
            );
        }
    }

    if (content !== original) {
        writeFileSync(filepath, content, 'utf-8');
        console.log(`✅ ${filename}`);
    } else {
        console.log(`⏭️  Sin cambios: ${filename}`);
    }
}

console.log('🎬 Aplicando markup <video> optimizado con WebM + poster...\n');
HTML_FILES.forEach(patchHTML);
console.log('\n✅ Listo! Los videos ahora usan WebM/MP4 con poster y preload=metadata.');
