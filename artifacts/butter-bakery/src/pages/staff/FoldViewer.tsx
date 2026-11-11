import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useStaffText } from "./i18n";

/**
 * Folding 3D viewer for packaging built from its print dieline.
 * Every panel is cut from the print file's page (PDF points), so the printed design sits exactly where it is printed.
 * The outside texture is the print page; the inside texture is the inside print, mirrored as seen from inside.
 */
export type FoldModel = { type: "fold"; kit: string; boxOut: string; boxIn: string; sleeveOut?: string; sleeveIn?: string };

type Rect = [number, number, number, number];
type Step = { ar: string; en: string; t: number };

const PT = 2.54 / 72; // cm per PDF point
const HP = Math.PI / 2;
const PI = Math.PI;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

type Net = { pw: number; ph: number; cx: number; cy: number; outer: THREE.Material; inner: THREE.Material };
type G = THREE.Group & { userData: { f: [number, number] } };

function netTools(net: Net) {
  const { pw, ph, cx, cy, outer, inner } = net;
  const R = (nx: number, ny: number): [number, number] => [-(nx - cx) * PT, (ny - cy) * PT];
  function panel(rect: Rect) {
    const [x0, y0, x1, y1] = rect;
    const w = (x1 - x0) * PT, h = (y1 - y0) * PT;
    const u0 = x0 / pw, u1 = x1 / pw, v1 = 1 - y0 / ph, v0 = 1 - y1 / ph;
    const g = new THREE.Group();
    const go = new THREE.PlaneGeometry(w, h);
    go.setAttribute("uv", new THREE.Float32BufferAttribute([u1, v0, u0, v0, u1, v1, u0, v1], 2));
    go.rotateX(HP);
    const mo = new THREE.Mesh(go, outer);
    mo.position.y = -0.025;
    const iu0 = (pw - x1) / pw, iu1 = (pw - x0) / pw;
    const gi = new THREE.PlaneGeometry(w, h);
    gi.setAttribute("uv", new THREE.Float32BufferAttribute([iu0, v1, iu1, v1, iu0, v0, iu1, v0], 2));
    gi.rotateX(-HP);
    const mi = new THREE.Mesh(gi, inner);
    mi.position.y = 0.025;
    for (const m of [mo, mi]) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    g.add(mo, mi);
    return g;
  }
  function pivot(parent: G, f: [number, number]): G {
    const g = new THREE.Group() as G;
    const pf = parent.userData.f;
    g.position.set(f[0] - pf[0], 0, f[1] - pf[1]);
    g.userData.f = f;
    parent.add(g);
    return g;
  }
  function attach(pv: G, rect: Rect, off = 0) {
    const p = panel(rect);
    const c = R((rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2);
    p.position.set(c[0] - pv.userData.f[0], off, c[1] - pv.userData.f[1]);
    pv.add(p);
    return p;
  }
  /** A non-rectangular panel (corner webs, lock flaps) given as its outline in page points. */
  function attachPoly(pv: G, pts: [number, number][], off = 0) {
    const f = pv.userData.f;
    const local = pts.map(([nx, ny]) => {
      const r = R(nx, ny);
      return new THREE.Vector2(r[0] - f[0], r[1] - f[1]);
    });
    let tris = THREE.ShapeUtils.triangulateShape(local, []);
    const pos = local.flatMap((v) => [v.x, 0, v.y]);
    // outer face points down (-y), inner face up (+y), like the rectangular panels
    const up = (t: number[]) => {
      const [a, b, c] = t.map((i) => local[i]!);
      return (b!.x - a!.x) * (c!.y - a!.y) - (b!.y - a!.y) * (c!.x - a!.x) < 0;
    };
    const orient = (wantUp: boolean) => tris.flatMap((t) => (up(t) === wantUp ? t : [t[0]!, t[2]!, t[1]!]));
    const g = new THREE.Group();
    const mk = (uv: number[], idx: number[], mat: THREE.Material, y: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat);
      m.position.y = y;
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    };
    mk(pts.flatMap(([nx, ny]) => [nx / pw, 1 - ny / ph]), orient(false), outer, -0.025);
    mk(pts.flatMap(([nx, ny]) => [(pw - nx) / pw, 1 - ny / ph]), orient(true), inner, 0.025);
    g.position.y = off;
    pv.add(g);
    tris = [];
    return g;
  }
  const root = () => {
    const g = new THREE.Group() as G;
    g.userData.f = [0, 0];
    return g;
  };
  return { R, pivot, attach, attachPoly, root };
}

type Kit = {
  title: { ar: string; en: string };
  steps: Step[];
  boxSteps: number; // how many steps belong to the box alone
  boxEnd: number; // timeline point where the box is closed (when a sleeve follows)
  build: (scene: THREE.Scene, m: { boxOut: THREE.Material; boxIn: THREE.Material; slvOut: THREE.Material; slvIn: THREE.Material }) => {
    apply: (b: number, s: number, sleeveOn: boolean) => void;
  };
  views: Record<"angle" | "top" | "front", [number, number, number]>;
};

