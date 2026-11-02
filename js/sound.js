// Opt-in piano sound. Nothing plays — and no audio engine is even created —
// until the visitor turns "Sound" on. Then scrolling plays an original theme,
// note by note, that grows from a lone melody at the top of the page into
// full chords by the end; gentle chords and soft thuds mark the 3D piano
// rebuilding itself, and the bottom of the page ends on a full cadence.
// Everything is synthesised: no audio files.
(function () {
  "use strict";

  const root = document.documentElement;
  const toggles = [...document.querySelectorAll("[data-sound-toggle]")];
  let ctx = null;
  let out = null;      // master input: everything connects here
  let wet = null;      // reverb send: the room grows as the music builds
  let master = null;   // overall level, which rises a little into the climax
  // Accompaniment (lite voices, choir) stops at LITE_CAP so there is always
  // room for the melody and bass, up to VOICE_CAP
  const LITE_CAP = 40;
  const VOICE_CAP = 52;
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
    master = ctx.createGain();
    master.gain.value = 0.55;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -11;
    limiter.ratio.value = 6;
    master.connect(limiter).connect(ctx.destination);

    const dry = ctx.createGain();
    wet = ctx.createGain();
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
    if (!ctx || voices >= (lite ? LITE_CAP : VOICE_CAP)) return;
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

  // A soft wordless choir ("aah") holding the bar's chord: two detuned saws
  // per note through a vowel-like band, slow to swell and slow to fade.
  // It joins as the music nears its climax.
  function choir(notes, when, length, level) {
    if (!ctx) return;
    notes.forEach((m) => {
      if (voices >= LITE_CAP) return;
      voices++;
      played++;
      const freq = midi(m);
      const env = ctx.createGain();
      const vowel = ctx.createBiquadFilter();
      const air = ctx.createBiquadFilter();
      vowel.type = "bandpass";
      vowel.frequency.value = 760; // around an open "ah"
      vowel.Q.value = 1.1;
      air.type = "lowpass";
      air.frequency.value = 2400;
      env.gain.setValueAtTime(0.0001, when);
      env.gain.linearRampToValueAtTime(level, when + Math.min(0.6, length * 0.3));
      env.gain.setTargetAtTime(0.0001, when + length * 0.55, length * 0.22);
      env.connect(vowel).connect(air).connect(out);
      let ended = 0;
      [-7, 7].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = cents + (Math.random() - 0.5) * 4;
        osc.connect(env);
        osc.start(when);
        osc.stop(when + length * 1.4);
        osc.onended = () => {
          if (++ended === 2) voices--;
        };
      });
    });
  }

  function playable() {
    return enabled && ctx && ctx.state === "running";
  }

  /* ───────── The theme ─────────
     An original 48-bar piece in A minor, about one pass down the page:
       I    (bars 1–16)  the lyrical theme — a searching first half that
                         turns home on E, a second half that climbs higher
       II   (bars 17–32) a journey: out to C major, round a circle of
                         sevenths, darkening through a diminished chord and
                         the Neapolitan B♭ to a rising dominant
       III  (bars 33–48) the climax — the theme an octave higher over fuller
                         harmony, peaking on high A, then a Neapolitan
                         cadence that leads straight back to the start
     Scrolling moves through it note by note. It grows as you go down the
     page: melody alone → a bass on each bar → a left hand rolling broken
     chords, one note a beat then two → passing notes between the melody's
     leaps → chords and grace notes → deep octaves, a choir, cascading runs
     at phrase ends and a bigger room for the climax; scrolling with
     momentum adds a little more. */
  //            melody (4 steps)     bass  chord
  const THEME = [
    // I — the theme
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
    // II — the journey
    [[76, 79, 84, 83], 36, [55, 60, 64]],     // C
    [[81, 79, 77, 76], 41, [57, 60, 64]],     // Fmaj7
    [[74, 77, 81, 79], 38, [53, 57, 60]],     // Dm7
    [[77, 76, 74, 71], 43, [53, 59, 62]],     // G7
    [[72, 76, 79, 84], 36, [55, 60, 64]],     // C
    [[83, 80, 76, 74], 44, [52, 56, 62]],     // E7/G♯
    [[81, 76, 72, 76], 45, [57, 60, 64]],     // Am
    [[79, 76, 73, 76], 43, [55, 61, 64]],     // A7/G
    [[77, 81, 86, 84], 41, [53, 57, 62]],     // Dm/F
    [[83, 80, 77, 74], 44, [53, 56, 59, 62]], // G♯dim7
    [[76, 81, 84, 88], 48, [57, 60, 64]],     // Am/C
    [[89, 88, 84, 81], 41, [57, 60, 65]],     // F
    [[82, 81, 77, 74], 46, [58, 62, 65]],     // B♭ (Neapolitan)
    [[80, 83, 86, 84], 40, [56, 62, 64]],     // E7
    [[81, 84, 88, 86], 45, [57, 60, 64]],     // Am
    [[83, 86, 88, 92], 40, [56, 59, 62, 64]], // E7, climbing
    // III — the climax
    [[81, 84, 88, 86], 45, [57, 60, 64]],     // Am
    [[84, 81, 77, 81], 41, [53, 57, 60]],     // F
    [[79, 84, 88, 91], 40, [55, 60, 64]],     // C/E
    [[89, 88, 86, 83], 43, [53, 59, 62]],     // G7
    [[84, 88, 93, 91], 45, [57, 60, 64]],     // Am — the peak
    [[89, 88, 84, 81], 41, [57, 60, 64]],     // Fmaj7
    [[86, 89, 88, 86], 38, [53, 57, 62]],     // Dm
    [[83, 80, 83, 88], 40, [52, 56, 59]],     // E
    [[93, 91, 89, 84], 41, [57, 60, 65]],     // F
    [[83, 86, 91, 89], 43, [55, 59, 62]],     // G
    [[88, 84, 81, 84], 48, [57, 60, 64]],     // Am/C
    [[86, 89, 93, 91], 38, [53, 57, 60]],     // Dm7
    [[89, 86, 82, 86], 46, [58, 62, 65]],     // B♭ (Neapolitan)
    [[83, 86, 89, 88], 40, [56, 62, 64]],     // E7
    [[88, 84, 81, 76], 45, [57, 60, 64]],     // Am
    [[80, 76, 71, 68], 40, [56, 59, 62]],     // E7 → back to the start
  ];
  // Scroll distance per note: spread so that one scroll from the top of the
  // page to the bottom plays the piece once, arriving at the climax
  const stepPx = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(130, Math.max(60, max / (THEME.length * 4)));
  };
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

  // The left hand's broken chord for a bar, in open spacing: up from the
  // bass through a chord tone a fifth or so above, the octave, and the next
  // two chord tones over it, then back down — two notes per beat
  function brokenChord(bass, chord) {
    const pcs = chord.map((m) => m % 12);
    const above = (from) => { // lowest chord tone at or above `from`
      for (let m = from; m < from + 12; m++) if (pcs.includes(m % 12)) return m;
      return from;
    };
    const x = above(bass + 5);
    const y = above(bass + 13);
    const z = above(y + 1);
    return [bass, x, bass + 12, y, z, y, bass + 12, x];
  }

  // The scale the bar's chord implies: A natural minor, with G♯ under E
  // chords, C♯ under A7 and B♭ under the Neapolitan
  function scaleFor(chord) {
    const has = (pc) => chord.some((m) => m % 12 === pc);
    return [9, has(10) ? 10 : 11, has(1) ? 1 : 0, 2, 4, 5, has(8) ? 8 : 7];
  }
  // A scale note between two melody notes, for leaps of a third or more
  function passing(from, to, scale) {
    if (Math.abs(to - from) < 3) return null;
    const mid = (from + to) / 2;
    let best = null;
    for (let m = Math.min(from, to) + 1; m < Math.max(from, to); m++) {
      if (scale.includes(m % 12) && (best === null || Math.abs(m - mid) < Math.abs(best - mid))) best = m;
    }
    return best;
  }
  // The scale note just above, for a grace note leaning onto the melody
  function upperNeighbour(m, scale) {
    for (let n = m + 1; n <= m + 2; n++) if (scale.includes(n % 12)) return n;
    return m + 1;
  }

  function playStep() {
    const now = ctx.currentTime;
    const since = now - lastStep;
    pace += (Math.min(1, MIN_GAP / Math.max(since, MIN_GAP) * 1.4) - pace) * 0.3;
    lastStep = now;
    const gap = Math.min(0.6, Math.max(MIN_GAP, since)); // time until the next note, roughly

    const bar = Math.floor(stepAt / 4) % THEME.length;
    const [melody, bass, chord] = THEME[bar];
    const beat = stepAt % 4;
    const next = beat < 3 ? melody[beat + 1] : THEME[(bar + 1) % THEME.length][0][0];
    const scale = scaleFor(chord);
    const f = fullness();
    // Balance: the melody always sings on top; everything else is quieter
    // the busier it is, and notes ring only a little past the next one so
    // their tails don't blur into each other
    const vel = 0.34 + f * 0.4;
    const ring = Math.min(1.4, Math.max(0.55, gap * 3)); // melody note length
    const tail = Math.min(1, Math.max(0.4, gap * 2));    // accompaniment length
    const tone = melody[beat];

    // Right hand
    if (beat === 0 && f > 0.6) {
      // a grace note leaning onto the bar's first note
      voice(midi(upperNeighbour(tone, scale)), now, vel * 0.22, 0.18, true);
      voice(midi(tone), now + 0.06, vel, ring);
    } else {
      voice(midi(tone), now, vel, ring);                                // melody
    }
    if (f > 0.78) voice(midi(tone - 12), now, vel * 0.28, tail, true);  // octave doubling
    const fill = f > 0.38 && passing(tone, next, scale);
    if (fill) voice(midi(fill), now + gap / 2, vel * 0.3, 0.45, true);  // passing note
    if ((beat === 0 && f > 0.62) || (beat === 2 && f > 0.86)) {
      chord.forEach((m, n) => voice(midi(m), now + n * 0.014, 0.1 + f * 0.08, tail, true)); // chords
    }
    // At the end of each four-bar phrase near the climax, a run cascades
    // down the chord from the melody, two octaves in the time of one beat
    if (beat === 3 && bar % 4 === 3 && f > 0.8) {
      const pcs = chord.map((m) => m % 12);
      const run = [];
      for (let m = tone - 1; m >= tone - 24 && run.length < 10; m--) if (pcs.includes(m % 12)) run.push(m);
      const spacing = Math.min(0.05, (gap * 0.9) / run.length);
      run.forEach((m, i) => voice(midi(m), now + 0.04 + i * spacing, (0.1 + f * 0.08) * (1 - i / 14), 0.45, true));
    }

    // Left hand: a bass note on the bar, then a broken chord that rolls
    // under the melody — one note a beat, then two, then from a deep octave
    const lh = brokenChord(bass, chord);
    const lhVel = 0.11 + f * 0.13;
    const barLen = Math.min(2.4, Math.max(1, gap * 4)); // bass holds through the bar
    if (beat === 0 && f > 0.12) voice(midi(bass), now, 0.24 + f * 0.16, barLen);
    if (beat === 0 && f > 0.7 && bass - 12 >= 31) voice(midi(bass - 12), now, 0.14 + f * 0.14, barLen, true);
    if (f > 0.25) {
      if (beat !== 0) voice(midi(lh[beat * 2]), now, lhVel, tail, true);
      if (f > 0.5) voice(midi(lh[beat * 2 + 1]), now + gap / 2, lhVel * 0.8, tail, true);
    }

    // Climax: the choir swells under each bar and the room opens up
    if (beat === 0 && f > 0.7) {
      choir(chord, now, Math.min(3.4, Math.max(1.4, gap * 4.6)), 0.02 + (f - 0.7) * 0.09);
    }
    wet.gain.setTargetAtTime(0.26 + f * 0.14, now, 0.6);
    master.gain.setTargetAtTime(0.5 + f * 0.18, now, 0.8);
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
    const step = stepPx();
    if (travelled >= step && ctx.currentTime - lastStep >= MIN_GAP) {
      travelled = Math.min(travelled - step, step); // no backlog after a flick
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
    if (big) {
      // The last cadence: the left hand sweeps up from the bottom of the
      // keyboard, then the full chord lands with the choir holding it
      const sweep = [33, 40, 45, 48, 52, 57, 60, 64];
      sweep.forEach((m, i) => voice(midi(m), now + i * 0.045, 0.22 + i * 0.03, 1.6, true));
      const land = now + sweep.length * 0.045 + 0.08;
      steps.forEach((m, i) => voice(midi(m), land + i * 0.03, 0.55, 4.5, i > 2));
      choir([57, 60, 64, 69], land, 5, 0.07);
      if (wet) wet.gain.setTargetAtTime(0.56, land, 0.4);
      return;
    }
    steps.forEach((m, i) => voice(midi(m), now + i * 0.09, 0.42));
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

  // The loading veil's "Enter with sound" / "Enter quietly". Called inside
  // the click, which is what allows the audio engine to start.
  function enter(on) {
    setEnabled(on, true);
    if (on && ensureContext()) ctx.resume().then(() => chord("hello"));
    else if (ctx) ctx.suspend();
  }

  window.OMTSound = {
    enter,
    chord,
    thud,
    get enabled() { return enabled; },
    get state() { return ctx ? ctx.state : "not started"; },
    get played() { return played; },
    get voices() { return voices; },
  };
})();
