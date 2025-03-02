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

  const images3 = [
    "media/events/2024/main.jpg",
    "media/events/2024/1.jpg",
    "media/events/2024/2.jpg",
    "media/events/2024/3.jpg",
    "media/events/2024/4.jpg",
    "media/events/2024/5.jpg",
    "media/events/2024/6.jpg",
    "media/events/2024/7.jpg",
    "media/events/2024/8.jpg",
    "media/events/2024/9.jpg",
    "media/events/2024/10.jpg",
    "media/events/2024/11.jpg",
    "media/events/2024/12.jpg",
    "media/events/2024/13.jpg",
  ];

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

  const images4 = [
    "media/events/2025/main.jpg",
    "media/events/2025/1.JPG",
    "media/events/2025/2.JPG",
  ];

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
