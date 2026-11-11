// cast.js — elenco original de "Cadê os dinossauros?": Noé, Rex, a pomba (e o corvo), a Ampulheta-Portal, a arca, bichos e cenário
// Coordenadas locais: origem nos pés, y para baixo.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // Noé
  nSkin: '#d9a27a', nSkinS: '#b88158', coat: '#f2c230', coatS: '#c99a1a', beard: '#eeeef4', beardS: '#c6c6d6', boot: '#2f5a3e', board: '#9a6b3c', paper: '#fbf6e6',
  // Rex
  rex: '#9b8ce0', rexS: '#7a6bc2', rexB: '#f3e6c4', rexBS: '#d9c79c', stripe: '#6f5fb6', buoy: '#ff7a2f', buoyS: '#d65a17',
  // pomba / corvo
  dove: '#e9e9f1', doveS: '#b9b9cc', neck: '#8fb7c9', beak: '#e8a23a', feet: '#e86a5a', crow: '#2a2633', crowS: '#16131c',
  // arca
  wood: '#a86a35', woodS: '#7f4c22', woodL: '#c98a4e', roof: '#6b3f1f',
  // portal (único brilho do filme)
  glow: '#ff2fa8', glowL: '#ffd1ec', glowD: '#c4127a',
};

// —— rosto (gramática do estilo) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.nSkin, closed = false, lw = 6, jitter = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], {
    fill: PAL.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
const P0 = (P, k, d) => P[k] ?? d;

