document.addEventListener("DOMContentLoaded", () => {
  // FAQ functionality
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");

    question.addEventListener("click", () => {
      const isOpen = answer.classList.contains("open");
      document
        .querySelectorAll(".faq-answer, .faq-icon")
        .forEach((el) => el.classList.remove("open"));

      if (!isOpen) {
        answer.classList.add("open");
        icon.classList.add("open");
      }
    });
  });

  // Navbar scroll effect
  window.onscroll = () => {
    const navbar = document.getElementById("navbar");
    navbar.classList.toggle("scrolled", window.scrollY > 100);
  };

  // Image carousel functionality
  const images = [
    "media/events/2022/main.jpg",
    "media/events/2022/IMG_7589.JPG",
    "media/events/2022/IMG_7590.JPG",
    "media/events/2022/IMG_7591.JPG",
    "media/events/2022/IMG_7592.JPG",
    "media/events/2022/IMG_7593.JPG",
    "media/events/2022/IMG_7594.JPG",
  ];

  let currentIndex = 0;

  function updateImage(newIndex) {
    const imgElement = document.getElementById("current-image");
    imgElement.classList.remove("active");

    setTimeout(() => {
      currentIndex = newIndex;
      imgElement.src = images[currentIndex];
      imgElement.classList.add("active");
    }, 300);
  }

  window.prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage(newIndex);
  };

  window.nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    updateImage(newIndex);
  };

  const images2 = [
    "media/events/2023/main.JPG",
    "media/events/2023/1.JPG",
    "media/events/2023/2.JPG",
    "media/events/2023/4.JPG",
    "media/events/2023/5.JPG",
    "media/events/2023/6.JPG",
    "media/events/2023/7.JPG",
    "media/events/2023/8.png",
    "media/events/2023/9.JPG",
    "media/events/2023/10.JPG",
    "media/events/2023/11.JPG",
    "media/events/2023/12.JPG",
    "media/events/2023/13.JPG",
    "media/events/2023/14.JPG",
    "media/events/2023/15.JPG",
    "media/events/2023/16.JPG",
  ];

  let currentIndex2 = 0;

  function updateImage2(newIndex) {
    const imgElement = document.getElementById("current-image2");
    imgElement.classList.remove("active2");

    setTimeout(() => {
      currentIndex2 = newIndex;
      imgElement.src = images2[currentIndex2];
      imgElement.classList.add("active2");
    }, 300);
  }

  window.prevImage2 = () => {
    const newIndex = (currentIndex2 - 1 + images2.length) % images2.length;
    updateImage2(newIndex);
  };

  window.nextImage2 = () => {
    const newIndex = (currentIndex2 + 1) % images2.length;
    updateImage2(newIndex);
  };

  const images3 = ["media/events/2024/main.jpg"];

  let currentIndex3 = 0;

  function updateImage3(newIndex) {
    const imgElement = document.getElementById("current-image3");
    imgElement.classList.remove("active3");

    setTimeout(() => {
      currentIndex3 = newIndex;
      imgElement.src = images3[currentIndex3];
      imgElement.classList.add("active3");
    }, 300);
  }

  window.prevImage3 = function () {
    const newIndex = (currentIndex3 - 1 + images3.length) % images3.length;
    updateImage3(newIndex);
  };

  window.nextImage3 = function () {
    const newIndex = (currentIndex3 + 1) % images3.length;
    updateImage3(newIndex);
  };

  const images4 = ["media/events/2025/main.jpg"];

  let currentIndex4 = 0;

  function updateImage4(newIndex) {
    const imgElement = document.getElementById("current-image4");
    imgElement.classList.remove("active4");

    setTimeout(() => {
      currentIndex4 = newIndex;
      imgElement.src = images4[currentIndex4];
      imgElement.classList.add("active4");
    }, 300);
  }

  window.prevImage4 = function () {
    const newIndex = (currentIndex4 - 1 + images4.length) % images4.length;
    updateImage4(newIndex);
  };

  window.nextImage4 = function () {
    const newIndex = (currentIndex4 + 1) % images4.length;
    updateImage4(newIndex);
  };

  const mediaData = [
    {
      type: "image",
      url: "media/aurelia/2.JPG",
      title: "Aurelia",
    },
    {
      type: "image",
      url: "media/aurelia/3.JPG",
      title: "Aurelia",
    },
    {
      type: "image",
      url: "media/aurelia/4.JPG",
      title: "Aurelia",
    },
    {
      type: "image",
      url: "media/isabelle/2.JPG",
      title: "Isabelle",
    },
    {
      type: "image",
      url: "media/events/carousel/cobblercobbler.jpg",
      title: "Cobbler, Cobbler",
    },
    {
      type: "video",
      url: "media/events/carousel/cobblercobbler.MOV",
      title: "Aurelia's Shoes",
    },
    {
      type: "image",
      url: "media/events/carousel/witchwitch.jpg",
      title: "Witch, Witch",
    },
    {
      type: "video",
      url: "media/events/carousel/witchwitch.MOV",
      title: "Witch, Witch",
    },
    {
      type: "image",
      url: "media/events/carousel/lucylocket.jpg",
      title: "Lucy Locket Lost Her Pocket",
    },
    {
      type: "video",
      url: "media/events/carousel/lucylocket.MOV",
      title: "Lucy Locket Lost Her Pocket",
    },
    {
      type: "image",
      url: "media/events/carousel/charlieocean.jpg",
      title: "Charlie Over the Ocean",
    },
    {
      type: "video",
      url: "media/events/carousel/charlieocean.MOV",
      title: "Charlie Over the Ocean",
    },
    {
      type: "image",
      url: "media/events/carousel/closetkey.jpg",
      title: "I've Lost the Closet Key",
    },
    {
      type: "video",
      url: "media/events/carousel/closetkey.MOV",
      title: "I've Lost the Closet Key",
    },
  ];

  class Carousel {
    constructor(container, data) {
      this.container = container;
      this.data = data;
      this.currentIndex = 0;
      this.interval = null;
      this.init();
    }

    init() {
      this.createSlides();
      this.setupNavigation();
      this.showSlide(0);
      this.startAutoPlay();
    }

    createSlides() {
      this.data.forEach((item, index) => {
        const slide = document.createElement("div");
        slide.className = "carousel-slide";

        const mediaElement =
          item.type === "video"
            ? this.createVideoElement(item.url)
            : this.createImageElement(item.url);

        const title = document.createElement("div");
        title.className = "title";
        title.textContent = item.title;

        slide.appendChild(mediaElement);
        slide.appendChild(title);
        this.container.appendChild(slide);

        mediaElement.addEventListener("click", () => {
          window.open(item.url, "_blank");
        });
      });
    }

    createVideoElement(url) {
      const video = document.createElement("video");
      video.style.zIndex = 50;
      video.style.borderRadius = "15px";
      video.className = "media-content";
      video.src = url;
      video.controls = true;
      video.muted = true; // Ensure video is muted for autoplay
      video.loop = false;
      video.play(); // Explicitly call play to ensure autoplay
      return video;
    }

    createImageElement(url) {
      const img = document.createElement("img");
      img.style.borderRadius = "15px";
      img.className = "media-content";
      img.src = url;
      return img;
    }

    setupNavigation() {
      const prevButton = this.container.querySelector(".prev");
      const nextButton = this.container.querySelector(".next");

      prevButton.addEventListener("click", () => this.navigate(-1));
      nextButton.addEventListener("click", () => this.navigate(1));
    }

    navigate(direction) {
      this.currentIndex =
        (this.currentIndex + direction + this.data.length) % this.data.length;
      this.showSlide(this.currentIndex);
      this.resetAutoPlay();
    }

    showSlide(index) {
      const slides = this.container.querySelectorAll(".carousel-slide");
      slides.forEach((slide) => slide.classList.remove("active"));
      slides[index].classList.add("active");
    }

    startAutoPlay() {
      this.interval = setInterval(() => {
        this.navigate(1);
      }, 15000); // Change slide every 5 seconds
    }

    resetAutoPlay() {
      clearInterval(this.interval);
      this.startAutoPlay();
    }
  }

  // Initialize the carousel
  const container = document.querySelector(".carousel-container");
  const carousel = new Carousel(container, mediaData); // Typewriter effect
  const titleElement = document.getElementById("title");
  const titleText = titleElement.textContent;
  let index = 0;
  titleElement.textContent = "";

  function typeWriter() {
    if (index < titleText.length) {
      titleElement.textContent += titleText.charAt(index);
      index++;
      setTimeout(typeWriter, 100);
    }
  }

  typeWriter();

  // Random text effect for subtitle
  const subtitleContainer = document.getElementById("subtitle-container");
  const subtitleText =
    "Inspiring the next generation of music educators and performers.";
  const randomCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";
  let elapsedTime = 0;

  // Wrap text in a <p> to keep structure
  subtitleContainer.innerHTML = `<p id="subtitle"><span></span></p>`;
  const subtitleSpan = subtitleContainer.querySelector("span");

  subtitleContainer.style.whiteSpace = "pre";

  function generateRandomText() {
    let randomText = "";
    for (let i = 0; i < subtitleText.length; i++) {
      randomText += randomCharacters.charAt(
        Math.floor(Math.random() * randomCharacters.length)
      );
    }
    subtitleSpan.textContent = randomText;
  }

  function showFinalText() {
    subtitleSpan.textContent = subtitleText;
  }

  function startEffect() {
    const interval = setInterval(() => {
      generateRandomText();
      elapsedTime += 40;
      if (elapsedTime >= 2500) {
        clearInterval(interval);
        showFinalText();
      }
    }, 40);
  }

  startEffect();

  // Initialize AOS
  AOS.init({
    once: false,
    startEvent: "DOMContentLoaded",
    offset: 120,
    duration: 1200,
    easing: "ease-out-back",
  });

  // Initialize particles.js
  particlesJS("particles-js", {
    particles: {
      number: {value: 6, density: {enable: true, value_area: 800}},
      color: {value: "#1b1e34"},
      shape: {
        type: "edge",
        stroke: {width: 1, color: "#000"},
        polygon: {nb_sides: 3},
        image: {src: "img/github.svg", width: 100, height: 100},
      },
      opacity: {
        value: 0.16572100474277726,
        random: true,
        anim: {enable: false, speed: 1, opacity_min: 0.1, sync: false},
      },
      size: {
        value: 55.24033491425909,
        random: false,
        anim: {enable: false, speed: 10, size_min: 40, sync: false},
      },
      line_linked: {
        enable: false,
        distance: 200,
        color: "#ffffff",
        opacity: 1,
        width: 2,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "top",
        random: false,
        straight: true,
        out_mode: "out",
        bounce: false,
        attract: {enable: false, rotateX: 600, rotateY: 1200},
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {enable: false, mode: "repulse"},
        onclick: {enable: false, mode: "push"},
        resize: true,
      },
      modes: {
        grab: {distance: 400, line_linked: {opacity: 1}},
        bubble: {distance: 400, size: 40, duration: 2, opacity: 8, speed: 3},
        repulse: {distance: 200, duration: 0.4},
        push: {particles_nb: 4},
        remove: {particles_nb: 2},
      },
    },
    retina_detect: true,
  });

  // Stats for particles.js
  const stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  const countParticles = document.querySelector(".js-count-particles");
  function updateStats() {
    stats.begin();
    stats.end();
    if (
      window.pJSDom[0].pJS.particles &&
      window.pJSDom[0].pJS.particles.array
    ) {
      countParticles.innerText = window.pJSDom[0].pJS.particles.array.length;
    }
    requestAnimationFrame(updateStats);
  }
  requestAnimationFrame(updateStats);
});
