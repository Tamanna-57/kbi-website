/* ════════════════════════════════════════════════════
   KBI — Processes Page JS
   Full-width horizontal process slider
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const track    = document.getElementById('procSliderTrack');
  const dotsEl   = document.getElementById('procSliderDots');
  const btnPrev  = document.getElementById('procSliderPrev');
  const btnNext  = document.getElementById('procSliderNext');

  if (!track) return;

  const slides = [...track.querySelectorAll('.proc-slide')];
  const total  = slides.length;
  let   current  = 0;
  let   autoTimer = null;
  let   touchX    = 0;
  let   dragStartX = null;
  let   wasDragging = false;

  /* ── Build dots ── */
  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'proc-slider__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  /* ── Update visible state ── */
  function updateSlider() {
    track.style.transform = `translateX(-${current * 100}%)`;
    const dots = dotsEl ? dotsEl.querySelectorAll('.proc-slider__dot') : [];
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  /* ── Go to slide ── */
  function goTo(idx) {
    current = ((idx % total) + total) % total;
    updateSlider();
    resetAuto();
  }

  function step(dir) { goTo(current + dir); }

  /* ── Auto-play: 4 s ── */
  function startAuto() { autoTimer = setInterval(() => step(1), 4000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  /* ── Navigation arrows ── */
  if (btnPrev) btnPrev.addEventListener('click', () => step(-1));
  if (btnNext) btnNext.addEventListener('click', () => step(1));

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ── Touch swipe ── */
  track.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    clearInterval(autoTimer);
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) step(dx > 0 ? 1 : -1);
    startAuto();
  });

  /* ── Mouse drag ── */
  track.addEventListener('mousedown', e => {
    dragStartX   = e.clientX;
    wasDragging  = false;
    clearInterval(autoTimer);
    track.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (dragStartX === null) return;
    if (Math.abs(e.clientX - dragStartX) > 8) wasDragging = true;
  });

  window.addEventListener('mouseup', e => {
    if (dragStartX !== null) {
      const dx = dragStartX - e.clientX;
      if (wasDragging && Math.abs(dx) > 50) step(dx > 0 ? 1 : -1);
      dragStartX = null;
      startAuto();
    }
    track.style.cursor = '';
  });

  /* ── Pause on hover ── */
  track.closest('.proc-slider').addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.closest('.proc-slider').addEventListener('mouseleave', () => { dragStartX = null; startAuto(); });

  /* ── Init ── */
  buildDots();
  updateSlider();
  startAuto();
});
