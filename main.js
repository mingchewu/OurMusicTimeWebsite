// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 40) {
    navbar.style.background = "rgba(24,26,32,0.95)";
    navbar.style.boxShadow = "0 4px 24px 0 rgba(0,0,0,0.25)";
  } else {
    navbar.style.background = "var(--bg-glass)";
    navbar.style.boxShadow = "var(--shadow)";
  }
});

// Section entrance animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {threshold: 0.15}
);
document.querySelectorAll(".section").forEach((section) => {
  section.classList.add("invisible");
  observer.observe(section);
});

// Book descriptions (add your own descriptions here)
const bookDescriptions = {
  "../media/books/l1.JPG":
    "Level 1: A fun introduction to music for young beginners.",
  "../media/books/l2.JPG":
    "Level 2: Builds on foundational skills with new songs and activities.",
  "../media/books/l3.JPG":
    "Level 3: Expands musical knowledge and performance skills.",
  "../media/books/e1.jpg":
    "A collection of folk songs and rhymes for children.",
  "../media/books/e2.jpg":
    "More folk songs and rhymes for group and solo singing.",
  "../media/books/1.jpg": "Course Book 1: Core curriculum for Our Music Time.",
  "../media/books/2.jpg": "Course Book 2: Intermediate lessons and activities.",
  "../media/books/3.jpg":
    "Course Book 3: Advanced music learning and practice.",
  "../media/books/4.jpg": "Course Book 4: Special topics and seasonal music.",
  "../media/books/5.jpg": "Course Book 5: Review and enrichment materials.",
};

// Gallery popup
const galleryPhotos = document.querySelectorAll(".gallery-photo");
const popup = document.getElementById("image-popup");
const popupImg = document.getElementById("popup-image");
const popupClose = popup.querySelector(".close");
const popupDesc = popup.querySelector(".popup-desc");

galleryPhotos.forEach((img) => {
  img.addEventListener("click", () => {
    popupImg.src = img.getAttribute("data-popup");
    // Show description if available
    const desc = bookDescriptions[img.getAttribute("data-popup")] || "";
    popupDesc.textContent = desc;
    popup.classList.add("open");
    popupClose.focus();
  });
  img.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      img.click();
    }
  });
});
function closePopup() {
  popup.classList.remove("open");
}
popupClose.addEventListener("click", closePopup);
popup.addEventListener("click", (e) => {
  if (e.target === popup) closePopup();
});
document.addEventListener("keydown", (e) => {
  if (popup.classList.contains("open") && e.key === "Escape") closePopup();
});

// Event popups with carousels
const eventImages = {
  2022: [
    "../media/events/2022/main.jpg",
    "../media/events/2022/IMG_7589.JPG",
    "../media/events/2022/IMG_7590.JPG",
    "../media/events/2022/IMG_7591.JPG",
    "../media/events/2022/IMG_7592.JPG",
    "../media/events/2022/IMG_7593.JPG",
    "../media/events/2022/IMG_7594.JPG",
  ],
  2023: [
    "../media/events/2023/main.JPG",
    "../media/events/2023/1.JPG",
    "../media/events/2023/2.JPG",
    "../media/events/2023/4.JPG",
    "../media/events/2023/5.JPG",
    "../media/events/2023/6.JPG",
    "../media/events/2023/7.JPG",
    "../media/events/2023/8.png",
    "../media/events/2023/9.JPG",
    "../media/events/2023/10.JPG",
    "../media/events/2023/11.JPG",
    "../media/events/2023/12.JPG",
    "../media/events/2023/13.JPG",
    "../media/events/2023/14.JPG",
    "../media/events/2023/15.JPG",
    "../media/events/2023/16.JPG",
  ],
  2024: [
    "../media/events/2024/main.JPG",
    "../media/events/2024/1.JPG",
    "../media/events/2024/2.jpg",
    "../media/events/2024/3.jpg",
    "../media/events/2024/4.jpg",
    "../media/events/2024/5.jpg",
    "../media/events/2024/6.jpg",
    "../media/events/2024/7.jpg",
    "../media/events/2024/8.jpg",
    "../media/events/2024/9.jpg",
    "../media/events/2024/10.jpg",
    "../media/events/2024/11.jpg",
    "../media/events/2024/12.jpg",
    "../media/events/2024/13.jpg",
  ],
  2025: [
    "../media/events/2025/main.jpg",
    "../media/events/2025/1.JPG",
    "../media/events/2025/2.JPG",
    "../media/events/2025/4.png",
    "../media/events/2025/3.png",
  ],
};

