const faqDataCn = [
  {
    q: "The English songs in the Our Music Time course materials are more difficult for children and teachers to learn in Taiwan. How to overcome it?",
    a: "高大宜一直提倡用母語學習音樂，尤其是代代相傳的民謠。如果孩子學習這些民謠，他們應該用原來的語言來學習音樂的精髓；反之，當孩子在國外學習中國民謠時，他們也希望用中文學習。",
  },
  {
    q: "老師可以將英文民謠翻譯成中文讓孩子學習嗎？",
    a: "我的建議是不要。如前所述，原因是要讓學生感受到歌詞的本義。老師可以提前翻譯，讓學生在教唱之前了解。",
  },
  {
    q: "如何將所有 Our Music Time 課程有效地加入到個別鋼琴課中？",
    a: "高大宜教學法一直強調，孩子在學習新主題時必須經歷三個程序（3 Ps）：準備（Prepare）、呈現（Present）和練習（Practice）。老師會注意到「呈現」出現在教案的其中一個活動中。他們必須將這個主題帶入個別鋼琴課，因為透過這三個程序學習的主題，可以讓學生在認知上了解該主題的意義。",
  },
  {
    q: "Our Music Time 教案只適合鋼琴嗎？",
    a: "不。所有樂器，如長笛、小提琴和打擊樂器，都可以使用設計好的課程。",
  },
  {
    q: "如何同時規劃私人課程，並將「我的第一本鋼琴探險」與 Our Music Time 教案結合？",
    a: "Our Music Time 教案中樂器課程的比例，可以根據孩子的學習能力增加。假設初學者或五歲以下孩子的鋼琴課是每週 60 分鐘。在這種情況下，孩子可以有 10-20 分鐘的鋼琴學習，剩下的 40-50 分鐘將專注於 Our Music Time 課程。",
  },
  {
    q: "老師可以使用其他鋼琴教材嗎？",
    a: "當然可以！假設老師想為現有學生繼續使用其他鋼琴教材。在這種情況下，只要 Our Music Time 教案根據每個學生的需求及時、適當地進行即可。",
  },
  {
    q: "所有 Our Music Time 教案都只適合學齡前或初學兒童嗎？",
    a: "當然不是！它們適合所有年齡和不同程度的學生。假設音樂老師已經接受過更多教學法的培訓，以協助孩子學習樂器。他們的學生將發現，透過理解，更容易克服任何困難。",
  },
  {
    q: "學生完成初級、中級和高級課程需要多長時間？",
    a: "每本書有五個主題，每個主題有 1 到 7 節課。第 6 節和第 7 節課是總複習和為下一個單元做準備。每個級別的課程大約需要半年到一年的時間。學生將在不到三年的時間內完成三個級別，具體取決於學生的年齡和學習能力。",
  },
  {
    q: "我們如何告訴家長「慢學」比「快學」是更好的概念？",
    a: "現在的家長都希望孩子能快速學習樂器。「慢學」為孩子學習音樂奠定了良好的基礎，專注於音樂的三個基本要素：節拍、節奏和音準，讓孩子可以從複雜到簡單地學習樂器，並進行最常被忽略的實驗。應該先建立唱歌和聽音樂的習慣，然後再學習樂器。",
  },
  {
    q: "Our Music Time 課程除了訓練孩子的聽寫能力外，還有其他內容嗎？",
    a: "學習音樂的各個方面一直是我們的核心理念。透過唱歌、敲擊、打拍子和拍節奏，訓練孩子的大腦整合能力，讓左腦控制身體右側。然後，右腦控制身體左側，並利用大腦的整合能力來學習器樂。例如，演奏速度的穩定性不必依賴節拍器或手指技巧和音樂表現的練習。人的大腦可以控制它，並可以專注於全方位的學習。",
  },
  {
    q: "有連結可以學習所有的歌曲嗎？",
    a: "所有參加 Our Music Time 線上培訓課程的老師，都將收到我們可愛的歌手 Aurelia 用最純淨的聲音演唱的 Google 連結。",
  },
  {
    q: "老師在培訓課程中使用多大的白板？",
    a: "瓊蓮老師使用三種尺寸的雙面磁性白板。這三種白板尺寸如下：小尺寸：長 12 x 寬 16 英寸，中尺寸：長 24 x 寬 18 英寸，大尺寸：長 24 x 寬 68 英寸。",
  },
  {
    q: "Our Music Time 2023 線上 15 週課程包括哪些內容？",
    a: "每週都有作業。老師必須錄製短片並進行討論，以達到最不可思議的教學效果。在每個課程級別之後提交完整的單元影片（至少 10 到 20 分鐘），該影片已準備好符合 Our Music Time 的資格標準。每位參加課程的老師每週有 10-20 分鐘的個人時間與老師分析和討論。此討論時間僅限預約。聯繫我們了解更多有關課程和學費的資訊。您可以分期付款。",
  },
  {
    q: "成為認證的 Our Music Time 老師有什麼要求？",
    a: "您必須在師資培訓課程中完成三冊課程。提交 20-30 分鐘的初級、中級和高級教學影片。必須購買一整套歌曲圖卡磁鐵和不織布故事書，以補充團體或個別課程的教學。",
  },
];



function initApp() {
  try { hideLoader(2000); } catch(e) { console.error(e); }
  try { initNavbar(); } catch(e) { console.error(e); }
  try { initGallery(); } catch(e) { console.error(e); }
  try { initUtils(); } catch(e) { console.error(e); }
  try { initFAQ(faqDataCn); } catch(e) { console.error(e); }
  try { initAnimations(); } catch(e) { 
    console.error(e);
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
  }
  try { initScrambleEffect('hero-scramble-text', 1500); } catch(e) { console.error(e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