export function hand(x, y, ang, r = 20, col = PAL.nSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });
// —— 1. NOÉ: impassível, capa de chuva amarela de pescador, barba-nuvem gigante, prancheta ——
export function noe(P) {
  const f = P.face ?? 1, t = P.t ?? 0, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor(t * 12) * 3.3) - .5) * 8 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  // botas de borracha
  for (const sx of [-1, 1]) {
    const st = P.walk ? Math.sin(t * 9 + (sx > 0 ? Math.PI : 0)) * 18 : 0;
    shape(rr(sx * 34 - 30 + st, -120, 56, 100, 14), { fill: PAL.boot, lw: 7 });
    shape(spline([[sx * 34 - 36 + st, 0], [sx * 34 - 34 + st, -30], [sx * 34 + 30 + st, -34], [sx * 34 + 58 + st, -10], [sx * 34 + 54 + st, 2]]), { fill: PAL.boot, lw: 7 });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-82, -400], shF = [80, -400];
  const armB = P.armL || { h: [-30, 170], bend: -14 }, armF = P.armR || { h: [60, 120], bend: 30 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 50, 42), { fill: PAL.coat, lw: 7, shade: () => fillOnly(rect(-400, sh[1] + arm.h[1] * .8, 800, 16), PAL.coatS, { boil: .3 }) });
    const ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    if (hold === 'clip') { clipboard(hp[0] + 16, hp[1] - 112, .9, { a: -.12, marks: P.marks ?? 0, zero: P.zero ?? 0 }); hand(hp[0], hp[1], ang, 20, PAL.nSkin, { fist: true }); return; }
    if (hold === 'glass') { ampulheta(hp[0] + 6, hp[1] - 70, .6, { glow: P.glow ?? 0, t, a: P.glassA ?? 0 }); hand(hp[0], hp[1], ang, 20, PAL.nSkin, { fist: true }); return; }
    if (hold === 'stamp') { push(); translate(hp[0], hp[1] - 30); shape(rr(-26, -60, 52, 50, 8), { fill: PAL.woodL, lw: 6 }); shape(rr(-40, -12, 80, 24, 6), { fill: '#e8392b', lw: 6 }); pop(); hand(hp[0], hp[1], ang, 20, PAL.nSkin, { fist: true }); return; }
    hand(hp[0], hp[1], ang, 20, PAL.nSkin, { fist: !!hold });
  };
  drawArm(shB, armB, P.holdL);
  // capa de chuva em A, botões de madeira
  const body = spline([[-56, -440], [-100, -400], [-118, -250], [-132, -110], [0, -96], [132, -110], [118, -250], [100, -400], [56, -440]]);
  shape(body, {
    fill: PAL.coat, lw: 7, shade: () => {
      fillOnly(spline([[40, -450], [140, -400], [150, -90], [60, -90], [80, -300]]), PAL.coatS, { boil: .4 });
      if (P.wet) for (let k = 0; k < 5; k++) fillOnly(ell(-80 + k * 40, -200 + (k % 2) * 60, 6, 12, 8), '#fff4c2', { boil: .3 });
    }
  });
  stroke([[0, -300], [0, -100]], 5, { line: PAL.coatS });
  for (const yy of [-250, -190, -130]) shape(ell(16, yy, 9, 9, 10), { fill: PAL.woodS, lw: 4 });
  push(); translate(0, -500); rotate(P.headTilt ?? 0); headNoe(P, t); pop();
  drawArm(shF, armF, P.holdR);
  pop(); pop();
}
function headNoe(P, t) {
  const HD = spline([[0, -70], [50, -62], [68, -20], [66, 30], [46, 60], [0, 70], [-46, 60], [-66, 26], [-64, -24], [-46, -62]]);
  shape(HD, { fill: PAL.nSkin, lw: 7, shade: () => fillOnly(spline([[30, -80], [90, -40], [90, 80], [20, 90], [50, 20]]), PAL.nSkinS, { boil: .3 }) });
  // orelhas
  for (const sx of [-1, 1]) shape(ell(sx * 70, 8, 14, 20, 12), { fill: PAL.nSkin, lw: 6 });
  // barba-nuvem (cobre o peito); a boca abre dentro dela
  const sg = P.singe ?? 0;
  const bc = sg ? '#8a8a96' : PAL.beard, bs = sg ? '#5d5d68' : PAL.beardS;
  const B = [[-70, 20], [-104, 70], [-100, 140], [-120, 200], [-80, 260], [-40, 300], [0, 280], [40, 310], [90, 270], [118, 200], [104, 130], [104, 70], [70, 20], [40, 50], [0, 36], [-40, 50]];
  shape(spline(B), { fill: bc, lw: 7, shade: () => { for (const [x, y, r] of [[60, 120, 46], [76, 220, 40], [-20, 250, 34]]) fillOnly(ell(x + 20, y, r, r * .8, 16), bs, { boil: .4 }); } });
  for (const [x, y] of [[-60, 150], [10, 190], [70, 160], [-30, 230]]) stroke(arc(x, y, 22, 14, Math.PI * .1, Math.PI * .9, 8), 4, { line: bs });
  if (P.pen) { push(); translate(80, 170); rotate(-.5); shape(rr(-6, -60, 12, 80, 5), { fill: '#3f6fd1', lw: 4 }); pop(); }
  if (P.dove) P.dove();
  // bigode
  shape(spline([[-58, 42], [-30, 26], [0, 34], [30, 26], [58, 42], [30, 50], [0, 44], [-30, 50]]), { fill: bc, lw: 6 });
  const m = P.mouth || {};
  mouth(0, 60, 40, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.15, skew: m.skew ?? 0, lw: 6 });
  // nariz de batata
  shape(ell(4, 18, 20, 16, 14), { fill: PAL.nSkin, lw: 6, shade: () => fillOnly(ell(14, 26, 12, 8, 10), PAL.nSkinS, { boil: .3 }) });
  const lid = P.blink ? 1 : clamp(P.lid ?? .55, 0, 1), look = P.look || [.3, 0];
  const es = P.eyeS ?? 1;
  eye(-24, -12, 22 * es, 25 * es, { lid, look, pupil: 4.2, skin: PAL.nSkin, jitter: P.nerv ? (hash(Math.floor(t * 12)) - .5) * 4 : 0 });
  eye(26, -12, 22 * es, 25 * es, { lid, look, pupil: 4.2, skin: PAL.nSkin });
  for (const ex of [-24, 26]) stroke(arc(ex, 16, 16, 5, Math.PI * .15, Math.PI * .85, 10), 4);
  const br = P.brow ?? 0;
  // sobrancelhas brancas peludas
  shape(spline([[-54, -46 - br * 8], [-26, -56 - br * 10], [-2, -44 - br * 6], [-28, -40 - br * 6]]), { fill: bc, lw: 5 });
  shape(spline([[4, -44 - br * 6], [28, -56 - br * 10], [56, -46 - br * 8], [30, -40 - br * 6]]), { fill: bc, lw: 5 });
  // chapéu de chuva (sueste) amarelo
  shape(spline([[-104, -40], [-70, -64], [-56, -110], [0, -126], [56, -110], [70, -64], [110, -38], [60, -46], [0, -52], [-60, -46]]), { fill: PAL.coat, lw: 7, shade: () => fillOnly(rect(30, -140, 100, 120), PAL.coatS, { boil: .3 }) });
  stroke(quad([-62, -60], [0, -72], [62, -60]), 5, { line: PAL.coatS });
  if (P.drip) { const k = (t * 1.5) % 1; shape(spline([[104, -30 + k * 80], [110, -16 + k * 80], [104, -8 + k * 80], [98, -16 + k * 80]]), { fill: '#bfe9ff', lw: 4 }); }
}
// prancheta com lista de embarque (marks = quantos itens marcados; zero = 0..1 círculo no "0")
export function clipboard(x, y, s = 1, { a = 0, marks = 0, zero = 0, big = false } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(rr(-70, -100, 140, 190, 10), { fill: PAL.board, lw: 6 });
  shape(rr(-58, -82, 116, 160, 4), { fill: PAL.paper, lw: 5 });
  shape(rr(-26, -110, 52, 24, 6), { fill: '#8e99a5', lw: 5 });
  const items = ['GIRAFA', 'ELEFANTE', 'DINOSSAURO'], vals = ['2', '2', '0'];
  items.forEach((it, i) => {
    const yy = -50 + i * 46;
    text(it, -50, yy, { font: '800 15px "Baloo 2"', fill: INK, align: 'left' });
    text(vals[i], 42, yy, { font: '800 20px "Baloo 2"', fill: i === 2 ? '#e8392b' : INK });
    if (marks > i && i < 2) stroke([[30, yy - 2], [37, yy + 6], [52, yy - 10]], 4, { line: '#2f9a4a' });
  });
  if (zero > 0) stroke(arc(42, 42, 18 * (1 + zero * .1), 16, -Math.PI / 2, -Math.PI / 2 + TAU * zero * 1.05, 20), 4, { line: '#e8392b' });
  pop();
}

