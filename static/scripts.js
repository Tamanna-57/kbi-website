/* ═══════════════════════════════════════════════════════════════
   KBI — Main Scripts (RIL-inspired interactions)
   ═══════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────
   1. HERO — crossfade carousel
─────────────────────────────────────────────────────────────── */
(function initHero() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    let current  = 0;
    let timer    = null;
    const INTERVAL = 5500;
    const DURATION  = 1100; // must match --dur-hero in CSS

    function showSlide(index) {
        slides[current].classList.remove('active');
        dots[current]?.classList.remove('active');
        dots[current]?.setAttribute('aria-selected', 'false');

        current = (index + slides.length) % slides.length;

        slides[current].classList.add('active');
        dots[current]?.classList.add('active');
        dots[current]?.setAttribute('aria-selected', 'true');
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => showSlide(current + 1), INTERVAL);
    }

    // Wire up dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { showSlide(i); startTimer(); });
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSlide(i); startTimer(); }
        });
    });

    // Keyboard (global) — only when hero is visible
    document.addEventListener('keydown', (e) => {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        if (e.key === 'ArrowLeft')  { showSlide(current - 1); startTimer(); }
        if (e.key === 'ArrowRight') { showSlide(current + 1); startTimer(); }
    });

    // Touch swipe
    let touchX = 0;
    const heroEl = document.querySelector('.hero-slider');
    if (heroEl) {
        heroEl.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].screenX; }, { passive: true });
        heroEl.addEventListener('touchend', (e) => {
            const diff = touchX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                showSlide(diff > 0 ? current + 1 : current - 1);
                startTimer();
            }
        }, { passive: true });

        // Pause on hover
        heroEl.addEventListener('mouseenter', () => clearInterval(timer));
        heroEl.addEventListener('mouseleave', startTimer);
    }

    // Initialise
    slides[0].classList.add('active');
    dots[0]?.classList.add('active');
    startTimer();
})();


/* ───────────────────────────────────────────────────────────────
   2. OUR BUSINESSES — hover-driven split panel
─────────────────────────────────────────────────────────────── */
(function initBusinesses() {
    const canvas  = document.getElementById('businessesCanvas');
    const img     = document.getElementById('businessesImg');
    const title   = document.getElementById('businessesTitle');
    const desc    = document.getElementById('businessesDesc');
    const link    = document.getElementById('businessesLink');
    const items   = document.querySelectorAll('.businesses-nav__item');
    if (!canvas || !items.length) return;

    const segments = [
        {
            title: 'Automotive Components',
            desc:  'Precision sheet metal stampings, fabrications, and sub-assemblies for India\'s leading automobile manufacturers — Maruti Suzuki, Mahindra, Eicher, New Holland, and more.',
            img:   '/static/pics/real_products.jpeg',
            href:  '/products'
        },
        {
            title: 'Power & Telecom',
            desc:  'High-quality galvanized steel wire, strips, and cable input components for power transmission and telecommunications infrastructure across India.',
            img:   '/static/pics/cords_cables.webp',
            href:  '/products'
        },
        {
            title: 'Advanced Manufacturing',
            desc:  'State-of-the-art fabrication in our Faridabad and Alwar facilities — CNC machining, multi-spindle drilling, precision pressing, welding, and shot-blasting.',
            img:   '/static/pics/pressline.webp',
            href:  '/processes'
        },
        {
            title: 'Quality Assurance',
            desc:  'ISO 9001:2015 certified quality management. Every component passes rigorous dimensional, surface, and functional checks before leaving our plants.',
            img:   '/static/pics/real_quality.png',
            href:  '/certifications'
        }
    ];

    let current = 0;
    let transitioning = false;

    function activate(index) {
        if (index === current && canvas.classList.contains('content-ready')) return;
        if (transitioning) return;
        transitioning = true;

        // Update nav
        items.forEach((it, i) => it.classList.toggle('active', i === index));

        // Fade out content
        canvas.classList.remove('content-ready');

        const seg = segments[index];

        setTimeout(() => {
            // Swap image
            img.classList.remove('is-visible');
            img.src = seg.img;
            img.alt = seg.title;

            // Swap text
            title.textContent = seg.desc ? seg.title : '';
            desc.textContent  = seg.desc;
            if (link) {
                link.href = seg.href;
            }

            current = index;

            // Allow browser to load
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    img.classList.add('is-visible');
                    canvas.classList.add('content-ready');
                    transitioning = false;
                });
            });
        }, 280);
    }

    // Wire up nav items
    items.forEach((item, i) => {
        item.addEventListener('mouseenter', () => activate(i));
        item.addEventListener('click',      () => activate(i));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
        });
    });

    // Initialise first segment
    const first = segments[0];
    img.src   = first.img;
    img.alt   = first.title;
    title.textContent = first.title;
    desc.textContent  = first.desc;
    if (link) link.href = first.href;
    requestAnimationFrame(() => {
        img.classList.add('is-visible');
        canvas.classList.add('content-ready');
    });
})();