/** Honey cake family box (butterfly mailer, 165 × 165 × 115 mm inside) with its one-piece carry sleeve. */
const honeycake: Kit = {
  title: { ar: "علبة كيكة العسل مع السليف", en: "Honey cake box with sleeve" },
  steps: [
    { ar: "العلبة مفرودة (الوجه المطبوع)", en: "Flat blank, printed side", t: 0 },
    { ar: "قلب الكرتونة والوجه الداخلي للأعلى", en: "Turn over, inside up", t: 0.09 },
    { ar: "رفع الظهر والواجهة", en: "Raise back and front walls", t: 0.21 },
    { ar: "رفع الجانبين وطيّ الأركان للداخل", en: "Raise sides, tuck the corners", t: 0.32 },
    { ar: "طيّ ألسنة القفل الجانبية مرتين", en: "Roll the side lock flaps", t: 0.44 },
    { ar: "ثني لسان الغطاء", en: "Bend the lid tuck", t: 0.51 },
    { ar: "إغلاق الغطاء وإدخال اللسان خلف الواجهة", en: "Close the lid, tuck behind the front", t: 0.66 },
    { ar: "رفع ليبل السليف على الواجهة والظهر", en: "Sleeve labels up the front and back", t: 0.78 },
    { ar: "ضمّ اللوحين المائلين نحو الأعلى", en: "Lean the side panels in", t: 0.88 },
    { ar: "لصق المقبضين معاً", en: "Glue the handles together", t: 1 },
  ],
  boxSteps: 7,
  boxEnd: 0.66,
  views: { angle: [46, 60, 72], top: [0, 96, 0.01], front: [0, 16, 84] },
  build(scene, m) {
    // Box dieline traced from the print file (page 1392 × 2081 pt).
    const B = netTools({ pw: 1392, ph: 2081.04, cx: 695.5, cy: 1265, outer: m.boxOut, inner: m.boxIn });
    const { R, pivot: pv, attach: A } = B;
    const boxRoot = B.root();
    scene.add(boxRoot);
    A(boxRoot, [462, 1031, 929, 1499]);
    const back = pv(boxRoot, R(695.5, 1031)); A(back, [462, 705, 929, 1031]);
    const earBL = pv(back, R(462, 868)); A(earBL, [388, 705, 462, 1031], 0.11);
    const earBR = pv(back, R(929, 868)); A(earBR, [929, 705, 1003, 1031], 0.11);
    const lid = pv(back, R(695.5, 705)); A(lid, [456, 232, 935, 705]);
    const tuck = pv(lid, R(695.5, 232)); A(tuck, [456, 147, 935, 232]);
    const wingL = pv(tuck, R(456, 190)); A(wingL, [314, 153, 456, 222]);
    const wingR = pv(tuck, R(935, 190)); A(wingR, [935, 153, 1077, 222]);
    const lipAL = pv(lid, R(456, 470)); A(lipAL, [371, 240, 456, 700]);
    const lipBL = pv(lipAL, R(371, 470)); A(lipBL, [286, 240, 371, 700], -0.07);
    const lipAR = pv(lid, R(935, 470)); A(lipAR, [935, 240, 1020, 700]);
    const lipBR = pv(lipAR, R(1020, 470)); A(lipBR, [1020, 240, 1105, 700], -0.07);
    const front = pv(boxRoot, R(695.5, 1499)); A(front, [462, 1499, 929, 1825]);
    const earFL = pv(front, R(462, 1662)); A(earFL, [388, 1499, 462, 1825], 0.11);
    const earFR = pv(front, R(929, 1662)); A(earFR, [929, 1499, 1003, 1825], 0.11);
    const left = pv(boxRoot, R(462, 1265)); A(left, [136, 1031, 462, 1499]);
    const stripLB = pv(left, R(262, 1031)); A(stripLB, [136, 958, 388, 1031], -0.05);
    const stripLF = pv(left, R(262, 1499)); A(stripLF, [136, 1499, 388, 1573], -0.05);
    const right = pv(boxRoot, R(929, 1265)); A(right, [929, 1031, 1255, 1499]);
    const stripRB = pv(right, R(1129, 1031)); A(stripRB, [1003, 958, 1255, 1031], -0.05);
    const stripRF = pv(right, R(1129, 1499)); A(stripRF, [1003, 1499, 1255, 1573], -0.05);

    // Sleeve dieline (page 751 × 2578 pt): handle · panel · label · base · label · panel · handle.
    const S = netTools({ pw: 750.96, ph: 2578.08, cx: 375.5, cy: 1234.5, outer: m.slvOut, inner: m.slvIn });
    const slvRoot = S.root();
    slvRoot.rotation.y = PI;
    scene.add(slvRoot);
    S.attach(slvRoot, [136, 995, 615, 1474]);
    const lblF = S.pivot(slvRoot, S.R(375.5, 995)); S.attach(lblF, [136, 669, 615, 995]);
    const panF = S.pivot(lblF, S.R(375.5, 669)); S.attach(panF, [136, 360, 615, 669]);
    const hdlF = S.pivot(panF, S.R(375.5, 360)); S.attach(hdlF, [211, 147, 540, 360]);
    const lblB = S.pivot(slvRoot, S.R(375.5, 1474)); S.attach(lblB, [136, 1474, 615, 1803]);
    const panB = S.pivot(lblB, S.R(375.5, 1803)); S.attach(panB, [136, 1803, 615, 2109]);
    const hdlB = S.pivot(panB, S.R(375.5, 2109)); S.attach(hdlB, [211, 2109, 540, 2322]);
    const LEAN = Math.asin(8.3 / (309 * PT));

    return {
      apply(b, s, sleeveOn) {
        const f1 = ease(seg(b, 0, 0.12));
        boxRoot.rotation.z = PI * (1 - f1);
        boxRoot.position.y = 6 * Math.sin(PI * f1) + 0.06;
        const f2 = ease(seg(b, 0.15, 0.3)); back.rotation.x = HP * f2; front.rotation.x = -HP * f2;
        const f3 = ease(seg(b, 0.31, 0.44)); left.rotation.z = HP * f3; right.rotation.z = -HP * f3;
        const fe = ease(seg(b, 0.29, 0.42));
        earBL.rotation.z = HP * fe; earBR.rotation.z = -HP * fe; earFL.rotation.z = HP * fe; earFR.rotation.z = -HP * fe;
        const fs = ease(seg(b, 0.31, 0.44)) * (PI - 0.03);
        stripLB.rotation.x = fs; stripLF.rotation.x = -fs; stripRB.rotation.x = fs; stripRF.rotation.x = -fs;
        const fa = ease(seg(b, 0.47, 0.55)); lipAL.rotation.z = HP * fa; lipAR.rotation.z = -HP * fa;
        const fb = ease(seg(b, 0.53, 0.62)); lipBL.rotation.z = (PI - 0.04) * fb; lipBR.rotation.z = -(PI - 0.04) * fb;
        const ft = ease(seg(b, 0.64, 0.72)); tuck.rotation.x = HP * ft; wingL.rotation.z = HP * ft; wingR.rotation.z = -HP * ft;
        lid.rotation.x = HP * ease(seg(b, 0.75, 1));
        slvRoot.visible = sleeveOn && s >= 0;
        const s1 = ease(seg(s, 0, 0.35)), s2 = ease(seg(s, 0.35, 0.7)), s3 = ease(seg(s, 0.7, 1));
        lblF.rotation.x = HP * s1; panF.rotation.x = LEAN * s2; hdlF.rotation.x = -LEAN * s3;
        lblB.rotation.x = -HP * s1; panB.rotation.x = -LEAN * s2; hdlB.rotation.x = LEAN * s3;
      },
    };
  },
};

