/**
 * optimize-images.mjs — Fase 3: Pipeline de imágenes (multiplataforma)
 * 
 * Reemplaza el script sips-based (solo macOS) con Sharp (Node.js).
 * 
 * Para cada imagen JPG/PNG en assets/:
 * - Genera 3 variantes de ancho: 480w, 800w, 1200w
 * - En formato: WebP + AVIF (modernos) + JPG/PNG (fallback)
 * - NO sobrescribe originales: salida en assets/optimized/{nombre}/
 * 
 * Uso: node scripts/optimize-images.mjs
 * 
 * Después de ejecutar, el markup de los HTML se actualiza
 * automáticamente con <picture>/<srcset> vía patch-images-markup.mjs
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const INPUT_DIRS = [
    join(PROJECT_ROOT, 'assets'),
    join(PROJECT_ROOT, 'assets', 'gallery'),
];

const OUTPUT_BASE = join(PROJECT_ROOT, 'assets', 'optimized');

// Variantes de ancho a generar
const WIDTHS = [480, 800, 1200];

// Calidad por formato
const QUALITY = {
    webp: 82,
    avif: 65,  // AVIF puede tener calidad más baja con igual visual quality
    jpg:  85,
    png:  9,   // Nivel de compresión PNG (0-9)
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function findImages(dir, recursive = false) {
    const images = [];
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isFile()) {
                const ext = extname(entry.name).toLowerCase();
                if (IMAGE_EXTENSIONS.includes(ext)) {
                    images.push(fullPath);
                }
            } else if (entry.isDirectory() && recursive) {
                const subImages = await findImages(fullPath, true);
                images.push(...subImages);
            }
        }
    } catch (err) {
        console.warn(`  ⚠️  No se pudo leer: ${dir} — ${err.message}`);
    }
    return images;
}

async function optimizeImage(inputPath) {
    const ext = extname(inputPath).toLowerCase();
    const nameWithoutExt = basename(inputPath, ext);
    
    // Determinar subdirectorio de salida manteniendo la estructura
    let relDir = '';
    if (inputPath.includes('/gallery/')) {
        relDir = 'gallery';
    }
    
    const outputDir = join(OUTPUT_BASE, relDir, nameWithoutExt);
    
    if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
    }

    // Obtener dimensiones originales
    let metadata;
    try {
        metadata = await sharp(inputPath).metadata();
    } catch (err) {
        console.error(`  ❌ Error leyendo ${basename(inputPath)}: ${err.message}`);
        return null;
    }
    
    const originalWidth = metadata.width || 800;
    const isJpeg = ['.jpg', '.jpeg'].includes(ext);
    const results = [];

    for (const width of WIDTHS) {
        // No upscale: si el ancho pedido es mayor al original, saltamos
        if (width > originalWidth * 1.1) {
            continue;
        }

        const resizeOpts = {
            width,
            withoutEnlargement: true,
            fit: 'inside',
        };

        try {
            // WebP
            const webpPath = join(outputDir, `${width}w.webp`);
            if (!existsSync(webpPath)) {
                await sharp(inputPath)
                    .resize(resizeOpts)
                    .webp({ quality: QUALITY.webp, effort: 4 })
                    .toFile(webpPath);
            }

            // AVIF
            const avifPath = join(outputDir, `${width}w.avif`);
            if (!existsSync(avifPath)) {
                await sharp(inputPath)
                    .resize(resizeOpts)
                    .avif({ quality: QUALITY.avif, effort: 4 })
                    .toFile(avifPath);
            }

            // Fallback JPG o PNG
            const fallbackExt = isJpeg ? '.jpg' : '.png';
            const fallbackPath = join(outputDir, `${width}w${fallbackExt}`);
            if (!existsSync(fallbackPath)) {
                const pipeline = sharp(inputPath).resize(resizeOpts);
                if (isJpeg) {
                    await pipeline.jpeg({ quality: QUALITY.jpg, progressive: true }).toFile(fallbackPath);
                } else {
                    await pipeline.png({ compressionLevel: QUALITY.png, progressive: true }).toFile(fallbackPath);
                }
            }

            results.push(width);
        } catch (err) {
            console.error(`  ❌ Error generando ${width}w para ${basename(inputPath)}: ${err.message}`);
        }
    }

    return {
        original: inputPath,
        outputDir,
        nameWithoutExt,
        ext,
        isJpeg,
        widths: results,
    };
}

async function generateMarkupSnippet(result) {
    if (!result) return null;
    
    const { nameWithoutExt, ext, isJpeg, widths, outputDir } = result;
    
    // Calcular ruta relativa desde el HTML (que está en la raíz del proyecto)
    const relBase = outputDir.replace(PROJECT_ROOT + '/', '');
    
    const srcsetWebp = widths.map(w => `${relBase}/${w}w.webp ${w}w`).join(', ');
    const srcsetAvif = widths.map(w => `${relBase}/${w}w.avif ${w}w`).join(', ');
    const srcsetFallback = widths.map(w => `${relBase}/${w}w${isJpeg ? '.jpg' : '.png'} ${w}w`).join(', ');
    const fallbackSrc = `${relBase}/${widths[Math.floor(widths.length / 2)] || widths[0]}w${isJpeg ? '.jpg' : '.png'}`;
    
    return {
        nameWithoutExt,
        originalSrc: result.original.replace(PROJECT_ROOT + '/', ''),
        picture: `<picture>
  <source type="image/avif" srcset="${srcsetAvif}" sizes="(max-width: 480px) 480px, (max-width: 800px) 800px, 1200px">
  <source type="image/webp" srcset="${srcsetWebp}" sizes="(max-width: 480px) 480px, (max-width: 800px) 800px, 1200px">
  <img src="${fallbackSrc}" srcset="${srcsetFallback}" sizes="(max-width: 480px) 480px, (max-width: 800px) 800px, 1200px" loading="lazy" decoding="async" alt="">
</picture>`,
    };
}

async function main() {
    console.log('🖼️  Optimización de imágenes — Torrealba Joyas (Fase 3)');
    console.log('='.repeat(55));
    console.log('Generando variantes WebP + AVIF en 480w / 800w / 1200w');
    console.log(`Salida: assets/optimized/\n`);

    // Encontrar todas las imágenes (sin subir a gallery por default — hacerlo separado)
    let allImages = [];
    
    // Assets raíz (excluye subdirs)
    const rootImages = await findImages(join(PROJECT_ROOT, 'assets'), false);
    allImages.push(...rootImages);
    
    // Gallery
    const galleryImages = await findImages(join(PROJECT_ROOT, 'assets', 'gallery'), false);
    allImages.push(...galleryImages);

    console.log(`Encontradas ${allImages.length} imágenes para optimizar\n`);

    const markupMap = {};
    let processed = 0;
    let errors = 0;

    for (const imgPath of allImages) {
        const name = basename(imgPath);
        process.stdout.write(`  📸 ${name}...`);
        
        try {
            const result = await optimizeImage(imgPath);
            if (result) {
                const snippet = await generateMarkupSnippet(result);
                if (snippet) markupMap[snippet.originalSrc] = snippet;
                processed++;
                console.log(` ✅ (${result.widths.join(', ')}w)`);
            }
        } catch (err) {
            errors++;
            console.log(` ❌ ${err.message}`);
        }
    }

    // Guardar el mapa de markup para usarlo en patch-images-markup.mjs
    const { writeFileSync } = await import('fs');
    const mapPath = join(__dirname, 'image-markup-map.json');
    writeFileSync(mapPath, JSON.stringify(markupMap, null, 2));

    console.log('\n' + '='.repeat(55));
    console.log(`✅ Procesadas: ${processed} / ${allImages.length}`);
    console.log(`❌ Errores:    ${errors}`);
    console.log(`📄 Mapa de markup guardado en: scripts/image-markup-map.json`);
    console.log('\nPróximo paso: node scripts/patch-images-markup.mjs');
}

main().catch(console.error);
