document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
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
});
