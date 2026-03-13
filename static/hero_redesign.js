/**
 * hero_redesign.js
 * Handles: slide counter, progress bar, and prev/next arrow navigation.
 * Integrates with the existing slider logic in scripts.js via MutationObserver
 * and programmatic .click() on the invisible dots created by scripts.js.
 */
document.addEventListener('DOMContentLoaded', function () {
    var slides        = document.querySelectorAll('.slide');
    var counterEl     = document.querySelector('.counter-current');
    var totalEl       = document.querySelector('.counter-total');
    var progressBar   = document.querySelector('.hero-progress-bar');
    var prevBtn       = document.querySelector('.hero-arrow-prev');
    var nextBtn       = document.querySelector('.hero-arrow-next');

    if (!slides.length) return;

    // Must match the interval set in scripts.js (7000 ms)
    var SLIDE_MS = 7000;

    // ── Set total count ─────────────────────────────────────────────────────
    if (totalEl) {
        totalEl.textContent = String(slides.length).padStart(2, '0');
    }

    // ── Progress bar helpers ─────────────────────────────────────────────────
    function startProgress() {
        if (!progressBar) return;
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        // Force reflow so the browser registers the reset before animating
        void progressBar.offsetWidth;
        progressBar.style.transition = 'width ' + SLIDE_MS + 'ms linear';
        progressBar.style.width = '100%';
    }

    // ── Watch slide active-class changes via MutationObserver ────────────────
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                var target = mutation.target;
                if (target.classList.contains('active')) {
                    var idx = Array.from(slides).indexOf(target);
                    if (counterEl) {
                        counterEl.textContent = String(idx + 1).padStart(2, '0');
                    }
                    startProgress();
                }
            }
        });
    });

    slides.forEach(function (slide) {
        observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
    });

    // ── Initialise progress on page load ────────────────────────────────────
    startProgress();

    // ── Helper: get the invisible dots created by scripts.js ─────────────────
    function getDots() {
        return document.querySelectorAll('.slider-dot');
    }

    function getActiveIndex() {
        return Array.from(slides).findIndex(function (s) {
            return s.classList.contains('active');
        });
    }

    // ── Arrow buttons ────────────────────────────────────────────────────────
    // Programmatic .click() works even when pointer-events:none is set on dots.
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            var dots    = getDots();
            var current = getActiveIndex();
            var prev    = (current - 1 + slides.length) % slides.length;
            if (dots[prev]) dots[prev].click();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            var dots    = getDots();
            var current = getActiveIndex();
            var next    = (current + 1) % slides.length;
            if (dots[next]) dots[next].click();
        });
    }

    // ── Pause / resume progress bar on hover ────────────────────────────────
    var heroSlider = document.querySelector('.slider');
    if (heroSlider && progressBar) {
        heroSlider.addEventListener('mouseenter', function () {
            progressBar.style.transition = 'none';
        });

        heroSlider.addEventListener('mouseleave', function () {
            // Calculate how far through the bar we currently are,
            // then continue the transition for the remaining time only.
            var parentWidth  = progressBar.parentElement.offsetWidth;
            var currentWidth = parseFloat(getComputedStyle(progressBar).width);
            var percent      = parentWidth > 0 ? (currentWidth / parentWidth) : 0;
            var remaining    = (1 - percent) * SLIDE_MS;

            progressBar.style.transition = 'width ' + remaining + 'ms linear';
            progressBar.style.width = '100%';
        });
    }
});
