/* ══════════════════════════════════════════════════════
   KBI — Main Scripts  v3
══════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* ── 1. HERO CROSSFADE SLIDER ───────────────────────── */
  (function () {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots   = Array.from(document.querySelectorAll(".slide-dot"));
    if (!slides.length) return;

    let cur = 0, timer;
    const INTERVAL = 7000;

    function go(i) {
      const n = ((i % slides.length) + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("active", j === n));
      dots.forEach((d, j) => {
        d.classList.toggle("active", j === n);
        d.setAttribute("aria-selected", j === n);
      });
      cur = n;
    }

    function reset() { clearInterval(timer); timer = setInterval(() => go(cur + 1), INTERVAL); }

    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); reset(); }));

    // Swipe
    let tx = 0;
    const wrap = document.querySelector(".hero-slides");
    if (wrap) {
      wrap.addEventListener("touchstart", e => { tx = e.changedTouches[0].screenX; }, { passive: true });
      wrap.addEventListener("touchend",   e => {
        const d = tx - e.changedTouches[0].screenX;
        if (Math.abs(d) > 50) { go(cur + (d > 0 ? 1 : -1)); reset(); }
      }, { passive: true });
    }

    go(0); reset();
  })();

  /* ── 2. OUR TECHNOLOGIES — hover-driven section ─────── */
  (function () {
    const bgSlides  = Array.from(document.querySelectorAll(".tech-bg-slide"));
    const navItems  = Array.from(document.querySelectorAll(".tech-nav-item"));
    const titleEl   = document.getElementById("techTitle");
    const descEl    = document.getElementById("techDesc");
    const linkEl    = document.getElementById("techLink");
    const panel     = document.getElementById("techContentPanel");
    if (!bgSlides.length || !navItems.length) return;

    const techs = [
      {
        title: "Tooling",
        desc:  "Our tooling department creates precision dies, jigs, and fixtures using advanced CNC machines and skilled craftsmen. We manufacture custom tooling solutions for in-house component manufacturing across automotive and industrial sectors.",
        href:  "/processes"
      },
      {
        title: "Machining",
        desc:  "Our machining division specialises in precision turning, milling, and drilling operations. We produce high-quality components for automotive, agricultural, and industrial machinery with tight dimensional tolerances.",
        href:  "/processes"
      },
      {
        title: "Press Operations",
        desc:  "Our press shop is equipped with presses from 20T to 600T for stamping, forming, and deep drawing operations. We handle both high-volume production runs and prototype development with equal precision.",
        href:  "/processes"
      },
      {
        title: "Welding",
        desc:  "State-of-the-art MIG, TIG, and spot welding capabilities backed by skilled welders and weld fixture tooling. Every joint is visually and dimensionally verified before dispatch.",
        href:  "/processes"
      },
      {
        title: "Cutting",
        desc:  "Precision shearing, blanking, and flame-cutting operations delivering accurate profiles and blanks. Tight tolerances are maintained across high-volume production runs for automotive and infrastructure sectors.",
        href:  "/processes"
      },
      {
        title: "Fabrication & Assembly",
        desc:  "Complete fabrication and sub-assembly capabilities including galvanizing, surface treatment, and packaging — delivering ready-to-fit components directly to OEM assembly lines.",
        href:  "/processes"
      }
    ];

    let activeTech = 0;
    let transitioning = false;

    function activate(i) {
      if (i === activeTech || transitioning) return;
      transitioning = true;

      // Crossfade background
      bgSlides[activeTech].classList.remove("active");
      bgSlides[i]?.classList.add("active");

      // Highlight nav
      navItems.forEach((el, j) => el.classList.toggle("active", j === i));

      // Fade content out
      if (panel) panel.classList.remove("content-ready");

      setTimeout(() => {
        if (titleEl) titleEl.textContent = techs[i].title;
        if (descEl)  descEl.textContent  = techs[i].desc;
        if (linkEl)  linkEl.href         = techs[i].href;
        activeTech = i;
        // Fade content in
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (panel) panel.classList.add("content-ready");
          transitioning = false;
        }));
      }, 240);
    }

    navItems.forEach((item, i) => {
      item.addEventListener("mouseenter", () => activate(i));
      item.addEventListener("click",      () => activate(i));
      item.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(i); }
      });
    });

    // Init first item
    navItems[0]?.classList.add("active");
    bgSlides[0]?.classList.add("active");
    if (panel) panel.classList.add("content-ready");
  })();

  /* ── 3. KBI ABOUT CAROUSEL ──────────────────────────── */
  (function () {
    const slides = Array.from(document.querySelectorAll(".kbi-carousel-slide"));
    if (!slides.length) return;
    let cur = 0;
    setInterval(() => {
      slides[cur].classList.remove("active");
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add("active");
    }, 4500);
  })();

  /* ── 4. SCROLL-REVEAL ───────────────────────────────── */
  (function () {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const t = e.target;

        // Generic reveal
        if (t.classList.contains("reveal-section")) {
          t.classList.add("is-visible");
        }
        // Tech section: animate in left/right
        if (t.classList.contains("tech-section")) {
          t.classList.add("in-view");
        }
        // KBI intro card: animate up from bottom
        if (t.classList.contains("kbi-intro-card")) {
          t.classList.add("in-view");
        }
        // Info + CTA
        if (t.classList.contains("info-section") || t.classList.contains("cta-section")) {
          t.style.opacity = "1";
          t.style.transform = "translateY(0)";
        }

        io.unobserve(t);
      });
    }, { threshold: 0.1 });

    [
      ...document.querySelectorAll(".reveal-section"),
      document.querySelector(".tech-section"),
      document.querySelector(".kbi-intro-card"),
      document.querySelector(".info-section"),
      document.querySelector(".cta-section"),
    ].forEach(el => el && io.observe(el));

    // info + cta: set initial hidden state
    [document.querySelector(".info-section"), document.querySelector(".cta-section")].forEach(el => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(28px)";
        el.style.transition = "opacity .7s ease, transform .7s ease";
      }
    });
  })();

  /* ── 5. NUMBER COUNTERS ─────────────────────────────── */
  (function () {
    const els = document.querySelectorAll(".stat-num[data-count]");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, dur = 1500, t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  })();

  /* ── 6. PRODUCTS HORIZONTAL SCROLL (GSAP ScrollTrigger) ─ */
  (function () {
    const trackWrap = document.getElementById("productsTrackWrap");
    const track     = document.getElementById("productsTrack");
    if (!trackWrap || !track) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      trackWrap.classList.add("no-gsap");
      return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      trackWrap.classList.add("no-gsap");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Horizontal scroll: pin trackWrap while track moves left
    const getScrollAmount = () => -(track.scrollWidth - trackWrap.clientWidth);

    gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: trackWrap,
        start: "top top",
        end: () => `+=${Math.abs(getScrollAmount())}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // Card entrance: slide in from right, staggered
    const cards = track.querySelectorAll(".psc-card");
    gsap.set(cards, { opacity: 0, x: 80 });

    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        x: 0,
        duration: 0.75,
        ease: "power2.out",
        delay: i * 0.1,
        scrollTrigger: {
          trigger: trackWrap,
          start: "top 78%",
          toggleActions: "play none none none",
        }
      });
    });
  })();

  /* ── 8. BUTTON RIPPLE ───────────────────────────────── */
  document.addEventListener("click", e => {
    const btn = e.target.closest(".cta-btn, .hero-btn, .kbi-intro-link, .tech-read-more");
    if (!btn) return;
    const r = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const sz = Math.max(rect.width, rect.height);
    Object.assign(r.style, {
      position: "absolute", borderRadius: "50%", pointerEvents: "none",
      background: "rgba(255,255,255,.22)",
      width: sz + "px", height: sz + "px",
      left: (e.clientX - rect.left - sz / 2) + "px",
      top:  (e.clientY - rect.top  - sz / 2) + "px",
      transform: "scale(0)", animation: "_ripple .6s linear"
    });
    btn.style.overflow = "hidden";
    btn.style.position = btn.style.position || "relative";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });

});

/* Ripple keyframe */
if (!document.getElementById("_ks")) {
  const s = document.createElement("style");
  s.id = "_ks";
  s.textContent = "@keyframes _ripple{to{transform:scale(3);opacity:0}}";
  document.head.appendChild(s);
}