// —— 2. REX: tiranossauro nervoso e empolgado, bracinhos com boias ——
export function rex(P) {
  const f = P.face ?? 1, t = P.t ?? 0, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor(t * 12) * 5.1) - .5) * 10 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  push(); rotate(P.lean ?? 0);
  // rabo (atrás, à esquerda)
  const tw = Math.sin(t * 4) * 20 + (P.tailUp ?? 0);
  shape(spline([[-60, -260], [-200, -230 - tw * .3], [-340, -160 - tw], [-420, -120 - tw * 1.4], [-330, -110 - tw], [-200, -130], [-60, -150]]), { fill: PAL.rex, lw: 7, shade: () => { for (let k = 0; k < 3; k++) fillOnly(rect(-180 - k * 70, -300, 26, 300), PAL.stripe, { boil: .4 }); } });
  if (P.smoke) for (let k = 0; k < 3; k++) { const kk = (t * 1.2 + k / 3) % 1; fillOnly(ell(-400 - kk * 40, -150 - kk * 220, 20 + kk * 30, 18 + kk * 26, 14), `rgba(90,90,100,${.6 * (1 - kk)})`, { boil: .5 }); }
  // pernas
  for (const [sx, ph] of [[-1, 0], [1, Math.PI]]) {
    const st = P.run ? Math.sin(t * 16 + ph) * 40 : P.walk ? Math.sin(t * 8 + ph) * 22 : 0;
    const lift = P.run ? Math.max(0, Math.sin(t * 16 + ph + 1.6)) * 30 : 0;
    const col = sx < 0 ? PAL.rexS : PAL.rex;
    shape(spline([[sx * 40 - 50, -260], [sx * 40 + 50, -270], [sx * 40 + 60, -150], [sx * 40 + 30 + st * .5, -60 - lift], [sx * 40 - 20 + st * .5, -60 - lift], [sx * 40 - 60, -170]]), { fill: col, lw: 7 });
    shape(spline([[sx * 40 - 34 + st, -lift], [sx * 40 - 30 + st, -70 - lift], [sx * 40 + 20 + st, -72 - lift], [sx * 40 + 70 + st, -14 - lift], [sx * 40 + 66 + st, 2 - lift]]), { fill: col, lw: 7 });
    for (let c = 0; c < 3; c++) shape([[sx * 40 + 44 + st + c * 10, -8 - lift], [sx * 40 + 66 + st + c * 8, -4 - lift], [sx * 40 + 52 + st + c * 10, 6 - lift]], { fill: PAL.white, lw: 4 });
  }
  // corpo em gota, barriga creme
  const body = spline([[-80, -230], [-70, -380], [-10, -470], [80, -480], [130, -400], [120, -260], [60, -190], [-30, -190]]);
  shape(body, {
    fill: PAL.rex, lw: 7, shade: () => {
      fillOnly(spline([[30, -460], [110, -430], [120, -270], [50, -200], [10, -300]]), PAL.rexB, { boil: .4 });
      for (let k = 0; k < 4; k++) fillOnly(rect(40, -440 + k * 60, 120, 6), PAL.rexBS, { boil: .3 });
      for (let k = 0; k < 3; k++) fillOnly(spline([[-90, -400 + k * 70], [-30, -390 + k * 70], [-90, -370 + k * 70]]), PAL.stripe, { boil: .4 });
    }
  });
  // cabeça
  push(); translate(60, -470); rotate(P.headTilt ?? 0); headRex(P, t); pop();
  // bracinhos com boias (o gag: não alcançam nada)
  const aw = P.arms ?? 0;   // 0 parado, 1 balançando de alegria, 2 apontando pra cima
  for (const [sx, ph] of [[0, 0], [1, 1.3]]) {
    const ax = 110 + sx * 26, ay = -360 + sx * 6;
    const wv = aw === 1 ? Math.sin(t * 14 + ph) * 18 : 0;
    const hx = ax + (aw === 2 ? 30 : 46), hy = ay + (aw === 2 ? -50 : 20) + wv;
    shape(noodle([ax, ay], [hx, hy], 6, 22, 16), { fill: sx ? PAL.rex : PAL.rexS, lw: 6 });
    shape(ell((ax + hx) / 2, (ay + hy) / 2, 20, 16, 14), { fill: PAL.buoy, lw: 5, shade: () => fillOnly(ell((ax + hx) / 2 + 6, (ay + hy) / 2 + 8, 16, 8, 10), PAL.buoyS, { boil: .3 }) });
    for (let c = 0; c < 2; c++) shape([[hx, hy - 6 + c * 10], [hx + 16, hy - 10 + c * 12], [hx + 4, hy + 4 + c * 8]], { fill: PAL.white, lw: 3 });
  }
  if (P.sweat) { sweat(150, -640, 1.2); sweat(-10, -660, .9); }
  pop(); pop();
}
function headRex(P, t) {
  const m = P.mouth || {}, o = clamp(m.o ?? 0, 0, 1.6);
  const ja = o * .5;
  // mandíbula de baixo (gira na dobradiça)
  push(); translate(-40, 10); rotate(ja);
  shape(spline([[0, -10], [120, -14], [200, -4], [196, 34], [120, 44], [10, 36]]), { fill: PAL.rexB, lw: 7, shade: () => fillOnly(rect(-20, 24, 260, 40), PAL.rexBS, { boil: .3 }) });
  for (let k = 0; k < 5; k++) shape([[40 + k * 32, -10], [52 + k * 32, -32], [64 + k * 32, -10]], { fill: PAL.white, lw: 4 });
  if (o > .15) fillOnly(ell(110, 0, 50, 10 + o * 6, 16), PAL.tongue, { boil: .3 });
  pop();
  // interior da boca (entre as mandíbulas)
  if (o > .05) shape(spline([[-36, 6], [150 * Math.cos(ja) - 40, 6 + 150 * Math.sin(ja)], [170, 12]]), { fill: PAL.mouthIn, lw: 0, line: null });
  // crânio
  const sk = spline([[-80, 40], [-90, -40], [-50, -110], [40, -120], [150, -90], [220, -50], [236, 0], [210, 20], [60, 16], [-40, 22]]);
  shape(sk, { fill: PAL.rex, lw: 7, shade: () => { fillOnly(spline([[40, -140], [250, -60], [250, 30], [150, 0], [120, -60]]), PAL.rexS, { boil: .3 }); for (let k = 0; k < 3; k++) fillOnly(ell(-40 + k * 30, -84 + k * 6, 8, 8, 8), PAL.stripe, { boil: .3 }); } });
  for (let k = 0; k < 5; k++) shape([[60 + k * 30, 14], [72 + k * 30, 36], [84 + k * 30, 14]], { fill: PAL.white, lw: 4 });
  dot(210, -36, 5); dot(196, -40, 5);   // narinas
  // sorriso/linha da boca
  stroke([[-40, 22], [60, 18 + (m.sm ?? .3) * -10], [200, 18]], 5);
  // olhos grandes que se tocam (em cima da cabeça)
  const lid = P.blink ? 1 : clamp(P.lid ?? 0, 0, 1), look = P.look || [.5, 0], es = P.eyeS ?? 1;
  const jt = P.nerv ? (hash(Math.floor(t * 12) * 1.7) - .5) * 5 * P.nerv : 0;
  eye(20, -104, 34 * es, 40 * es, { lid, look, pupil: 4.8, skin: PAL.rex, jitter: jt });
  eye(84, -100, 34 * es, 40 * es, { lid, look, pupil: 4.8, skin: PAL.rex, jitter: jt });
  const br = P.brow ?? 0;
  stroke([[-16, -152 - br * 10], [44, -156 - br * 14 + (P.browAng ?? 0) * 12]], 8);
  stroke([[60, -154 - br * 14 + (P.browAng ?? 0) * 12], [120, -146 - br * 10]], 8);
}

