import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Model descriptions match DesignModel on the server; asset fields are URLs here. */
export type Model3D =
  | { type: "cup"; oz: string; colour: string; texture: string }
  | { type: "box"; L: number; W: number; H: number; color: string; logoColor: string; logo: string }
  | { type: "flat"; w: number; h: number; d?: number; front: string; back?: string; standing?: boolean }
  | { type: "card"; w: number; h: number; bg: string; logo: string; logoColor: string; backBg: string; symbol: string; symbolColor: string }
  | { type: "bag"; w: number; h: number; d: number; color: string; logoColor: string; logo: string; front?: string; handles?: "rope" | "flat" | "none" }
  | { type: "pouch"; w: number; h: number; d: number; color: string; front?: string; logo?: string; logoColor?: string }
  | { type: "carrier"; cups: 2 | 4; color: string; logo?: string; logoColor?: string };

/** The identity colours offered for a live colour change on the model. */
export const BRAND_SWATCHES = ["#FE5000", "#2A1F15", "#F1E9DA", "#C08B3D", "#524727", "#C4B47E", "#FFFFFF"];

/** Returns the model with its main colour replaced (box, card, bag, pouch, carrier). */
export function withColour(m: Model3D, c?: string | null): Model3D {
  if (!c) return m;
  if (m.type === "card") return { ...m, bg: c };
  if (m.type === "box" || m.type === "bag" || m.type === "pouch" || m.type === "carrier") return { ...m, color: c };
  return m;
}
export const hasColour = (m: Model3D) => ["box", "card", "bag", "pouch", "carrier"].includes(m.type);

// Cup dimensions in mm (top Ø, bottom Ø, height), same as the identity guide's cup viewer.
const CUP: Record<string, { D: number; d: number; H: number }> = {
  "4": { D: 62, d: 45, H: 60 },
  "9": { D: 80, d: 56, H: 90 },
  "12": { D: 90, d: 60, H: 112 },
  "16": { D: 90, d: 60, H: 136 },
};
const HEEL: Record<string, number> = { classic: 0xda431d, morning: 0xede6d9, evening: 0x241a11, signature: 0xd9461f, specialty: 0xb3a36e, specialtyb: 0x241a11 };
const LID: Record<string, number> = { morning: 0xece3d2, evening: 0x2e2318, signature: 0xece3d2, classic: 0xece3d2, specialty: 0xece3d2, specialtyb: 0x2e2318 };

const MM = 1 / 1000; // scene units are metres

function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        resolve(t);
      },
      undefined,
      reject,
    );
  });
}

/** Loads an SVG logo with every colour replaced by one identity colour. */
async function recoloured(url: string, colour: string): Promise<HTMLImageElement | null> {
  try {
    const svg = (await (await fetch(url, { credentials: "same-origin" })).text()).replace(/#[0-9a-fA-F]{6}\b/g, colour);
    const img = new Image();
    const blob = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    await new Promise<void>((ok, bad) => {
      img.onload = () => ok();
      img.onerror = () => bad();
      img.src = blob;
    });
    URL.revokeObjectURL(blob);
    return img;
  } catch {
    return null;
  }
}

function canvasTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Box lid: solid identity colour with the Primary logo recoloured to its partner colour. */
async function boxLidTexture(m: Extract<Model3D, { type: "box" }>): Promise<THREE.CanvasTexture> {
  const c = document.createElement("canvas");
  c.width = 1400;
  c.height = Math.round((1400 * m.W) / m.L);
  const g = c.getContext("2d")!;
  g.fillStyle = m.color;
  g.fillRect(0, 0, c.width, c.height);
  const img = await recoloured(m.logo, m.logoColor);
  if (img) {
    const w = Math.min(c.width, c.height * 1.25) * 0.5;
    const h = (w * (img.naturalHeight || 1)) / (img.naturalWidth || 1);
    g.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  }
  return canvasTexture(c);
}

/** A printed panel: the uploaded artwork if there is one, else the colour with the logo in the middle. */
async function panelTexture(wMM: number, hMM: number, color: string, logo?: string, logoColor?: string, image?: string, logoScale = 0.55, logoY = 0.5) {
  if (image) return loadTexture(image);
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.max(64, Math.round((1024 * hMM) / wMM));
  const g = c.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  // a little paper grain
  g.globalAlpha = 0.05;
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
    g.fillRect(Math.random() * c.width, Math.random() * c.height, 1.5, 1.5);
  }
  g.globalAlpha = 1;
  if (logo && logoColor) {
    const img = await recoloured(logo, logoColor);
    if (img) {
      const w = c.width * logoScale,
        h = (w * (img.naturalHeight || 1)) / (img.naturalWidth || 1);
      g.drawImage(img, (c.width - w) / 2, c.height * logoY - h / 2, w, h);
    }
  }
  return canvasTexture(c);
}