/** Butter orange box (mailer, 170 × 120 × 80 mm inside, corner webs) with its one-piece carry sleeve 174 × 596 mm. */
const orangebox: Kit = {
  title: { ar: "العلبة البرتقالية مع السليف", en: "Orange box with sleeve" },
  steps: honeycake.steps,
  boxSteps: 7,
  boxEnd: 0.66,
  views: { angle: [40, 52, 62], top: [0, 84, 0.01], front: [0, 15, 74] },
  build(scene, m) {
    // Box die-line traced from the print file, page 3 (page 1103 × 1491 pt). Right side mirrors the left about x = 568.4.
    const B = netTools({ pw: 1103.04, ph: 1491.12, cx: 568.4, cy: 941, outer: m.boxOut, inner: m.boxIn });
    const { R, pivot: pv, attach: A, attachPoly: AP } = B;
    const X = 1136.8;
    const mir = (pts: [number, number][]) => pts.map(([x, y]) => [X - x, y] as [number, number]);
    const boxRoot = B.root();
    scene.add(boxRoot);
    A(boxRoot, [327.5, 771, 809.3, 1111]);                                   // base 170 × 120
    const back = pv(boxRoot, R(568.4, 771)); A(back, [327.5, 544.3, 809.3, 771]);
    const earBPts: [number, number][] = [[327.5, 544.3], [292.3, 553.2], [279.7, 556.3], [270.8, 567.6], [270.8, 580.6], [270, 715.3], [327.5, 771]];
    const earBL = pv(back, R(327.5, 657)); AP(earBL, earBPts, 0.11);
    const earBR = pv(back, R(809.3, 657)); AP(earBR, mir(earBPts), 0.11);
    const lid = pv(back, R(568.4, 544.3)); A(lid, [321.8, 198.7, 815, 544.3]);
    const tuck = pv(lid, R(568.4, 198.7)); A(tuck, [321.9, 113.7, 815, 198.7]);
    const wingPts: [number, number][] = [[321.9, 113.7], [310.5, 118], [180.1, 118], [180.1, 193.1], [242.1, 193.1], [247.5, 198.7], [321.9, 198.7]];
    const wingL = pv(tuck, R(321.9, 156)); AP(wingL, wingPts);
    const wingR = pv(tuck, R(815, 156)); AP(wingR, mir(wingPts));
    const lipAPts: [number, number][] = [[236.8, 198.7], [321.8, 198.7], [321.8, 324.6], [326.1, 327.5], [326.1, 426.6], [321.8, 429.4], [321.8, 544.3], [236.8, 544.3]];
    const lipBPts: [number, number][] = [[236.8, 198.7], [231.2, 201.6], [154.6, 201.6], [154.6, 327.4], [144.7, 330.3], [144.7, 423.8], [154.6, 426.6], [154.6, 541.5], [231.2, 541.5], [236.8, 544.3]];
    const lipAL = pv(lid, R(321.8, 371)); AP(lipAL, lipAPts);
    const lipBL = pv(lipAL, R(236.8, 371)); AP(lipBL, lipBPts, -0.07);
    const lipAR = pv(lid, R(815, 371)); AP(lipAR, mir(lipAPts));
    const lipBR = pv(lipAR, R(900, 371)); AP(lipBR, mir(lipBPts), -0.07);
    const front = pv(boxRoot, R(568.4, 1111)); A(front, [327.5, 1111, 809.3, 1337.6]);
    const earFPts: [number, number][] = [[327.5, 1337.6], [292.3, 1328.8], [279.7, 1325.6], [270.8, 1314.3], [270.8, 1301.3], [270, 1166.7], [327.5, 1111]];
    const earFL = pv(front, R(327.5, 1224)); AP(earFL, earFPts, 0.11);
    const earFR = pv(front, R(809.3, 1224)); AP(earFR, mir(earFPts), 0.11);
    const left = pv(boxRoot, R(327.5, 941)); A(left, [100.8, 771, 327.5, 1111]);
    const stripBPts: [number, number][] = [[327.5, 771], [270, 715.3], [137.1, 714.3], [124.1, 714.3], [112.7, 723.2], [109.6, 735.8], [100.8, 771]];
    const stripFPts: [number, number][] = [[327.5, 1111], [270, 1166.7], [137.1, 1167.6], [124.1, 1167.6], [112.7, 1158.8], [109.6, 1146.2], [100.8, 1111]];
    const stripLB = pv(left, R(214, 771)); AP(stripLB, stripBPts, -0.05);
    const stripLF = pv(left, R(214, 1111)); AP(stripLF, stripFPts, -0.05);
    const right = pv(boxRoot, R(809.3, 941)); A(right, [809.3, 771, 1036, 1111]);
    const stripRB = pv(right, R(922.8, 771)); AP(stripRB, mir(stripBPts), -0.05);
    const stripRF = pv(right, R(922.8, 1111)); AP(stripRF, mir(stripFPts), -0.05);

    // Sleeve 174 × 596 mm (page in points): handle 75 · panel 80 · label 81 · base 124 · label 81 · panel 80 · handle 75.
    const MP = 72 / 25.4;
    const sw = 174 * MP, sh = 596 * MP, HO = 29 * MP;
    const Yr = [0, 75, 155, 236, 360, 441, 521, 596].map((v) => v * MP);
    const S = netTools({ pw: sw, ph: sh, cx: sw / 2, cy: (Yr[3]! + Yr[4]!) / 2, outer: m.slvOut, inner: m.slvIn });
    const slvRoot = S.root();
    slvRoot.rotation.y = PI;
    scene.add(slvRoot);
    const c = sw / 2;
    S.attach(slvRoot, [0, Yr[3]!, sw, Yr[4]!]);
    const lblF = S.pivot(slvRoot, S.R(c, Yr[3]!)); S.attach(lblF, [0, Yr[2]!, sw, Yr[3]!]);
    const panF = S.pivot(lblF, S.R(c, Yr[2]!)); S.attach(panF, [0, Yr[1]!, sw, Yr[2]!]);
    const hdlF = S.pivot(panF, S.R(c, Yr[1]!)); S.attach(hdlF, [HO, 0, sw - HO, Yr[1]!]);
    const lblB = S.pivot(slvRoot, S.R(c, Yr[4]!)); S.attach(lblB, [0, Yr[4]!, sw, Yr[5]!]);
    const panB = S.pivot(lblB, S.R(c, Yr[5]!)); S.attach(panB, [0, Yr[5]!, sw, Yr[6]!]);
    const hdlB = S.pivot(panB, S.R(c, Yr[6]!)); S.attach(hdlB, [HO, Yr[6]!, sw - HO, sh]);
    const LEAN = Math.asin(6.05 / 8.0);

    return {
      apply(b, s, sleeveOn) {
        const f1 = ease(seg(b, 0, 0.12));
        boxRoot.rotation.z = PI * (1 - f1);
        boxRoot.position.y = 5 * Math.sin(PI * f1) + 0.06;
        const f2 = ease(seg(b, 0.15, 0.3)); back.rotation.x = HP * f2; front.rotation.x = -HP * f2;
        const f3 = ease(seg(b, 0.31, 0.44)); left.rotation.z = HP * f3; right.rotation.z = -HP * f3;
        const fe = ease(seg(b, 0.29, 0.42));
        earBL.rotation.z = HP * fe; earBR.rotation.z = -HP * fe; earFL.rotation.z = HP * fe; earFR.rotation.z = -HP * fe;
        const fs = ease(seg(b, 0.31, 0.44)) * (PI - 0.03);
        stripLB.rotation.x = fs; stripLF.rotation.x = -fs; stripRB.rotation.x = fs; stripRF.rotation.x = -fs;
        const fa = ease(seg(b, 0.47, 0.55)); lipAL.rotation.z = HP * fa; lipAR.rotation.z = -HP * fa;
        const fb = ease(seg(b, 0.53, 0.62)); lipBL.rotation.z = (PI - 0.04) * fb; lipBR.rotation.z = -(PI - 0.04) * fb;
        const ft = ease(seg(b, 0.64, 0.72)); tuck.rotation.x = HP * ft; wingL.rotation.z = HP * ft; wingR.rotation.z = -HP * ft;
        lid.rotation.x = HP * ease(seg(b, 0.75, 1));
        slvRoot.visible = sleeveOn && s >= 0;
        const s1 = ease(seg(s, 0, 0.35)), s2 = ease(seg(s, 0.35, 0.7)), s3 = ease(seg(s, 0.7, 1));
        lblF.rotation.x = HP * s1; panF.rotation.x = LEAN * s2; hdlF.rotation.x = -LEAN * s3;
        lblB.rotation.x = -HP * s1; panB.rotation.x = -LEAN * s2; hdlB.rotation.x = LEAN * s3;
      },
    };
  },
};