// —— 3. POMBA (e o corvo): não fala; arrulha ——
export function bird(P) {
  const t = P.t ?? 0, crow = !!P.crow, f = P.face ?? 1;
  const c = crow ? PAL.crow : PAL.dove, cs = crow ? PAL.crowS : PAL.doveS;
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1)); rotate(P.a ?? 0);
  const fly = P.fly ?? 0, flap = fly ? Math.sin(t * 22 * (P.flapK ?? 1)) : 0;
  if (!fly) for (const sx of [-10, 14]) { stroke([[sx, -30], [sx, -4]], 5, { line: PAL.feet }); stroke([[sx - 10, 0], [sx + 12, 0]], 5, { line: PAL.feet }); }
  // rabo
  shape(spline([[-50, -60], [-110, -50], [-112, -34], [-50, -36]]), { fill: cs, lw: 6 });
  // corpo
  shape(spline([[-60, -50], [-30, -90], [30, -96], [70, -70], [60, -36], [0, -24], [-50, -30]]), { fill: c, lw: 6, shade: () => fillOnly(ell(10, -24, 70, 22, 16), cs, { boil: .3 }) });
  // asa
  push(); translate(-6, -70); rotate(fly ? -.6 + flap * .9 : .1);
  shape(spline([[0, 0], [-50, -10], [-90, 6], [-60, 26], [0, 22]]), { fill: crow ? PAL.crowS : '#d8d8e6', lw: 6 }); pop();
  // cabeça
  const pk = P.peck ? Math.max(0, Math.sin(t * 10)) * 10 : 0;
  push(); translate(54, -104 + pk); rotate(P.headTilt ?? 0);
  shape(ell(0, 0, 34, 32, 22), { fill: c, lw: 6, shade: () => { if (!crow) fillOnly(ell(-8, 26, 34, 12, 14), PAL.neck, { boil: .3 }); } });
  shape([[28, -8], [64, 2], [28, 10]], { fill: crow ? '#3b3640' : PAL.beak, lw: 5 });
  if (P.branch) { stroke([[50, 2], [96, 18]], 4, { line: '#5b7a2e' }); for (let k = 0; k < 3; k++) shape(ell(64 + k * 12, 6 + k * 8 + (k % 2 ? -10 : 10), 10, 5, 8), { fill: '#7fae3a', lw: 3 }); }
  const look = P.look || [.6, 0];
  eye(4, -8, 14, 16, { look, pupil: 3.6, skin: c, lid: P.lid ?? 0, lw: 5 });
  if (P.smug) stroke([[-12, -30], [16, -26]], 5);
  pop();
  pop();
}
// sombra de raptor (a sombra da pomba na parede): silhueta escura translúcida
export function raptorShadow(x, y, s = 1, col = 'rgba(30,20,40,.45)', open = .6) {
  push(); translate(x, y); scale(s);
  // rabo reto + corpo + pescoço em S
  fillOnly(spline([[-360, -250], [-200, -250], [-60, -240], [20, -270], [70, -330], [120, -340], [110, -300], [80, -260], [60, -210], [10, -170], [-80, -170], [-200, -220], [-360, -235]]), col, { boil: .6 });
  // cabeça com mandíbula aberta e dentes
  push(); translate(110, -345);
  fillOnly([[0, -30], [70, -36], [130, -20], [130, -6], [20, 6], [-10, 10]], col, { boil: .6 });
  for (let k = 0; k < 4; k++) fillOnly([[40 + k * 22, -8], [50 + k * 22, 8], [60 + k * 22, -8]], col, { boil: .3 });
  push(); rotate(open * .5); fillOnly([[0, 6], [110, 14], [100, 30], [0, 26]], col, { boil: .6 }); pop();
  pop();
  // braços com garras
  for (const k of [0, 1]) { fillOnly(spline([[30 + k * 10, -220], [90 + k * 10, -190], [130 + k * 10, -170], [110 + k * 10, -160], [70 + k * 10, -175], [20 + k * 10, -200]]), col, { boil: .5 }); for (let c = 0; c < 3; c++) fillOnly([[120 + k * 10, -176 + c * 8], [150 + k * 10, -168 + c * 10], [124 + k * 10, -164 + c * 8]], col, { boil: .3 }); }
  // pernas com a garra em foice
  for (const [lx, d] of [[-60, 0], [-10, 20]]) { fillOnly(spline([[lx - 30, -200], [lx + 30, -200], [lx + 20, -110], [lx + 40, -10], [lx + 70, 0], [lx - 10, 0], [lx - 20, -100]]), col, { boil: .5 }); fillOnly([[lx + 30, -20], [lx + 60, -60], [lx + 44, -14]], col, { boil: .3 }); }
  pop();
}

