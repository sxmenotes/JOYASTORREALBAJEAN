/**
 * download-fonts-v2.mjs — Fase 2: Self-hosting de fuentes (v2)
 * 
 * Versión mejorada: descarga TODOS los archivos woff2 con su índice correcto
 * para que el CSS generado con unicode-range funcione correctamente.
 * 
 * Run: node scripts/download-fonts-v2.mjs
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'assets', 'fonts');

const USER_AGENT = 'Mozilla/5.0 (compatible; TorrealbaJoyasFontDownloader/1.0) Gecko/20100101 Firefox/120.0';

function ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function fetchText(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchText(res.headers.location).then(resolve).catch(reject);
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

function extractFontFaceBlocks(css) {
    const blocks = [];
    const blockRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    let index = 0;
    while ((match = blockRegex.exec(css)) !== null) {
        const block = match[0];
        const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
        if (urlMatch) {
            blocks.push({ index, url: urlMatch[1], block });
            index++;
        }
    }
    return blocks;
}

const FONTS_TO_DOWNLOAD = [
    {
        name: 'bodoni-moda',
        displayName: 'Bodoni Moda',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&display=swap',
        // Los primeros 2 se nombran con nombres especiales (regular/italic)
        namedFiles: { 0: 'BodoniModa-regular.woff2', 1: 'BodoniModa-italic.woff2' },
        defaultPrefix: 'bodoni-moda',
    },
    {
        name: 'inter',
        displayName: 'Inter',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
        namedFiles: { 0: 'Inter-300.woff2', 1: 'Inter-400.woff2', 2: 'Inter-500.woff2', 3: 'Inter-600.woff2' },
        defaultPrefix: 'inter',
    },
    {
        name: 'playfair-display',
        displayName: 'Playfair Display',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap',
        namedFiles: { 0: 'PlayfairDisplay-400.woff2' },
        defaultPrefix: 'playfair-display',
    },
    {
        name: 'great-vibes',
        displayName: 'Great Vibes',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&display=swap',
        namedFiles: { 0: 'GreatVibes-400.woff2' },
        defaultPrefix: 'great-vibes',
    },
    {
        name: 'material-symbols',
        displayName: 'Material Symbols Outlined',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block',
        namedFiles: { 0: 'MaterialSymbolsOutlined.woff2' },
        defaultPrefix: 'material-symbols',
    },
];

function getFilename(spec, index) {
    if (spec.namedFiles && spec.namedFiles[index] !== undefined) {
        return spec.namedFiles[index];
    }
    // índice 0→nombre[0], 1→nombre[1], ..., N→prefijo-{N+1}
    const namedCount = Object.keys(spec.namedFiles || {}).length;
    if (index < namedCount) return spec.namedFiles[index];
    return `${spec.defaultPrefix}-${index + 1}.woff2`;
}

async function downloadFontFamily(spec) {
    console.log(`\n📥 ${spec.displayName}`);
    const destDir = join(FONTS_DIR, spec.name);
    ensureDir(destDir);

    const css = await fetchText(spec.apiUrl);
    const blocks = extractFontFaceBlocks(css);
    console.log(`   ${blocks.length} archivos woff2 encontrados`);

    for (const { index, url } of blocks) {
        const filename = getFilename(spec, index);
        const destPath = join(destDir, filename);
        
        if (existsSync(destPath)) {
            console.log(`   ⏭️  [${index}] ${filename} (ya existe)`);
            continue;
        }
        
        await downloadFile(url, destPath);
        console.log(`   ✅ [${index}] ${filename}`);
    }
}

async function main() {
    console.log('🔤 Descarga completa de fuentes self-hosted\n');
    ensureDir(FONTS_DIR);
    
    for (const spec of FONTS_TO_DOWNLOAD) {
        await downloadFontFamily(spec);
    }
    
    console.log('\n✅ Todas las fuentes descargadas.');
    console.log('   Ejecuta: node scripts/generate-font-css.mjs');
    console.log('   para regenerar el CSS con unicode-range correcto.');
}

main().catch(console.error);
