// Animations for Our Music Time Redesign

document.addEventListener("DOMContentLoaded", () => {
  // Animate hero SVG notes on load
  const heroSVG = document.getElementById("hero-animated-svg");
  if (heroSVG) {
    heroSVG.style.opacity = 0;
    setTimeout(() => {
      heroSVG.style.transition = "opacity 1.5s cubic-bezier(0.4,0,0.2,1)";
      heroSVG.style.opacity = 1;
    }, 300);
  }

  // Animate sections on scroll
  const animatedSections = document.querySelectorAll(".animated-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    {threshold: 0.15}
  );
  animatedSections.forEach((section) => observer.observe(section));

  // Animate cards on hover
  document
    .querySelectorAll(".card, .card-author2, .card-author")
    .forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.classList.add("card-hover");
      });
      card.addEventListener("mouseleave", () => {
        card.classList.remove("card-hover");
      });
    });
});