/* ───────────────────────────────────────────────────────────────
   3. SUSTAINABILITY TABS — animated indicator
─────────────────────────────────────────────────────────────── */
(function initTabs() {
    const tabs      = document.querySelectorAll('.sustain-tab');
    const panels    = document.querySelectorAll('.sustain-panel');
    const indicator = document.querySelector('.sustain-tab-indicator');
    if (!tabs.length) return;

    function positionIndicator(tab) {
        if (!indicator) return;
        indicator.style.left  = tab.offsetLeft + 'px';
        indicator.style.width = tab.offsetWidth + 'px';
    }

    function activateTab(index) {
        tabs.forEach((t, i) => {
            const active = i === index;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active);
        });
        panels.forEach((p, i) => {
            const active = i === index;
            p.classList.toggle('active', active);
            p.hidden = !active;
        });
        positionIndicator(tabs[index]);
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activateTab(i));
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { activateTab((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
            if (e.key === 'ArrowLeft')  { activateTab((i - 1 + tabs.length) % tabs.length); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
        });
    });

    // Init position
    const activeTab = document.querySelector('.sustain-tab.active') || tabs[0];
    activateTab([...tabs].indexOf(activeTab));

    // Reposition on resize
    window.addEventListener('resize', () => {
        const activeIdx = [...tabs].findIndex(t => t.classList.contains('active'));
        if (activeIdx >= 0) positionIndicator(tabs[activeIdx]);
    }, { passive: true });
})();


/* ───────────────────────────────────────────────────────────────
   4. SCROLL-REVEAL via IntersectionObserver
─────────────────────────────────────────────────────────────── */
(function initReveal() {
    const els = document.querySelectorAll('.reveal-section');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
})();


/* ───────────────────────────────────────────────────────────────
   5. NUMBER COUNTER — investors stats
─────────────────────────────────────────────────────────────── */
(function initCounters() {
    const counters = document.querySelectorAll('.stat-tile__number[data-count]');
    if (!counters.length) return;

    function animateCounter(el) {
        const target   = parseInt(el.dataset.count, 10);
        const duration = 1600;
        const start    = performance.now();

        function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
})();


/* ───────────────────────────────────────────────────────────────
   6. SMOOTH SCROLL — internal anchor links
─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});


/* ───────────────────────────────────────────────────────────────
   7. BUTTON RIPPLE EFFECT
─────────────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.className     = 'ripple';
    ripple.style.width   = ripple.style.height = size + 'px';
    ripple.style.left    = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top     = (e.clientY - rect.top  - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
});


/* ───────────────────────────────────────────────────────────────
   8. ACCESSIBILITY — ARIA for hero slider
─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.hero-slider');
    if (slider) {
        slider.setAttribute('role', 'region');
        slider.setAttribute('aria-label', 'Image carousel');
    }
});
