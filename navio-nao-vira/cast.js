// cast.js — elenco original de "Por que ele não vira?": Dalva, Tico, Ondina + o navio e peças reais
// Coordenadas locais: origem nos pés, y para baixo.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // Dalva
  dSkin: '#c98e62', dSkinS: '#a8714a', coat: '#23315c', coatS: '#18223f', brass: '#e2b33c', brassS: '#b98a1f', hairD: '#d8d4cf', cap: '#f4f1ea', capS: '#cfc9bd',
  // Tico
  tSkin: '#bcd98d', tSkinS: '#97b86a', stripe: '#2f5fb8', shirt: '#f4f1ea', pants: '#2b3a67', ring: '#ff7a2f', ringS: '#d65a17',
  // Ondina
  wave: '#1f8fb0', waveS: '#14708c', waveL: '#5cc8e0', foam: '#f2fbff',
  // navio
  hull: '#1d2a44', hullS: '#121c30', antifoul: '#c8402f', deck: '#8e99a5', box: ['#e8392b', '#3f6fd1', '#f2c230', '#3fa66b', '#ff8a2a', '#8e5bd6', '#e0e0d8', '#2bb3b3'],
  steel: '#8e99a5', steelS: '#66717e', water: '#2a9fd6', ballast: '#3fb6e6',
  glow: '#8b5cff', glowL: '#e1d4ff',
};