// —— 4. AMPULHETA-PORTAL: ampulheta com antenas e campainha; a areia brilha magenta ——
export function ampulheta(x, y, s = 1, { glow = 0, t = 0, a = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (glow > 0) { fillOnly(ell(0, 0, 150 * glow, 170 * glow, 30), 'rgba(255,47,168,.18)', { boil: .5 }); fillOnly(ell(0, 0, 100 * glow, 120 * glow, 24), 'rgba(255,47,168,.28)', { boil: .5 }); }
  for (const sx of [-1, 1]) { stroke([[sx * 40, -110], [sx * 70, -190]], 5); shape(ell(sx * 72, -196, 12, 12, 10), { fill: glow > 0 && Math.floor(t * 6) % 2 ? PAL.glow : '#e8392b', lw: 4 }); }
  shape(rr(-80, -120, 160, 26, 8), { fill: PAL.wood, lw: 6 }); shape(rr(-80, 94, 160, 26, 8), { fill: PAL.wood, lw: 6 });
  shape(ell(0, -134, 20, 12, 12), { fill: '#e8392b', lw: 5 });
  const sand = glow > 0 ? PAL.glow : '#e6c27a';
  shape(spline([[-60, -94], [60, -94], [52, -40], [8, 0], [52, 40], [60, 94], [-60, 94], [-52, 40], [-8, 0], [-52, -40]]), {
    fill: 'rgba(220,240,255,.55)', lw: 6, shade: () => {
      fillOnly([[-46, -30], [46, -30], [6, 0], [-6, 0]], sand, { boil: .3 });
      fillOnly(spline([[-56, 94], [-30, 50], [30, 50], [56, 94]]), sand, { boil: .3 });
      fillOnly(rect(-3, 0, 6, 70), sand, { boil: .2 });
    }
  });
  for (const sx of [-1, 1]) stroke([[sx * 70, -96], [sx * 70, 96]], 9, { line: PAL.woodS });
  pop();
}
// o portal: aro irregular magenta, braços em espiral, núcleo claro, faíscas
export function portal(x, y, r, { open = 1, t = 0, sy = 1.2 } = {}) {
  if (open <= 0) return;
  push(); translate(x, y); scale(open, open * sy);
  fillOnly(ell(0, 0, r * 1.5, r * 1.5, 50), 'rgba(255,47,168,.14)', { boil: .5 });
  const rim = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, k = 1 + .07 * Math.sin(a * 5 + t * 3) + .04 * Math.sin(a * 9 - t * 5); rim.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); }
  shape(spline(rim), {
    fill: PAL.glow, lw: 8, shade: () => {
      for (let i = 0; i < 5; i++) { push(); rotate(-t * 2.4 + i * TAU / 5); stroke(spline([[0, 0], [r * .3, -r * .2], [r * .6, -r * .1], [r * .9, r * .2]], false), 14, { line: PAL.glowD }); pop(); }
      fillOnly(ell(0, 0, r * .42, r * .42, 30), PAL.glowL, { boil: .4 });
      fillOnly(ell(0, 0, r * .2, r * .2, 20), '#ffffff', { boil: .3 });
    }
  });
  for (let i = 0; i < 6; i++) { const a = t * 1.7 + i * TAU / 6, rr_ = r * (1.12 + .06 * Math.sin(t * 4 + i)); dot(Math.cos(a) * rr_, Math.sin(a) * rr_, 6, PAL.glowL); }
  for (let i = 0; i < 3; i++) { const k = (t * .8 + i / 3) % 1; shape(spline([[-r * .4 + i * r * .4, r * .95 + k * 60], [-r * .4 + i * r * .4 + 8, r * .95 + k * 60 + 16], [-r * .4 + i * r * .4, r * .95 + k * 60 + 24], [-r * .4 + i * r * .4 - 8, r * .95 + k * 60 + 16]]), { fill: PAL.glow, lw: 4, alpha: 1 - k }); }
  pop();
}