const eventPopups = document.getElementById("event-popups");
document.querySelectorAll("[data-popup-btn]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const year = btn.getAttribute("data-popup-btn");
    showEventPopup(year);
  });
});
function showEventPopup(year) {
  const images = eventImages[year];
  let idx = 0;
  eventPopups.innerHTML = `
    <div class="popup open" tabindex="-1">
      <span class="close" tabindex="0">&times;</span>
      <div class="event-carousel">
        <button class="carousel-arrow left" aria-label="Previous image">&#9664;</button>
        <img src="${
          images[0]
        }" class="carousel-img" alt="${year} event image" />
        <button class="carousel-arrow right" aria-label="Next image">&#9654;</button>
      </div>
      <div class="carousel-indicator">${idx + 1} / ${images.length}</div>
    </div>
  `;
  const popup = eventPopups.querySelector(".popup");
  const closeBtn = popup.querySelector(".close");
  const img = popup.querySelector(".carousel-img");
  const left = popup.querySelector(".carousel-arrow.left");
  const right = popup.querySelector(".carousel-arrow.right");
  const indicator = popup.querySelector(".carousel-indicator");
  function updateImg() {
    img.src = images[idx];
    indicator.textContent = `${idx + 1} / ${images.length}`;
  }
  left.onclick = () => {
    idx = (idx - 1 + images.length) % images.length;
    updateImg();
  };
  right.onclick = () => {
    idx = (idx + 1) % images.length;
    updateImg();
  };
  closeBtn.onclick = () => {
    eventPopups.innerHTML = "";
  };
  popup.onclick = (e) => {
    if (e.target === popup) closeBtn.onclick();
  };
  popup.focus();
  popup.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBtn.onclick();
    if (e.key === "ArrowLeft") left.click();
    if (e.key === "ArrowRight") right.click();
    if (e.key === "Tab") {
      // trap focus
      const focusables = [closeBtn, left, right];
      let idxF = focusables.indexOf(document.activeElement);
      if (e.shiftKey) idxF = (idxF - 1 + focusables.length) % focusables.length;
      else idxF = (idxF + 1) % focusables.length;
      focusables[idxF].focus();
      e.preventDefault();
    }
  });
}