// —— rosto (gramática do estilo) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.dSkin, closed = false, lw = 6, jitter = 0 } = {}) {
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
export function hand(x, y, ang, r = 20, col = PAL.dSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// xícara de chá com pires (o chá fica sempre nivelado: tilt = inclinação do navio, o líquido compensa)
export function teacup(x, y, a = 0, tilt = 0) {
  push(); translate(x, y); rotate(a);
  shape(ell(0, 18, 46, 10, 20), { fill: '#f4f1ea', lw: 5 });
  shape(spline([[-32, -20], [32, -20], [24, 14], [-24, 14]]), { fill: '#f4f1ea', lw: 6, shade: () => fillOnly(rect(8, -24, 30, 40), '#d8d2c4', { boil: .3 }) });
  shape(spline([[30, -12], [48, -10], [46, 6], [26, 6]], false), { fill: null, lw: 5 });
  push(); translate(0, -20); rotate(-a - tilt); shape(ell(0, 0, 30, 6, 16), { fill: '#b5652a', lw: 4 }); pop();
  for (let k = 0; k < 2; k++) stroke(spline([[-8 + k * 16, -34], [-2 + k * 16, -50], [-10 + k * 16, -64]], false), 4, { line: 'rgba(255,255,255,.8)' });
  pop();
}

// —— 1. DALVA: comandante impassível, quepe com farolzinho ——
export function dalva(P) {
  const f = P.face ?? 1, t = P.t ?? 0;
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 34, -150], ank = [sx * 38, -24];
    shape(noodle(hip, ank, 0, 46, 40), { fill: PAL.coatS, lw: 7 });
    shape(spline([[ank[0] - 32, 0], [ank[0] - 30, ank[1] - 10], [ank[0] + 14, ank[1] - 12], [ank[0] + 48, -8], [ank[0] + 46, 2]]), { fill: '#1a1a22', lw: 7 });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-80, -380], shF = [78, -380];
  const armB = P.armL || { h: [-20, 170], bend: -14 }, armF = P.armR || { h: [70, 110], bend: 40 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 48, 40), { fill: PAL.coat, lw: 7, shade: () => fillOnly(rect(-400, sh[1] + arm.h[1] * .82, 800, 14), PAL.brass, { boil: .3 }) });
    const ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    if (hold === 'tea') { hand(hp[0], hp[1], ang, 19, PAL.dSkin, { fist: true }); teacup(hp[0] + 30, hp[1] - 24, -(P.lean ?? 0), P.tilt ?? 0); return; }
    if (hold === 'scope') { hand(hp[0], hp[1], ang, 19, PAL.dSkin, { fist: true }); lunetaX(hp[0] + 6, hp[1] - 6, .55, { glow: P.glow ?? 0, a: P.scopeA ?? -.25, t }); return; }
    hand(hp[0], hp[1], ang, 19, PAL.dSkin, { fist: !!hold });
  };
  drawArm(shB, armB, P.holdL);
  // casaco trespassado, largo
  const body = spline([[-50, -418], [-96, -390], [-108, -260], [-104, -150], [0, -136], [104, -150], [108, -260], [96, -390], [50, -418]]);
  shape(body, {
    fill: PAL.coat, lw: 7, shade: () => {
      fillOnly(spline([[30, -430], [120, -400], [124, -130], [50, -130], [70, -280]]), PAL.coatS, { boil: .4 });
      fillOnly([[-30, -420], [30, -420], [0, -340]], PAL.white, { boil: .4 });
    }
  });
  stroke([[-30, -418], [0, -340], [30, -418]], 5);
  for (const yy of [-320, -270, -220]) for (const xx of [-34, 34]) shape(ell(xx, yy, 9, 9, 10), { fill: PAL.brass, lw: 4 });
  shape(rr(40, -390, 50, 20, 4), { fill: PAL.brass, lw: 4 });          // insígnia
  for (let k = 0; k < 3; k++) stroke([[46, -384 + k * 6], [84, -384 + k * 6]], 2, { line: PAL.coatS });
  push(); translate(4, -500); rotate(P.headTilt ?? 0); headDalva(P, t); pop();
  drawArm(shF, armF, P.holdR);
  pop(); pop();
}
function headDalva(P, t) {
  shape(noodle([0, 64], [0, 92], 0, 40, 44), { fill: PAL.dSkin, lw: 6 });
  // cabelo grisalho cacheado nas laterais
  for (const [cx, cy] of [[-66, -6], [-70, 24], [-56, 50], [60, 0], [64, 30]]) shape(ell(cx, cy, 20, 20, 14), { fill: PAL.hairD, lw: 5 });
  const HD = spline([[0, -70], [50, -62], [70, -20], [70, 30], [52, 66], [0, 80], [-48, 66], [-68, 26], [-66, -24], [-46, -62]]);
  shape(HD, { fill: PAL.dSkin, lw: 7, shade: () => fillOnly(spline([[30, -80], [90, -40], [90, 80], [20, 90], [50, 20]]), PAL.dSkinS, { boil: .3 }) });
  const lid = P.blink ? 1 : clamp(P.lid ?? .55, 0, 1), look = P.look || [.3, 0];
  eye(-22, -2, 24, 26, { lid, look, pupil: 4.2, skin: PAL.dSkin });
  eye(26, -2, 24, 26, { lid, look, pupil: 4.2, skin: PAL.dSkin });
  for (const ex of [-22, 26]) stroke(arc(ex, 28, 18, 6, Math.PI * .15, Math.PI * .85, 10), 4);
  const br = P.brow ?? 0;
  stroke([[-46, -36 - br * 6], [-4, -38 - br * 6]], 8); stroke([[6, -38 - br * 6], [50, -36 - br * 6]], 8);
  shape(spline([[0, 0], [10, 26], [0, 36], [-12, 30]]), { fill: PAL.dSkin, lw: 6, shade: () => fillOnly(ell(2, 32, 9, 5, 8), PAL.dSkinS, { boil: .3 }) });
  const m = P.mouth || {};
  mouth(4, 56, 44, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.1, skew: m.skew ?? .1, lw: 6 });
  // quepe branco com aba preta + farolzinho
  shape(spline([[-82, -58], [-60, -112], [60, -116], [86, -62], [0, -50]]), { fill: PAL.cap, lw: 7, shade: () => fillOnly(rect(20, -130, 80, 90), PAL.capS, { boil: .3 }) });
  shape(spline([[-80, -62], [80, -62], [96, -46], [-2, -38], [-86, -46]]), { fill: '#1a1a22', lw: 6 });
  shape(rr(-30, -84, 60, 18, 6), { fill: PAL.brass, lw: 4 });
  // farol (listrado) no topo do quepe
  push(); translate(4, -112);
  shape([[-16, 0], [16, 0], [10, -60], [-10, -60]], { fill: '#f4f1ea', lw: 5, shade: () => { fillOnly(rect(-30, -22, 60, 12), '#e8392b', { boil: .2 }); fillOnly(rect(-30, -46, 60, 12), '#e8392b', { boil: .2 }); } });
  const on = Math.floor(t * 2) % 2 === 0;
  shape(rr(-12, -78, 24, 18, 4), { fill: on ? '#fff1a8' : '#c9b25a', lw: 4 });
  shape([[-14, -78], [14, -78], [0, -92]], { fill: '#e8392b', lw: 4 });
  if (on) { stroke([[14, -70], [44, -78]], 4, { line: '#fff1a8' }); stroke([[-14, -70], [-44, -78]], 4, { line: '#fff1a8' }); }
  pop();
}