// —— 5. A ARCA: casco de madeira com casinha; janelas por onde saem pescoços ——
export function arca(x, y, L = 900, { t = 0, roll = 0, necks = 1, door = 1, rainbow = 0 } = {}) {
  push(); translate(x, y); rotate(roll); const k = L / 900; scale(k);
  // casinha
  shape(rect(-300, -380, 600, 200), { fill: PAL.woodL, lw: 7, shade: () => { for (let i = 0; i < 6; i++) fillOnly(rect(-310, -380 + i * 34, 640, 4), PAL.wood, { boil: .2 }); } });
  shape([[-340, -370], [0, -480], [340, -370]], { fill: PAL.roof, lw: 7 });
  for (let i = 0; i < 4; i++) shape(rr(-250 + i * 140, -330, 70, 60, 10), { fill: '#3a2614', lw: 6 });
  // pescoços de girafa saindo pelo telhado (gag)
  if (necks) {
    for (const [nx, ph] of [[150, 0], [200, 1.4]]) {
      const sw = Math.sin(t * 2 + ph) * 10;
      shape(noodle([nx, -380], [nx + sw, -640], 0, 36, 30), { fill: '#f2b33c', lw: 6, shade: () => { for (let j = 0; j < 4; j++) fillOnly(ell(nx - 6 + sw * j / 4, -440 - j * 50, 10, 12, 8), '#b8701f', { boil: .3 }); } });
      push(); translate(nx + sw + 10, -660);
      shape(spline([[-26, -16], [10, -26], [46, -10], [48, 10], [-20, 14]]), { fill: '#f2b33c', lw: 6 });
      stroke([[-10, -22], [-14, -46]], 5); stroke([[6, -24], [6, -48]], 5); dot(-14, -48, 6, '#b8701f'); dot(6, -50, 6, '#b8701f');
      eye(4, -6, 9, 10, { look: [.5, 0], pupil: 3, skin: '#f2b33c', lw: 4, lid: .4 });
      pop();
    }
  }
  // casco
  const hull = spline([[-450, -200], [-470, -230], [-400, -60], [-300, 0], [300, 0], [400, -60], [470, -230], [450, -200], [0, -180]]);
  shape(hull, { fill: PAL.wood, lw: 8, shade: () => { for (let i = 0; i < 5; i++) fillOnly(rect(-500, -170 + i * 36, 1000, 5), PAL.woodS, { boil: .2 }); fillOnly(rect(-500, -40, 1000, 60), PAL.woodS, { boil: .3 }); } });
  if (door) { shape(rr(-80, -150, 120, 110, 8), { fill: '#3a2614', lw: 6 }); }
  pop();
}
// prancha de embarque
export function ramp(x0, y0, x1, y1) { shape([[x0, y0], [x1, y1], [x1, y1 + 26], [x0, y0 + 26]], { fill: PAL.woodL, lw: 6 }); }

