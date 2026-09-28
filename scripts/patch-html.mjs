/**
 * patch-html.mjs
 * 
 * Patches all 6 HTML files in the Vite project to:
 * 1. Remove CDN Tailwind script tag
 * 2. Remove all Google Fonts <link> tags (will be self-hosted)
 * 3. Remove the inline <script id="tailwind-config"> block (now in tailwind.config.js)
 * 4. Replace css/styles.css link with the new Vite entrypoint src/main.css
 * 5. Move JS scripts from bottom of body to type="module" imports (Vite-compatible)
 * 
 * Run: node scripts/patch-html.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const HTML_FILES = [
  'index.html',
  'catalogo.html',
  'orfebreria.html',
  'galeria.html',
  'quien-soy.html',
  'contacto.html',
];

// The new CSS link (Vite will process this)
const CSS_LINK = `    <link rel="stylesheet" href="/src/main.css">`;

// Material Symbols self-hosted link (we'll keep this as inline CSS via @font-face in main.css)
// The class usage in HTML still works because the font is declared in main.css

function patchHTML(filename) {
  const filepath = join(ROOT, filename);
  let content = readFileSync(filepath, 'utf-8');
  const original = content;

  // 1. Remove CDN Tailwind script tag (both with and without plugins param)
  content = content.replace(
    /<script\s+src="https:\/\/cdn\.tailwindcss\.com[^"]*"\s*><\/script>\s*\n?/g,
    ''
  );

  // 2. Remove all Google Fonts preconnect links
  content = content.replace(
    /<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"[^>]*>\s*\n?/g,
    ''
  );
  content = content.replace(
    /<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*\n?/g,
    ''
  );

  // 3. Remove Google Fonts stylesheet links (all variations)
  content = content.replace(
    /<link\s+href="https:\/\/fonts\.googleapis\.com[^"]*"\s+rel="stylesheet"\s*\/?>\s*\n?/g,
    ''
  );
  content = content.replace(
    /<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com[^"]*"\s*\/?>\s*\n?/g,
    ''
  );

  // 4. Remove Material Symbols link (now self-hosted via @font-face in main.css)
  content = content.replace(
    /<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols[^"]*"\s+rel="stylesheet"\s*\/?>\s*\n?/g,
    ''
  );

  // 5. Remove the inline tailwind.config script block
  // Handles both <script id="tailwind-config"> and <script id=\"tailwind-config\"> variations
  content = content.replace(
    /<script\s+id="tailwind-config"[^>]*>[\s\S]*?<\/script>\s*\n?/g,
    ''
  );

  // 6. Replace css/styles.css link with new Vite entrypoint
  content = content.replace(
    /<link\s+rel="stylesheet"\s+href="css\/styles\.css"\s*\/?>/g,
    CSS_LINK
  );

  // 7. Convert gallery_data.js script tag — it will be loaded dynamically in Fase 5
  //    For now: convert to type="module" and point to new JS path
  //    We'll keep main.js as a module import  
  content = content.replace(
    /<script\s+src="js\/main\.js"><\/script>/g,
    `<script type="module" src="/src/main.js"></script>`
  );

  // 8. Remove gallery_data.js global script (will be replaced with fetch in Fase 5)
  //    For now keep it but convert to module path
  content = content.replace(
    /<script\s+src="js\/gallery_data\.js"><\/script>/g,
    `<!-- gallery_data loaded dynamically by main.js (Fase 5) -->`
  );

  if (content !== original) {
    writeFileSync(filepath, content, 'utf-8');
    console.log(`✅ Patched: ${filename}`);
  } else {
    console.log(`⏭️  No changes: ${filename}`);
  }
}

console.log('🔧 Patching HTML files for Vite compatibility...\n');
HTML_FILES.forEach(patchHTML);
console.log('\n✅ Done! All HTML files patched.');
