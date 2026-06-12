function initUtils() {
  const readMoreLinks = document.querySelectorAll(".read-more-btn");
  
  readMoreLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-target");
      const textContainer = document.getElementById(targetId);
      
      if (!textContainer) return;
      
      if (textContainer.classList.contains("expanded")) {
        textContainer.classList.remove("expanded");
        link.textContent = "Read More";
      } else {
        textContainer.classList.add("expanded");
        link.textContent = "Read Less";
      }
    });
  });
}