/** CROGG box, 4 pieces: roll-end tuck-front box 262 × 70 × 73 mm (double side walls, lid dust flaps) + carry sleeve 264 × 470 mm.
 *  Die-line in mm (flat 550 × 318), converted to points for the net. */
const crogg4: Kit = {
  title: { ar: "علبة CROGG ٤ قطع مع السليف", en: "CROGG box, 4 pieces, with sleeve" },
  steps: [
    { ar: "العلبة مفرودة (الوجه المطبوع)", en: "Flat blank, printed side", t: 0 },
    { ar: "قلب الكرتونة، الوجه الداخلي للأعلى", en: "Turn over, inside up", t: 0.08 },
    { ar: "رفع الواجهة والظهر", en: "Raise front and back walls", t: 0.2 },
    { ar: "طيّ الأذن ورفع الجنبين", en: "Ears in, raise the sides", t: 0.29 },
    { ar: "لفّ الجدار الداخلي وتقفيل الألسنة", en: "Roll the inner side walls, lock the tabs", t: 0.4 },
    { ar: "طيّ جناحي الغطاء", en: "Fold the lid dust flaps", t: 0.46 },
    { ar: "إغلاق الغطاء وإدخال اللسان خلف الواجهة", en: "Close the lid, tuck behind the front", t: 0.66 },
    { ar: "رفع ليبل السليف على الواجهة والظهر", en: "Sleeve labels up the front and back", t: 0.78 },
    { ar: "ضمّ اللوحين المائلين نحو الأعلى", en: "Lean the side panels in", t: 0.88 },
    { ar: "لصق المقبضين معاً", en: "Glue the handles together", t: 1 },
  ],
  boxSteps: 7,
  boxEnd: 0.66,
  views: { angle: [44, 52, 68], top: [0, 90, 0.01], front: [0, 16, 80] },
  build(scene, m) {
    const MP = 72 / 25.4;
    const pt = (pts: [number, number][]) => pts.map(([x, y]) => [x * MP, y * MP] as [number, number]);
    const rc = (a: number, b: number, c: number, d: number): Rect => [a * MP, b * MP, c * MP, d * MP];
    const B = netTools({ pw: 550 * MP, ph: 317 * MP, cx: 275 * MP, cy: 209 * MP, outer: m.boxOut, inner: m.boxIn });
    const { pivot: pv, attach: A, attachPoly: AP } = B;
    const R = (x: number, y: number) => B.R(x * MP, y * MP);
    const mir = (pts: [number, number][]) => pts.map(([x, y]) => [550 - x, y] as [number, number]);
    const boxRoot = B.root();
    scene.add(boxRoot);
    A(boxRoot, rc(144, 174, 406, 244));                                          // base 262 × 70
    const back = pv(boxRoot, R(275, 174)); A(back, rc(144, 101, 406, 174));       // back wall 73
    const earB: [number, number][] = [[144, 102], [84, 110], [84, 171], [144, 173]];
    const earBL = pv(back, R(144, 137)); AP(earBL, pt(earB), 0.11);
    const earBR = pv(back, R(406, 137)); AP(earBR, pt(mir(earB)), 0.11);
    const lid = pv(back, R(275, 101)); A(lid, rc(143, 30, 407, 101));             // lid 264 × 71
    const tuck = pv(lid, R(275, 30)); AP(tuck, pt([[145, 30], [145, 10], [155, 0], [395, 0], [405, 10], [405, 30]]));
    const dust: [number, number][] = [[143, 33], [118, 40], [118, 95], [143, 99]];
    const dustL = pv(lid, R(143, 65)); AP(dustL, pt(dust));
    const dustR = pv(lid, R(407, 65)); AP(dustR, pt(mir(dust)));
    const front = pv(boxRoot, R(275, 244)); A(front, rc(144, 244, 406, 317));     // front wall 73
    const earF: [number, number][] = [[144, 245], [84, 253], [84, 314], [144, 316]];
    const earFL = pv(front, R(144, 280)); AP(earFL, pt(earF), 0.11);
    const earFR = pv(front, R(406, 280)); AP(earFR, pt(mir(earF)), 0.11);
    const left = pv(boxRoot, R(144, 209)); A(left, rc(71, 174, 144, 244));        // side walls 73
    const right = pv(boxRoot, R(406, 209)); A(right, rc(406, 174, 479, 244));
    const inner: [number, number][] = [[71, 174], [0, 178], [0, 188], [-4, 188], [-4, 202], [0, 202], [0, 216], [-4, 216], [-4, 230], [0, 230], [0, 240], [71, 244]];
    const innerL = pv(left, R(71, 209)); AP(innerL, pt(inner), -0.05);           // rolled inner wall with lock tabs
    const innerR = pv(right, R(479, 209)); AP(innerR, pt(mir(inner)), -0.05);

    // Sleeve 264 × 470 mm: handle 75 · panel 50 · label 74 · base 72 · label 74 · panel 50 · handle 75.
    const sw = 264 * MP, sh = 470 * MP, HO = 74 * MP;
    const Yr = [0, 75, 125, 199, 271, 345, 395, 470].map((v) => v * MP);
    const S = netTools({ pw: sw, ph: sh, cx: sw / 2, cy: (Yr[3]! + Yr[4]!) / 2, outer: m.slvOut, inner: m.slvIn });
    const slvRoot = S.root();
    slvRoot.rotation.y = PI;
    scene.add(slvRoot);
    const c = sw / 2;
    S.attach(slvRoot, [0, Yr[3]!, sw, Yr[4]!]);
    const lblF = S.pivot(slvRoot, S.R(c, Yr[3]!)); S.attach(lblF, [0, Yr[2]!, sw, Yr[3]!]);
    const panF = S.pivot(lblF, S.R(c, Yr[2]!)); S.attach(panF, [0, Yr[1]!, sw, Yr[2]!]);
    const hdlF = S.pivot(panF, S.R(c, Yr[1]!)); S.attach(hdlF, [HO, 0, sw - HO, Yr[1]!]);
    const lblB = S.pivot(slvRoot, S.R(c, Yr[4]!)); S.attach(lblB, [0, Yr[4]!, sw, Yr[5]!]);
    const panB = S.pivot(lblB, S.R(c, Yr[5]!)); S.attach(panB, [0, Yr[5]!, sw, Yr[6]!]);
    const hdlB = S.pivot(panB, S.R(c, Yr[6]!)); S.attach(hdlB, [HO, Yr[6]!, sw - HO, sh]);
    const LEAN = Math.asin(34.5 / 50);

    return {
      apply(b, s, sleeveOn) {
        const f1 = ease(seg(b, 0, 0.12));
        boxRoot.rotation.z = PI * (1 - f1);
        boxRoot.position.y = 6 * Math.sin(PI * f1) + 0.06;
        const f2 = ease(seg(b, 0.15, 0.3)); back.rotation.x = HP * f2; front.rotation.x = -HP * f2;
        const fe = ease(seg(b, 0.29, 0.4));
        earBL.rotation.z = HP * fe; earBR.rotation.z = -HP * fe; earFL.rotation.z = HP * fe; earFR.rotation.z = -HP * fe;
        const f3 = ease(seg(b, 0.33, 0.45)); left.rotation.z = HP * f3; right.rotation.z = -HP * f3;
        const fi = ease(seg(b, 0.46, 0.6)) * (PI - 0.04); innerL.rotation.z = fi; innerR.rotation.z = -fi;
        const fd = ease(seg(b, 0.6, 0.7)); dustL.rotation.z = HP * fd; dustR.rotation.z = -HP * fd;
        const ft = ease(seg(b, 0.64, 0.74)); tuck.rotation.x = (HP + 0.12) * ft;
        lid.rotation.x = HP * ease(seg(b, 0.75, 1));
        slvRoot.visible = sleeveOn && s >= 0;
        const s1 = ease(seg(s, 0, 0.35)), s2 = ease(seg(s, 0.35, 0.7)), s3 = ease(seg(s, 0.7, 1));
        lblF.rotation.x = HP * s1; panF.rotation.x = LEAN * s2; hdlF.rotation.x = -LEAN * s3;
        lblB.rotation.x = -HP * s1; panB.rotation.x = -LEAN * s2; hdlB.rotation.x = LEAN * s3;
      },
    };
  },
};