// —— 6. bichos em pares (embarque) ——
export function giraffe(x, y, s = 1, t = 0) {
  push(); translate(x, y); scale(s);
  const st = Math.sin(t * 8) * 12;
  for (const [lx, ph] of [[-50, 0], [-20, 1], [40, 0], [70, 1]]) shape(noodle([lx, -160], [lx + (ph ? st : -st), 0], 0, 16, 12), { fill: '#f2b33c', lw: 5 });
  shape(ell(10, -190, 90, 50, 22), { fill: '#f2b33c', lw: 6, shade: () => { for (const [a, b] of [[-30, -200], [20, -210], [50, -180], [-10, -170]]) fillOnly(ell(a, b, 14, 12, 10), '#b8701f', { boil: .3 }); } });
  shape(noodle([70, -210], [110, -420], 0, 30, 24), { fill: '#f2b33c', lw: 6 });
  push(); translate(118, -440); shape(spline([[-20, -14], [10, -24], [44, -8], [44, 10], [-16, 14]]), { fill: '#f2b33c', lw: 5 }); stroke([[-6, -20], [-10, -40]], 4); dot(-10, -42, 5, '#b8701f');
  eye(6, -6, 8, 9, { look: [.5, 0], pupil: 3, skin: '#f2b33c', lw: 4, lid: .3 }); pop();
  pop();
}
export function elephant(x, y, s = 1, t = 0) {
  push(); translate(x, y); scale(s);
  const st = Math.sin(t * 7) * 10;
  for (const [lx, ph] of [[-60, 0], [-20, 1], [30, 0], [70, 1]]) shape(rr(lx - 20 + (ph ? st : -st) * .3, -110, 40, 110, 10), { fill: '#9aa3b5', lw: 6 });
  shape(ell(0, -150, 120, 80, 26), { fill: '#9aa3b5', lw: 6, shade: () => fillOnly(ell(20, -90, 120, 30, 20), '#7a8296', { boil: .3 }) });
  shape(ell(110, -190, 56, 52, 22), { fill: '#9aa3b5', lw: 6 });
  shape(noodle([150, -170], [180, -60 + st], 10, 30, 20), { fill: '#9aa3b5', lw: 6 });
  shape(ell(70, -190, 40, 50, 18), { fill: '#b6bdcc', lw: 6 });
  eye(120, -206, 10, 11, { look: [.5, 0], pupil: 3, skin: '#9aa3b5', lw: 4, lid: .3 });
  pop();
}
export function turtle(x, y, s = 1, t = 0) {
  push(); translate(x, y); scale(s);
  shape(ell(70, -36, 30, 24, 14), { fill: '#8bbf5a', lw: 5 }); eye(80, -44, 8, 9, { look: [.5, 0], pupil: 3, skin: '#8bbf5a', lw: 4, lid: .5 });
  for (const lx of [-40, 30]) shape(rr(lx - 12, -24, 24, 24, 8), { fill: '#8bbf5a', lw: 5 });
  shape(spline([[-70, -20], [-50, -70], [0, -86], [50, -70], [70, -20]]), { fill: '#4f7f3a', lw: 6, shade: () => fillOnly(ell(0, -50, 20, 14, 10), '#3c6a2c', { boil: .3 }) });
  pop();
}