// —— 2. TICO: marinheiro novato, enjoado, boia na cintura ——
export function tico(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0, t = P.t ?? 0;
  const jit = ner ? (hash(Math.floor(t * 12) * 3.3) - .5) * 8 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 22, -210], ank = [sx * 26, -22];
    shape(noodle(hip, ank, sx * -6, 30, 26), { fill: PAL.pants, lw: 6 });
    shape(spline([[ank[0] - 24, 0], [ank[0] - 22, ank[1] - 6], [ank[0] + 12, ank[1] - 8], [ank[0] + 42, -6], [ank[0] + 40, 2]]), { fill: '#f4f1ea', lw: 6 });
  }
  const shB = [-46, -400], shF = [46, -400];
  const armB = P.armL || { h: [-20, 140], bend: -16 }, armF = P.armR || { h: [20, 140], bend: 16 };
  const drawArm = (sh, arm) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 24, 20), { fill: PAL.tSkin, lw: 6 });
    shape(noodle(sh, [sh[0] + arm.h[0] * .3, sh[1] + arm.h[1] * .3], 0, 32, 30), { fill: PAL.shirt, lw: 6, shade: () => fillOnly(rect(-300, sh[1] + 10, 600, 10), PAL.stripe, { boil: .3 }) });
    hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), 15, PAL.tSkin, { fist: arm.fist });
  };
  drawArm(shB, armB);
  // camisa listrada, magrinho
  const body = spline([[0, -424], [48, -404], [56, -300], [50, -200], [0, -192], [-50, -200], [-56, -300], [-48, -404]]);
  shape(body, { fill: PAL.shirt, lw: 7, shade: () => { for (let k = 0; k < 8; k++) fillOnly(rect(-80, -404 + k * 26, 160, 11), PAL.stripe, { boil: .3 }); } });
  shape([[-34, -424], [34, -424], [0, -380]], { fill: '#2f5fb8', lw: 5 });                       // gola marinheiro
  shape([[-8, -386], [8, -386], [14, -350], [0, -342], [-14, -350]], { fill: '#e8392b', lw: 4 });   // lencinho
  // boia salva-vidas na cintura
  const by = -224;
  shape(ell(0, by, 96, 40, 40), { fill: PAL.ring, lw: 7, shade: () => { fillOnly(ell(20, by + 14, 90, 30, 30), PAL.ringS, { boil: .3 }); for (const a of [-1.1, 0, 1.1]) fillOnly(rect(Math.sin(a) * 80 - 9, by - 50, 18, 100), '#f4f1ea', { boil: .3 }); } });
  stroke(arc(0, by, 54, 18, Math.PI * 1.05, Math.PI * 1.95, 16), 5);
  push(); translate(0, -500); rotate(P.headTilt ?? 0); headTico(P, ner, t); pop();
  drawArm(shF, armF);
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-72, -560 + u * 40, 1); sweat(76, -540 + ((u + .5) % 1) * 40, .8); }
  pop();
}
function headTico(P, ner, t) {
  shape(noodle([0, 50], [0, 92], 0, 26, 30), { fill: PAL.tSkin, lw: 6 });
  for (const sx of [-1, 1]) shape(ell(sx * 58, 6, 14, 22, 14), { fill: PAL.tSkin, lw: 6 });
  shape(spline([[0, -78], [44, -66], [60, -10], [52, 50], [20, 76], [-20, 76], [-52, 50], [-60, -10], [-44, -66]]), { fill: PAL.tSkin, lw: 7, shade: () => fillOnly(ell(36, 20, 40, 70, 20), PAL.tSkinS, { boil: .3 }) });
  // bochechas enjoadas (bolhas verdes)
  for (const sx of [-1, 1]) fillOnly(ell(sx * 34, 34, 12, 8, 10), '#86b04e', { boil: .3 });
  const br = P.brow ?? 1;
  stroke([[-46, -28 + br * 2], [-12, -38 - br * 8]], 6); stroke([[46, -28 + br * 2], [12, -38 - br * 8]], 6);
  const look = P.look || [0, 0], shake = ner ? (hash(Math.floor(t * 24) * 1.7) - .5) * 3 * ner : 0, es = P.eyeS ?? 1;
  for (const ex of [-22, 22]) eye(ex, 0, 20 * es, 26 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 3.2, skin: PAL.tSkin, jitter: shake, lw: 5 });
  shape(spline([[0, 8], [8, 28], [0, 34], [-8, 28]]), { fill: PAL.tSkinS, lw: 5 });
  const m = P.mouth || {};
  mouth(0, 52, 34, { o: m.o ?? .15, w: m.w ?? 1, sm: m.sm ?? -.7, skew: m.skew ?? .3, lw: 5 });
  // gorro de marinheiro (branco)
  shape([...arc(0, -62, 52, 30, Math.PI, TAU, 18), [52, -58], [-52, -58]], { fill: '#f4f1ea', lw: 6 });
  shape(rr(-60, -66, 120, 18, 8), { fill: '#e6e2d8', lw: 5 });
}