export const FOLD_KITS: Record<string, Kit> = { honeycake, orangebox, crogg4 };

const T = {
  ar: { loading: "جارٍ تجهيز النموذج…", failed: "تعذّر تحميل النموذج.", noWebgl: "يحتاج العرض ثلاثي الأبعاد إلى WebGL، وهو معطّل في هذا المتصفح.", play: "تشغيل التجميع", pause: "إيقاف", open: "فتح العلبة", reset: "فرد", withSleeve: "مع السليف", boxOnly: "العلبة فقط", angle: "مائلة", top: "من أعلى", front: "من الأمام", stage: "مرحلة التجميع", prev: "الخطوة السابقة", next: "الخطوة التالية", hint: "اسحب للتدوير · كبّر بالعجلة أو بإصبعين" },
  en: { loading: "Preparing the model…", failed: "Could not load the model.", noWebgl: "3D needs WebGL, which this browser has turned off.", play: "Play assembly", pause: "Pause", open: "Open the box", reset: "Flatten", withSleeve: "With sleeve", boxOnly: "Box only", angle: "Angle", top: "Top", front: "Front", stage: "Assembly stage", prev: "Previous step", next: "Next step", hint: "Drag to rotate · scroll or pinch to zoom" },
};

export function FoldViewer({ model, className = "" }: { model: FoldModel; className?: string }) {
  const { isAr } = useStaffText();
  const tx = isAr ? T.ar : T.en;
  const kit = FOLD_KITS[model.kit];
  const stage = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "failed" | "nowebgl">("loading");
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const hasSleeve = !!(model.sleeveOut && model.sleeveIn);
  const [sleeveOn, setSleeveOn] = useState(hasSleeve);
  const api = useRef<{ setT: (v: number) => void; view: (v: "angle" | "top" | "front") => void } | null>(null);
  const st = useRef({ t: 0, playing: false, dir: 1, sleeveOn: hasSleeve });
  st.current.sleeveOn = sleeveOn && hasSleeve;

  useEffect(() => {
    const el = stage.current;
    if (!el || !kit) return;
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
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 600);
    camera.position.set(...kit.views.angle);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 7, 0);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 20;
    controls.maxDistance = 160;
    scene.add(new THREE.HemisphereLight(0xfff7ee, 0x8a7563, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 1.55);
    sun.position.set(-24, 52, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 });
    sun.shadow.bias = -0.0005;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffeedd, 0.35);
    fill.position.set(26, 18, -26);
    scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -HP;
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    scene.add(ground);

    const mat = (o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0, alphaTest: 0.5, visible: false, ...o });
    const mats = { boxOut: mat(), boxIn: mat({ roughness: 0.9 }), slvOut: mat(), slvIn: mat({ roughness: 0.9 }) };
    const rig = kit.build(scene, mats);

    const apply = (v: number) => {
      const sl = st.current.sleeveOn;
      const b = sl ? Math.min(1, v / kit.boxEnd) : v;
      const s = sl ? (v - kit.boxEnd) / (1 - kit.boxEnd) : -1;
      rig.apply(b, s, sl);
    };
    api.current = {
      setT: (v) => {
        st.current.t = clamp(v, 0, 1);
        apply(st.current.t);
      },
      view: (k) => {
        camAnim = { from: camera.position.clone(), to: new THREE.Vector3(...kit.views[k]), k: 0 };
      },
    };
    apply(st.current.t);

    let camAnim: { from: THREE.Vector3; to: THREE.Vector3; k: number } | null = null;
    const loader = new THREE.TextureLoader();
    const load = (u: string) =>
      new Promise<THREE.Texture>((ok, bad) =>
        loader.load(u, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          ok(tex);
        }, undefined, bad),
      );
    const urls = [model.boxOut, model.boxIn, ...(hasSleeve ? [model.sleeveOut!, model.sleeveIn!] : [])];
    Promise.all(urls.map(load))
      .then(([o, i, so, si]) => {
        if (disposed) return;
        mats.boxOut.map = o; mats.boxIn.map = i;
        if (so && si) { mats.slvOut.map = so; mats.slvIn.map = si; }
        for (const m of Object.values(mats)) { m.visible = !!m.map; m.needsUpdate = true; }
        setStatus("ok");
      })
      .catch(() => !disposed && setStatus("failed"));

    const resize = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    let raf = 0;
    let lastShown = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const S = st.current;
      if (S.playing) {
        S.t = clamp(S.t + (S.dir * dt) / (reduce ? 4 : 10), 0, 1);
        apply(S.t);
        if (S.t <= 0 || S.t >= 1) {
          S.playing = false;
          setPlaying(false);
        }
        if (Math.abs(S.t - lastShown) > 0.004 || !S.playing) {
          lastShown = S.t;
          setT(S.t);
        }
      }
      if (camAnim) {
        camAnim.k = Math.min(1, camAnim.k + dt * 1.6);
        camera.position.lerpVectors(camAnim.from, camAnim.to, ease(camAnim.k));
        if (camAnim.k >= 1) camAnim = null;
      }
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      api.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose?.());
      for (const m of Object.values(mats)) { m.map?.dispose(); m.dispose(); }
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.kit, model.boxOut, model.boxIn, model.sleeveOut, model.sleeveIn]);

  if (!kit) return <div className={`flex items-center justify-center text-sm text-foreground/45 ${className}`}>{tx.failed}</div>;

  const withSl = sleeveOn && hasSleeve;
  const steps = withSl ? kit.steps : kit.steps.slice(0, kit.boxSteps);
  const stepT = (i: number) => (withSl ? kit.steps[i]!.t : Math.min(1, kit.steps[i]!.t / kit.boxEnd));
  let cur = 0;
  steps.forEach((_, i) => { if (t >= stepT(i) - 0.001) cur = i; });
  const go = (v: number) => {
    st.current.playing = false;
    setPlaying(false);
    api.current?.setT(v);
    setT(clamp(v, 0, 1));
  };
  const togglePlay = () => {
    const S = st.current;
    if (S.playing) { S.playing = false; setPlaying(false); return; }
    S.dir = S.t >= 0.999 ? -1 : 1;
    S.playing = true;
    setPlaying(true);
  };
  const setSleeve = (v: boolean) => {
    const done = st.current.t >= 0.999;
    st.current.sleeveOn = v && hasSleeve;
    setSleeveOn(v);
    go(done ? 1 : st.current.t);
  };
  const step = steps[cur]!;
  const num = (n: number) => (isAr ? n.toLocaleString("ar-EG") : String(n));
  const btn = "text-xs px-3 py-1.5 border min-h-[34px]";
  const on = "bg-foreground text-background border-foreground";
  const off = "bg-background/85 border-border hover:border-primary";

  return (
    <div className={`relative select-none ${className}`}>
      <div ref={stage} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {status !== "ok" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground/60 pointer-events-none">
          {status === "loading" ? tx.loading : status === "nowebgl" ? tx.noWebgl : tx.failed}
        </div>
      )}
      <div className="absolute top-3 inset-x-3 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-background/85 border border-border px-2 py-1.5 pointer-events-auto max-w-full">
          <button type="button" aria-label={tx.prev} onClick={() => go(stepT(Math.max(0, cur - 1)))} className="w-7 h-7 grid place-items-center hover:text-primary">{isAr ? "›" : "‹"}</button>
          <span className="w-6 h-6 rounded-full grid place-items-center text-[0.7rem] font-semibold shrink-0" style={{ background: "var(--bb-orange, #FE5000)", color: "#2D120D" }}>{num(cur + 1)}</span>
          <span className="text-xs leading-tight">
            {isAr ? step.ar : step.en}
            <span className="block text-[0.65rem] text-foreground/50" dir="ltr">{isAr ? step.en : step.ar} · {num(cur + 1)}/{num(steps.length)}</span>
          </span>
          <button type="button" aria-label={tx.next} onClick={() => go(stepT(Math.min(steps.length - 1, cur + 1)))} className="w-7 h-7 grid place-items-center hover:text-primary">{isAr ? "‹" : "›"}</button>
        </div>
        <div className="flex gap-1 pointer-events-auto">
          {(["angle", "top", "front"] as const).map((v) => (
            <button key={v} type="button" onClick={() => api.current?.view(v)} className={`${btn} ${off}`}>{tx[v]}</button>
          ))}
        </div>
      </div>
      <div className="absolute bottom-3 inset-x-3 space-y-2 pointer-events-none">
        <input
          type="range" min={0} max={1000} value={Math.round(t * 1000)} aria-label={tx.stage}
          onChange={(e) => go(Number(e.target.value) / 1000)}
          className="w-full pointer-events-auto" style={{ accentColor: "var(--bb-orange, #FE5000)" }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[0.7rem] text-foreground/45 hidden sm:block">{tx.hint}</span>
          <div className="flex flex-wrap gap-1 pointer-events-auto">
            {hasSleeve && (
              <>
                <button type="button" aria-pressed={withSl} onClick={() => setSleeve(true)} className={`${btn} ${withSl ? on : off}`}>{tx.withSleeve}</button>
                <button type="button" aria-pressed={!withSl} onClick={() => setSleeve(false)} className={`${btn} ${!withSl ? on : off}`}>{tx.boxOnly}</button>
              </>
            )}
            <button type="button" onClick={() => go(0)} className={`${btn} ${off}`}>{tx.reset}</button>
            <button type="button" onClick={togglePlay} className={`${btn} font-semibold`} style={{ background: "var(--bb-orange, #FE5000)", color: "#2D120D", borderColor: "var(--bb-orange, #FE5000)" }}>
              {playing ? tx.pause : t >= 0.999 ? tx.open : tx.play}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