/** Business card: logo side, and an information side with placeholder lines (no personal data). */
async function cardTextures(m: Extract<Model3D, { type: "card" }>) {
  const W = 1400,
    Hh = Math.round((1400 * m.h) / m.w);
  const front = document.createElement("canvas");
  front.width = W;
  front.height = Hh;
  const f = front.getContext("2d")!;
  f.fillStyle = m.bg;
  f.fillRect(0, 0, W, Hh);
  const logo = await recoloured(m.logo, m.logoColor);
  if (logo) {
    const w = W * 0.36,
      h = (w * (logo.naturalHeight || 1)) / (logo.naturalWidth || 1);
    f.drawImage(logo, (W - w) / 2, (Hh - h) / 2, w, h);
  }
  const back = document.createElement("canvas");
  back.width = W;
  back.height = Hh;
  const b = back.getContext("2d")!;
  b.fillStyle = m.backBg;
  b.fillRect(0, 0, W, Hh);
  const bar = (x: number, y: number, w: number, h: number, col: string) => {
    b.fillStyle = col;
    b.fillRect(x, y, w, h);
  };
  bar(W * 0.07, Hh * 0.17, W * 0.3, Hh * 0.07, "#2A1F15");
  bar(W * 0.07, Hh * 0.29, W * 0.18, Hh * 0.035, m.symbolColor);
  bar(W * 0.63, Hh * 0.17, W * 0.3, Hh * 0.07, "#2A1F15");
  bar(W * 0.75, Hh * 0.29, W * 0.18, Hh * 0.035, m.symbolColor);
  bar(W * 0.07, Hh * 0.45, W * 0.86, 2, "#C9BFAE");
  for (let i = 0; i < 3; i++) {
    bar(W * 0.07, Hh * (0.56 + i * 0.1), W * 0.06, Hh * 0.03, "#8A7E6C");
    bar(W * 0.17, Hh * (0.555 + i * 0.1), W * (0.28 - i * 0.04), Hh * 0.04, "#4A3E30");
  }
  const sym = await recoloured(m.symbol, m.symbolColor);
  if (sym) {
    const w = W * 0.15,
      h = (w * (sym.naturalHeight || 1)) / (sym.naturalWidth || 1);
    b.drawImage(sym, W * 0.93 - w, Hh * 0.88 - h, w, h);
  }
  return { front: canvasTexture(front), back: canvasTexture(back) };
}

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  return c.multiplyScalar(k);
}