// —— 3. ONDINA: a onda criatura ——
export function ondina(P) {
  const t = P.t ?? 0, s = P.s ?? 1, curl = P.curl ?? .5;
  push(); translate(P.x, P.y); scale(s * (P.face ?? 1), s * (P.sq ?? 1));
  const w = Math.sin(t * 3) * 8;
  const body = spline([[-200, 0], [-180, -120], [-120, -250 + w], [-20, -330 + w], [90, -320], [150, -250], [130 - curl * 40, -200], [80, -210], [60, -150], [120, -80], [200, 0]]);
  shape(body, {
    fill: PAL.wave, lw: 7, shade: () => {
      fillOnly(spline([[-220, 10], [-160, -110], [-60, -180], [40, -120], [140, -60], [220, 10]]), PAL.waveS, { boil: .3 });
      fillOnly(spline([[-120, -230], [-40, -300], [40, -300], [-10, -260], [-80, -200]]), PAL.waveL, { boil: .3 });
    }
  });
  // cabelo de espuma
  for (let k = 0; k < 7; k++) { const a = -2.6 + k * .32, r = 40 + (k % 2) * 10; shape(ell(-20 + Math.cos(a) * 130, -320 + Math.sin(a) * 30 + w, r * .55, r * .45, 14), { fill: PAL.foam, lw: 5 }); }
  for (let k = 0; k < 4; k++) dot(140 + k * 14, -246 + k * 10, 6, PAL.foam);
  // rosto
  const look = P.look || [.6, .2];
  eye(-60, -190, 26, 32, { look, pupil: 4.5, skin: PAL.wave, lw: 6, lid: P.lid ?? 0 });
  eye(-2, -194, 26, 32, { look, pupil: 4.5, skin: PAL.wave, lw: 6, lid: P.lid ?? 0 });
  stroke([[-90, -236], [-40, -226]], 7); stroke([[-20, -228], [26, -240]], 7);   // sobrancelhas marotas
  const m = P.mouth || {};
  mouth(-30, -120, 70, { o: m.o ?? .35, sm: m.sm ?? .9, skew: m.skew ?? .2, lw: 6 });
  // mãozinhas de espuma
  if (P.arms !== false) {
    shape(noodle([-150, -90], [-230, -150 + Math.sin(t * 5) * 10], -20, 34, 26), { fill: PAL.wave, lw: 6 });
    shape(ell(-236, -154 + Math.sin(t * 5) * 10, 22, 18, 14), { fill: PAL.foam, lw: 5 });
  }
  pop();
}

