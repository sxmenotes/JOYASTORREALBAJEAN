/**
 * src/main.js — Entrypoint de Vite para Torrealba Joyas
 * 
 * Importa el CSS principal (Tailwind + fuentes + estilos custom).
 * Importa la lógica de JS original (galería, lazy loading, etc.)
 * 
 * Este módulo ES es el único que necesita Vite para procesar
 * el árbol de dependencias de JS y CSS.
 */

// CSS principal (Tailwind real + fuentes self-hosted + custom styles)
import './main.css';

// ============================================================
// Lógica original de main.js — preservada íntegramente
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu?.querySelectorAll('a') || [];

    mobileBtn?.addEventListener('click', () => {
        const isMenuOpen = mobileMenu.classList.contains('opacity-100');
        
        if (isMenuOpen) {
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            mobileBtn.querySelector('span').textContent = 'menu';
            document.body.style.overflow = '';
        } else {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
            mobileBtn.querySelector('span').textContent = 'close';
            document.body.style.overflow = 'hidden';
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            mobileBtn.querySelector('span').textContent = 'menu';
            document.body.style.overflow = '';
        });
    });

    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Dynamic Word Changing Effect
    const dynamicWordEl = document.getElementById('dynamic-word');
    if (dynamicWordEl) {
        const words = [
            "Inolvidables", "Eternos", "Únicos", "Mágicos", "Perfectos",
            "Infinitos", "Sublimes", "Auténticos", "Brillantes", "Sinceros",
            "Preciosos", "Valiosos", "Compartidos", "Soñados", "Inmortales",
            "Románticos", "Apasionados", "Verdaderos", "Genuinos", "Extraordinarios"
        ];
        let currentWordIndex = 0;

        setInterval(() => {
            dynamicWordEl.classList.add('opacity-0');
            setTimeout(() => {
                currentWordIndex = (currentWordIndex + 1) % words.length;
                dynamicWordEl.textContent = words[currentWordIndex];
                dynamicWordEl.classList.remove('opacity-0');
            }, 300);
        }, 1500);
    }

    // --- Auto Slider de Imágenes ---
    const sliderObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const slider = entry.target;
            if (entry.isIntersecting) {
                if (!slider.dataset.intervalId) {
                    const imgs = slider.querySelectorAll("img");
                    if (imgs.length < 2) return;
                    const intervalTime = parseInt(slider.getAttribute("data-interval") || "2000");
                    const id = setInterval(() => {
                        let current = parseInt(slider.dataset.current || "0");
                        imgs[current].classList.replace("opacity-100", "opacity-0");
                        current = (current + 1) % imgs.length;
                        imgs[current].classList.replace("opacity-0", "opacity-100");
                        slider.dataset.current = current;
                    }, intervalTime);
                    slider.dataset.intervalId = id;
                }
            } else {
                if (slider.dataset.intervalId) {
                    clearInterval(slider.dataset.intervalId);
                    slider.dataset.intervalId = "";
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".auto-slider").forEach(slider => {
        slider.dataset.current = "0";
        sliderObserver.observe(slider);
    });

    // --- Video Auto Slider ---
    document.querySelectorAll(".video-slider").forEach(slider => {
        const vids = slider.querySelectorAll("video");
        if (vids.length < 2) return;
        let current = 0;
        
        vids[current].classList.remove("opacity-0");
        vids[current].classList.add("opacity-100");
        vids[current].play().catch(e => console.log("Autoplay prevent:", e));

        vids.forEach((vid, index) => {
            vid.addEventListener('ended', () => {
                vid.classList.replace("opacity-100", "opacity-0");
                current = (index + 1) % vids.length;
                const nextVid = vids[current];
                nextVid.classList.replace("opacity-0", "opacity-100");
                nextVid.currentTime = 0;
                nextVid.play().catch(e => console.log("Play prevent:", e));
            });
        });
    });

    // --- Pop-up Modal Workshop ---
    const wsModal = document.getElementById("workshop-modal");
    if (wsModal) {
        const wsOpenBtn = document.getElementById("open-workshop-btn");
        const wsCloseBtn = document.getElementById("close-workshop-modal");
        const wsOverlay = document.getElementById("workshop-modal-overlay");
        const wsForm = document.getElementById("workshop-form");

        function openWsModal() {
            wsModal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        }

        function closeWsModal() {
            wsModal.classList.add("hidden");
            document.body.style.overflow = "";
        }

        wsOpenBtn?.addEventListener("click", (e) => { e.preventDefault(); openWsModal(); });
        wsCloseBtn?.addEventListener("click", closeWsModal);
        wsOverlay?.addEventListener("click", closeWsModal);

        wsForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("ws-name").value.trim();
            const email = document.getElementById("ws-email").value.trim();
            const comments = document.getElementById("ws-comments").value.trim();
            const region = document.getElementById("ws-region").value;
            const city = document.getElementById("ws-city").value;
            const phone = "56950082045";
            let message = `¡Hola! Me gustaría solicitar información sobre las clases y talleres de orfebrería.%0A%0A`;
            message += `*Mis datos:*%0A`;
            message += `- Nombre: ${name}%0A`;
            message += `- Email: ${email}%0A`;
            message += `- Ubicación: ${city}, ${region}%0A%0A`;
            message += `*Lo que me gustaría aprender:*%0A${comments}`;
            window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
            closeWsModal();
        });
    }

    // --- Galeria Dinamica (Mosaic) con True Lazy Loading ---
    // gallery_data se carga por fetch() desde galeria-data.js (Fase 5)
    // Esta lógica usa el mediaObserver para lazy load real
    const galleryMosaicContainer = document.getElementById("gallery-mosaic-container");

    const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const wrapper = entry.target;
            const type = wrapper.getAttribute("data-type");
            const src = wrapper.getAttribute("data-src");

            if (entry.isIntersecting) {
                if (!wrapper.dataset.loaded) {
                    if (type === 'image') {
                        const img = wrapper.querySelector('img');
                        if (img) img.src = src;
                    } else if (type === 'video') {
                        const video = wrapper.querySelector('video');
                        if (video) {
                            const canPlayWebm = !!(video.canPlayType && video.canPlayType('video/webm').replace(/no/, ''));
                            video.src = canPlayWebm ? src.replace(/\.mp4$/, '.webm') : src;
                            video.load();
                        }
                    }
                    wrapper.dataset.loaded = "true";
                }
                if (type === 'video') {
                    const video = wrapper.querySelector('video');
                    if (video && wrapper.dataset.loaded) video.play().catch(() => {});
                }
            } else {
                if (type === 'video') {
                    const video = wrapper.querySelector('video');
                    if (video) video.pause();
                }
            }
        });
    }, { rootMargin: "150px", threshold: 0.1 });

    if (galleryMosaicContainer) {
        // Gallery rendering — data will be injected by galeria.js via fetch (Fase 5)
        // Exposed globally so galeria.js can call it
        window._renderGallery = function renderGallery(galleryData, filterType) {
            galleryMosaicContainer.innerHTML = '';
            const filteredData = galleryData.filter(item => item.type === filterType);

            filteredData.forEach((item, index) => {
                let spanClasses = "";
                if (index % 9 === 0) spanClasses = "md:col-span-2 md:row-span-2";
                else if (index % 7 === 0) spanClasses = "md:row-span-2";
                else if (index % 11 === 0) spanClasses = "md:col-span-2";

                const wrapper = document.createElement("div");
                wrapper.className = `bg-surface-dim rounded-2xl overflow-hidden cursor-pointer group relative border border-secondary/30 lightbox-trigger ${spanClasses}`;
                wrapper.setAttribute("data-type", item.type);
                wrapper.setAttribute("data-src", item.src);

                if (item.type === 'image') {
                    const imgName = item.src.split('/').pop().replace(/\.[^.]+$/, '');
                    const optBase = `assets/optimized/gallery/${imgName}`;
                    wrapper.setAttribute("data-src", `${optBase}/800w.jpg`);
                    wrapper.innerHTML = `
                        <picture class="w-full h-full">
                            <source type="image/avif" srcset="${optBase}/480w.avif 480w, ${optBase}/800w.avif 800w" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
                            <source type="image/webp" srcset="${optBase}/480w.webp 480w, ${optBase}/800w.webp 800w" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
                            <img src="${optBase}/800w.jpg" srcset="${optBase}/480w.jpg 480w, ${optBase}/800w.jpg 800w" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" alt="Joya Torrealba" loading="lazy" decoding="async" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 pointer-events-none">
                        </picture>
                        <div class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span class="material-symbols-outlined text-surface text-4xl">zoom_in</span>
                        </div>
                    `;
                } else {
                    const vidName = item.src.split('/').pop().replace(/\.[^.]+$/, '');
                    const optBase = `assets/videos-optimized/${vidName}`;
                    wrapper.setAttribute("data-src", `${optBase}/${vidName}.mp4`);
                    wrapper.innerHTML = `
                        <video data-src="${optBase}/${vidName}.mp4" poster="${optBase}/${vidName}-poster.jpg" preload="none" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 pointer-events-none" loop muted playsinline></video>
                        <div class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span class="material-symbols-outlined text-surface text-4xl">play_circle</span>
                        </div>
                    `;
                }

                galleryMosaicContainer.appendChild(wrapper);
                mediaObserver.observe(wrapper);
            });
        };

        // Gallery Tabs Logic (shared, called from galeria.js after data loads)
        window._initGalleryTabs = function(galleryData) {
            const galleryTabs = document.querySelectorAll("#gallery-tabs button");
            const gallerySlider = document.getElementById("gallery-tab-slider");

            if (galleryTabs.length > 0 && gallerySlider) {
                const activeTab = document.querySelector("#gallery-tabs button.text-on-primary");
                if (activeTab) {
                    gallerySlider.style.width = activeTab.offsetWidth + "px";
                    gallerySlider.style.transform = `translateX(${activeTab.offsetLeft - 4}px)`;
                }

                window.addEventListener('resize', () => {
                    const cur = document.querySelector("#gallery-tabs button.text-on-primary");
                    if (cur) {
                        gallerySlider.style.width = cur.offsetWidth + "px";
                        gallerySlider.style.transform = `translateX(${cur.offsetLeft - 4}px)`;
                    }
                });

                galleryTabs.forEach(tab => {
                    tab.addEventListener("click", () => {
                        const target = tab.getAttribute("data-target");
                        if (tab.classList.contains("text-on-primary")) return;

                        gallerySlider.style.width = tab.offsetWidth + "px";
                        gallerySlider.style.transform = `translateX(${tab.offsetLeft - 4}px)`;

                        galleryTabs.forEach(t => {
                            t.classList.remove("text-on-primary");
                            t.classList.add("text-on-surface");
                        });
                        tab.classList.remove("text-on-surface");
                        tab.classList.add("text-on-primary");

                        galleryMosaicContainer.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-300");
                        setTimeout(() => {
                            window._renderGallery(galleryData, target);
                            galleryMosaicContainer.classList.remove("opacity-0", "translate-y-4");
                        }, 300);
                    });
                });
            }
        };
    }

    // --- Lightbox Galería ---
    const lightboxModal = document.getElementById("lightbox-modal");
    if (lightboxModal) {
        const lightboxContainer = document.getElementById("lightbox-content-container");
        const lightboxCloseBtn = document.getElementById("lightbox-close");

        function openLightbox(type, src) {
            lightboxContainer.innerHTML = '';
            if (type === 'image') {
                const img = document.createElement('img');
                img.src = src;
                img.className = 'max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl';
                lightboxContainer.appendChild(img);
            } else if (type === 'video') {
                const video = document.createElement('video');
                video.src = src;
                video.className = 'max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl';
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                lightboxContainer.appendChild(video);
            }
            lightboxModal.classList.remove("hidden");
            setTimeout(() => {
                lightboxModal.classList.remove("opacity-0");
                lightboxModal.classList.add("opacity-100");
            }, 10);
            document.body.style.overflow = "hidden";
        }

        function closeLightbox() {
            lightboxModal.classList.remove("opacity-100");
            lightboxModal.classList.add("opacity-0");
            setTimeout(() => {
                lightboxModal.classList.add("hidden");
                lightboxContainer.innerHTML = '';
                document.body.style.overflow = "";
            }, 300);
        }

        if (galleryMosaicContainer) {
            galleryMosaicContainer.addEventListener("click", (e) => {
                const trigger = e.target.closest(".lightbox-trigger");
                if (trigger) {
                    openLightbox(trigger.getAttribute("data-type"), trigger.getAttribute("data-src"));
                }
            });
        }

        lightboxCloseBtn?.addEventListener("click", closeLightbox);
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal || e.target === lightboxContainer) closeLightbox();
        });
    }

    // --- Universal Lazy Loading para Videos de Alto Rendimiento ---
    // (Preservado íntegramente — lógica de lazy-video con data-src)
    const lazyVideos = document.querySelectorAll('video.lazy-video, video[data-src]');
    if (lazyVideos.length > 0) {
        const lazyVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (video.dataset.src && (!video.currentSrc || video.currentSrc === '')) {
                        const canPlayWebm = !!(video.canPlayType && video.canPlayType('video/webm').replace(/no/, ''));
                        const webmCandidate = video.dataset.src.replace(/\.mp4$/, '.webm');
                        video.src = canPlayWebm ? webmCandidate : video.dataset.src;
                        video.load();
                    }
                    video.play().catch(() => {});
                } else {
                    if (!video.paused) video.pause();
                }
            });
        }, { rootMargin: "300px 0px", threshold: 0.05 });

        lazyVideos.forEach(vid => lazyVideoObserver.observe(vid));
    }
});
