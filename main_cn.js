// 導航欄滾動效果
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

// 區塊進入動畫
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

// 畫廊彈出視窗
const galleryPhotos = document.querySelectorAll(".gallery-photo");
const popup = document.getElementById("image-popup");
const popupImg = document.getElementById("popup-image");
const popupClose = popup.querySelector(".close");
const popupDesc = popup.querySelector(".popup-desc");

galleryPhotos.forEach((img) => {
  img.addEventListener("click", () => {
    popupImg.src = img.getAttribute("data-popup") || img.src;
    // 從 'data-desc' 屬性獲取描述
    const desc = img.getAttribute("data-desc") || "";
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

// 帶有輪播的活動彈出視窗
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
        <button class="carousel-arrow left" aria-label="上一張圖片">&#9664;</button>
        <img src="${images[0]}" class="carousel-img" alt="${year} 活動照片" />
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
      // 鎖定焦點
      const focusables = [closeBtn, left, right];
      let idxF = focusables.indexOf(document.activeElement);
      if (e.shiftKey) idxF = (idxF - 1 + focusables.length) % focusables.length;
      else idxF = (idxF + 1) % focusables.length;
      focusables[idxF].focus();
      e.preventDefault();
    }
  });
}

// 問與答手風琴效果
const faqData = [
  {
    q: "1. 在台灣「Our Music Time」課程中的英文歌曲可能對兒童和教師來說較難學習。我們該如何克服這項挑戰？",
    a: `<p>Zoltán Kodály 長期以來主張以母語學習音樂，特別是代代相傳的民謠。當孩子學習這些民謠時，使用原文語言非常重要，這樣才能真正掌握音樂的精髓。同樣地，當國外的孩子學習中文民謠時，理想情況下也應該以中文來學習，以體驗完整的意義與文化背景。我們可以從以下幾點著手：</p>
         <ul>
             <li>從本地民謠開始，建立音樂基礎。</li>
             <li>漸進式地引入英文歌曲或童謠。</li>
             <li>將歌曲與台灣文化連結，以提升理解力。</li>
             <li>提供雙語教材與發音訓練，支援教師教學。</li>
             <li>初期使用翻譯協助理解，再回到原文歌詞演唱。</li>
             <li>著重音樂表現力，而非完美的英文發音。</li>
         </ul>`,
  },
  {
    q: "2. 老師可以將英文民謠翻譯成中文讓孩子學習嗎？",
    a: "<p>我的建議是不要。理由如上面所述，要讓學生感受歌詞的原意，可以事先翻譯讓學生了解再教唱。</p>",
  },
  {
    q: "3. 如何有效率把 「Our Music Time」 的所有課程教案加入個別的鋼琴課呢？",
    a: "<p>高大宜教學法中一直很重視學生們學習一個新的主題必須經過三個程序 (3Ps): 準備 (Prepare)、命名 (Present) 和練習 (Practice)。 所以老師們若看到課程教案裡的「命名」，那這首歌或活動一定要帶入鋼琴的個別課裡，因為透過這三個程序而學會的主題，才能讓學生體會與認知這個主題的含義。</p>",
  },
  {
    q: "4.「Our Music Time」 的課程教案在器樂中的學習只適合鋼琴課嗎？",
    a: "<p>不是。所有樂器皆可一起搭配已設計好的課程教案。例如，長笛、小提琴、打擊樂器...</p>",
  },
  {
    q: "5. 如何規劃上個別課並同時搭配芬貝爾鋼琴教本與「Our Music Time」的課程教案呢？",
    a: "<p>如果是給五歲以下或初學的學生，以60分鐘的課程為例，剛開始的鋼琴教學只佔10-20分鐘，之後因應孩子的年齡和學習能力，來繼續增加樂器的比例。老師們也可以參考每一個課程教案裡，都有詳盡的芬貝爾鋼琴教本 (My First Piano Adventure) 使用。</p>",
  },
  {
    q: "6. 請問老師們可否使用其它的鋼琴教本呢？",
    a: "<p>當然可以！如果老師希望繼續使用學生原本習用的鋼琴教本，也沒有問題。只要在教學過程中，根據每位學生的學習需求，適時加入「Our Music Time」的課程教案，來輔助學生的整體學習效果即可。</p>",
  },
  {
    q: "7.「Our Music Time」的所有課程教案是否只適用於學齡前兒童或初學者？",
    a: "<p>絕對不是！這套課程設計適合各個年齡層的學生。每位音樂老師除了教授樂器本身的技能外，也需要運用不同的教學方法來輔助孩子的學習。例如，對於已經學習多年鋼琴但在節奏、拍子或音樂表現方面有困難的學生，可以透過「Our Music Time」的訓練課程來幫助改善這些問題。</p>",
  },
  {
    q: "8. 學生完成 「Our Music Time」三個階段(初級、中級與高級)課程大約需要多久時間？",
    a: "<p>每一本教材包含五個主題，每個主題有 1 至 7 節課。其中第 6 與第 7 節課主要用於整體複習與銜接下一單元的準備。每個級別通常需要三個月至一年完成。根據學生的年齡與學習能力，他們可以在一到三年內完成全部三個級別的課程。</p>",
  },
  {
    q: "9. 如何和家長溝通「慢慢學」其實才是更快更好的學習觀念呢？",
    a: "<p>現今許多家長希望孩子能快速掌握樂器技巧，但其實「慢慢學」才是打好基礎的關鍵。透過逐步建立拍子、節奏與音準的基本元素，能幫助孩子在音樂學習上打下穩固的基礎。只有先掌握好這些基本元素，才能讓音樂學習變得由繁入簡，也能幫助孩子在試唱、聽音等技能上建立良好的基礎，進而提升整體學習效果。</p>",
  },
  {
    q: "10.「Our Music Time」的所有課程除了訓練孩子的試唱、聽寫之外，還有其他內容嗎？",
    a: "<p>是的！我們的課程旨在讓孩子進行全方位的音樂學習。除了試唱與聽寫，課程還包括唱歌、打拍子和節奏訓練，這些活動有助於鍛鍊孩子的大腦整合能力。透過這些練習，孩子能更好地協調左右腦，提升身體的協調性與音樂表現力。例如，穩定演奏速度不再完全依賴節拍器，手指技巧的提升，以及音樂情感的表達，都能透過自主的腦部控制來達成，讓孩子能專注於全面的音樂素養。</p>",
  },
  {
    q: "11. 請問有網路連結可以學所有的歌曲嗎？",
    a: "<p>參與「Our Music Time」課程的老師們，會獲得一個Google連結，裡面收錄由可愛的 Aurelia小朋友以純真的童聲清唱的歌曲。這個連結方便老師們在教學時隨時調用學習歌曲，但目前沒有公開的整套歌曲下載或線上學習平台，僅供課程內部使用。</p>",
  },
  {
    q: "12. 請問老師上課使用的白板尺寸？",
    a: `<p>老師常用的白板有三種尺寸，且每個白板都是雙面設計，可放置磁鐵。</p>
         <ul>
            <li>小尺寸：長12英寸 x 寬16英寸</li>
            <li>中尺寸：長24英寸 x 寬18英寸</li>
            <li>大尺寸：長24英寸 x 寬68英寸</li>
         </ul>`,
  },
  {
    q: "13. 「Our Music Time」的線上師資培訓課程包含哪些內容？",
    a: `<ul>
            <li>參與培訓的老師每週需完成作業，內容包括錄製自己教學的影片，可以與瓊蓮老師及其他老師討論，以達到最佳教學效果。每個級別 (初級、中級、高級) 都包含五堂課的教案。</li>
            <li>每個課程單元結束後，需提交教學影片(約3到5分鐘)，以符合 「Our Music Time」的審查標準。</li>
            <li>每週約有20分鐘的個別諮詢時間，老師可以預約與指導老師進行討論與分析。</li>
            <li>上課費用請私訊詢問，可提供分期付款方案。</li>
        </ul>`,
  },
  {
    q: "14. 如果想成為「Our Music Time」認證老師，需具備哪些條件？",
    a: `<ul>
            <li>必須完成師資培訓課程中的三冊完整教材內容。</li>
            <li>需繳交初級、中級和高級的教學錄影片各20-30分鐘。</li>
            <li>必須購買一套完整的「歌曲圖像磁鐵」與「布織布故事書」，以輔助團體課或個別課程的教學。</li>
        </ul>`,
  },
  {
    q: "15. 音樂教室若希望與「Our Music Time」需要符合哪些條件？",
    a: `<p>為確保教學品質與課程的一致性，音樂教室在申請合作前，需符合以下條件：</p>
        <ul>
            <li>教室內須至少有一位教師通過我們的師資審核與培訓。</li>
            <li>購買全套「Our Music Time」教材套組，包括歌曲圖像磁鐵、毛氈故事書與教學指引等核心教具。</li>
            <li>這些教材設計用於小班制或一對一教學，可大幅提升學生的學習效果與互動參與。</li>
        </ul>
        <p>若您有意成為合作教室，歡迎聯繫我們索取合作說明資料及申請表單。</p>`,
  },
];

const faqList = document.querySelector(".faq-list");
if (faqList) {
  faqList.innerHTML = ""; // 清空由 HTML 硬編碼的任何內容
  faqData.forEach((item) => {
    const faq = document.createElement("div");
    faq.className = "faq-item";
    faq.innerHTML = `
      <button class="faq-question">
        ${item.q}
        <span class="faq-icon"></span>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-content">${item.a}</div>
      </div>
    `;
    const questionButton = faq.querySelector(".faq-question");
    questionButton.addEventListener("click", () => toggleFaq(faq));
    faqList.appendChild(faq);
  });
}

function toggleFaq(faq) {
  faq.classList.toggle("open");
}

// 英雄區塊副標題文字特效
const subtitle = document.querySelector(".hero-subtitle");
if (subtitle) {
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
}

// 區塊進入動畫輔助
const style = document.createElement("style");
style.innerHTML = `.invisible{opacity:0;transform:translateY(60px);} .visible{opacity:1;transform:translateY(0);transition:all 1s cubic-bezier(.4,0,.2,1);}`;
document.head.appendChild(style);
