// Opt-in piano sound. Nothing plays — and no audio engine is even created —
// until the visitor turns "Sound" on. Then the keys the scroll "plays" on the
// 3D piano (see piano.js) sound soft felt-piano notes, and gentle chords mark
// the piano assembling itself. Everything is synthesised: no audio files.
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

  // C-major pentatonic over three octaves from C3: any run of keys sounds musical
  const PENTA = [0, 2, 4, 7, 9];
  const C3 = 130.81;
  const freqFor = (step) => C3 * Math.pow(2, Math.floor(step / 5) + PENTA[step % 5] / 12);

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
  function voice(freq, when, velocity) {
    if (!ctx || voices >= 8) return;
    voices++;
    played++;
    const dur = 2.6 - Math.min(1.4, (freq - C3) / 600); // low notes ring longer
    const env = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(Math.min(5200, freq * 9), when);
    tone.frequency.exponentialRampToValueAtTime(Math.max(500, freq * 2), when + dur);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(0.22 * velocity, when + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    env.connect(tone).connect(out);

    const partials = [[1, 1, "triangle"], [2, 0.42, "sine"], [3, 0.16, "sine"], [4.02, 0.06, "sine"]];
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

  // whiteIndex: 0–51 across the keyboard
  function note(whiteIndex) {
    if (!playable()) return;
    const now = ctx.currentTime;
    if (now - lastNote < 0.075) return; // keep fast scrolls from turning into noise
    lastNote = now;
    const step = Math.round((whiteIndex / 51) * 14);
    voice(freqFor(step), now, 0.55 + Math.random() * 0.2);
  }

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

  const CHORDS = {
    intro: [0, 2, 3, 5],        // C3 E3 G3 C4 — rolled, as the piano arrives
    together: [3, 5, 6, 7],     // G3 C4 D4 E4 — soft and open, back in one piece
    hello: [5, 7, 8],           // C4 E4 G4 — confirms sound is on
  };
  function chord(kind) {
    if (!playable()) return;
    const steps = CHORDS[kind] || CHORDS.together;
    const now = ctx.currentTime + 0.02;
    steps.forEach((step, i) => voice(freqFor(step), now + i * 0.09, 0.42));
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
    note,
    chord,
    thud,
    get enabled() { return enabled; },
    get state() { return ctx ? ctx.state : "not started"; },
    get played() { return played; },
  };
})();