// —— 4. LUNETA-X: abre a janela de raio-X (único brilho do filme) ——
export function lunetaX(x, y, s = 1, { glow = 1, a = 0, t = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (glow > 0) { fillOnly(ell(230, 0, 80 * glow, 80 * glow, 30), 'rgba(139,92,255,.22)', { boil: .5 }); fillOnly(ell(230, 0, 50 * glow, 50 * glow, 24), 'rgba(139,92,255,.35)', { boil: .5 }); }
  shape([[-40, -26], [70, -32], [70, 32], [-40, 26]], { fill: PAL.brass, lw: 7, shade: () => fillOnly(rect(-50, 8, 130, 30), PAL.brassS, { boil: .3 }) });
  shape([[70, -38], [170, -46], [170, 46], [70, 38]], { fill: '#2b2a33', lw: 7 });
  shape(rr(170, -56, 40, 112, 12), { fill: PAL.brass, lw: 7 });
  shape(ell(210, 0, 14, 46, 20), { fill: glow > 0 ? PAL.glow : '#4a3a7a', lw: 6, shade: () => fillOnly(ell(206, -14, 5, 16, 10), PAL.glowL, { boil: .2 }) });
  shape(rr(90, -70, 50, 26, 6), { fill: '#13261b', lw: 5 }); text('RAIO-X', 115, -57, { font: '18px "VT323"', fill: '#c9b5ff' });
  for (const xx of [-20, 30]) stroke([[xx, -28], [xx, 28]], 4, { line: PAL.brassS });
  pop();
}
export function xWindow(x, y, r, { open = 1, t = 0 } = {}) {
  if (open <= 0) return;
  push(); translate(x, y); scale(open);
  const rim = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; const k = 1 + .06 * Math.sin(a * 5 + t * 3) + .03 * Math.sin(a * 11 - t * 5); rim.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); }
  shape(spline(rim), { fill: PAL.glow, lw: 8 });
  for (let k = 0; k < 4; k++) { push(); rotate(t * 2 + k * TAU / 4); stroke(spline([[0, 0], [r * .3, -r * .2], [r * .6, -r * .1], [r * .78, r * .14]], false), 6, { line: PAL.glowL }); pop(); }
  fillOnly(ell(0, 0, r * .3, r * .3, 24), PAL.glowL, { boil: .4 });
  for (let k = 0; k < 6; k++) { const a = t * 1.6 + k * TAU / 6; dot(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18, 5, PAL.glow); }
  pop();
}

