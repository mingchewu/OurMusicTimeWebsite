// Opt-in piano sound. Nothing plays — and no audio engine is even created —
// until the visitor turns "Sound" on. Then scrolling plays an original theme,
// note by note, that grows from a lone melody at the top of the page into
// full chords by the end; gentle chords and soft thuds mark the 3D piano
// rebuilding itself. Everything is synthesised: no audio files.
(function () {
  "use strict";

  const root = document.documentElement;
  const toggles = [...document.querySelectorAll("[data-sound-toggle]")];
  let ctx = null;
  let out = null;      // master input: everything connects here
  let enabled = false;
  let voices = 0;
  let lastNote = 0;
  let played = 0; // voices started, for a quick status check

  const C3 = 130.81;
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // A short warm "room": decaying stereo noise as a convolution impulse
  function roomImpulse(seconds) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    return buf;
  }

  function ensureContext() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.55;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 6;
    master.connect(limiter).connect(ctx.destination);

    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const reverb = ctx.createConvolver();
    dry.gain.value = 0.8;
    wet.gain.value = 0.32;
    reverb.buffer = roomImpulse(2.4);
    out = ctx.createGain();
    out.connect(dry).connect(master);
    out.connect(reverb).connect(wet).connect(master);
    return ctx;
  }

  // One felt-piano voice: a few soft partials, quick attack, long decay,
  // through a low-pass that closes as the note fades (like a hammer's felt)
  // `lite` voices (chords, doublings) use two partials instead of four, so a
  // full texture near the end of the page stays light to synthesise
  function voice(freq, when, velocity, length, lite) {
    if (!ctx || voices >= 30) return;
    voices++;
    played++;
    const dur = length || 2.6 - Math.min(1.4, (freq - C3) / 600); // low notes ring longer
    const env = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(Math.min(5200, freq * 9), when);
    tone.frequency.exponentialRampToValueAtTime(Math.max(500, freq * 2), when + dur);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(0.22 * velocity, when + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    env.connect(tone).connect(out);

    const partials = lite
      ? [[1, 1, "triangle"], [2, 0.38, "sine"]]
      : [[1, 1, "triangle"], [2, 0.42, "sine"], [3, 0.16, "sine"], [4.02, 0.06, "sine"]];
    let ended = 0;
    partials.forEach(([mult, gain, type]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      osc.detune.value = (Math.random() - 0.5) * 6; // a touch of life
      g.gain.value = gain;
      osc.connect(g).connect(env);
      osc.start(when);
      osc.stop(when + dur + 0.05);
      osc.onended = () => {
        if (++ended === partials.length) voices--;
      };
    });
  }

  function playable() {
    return enabled && ctx && ctx.state === "running";
  }

  /* ───────── The theme ─────────
     An original 16-bar theme in A minor: a searching first half that turns
     home on E, then a second half that climbs higher before returning.
     Scrolling moves through it note by note. It grows as you go down the
     page: melody alone → a bass on each bar → a walking bass → chords →
     melody doubled in octaves; scrolling with momentum adds a little more. */
  //            melody (4 steps)     bass  chord
  const THEME = [
    [[69, 72, 76, 74], 45, [57, 60, 64]], // Am
    [[72, 69, 65, 69], 41, [53, 57, 60]], // F
    [[67, 72, 76, 79], 48, [55, 60, 64]], // C
    [[77, 76, 74, 71], 43, [55, 59, 62]], // G
    [[72, 76, 81, 79], 45, [57, 60, 64]], // Am
    [[77, 76, 72, 69], 41, [53, 57, 60]], // F
    [[74, 77, 76, 74], 38, [53, 57, 62]], // Dm
    [[71, 68, 71, 76], 40, [52, 56, 59]], // E
    [[81, 79, 77, 72], 41, [53, 57, 60]], // F
    [[71, 74, 79, 77], 43, [55, 59, 62]], // G
    [[76, 79, 83, 81], 40, [55, 59, 64]], // Em
    [[79, 76, 72, 76], 45, [57, 60, 64]], // Am
    [[77, 81, 86, 84], 38, [53, 57, 62]], // Dm
    [[83, 79, 74, 77], 43, [55, 59, 62]], // G
    [[76, 79, 84, 83], 48, [55, 60, 64]], // C
    [[80, 76, 71, 76], 40, [52, 56, 59]], // E
  ];
  const STEP_PX = 80;   // scroll distance per note
  const MIN_GAP = 0.14; // the quickest it will play (seconds between notes)
  let stepAt = 0;       // position in the theme: bar * 4 + beat
  let travelled = 0;
  let lastStep = 0;
  let pace = 0;         // 0 (idle) … 1 (scrolling briskly), from recent note spacing

  function pageProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, window.scrollY / max) : 0;
  }
  // How full the music is: mostly where you are on the page, plus momentum
  const fullness = () => Math.min(1, pageProgress() * 0.9 + pace * 0.22);

  function playStep() {
    const now = ctx.currentTime;
    const since = now - lastStep;
    pace += (Math.min(1, MIN_GAP / Math.max(since, MIN_GAP) * 1.4) - pace) * 0.3;
    lastStep = now;

    const [melody, bass, chord] = THEME[Math.floor(stepAt / 4) % THEME.length];
    const beat = stepAt % 4;
    const f = fullness();
    const vel = 0.3 + f * 0.42;
    const tone = melody[beat];

    voice(midi(tone), now, vel, 1.4);                                   // melody
    if (f > 0.78) voice(midi(tone - 12), now, vel * 0.45, 1.1, true);   // octave doubling
    if (beat === 0 && f > 0.18) voice(midi(bass), now, 0.3 + f * 0.26, 2.2);       // bass
    if (beat === 2 && f > 0.42) voice(midi(bass + 7), now, 0.24 + f * 0.2, 1.6);   // walking fifth
    if ((beat === 0 && f > 0.62) || (beat === 2 && f > 0.86)) {
      chord.forEach((m, n) => voice(midi(m), now + n * 0.014, 0.16 + f * 0.16, 1.1, true)); // chords
    }
    stepAt++;
  }

  // Scrolling (in either direction) moves the theme forward; reaching the
  // bottom of the page resolves it with a final chord.
  let lastY = window.scrollY;
  let resolved = false;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    travelled += Math.abs(y - lastY);
    lastY = y;
    if (!playable()) return;
    if (travelled >= STEP_PX && ctx.currentTime - lastStep >= MIN_GAP) {
      travelled = Math.min(travelled - STEP_PX, STEP_PX); // no backlog after a flick
      playStep();
    }
    const p = pageProgress();
    if (p > 0.985 && !resolved) {
      resolved = true;
      chord("end");
    } else if (p < 0.9) {
      resolved = false;
    }
  }, { passive: true });

  // A soft, felted knock as a heavy piece of the piano lands back in place:
  // a short falling low tone plus a breath of filtered noise. size: 0–1.
  let lastThud = 0;
  function thud(size) {
    if (!playable()) return;
    const now = ctx.currentTime;
    if (now - lastThud < 0.06) return;
    lastThud = now;
    const level = 0.12 + size * 0.2;

    const body = ctx.createOscillator();
    const bodyEnv = ctx.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(70 + (1 - size) * 60, now);
    body.frequency.exponentialRampToValueAtTime(42, now + 0.25);
    bodyEnv.gain.setValueAtTime(0.0001, now);
    bodyEnv.gain.linearRampToValueAtTime(level, now + 0.005);
    bodyEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    body.connect(bodyEnv).connect(out);
    body.start(now);
    body.stop(now + 0.4);

    const len = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const noise = ctx.createBufferSource();
    const felt = ctx.createBiquadFilter();
    const noiseEnv = ctx.createGain();
    noise.buffer = buf;
    felt.type = "lowpass";
    felt.frequency.value = 600 + size * 500;
    noiseEnv.gain.value = level * 0.6;
    noise.connect(felt).connect(noiseEnv).connect(out);
    noise.start(now);
    played++;
  }

  // All in the theme's key (A minor), voiced as MIDI notes
  const CHORDS = {
    intro: [45, 57, 64, 69, 72],          // rolled A minor as the piano arrives
    together: [57, 64, 69, 72],           // soft A minor: back in one piece
    hello: [69, 72, 76],                  // confirms sound is on
    end: [33, 45, 57, 64, 69, 72, 76],    // the theme resolves at the bottom of the page
  };
  function chord(kind) {
    if (!playable()) return;
    const steps = CHORDS[kind] || CHORDS.together;
    const now = ctx.currentTime + 0.02;
    const big = kind === "end";
    steps.forEach((m, i) => voice(midi(m), now + i * (big ? 0.07 : 0.09), big ? 0.5 : 0.42, big ? 4 : undefined));
  }

  function setEnabled(on, persist) {
    enabled = on;
    toggles.forEach((t) => t.setAttribute("aria-pressed", String(on)));
    root.classList.toggle("sound-on", on);
    if (persist) {
      try { localStorage.setItem("omt-sound", on ? "1" : "0"); } catch (e) {}
    }
  }

  toggles.forEach((t) => t.addEventListener("click", () => {
    const on = !enabled;
    setEnabled(on, true);
    if (on && ensureContext()) {
      ctx.resume().then(() => chord("hello"));
    } else if (ctx) {
      ctx.suspend();
    }
  }));

  // Remembered "on" from a previous visit: browsers only allow audio after a
  // gesture, so wake the engine on the visitor's first click or key press.
  let saved = null;
  try { saved = localStorage.getItem("omt-sound"); } catch (e) {}
  if (saved === "1") {
    setEnabled(true, false);
    const wake = () => {
      if (enabled && ensureContext()) ctx.resume();
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
  }

  // Silence in background tabs
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (enabled) ctx.resume();
  });

  window.OMTSound = {
    chord,
    thud,
    get enabled() { return enabled; },
    get state() { return ctx ? ctx.state : "not started"; },
    get played() { return played; },
  };
})();
