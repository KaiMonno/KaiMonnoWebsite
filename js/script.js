// Small set of progressive-enhancement microanimations.
// Every piece here is optional polish — the page is fully usable with
// JS disabled, and everything backs off when the visitor has asked for
// reduced motion.
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  initScrollProgress();
  initSectionFade(reduceMotion);
  if (!reduceMotion) {
    initStagger("#projects .container", ".project", 90);
    initStagger("#skills .container", ".skills-grid li", 25);
    initStagger("#experience .container", ".timeline__item", 90);
    initStagger("#fun-facts .container", ".funfacts__photo", 90);
    initCardTilt();
    initNameShimmer();
  }
  initButtonRipple(reduceMotion);

  // ---------- Split the hero name into per-character spans ----------
  // Lets the hover shimmer (css) stagger a wave across individual
  // letters instead of sweeping the whole name as one block.
  function initNameShimmer() {
    const el = document.querySelector(".hero__name");
    if (!el) return;

    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = "";

    Array.from(text).forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", i);
      span.textContent = ch === " " ? " " : ch;
      span.setAttribute("aria-hidden", "true");
      el.appendChild(span);
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
