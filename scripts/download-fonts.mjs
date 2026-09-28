/**
 * download-fonts.mjs — Fase 2: Self-hosting de fuentes
 * 
 * Descarga subsets de Google Fonts (solo los pesos realmente usados)
 * y los guarda en assets/fonts/{familia}/ como woff2 self-hosted.
 * 
 * Fuentes y pesos usados (auditados manualmente):
 *   - Bodoni Moda:  400 normal, 400 italic (headlines, page-header-title, hero)
 *   - Inter:        300, 400, 500, 600 (body, labels, CTAs)
 *   - Playfair Display: 400 normal (solo index.html hero h1)
 *   - Great Vibes:  400 normal (solo index.html hero span dinámico)
 *   - Material Symbols Outlined: variable 100-700 (iconos en todo el sitio)
 * 
 * Fuentes NO descargadas (no encontradas en uso):
 *   - Bodoni Moda 700 italic (no hay font-weight:700 italic en el markup)
 * 
 * Run: node scripts/download-fonts.mjs
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'assets', 'fonts');

// ─────────────────────────────────────────────────────────────
// ADVERTENCIA: Google Fonts no sirve directamente woff2 con
// URLs simples — devuelve CSS. Para self-hosting real usamos
// @fontsource (npm) o las URLs css2 API + extracción de woff2.
// 
// Este script usa la Google Fonts CSS2 API para obtener
// las URLs de woff2, luego las descarga directamente.
// Es el método estándar de "google-webfonts-helper"-style.
// ─────────────────────────────────────────────────────────────

const USER_AGENT = 'Mozilla/5.0 (compatible; TorrealbaJoyasFontDownloader/1.0) Gecko/20100101 Firefox/120.0';

function ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function fetchText(url, ua = USER_AGENT) {
    return new Promise((resolve, reject) => {
        const options = { headers: { 'User-Agent': ua } };
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchText(res.headers.location, ua).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(destPath);
        https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', err => { file.destroy(); reject(err); });
    });
}

/**
 * Extrae URLs de woff2 de la respuesta CSS de Google Fonts
 * Ejemplo de formato:
 *   src: url(https://fonts.gstatic.com/s/...woff2) format('woff2');
 */
function extractWoff2Urls(css) {
    const regex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
    const urls = [];
    let match;
    while ((match = regex.exec(css)) !== null) {
        urls.push(match[1]);
    }
    return [...new Set(urls)];
}

/**
 * Extrae bloques @font-face con sus unicode-range para nombrar archivos
 */
function parseFontFaces(css) {
    const blocks = [];
    const blockRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    while ((match = blockRegex.exec(css)) !== null) {
        const block = match[1];
        const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
        const commentMatch = match[0].match(/\/\*\s*([^*]+)\s*\*\//);
        if (urlMatch) {
            blocks.push({
                url: urlMatch[1],
                comment: commentMatch ? commentMatch[1].trim() : 'unknown',
            });
        }
    }
    return blocks;
}

// Font download specs
const FONTS_TO_DOWNLOAD = [
    {
        name: 'bodoni-moda',
        displayName: 'Bodoni Moda',
        // Usados: 400 normal, 400 italic
        googleApiUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&display=swap',
        filenames: ['BodoniModa-regular', 'BodoniModa-italic'],
    },
    {
        name: 'inter',
        displayName: 'Inter',
        // Usados: 300, 400, 500, 600
        googleApiUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
        filenames: ['Inter-300', 'Inter-400', 'Inter-500', 'Inter-600'],
    },
    {
        name: 'playfair-display',
        displayName: 'Playfair Display',
        // Usado: 400 normal — SOLO en index.html hero
        googleApiUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap',
        filenames: ['PlayfairDisplay-400'],
    },
    {
        name: 'great-vibes',
        displayName: 'Great Vibes',
        // Usado: 400 normal — SOLO en index.html hero span
        googleApiUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&display=swap',
        filenames: ['GreatVibes-400'],
    },
];

async function downloadFontFamily(spec) {
    console.log(`\n📥 Descargando: ${spec.displayName}`);
    const destDir = join(FONTS_DIR, spec.name);
    ensureDir(destDir);

    try {
        const css = await fetchText(spec.googleApiUrl);
        const fontFaces = parseFontFaces(css);
        
        if (fontFaces.length === 0) {
            console.log(`  ⚠️  No se encontraron URLs woff2 en la respuesta CSS`);
            console.log(`  CSS snippet: ${css.substring(0, 300)}`);
            return;
        }

        console.log(`  Encontrados ${fontFaces.length} archivos woff2:`);
        
        for (let i = 0; i < fontFaces.length; i++) {
            const face = fontFaces[i];
            const filename = (spec.filenames[i] || `${spec.name}-${i}`) + '.woff2';
            const destPath = join(destDir, filename);
            
            if (existsSync(destPath)) {
                console.log(`  ⏭️  Ya existe: ${filename}`);
                continue;
            }
            
            await downloadFile(face.url, destPath);
            console.log(`  ✅ ${filename} (${face.comment})`);
        }
    } catch (err) {
        console.error(`  ❌ Error descargando ${spec.displayName}: ${err.message}`);
    }
}

async function downloadMaterialSymbols() {
    console.log('\n📥 Descargando: Material Symbols Outlined');
    const destDir = join(FONTS_DIR, 'material-symbols');
    ensureDir(destDir);
    
    // Material Symbols usa variable font con rango de pesos
    const apiUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
    
    try {
        const css = await fetchText(apiUrl);
        const urls = extractWoff2Urls(css);
        
        if (urls.length === 0) {
            console.log('  ⚠️  No se encontraron URLs woff2');
            return;
        }

        const destPath = join(destDir, 'MaterialSymbolsOutlined.woff2');
        if (existsSync(destPath)) {
            console.log('  ⏭️  Ya existe: MaterialSymbolsOutlined.woff2');
            return;
        }

        // Material Symbols solo tiene 1 archivo variable
        await downloadFile(urls[0], destPath);
        console.log(`  ✅ MaterialSymbolsOutlined.woff2`);
    } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
    }
}

async function main() {
    console.log('🔤 Descarga de fuentes self-hosted para Torrealba Joyas');
    console.log('='.repeat(55));
    console.log('\nAuditoria de uso (revisado manualmente):');
    console.log('  ✅ Bodoni Moda 400 normal + italic — headlines, page-header-title, hero');
    console.log('  ✅ Inter 300/400/500/600 — body, labels, CTAs, nav');
    console.log('  ✅ Playfair Display 400 — SOLO index.html hero h1');
    console.log('  ✅ Great Vibes 400 — SOLO index.html hero span#dynamic-word');
    console.log('  ✅ Material Symbols Outlined — iconos en todo el sitio');
    console.log('  ❌ Playfair Display + Great Vibes NO existen en otras páginas (confirmado)');
    
    ensureDir(FONTS_DIR);
    
    for (const spec of FONTS_TO_DOWNLOAD) {
        await downloadFontFamily(spec);
    }
    
    await downloadMaterialSymbols();
    
    console.log('\n✅ Descarga completa.');
    console.log(`📁 Fuentes guardadas en: assets/fonts/`);
    console.log('\n⚠️  Recuerda que los @font-face ya están declarados en src/main.css');
    console.log('   Verifica que los nombres de archivo coincidan con las declaraciones.');
}

main().catch(console.error);
