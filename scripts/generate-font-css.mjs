/**
 * generate-font-css.mjs
 * 
 * Genera el bloque @font-face completo (con unicode-range) para src/main.css
 * extrayendo el CSS original de Google Fonts y reemplazando las URLs remotas
 * por URLs locales (assets/fonts/).
 * 
 * Esto garantiza que el subsetting por idioma (latino, cirílico, griego, etc.)
 * se preserve correctamente en los @font-face self-hosted.
 * 
 * Run: node scripts/generate-font-css.mjs
 * Luego: copiar el output a src/main.css (reemplazando los @font-face)
 */

import https from 'https';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FONTS_DIR = join(ROOT, 'assets', 'fonts');
const OUTPUT_CSS = join(__dirname, 'generated-font-faces.css');

const USER_AGENT = 'Mozilla/5.0 (compatible; TorrealbaJoyasFontDownloader/1.0) Gecko/20100101 Firefox/120.0';

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

// Las mismas fuentes del download-fonts.mjs, con sus APIs
const FONT_SOURCES = [
    {
        name: 'bodoni-moda',
        displayName: 'Bodoni Moda',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&display=swap',
        filePrefix: 'BodoniModa',
        // Mapeo de posición → nombre de archivo descargado
        fileMap: {
            0: 'BodoniModa-regular.woff2',  // primer @font-face (latin)
            1: 'BodoniModa-italic.woff2',   // segundo @font-face (latin italic)
        },
        defaultPrefix: 'bodoni-moda',
    },
    {
        name: 'inter',
        displayName: 'Inter',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
        fileMap: {
            0: 'Inter-300.woff2',
            1: 'Inter-400.woff2',
            2: 'Inter-500.woff2',
            3: 'Inter-600.woff2',
        },
        defaultPrefix: 'inter',
    },
    {
        name: 'playfair-display',
        displayName: 'Playfair Display',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap',
        fileMap: {
            0: 'PlayfairDisplay-400.woff2',
        },
        defaultPrefix: 'playfair-display',
    },
    {
        name: 'great-vibes',
        displayName: 'Great Vibes',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&display=swap',
        fileMap: {
            0: 'GreatVibes-400.woff2',
        },
        defaultPrefix: 'great-vibes',
    },
    {
        name: 'material-symbols',
        displayName: 'Material Symbols Outlined',
        apiUrl: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block',
        fileMap: {
            0: 'MaterialSymbolsOutlined.woff2',
        },
        defaultPrefix: 'material-symbols',
    },
];

function getLocalFilename(fontSpec, index) {
    if (fontSpec.fileMap && fontSpec.fileMap[index] !== undefined) {
        return fontSpec.fileMap[index];
    }
    return `${fontSpec.defaultPrefix}-${index + 1}.woff2`;
}

async function generateFontFaces(fontSpec) {
    const css = await fetchText(fontSpec.apiUrl);
    
    // Extraer bloques @font-face individuales
    const blockRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    let index = 0;
    let resultCss = `\n/* ── ${fontSpec.displayName} ── */\n`;
    
    while ((match = blockRegex.exec(css)) !== null) {
        let block = match[0];
        
        // Extraer la URL de gstatic
        const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
        if (!urlMatch) { index++; continue; }
        
        const remoteUrl = urlMatch[1];
        const localFilename = getLocalFilename(fontSpec, index);
        const localPath = `assets/fonts/${fontSpec.name}/${localFilename}`;
        
        // Verificar que el archivo existe
        const fullLocalPath = join(FONTS_DIR, fontSpec.name, localFilename);
        const fileExists = existsSync(fullLocalPath);
        
        // Reemplazar la URL remota por la local
        block = block.replace(remoteUrl, localPath);
        
        resultCss += block + `\n`;
        
        if (!fileExists) {
            console.warn(`  ⚠️  Archivo no encontrado: ${localPath}`);
        }
        
        index++;
    }
    
    return resultCss;
}

async function main() {
    console.log('📄 Generando @font-face CSS con unicode-range correcto...\n');
    
    let allCss = `/* 
 * Fuentes self-hosted — Torrealba Joyas
 * Generado por: node scripts/generate-font-css.mjs
 * 
 * Incluye unicode-range correcto de Google Fonts para subsetting por idioma.
 * Todos los archivos woff2 están en assets/fonts/{familia}/
 */\n`;
    
    for (const spec of FONT_SOURCES) {
        console.log(`📥 Procesando ${spec.displayName}...`);
        try {
            const css = await generateFontFaces(spec);
            allCss += css;
            console.log('  ✅ OK');
        } catch (err) {
            console.error(`  ❌ Error: ${err.message}`);
        }
    }
    
    writeFileSync(OUTPUT_CSS, allCss);
    console.log(`\n✅ CSS generado en: scripts/generated-font-faces.css`);
    console.log('   Integrar en src/main.css para self-hosting completo.');
}

main().catch(console.error);
