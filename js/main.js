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
    veilStep("piano");
  };

  /* ───────── Loading veil ─────────
     Real progress — page ready, fonts loaded, piano started — fills the
     hairline; then the veil slides away and the piano assembles itself.
     It never waits more than a few seconds, and shows on every visit. */
  const veil = document.getElementById("veil");
  const veiled = root.classList.contains("is-loading") && veil;
  const veilParts = { dom: 0.2, fonts: 0.3, piano: 0.5 };
  const veilDone = new Set();
  const veilStart = performance.now();
  let veilLifted = false;
  function veilStep(part) {
    if (!veiled || veilLifted || veilDone.has(part)) return;
    veilDone.add(part);
    let p = 0.04;
    veilDone.forEach((k) => (p += veilParts[k] || 0));
    veil.querySelector(".veil-bar i").style.transform = `scaleX(${Math.min(1, p)})`;
    if (veilDone.size === Object.keys(veilParts).length) {
      // let the mark finish drawing before leaving
      setTimeout(liftVeil, Math.max(250, 1700 - (performance.now() - veilStart)));
    }
  }
  function liftVeil() {
    if (!veiled || veilLifted) return;
    veilLifted = true;
    veil.querySelector(".veil-bar i").style.transform = "scaleX(1)";
    setTimeout(() => {
      root.classList.add("is-lifting");
      root.classList.remove("is-loading");
      // the piano starts gathering as the veil clears its top half
      setTimeout(() => {
        window.__omtIntroGo = true;
        if (window.OMTPianoIntro) window.OMTPianoIntro();
      }, 380);
      setTimeout(() => {
        root.classList.remove("is-lifting", "is-intro");
        veil.remove();
      }, 1250);
    }, 320);
  }
  if (veiled) {
    veilStep("dom");
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => veilStep("fonts"));
    setTimeout(liftVeil, 3200); // never hold anyone back for long
  }

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

  // The bar hides after a deliberate run downwards and returns after one
  // upwards, so jerking the scroll back and forth doesn't make it flicker.
  let navRun = 0;
  function onNavScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    const dy = y - lastY;
    navRun = Math.sign(dy) === Math.sign(navRun) ? navRun + dy : dy;
    const menuOpen = menuBtn.getAttribute("aria-expanded") === "true";
    if (menuOpen || y < window.innerHeight * 0.6 || navRun < -40) nav.classList.remove("is-hidden");
    else if (navRun > 60) nav.classList.add("is-hidden");
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

  /* ───────── Weighted scrolling ─────────
     Wheel and trackpad input sets a target; the page eases toward it each
     frame, so scrolling glides to a stop instead of stepping. Touch screens
     keep their native momentum, and the keyboard or scrollbar always win. */
  const glide = { target: window.scrollY, y: window.scrollY, active: false, last: 0 };
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const clampY = (y) => Math.max(0, Math.min(maxScroll(), y));

  function glideStep(now) {
    const dt = Math.min((now - glide.last) / 1000, 0.05);
    glide.last = now;
    // Someone dragged the scrollbar or pressed a key mid-glide: let go
    if (Math.abs(window.scrollY - glide.y) > 3) { glide.active = false; return; }
    // big distances close faster than small ones: silky for a gentle scroll,
    // responsive for a hard flick
    const far = Math.min(Math.abs(glide.target - glide.y) / window.innerHeight, 1.5);
    glide.y += (glide.target - glide.y) * (1 - Math.exp(-dt * (5 + far * 5)));
    if (Math.abs(glide.target - glide.y) < 0.5) glide.y = glide.target;
    // keep the fractional position ourselves; the browser rounds what it shows
    window.scrollTo({ top: glide.y, behavior: "instant" });
    if (glide.y !== glide.target) requestAnimationFrame(glideStep);
    else glide.active = false;
  }
  function glideTo(y) {
    if (!glide.active) {
      glide.y = window.scrollY;
      glide.last = performance.now();
      glide.active = true;
      requestAnimationFrame(glideStep);
    }
    glide.target = clampY(y);
  }

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    root.classList.add("has-glide");
    window.addEventListener("wheel", (e) => {
      if (e.ctrlKey || document.body.style.overflow === "hidden") return; // pinch-zoom, open overlays
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;                 // sideways swipes
      if (e.target.closest && e.target.closest("dialog, iframe, .lb-thumbs")) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
      // stacked flicks can lead the page by at most about a screen, so the
      // glide never keeps running long after the wheel has stopped
      const lead = window.innerHeight * 1.1;
      const next = (glide.active ? glide.target : window.scrollY) + e.deltaY * unit;
      glideTo(Math.max(window.scrollY - lead, Math.min(window.scrollY + lead, next)));
    }, { passive: false });
  }

  // In-page links glide to their section too
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hash.length < 2) return;
    const el = document.querySelector(a.hash);
    if (!el) return;
    e.preventDefault();
    const top = a.hash === "#top" ? 0 : el.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
    if (reduceMotion) window.scrollTo({ top, behavior: "instant" });
    else glideTo(top);
    history.pushState(null, "", a.hash);
  });

  /* ───────── Headings rise in, word by word ─────────
     Each word (each character, in Chinese) sits in its own little mask and
     rises into place in turn when the heading is revealed. */
  function splitWords(el) {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 1) {
          if (child.hasAttribute("lang")) n = 0; // each language staggers on its own
          walk(child);
          return;
        }
        if (child.nodeType !== 3 || !child.textContent.trim()) return;
        const text = child.textContent;
        const parts = /[\u3400-\u9fff]/.test(text) ? Array.from(text) : text.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          const mask = document.createElement("span");
          const word = document.createElement("span");
          mask.className = "w";
          word.className = "wi";
          word.textContent = part;
          word.style.setProperty("--i", n++);
          mask.appendChild(word);
          frag.appendChild(mask);
        });
        child.replaceWith(frag);
      });
    };
    walk(el);
    el.classList.add("is-split");
  }
  if (!reduceMotion) document.querySelectorAll(".display, .coda-title").forEach(splitWords);

  /* ───────── Buttons lean toward the cursor ───────── */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".btn, .notice, .lang-switch, .sound-toggle, .lb-close").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.translate = `${(x * 10).toFixed(1)}px ${(y * 7).toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => { el.style.translate = ""; });
    });
  }

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
    }, { rootMargin: "0px 0px 25% 0px", threshold: 0 }); // start before it's in view
    revealables.forEach((el) => io.observe(el));
  }

  /* ───────── Parallax ─────────
     All positions are read first, then all transforms written, so a frame
     never forces the browser to recalculate layout more than once. Floating
     layers are measured from their (stationary) parent, never from their own
     already-shifted box, which would feed back into a jitter. */
  const layers = [...document.querySelectorAll("[data-parallax]")].map((el) => ({
    el,
    anchor: el.parentElement,
    speed: parseFloat(el.dataset.parallax) || 0,
  }));
  const imgs = [...document.querySelectorAll("[data-parallax-img]")]
    .filter((img) => img.closest("[data-gallery], [data-gallery-set], .frame"));
  let ticking = false;

  function parallax() {
    ticking = false;
    const vh = window.innerHeight;
    const mid = vh / 2;
    const writes = [];

    for (const l of layers) {
      const r = l.anchor.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
      writes.push([l.el, "translate", `0 ${((r.top + r.height / 2 - mid) * l.speed).toFixed(1)}px`]);
    }
    for (const img of imgs) {
      if (img.offsetParent === null) continue; // the other language's copy
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      // -1 (entering from below) … 1 (leaving at top)
      const p = (mid - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      writes.push([img, "transform", `translate3d(0, ${(p * r.height * 0.055).toFixed(1)}px, 0) scale(1.12)`]);
    }
    for (const [el, prop, value] of writes) el.style[prop] = value;
  }

  /* ───────── Fast scrolling ─────────
     html.is-fast is set while someone is flicking through the page (over
     ~2,400 px/s) and cleared once they've been calm for a moment. Reveals
     then appear at once, and the piano steps aside (see piano.js). */
  let speed = 0;
  let lastSY = window.scrollY;
  let lastST = performance.now();
  let lastFast = 0;
  let calmTimer = null;
  function checkCalm() {
    if (performance.now() - lastFast > 320) {
      root.classList.remove("is-fast");
      speed = 0;
    } else {
      calmTimer = setTimeout(checkCalm, 120);
    }
  }
  // While flicking, reveal everything in the next couple of screens straight
  // away, so content is already there as it flies past
  let lastAhead = 0;
  function revealAhead(now) {
    if (now - lastAhead < 90) return;
    lastAhead = now;
    const reach = window.innerHeight * 2.5;
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < reach && r.bottom > -reach) el.classList.add("is-in");
    });
  }
  function trackSpeed() {
    const now = performance.now();
    const dt = Math.max(1, now - lastST);
    const v = Math.abs(window.scrollY - lastSY) / dt; // px per ms
    lastSY = window.scrollY;
    lastST = now;
    speed += (v - speed) * Math.min(1, dt / 100);
    if (speed > 2.4) {
      lastFast = now;
      root.classList.add("is-fast");
      revealAhead(now);
    }
    clearTimeout(calmTimer);
    calmTimer = setTimeout(checkCalm, 120);
  }

  /* ───────── Images ─────────
     Load each image well before it scrolls into view (two screens ahead),
     and let it fade in over its placeholder rather than popping in. */
  const lazyImgs = [...document.querySelectorAll('img[loading="lazy"]')];
  lazyImgs.forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add("is-pending");
    const done = () => {
      img.classList.remove("is-pending");
      img.classList.add("is-arrived");
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
  if ("IntersectionObserver" in window) {
    const ahead = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.loading = "eager";
        ahead.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px 200% 0px" });
    lazyImgs.forEach((img) => ahead.observe(img));
  }

  const progress = document.querySelector(".progress");
  function onScroll() {
    trackSpeed();
    onNavScroll();
    const max = maxScroll();
    progress.style.transform = `scaleX(${max > 0 ? (window.scrollY / max).toFixed(4) : 0})`;
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
     The clicked image turns over, like a card, into a larger view sized to
     the picture (never the whole page). Every next/previous image arrives the
     same way — the card turns another half-turn to reveal it — and closing
     turns it back into its place on the page. */
  const lb = document.getElementById("lightbox");
  const card = lb.querySelector(".lb-card");
  const front = { img: lb.querySelector(".lb-front img") };
  const back = { img: lb.querySelector(".lb-back img") };
  const lbCount = lb.querySelector(".lb-count");
  const lbThumbs = lb.querySelector(".lb-thumbs");
  let set = [];
  let idx = 0;
  let opener = null;
  let sourceImg = null;
  let thumbSrc = "";
  let closing = false;
  let token = 0;
  let angle = 180; // resting rotation; odd half-turns show the back face

  const FLIP_EASE = "cubic-bezier(0.45, 0, 0.12, 1)";
  const rot = (a, s = 1) => `perspective(1800px) rotateY(${a}deg) scale(${s})`;
  const halfTurns = (a) => ((Math.round(a / 180) % 2) + 2) % 2;
  const shownFace = () => (halfTurns(angle) ? back : front);
  const hiddenFace = () => (halfTurns(angle) ? front : back);
  function setAngle(a) {
    angle = a;
    card.style.transform = rot(a);
  }
  function setFace(face, src, fit) {
    face.img.src = src;
    face.img.style.objectFit = fit; // "cover" matches the crop on the page
  }

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
  const px = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

  function place(r, animate) {
    if (!animate) card.style.transition = "none";
    Object.assign(card.style, px(r));
    if (!animate) { void card.offsetWidth; card.style.transition = ""; }
  }

  // Fly between the image on the page and the open card while turning over
  function travel(fromRect, toRect, fromAngle, toAngle, opening) {
    return card.animate([
      { ...px(fromRect), transform: rot(fromAngle) },
      { ...px(toRect), transform: rot(toAngle) },
    ], {
      duration: opening ? 1100 : 800,
      easing: "cubic-bezier(0.2, 0.7, 0.1, 1)",
      fill: opening ? "none" : "forwards",
    }).finished.catch(() => {});
  }
  const sourceRect = () => {
    const s = sourceImg && sourceImg.getBoundingClientRect();
    return s && s.width && s.bottom > 0 && s.top < window.innerHeight ? s : null;
  };

  function setCurrent() {
    lbCount.textContent = `${idx + 1} / ${set.length}`;
    [...lbThumbs.children].forEach((t, n) => {
      t.setAttribute("aria-current", String(n === idx));
      if (n === idx) t.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  }

  async function show(i, dir) {
    if (set.length < 2 || closing) return;
    const next = (i + set.length) % set.length;
    if (next === idx) return;
    dir = dir || (next > idx ? 1 : -1);
    idx = next;
    setCurrent();
    const src = set[idx];
    const mine = ++token;
    const img = await loadImage(src);
    if (mine !== token) return; // a newer request took over
    card.getAnimations().forEach((a) => a.finish());

    // Put the new picture on the face that's turned away, then turn to it.
    // The card changes shape while it's edge-on, so each side only ever
    // appears at its own picture's proportions.
    setFace(hiddenFace(), src, "contain");
    const from = angle;
    const was = card.getBoundingClientRect();
    const to = fitRect(aspectOf(img));
    setAngle(angle + 180 * dir);
    if (reduceMotion) {
      place(to, true);
    } else {
      place(to, false);
      card.animate([
        { ...px(was), transform: rot(from) },
        { ...px(was), transform: rot(from + 60 * dir, 0.94), offset: 0.33 },
        { ...px(to), transform: rot(from + 120 * dir, 0.94), offset: 0.67 },
        { ...px(to), transform: rot(angle) },
      ], { duration: 1000, easing: FLIP_EASE });
    }
    // warm the neighbours so the next turn starts immediately
    loadImage(set[(idx + 1) % set.length]);
    loadImage(set[(idx - 1 + set.length) % set.length]);
  }

  function open(images, from) {
    set = images;
    idx = 0;
    token++;
    opener = from;
    sourceImg = [...from.querySelectorAll("img")].find((im) => im.offsetParent !== null) || null;
    thumbSrc = sourceImg ? sourceImg.currentSrc || sourceImg.src : images[0];
    back.img.alt = sourceImg ? sourceImg.alt : "";
    lb.classList.toggle("is-single", set.length < 2);
    lbThumbs.innerHTML = set.length > 1
      ? set.map((src, n) => `<button type="button" aria-label="${n + 1}"><img src="${src.replace("media/web/", "media/web/sm/")}" alt="" loading="lazy"></button>`).join("")
      : "";

    // Front face = the picture as it looks on the page; back face = the view
    setFace(front, thumbSrc, "cover");
    setFace(back, thumbSrc, "contain"); // sharp version swaps in once loaded
    lb.showModal();
    document.body.style.overflow = "hidden";
    const r = fitRect(aspectOf(sourceImg));
    place(r, false);
    setAngle(180);
    requestAnimationFrame(() => lb.classList.add("is-open"));
    const s = sourceRect();
    if (s && !reduceMotion) travel(s, r, 0, 180, true);
    if (set.length > 1) setCurrent();

    loadImage(images[0]).then((img) => {
      if (set !== images || idx !== 0 || !img) return;
      back.img.src = images[0];
      // The first image of a gallery may differ in shape from its cover
      if (Math.abs(aspectOf(img) - aspectOf(sourceImg)) > 0.02) place(fitRect(aspectOf(img)), true);
      if (set.length > 1) loadImage(set[1]);
    });
  }

  async function close() {
    if (closing || !lb.open) return;
    closing = true;
    token++;
    lb.classList.remove("is-open");
    card.getAnimations().forEach((a) => a.finish());
    const r = card.getBoundingClientRect();
    const s = sourceRect();
    if (s && idx === 0 && !reduceMotion) {
      // Turn back over into the picture on the page
      setFace(hiddenFace(), thumbSrc, "cover");
      await travel(r, s, angle, angle - 180, false);
    } else {
      await card.animate([{ opacity: 1, transform: rot(angle) }, { opacity: 0, transform: rot(angle, 0.94) }],
        { duration: 350, easing: "ease-in", fill: "forwards" }).finished.catch(() => {});
    }
    lb.close();
    card.getAnimations().forEach((a) => a.cancel());
    document.body.style.overflow = "";
    front.img.removeAttribute("src");
    back.img.removeAttribute("src");
    if (opener) opener.focus({ preventScroll: true });
    closing = false;
  }

  lb.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-scrim").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1, -1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1, 1));
  lbThumbs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) show([...lbThumbs.children].indexOf(b));
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(idx + 1, 1);
    if (e.key === "ArrowLeft") show(idx - 1, -1);
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
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
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
