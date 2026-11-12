/**
 * coleccion.js — "Hilo de Oro" · colección fotográfica (unificado PC + Móvil)
 *
 * Estructura en 3 actos (idéntica en PC y Móvil):
 *   I.   Apertura  → aro dorado animado con el título al centro y 6 fotos flotando alrededor;
 *                    al hacer scroll el aro se abre como portal y las fotos salen hacia los lados.
 *   II.  El Hilo   → galería horizontal pineada con hilo dorado curvo, capítulos editoriales
 *                    y marcos rectangulares/cuadrados a distintas alturas con parallax interno.
 *   III. Cierre    → CTA a contacto.
 *
 * Lightbox: zoom real (clic, rueda, pellizco, botones, arrastre para mover).
 */
import './coleccion.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/* ───────────────────────── Datos ───────────────────────── */
const modules = import.meta.glob('../assets/coleccion/*.{jpg,jpeg,png,webp,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
});
const sources = Object.keys(modules).sort().map((k) => modules[k]);

const PROTOTYPE_TARGET = 45; // solo se usa mientras haya < 40 fotos reales
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

function buildList() {
    if (sources.length >= 40) return sources.slice();
    const n = sources.length;
    const stride = [2, 3, 5, 7, 11].find((s) => gcd(s, n) === 1) || 1;
    return Array.from({ length: PROTOTYPE_TARGET }, (_, i) => sources[(i * stride) % n]);
}
const photos = buildList();
const TOTAL = photos.length;