// FAQ accordion
const faqData = [
  {
    q: "The English songs in the Our Music Time course materials are more difficult for children and teachers to learn in Taiwan. How to overcome it?",
    a: "Zoltán Kodály has always advocated learning music in the mother tongue, especially folk songs passed down from generation to generation. If children learn these folk songs, they should use the original language to learn the essence of music; in contrast, when children learn Chinese folk songs abroad, they also hope to learn in Chinese.",
  },
  {
    q: "Can the teachers translate the folk songs in English into Chinese for children to learn?",
    a: "My suggestion is not. As mentioned above, the reason is to let students feel the original meaning of the lyrics. The teachers can translate in advance to let students understand before teaching them to sing.",
  },
  {
    q: "How can I efficiently add all the Our Music Time lessons into individual piano lessons?",
    a: "The Kodály Method has always emphasized that children must undergo three procedures (3 Ps) to learn a new topic: Prepare, Present, and Practice. The teachers notice the 'Present' appearing in one of the activities in the lesson plan. They must bring this subject into the individual piano lessons because the themes learned through these three procedures can allow students to understand the subject's meaning cognitively.",
  },
  {
    q: "Is Our Music Time lesson plan only suitable for piano?",
    a: "No. All instruments, such as flute, violin, and percussion, can be used with the designed lessons.",
  },
  {
    q: "How do you simultaneously plan private lessons and match the My First Piano Adventure with Our Music Time lesson plans?",
    a: "The proportion of instrument lessons in Our Music Time lesson plans can increase according to the children's learning ability. Suppose a piano lesson is 60 minutes weekly for beginners or under five. In that case, the children can have 10-20 minutes for piano learning, and the remaining 40-50 minutes will focus on the Our Music Time curriculum.",
  },
  {
    q: "Can teachers use other piano textbooks?",
    a: "Of course! Suppose the teacher wants to keep using other piano textbooks for the current students. In that case, as long as the Our Music Time lesson plans are in a timely, appropriate manner according to the needs of each student.",
  },
  {
    q: "Are all Our Music Time lesson plans only suitable for children in preschool or beginners?",
    a: "Of course not! They are suitable for all ages at different levels. Suppose music teachers have trained using more pedagogy to assist their children's learning of instruments. Their students will find it easier to overcome any difficulty through understanding.",
  },
  {
    q: "How long do the students complete the Elementary, Intermediate, and Advanced levels courses?",
    a: "Each book has five topics and 1 to 7 lessons for each. The 6th and 7th lessons are for the general review and for preparing the next unit. Each level course takes about six months to one year. Students will complete three levels in less than three years, depending on the student's age and learning ability.",
  },
  {
    q: "How do we tell parents that 'Slow Learning' is a better concept than 'Faster Learning'?",
    a: "Parents nowadays want their children to learn instruments quickly. 'Learning slowly' lays a good foundation for children to learn music, focusing on the three essential elements of music: beat, rhythm, and intonation, so that the children can learn instruments from complicated to simple and make the most neglected experiment. Singing and listening to music should be established first, then instrument learning.",
  },
  {
    q: "Do Our Music Time courses have other things besides training children's audition dictation?",
    a: "Learning all aspects of music has always been our central philosophy. Through singing, tapping, the beat, and clapping the rhythm, children's brain integration ability is trained so that the left brain controls the right side of the body. Then, the right brain controls the left body and uses the integration ability of the brain to learn instrumental music. For example, the stability of the playing speed does not have to rely on the metronome or the practice of finger skills and musical expression. One's brain can control it and can focus on all-round learning.",
  },
  {
    q: "Is there a link to learn all the songs?",
    a: "All teachers participating in Our Music Time online training course will receive a Google link sung by our lovely singer, Aurelia, with the purest voice.",
  },
  {
    q: "What does the teacher use the size of the whiteboard in training courses?",
    a: "Chiunglien uses three sizes of whiteboard, all double-sided, for magnets. The three sizes of the whiteboard are as follows. Small Dimensions: L 12 x W16 inches Medium Dimensions: L 24 x W 18 inches Large Dimensions: L 24 x W 68 inches",
  },
  {
    q: "What do Our Music Time 2023 Online 15-week courses include?",
    a: "There is homework every week. Teachers must record short videos and discuss them to achieve the most incredible teaching results. Submit a complete unit video (at least 10 to 20 minutes) after each course level, which has been prepared for the qualification standard of Our Music Time. Every teacher participating in the course has 10-20 minutes of individual time weekly to analyze and discuss with the teacher. This discussion time is by appointment only. Contact us for more information on the course and tuition. You can pay it in installments.",
  },
  {
    q: "What are the requirements for becoming a certified Our Music Time teacher?",
    a: "You must complete the three-volume curriculum in the teacher training course. Submit 20-30 minutes of elementary, intermediate, and advanced teaching videos. It is necessary to purchase a complete set of Song Picture Magnetic and Felt Storybooks to supplement the courses in group or private lessons.",
  },
];
const faqList = document.querySelector(".faq-list");
faqData.forEach((item, i) => {
  const faq = document.createElement("div");
  faq.className = "faq-item";
  faq.tabIndex = 0;
  faq.innerHTML = `
    <div class="faq-question">${item.q}<span class="faq-icon">▼</span></div>
    <div class="faq-answer">${item.a}</div>
  `;
  faq.addEventListener("click", () => toggleFaq(faq));
  faq.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") toggleFaq(faq);
    if (e.key === "ArrowDown") {
      const next = faq.nextElementSibling;
      if (next) next.focus();
    }
    if (e.key === "ArrowUp") {
      const prev = faq.previousElementSibling;
      if (prev) prev.focus();
    }
  });
  faqList.appendChild(faq);
});
function toggleFaq(faq) {
  const open = faq.classList.contains("open");
  document
    .querySelectorAll(".faq-item.open")
    .forEach((f) => f.classList.remove("open"));
  if (!open) faq.classList.add("open");
}

// Hero subtitle scramble effect
const subtitle = document.querySelector(".hero-subtitle");
const subtitleText = subtitle.textContent;
const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";
let scrambleInterval = null;
function scrambleText(el, text, duration = 1800) {
  let elapsed = 0;
  scrambleInterval = setInterval(() => {
    let out = "";
    for (let i = 0; i < text.length; i++) {
      out +=
        Math.random() < 0.5
          ? chars[Math.floor(Math.random() * chars.length)]
          : text[i];
    }
    el.textContent = out;
    elapsed += 40;
    if (elapsed > duration) {
      clearInterval(scrambleInterval);
      el.textContent = text;
    }
  }, 40);
}
scrambleText(subtitle, subtitleText, 1800);

// Section entrance animation helpers
const style = document.createElement("style");
style.innerHTML = `.invisible{opacity:0;transform:translateY(60px);} .visible{opacity:1;transform:translateY(0);transition:all 1s cubic-bezier(.4,0,.2,1);}`;
document.head.appendChild(style);