// —— 7. asteroide flamejante ——
export function asteroid(x, y, r, { t = 0, a = .7, tail = 1 } = {}) {
  push(); translate(x, y); rotate(a);
  for (let i = 0; i < 3; i++) { const L = r * (3.2 - i * .7) * tail, w = r * (1 - i * .22); fillOnly(spline([[0, -w], [-L * .5, -w * .6 + Math.sin(t * 20 + i) * 6], [-L, 0], [-L * .5, w * .6], [0, w]]), ['#ff5a1f', '#ff9a2f', '#ffe36a'][i], { boil: 1 }); }
  const pts = []; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; pts.push([Math.cos(an) * r * (1 + .12 * Math.sin(i * 2.7)), Math.sin(an) * r * (1 + .12 * Math.cos(i * 1.9))]); }
  shape(spline(pts), { fill: '#6b5a52', lw: 7, shade: () => { fillOnly(ell(r * .2, r * .3, r * .9, r * .6, 20), '#4c3f3a', { boil: .3 }); for (const [cx, cy, cr] of [[-r * .3, -r * .3, r * .2], [r * .3, -r * .1, r * .14]]) fillOnly(ell(cx, cy, cr, cr, 12), '#4c3f3a', { boil: .3 }); } });
  pop();
}

// —— 8. fóssil do Rex (osso virado pedra) ——
export function fossil(x, y, s = 1, col = '#f4ecd8') {
  push(); translate(x, y); scale(s);
  const o = { fill: col, lw: 5 };
  // crânio
  shape(spline([[120, -60], [180, -100], [280, -96], [320, -60], [300, -30], [200, -26], [140, -20]]), { ...o, shade: () => { fillOnly(ell(200, -70, 18, 16, 12), '#8f7f68', { boil: .3 }); fillOnly(ell(250, -66, 30, 12, 12), '#8f7f68', { boil: .3 }); } });
  shape(spline([[140, -14], [220, -16], [300, -20], [290, 6], [200, 10]]), o);
  for (let k = 0; k < 6; k++) shape([[170 + k * 22, -26], [178 + k * 22, -8], [186 + k * 22, -26]], { fill: '#ffffff', lw: 3 });
  // coluna e costelas
  for (let k = 0; k < 14; k++) { const xx = 110 - k * 34, yy = -40 + Math.sin(k * .35) * 30 + k * 4; shape(ell(xx, yy, 14, 11, 10), o); if (k > 1 && k < 7) stroke(arc(xx, yy + 50, 16, 46, -Math.PI * .5, Math.PI * .5, 10), 7, { line: col }); }
  for (let k = 0; k < 14; k++) { const xx = 110 - k * 34, yy = -40 + Math.sin(k * .35) * 30 + k * 4; if (k > 1 && k < 7) stroke(arc(xx, yy + 50, 16, 46, -Math.PI * .5, Math.PI * .5, 10), 3); }
  // pernas
  for (const lx of [-60, -10]) { shape(noodle([lx, 20], [lx + 20, 130], 10, 16, 12), o); shape(noodle([lx + 20, 130], [lx - 10, 220], -6, 12, 10), o); }
  // bracinho (ainda curtinho)
  shape(noodle([60, 20], [90, 50], 0, 10, 8), o);
  pop();
}
