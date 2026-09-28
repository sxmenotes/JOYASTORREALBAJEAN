/**
 * optimize-videos.mjs — Fase 4: Pipeline de video con ffmpeg
 * 
 * Reemplaza compress_media.sh (avconvert, macOS-only) y optimize_video.py 
 * (hardcodeado a un solo archivo) con un pipeline multiplataforma usando ffmpeg.
 * 
 * Por cada video MP4 en assets/:
 * - Genera una versión MP4 (H.264, CRF) y WebM (VP9, CRF)
 * - Genera un poster JPG (frame estático extraído con ffmpeg)
 * - Usa presets distintos según el tipo de video:
 *     • "bg"      → videos de fondo/hero silenciosos (más agresivo)
 *     • "gallery" → videos de galería (silenciosos, decorativos)
 *     • "main"    → quien-soy video principal (con audio, contenido real)
 * 
 * Salida: assets/videos-optimized/{nombre}/
 *   - {nombre}.mp4     (H.264)
 *   - {nombre}.webm    (VP9)
 *   - {nombre}-poster.jpg
 * 
 * REQUISITO: ffmpeg debe estar instalado y en PATH.
 * macOS: brew install ffmpeg
 * Linux: apt install ffmpeg
 * Windows: https://ffmpeg.org/download.html
 * 
 * Run: node scripts/optimize-videos.mjs
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ─────────────────────────────────────────────────────────────
// Detectar ruta de ffmpeg (Homebrew en macOS no siempre está en PATH)
// Apple Silicon: /opt/homebrew/bin | Intel Mac: /usr/local/bin
// ─────────────────────────────────────────────────────────────
const FFMPEG = (() => {
    const candidates = [
        '/opt/homebrew/bin/ffmpeg',  // Homebrew Apple Silicon (M1/M2/M3)
        '/usr/local/bin/ffmpeg',     // Homebrew Intel Mac
        '/usr/bin/ffmpeg',           // Linux
    ];
    for (const p of candidates) {
        if (existsSync(p)) return p;
    }
    return 'ffmpeg'; // Fallback si está en PATH del sistema
})();


const INPUT_DIRS = {
    bg:      join(PROJECT_ROOT, 'assets'),        // videos de fondo/hero
    gallery: join(PROJECT_ROOT, 'assets', 'gallery'), // galería
};

const OUTPUT_BASE = join(PROJECT_ROOT, 'assets', 'videos-optimized');

// ─────────────────────────────────────────────────────────────
// Clasificación de videos por tipo (basada en sus nombres)
// ─────────────────────────────────────────────────────────────
const VIDEO_TYPES = {
    // Video principal de quien-soy — con audio, contenido real
    'quiensoy_video': 'main',
    
    // Videos de fondo/hero — silenciosos, decorativos
    'catalogo_bg':    'bg',
    'talleres_bg':    'bg',
    
    // Videos de galería en páginas — silenciosos
    'taller_intro_video':   'gallery',
    'taller_intro_video_2': 'gallery',
    'taller_intro_video_3': 'gallery',
    
    // Galería pública — silenciosos
    'gal_vid_1':  'gallery',
    'gal_vid_2':  'gallery',
    'gal_vid_3':  'gallery',
    'gal_vid_4':  'gallery',
    'gal_vid_5':  'gallery',
    'gal_vid_6':  'gallery',
    'gal_vid_7':  'gallery',
    'gal_vid_8':  'gallery',
};

// ─────────────────────────────────────────────────────────────
// Presets de codificación
// ─────────────────────────────────────────────────────────────
const PRESETS = {
    // Video de fondo/hero: máxima compresión, calidad visual suficiente
    bg: {
        mp4_crf:     28,
        mp4_preset:  'slow',
        webm_crf:    35,
        webm_speed:  2,
        scale:       1280, // px de ancho máximo
        strip_audio: true,
    },
    
    // Galería silenciosa: buena calidad, razonablemente comprimido
    gallery: {
        mp4_crf:     26,
        mp4_preset:  'medium',
        webm_crf:    32,
        webm_speed:  2,
        scale:       1280,
        strip_audio: true,
    },
    
    // Video principal con audio: calidad más alta, audio preservado
    main: {
        mp4_crf:     22,
        mp4_preset:  'medium',
        webm_crf:    28,
        webm_speed:  1,
        scale:       1280,
        strip_audio: false,
    },
};

function getVideoType(filename) {
    const nameWithoutExt = basename(filename, extname(filename));
    return VIDEO_TYPES[nameWithoutExt] || 'gallery'; // default: gallery
}

async function checkFfmpeg() {
    console.log(`🔍 Usando ffmpeg: ${FFMPEG}`);
    try {
        await execFileAsync(FFMPEG, ['-version']);
        return true;
    } catch {
        return false;
    }
}

async function generatePoster(inputPath, outputPath) {
    // Extrae el frame en t=00:00:01 (1 segundo) como poster JPG
    try {
        await execFileAsync(FFMPEG, [
            '-i', inputPath,
            '-ss', '00:00:01',
            '-vframes', '1',
            '-q:v', '3',
            '-y',
            outputPath,
        ]);
        return true;
    } catch {
        // Si 1 segundo falla (video muy corto), usar frame 0
        try {
            await execFileAsync(FFMPEG, [
                '-i', inputPath,
                '-vframes', '1',
                '-q:v', '3',
                '-y',
                outputPath,
            ]);
            return true;
        } catch (err) {
            console.error(`    ⚠️  Poster fallido: ${err.message}`);
            return false;
        }
    }
}

async function generateMP4(inputPath, outputPath, preset, type) {
    const args = [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-crf', String(preset.mp4_crf),
        '-preset', preset.mp4_preset,
        '-profile:v', 'high',
        '-level', '4.0',
        '-movflags', '+faststart',  // ESENCIAL para streaming web
        '-pix_fmt', 'yuv420p',      // Compatibilidad máxima
        '-vf', `scale='min(${preset.scale},iw)':'min(${preset.scale},ih)':force_original_aspect_ratio=decrease`,
    ];

    if (preset.strip_audio) {
        args.push('-an');           // Sin audio
    } else {
        args.push('-c:a', 'aac', '-b:a', '128k');
    }

    args.push('-y', outputPath);

    await execFileAsync(FFMPEG, args, { maxBuffer: 100 * 1024 * 1024 });
}

async function generateWebM(inputPath, outputPath, preset, type) {
    const args = [
        '-i', inputPath,
        '-c:v', 'libvpx-vp9',
        '-crf', String(preset.webm_crf),
        '-b:v', '0',               // CRF puro (sin bitrate target)
        '-cpu-used', String(preset.webm_speed),
        '-row-mt', '1',            // Multi-threading por fila
        '-vf', `scale='min(${preset.scale},iw)':'min(${preset.scale},ih)':force_original_aspect_ratio=decrease`,
    ];

    if (preset.strip_audio) {
        args.push('-an');
    } else {
        args.push('-c:a', 'libopus', '-b:a', '128k');
    }

    args.push('-y', outputPath);

    await execFileAsync(FFMPEG, args, { maxBuffer: 100 * 1024 * 1024, timeout: 300000 });
}

async function optimizeVideo(inputPath) {
    const name = basename(inputPath, extname(inputPath));
    const type = getVideoType(basename(inputPath));
    const preset = PRESETS[type];
    
    const outputDir = join(OUTPUT_BASE, name);
    if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
    }

    const mp4Path  = join(outputDir, `${name}.mp4`);
    const webmPath = join(outputDir, `${name}.webm`);
    const posterPath = join(outputDir, `${name}-poster.jpg`);

    console.log(`\n  📹 ${basename(inputPath)} → tipo: ${type} (CRF mp4=${preset.mp4_crf}, webm=${preset.webm_crf})`);

    // Poster
    if (!existsSync(posterPath)) {
        process.stdout.write('    🖼️  Poster...');
        const ok = await generatePoster(inputPath, posterPath);
        console.log(ok ? ' ✅' : ' ❌');
    } else {
        console.log('    ⏭️  Poster ya existe');
    }

    // MP4
    if (!existsSync(mp4Path)) {
        process.stdout.write('    📦 MP4 (H.264)...');
        try {
            await generateMP4(inputPath, mp4Path, preset, type);
            console.log(' ✅');
        } catch (err) {
            console.log(` ❌ ${err.message.substring(0, 100)}`);
        }
    } else {
        console.log('    ⏭️  MP4 ya existe');
    }

    // WebM
    if (!existsSync(webmPath)) {
        process.stdout.write('    🎬 WebM (VP9)...');
        try {
            await generateWebM(inputPath, webmPath, preset, type);
            console.log(' ✅');
        } catch (err) {
            console.log(` ❌ ${err.message.substring(0, 100)}`);
        }
    } else {
        console.log('    ⏭️  WebM ya existe');
    }

    return { name, type, outputDir, mp4Path, webmPath, posterPath };
}

async function findVideos(dir) {
    const videos = [];
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && extname(entry.name).toLowerCase() === '.mp4') {
                videos.push(join(dir, entry.name));
            }
        }
    } catch {}
    return videos;
}

async function main() {
    console.log('🎬 Optimización de videos — Torrealba Joyas (Fase 4)');
    console.log('='.repeat(55));

    // Verificar ffmpeg
    const hasFfmpeg = await checkFfmpeg();
    if (!hasFfmpeg) {
        console.error('\n❌ ffmpeg no encontrado en PATH.');
        console.error('   macOS: brew install ffmpeg');
        console.error('   Linux: sudo apt install ffmpeg');
        console.error('   Windows: https://ffmpeg.org/download.html');
        process.exit(1);
    }
    console.log('✅ ffmpeg encontrado\n');

    // Recolectar videos de ambas fuentes
    const bgVideos = await findVideos(join(PROJECT_ROOT, 'assets'));
    const galleryVideos = await findVideos(join(PROJECT_ROOT, 'assets', 'gallery'));
    
    const allVideos = [...bgVideos, ...galleryVideos];
    console.log(`Encontrados ${allVideos.length} videos:\n`);
    allVideos.forEach(v => {
        const type = getVideoType(basename(v));
        console.log(`  • ${basename(v).padEnd(35)} [${type}]`);
    });

    // Confirmar antes de procesar (puede tardar mucho)
    console.log('\n⚠️  Este proceso puede tardar varios minutos por video.');
    console.log('   Los videos ya procesados se saltarán automáticamente.\n');

    if (!existsSync(OUTPUT_BASE)) {
        await mkdir(OUTPUT_BASE, { recursive: true });
    }

    let processed = 0;
    let errors = 0;

    for (const videoPath of allVideos) {
        try {
            await optimizeVideo(videoPath);
            processed++;
        } catch (err) {
            errors++;
            console.error(`\n  ❌ Error procesando ${basename(videoPath)}: ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(55));
    console.log(`✅ Videos procesados: ${processed}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📁 Salida: assets/videos-optimized/`);
    console.log('\nPróximo paso: node scripts/patch-videos-markup.mjs');
}

main().catch(console.error);
