// Subtle fade-in for sections as they enter the viewport.
// Progressive enhancement only — page is fully usable with this disabled.
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section, .hero");

  if (!("IntersectionObserver" in window)) return;

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
});
