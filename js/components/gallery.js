const bookDescriptions = {
  "/media/books/l1.jpg": "Level 1: A fun introduction to music for young beginners.",
  "/media/books/l2.jpg": "Level 2: Builds on foundational skills with new songs and activities.",
  "/media/books/l3.jpg": "Level 3: Expands musical knowledge and performance skills.",
  "/media/books/e1.jpg": "A collection of folk songs and rhymes for children.",
  "/media/books/e2.jpg": "More folk songs and rhymes for group and solo singing.",
  "/media/books/1.png": "Course Book 1: Core curriculum for Our Music Time.",
  "/media/books/2.png": "Course Book 2: Intermediate lessons and activities.",
  "/media/books/3.png": "Course Book 3: Advanced music learning and practice.",
  "/media/books/4.png": "Course Book 4: Special topics and seasonal music.",
  "/media/books/5.png": "Course Book 5: Review and enrichment materials.",
};

const eventImages = {
  2022: [
    "/media/events/2022/main.jpg",
    "/media/events/2022/IMG_7589.JPG",
    "/media/events/2022/IMG_7590.JPG",
    "/media/events/2022/IMG_7591.JPG",
    "/media/events/2022/IMG_7592.JPG",
    "/media/events/2022/IMG_7593.JPG",
    "/media/events/2022/IMG_7594.JPG",
  ],
  2023: [
    "/media/events/2023/main.JPG",
    "/media/events/2023/1.JPG",
    "/media/events/2023/2.JPG",
    "/media/events/2023/4.JPG",
    "/media/events/2023/5.JPG",
    "/media/events/2023/6.JPG",
    "/media/events/2023/7.JPG",
    "/media/events/2023/8.png",
    "/media/events/2023/9.JPG",
    "/media/events/2023/10.JPG",
    "/media/events/2023/11.JPG",
    "/media/events/2023/12.JPG",
    "/media/events/2023/13.JPG",
    "/media/events/2023/14.JPG",
    "/media/events/2023/15.jpg",
    "/media/events/2023/16.jpg",
  ],
  2024: [
    "/media/events/2024/main.JPG",
    "/media/events/2024/1.JPG",
    "/media/events/2024/2.jpg",
    "/media/events/2024/3.jpg",
    "/media/events/2024/4.jpg",
    "/media/events/2024/5.jpg",
    "/media/events/2024/6.jpg",
    "/media/events/2024/7.jpg",
    "/media/events/2024/8.jpg",
    "/media/events/2024/9.jpg",
    "/media/events/2024/10.jpg",
    "/media/events/2024/11.jpg",
    "/media/events/2024/12.jpg",
    "/media/events/2024/13.jpg",
  ],
  2025: [
    "/media/events/2025/main.jpg",
    "/media/events/2025/1.JPG",
    "/media/events/2025/2.JPG",
    "/media/events/2025/3.png",
    "/media/events/2025/4.png",
    "/media/events/2025/5.jpeg",
    "/media/events/2025/6.jpeg",
    "/media/events/2025/7.jpg",
    "/media/events/2025/8.jpeg",
    "/media/events/2025/9.jpeg",
    "/media/events/2025/10.jpeg",
    "/media/events/2025/11.jpeg",
    "/media/events/2025/12.jpg",
    "/media/events/2025/13.png",
    "/media/events/2025/14.jpg",
    "/media/events/2025/15.jpg",
    "/media/events/2025/16.jpg",
    "/media/events/2025/17.JPG",
    "/media/events/2025/18.JPG",
    "/media/events/2025/19.JPG",
  ],
  "2026_cn": [
    "/media/events/2026/2026%20OMT%20Workshop%20Coverpage-%20Taiwan.png",
    "/media/events/2026/2026%20OMT%20Workshop%20Details-Taiwan.png",
    "/media/events/2026/2026%20English%20poster%202.PNG",
    "/media/events/2026/2026%20Chinese%20poster%202.PNG",
    "/media/events/2026/Image.PNG",
    "/media/events/2026/Image%202.PNG",
  ],
  2026: [
    "/media/events/2026/2026%20English%20poster%202.PNG",
    "/media/events/2026/2026%20Chinese%20poster%202.PNG",
    "/media/events/2026/Image.PNG",
    "/media/events/2026/Image%202.PNG",
  ],
};

function initGallery() {
  // Single image popups
  const galleryPhotos = document.querySelectorAll(".gallery-photo, .book-cover");
  const popupOverlay = document.getElementById("popup-overlay");
  if (!popupOverlay) return;
  
  const popupImg = document.getElementById("popup-img");
  const popupDesc = document.getElementById("popup-desc");
  const closeBtn = document.getElementById("popup-close");
  const carouselContainer = document.getElementById("popup-carousel");
  
  galleryPhotos.forEach((img) => {
    img.addEventListener("click", () => {
      const src = img.getAttribute("data-popup");
      if (!src) return;
      
      popupImg.src = src;
      popupImg.style.display = 'block';
      if (carouselContainer) carouselContainer.style.display = 'none';
      
      popupDesc.textContent = bookDescriptions[src] || "";
      popupOverlay.classList.add("active");
    });
  });

  // Carousel Popups for Events
  const eventBtns = document.querySelectorAll("[data-popup-btn]");
  eventBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const year = btn.getAttribute("data-popup-btn");
      const images = eventImages[year];
      if (!images || images.length === 0) return;
      
      let currentIndex = 0;
      
      popupImg.style.display = 'none';
      const displayYear = year.toString().replace('_cn', '');
      popupDesc.textContent = `${displayYear} Events`;
      
      if (carouselContainer) {
        carouselContainer.style.display = 'flex';
        carouselContainer.innerHTML = `
          <button class="carousel-btn prev-btn">&#9664;</button>
          <img src="${images[0]}" class="popup-img" id="carousel-img" alt="${year} event" />
          <button class="carousel-btn next-btn">&#9654;</button>
          <div class="carousel-indicator" id="carousel-ind">1 / ${images.length}</div>
        `;
        
        const cImg = document.getElementById("carousel-img");
        const cInd = document.getElementById("carousel-ind");
        
        document.querySelector('.prev-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          cImg.src = images[currentIndex];
          cInd.textContent = `${currentIndex + 1} / ${images.length}`;
        });
        
        document.querySelector('.next-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          currentIndex = (currentIndex + 1) % images.length;
          cImg.src = images[currentIndex];
          cInd.textContent = `${currentIndex + 1} / ${images.length}`;
        });
      }
      
      popupOverlay.classList.add("active");
    });
  });

  // Close logic
  const closePopup = () => {
    popupOverlay.classList.remove("active");
  };

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  popupOverlay.addEventListener("click", (e) => {
    if (e.target === popupOverlay) closePopup();
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popupOverlay.classList.contains("active")) {
      closePopup();
    }
  });
}