// —— 5. O NAVIO (vista lateral): proa com bulbo, ponte com janelão, pilhas em arco, chaminé listrada ——
// origem na linha d'água, no meio do navio; L = comprimento em px. roll = inclinação; lost = fração de caixas que caíram do topo
export function ship(x, y, L = 900, { roll = 0, t = 0, lost = 0, speed = 0, name = 'CURIOSO' } = {}) {
  push(); translate(x, y); rotate(roll); scale(L / 1000);
  // pilhas de contêineres em arco (mais altas no meio)
  const CW = 40, CH = 23, x0 = -440, NB = 19;
  for (let i = 0; i < NB; i++) {
    const xc = x0 + i * (CW + 6) + (i >= 14 ? 40 : 0);
    if (i === 14 || xc > 440) continue;
    const n = 3 + Math.round(5 * Math.sin(Math.PI * (i + .6) / NB)) + (hash(i * 1.3) > .6 ? 1 : 0);
    let top = 0;
    for (let r = 0; r < n; r++) {
      if (lost && r >= n - 2 && hash(i * 3 + r) < lost) continue;
      const yy = -118 - (r + 1) * CH, col = PAL.box[Math.floor(hash(i * 13 + r * 7) * PAL.box.length)];
      shape(rect(xc, yy, CW, CH - 1), { fill: col, lw: 3.5, shade: () => { for (const k of [.33, .66]) fillOnly(rect(xc + CW * k - 1, yy, 2.5, CH), 'rgba(0,0,0,.18)', { boil: 0 }); } });
      top = r + 1;
    }
  }
  // chaminé (popa)
  shape(spline([[-468, -118], [-470, -300], [-410, -306], [-404, -118]]), { fill: '#e8392b', lw: 7, shade: () => { fillOnly(rect(-480, -262, 90, 22), '#f2c230', { boil: .2 }); fillOnly(rect(-480, -320, 90, 22), '#1a1a22', { boil: .2 }); } });
  for (let k = 0; k < 3; k++) { const ph = (t * .6 + k / 3) % 1; fillOnly(ell(-440 - ph * 60, -320 - ph * 80, 14 + ph * 26, 10 + ph * 18, 14), `rgba(220,220,230,${.5 * (1 - ph)})`, { boil: .4 }); }
  // ponte de comando (torre + casa do leme com janelão e asas)
  shape(rect(212, -118 - 250, 70, 250), { fill: '#f4f1ea', lw: 6, shade: () => fillOnly(rect(256, -380, 40, 270), '#d8d2c4', { boil: .3 }) });
  for (let k = 0; k < 7; k++) shape(rr(222, -350 + k * 32, 50, 12, 4), { fill: '#9fc7dc', lw: 3 });
  shape(spline([[170, -404], [326, -404], [334, -366], [162, -366]]), { fill: '#f4f1ea', lw: 6 });
  shape(rr(176, -398, 146, 22, 6), { fill: '#7fd0e6', lw: 4, shade: () => { for (let k = 1; k < 6; k++) fillOnly(rect(176 + k * 24, -400, 3, 26), '#4a8fb0', { boil: 0 }); } });
  stroke([[247, -404], [247, -470]], 5);
  push(); translate(247, -470); rotate(Math.sin(t * 2.5) * .9); shape(rr(-30, -6, 60, 12, 5), { fill: '#d8dde2', lw: 4 }); pop();
  dot(247, -478, 7, Math.floor(t * 2) % 2 ? '#ff5a4a' : '#7a2a24');
  // casco: proa curva com bulbo, popa arredondada
  const HULL = spline([[-510, -128], [0, -118], [470, -136], [548, -160], [522, -70], [486, -8], [516, 22], [494, 54], [430, 64], [-440, 64], [-498, 24], [-510, -60]]);
  shape(HULL, {
    fill: PAL.hull, lw: 8, shade: () => {
      fillOnly(rect(-700, 0, 1400, 120), PAL.antifoul, { boil: .2 });
      fillOnly(rect(-700, -14, 1400, 14), '#f4f1ea', { boil: .2 });
      fillOnly(spline([[-700, -140], [0, -128], [700, -150], [700, -112], [0, -100], [-700, -112]]), PAL.hullS, { boil: .2 });
    }
  });
  stroke(spline([[-505, -124], [0, -114], [470, -132], [546, -156]], false), 5, { line: '#f4f1ea' });   // amurada
  for (let k = 0; k < 7; k++) shape(ell(-300 + k * 90, -60, 7, 7, 10), { fill: '#7fd0e6', lw: 3 });   // vigias
  // âncora + nome
  push(); translate(470, -96); shape(ell(0, 0, 9, 9, 10), { fill: '#f4f1ea', lw: 4 }); stroke([[0, 6], [0, 32]], 4, { line: '#f4f1ea' }); stroke(arc(0, 20, 16, 14, .2, Math.PI - .2, 8), 4, { line: '#f4f1ea' }); pop();
  if (name) text(name, 330, -64, { font: '800 40px "Baloo 2"', fill: '#f4f1ea' });
  // espuma na proa
  if (speed > 0) for (let k = 0; k < 6; k++) { const ph = (t * 2 + k / 6) % 1; shape(ell(520 - ph * 160, 8 - Math.sin(ph * Math.PI) * 14, 16 * (1 - ph) + 6, 8 * (1 - ph) + 4, 10), { fill: '#f2fbff', lw: 3, alpha: speed * (1 - ph * .6) }); }
  pop();
}
// corte transversal do casco (vista de frente): mostra G, B, linha d'água, lastro e aletas
export function hullSection(x, y, R = 300, { roll = 0, t = 0, showGB = 1, ballast = 1, keels = 1, wide = 1 } = {}) {
  push(); translate(x, y); rotate(roll);
  const W2 = R * wide, H2 = R * .9;
  const hullP = [[-W2, -H2 * .2], [W2, -H2 * .2], [W2, H2 * .55], ...arc(W2 - R * .25, H2 * .55, R * .25, R * .25, 0, Math.PI / 2, 8), [-W2 + R * .25, H2 * .8], ...arc(-W2 + R * .25, H2 * .55, R * .25, R * .25, Math.PI / 2, Math.PI, 8)];
  shape(hullP, { fill: PAL.hull, lw: 8, shade: () => fillOnly(rect(-W2 - 40, 0, 2 * W2 + 80, H2), PAL.antifoul, { boil: .3 }) });
  const inn = hullP.map(([px, py]) => [px * .9, py < 0 ? py : py * .86]);
  shape(inn, { fill: '#cfd6de', lw: 5 });
  // porão com contêineres + pilhas no convés
  const cw = R * .22, ch = R * .16;
  for (let c = -3; c < 3; c++) for (let r = 0; r < 3; r++) fillOnly(rect(c * cw + 2, H2 * .45 - (r + 1) * ch, cw - 4, ch - 4), PAL.box[(c + 3 + r * 2) % 8], { boil: .2 });
  for (let c = -4; c < 4; c++) for (let r = 0; r < 5; r++) shape(rect(c * cw + 2, -H2 * .2 - (r + 1) * ch, cw - 4, ch - 3), { fill: PAL.box[(c + 4 + r * 3) % 8], lw: 4 });
  // tanques de lastro no fundo
  if (ballast > 0) { shape(rect(-W2 + 20, H2 * .5, 2 * W2 - 40, H2 * .26), { fill: '#24324e', lw: 5 }); fillOnly(rect(-W2 + 24, H2 * .5 + H2 * .26 * (1 - ballast), 2 * W2 - 48, H2 * .26 * ballast), PAL.ballast, { boil: .4 }); }
  // aletas (quilhas de bolina) na curva do fundo
  if (keels > 0) for (const sx of [-1, 1]) { push(); translate(sx * (W2 - R * .08), H2 * .74); rotate(sx * .78); shape(rect(-8, 0, 16, R * .2 * keels), { fill: PAL.steel, lw: 5 }); pop(); }
  pop();
}

