/**
 * galeria.js — Fase 5: Carga inteligente de galería
 * 
 * Reemplaza el <script src="js/gallery_data.js"> global por
 * fetch() bajo demanda según el tab activo.
 * 
 * - Al cargar la página: solo carga gallery-images.json (Fotos)
 * - Al hacer click en "Videos": carga gallery-videos.json (una sola vez)
 * - Cachea los datos en memoria para evitar re-fetches
 * 
 * Bonus Fase 5: respeta navigator.connection para no autoplay en 2G/slow
 * 
 * Este módulo depende de window._renderGallery y window._initGalleryTabs
 * expuestos por src/main.js.
 */

// ─────────────────────────────────────────────────────────────
// Cache en memoria para los datos de la galería
// ─────────────────────────────────────────────────────────────
const cache = {
    image: null,
    video: null,
};

// ─────────────────────────────────────────────────────────────
// Detección de conexión lenta (navigator.connection API)
// ─────────────────────────────────────────────────────────────
function isSlowConnection() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return false;
    
    // saveData: el usuario pidió explícitamente ahorrar datos
    if (conn.saveData) return true;
    
    // Conexiones 2G o slow-2g
    const slowTypes = ['2g', 'slow-2g'];
    return slowTypes.includes(conn.effectiveType);
}

// ─────────────────────────────────────────────────────────────
// Carga de datos por tipo con cache
// ─────────────────────────────────────────────────────────────
async function loadGalleryData(type) {
    if (cache[type]) return cache[type];
    
    const url = type === 'image' 
        ? '/gallery-images.json' 
        : '/gallery-videos.json';
    
    try {
        const res = await fetch(url, {
            // Cachear en browser por 1 hora
            headers: { 'Cache-Control': 'max-age=3600' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        cache[type] = data;
        return data;
    } catch (err) {
        console.error(`[Galería] Error cargando ${url}: ${err.message}`);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────
// Renderizado con conexión lenta detectada
// ─────────────────────────────────────────────────────────────
function renderWithConnectionAwareness(data, type, container) {
    const slow = isSlowConnection();
    
    if (slow) {
        console.log('[Galería] Conexión lenta detectada — modo ahorro de datos');
        // En conexión lenta: para videos, mostrar solo poster con botón play manual
        if (type === 'video') {
            data = data.map(item => ({ ...item, _slowMode: true }));
        }
    }
    
    // Llamar al renderer compartido de main.js
    if (window._renderGallery) {
        window._renderGallery(data, type);
    }
}

// ─────────────────────────────────────────────────────────────
// Inicialización de tabs con fetch bajo demanda
// ─────────────────────────────────────────────────────────────
async function initGalleryWithFetch() {
    const galleryMosaicContainer = document.getElementById('gallery-mosaic-container');
    if (!galleryMosaicContainer) return;
    
    const galleryTabs = document.querySelectorAll('#gallery-tabs button');
    const gallerySlider = document.getElementById('gallery-tab-slider');
    
    // ── 1. Cargar Fotos al inicio (tab activo por defecto) ──
    const initialData = await loadGalleryData('image');
    renderWithConnectionAwareness(initialData, 'image', galleryMosaicContainer);
    
    // ── 2. Inicializar el slider visual de tabs ──
    if (galleryTabs.length > 0 && gallerySlider) {
        const activeTab = document.querySelector('#gallery-tabs button.text-on-primary');
        if (activeTab) {
            gallerySlider.style.width = activeTab.offsetWidth + 'px';
            gallerySlider.style.transform = `translateX(${activeTab.offsetLeft - 4}px)`;
        }
        
        window.addEventListener('resize', () => {
            const cur = document.querySelector('#gallery-tabs button.text-on-primary');
            if (cur) {
                gallerySlider.style.width = cur.offsetWidth + 'px';
                gallerySlider.style.transform = `translateX(${cur.offsetLeft - 4}px)`;
            }
        });
    }
    
    // ── 3. Escuchar clicks en tabs ──
    galleryTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            const target = tab.getAttribute('data-target');
            if (tab.classList.contains('text-on-primary')) return;
            
            // Animar slider visual
            if (gallerySlider) {
                gallerySlider.style.width = tab.offsetWidth + 'px';
                gallerySlider.style.transform = `translateX(${tab.offsetLeft - 4}px)`;
            }
            
            // Cambiar clases activas
            galleryTabs.forEach(t => {
                t.classList.remove('text-on-primary');
                t.classList.add('text-on-surface');
            });
            tab.classList.remove('text-on-surface');
            tab.classList.add('text-on-primary');
            
            // Animación de salida
            galleryMosaicContainer.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-300');
            
            // Cargar datos del tab (fetch solo si no está en cache)
            const data = await loadGalleryData(target);
            
            // Pequeño delay para que la animación de salida se vea
            setTimeout(() => {
                renderWithConnectionAwareness(data, target, galleryMosaicContainer);
                galleryMosaicContainer.classList.remove('opacity-0', 'translate-y-4');
            }, 300);
        });
    });
}

// ─────────────────────────────────────────────────────────────
// Arrancar cuando el DOM esté listo
// ─────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryWithFetch);
} else {
    initGalleryWithFetch();
}
