// A procedurally modelled grand piano that follows the scroll.
//
// Every <section data-piano='{…}'> is a keyframe: when that section is centred
// in the viewport the piano settles into its pose. Between sections the pose is
// interpolated, then eased towards with a soft spring so motion always feels
// unhurried. Keys:  x, y (screen offset)  ry, rx (rotation, radians)
//                   s (scale)  lid (lid angle, radians)  o (opacity 0–1)
// data-piano-m overrides the pose on narrow screens.

//
// This is a classic script (not a module) so the site still works when opened
// straight from disk (file://), where browsers refuse local ES modules. Three.js
// comes from the CDN via the small inline module at the end of index.html,
// which hands it to window.OMTPiano().

(function () {
"use strict";

let THREE, RoomEnvironment;
const canvas = document.getElementById("piano");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

// Returns true once the piano is running; false means "show the page without it".
window.OMTPiano = function (three, roomEnvironment) {
  THREE = three;
  RoomEnvironment = roomEnvironment;
  if (!canvas || !webglAvailable()) return false;
  try {
    init();
    return true;
  } catch (e) {
    console.error("Piano failed to start:", e);
    return false;
  }
};

function init() {
  /* ───────── Renderer, scene, camera ───────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 1.1, 6.2);
  camera.lookAt(0, 0.05, 0);

  /* Lights — warm key, ember rim, cool whisper of fill */
  const key = new THREE.DirectionalLight(0xffd2ad, 2.4);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a13, 3.2);
  rim.position.set(-4, 2.5, -3.5);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xff8a3d, 1.4);
  rim2.position.set(4.5, 1, -2.5);
  scene.add(rim2);
  scene.add(new THREE.HemisphereLight(0x8d9bb5, 0x1a120c, 0.35));

  /* ───────── Materials ───────── */
  const lacquer = new THREE.MeshPhysicalMaterial({
    color: 0x0b0908, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06,
  });
  const lacquerInside = new THREE.MeshStandardMaterial({ color: 0x15100c, roughness: 0.55 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc89048, metalness: 1, roughness: 0.32 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xb98a4a, metalness: 0.85, roughness: 0.42 });
  const spruce = new THREE.MeshStandardMaterial({ color: 0xc69c62, roughness: 0.62 });
  const ivory = new THREE.MeshPhysicalMaterial({ color: 0xf2ece2, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const ebony = new THREE.MeshPhysicalMaterial({ color: 0x0d0b0a, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x7c2312, roughness: 1 });
  const damperMat = new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.7 });
  const stringMat = new THREE.LineBasicMaterial({ color: 0xe6d3ad, transparent: true, opacity: 0.55 });

  /* ───────── Case outline ─────────
     Drawn in plan view: x across the keyboard (bass at -x), d = depth from
     the keyboard towards the tail. Straight spine on the left, the curved
     bentside sweeping in on the right, rounded tail at the back. */
  const W = 0.75;
  const outline = new THREE.Shape();
  outline.moveTo(-W, 0);
  outline.lineTo(W, 0);
  outline.lineTo(W, 0.5);
  outline.bezierCurveTo(W, 1.0, 0.08, 0.95, 0.02, 1.48);
  outline.bezierCurveTo(-0.02, 1.9, -0.28, 2.06, -0.56, 2.06);
  outline.quadraticCurveTo(-W, 2.06, -W, 1.9);
  outline.lineTo(-W, 0);

  const outerPts = outline.getSpacedPoints(240);
  outerPts.pop(); // closing duplicate

  // Offset a closed polygon inwards along its vertex normals
  function inset(pts, amount) {
    const n = pts.length;
    // signed area -> winding
    let area = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      area += a.x * b.y - b.x * a.y;
    }
    const sgn = area > 0 ? 1 : -1;
    return pts.map((p, i) => {
      const prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
      const tx = next.x - prev.x, ty = next.y - prev.y;
      const len = Math.hypot(tx, ty) || 1;
      // inward normal for CCW polygons is (-ty, tx)
      return new THREE.Vector2(p.x + (-ty / len) * amount * sgn, p.y + (tx / len) * amount * sgn);
    });
  }

  const innerPts = inset(outerPts, 0.04);
  const platePts = inset(outerPts, 0.075);

  // Plan (x, d) → world: x, y=height, z=-d.  ExtrudeGeometry extrudes along +z,
  // so rotate it to stand up and lift it to the right height.
  function slab(points, depth, y, mat, holes = []) {
    const shape = new THREE.Shape(points);
    holes.forEach((h) => shape.holes.push(h));
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 48 });
    geo.rotateX(Math.PI / 2); // (x, d, h) -> (x, h→-y, d→z) ...
    geo.scale(1, -1, -1);     // ... flipped so height is +y and depth is -z
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    return mesh;
  }

  const piano = new THREE.Group();   // pose target (scroll-driven)
  const model = new THREE.Group();   // centred model
  piano.add(model);
  scene.add(piano);

  const Y_BOTTOM = 0.6;
  const RIM_H = 0.32;
  const Y_TOP = Y_BOTTOM + RIM_H;

  // Rim: outer wall with the inner outline cut out
  const rimHole = new THREE.Path([...innerPts].reverse());
  const rimMesh = slab(outerPts, RIM_H, Y_BOTTOM, lacquer, [rimHole]);
  model.add(rimMesh);
  // Bottom of the case
  model.add(slab(outerPts, 0.06, Y_BOTTOM, lacquer));
  // Inner lining, soundboard, cast-iron plate
  model.add(slab(innerPts, 0.02, Y_BOTTOM + 0.08, lacquerInside));
  model.add(slab(innerPts, 0.012, Y_BOTTOM + 0.1, spruce));

  const plateHoles = [
    [0.18, 0.75, 0.11], [-0.2, 1.05, 0.13], [-0.42, 1.55, 0.1], [0.42, 0.55, 0.08],
  ].map(([x, d, r]) => {
    const p = new THREE.Path();
    p.absarc(x, d, r, 0, Math.PI * 2, true);
    return p;
  });
  const plate = slab(platePts, 0.018, Y_BOTTOM + 0.14, plateMat, plateHoles);
  model.add(plate);

  // Strings — from the hitch near the keyboard to the bentside
  {
    const yS = Y_BOTTOM + 0.165;
    const inner = innerPts;
    const segs = [];
    const count = 88;
    for (let i = 0; i < count; i++) {
      const x = -0.66 + (i / (count - 1)) * 1.32;
      // furthest depth where the inner outline crosses this x
      let maxD = 0.4;
      for (let j = 0; j < inner.length; j++) {
        const a = inner[j], b = inner[(j + 1) % inner.length];
        if ((a.x - x) * (b.x - x) <= 0 && a.x !== b.x) {
          const t = (x - a.x) / (b.x - a.x);
          maxD = Math.max(maxD, a.y + t * (b.y - a.y));
        }
      }
      const d0 = 0.26, d1 = maxD - 0.07;
      segs.push(x, yS, -d0, x - 0.02, yS, -d1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    model.add(new THREE.LineSegments(g, stringMat));
  }

  // Dampers: a row of little felt-topped blocks above the strings
  {
    const n = 60;
    const geo = new THREE.BoxGeometry(0.016, 0.03, 0.05);
    const inst = new THREE.InstancedMesh(geo, damperMat, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const x = -0.6 + (i / (n - 1)) * 1.12;
      m.makeTranslation(x, Y_BOTTOM + 0.19, -0.32);
      inst.setMatrixAt(i, m);
    }
    model.add(inst);
  }

  // Music desk
  {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.17, 0.01), lacquer);
    desk.position.set(0, Y_TOP + 0.07, -0.24);
    desk.rotation.x = -0.28;
    model.add(desk);
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.012, 0.04), lacquer);
    ledge.position.set(0, Y_TOP - 0.02, -0.21);
    model.add(ledge);
  }

  /* ───────── Keyboard ───────── */
  const KEY_W = 1.36 / 52;
  const KEY_TOP = Y_BOTTOM + 0.13;
  const KEY_Z_BACK = 0.0;
  const WHITE_L = 0.165;
  const BLACK_L = 0.1;

  // Key bed, slip and cheeks
  {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.2), lacquer);
    bed.position.set(0, Y_BOTTOM + 0.07, 0.1);
    model.add(bed);
    const slip = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.04, 0.012), lacquer);
    slip.position.set(0, KEY_TOP - 0.01, WHITE_L + 0.012);
    model.add(slip);
    const feltStrip = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.006, 0.012), felt);
    feltStrip.position.set(0, KEY_TOP + 0.002, -0.004);
    model.add(feltStrip);
    [-1, 1].forEach((s) => {
      const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.2), lacquer);
      cheek.position.set(s * 0.72, Y_BOTTOM + 0.1, 0.1);
      model.add(cheek);
    });
    // Fallboard (folded back)
    const fall = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.09, 0.02), lacquer);
    fall.position.set(0, KEY_TOP + 0.05, -0.03);
    fall.rotation.x = -0.35;
    model.add(fall);
  }

  // Instanced keys so pressing them is cheap
  const letters = "ABCDEFG";
  const hasBlackAfter = { A: true, C: true, D: true, F: true, G: true };
  const whiteGeo = new THREE.BoxGeometry(KEY_W - 0.0016, 0.02, WHITE_L);
  whiteGeo.translate(0, -0.01, WHITE_L / 2); // pivot at the back, top surface at 0
  const blackGeo = new THREE.BoxGeometry(KEY_W * 0.58, 0.026, BLACK_L);
  blackGeo.translate(0, 0.013, BLACK_L / 2);

  const whiteKeys = [];
  const blackKeys = [];
  for (let i = 0; i < 52; i++) {
    const x = -0.68 + KEY_W * (i + 0.5);
    whiteKeys.push({ x, press: 0 });
    const letter = letters[i % 7];
    if (hasBlackAfter[letter] && i < 51) blackKeys.push({ x: x + KEY_W / 2, press: 0, white: i });
  }
  const whiteInst = new THREE.InstancedMesh(whiteGeo, ivory, whiteKeys.length);
  const blackInst = new THREE.InstancedMesh(blackGeo, ebony, blackKeys.length);
  whiteInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  blackInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  model.add(whiteInst, blackInst);

  // Deterministic randomness so the piano always comes apart the same way
  let seed = 7;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Each key pops up and tumbles away on its own path when the piano comes apart
  [...whiteKeys, ...blackKeys].forEach((k) => {
    k.fly = new THREE.Vector3(k.x * 1.4 + (rand() - 0.5) * 1.2, 0.8 + rand() * 1.2, 0.5 + rand() * 1.4)
      .normalize().multiplyScalar(1.6 + rand() * 2.6);
    k.spin = new THREE.Euler((rand() - 0.5) * 7, (rand() - 0.5) * 7, (rand() - 0.5) * 7);
  });

  let burst = 0; // 0 = assembled, 1 = scattered
  const _pq = new THREE.Quaternion();
  const _pqInv = new THREE.Quaternion();
  const _w = new THREE.Vector3();
  // Local outward direction -> local direction that, on screen, heads outward
  // and recedes (never toward the camera, where pieces would balloon over text)
  function screenward(dir, out) {
    _w.copy(dir).applyQuaternion(_pq);
    _w.z = -Math.abs(_w.z) * 0.5 - 0.25;
    return out.copy(_w.normalize()).applyQuaternion(_pqInv);
  }
  const _m = new THREE.Matrix4();
  const _r = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  const _v = new THREE.Vector3();
  const _one = new THREE.Vector3(1, 1, 1);
  const _d = new THREE.Vector3();
  const _s = new THREE.Vector3();
  // Visual spread of the pieces for a given burst: an ease-in curve with a
  // small settle zone, so the last few percent lock every piece (the keys
  // especially, which are tiny next to their travel) cleanly back in place.
  const SETTLE = 0.07;
  const spread = () => (burst <= SETTLE ? 0 : ((burst - SETTLE) / (1 - SETTLE)) ** 2);

  function keyMatrix(k, tilt) {
    const b = spread();
    const reach = b ? k.fly.length() * b : 0;
    if (reach) screenward(k.fly, _d); else _d.set(0, 0, 0);
    _v.set(k.x + _d.x * reach, KEY_TOP + _d.y * reach, KEY_Z_BACK + _d.z * reach);
    _e.set(k.spin.x * b, k.spin.y * b, k.spin.z * b);
    _m.compose(_v, _q.setFromEuler(_e), b ? _s.setScalar(1 - 0.5 * b) : _one);
    return _m.multiply(_r.makeRotationX(k.press * tilt));
  }
  function updateKeys() {
    whiteKeys.forEach((k, i) => whiteInst.setMatrixAt(i, keyMatrix(k, 0.065)));
    blackKeys.forEach((k, i) => blackInst.setMatrixAt(i, keyMatrix(k, 0.07)));
    whiteInst.instanceMatrix.needsUpdate = true;
    blackInst.instanceMatrix.needsUpdate = true;
  }
  updateKeys();

  /* ───────── Lid & prop stick ───────── */
  const lidPivot = new THREE.Group();
  lidPivot.position.set(-W, Y_TOP, 0);
  model.add(lidPivot);
  const lid = slab(outerPts, 0.022, 0, lacquer);
  lid.position.x = W; // hinge runs along the straight spine
  lidPivot.add(lid);

  const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1, 10), lacquer);
  model.add(prop);
  const PROP_BASE = new THREE.Vector3(0.34, Y_TOP, -0.95);
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  function updateLid(angle) {
    lidPivot.rotation.z = angle;
    // Point on the underside of the lid, above the prop base
    const lx = PROP_BASE.x + W;
    _b.set(-W + Math.cos(angle) * lx, Y_TOP + Math.sin(angle) * lx, PROP_BASE.z);
    _a.copy(PROP_BASE);
    const len = _a.distanceTo(_b);
    prop.visible = angle > 0.06;
    prop.scale.set(1, Math.max(len, 0.001), 1);
    prop.position.copy(_a).add(_b).multiplyScalar(0.5);
    prop.quaternion.setFromUnitVectors(_up, _b.sub(_a).normalize());
  }

  /* ───────── Legs & lyre ───────── */
  const legGeo = new THREE.CylinderGeometry(0.05, 0.036, Y_BOTTOM - 0.05, 20);
  const casterGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 20);
  [[-0.62, 0.12], [0.62, 0.12], [-0.42, 1.78]].forEach(([x, d]) => {
    const leg = new THREE.Mesh(legGeo, lacquer);
    leg.position.set(x, 0.05 + (Y_BOTTOM - 0.05) / 2, -d);
    model.add(leg);
    const caster = new THREE.Mesh(casterGeo, brass);
    caster.position.set(x, 0.025, -d);
    model.add(caster);
  });
  {
    const lyre = new THREE.Group();
    [-0.07, 0.07].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, Y_BOTTOM - 0.1, 0.025), lacquer);
      post.position.set(x, 0.1 + (Y_BOTTOM - 0.1) / 2, 0);
      lyre.add(post);
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.12), lacquer);
    box.position.set(0, 0.075, 0);
    lyre.add(box);
    [-0.08, 0, 0.08].forEach((x) => {
      const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.1), brass);
      pedal.position.set(x, 0.06, 0.09);
      lyre.add(pedal);
    });
    lyre.position.set(0, 0, -0.32);
    model.add(lyre);
  }

  // Soft contact shadow
  let shadow;
  {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, "rgba(0,0,0,0.75)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.3)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 3.1),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(-0.05, 0.002, -0.95);
    model.add(shadow);
  }

  /* ───────── Coming apart ─────────
     Before a solid section scrolls over the piano it doesn't just get covered:
     it comes apart. Every piece drifts outward from the centre on its own
     path and tumbles, then they all fly back together on the way back. */
  updateLid(0.6); // so the prop has a real position to measure
  const parts = [];
  const CORE = new THREE.Vector3(0, Y_BOTTOM, -1.0);
  const _box = new THREE.Box3();
  const _c = new THREE.Vector3();
  function addPart(o) {
    _box.setFromObject(o).getCenter(_c);
    const dir = _c.sub(CORE);
    dir.y = Math.max(dir.y, 0) + 0.3;
    dir.normalize().add(new THREE.Vector3(rand() - 0.5, rand() * 0.5, rand() - 0.5).multiplyScalar(0.9)).normalize();
    parts.push({
      o,
      base: o.position.clone(),
      baseRot: o.rotation.clone(),
      dir,
      dist: 3 + rand() * 3,
      spin: new THREE.Vector3((rand() - 0.5) * 4, (rand() - 0.5) * 4, (rand() - 0.5) * 4),
    });
  }
  model.children.forEach((o) => {
    if (o === whiteInst || o === blackInst || o === shadow) return;
    if (o.isGroup && o !== lidPivot) o.children.forEach(addPart); // the pedal lyre, piece by piece
    else addPart(o);
  });

  const _pd = new THREE.Vector3();
  function applyBurst() {
    const b = spread();
    const shrink = 1 - 0.5 * b;
    parts.forEach((p) => {
      const o = p.o;
      const d = b ? screenward(p.dir, _pd) : _pd.set(0, 0, 0);
      if (o === prop) {
        // updateLid re-places and re-sizes the prop every frame; carry it along
        o.position.addScaledVector(d, b * p.dist);
        o.scale.multiplyScalar(shrink);
        return;
      }
      o.position.copy(p.base).addScaledVector(d, b * p.dist);
      o.scale.setScalar(shrink);
      o.rotation.x = p.baseRot.x + p.spin.x * b;
      o.rotation.y = p.baseRot.y + p.spin.y * b;
      // the lid's z rotation is its opening angle, set by updateLid
      o.rotation.z = o === lidPivot ? o.rotation.z + p.spin.z * b : p.baseRot.z + p.spin.z * b;
    });
    shadow.material.opacity = 1 - Math.min(1, burst * 1.6);
  }

  // How far apart the piano should be, from where the solid sections sit:
  //  · coming apart — from when the next section's top is just below view
  //    (115%) until it reaches the middle (50%), where the piano sits;
  //  · back together — as the previous section's bottom rises from 80% to
  //    30% of the screen, so the piano is whole again early on.
  // A 1.4-screen stage therefore keeps the piano fully assembled for about
  // half a screen of scrolling, however quickly someone scrolls through.
  const surfaces = [...document.querySelectorAll(".surface")];
  let surfaceSpans = []; // document-space [top, bottom], refreshed by measure()
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  function burstTarget(scroll) {
    if (reduceMotion) return 0;
    const vh = window.innerHeight;
    let b = 0;
    for (const [docTop, docBottom] of surfaceSpans) {
      const top = docTop - scroll;
      const bottom = docBottom - scroll;
      if (bottom <= vh * 0.3 || top >= vh * 1.15) continue;
      const arriving = clamp01((vh * 1.15 - top) / (vh * 0.65));
      const leaving = clamp01((bottom - vh * 0.3) / (vh * 0.5));
      b = Math.max(b, Math.min(arriving, leaving));
    }
    return b * b * (3 - 2 * b);
  }

  // Centre the model on its own bounding box so rotations pivot nicely
  model.position.set(0, -0.55, 0.95);

  /* ───────── Scroll choreography ───────── */
  const sections = [...document.querySelectorAll("[data-piano]")];
  const parsePose = (s) => Object.assign({ x: 0, y: 0, ry: 0, rx: 0, s: 1, lid: 0.5, o: 1 }, JSON.parse(s || "{}"));
  let frames = [];
  const narrowQuery = window.matchMedia("(max-width: 860px)");

  function measure() {
    const vh = window.innerHeight;
    const narrow = narrowQuery.matches;
    const maxScroll = document.documentElement.scrollHeight - vh;
    frames = sections.map((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const pose = parsePose(narrow && el.dataset.pianoM ? el.dataset.pianoM : el.dataset.piano);
      // The scroll position at which this section's middle meets the viewport's middle
      return { at: Math.min(maxScroll, Math.max(0, top + r.height / 2 - vh / 2)), pose };
    }).sort((a, b) => a.at - b.at);
    surfaceSpans = surfaces.map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + window.scrollY, r.bottom + window.scrollY];
    });
  }

  const smooth = (t) => t * t * (3 - 2 * t);
  const KEYS = ["x", "y", "ry", "rx", "s", "lid", "o"];

  function targetPose(scroll) {
    if (!frames.length) return parsePose();
    if (scroll <= frames[0].at) return frames[0].pose;
    const last = frames[frames.length - 1];
    if (scroll >= last.at) return last.pose;
    for (let i = 0; i < frames.length - 1; i++) {
      const a = frames[i], b = frames[i + 1];
      if (scroll >= a.at && scroll <= b.at) {
        const t = smooth((scroll - a.at) / Math.max(1, b.at - a.at));
        const out = {};
        KEYS.forEach((k) => (out[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t));
        return out;
      }
    }
    return last.pose;
  }

  /* ───────── Sizing ───────── */
  let widthScale = 1;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 860 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on tall/narrow screens so the piano still fits
    const fit = Math.max(1, 1.25 / camera.aspect);
    camera.position.set(0, 1.1 * fit, 6.2 * fit);
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
    // Mid-sized screens: shrink a little so side poses clear the text column
    widthScale = w < 860 ? 1 : THREE.MathUtils.clamp(w / 1380, 0.8, 1.12);
    measure();
  }
  window.addEventListener("resize", resize);
  // Images and fonts shift layout after load
  window.addEventListener("load", measure);
  if (document.fonts) document.fonts.ready.then(measure);
  new ResizeObserver(() => measure()).observe(document.body);
  resize();

  /* ───────── Pointer drift ───────── */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ───────── Loop ───────── */
  const cur = { ...targetPose(window.scrollY) };
  let lastScroll = window.scrollY;
  let velocity = 0;
  let playhead = 0;
  let fade = reduceMotion ? 1 : 0;
  let lastOpacity = "";
  let keysWereMoving = true;
  let keysBurst = -1; // the burst the key matrices were last drawn at
  const clock = new THREE.Clock();

  // Screen-space offset: convert pose x/y (roughly "half-screens") to world units
  function worldOffset(px, py) {
    const dist = camera.position.length();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    return [px * halfH * camera.aspect * 0.5, py * halfH];
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const scroll = window.scrollY;
    const target = targetPose(scroll);

    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2);
    KEYS.forEach((key) => (cur[key] += (target[key] - cur[key]) * k));

    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 2));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 2));

    const [ox, oy] = worldOffset(cur.x, cur.y);
    const breathe = reduceMotion ? 0 : Math.sin(t * 0.6) * 0.012;
    piano.position.set(ox, oy + breathe, 0);
    piano.rotation.set(
      cur.rx + (reduceMotion ? 0 : pointer.y * 0.04),
      cur.ry + (reduceMotion ? 0 : pointer.x * 0.08 + Math.sin(t * 0.25) * 0.02),
      0
    );
    piano.scale.setScalar(cur.s * widthScale);
    piano.quaternion.setFromEuler(piano.rotation);
    // Pieces drift apart slowly but gather back about twice as fast, so the
    // piano is reliably whole again even on a quick scroll through a stage.
    const want = burstTarget(scroll);
    const rate = want < burst ? 4.6 : 1.7;
    burst += (want - burst) * (1 - Math.exp(-dt * rate));
    if (burst < 0.001) burst = 0;
    _pq.copy(piano.quaternion);
    _pqInv.copy(_pq).invert();
    fade = Math.min(1, fade + dt / 1.6);
    // pieces still in view at the very end dim away under the incoming section
    const scatterDim = 1 - smooth(clamp01((burst - 0.55) / 0.45));
    const opacity = cur.o * smooth(fade) * scatterDim;
    const opacityText = opacity.toFixed(3);
    if (opacityText !== lastOpacity) canvas.style.opacity = lastOpacity = opacityText;
    // Fully hidden (scattered under a section, or the tab is in the background):
    // skip all the scene work until it's needed again.
    const visible = opacity > 0.004 && !document.hidden;
    if (visible) {
      updateLid(cur.lid);
      applyBurst();
    }

    // Scrolling "plays" the keyboard: a soft wave of pressed keys follows the
    // scroll direction, like fingers running up and down a scale.
    const ds = scroll - lastScroll;
    lastScroll = scroll;
    velocity += (Math.min(Math.abs(ds), 60) - velocity) * 0.15;
    if (!reduceMotion) {
      playhead += ds * 0.035;
      const intensity = Math.min(velocity / 18, 1);
      const head = ((playhead % 52) + 52) % 52;
      whiteKeys.forEach((key, i) => {
        // distance on the playhead's circular track, two "hands" an octave+ apart
        const d1 = Math.abs(((i - head + 78) % 52) - 26);
        const d2 = Math.abs(((i - head - 9 + 78) % 52) - 26);
        const want = Math.max(0, 1 - Math.min(d1, d2) / 1.6) * intensity;
        key.press += (want - key.press) * 0.35;
      });
      let pressed = 0;
      blackKeys.forEach((key) => {
        const w = whiteKeys[key.white].press;
        const want = (key.white * 7) % 5 === 0 ? w : 0;
        key.press += (want - key.press) * 0.35;
      });
      whiteKeys.forEach((key) => (pressed += key.press));
      // Re-upload the 88 key matrices only while something is actually moving
      const keysMoving = pressed > 0.002 || keysWereMoving || burst !== keysBurst;
      keysWereMoving = pressed > 0.002;
      if (visible && keysMoving) {
        updateKeys();
        keysBurst = burst;
      }
    }

    if (visible) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  // Compile shaders before revealing to avoid a hitch
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
})();
