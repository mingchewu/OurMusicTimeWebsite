// Our Music Time — page behaviour (language, navigation, reveal, parallax,
// lightbox, videos, FAQ). The 3D piano lives in piano.js.
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");

  /* ───────── Piano availability ─────────
     The piano needs WebGL and the Three.js CDN. Until it reports in (or if it
     never does) the page uses a layout that doesn't leave room for it. */
  let pianoTimer = setTimeout(() => root.classList.add("no-piano"), 7000);
  window.OMTPianoStarted = (ok) => {
    clearTimeout(pianoTimer);
    root.classList.toggle("no-piano", !ok);
    window.dispatchEvent(new Event("resize"));
  };

  /* ───────── Event galleries (web-sized copies in media/web) ───────── */
  const range = (n, from = 1) => Array.from({ length: n }, (_, i) => i + from);
  const EVENTS = {
    2022: ["main.jpg", ...[7589, 7590, 7591, 7592, 7593, 7594].map((n) => `img_${n}.jpg`)],
    2023: ["main.jpg", ...[1, 2, 4, 5, 6, 7].map((n) => `${n}.jpg`), "8.png", ...range(8, 9).map((n) => `${n}.jpg`)],
    2024: ["main.jpg", ...range(13).map((n) => `${n}.jpg`)],
    2025: ["main.jpg", ...range(19).map((n) => (n === 3 ? "3.png" : `${n}.jpg`))],
    2026: [
      "2026-english-poster-2.jpg", "2026-chinese-poster-2.jpg", "image.jpg", "image-2.jpg",
      // Taiwan workshop flyers (1 is rendered from the PDF beside it in media/events/2026)
      "2026-omt-taiwan-workshop-1.png", "2026-omt-taiwan-workshop-2.jpg", "2026-omt-taiwan-workshop-3.jpg",
      ...[1972, 2662, 2663, 4497, 4499, 4503, 4511, 4515, 4517, 4518].map((n) => `img_${n}.jpg`),
    ],
  };
  const eventImages = (year) => {
    let files = EVENTS[year] || [];
    if (year === "2026" && root.dataset.lang === "zh") {
      files = [files[1], files[0], ...files.slice(2)];
    }
    return files.map((f) => `media/web/events/${year}/${f}`);
  };

  /* ───────── Language ───────── */
  function setLang(lang, persist) {
    root.dataset.lang = lang;
    root.lang = lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-set-lang]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
    });
    if (persist) {
      try { localStorage.setItem("omt-lang", lang); } catch (e) {}
      const url = new URL(location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.delete("lang");
        history.replaceState(null, "", url);
      }
    }
    // Layout shifts when text swaps; let scroll-driven pieces re-measure.
    window.dispatchEvent(new Event("resize"));
  }
  document.querySelectorAll("[data-set-lang]").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.setLang, true));
  });
  setLang(root.dataset.lang || "en", false);

  /* ───────── FAQ ───────── */
  const faqList = document.getElementById("faq-list");
  if (faqList && window.FAQ) {
    const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
    faqList.innerHTML = window.FAQ.map((item, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `
        <details class="qa" data-reveal>
          <summary>
            <span class="qa-n">${n}</span>
            <span><span lang="en">${esc(item.en.q)}</span><span lang="zh-Hant">${esc(item.zh.q)}</span></span>
            <span class="qa-icon" aria-hidden="true"></span>
          </summary>
          <div class="qa-a"><div>
            <p lang="en">${esc(item.en.a)}</p>
            <p lang="zh-Hant">${esc(item.zh.a)}</p>
          </div></div>
        </details>`;
    }).join("");

    // Keep the close transition: delay removing [open] until it collapses.
    faqList.querySelectorAll(".qa").forEach((d) => {
      d.querySelector("summary").addEventListener("click", (e) => {
        if (!d.open || reduceMotion) return;
        e.preventDefault();
        d.classList.add("is-closing");
        d.querySelector(".qa-a").style.gridTemplateRows = "0fr";
        setTimeout(() => {
          d.open = false;
          d.classList.remove("is-closing");
          d.querySelector(".qa-a").style.gridTemplateRows = "";
        }, 450);
      });
    });
  }

  /* ───────── Navigation ───────── */
  const nav = document.getElementById("nav");
  const menu = document.getElementById("menu");
  const menuBtn = document.querySelector(".menu-btn");
  let lastY = window.scrollY;

  function onNavScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    const menuOpen = menuBtn.getAttribute("aria-expanded") === "true";
    nav.classList.toggle("is-hidden", !menuOpen && y > lastY && y > window.innerHeight * 0.6);
    lastY = y;
  }

  function toggleMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", () => toggleMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggleMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) toggleMenu(false); });

  // Highlight the section in view
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => {
    const target = document.querySelector(a.hash);
    if (target) spy.observe(target);
  });

  /* ───────── Reveal on scroll ───────── */
  const revealables = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    // Stagger siblings that enter together
    revealables.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      const i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach((el) => io.observe(el));
  }

  /* ───────── Parallax ───────── */
  const layers = [...document.querySelectorAll("[data-parallax]")];
  const imgs = [...document.querySelectorAll("[data-parallax-img]")];
  let ticking = false;

  function parallax() {
    ticking = false;
    const vh = window.innerHeight;
    const mid = vh / 2;

    layers.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
      const speed = parseFloat(el.dataset.parallax) || 0;
      const offset = (r.top + r.height / 2 - mid) * speed;
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });

    imgs.forEach((img) => {
      const frame = img.parentElement;
      if (!frame.offsetParent && img.offsetParent === null) return;
      const r = frame.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      // -1 (entering from below) … 1 (leaving at top)
      const p = (mid - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      img.style.transform = `translate3d(0, ${(p * r.height * 0.055).toFixed(1)}px, 0) scale(1.12)`;
    });
  }

  function onScroll() {
    onNavScroll();
    if (!reduceMotion && !ticking) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
  }
  const footer = document.querySelector(".footer");
  const setFooterH = () => root.style.setProperty("--footer-h", `${footer.offsetHeight}px`);
  setFooterH();
  window.addEventListener("resize", setFooterH);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ───────── Lite YouTube ───────── */
  document.querySelectorAll(".video[data-yt]").forEach((btn) => {
    const id = btn.dataset.yt;
    btn.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-playing")) return;
      // YouTube refuses to embed without a referring site (error 153), which a
      // page opened straight from disk can't provide — open it on YouTube instead.
      if (location.protocol === "file:") {
        window.open(`https://www.youtube.com/watch?v=${id}`, "_blank", "noopener");
        return;
      }
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = "Our Music Time — theme song";
      iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      btn.classList.add("is-playing");
      btn.appendChild(iframe);
    });
  });

  /* ───────── Lightbox ─────────
     The clicked image flips over, like a card, into a larger view sized to
     the picture (never the whole page) — and flips back into place on close. */
  const lb = document.getElementById("lightbox");
  const card = lb.querySelector(".lb-card");
  const frontImg = lb.querySelector(".lb-front img");
  const backImg = lb.querySelector(".lb-back img");
  const lbCount = lb.querySelector(".lb-count");
  const lbThumbs = lb.querySelector(".lb-thumbs");
  let set = [];
  let idx = 0;
  let opener = null;
  let sourceImg = null;
  let closing = false;

  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const aspectOf = (img) => (img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 3 / 4);

  // The largest comfortable size for an image of this shape
  function fitRect(aspect) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const narrow = vw < 700;
    const maxW = Math.min(vw * (narrow ? 0.88 : 0.62), 980);
    const maxH = Math.min(vh * (narrow ? 0.58 : 0.7), 760);
    let w = maxW, h = w / aspect;
    if (h > maxH) { h = maxH; w = h * aspect; }
    const lift = set.length > 1 ? Math.min(40, vh * 0.04) : 0; // room for thumbnails
    return { left: (vw - w) / 2, top: (vh - h) / 2 - lift, width: w, height: h };
  }

  function place(r, animate) {
    if (!animate) card.style.transition = "none";
    card.style.left = `${r.left}px`;
    card.style.top = `${r.top}px`;
    card.style.width = `${r.width}px`;
    card.style.height = `${r.height}px`;
    if (!animate) { void card.offsetWidth; card.style.transition = ""; }
  }

  // Animate between the image on the page and the card, turning it over
  function flip(r, opening) {
    const s = sourceImg && sourceImg.getBoundingClientRect();
    if (reduceMotion || !s || !s.width) return Promise.resolve();
    const onPage = { left: `${s.left}px`, top: `${s.top}px`, width: `${s.width}px`, height: `${s.height}px`, transform: "perspective(1800px) rotateY(0deg)" };
    const open = { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, transform: "perspective(1800px) rotateY(180deg)" };
    const anim = card.animate(opening ? [onPage, open] : [open, onPage], {
      duration: opening ? 1000 : 750,
      easing: "cubic-bezier(0.2, 0.7, 0.1, 1)",
      fill: opening ? "none" : "forwards",
    });
    return anim.finished.catch(() => {});
  }

  function setCurrent() {
    lbCount.textContent = `${idx + 1} / ${set.length}`;
    [...lbThumbs.children].forEach((t, n) => {
      t.setAttribute("aria-current", String(n === idx));
      if (n === idx) t.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }

  async function show(i) {
    if (set.length < 2) return;
    idx = (i + set.length) % set.length;
    const src = set[idx];
    setCurrent();
    backImg.classList.add("is-loading");
    const img = await loadImage(src);
    if (set[idx] !== src) return; // moved on meanwhile
    place(fitRect(aspectOf(img)), true);
    backImg.src = src;
    backImg.classList.remove("is-loading");
  }

  function open(images, from) {
    set = images;
    idx = 0;
    opener = from;
    sourceImg = [...from.querySelectorAll("img")].find((im) => im.offsetParent !== null) || null;
    const thumb = sourceImg ? sourceImg.currentSrc || sourceImg.src : images[0];
    frontImg.src = thumb;
    backImg.src = thumb; // sharp version swaps in once loaded
    backImg.alt = sourceImg ? sourceImg.alt : "";
    lb.classList.toggle("is-single", set.length < 2);
    lbThumbs.innerHTML = set.length > 1
      ? set.map((src, n) => `<button type="button" aria-label="${n + 1}"><img src="${src.replace("media/web/", "media/web/sm/")}" alt="" loading="lazy"></button>`).join("")
      : "";

    lb.showModal();
    document.body.style.overflow = "hidden";
    const r = fitRect(aspectOf(sourceImg));
    place(r, false);
    requestAnimationFrame(() => lb.classList.add("is-open"));
    flip(r, true);
    if (set.length > 1) setCurrent();

    loadImage(images[0]).then((img) => {
      if (set !== images || idx !== 0 || !img) return;
      backImg.src = images[0];
      // The first image of a gallery may differ in shape from its cover
      if (Math.abs(aspectOf(img) - aspectOf(sourceImg)) > 0.02) place(fitRect(aspectOf(img)), true);
    });
  }

  async function close() {
    if (closing || !lb.open) return;
    closing = true;
    lb.classList.remove("is-open");
    const r = card.getBoundingClientRect();
    // Only fly back to the page image when we're still showing it
    if (idx === 0) {
      await flip({ left: r.left, top: r.top, width: r.width, height: r.height }, false);
    } else {
      await card.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).finished;
    }
    lb.close();
    card.getAnimations().forEach((a) => a.cancel());
    document.body.style.overflow = "";
    backImg.removeAttribute("src");
    if (opener) opener.focus({ preventScroll: true });
    closing = false;
  }

  lb.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-scrim").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
  lbThumbs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) show([...lbThumbs.children].indexOf(b));
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  window.addEventListener("resize", () => {
    if (lb.open && !closing) place(fitRect(card.offsetWidth / card.offsetHeight), false);
  });

  // Swipe between images
  let sx = null;
  card.addEventListener("pointerdown", (e) => { sx = e.clientX; });
  card.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });

  document.addEventListener("click", (e) => {
    const single = e.target.closest("[data-gallery]");
    const event = e.target.closest("[data-gallery-set]");
    if (single) {
      open(single.dataset.gallery.split(",").map((s) => s.trim()), single);
    } else if (event) {
      open(eventImages(event.dataset.gallerySet), event);
    }
  });
})();
