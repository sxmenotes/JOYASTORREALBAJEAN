import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Multi-page app: 6 HTML entry points
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Enable minification and asset hashing
    minify: 'esbuild',
    cssMinify: true,
    // Don't inline assets (fonts, etc.) — we want @font-face URLs
    assetsInlineLimit: 0,
    // Increase chunk size warning to 1MB (media-heavy site)
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: {
        index:      resolve(__dirname, 'index.html'),
        catalogo:   resolve(__dirname, 'catalogo.html'),
        orfebreria: resolve(__dirname, 'orfebreria.html'),
        galeria:    resolve(__dirname, 'galeria.html'),
        quiensoy:   resolve(__dirname, 'quien-soy.html'),
        contacto:   resolve(__dirname, 'contacto.html'),
      },
      output: {
        // Hashed filenames for cache-busting
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(woff2?|ttf|eot|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(name)) {
            return 'css/[name]-[hash][extname]';
          }
          // Videos y otros assets grandes — preservar path original sin hash
          // (los videos se sirven desde la carpeta assets/ ya procesados)
          if (/\.(mp4|webm|ogg|mov|avi)$/i.test(name)) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      // Tratar videos del HTML como externos (no bundlear contenido de video)
      // Vite los copia pero no los procesa
    },
  },
  // Project root is current directory
  root: '.',
  publicDir: 'public',
});

