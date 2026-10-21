// Small set of progressive-enhancement microanimations.
// Every piece here is optional polish — the page is fully usable with
// JS disabled, and everything backs off when the visitor has asked for
// reduced motion.
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  initThemeToggle();
  initScrollProgress();
  initSectionFade(reduceMotion);
  initFuzzyName(reduceMotion);
  if (!reduceMotion) {
    initStagger("#projects .container", ".project", 90);
    initStagger("#skills .container", ".skills-grid li", 25);
    initStagger("#experience .container", ".timeline__item", 90);
    initStagger("#fun-facts .container", ".funfacts__photo", 90);
    initCardTilt();
  }
  initButtonRipple(reduceMotion);

  // ---------- Dark/light mode toggle ----------
  // The initial attribute (if a choice was saved) is already applied
  // by the inline script in <head>, before first paint. This just
  // wires up the click.
  function initThemeToggle() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    const root = document.documentElement;

    btn.addEventListener("click", () => {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const current = root.getAttribute("data-theme") || (systemDark ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  // ---------- "Fuzzy text" hero name (canvas) ----------
  // Redraws the name in thin horizontal bands each frame, each band
  // offset sideways by a small random amount - a continuous vibrate/
  // static-flicker look, stronger while hovered. The real text node
  // stays in the DOM underneath (just color: transparent via the
  // has-fuzzy-canvas class), so screen readers and no-JS visitors
  // still get plain readable text.
  function initFuzzyName(reduceMotion) {
    const el = document.querySelector(".hero__name");
    if (!el) return;
    const probe = document.createElement("canvas");
    if (typeof probe.getContext !== "function") return;

    const text = el.textContent;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let fontSpec = "";
    let letterSpacingPx = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function measure() {
      const rect = el.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const cs = getComputedStyle(el);
      fontSpec = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ls = parseFloat(cs.letterSpacing);
      letterSpacingPx = Number.isFinite(ls) ? ls : 0;
    }

    function applyTextStyle() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.font = fontSpec;
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${letterSpacingPx}px`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
    }

    function drawStill() {
      applyTextStyle();
      ctx.fillText(text, width / 2, height / 2);
    }

    let hovering = false;
    let rafId = null;

    function drawFuzzyFrame() {
      applyTextStyle();

      const intensity = hovering ? 5 : 1.6;
      const bandHeight = 4;

      for (let y = 0; y < height; y += bandHeight) {
        const offsetX = (Math.random() * 2 - 1) * intensity;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, width, bandHeight);
        ctx.clip();
        ctx.translate(offsetX, 0);
        ctx.fillText(text, width / 2, height / 2);
        ctx.restore();
      }

      rafId = requestAnimationFrame(drawFuzzyFrame);
    }

    measure();
    if (width < 2 || height < 2) return; // layout not ready; bail gracefully

    el.appendChild(canvas);
    el.classList.add("has-fuzzy-canvas");

    if (reduceMotion) {
      drawStill();
      return; // static render only, no animation loop or hover handlers
    }

    canvas.addEventListener("mouseenter", () => {
      hovering = true;
    });
    canvas.addEventListener("mouseleave", () => {
      hovering = false;
    });

    rafId = requestAnimationFrame(drawFuzzyFrame);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    });

    window.addEventListener("beforeunload", () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  // ---------- Scroll progress bar ----------
  function initScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;

    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  // ---------- Fade sections in as they enter the viewport ----------
  function initSectionFade(skip) {
    const sections = document.querySelectorAll(".section, .hero");
    if (skip || !("IntersectionObserver" in window)) return;

    sections.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((el) => observer.observe(el));
  }

  // ---------- Stagger a group of children in on scroll ----------
  function initStagger(groupSelector, childSelector, delayStep) {
    if (!("IntersectionObserver" in window)) return;

    document.querySelectorAll(groupSelector).forEach((group) => {
      const items = Array.from(group.querySelectorAll(childSelector));
      if (!items.length) return;

      items.forEach((item, i) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(10px)";
        item.style.transition = `opacity 0.45s ease ${
          i * delayStep
        }ms, transform 0.45s ease ${i * delayStep}ms`;
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              items.forEach((item) => {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
              });
              observer.unobserve(group);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(group);
    });
  }

  // ---------- Subtle pointer tilt on project cards ----------
  function initCardTilt() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    document.querySelectorAll(".project").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-y * 5).toFixed(2);
        const rotateY = (x * 5).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // ---------- Ripple feedback on button clicks ----------
  function initButtonRipple(skip) {
    if (skip) return;

    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "btn__ripple";
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    });
  }
});