// —— 6. JOÃO-BOBO (boneco inflável que sempre volta) ——
export function joaoBobo(x, y, s = 1, { a = 0 } = {}) {
  push(); translate(x, y); scale(s); rotate(a);
  shape(spline([[0, -260], [60, -220], [80, -120], [110, -40], [90, 0], [0, 16], [-90, 0], [-110, -40], [-80, -120], [-60, -220]]), { fill: '#e8392b', lw: 7, shade: () => fillOnly(ell(0, -10, 120, 50, 30), '#b92c20', { boil: .3 }) });
  shape(ell(0, -200, 50, 50, 24), { fill: '#f4f1ea', lw: 6 });
  eye(-16, -206, 10, 12, { skin: '#f4f1ea', pupil: 3, lw: 4 }); eye(16, -206, 10, 12, { skin: '#f4f1ea', pupil: 3, lw: 4 });
  shape(ell(0, -188, 9, 8, 10), { fill: '#e8392b', lw: 4 });
  mouth(0, -172, 30, { o: .25, sm: 1, lw: 4, teeth: false });
  for (const yy of [-120, -80]) shape(ell(0, yy, 10, 10, 10), { fill: '#f2c230', lw: 4 });
  pop();
}

// —— 7. TRAVA GIRATÓRIA (twistlock) + BARRA DE AMARRAÇÃO ——
export function twistlock(x, y, s = 1, { turn = 1 } = {}) {
  push(); translate(x, y); scale(s);
  // contêiner de cima e de baixo (cantoneiras)
  shape(rect(-160, -150, 260, 130), { fill: PAL.box[1], lw: 7 }); shape(rect(-160, 20, 260, 130), { fill: PAL.box[0], lw: 7 });
  for (const yy of [-50, 20]) shape(rect(40, yy, 60, 30), { fill: '#5a5f66', lw: 5 });   // peças de canto
  // trava (cones + corpo + alavanca)
  shape(rect(46, -20, 48, 40), { fill: PAL.steel, lw: 5 });
  push(); translate(70, -20); rotate((1 - turn) * .0); shape([[-16, 0], [16, 0], [8, -26], [-8, -26]], { fill: PAL.steelS, lw: 4 }); pop();
  push(); translate(70, 20); shape([[-16, 0], [16, 0], [8, 26], [-8, 26]], { fill: PAL.steelS, lw: 4 }); pop();
  push(); translate(94, 0); rotate(lerp(0, -1.2, turn)); shape(rr(0, -6, 60, 12, 6), { fill: '#e8392b', lw: 4 }); pop();
  pop();
}
export function lashingBar(x0, y0, x1, y1, { tight = 1 } = {}) {
  stroke([[x0, y0], [x1, y1]], 10);
  stroke([[x0, y0], [x1, y1]], 5, { line: PAL.steel });
  const mx = lerp(x0, x1, .7), my = lerp(y0, y1, .7);
  push(); translate(mx, my); rotate(Math.atan2(y1 - y0, x1 - x0)); shape(rr(-30, -12, 60, 24, 8), { fill: '#f2c230', lw: 5 }); pop();   // esticador
}
