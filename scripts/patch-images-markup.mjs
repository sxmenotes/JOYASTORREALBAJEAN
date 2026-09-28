/**
 * patch-images-markup.mjs — Fase 3 (parte 2)
 * 
 * Lee image-markup-map.json generado por optimize-images.mjs
 * y actualiza los HTML del proyecto Vite para usar <picture>
 * con srcset/sizes apuntando a las variantes WebP/AVIF/fallback existentes.
 * 
 * También asegura que toda imagen fuera del viewport inicial
 * tenga loading="lazy" y decoding="async".
 * 
 * NO modifica los archivos originales del sitio en producción.
 * Solo modifica los .html dentro de torrealba-joyas-optimizado/.
 * 
 * Run: node scripts/patch-images-markup.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Cargar el mapa de markup generado por optimize-images.mjs
const MAP_PATH = join(__dirname, 'image-markup-map.json');

if (!existsSync(MAP_PATH)) {
    console.error('❌ image-markup-map.json no encontrado.');
    console.error('   Ejecuta primero: node scripts/optimize-images.mjs');
    process.exit(1);
}

const markupMap = JSON.parse(readFileSync(MAP_PATH, 'utf-8'));
const HTML_FILES = [
    'index.html', 'catalogo.html', 'orfebreria.html',
    'galeria.html', 'quien-soy.html', 'contacto.html',
];

// Imágenes above-the-fold que NO deben tener loading="lazy"
const ABOVE_FOLD_SRCS = [
    'assets/hero_bg.png',
    'assets/logo.png',
    'assets/logo_white.png',
    'assets/favicon.png',
];

function isAboveFold(src) {
    return ABOVE_FOLD_SRCS.some(af => src.includes(af.replace('assets/', '')));
}

function patchHTML(filename) {
    const filepath = join(ROOT, filename);
    if (!existsSync(filepath)) {
        console.log(`⏭️  Archivo no encontrado: ${filename}`);
        return;
    }
    
    let content = readFileSync(filepath, 'utf-8');
    const original = content;

    // 1. Para cada imagen conocida en el mapa, reemplazar <img src="..."> con <picture>
    for (const [originalSrc, _snippet] of Object.entries(markupMap)) {
        // Excluir favicon y logos en header que no requieren responsive picture
        if (originalSrc.includes('favicon.png')) continue;

        const relBase = `assets/optimized/${originalSrc.replace('assets/', '').replace(/\.[^.]+$/, '')}`;
        const optDir = join(ROOT, relBase);
        
        // Verificar variantes existentes en disco
        if (!existsSync(optDir)) continue;
        const isJpeg = Boolean(originalSrc.match(/\.(jpg|jpeg)$/i));
        const fallbackExt = isJpeg ? '.jpg' : '.png';
        const widths = [480, 800, 1200].filter(w => existsSync(join(optDir, `${w}w.webp`)));
        if (widths.length === 0) continue;

        // Escapar para regex
        const escapedSrc = originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Buscar tags <img> con este src
        const imgRegex = new RegExp(
            `<img[^>]*?src=["']${escapedSrc}["'][^>]*?>`,
            'g'
        );
        
        content = content.replace(imgRegex, (match) => {
            // Preservar atributos del <img> original
            const altMatch = match.match(/alt=["']([^"']*)["']/);
            const classMatch = match.match(/class=["']([^"']*)["']/);
            const fetchpriorityMatch = match.match(/fetchpriority=["']([^"']*)["']/);
            const aboveFold = isAboveFold(originalSrc) || Boolean(fetchpriorityMatch);
            
            const alt = altMatch ? altMatch[1] : '';
            const cls = classMatch ? ` class="${classMatch[1]}"` : '';
            const lazy = aboveFold ? '' : ' loading="lazy"';
            const fetchpri = fetchpriorityMatch ? ` fetchpriority="${fetchpriorityMatch[1]}"` : '';
            
            const avifSrcset = widths.map(w => `${relBase}/${w}w.avif ${w}w`).join(', ');
            const webpSrcset = widths.map(w => `${relBase}/${w}w.webp ${w}w`).join(', ');
            const fallbackSrcset = widths.map(w => `${relBase}/${w}w${fallbackExt} ${w}w`).join(', ');
            const maxW = widths[widths.length - 1];
            const fallbackSrc = `${relBase}/${maxW}w${fallbackExt}`;
            
            const sizes = widths.length > 1
                ? `sizes="(max-width: 640px) 100vw, ${maxW}px"`
                : '';

            return `<picture>
  <source type="image/avif" srcset="${avifSrcset}" ${sizes}>
  <source type="image/webp" srcset="${webpSrcset}" ${sizes}>
  <img src="${fallbackSrc}" srcset="${fallbackSrcset}" ${sizes}${cls} alt="${alt}"${lazy} decoding="async"${fetchpri}>
</picture>`;
        });
    }

    // 2. En index.html, actualizar el link preload de hero_bg
    if (filename === 'index.html') {
        content = content.replace(
            /<link\s+rel="preload"\s+as="image"\s+href="assets\/hero_bg\.png"[^>]*>/g,
            '<link rel="preload" as="image" type="image/webp" href="assets/optimized/hero_bg/800w.webp" fetchpriority="high">'
        );
    }

    // 3. Asegurar que todo <img> que no tenga loading="lazy" y no sea above-fold lo tenga
    content = content.replace(/<img(?![^>]*loading=)[^>]*src=["'][^"']*["'][^>]*>/g, (match) => {
        const srcMatch = match.match(/src=["']([^"']*)["']/);
        if (!srcMatch) return match;
        const src = srcMatch[1];
        
        if (isAboveFold(src) || src.startsWith('data:')) return match;
        if (match.includes('fetchpriority="high"')) return match;
        
        return match.replace('>', ' loading="lazy" decoding="async">');
    });

    if (content !== original) {
        writeFileSync(filepath, content, 'utf-8');
        console.log(`✅ Actualizado: ${filename}`);
    } else {
        console.log(`⏭️  Sin cambios: ${filename}`);
    }
}

console.log('🖼️  Aplicando markup <picture> con srcset en los HTML...\n');
HTML_FILES.forEach(patchHTML);
console.log('\n✅ Listo! Los HTMLs ahora usan WebP/AVIF con fallback JPG/PNG.');
