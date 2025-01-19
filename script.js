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