const CHAPTERS = ['Destellos', 'Encuentro', 'Promesa', 'Ternura', 'Eternidad'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const PER_CHAPTER = Math.ceil(TOTAL / CHAPTERS.length);

/**
 * Composición horizontal para PC (w, h, y, ml) y Móvil (mw, mh, my, mml):
 * marcos rectangulares y cuadrados con diversas puntas y bordes.
 */
const LAYOUT = [
    { w: '24vw', h: '56vh', y: '-5vh',  mw: '62vw', mh: '44vh', my: '-4vh',  shape: 'rect', outline: true },
    { w: '19vw', h: '19vw', y: '14vh',  mw: '52vw', mh: '52vw', my: '12vh',  shape: 'square', rot: -2 },
    { w: '23vw', h: '48vh', y: '-10vh', mw: '60vw', mh: '40vh', my: '-9vh',  shape: 'leaf', outline: true },
    { w: '32vw', h: '58vh', y: '3vh',   mw: '70vw', mh: '46vh', my: '2vh',   shape: 'round' },
    { w: '20vw', h: '20vw', y: '-11vh', mw: '54vw', mh: '54vw', my: '-9vh',  shape: 'cut-corner', rot: 1.5, outline: true },
    { w: '26vw', h: '44vh', y: '10vh',  mw: '64vw', mh: '38vh', my: '9vh',   shape: 'arch' },
    { w: '18vw', h: '18vw', y: '-8vh',  mw: '50vw', mh: '50vw', my: '-7vh',  shape: 'leaf-alt', outline: true },
    { w: '22vw', h: '48vh', y: '11vh',  mw: '58vw', mh: '42vh', my: '10vh',  shape: 'rect', ml: '-2vw', mml: '-4vw', rot: -1.5 },
    { w: '21vw', h: '21vw', y: '-6vh',  mw: '52vw', mh: '52vw', my: '-6vh',  shape: 'round', ml: '-1.5vw', mml: '-3vw', outline: true },
    { w: '25vw', h: '52vh', y: '4vh',   mw: '62vw', mh: '44vh', my: '4vh',   shape: 'dome-bottom', rot: 1 },
];

const BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const pad = (n) => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ───────────────────────── Referencias ───────────────────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#col-stage');
const section = $('#col-thread');
const track = $('#col-track');
const svg = $('#col-svg');
const path = $('#col-path');
const bead = $('#col-bead');
const hudNow = $('#col-hud-now');
const hudChapter = $('#col-hud-chapter');
const hudFill = $('#col-hud-fill');

$('#col-hud-total').textContent = pad(TOTAL);
$('#col-count-text').textContent = TOTAL;

// Fotos del hero
$$('[data-hero]').forEach((img) => { img.src = sources[+img.dataset.hero % sources.length]; });

/* ───────────────────────── Construcción del DOM (con carga progresiva) ───────────────────────── */
const frag = document.createDocumentFragment();

photos.forEach((src, i) => {
    if (i % PER_CHAPTER === 0) {
        const c = Math.floor(i / PER_CHAPTER);
        const ch = document.createElement('div');
        ch.className = 'col-chapter';
        ch.innerHTML = `<span class="col-chapter__no">Capítulo ${ROMAN[c]}</span><span class="col-chapter__word">${CHAPTERS[c % CHAPTERS.length]}</span>`;
        frag.appendChild(ch);
    }
    const L = LAYOUT[i % LAYOUT.length];
    const eager = i < 6;
    const el = document.createElement('article');
    el.className = `col-piece col-piece--${L.shape}${L.outline ? ' col-piece--outline' : ''}`;
    el.style.cssText = `--w:${L.w};--h:${L.h};--y:${L.y};--ml:${L.ml || '0px'};--mw:${L.mw};--mh:${L.mh};--my:${L.my};--mml:${L.mml || '0px'}`;
    el.dataset.index = i;
    el.dataset.rot = L.rot || 0;
    el.dataset.chapter = `Capítulo ${ROMAN[Math.floor(i / PER_CHAPTER)]}`;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Ampliar foto ${i + 1} de ${TOTAL}`);
    el.innerHTML = `
        <span class="col-piece__no">Nº ${pad(i + 1)} <b>/ ${pad(TOTAL)}</b></span>
        <div class="col-piece__shape">
            <i class="col-piece__outline"></i>
            <div class="col-piece__fig"><img src="${eager ? src : BLANK_GIF}" ${eager ? '' : `data-src="${src}"`} alt="Argollas de matrimonio Torrealba Joyas — colección Hilo de Oro, foto ${i + 1}" loading="lazy" decoding="async"></div>
        </div>`;
    frag.appendChild(el);
});
track.appendChild(frag);

const pieces = $$('.col-piece', track);
const pieceImgs = pieces.map((p) => $('img', p));

// Hidratar imágenes diferidas en lotes pequeños durante tiempos libres del navegador
const deferredImgs = pieceImgs.filter((img) => img.dataset.src);
function hydrateNextBatch() {
    const batch = deferredImgs.splice(0, 8);
    batch.forEach((img) => {
        img.src = img.dataset.src;
        delete img.dataset.src;
    });
    if (deferredImgs.length) {
        if ('requestIdleCallback' in window) window.requestIdleCallback(hydrateNextBatch, { timeout: 600 });
        else setTimeout(hydrateNextBatch, 120);
    }
}
if (deferredImgs.length) setTimeout(hydrateNextBatch, 300);

/* ───────────────────────── Utilidades ───────────────────────── */
function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-hidden', 'true');
    return [...text].map((ch) => {
        const s = document.createElement('span');
        s.className = 'col-char';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(s);
        return s;
    });
}
const chars = $$('[data-split]').flatMap(splitChars);

/* ───────────────────────── Lightbox con zoom ───────────────────────── */
const lb = $('#col-lightbox');
const lbStage = $('#col-lb-stage');
const lbImg = $('#col-lb-img');
const lbCap = $('#col-lb-cap');
let lbIndex = -1;

const MAX_ZOOM = 4;
const CLICK_ZOOM = 2.5;
let z = { s: 1, x: 0, y: 0 };

function clampPan(s, x, y) {
    const mx = Math.max(0, (lbImg.offsetWidth * s - window.innerWidth) / 2);
    const my = Math.max(0, (lbImg.offsetHeight * s - window.innerHeight) / 2);
    return { x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
}
function applyZoom(s, x, y, animate = true) {
    s = clamp(s, 1, MAX_ZOOM);
    if (s <= 1.001) { s = 1; x = 0; y = 0; } else ({ x, y } = clampPan(s, x, y));
    z = { s, x, y };
    lb.classList.toggle('is-zoomed', s > 1);
    gsap.to(lbImg, { x, y, scale: s, duration: animate ? 0.38 : 0.06, ease: 'power3.out', overwrite: true });
}
function zoomAt(newS, cx, cy, animate = true) {
    newS = clamp(newS, 1, MAX_ZOOM);
    const px = cx - window.innerWidth / 2;
    const py = cy - window.innerHeight / 2;
    const k = newS / z.s;
    applyZoom(newS, px - (px - z.x) * k, py - (py - z.y) * k, animate);
}
const resetZoom = (animate = false) => {
    z = { s: 1, x: 0, y: 0 };
    lb.classList.remove('is-zoomed');
    gsap.to(lbImg, { x: 0, y: 0, scale: 1, duration: animate ? 0.35 : 0, overwrite: true });
};

function lbSet(i) {
    lbIndex = (i + TOTAL) % TOTAL;
    lbImg.src = photos[lbIndex];
    lbImg.alt = `Foto ${lbIndex + 1} de ${TOTAL}`;
    lbCap.textContent = `Nº ${pad(lbIndex + 1)} / ${pad(TOTAL)}`;
}

async function lbOpen(i, fromEl) {
    lbSet(i);
    resetZoom();
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    gsap.set(lb, { visibility: 'visible' });
    gsap.to(lb, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    try { await lbImg.decode(); } catch (_) { /* noop */ }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fromEl && !reduce) {
        const a = fromEl.getBoundingClientRect();
        const b = lbImg.getBoundingClientRect();
        if (b.width > 0) {
            gsap.fromTo(lbImg,
                { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: a.width / b.width },
                { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power4.out' });
            return;
        }
    }
    gsap.fromTo(lbImg, { opacity: 0 }, { opacity: 1, duration: 0.35 });
}

function lbClose() {
    if (lbIndex < 0) return;
    lbIndex = -1;
    gsap.to(lb, {
        opacity: 0, duration: 0.28, ease: 'power2.in',
        onComplete: () => {
            gsap.set(lb, { visibility: 'hidden' });
            lb.setAttribute('aria-hidden', 'true');
            lb.classList.remove('is-zoomed', 'is-dragging');
            document.body.style.overflow = '';
        },
    });
}

function lbStep(dir) {
    if (lbIndex < 0) return;
    gsap.to(lbImg, {
        x: -36 * dir, opacity: 0, duration: 0.2, ease: 'power2.in', overwrite: true,
        onComplete: async () => {
            lbSet(lbIndex + dir);
            z = { s: 1, x: 0, y: 0 };
            lb.classList.remove('is-zoomed');
            try { await lbImg.decode(); } catch (_) { /* noop */ }
            gsap.fromTo(lbImg, { x: 36 * dir, opacity: 0, scale: 1 }, { x: 0, opacity: 1, duration: 0.38, ease: 'power3.out' });
        },
    });
}

pieces.forEach((p, idx) => {
    const open = () => lbOpen(idx, pieceImgs[idx]);
    p.addEventListener('click', open);
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});

/* Punteros: arrastrar para mover, pellizcar para zoom, clic para alternar */
const ptrs = new Map();
let drag = null;
let lastPinch = 0;
const centerOf = () => {
    const a = [...ptrs.values()];
    return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) };
};

lbStage.addEventListener('pointerdown', (e) => {
    lbStage.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) drag = { sx: e.clientX, sy: e.clientY, ox: z.x, oy: z.y, moved: false, onImg: e.target === lbImg };
    if (ptrs.size === 2) { lastPinch = centerOf().d; if (drag) drag.moved = true; }
});
lbStage.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) {
        const c = centerOf();
        if (lastPinch > 0) zoomAt(z.s * (c.d / lastPinch), c.x, c.y, false);
        lastPinch = c.d;
    } else if (drag) {
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (Math.hypot(dx, dy) > 5) drag.moved = true;
        if (drag.moved && z.s > 1) {
            lb.classList.add('is-dragging');
            applyZoom(z.s, drag.ox + dx, drag.oy + dy, false);
        }
    }
});
const endPtr = (e) => {
    ptrs.delete(e.pointerId);
    lastPinch = 0;
    lb.classList.remove('is-dragging');
    if (ptrs.size === 0 && drag) {
        if (!drag.moved) {
            if (!drag.onImg) lbClose();
            else if (z.s > 1) applyZoom(1, 0, 0);
            else zoomAt(CLICK_ZOOM, e.clientX, e.clientY);
        }
        drag = null;
    }
};
lbStage.addEventListener('pointerup', endPtr);
lbStage.addEventListener('pointercancel', endPtr);
lb.addEventListener('wheel', (e) => {
    if (lbIndex < 0) return;
    e.preventDefault();
    zoomAt(z.s * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY, false);
}, { passive: false });

const mid = () => [window.innerWidth / 2, window.innerHeight / 2];
$('#col-lb-zin').addEventListener('click', () => zoomAt(z.s * 1.6, ...mid()));
$('#col-lb-zout').addEventListener('click', () => zoomAt(z.s / 1.6, ...mid()));
$('#col-lb-close').addEventListener('click', lbClose);
$('#col-lb-prev').addEventListener('click', () => lbStep(-1));
$('#col-lb-next').addEventListener('click', () => lbStep(1));
window.addEventListener('keydown', (e) => {
    if (lbIndex < 0) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowRight') lbStep(1);
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === '+' || e.key === '=') zoomAt(z.s * 1.6, ...mid());
    if (e.key === '-') zoomAt(z.s / 1.6, ...mid());
    if (e.key === '0') applyZoom(1, 0, 0);
});

/* ───────────────────────── Animaciones unificadas (PC + Móvil) ───────────────────────── */
const mm = gsap.matchMedia();

mm.add(
    {
        desk: '(min-width: 768px)',
        mob: '(max-width: 767px)',
        reduce: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
        const { desk, reduce } = ctx.conditions;

        const frames = $$('.col-frame');
        const frameIns = frames.map((f) => $('.col-frame__in', f));

        if (reduce) {
            gsap.set('.col-spark', { opacity: 0.7 });
            return;
        }

        /* ── Acto I · intro (idéntica en PC y Móvil) ── */
        const circA = $('#col-ring-a');
        const circB = $('#col-ring-b');
        const lenA = 2 * Math.PI * 92;
        gsap.set(circA, { strokeDasharray: lenA, strokeDashoffset: lenA });
        gsap.set(circB, { strokeDasharray: '1 9', opacity: 0 });

        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
            .to(circA, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0)
            .to(circB, { opacity: 0.8, duration: 1 }, 0.8)
            .fromTo('.col-hero__kicker', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.1)
            .from(chars, { yPercent: 115, duration: 1.05, stagger: 0.055, ease: 'power4.out' }, 0.18)
            .fromTo(frameIns,
                { opacity: 0, y: 40, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 1.15, stagger: 0.08 }, 0.25)
            .fromTo('.col-hero__script', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.85)
            .fromTo('.col-hero__scroll', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.1)
            .add(() => {
                frames.forEach((f, i) => {
                    gsap.to($('.col-frame__fig', f), {
                        y: i % 2 ? -8 : 8,
                        duration: 2.8 + i * 0.35,
                        yoyo: true,
                        repeat: -1,
                        ease: 'sine.inOut',
                    });
                });
            }, 1.2);

        gsap.to(circB, { rotation: -360, svgOrigin: '100 100', duration: 90, repeat: -1, ease: 'none' });
        gsap.utils.toArray('.col-spark').forEach((sp, i) => {
            gsap.fromTo(sp, { opacity: 0, scale: 0.4, rotation: 0 },
                { opacity: 0.95, scale: 1, rotation: 90, duration: 1.6 + i * 0.25, delay: 0.6 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut', repeatDelay: 0.3 });
        });

        /* ── Acto I → Acto II: Portal + Galería horizontal con hilo dorado (PC y Móvil) ── */
        stage.classList.add('col-combined');
        section.classList.add('col-horizontal');

        const vw = () => window.innerWidth;
        const heroLen = () => window.innerHeight * (desk ? 1.15 : 0.95);
        const maxX = () => Math.max(0, track.scrollWidth - vw());
        const scrollLen = () => maxX() * (desk ? 0.62 : 0.55);

        pieces.forEach((p) => {
            const rot = +p.dataset.rot;
            if (rot) p.style.transform = `rotate(${rot}deg)`;
        });

        const master = ScrollTrigger.create({
            trigger: stage,
            start: 'top top',
            end: () => '+=' + (heroLen() + scrollLen()),
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        });

        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: stage,
                start: 'top top',
                end: () => '+=' + heroLen(),
                scrub: 0.5,
            },
        });
        heroTl
            .to('.col-hero__ring', { scale: 2.3, opacity: 0, ease: 'power2.in', duration: 1 }, 0)
            .to('#col-center', { scale: 1.25, opacity: 0, ease: 'power2.in', duration: 0.7 }, 0)
            .to('.col-hero__ui', { opacity: 0, duration: 0.25 }, 0)
            .to('.col-hero__sparks', { opacity: 0, duration: 0.5 }, 0);

        frames.forEach((f, i) => {
            const side = +f.dataset.side;
            heroTl.to(f, {
                x: `${side * (34 + (i % 3) * 8)}vw`,
                y: `${(i % 2 ? 1 : -1) * (8 + (i % 3) * 4)}vh`,
                rotation: side * (5 + (i % 3) * 2),
                scale: 1.12,
                opacity: 0,
                ease: 'power2.in',
                duration: 0.95,
            }, 0);
        });

        heroTl.fromTo(section, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.4 }, 0.55);

        // Tabla pre-muestreada del hilo dorado (evita getPointAtLength en cada frame de scroll)
        const SAMPLES = 400;
        const lutX = new Float32Array(SAMPLES + 1);
        const lutY = new Float32Array(SAMPLES + 1);
        let trackW = 1;
        let centers = [];

        const buildThread = () => {
            const H = track.clientHeight;
            trackW = track.scrollWidth;
            svg.setAttribute('width', trackW);
            svg.setAttribute('height', H);

            const nodes = $$('.col-piece, .col-chapter', track);
            const pts = [{ x: 0, y: H * 0.5 }];
            let k = 0;
            nodes.forEach((n) => {
                const isPiece = n.classList.contains('col-piece');
                const cx = n.offsetLeft + n.offsetWidth / 2;
                const cy = n.offsetTop + n.offsetHeight / 2;
                pts.push({ x: cx, y: isPiece ? cy + (k++ % 2 ? -1 : 1) * H * 0.1 : H * 0.5 });
            });
            pts.push({ x: trackW, y: H * 0.5 });

            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 1; i < pts.length; i++) {
                const a = pts[i - 1];
                const b = pts[i];
                const mx = (a.x + b.x) / 2;
                d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
            }
            path.setAttribute('d', d);
            path.style.strokeDasharray = '1';

            const totalLen = path.getTotalLength();
            for (let s = 0; s <= SAMPLES; s++) {
                const pt = path.getPointAtLength((s / SAMPLES) * totalLen);
                lutX[s] = pt.x;
                lutY[s] = pt.y;
            }
            centers = pieces.map((p) => p.offsetLeft + p.offsetWidth / 2);
        };
        buildThread();

        let lastIdx = -1;
        const onProgress = (p) => {
            const w = vw();
            const sx = p * maxX();
            const x = sx + w * 0.62;
            const frac = clamp(x / trackW, 0, 1);
            path.style.strokeDashoffset = String(1 - frac);

            const fIdx = frac * SAMPLES;
            const i0 = Math.min(SAMPLES - 1, fIdx | 0);
            const t = fIdx - i0;
            bead.setAttribute('cx', lutX[i0] + (lutX[i0 + 1] - lutX[i0]) * t);
            bead.setAttribute('cy', lutY[i0] + (lutY[i0 + 1] - lutY[i0]) * t);
            hudFill.style.transform = `scaleX(${p})`;

            // Parallax horizontal solo en las piezas visibles dentro del viewport
            const viewCenter = sx + w * 0.5;
            const span = w * 0.9;
            let idx = 0;
            for (let i = 0; i < centers.length; i++) {
                const c = centers[i];
                if (c <= viewCenter) idx = i;
                const diff = c - viewCenter;
                if (diff > -span && diff < span) {
                    const shift = (diff / span) * 8;
                    pieceImgs[i].style.transform = `translate3d(${shift.toFixed(2)}%, 0, 0)`;
                }
            }
            if (idx !== lastIdx) {
                lastIdx = idx;
                hudNow.textContent = pad(idx + 1);
                hudChapter.textContent = pieces[idx].dataset.chapter;
            }
        };

        gsap.to(track, {
            x: () => -maxX(),
            ease: 'none',
            scrollTrigger: {
                trigger: stage,
                start: () => master.start + heroLen(),
                end: () => master.start + heroLen() + scrollLen(),
                scrub: 0.45,
                invalidateOnRefresh: true,
                onRefresh: (self) => { buildThread(); onProgress(self.progress); },
                onUpdate: (self) => onProgress(self.progress),
            },
        });

        /* ── Acto III ── */
        gsap.from('[data-outro]', {
            y: 32, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: '#col-outro', start: 'top 78%' },
        });

        return () => {
            section.classList.remove('col-horizontal');
            stage.classList.remove('col-combined');
        };
    }
);

window.addEventListener('load', () => ScrollTrigger.refresh());
