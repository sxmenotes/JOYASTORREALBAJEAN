document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    mobileBtn.addEventListener('click', () => {
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

    // Header scroll effect removed (header is no longer fixed)

    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    };

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

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
            // Fade out
            dynamicWordEl.classList.add('opacity-0');

            setTimeout(() => {
                // Change text
                currentWordIndex = (currentWordIndex + 1) % words.length;
                dynamicWordEl.textContent = words[currentWordIndex];

                // Fade in
                dynamicWordEl.classList.remove('opacity-0');
            }, 300); // 300ms matches the duration-300 class
        }, 1500); // 1.5 seconds intervals
    }

    // --- Auto Slider de Imágenes ---
    const sliderObserverOptions = { threshold: 0.1 };
    const sliderObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const slider = entry.target;
            if (entry.isIntersecting) {
                // Iniciar rotación si no está corriendo
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
                // Detener rotación cuando no es visible
                if (slider.dataset.intervalId) {
                    clearInterval(slider.dataset.intervalId);
                    slider.dataset.intervalId = "";
                }
            }
        });
    }, sliderObserverOptions);

    document.querySelectorAll(".auto-slider").forEach(slider => {
        slider.dataset.current = "0";
        sliderObserver.observe(slider);
    });

    // --- Video Auto Slider ---
    document.querySelectorAll(".video-slider").forEach(slider => {
        const vids = slider.querySelectorAll("video");
        if (vids.length < 2) return;
        let current = 0;
        
        // Iniciar el primer video
        vids[current].classList.remove("opacity-0");
        vids[current].classList.add("opacity-100");
        vids[current].play().catch(e => console.log("Autoplay prevent:", e));

        vids.forEach((vid, index) => {
            vid.addEventListener('ended', () => {
                // Fade out current
                vid.classList.replace("opacity-100", "opacity-0");
                
                // Determinar el siguiente
                current = (index + 1) % vids.length;
                
                // Fade in next and play
                const nextVid = vids[current];
                nextVid.classList.replace("opacity-0", "opacity-100");
                
                // Reiniciar el video por si acaso ya se había reproducido antes
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

        wsOpenBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            openWsModal();
        });

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

            const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
            window.open(whatsappUrl, "_blank");
            closeWsModal();
        });
    }

    // --- Galeria Dinamica (Mosaic) con True Lazy Loading ---
    const galleryMosaicContainer = document.getElementById("gallery-mosaic-container");
    
    // Observer para inyectar src (red) y reproducir videos solo cuando son visibles
    const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const wrapper = entry.target;
            const type = wrapper.getAttribute("data-type");
            const src = wrapper.getAttribute("data-src");
            
            if (entry.isIntersecting) {
                // Si aún no se ha cargado el contenido en la red
                if (!wrapper.dataset.loaded) {
                    if (type === 'image') {
                        const img = wrapper.querySelector('img');
                        img.src = src; // El navegador pide la imagen AHORA
                    } else if (type === 'video') {
                        const video = wrapper.querySelector('video');
                        video.src = src; // El navegador pide el video AHORA
                        video.load();
                    }
                    wrapper.dataset.loaded = "true";
                }

                // Reproducir video si entra a pantalla
                if (type === 'video') {
                    const video = wrapper.querySelector('video');
                    if (video && wrapper.dataset.loaded) {
                        video.play().catch(() => {});
                    }
                }
            } else {
                // Pausar video si sale de pantalla para ahorrar recursos
                if (type === 'video') {
                    const video = wrapper.querySelector('video');
                    if (video) video.pause();
                }
            }
        });
    }, { rootMargin: "150px", threshold: 0.1 });

    if (galleryMosaicContainer && typeof galleryData !== 'undefined') {
        
        function renderGallery(filterType) {
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
                    wrapper.innerHTML = `
                        <img data-src="${item.src}" alt="Joya Torrealba" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 pointer-events-none">
                        <div class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span class="material-symbols-outlined text-surface text-4xl">zoom_in</span>
                        </div>
                    `;
                } else {
                    // preload="none" garantiza que no se descargue NADA de red por defecto
                    wrapper.innerHTML = `
                        <video data-src="${item.src}" preload="none" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 pointer-events-none" loop muted playsinline></video>
                        <div class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span class="material-symbols-outlined text-surface text-4xl">play_circle</span>
                        </div>
                    `;
                }
                
                galleryMosaicContainer.appendChild(wrapper);
                // Observamos todos los items para el true lazy load
                mediaObserver.observe(wrapper);
            });
        }

        // Initialize with images by default
        renderGallery('image');

        // --- Gallery Tabs Logic ---
        const galleryTabs = document.querySelectorAll("#gallery-tabs button");
        const gallerySlider = document.getElementById("gallery-tab-slider");
        
        if (galleryTabs.length > 0 && gallerySlider) {
            // Inicializar tamaño y posición del slider
            const activeTab = document.querySelector("#gallery-tabs button.text-on-primary");
            if (activeTab) {
                gallerySlider.style.width = activeTab.offsetWidth + "px";
                gallerySlider.style.transform = `translateX(${activeTab.offsetLeft - 4}px)`;
            }
            
            window.addEventListener('resize', () => {
                const currentActiveTab = document.querySelector("#gallery-tabs button.text-on-primary");
                if (currentActiveTab) {
                    gallerySlider.style.width = currentActiveTab.offsetWidth + "px";
                    gallerySlider.style.transform = `translateX(${currentActiveTab.offsetLeft - 4}px)`;
                }
            });
            
            galleryTabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    const target = tab.getAttribute("data-target");
                    if (tab.classList.contains("text-on-primary")) return;
                    
                    // Animar Slider
                    gallerySlider.style.width = tab.offsetWidth + "px";
                    gallerySlider.style.transform = `translateX(${tab.offsetLeft - 4}px)`;
                    
                    // Cambiar clases activas
                    galleryTabs.forEach(t => {
                        t.classList.remove("text-on-primary");
                        t.classList.add("text-on-surface");
                    });
                    tab.classList.remove("text-on-surface");
                    tab.classList.add("text-on-primary");
                    
                    // Renderizar nueva categoría con pequeña animación
                    galleryMosaicContainer.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-300");
                    
                    setTimeout(() => {
                        renderGallery(target);
                        galleryMosaicContainer.classList.remove("opacity-0", "translate-y-4");
                    }, 300);
                });
            });
        }
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
            // Pequeño delay para asegurar que la clase se aplique antes de animar opacidad
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
                lightboxContainer.innerHTML = ''; // Detiene el video
                document.body.style.overflow = "";
            }, 300);
        }

        // Event delegation for dynamically added triggers
        if (galleryMosaicContainer) {
            galleryMosaicContainer.addEventListener("click", (e) => {
                const trigger = e.target.closest(".lightbox-trigger");
                if (trigger) {
                    const type = trigger.getAttribute("data-type");
                    const src = trigger.getAttribute("data-src");
                    openLightbox(type, src);
                }
            });
        }

        lightboxCloseBtn?.addEventListener("click", closeLightbox);
        
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal || e.target === lightboxContainer) {
                closeLightbox();
            }
        });
    }
});