async function buildModel(m: Model3D, lidOn: boolean): Promise<{ group: THREE.Group; height: number; width: number }> {
  const group = new THREE.Group();
  if (m.type === "cup") {
    const s = CUP[m.oz] ?? CUP["12"];
    const RT = (s.D / 2) * MM,
      RB = (s.d / 2) * MM,
      H = s.H * MM,
      HH = H * 0.09,
      RBw = RB + (RT - RB) * 0.09,
      SEG = 96;
    const tex = await loadTexture(m.texture);
    const wallMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62 });
    const heelMat = new THREE.MeshStandardMaterial({ color: HEEL[m.colour] ?? 0xede6d9, roughness: 0.85 });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(RT, RBw, H - HH, SEG, 1, true, Math.PI, Math.PI * 2), wallMat);
    wall.position.y = HH + (H - HH) / 2;
    wall.castShadow = true;
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(RBw * 0.93, RB * 0.95, HH, SEG, 1, true), heelMat);
    heel.position.y = HH / 2;
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(RT - 0.002, RB - 0.002, H - 0.004, SEG, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.9, side: THREE.BackSide }),
    );
    inner.position.y = H / 2 + 0.002;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(RT, RT * 0.035, 16, SEG), new THREE.MeshStandardMaterial({ color: 0xf6f1e8, roughness: 0.7 }));
    lip.rotation.x = Math.PI / 2;
    lip.position.y = H;
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(RB * 0.9, SEG), heelMat);
    bottom.rotation.x = Math.PI / 2;
    bottom.position.y = 0.002;
    const rC = RB + (RT - RB) * 0.9;
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(rC - 0.001, SEG), new THREE.MeshStandardMaterial({ color: 0x6b3e1f, roughness: 0.35 }));
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = H * 0.9;
    group.add(wall, heel, inner, lip, bottom, coffee);
    const lid = new THREE.Group();
    lid.name = "lid";
    lid.visible = lidOn;
    const lidMat = new THREE.MeshStandardMaterial({ color: LID[m.colour] ?? 0xece3d2, roughness: 0.55 });
    const m1 = new THREE.Mesh(new THREE.CylinderGeometry(RT * 1.06, RT * 1.045, RT * 0.17, SEG), lidMat);
    m1.position.y = H + RT * 0.07;
    const m2 = new THREE.Mesh(new THREE.CylinderGeometry(RT * 0.9, RT * 1.05, RT * 0.07, SEG), lidMat);
    m2.position.y = H + RT * 0.19;
    const m3 = new THREE.Mesh(new THREE.CylinderGeometry(RT * 0.82, RT * 0.9, RT * 0.11, SEG), lidMat);
    m3.position.y = H + RT * 0.28;
    lid.add(m1, m2, m3);
    group.add(lid);
    return { group, height: H, width: RT * 2 };
  }
  if (m.type === "box") {
    const L = m.L * MM,
      W = m.W * MM,
      H = m.H * MM;
    const lidTex = await boxLidTexture(m);
    const side = new THREE.MeshStandardMaterial({ color: shade(m.color, 0.9), roughness: 0.8 });
    const sideDark = new THREE.MeshStandardMaterial({ color: shade(m.color, 0.78), roughness: 0.8 });
    const top = new THREE.MeshStandardMaterial({ map: lidTex, roughness: 0.72 });
    const base = new THREE.MeshStandardMaterial({ color: shade(m.color, 0.7), roughness: 0.9 });
    // +x, -x, +y (top), -y, +z, -z
    const box = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), [side, side, top, base, sideDark, sideDark]);
    box.position.y = H / 2;
    box.castShadow = true;
    group.add(box);
    return { group, height: H, width: Math.max(L, W) };
  }
  if (m.type === "card") {
    const w = m.w * MM,
      h = m.h * MM,
      d = 0.5 * MM;
    const { front, back } = await cardTextures(m);
    const edge = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.bg), roughness: 0.8 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [
      edge,
      edge,
      edge,
      edge,
      new THREE.MeshStandardMaterial({ map: front, roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ map: back, roughness: 0.8 }),
    ]);
    slab.castShadow = true;
    slab.position.y = h / 2;
    group.add(slab);
    return { group, height: h, width: w };
  }
  if (m.type === "bag") {
    // Paper carrier bag: open top, gusseted sides, rope or flat handles.
    const w = m.w * MM, h = m.h * MM, d = m.d * MM;
    const face = await panelTexture(m.w, m.h, m.color, m.logo, m.logoColor, m.front, 0.6, 0.48);
    const paper = (map?: THREE.Texture) => new THREE.MeshStandardMaterial({ color: map ? 0xffffff : new THREE.Color(m.color), map, roughness: 0.92, side: THREE.DoubleSide });
    const side = paper();
    side.color = new THREE.Color(m.color).multiplyScalar(0.93);
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, hidden, paper(), paper(face), paper(face)]);
    body.position.y = h / 2;
    body.castShadow = true;
    group.add(body);
    // inner shading so the opening reads as an opening
    const inner = new THREE.Mesh(new THREE.BoxGeometry(w * 0.995, h * 0.99, d * 0.99), new THREE.MeshStandardMaterial({ color: new THREE.Color(m.color).multiplyScalar(0.55), side: THREE.BackSide, roughness: 1 }));
    inner.position.y = h / 2;
    group.add(inner);
    if (m.handles !== "none") {
      const hm = new THREE.MeshStandardMaterial({ color: m.handles === "flat" ? new THREE.Color(m.color).multiplyScalar(0.9) : new THREE.Color(m.logoColor), roughness: 0.8 });
      for (const z of [d / 2 + 0.0008, -d / 2 - 0.0008]) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-w * 0.22, h * 0.94, z),
          new THREE.Vector3(-w * 0.2, h * 1.12, z),
          new THREE.Vector3(0, h * 1.2, z),
          new THREE.Vector3(w * 0.2, h * 1.12, z),
          new THREE.Vector3(w * 0.22, h * 0.94, z),
        ]);
        const r = m.handles === "flat" ? 0.005 : 0.0028;
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 10, false), hm);
        if (m.handles === "flat") tube.scale.z = 0.25;
        tube.castShadow = true;
        group.add(tube);
      }
    }
    return { group, height: h * 1.2, width: Math.max(w, d) };
  }
  if (m.type === "pouch") {
    // Stand-up coffee pouch: full gusset at the base narrowing to a flat seal at the top.
    const w = m.w * MM, h = m.h * MM, d = m.d * MM;
    const geo = new THREE.BoxGeometry(w, h, d, 1, 24, 1);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) + h / 2) / h; // 0 bottom → 1 top
      const k = Math.max(0.04, 1 - Math.pow(t, 0.85));
      pos.setZ(i, pos.getZ(i) * k);
      // a slight belly so it doesn't look like a brick
      pos.setX(i, pos.getX(i) * (1 + 0.025 * Math.sin(Math.PI * t)));
    }
    geo.computeVertexNormals();
    const face = await panelTexture(m.w, m.h, m.color, m.logo, m.logoColor, m.front, 0.55, 0.42);
    const edge = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.color).multiplyScalar(0.85), roughness: 0.5 });
    const fm = new THREE.MeshStandardMaterial({ map: face, roughness: 0.45, metalness: 0.05 });
    const body = new THREE.Mesh(geo, [edge, edge, edge, edge, fm, fm]);
    body.position.y = h / 2;
    body.castShadow = true;
    const seal = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, h * 0.06, 0.0015), edge);
    seal.position.y = h * 0.985;
    group.add(body, seal);
    return { group, height: h, width: w };
  }
  if (m.type === "carrier") {
    // Moulded cup carrier with a centre handle panel.
    const cols = m.cups === 2 ? 2 : 2, rows = m.cups === 2 ? 1 : 2;
    const cell = 0.1, base = 0.035;
    const W = cols * cell, D = rows * cell;
    const kraft = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.color), roughness: 0.95 });
    const tray = new THREE.Mesh(new THREE.BoxGeometry(W, base, D), kraft);
    tray.position.y = base / 2;
    tray.castShadow = true;
    group.add(tray);
    const holeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.color).multiplyScalar(0.45), roughness: 1 });
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const hole = new THREE.Mesh(new THREE.CircleGeometry(cell * 0.38, 40), holeMat);
        hole.rotation.x = -Math.PI / 2;
        hole.position.set(-W / 2 + cell * (i + 0.5), base + 0.0005, -D / 2 + cell * (j + 0.5));
        group.add(hole);
      }
    const ph = 0.075;
    const panelTex = await panelTexture(W * 1000, ph * 1000, m.color, m.logo, m.logoColor, undefined, 0.22, 0.4);
    const pm = new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.95, side: THREE.DoubleSide });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(W, ph, 0.003), [kraft, kraft, kraft, kraft, pm, pm]);
    panel.position.y = base + ph / 2;
    group.add(panel);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(W * 0.3, ph * 0.18, 0.004), holeMat);
    grip.position.y = base + ph * 0.8;
    group.add(grip);
    return { group, height: base + ph, width: Math.max(W, D) };
  }
  // flat: a sheet, sticker sheet or board, printed front (and back)
  const w = m.w * MM,
    h = m.h * MM,
    d = (m.d ?? 0.6) * MM;
  const front = await loadTexture(m.front);
  const back = m.back ? await loadTexture(m.back) : null;
  const edge = new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.9 });
  const fMat = new THREE.MeshStandardMaterial({ map: front, roughness: 0.7 });
  const bMat = back ? new THREE.MeshStandardMaterial({ map: back, roughness: 0.7 }) : new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.9 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [edge, edge, edge, edge, fMat, bMat]);
  slab.castShadow = true;
  if (m.standing === false) {
    slab.rotation.x = -Math.PI / 2;
    slab.position.y = d / 2;
    group.add(slab);
    return { group, height: d, width: Math.max(w, h) };
  }
  slab.position.y = h / 2;
  group.add(slab);
  return { group, height: h, width: w };
}

