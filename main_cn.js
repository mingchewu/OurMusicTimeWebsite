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

// Book descriptions (Traditional Chinese)
const bookDescriptions = {
  "../media/books/l1.JPG": "第一冊：為年幼初學者設計的有趣音樂入門。",
  "../media/books/l2.JPG": "第二冊：在基礎技能上加入新歌曲與活動。",
  "../media/books/l3.JPG": "第三冊：擴展音樂知識與表演技巧。",
  "../media/books/e1.jpg": "兒童民謠與童謠集錦。",
  "../media/books/e2.jpg": "更多適合團體與獨唱的民謠與童謠。",
  "../media/books/1.jpg": "課程教材一：我們的音樂時光核心課程。",
  "../media/books/2.jpg": "課程教材二：中級課程與活動。",
  "../media/books/3.jpg": "課程教材三：進階音樂學習與練習。",
  "../media/books/4.jpg": "課程教材四：主題單元與季節音樂。",
  "../media/books/5.jpg": "課程教材五：複習與延伸教材。",
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
        <button class="carousel-arrow left" aria-label="上一張圖片">&#9664;</button>
        <img src="${images[0]}" class="carousel-img" alt="${year} 年活動圖片" />
        <button class="carousel-arrow right" aria-label="下一張圖片">&#9654;</button>
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

// FAQ accordion (Traditional Chinese)
const faqData = [
  {
    q: "我們的音樂時光課程教材中的英文歌曲對台灣的孩子和老師來說較難學習，該如何克服？",
    a: "柯達伊（Zoltán Kodály）一直主張以母語學習音樂，特別是世代相傳的民謠。孩子學習這些民謠時，應以原文學習音樂的精髓；相對地，當孩子在國外學習中文民謠時，也希望能用中文學習。",
  },
  {
    q: "老師可以將英文民謠翻譯成中文讓孩子學習嗎？",
    a: "建議不要。如上所述，目的是讓學生感受歌詞的原意。老師可事先翻譯，讓學生理解後再教唱。",
  },
  {
    q: "如何有效地將我們的音樂時光課程融入個別鋼琴課？",
    a: '柯達伊教學法強調孩子學習新主題需經歷三個步驟（3P）：預備、呈現、練習。老師會發現課程計畫中有"呈現"這一活動，必須將此主題帶入個別鋼琴課，因為透過這三個步驟學習的主題，學生能更認知地理解內容。',
  },
  {
    q: "我們的音樂時光課程只適合鋼琴嗎？",
    a: "不是。所有樂器，如長笛、小提琴、打擊樂等，都可搭配設計的課程使用。",
  },
  {
    q: "如何同時規劃個別課並將My First Piano Adventure與我們的音樂時光課程結合？",
    a: "我們的音樂時光課程中樂器課比例可依孩子學習能力增加。假設初學者或五歲以下每週上60分鐘鋼琴課，可安排10-20分鐘學鋼琴，其餘40-50分鐘專注於我們的音樂時光課程。",
  },
  {
    q: "老師可以使用其他鋼琴教材嗎？",
    a: "當然可以！老師若想繼續使用其他鋼琴教材，只要能根據每位學生的需求，適時適當地融入我們的音樂時光課程即可。",
  },
  {
    q: "我們的音樂時光課程只適合學齡前或初學者嗎？",
    a: "當然不是！適合各年齡、不同程度。若音樂老師受過更多教學法訓練，能協助孩子學習樂器，學生會更容易克服困難。",
  },
  {
    q: "學生完成初級、中級、高級課程需多久？",
    a: "每本書有五個主題，每主題1至7課，第六、七課為總複習與下單元準備。每級約需半年至一年，三級不到三年可完成，視學生年齡與學習能力而定。",
  },
  {
    q: '如何向家長說明"慢學"比"快學"更好？',
    a: "現今家長希望孩子快速學樂器。'慢慢學'能為孩子打下良好音樂基礎，重點在於節拍、節奏、音準三大要素，讓孩子從複雜到簡單學樂器，最常被忽略的實驗——唱歌與聽音樂——應先建立，再學樂器。",
  },
  {
    q: "我們的音樂時光課程除了訓練聽寫，還有其他內容嗎？",
    a: "全方位學習音樂一直是我們的核心理念。透過唱歌、拍手、打節奏，訓練孩子大腦整合能力，左腦控制右身、右腦控制左身，運用大腦整合能力學樂器。例如，演奏速度的穩定不必依賴節拍器或手指技巧練習，靠大腦即可全方位學習。",
  },
  {
    q: "有連結可以學所有歌曲嗎？",
    a: "所有參加我們的音樂時光線上培訓課程的老師，會收到由我們可愛的小歌手Aurelia錄製的Google連結，純淨嗓音帶來最美的歌聲。",
  },
  {
    q: "老師在培訓課程中使用的白板尺寸？",
    a: "劉瓊蓮老師使用三種尺寸的雙面磁性白板。小：長12x寬16吋；中：長24x寬18吋；大：長24x寬68吋。",
  },
  {
    q: "2023年線上15週課程內容包含哪些？",
    a: "每週有作業，老師需錄短片討論以達最佳教學效果。每級課程結束後需繳交完整單元影片（10-20分鐘），作為我們的音樂時光資格標準。每位老師每週有10-20分鐘個別討論時間，需預約。歡迎聯絡我們了解課程與學費，可分期付款。",
  },
  {
    q: "如何成為我們的音樂時光認證老師？",
    a: "需完成三冊師資培訓課程，繳交初、中、高級20-30分鐘教學影片。需購買全套歌圖磁鐵與故事布書，輔助團體或個別課程。",
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
