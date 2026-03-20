/* ══════════════════════════════════════════════════════
   KBI Main Scripts — RIL-inspired interactions
══════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

  /* ── HERO SLIDER (crossfade) ───────────────────────── */
  const slides      = Array.from(document.querySelectorAll(".hero-slide"));
  const dots        = Array.from(document.querySelectorAll(".slide-dot"));
  let   currentSlide = 0;
  let   heroTimer;
  const SLIDE_INTERVAL = 7000;

  function setSlide(index) {
    if (!slides.length) return;
    const next = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((el, i) => el.classList.toggle("active", i === next));
    dots.forEach((el, i) => {
      el.classList.toggle("active", i === next);
      el.setAttribute("aria-selected", i === next);
    });
    currentSlide = next;
  }

  function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => setSlide(currentSlide + 1), SLIDE_INTERVAL);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { setSlide(i); startHeroTimer(); });
    dot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSlide(i); startHeroTimer(); }
    });
  });

  // Touch swipe
  let touchStartX = 0;
  const heroSlides = document.querySelector(".hero-slides");
  if (heroSlides) {
    heroSlides.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    heroSlides.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { setSlide(currentSlide + (diff > 0 ? 1 : -1)); startHeroTimer(); }
    }, { passive: true });
  }

  if (slides.length) { setSlide(0); startHeroTimer(); }

  /* ── OUR BUSINESSES — hover split panel ─────────────── */
  const canvas = document.getElementById("businessesCanvas");
  const img    = document.getElementById("businessesImg");
  const title  = document.getElementById("businessesTitle");
  const desc   = document.getElementById("businessesDesc");
  const link   = document.getElementById("businessesLink");
  const items  = document.querySelectorAll(".businesses-nav__item");

  const segments = [
    {
      title: "Automotive Components",
      desc:  "Precision sheet metal stampings, fabrications and sub-assemblies for India's leading OEMs — Maruti Suzuki, Mahindra, Eicher, New Holland and more.",
      img:   "/static/pics/real_products.jpeg",
      href:  "/products"
    },
    {
      title: "Power & Telecom",
      desc:  "High-quality galvanized steel wire, strips and cable input components for power transmission and telecom infrastructure across India.",
      img:   "/static/pics/cords_cables.webp",
      href:  "/products"
    },
    {
      title: "Advanced Manufacturing",
      desc:  "State-of-the-art CNC machining, multi-spindle drilling, precision pressing, welding and shot-blasting across our Faridabad and Alwar plants.",
      img:   "/static/pics/pressline.webp",
      href:  "/processes"
    },
    {
      title: "Quality Assurance",
      desc:  "ISO 9001:2015 certified quality management. Every component passes rigorous dimensional, surface and functional checks before shipment.",
      img:   "/static/pics/real_quality.png",
      href:  "/certifications"
    }
  ];

  let activeSeg   = 0;
  let transitioning = false;

  function activateSegment(index) {
    if (index === activeSeg && canvas?.classList.contains("content-ready")) return;
    if (transitioning || !canvas) return;
    transitioning = true;

    items.forEach((it, i) => it.classList.toggle("active", i === index));
    canvas.classList.remove("content-ready");

    const seg = segments[index];

    setTimeout(() => {
      if (img)   { img.classList.remove("is-visible"); img.src = seg.img; img.alt = seg.title; }
      if (title) title.textContent = seg.title;
      if (desc)  desc.textContent  = seg.desc;
      if (link)  link.href         = seg.href;
      activeSeg = index;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (img) img.classList.add("is-visible");
        canvas.classList.add("content-ready");
        transitioning = false;
      }));
    }, 280);
  }

  if (items.length && canvas) {
    items.forEach((item, i) => {
      item.addEventListener("mouseenter", () => activateSegment(i));
      item.addEventListener("click",      () => activateSegment(i));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateSegment(i); }
      });
    });

    // Init
    if (img) img.src = segments[0].img;
    requestAnimationFrame(() => {
      if (img) img.classList.add("is-visible");
      canvas.classList.add("content-ready");
    });
  }

  /* ── NUMBER COUNTERS ─────────────────────────────────── */
  const counters = document.querySelectorAll(".stat-num[data-count]");

  if (counters.length) {
    const cntObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const dur    = 1600;
        const start  = performance.now();
        const tick   = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const e = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(e * target).toLocaleString();
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cntObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => cntObserver.observe(c));
  }

  /* ── SCROLL REVEAL ───────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    ".reveal-section, .segments-section, .info-section, .certifications-section, .cta-section"
  );

  if ("IntersectionObserver" in window && revealEls.length) {
    const revObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach(el => revObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  /* ── BUTTON RIPPLE ───────────────────────────────────── */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".cta-btn, .hero-btn");
    if (!btn) return;
    const ripple = document.createElement("span");
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    Object.assign(ripple.style, {
      position: "absolute",
      borderRadius: "50%",
      background: "rgba(255,255,255,.25)",
      width: size + "px", height: size + "px",
      left: (e.clientX - rect.left - size / 2) + "px",
      top:  (e.clientY - rect.top  - size / 2) + "px",
      transform: "scale(0)",
      animation: "rippleAnim .6s linear",
      pointerEvents: "none"
    });
    btn.style.overflow = "hidden";
    btn.style.position = btn.style.position || "relative";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

});

/* Ripple keyframe (injected once) */
if (!document.getElementById("kbi-ripple-style")) {
  const s = document.createElement("style");
  s.id = "kbi-ripple-style";
  s.textContent = "@keyframes rippleAnim{to{transform:scale(3);opacity:0}}";
  document.head.appendChild(s);
}