export interface Design3DText {
  loading: string;
  failed: string;
  noWebgl: string;
  spin: string;
  lid: string;
  hint: string;
}

/** Rotate by dragging, zoom with the wheel or a pinch. Nothing is downloadable from the canvas. */
export function Design3D({ model, text, className = "" }: { model: Model3D; text: Design3DText; className?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "failed" | "nowebgl">("loading");
  const [spin, setSpin] = useState(true);
  const [lidOn, setLidOn] = useState(false);
  const spinRef = useRef(spin);
  spinRef.current = spin;
  const lidRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (lidRef.current) lidRef.current.visible = lidOn;
  }, [lidOn]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setStatus("nowebgl");
      return;
    }
    let disposed = false;
    setStatus("loading");
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.005, 50);
    scene.add(new THREE.HemisphereLight(0xfff6ec, 0x9a8a74, 2.3));
    const key = new THREE.DirectionalLight(0xfff4e6, 2.4);
    key.position.set(-2, 3, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 8;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffeedd, 1.1);
    fill.position.set(2.2, 1.2, 1.5);
    scene.add(fill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const pivot = new THREE.Group();
    scene.add(pivot);
    let H = 0.1,
      Wd = 0.1,
      zoom = 1,
      elev = 0.32,
      rotY = 0.5,
      vel = 0;
    const flatLying = model.type === "flat" && model.standing === false;
    const place = () => {
      const size = Math.max(H, Wd * 0.9);
      const dist = (size * 2.6 + 0.08) * zoom;
      const lookY = flatLying ? 0 : H * 0.48;
      const e = flatLying ? Math.max(elev, 0.9) : elev;
      camera.position.set(0, lookY + Math.sin(e) * dist, Math.cos(e) * dist);
      camera.lookAt(0, lookY, 0);
      key.shadow.camera.left = -size * 2;
      key.shadow.camera.right = size * 2;
      key.shadow.camera.top = size * 2;
      key.shadow.camera.bottom = -size;
      key.shadow.camera.updateProjectionMatrix();
    };
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    buildModel(model, lidOn)
      .then(({ group, height, width }) => {
        if (disposed) return;
        H = height;
        Wd = width;
        pivot.add(group);
        lidRef.current = group.getObjectByName("lid") ?? null;
        place();
        setStatus("ok");
      })
      .catch(() => !disposed && setStatus("failed"));

    // drag to rotate, wheel / pinch to zoom
    const pts = new Map<number, PointerEvent>();
    let lx = 0,
      ly = 0,
      pinch = 0;
    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, e);
      lx = e.clientX;
      ly = e.clientY;
      vel = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, e);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinch) {
          zoom = Math.max(0.45, Math.min(2.2, (zoom * pinch) / d));
          place();
        }
        pinch = d;
        return;
      }
      const dx = e.clientX - lx,
        dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      vel = dx * 0.01;
      rotY += vel;
      elev = Math.max(-0.1, Math.min(1.35, elev + dy * 0.006));
      place();
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom = Math.max(0.45, Math.min(2.2, zoom * (1 + Math.sign(e.deltaY) * 0.08)));
      place();
    };
    const c = renderer.domElement;
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("wheel", wheel, { passive: false });

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!pts.size) {
        if (spinRef.current) rotY += 0.004;
        rotY += vel;
        vel *= 0.92;
      }
      pivot.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((mt) => {
          (mt as THREE.MeshStandardMaterial).map?.dispose();
          mt.dispose();
        });
      });
      c.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(model)]);

  return (
    <div className={`relative select-none ${className}`}>
      <div ref={stage} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {status !== "ok" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground/60 pointer-events-none">
          {status === "loading" ? text.loading : status === "nowebgl" ? text.noWebgl : text.failed}
        </div>
      )}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
        <span className="text-[0.7rem] text-foreground/45">{text.hint}</span>
        <div className="flex gap-2 pointer-events-auto">
          {model.type === "cup" && (
            <button onClick={() => setLidOn((v) => !v)} aria-pressed={lidOn} className={`text-xs px-3 py-1.5 border ${lidOn ? "bg-foreground text-background border-foreground" : "bg-background/80 border-border"}`}>
              {text.lid}
            </button>
          )}
          <button onClick={() => setSpin((v) => !v)} aria-pressed={spin} className={`text-xs px-3 py-1.5 border ${spin ? "bg-foreground text-background border-foreground" : "bg-background/80 border-border"}`}>
            {text.spin}
          </button>
        </div>
      </div>
    </div>
  );
}
