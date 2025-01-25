document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");

    question.addEventListener("click", () => {
      const isOpen = answer.classList.contains("open");
      document
        .querySelectorAll(".faq-answer")
        .forEach((el) => el.classList.remove("open"));
      document
        .querySelectorAll(".faq-icon")
        .forEach((el) => el.classList.remove("open"));

      if (!isOpen) {
        answer.classList.add("open");
        icon.classList.add("open");
      }
    });
  });
});
window.onscroll = function () {
  var navbar = document.getElementById("navbar");
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
};

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

function prevImage() {
  const newIndex = (currentIndex - 1 + images.length) % images.length;
  updateImage(newIndex);
}

function nextImage() {
  const newIndex = (currentIndex + 1) % images.length;
  updateImage(newIndex);
}

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

function prevImage2() {
  const newIndex = (currentIndex2 - 1 + images2.length) % images2.length;
  updateImage2(newIndex);
}

function nextImage2() {
  const newIndex = (currentIndex2 + 1) % images2.length;
  updateImage2(newIndex);
}
