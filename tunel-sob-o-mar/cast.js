// cast.js — elenco original de "Nem uma gota?": Neide, Bolota, Pingo + equipamentos reais
// Coordenadas locais: origem nos pés, y para baixo.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, S } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // Neide
  nSkin: '#8a5a3c', nSkinS: '#6d4329', nSuit: '#e3a72f', nSuitS: '#b8821a', refl: '#dfe6ea', boot: '#3d2f2a', hair: '#cfd2d6',
  bowl: 'rgba(196,236,250,.30)', bowlW: 'rgba(92,190,226,.55)', bowlRim: '#7d8a94', fish: '#ff7a2f', mug: '#eae4d6', mugS: '#c9c0ac',
  // Bolota
  bSkin: '#f6c7a6', bSkinS: '#dca07c', bAll: '#3f6fd1', bAllS: '#2c51a3', bShirt: '#f2efe6', hat: '#f4f4ec', hatS: '#c9c9bd', floatie: '#ff8a2a', floatieS: '#d4651a', cheek: '#f28c8c', sock: '#e94f4f',
  // Pingo
  drop: '#62d2f2', dropS: '#2f9fcb', dropL: '#c8f2ff',
  // máquina
  steel: '#8e99a5', steelS: '#66717e', dark: '#4a525d', yellow: '#f2c230', yellowS: '#c99a17', disc: '#c9ced4',
  slurry: '#b49a72', slurryS: '#8f7651', concrete: '#b8b4ac', concreteS: '#97928a', gasket: '#26222b', grease: '#4b3a78',
  glow: '#ff3fa4', glowL: '#ffc2e4',
};

// —— peças de rosto (da gramática do estilo) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.nSkin, closed = false, lw = 6, jitter = 0, lower = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
      if (lower > 0) { const yb = cy + ry - lower * 2 * ry; fillOnly([[cx - rx * 1.3, yb], [cx + rx * 1.3, yb], [cx + rx * 1.3, cy + ry * 1.4], [cx - rx * 1.3, cy + ry * 1.4]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yb], [cx + rx * 1.2, yb]], lw * .8); }
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
export function hand(x, y, ang, r = 20, col = PAL.nSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

export function mug(x, y, a = 0) {
  push(); translate(x, y); rotate(a);
  shape(spline([[28, -20], [52, -18], [54, 8], [28, 14]], false).concat([[28, 6], [44, 4], [44, -10], [28, -10]]), { fill: PAL.mug, lw: 6 });
  shape(rr(-30, -34, 60, 66, 9), { fill: PAL.mug, lw: 6, shade: () => fillOnly(rect(10, -36, 30, 80), PAL.mugS, { boil: .3 }) });
  text('Nº1', 0, 2, { font: '800 18px "Baloo 2"', fill: '#8a6a3a' });
  shape(ell(0, -34, 30, 7, 20), { fill: '#5b3826', lw: 5 });
  pop();
}

// —— 1. NEIDE: engenheira-chefe, impassível, capacete-aquário com peixe ——
// P: {x,y,s,face,lid,look,brow,mouth,blink,armR,armL,holdR:'mug'|null,headTilt,fishT,lean}
export function neide(P) {
  const f = P.face ?? 1, t = P.t ?? 0;
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  // pernas + botas
  for (const sx of [-1, 1]) {
    const hip = [sx * 28, -200], ank = [sx * 34, -26];
    shape(noodle(hip, ank, sx * -4, 46, 42), { fill: PAL.nSuit, lw: 7, shade: () => { fillOnly(rect(sx > 0 ? 10 : -200, -260, 190, 260), PAL.nSuitS, { boil: .3 }); fillOnly(rect(-200, -92, 400, 16), PAL.refl, { boil: .3 }); } });
    shape(spline([[ank[0] - 30, 0], [ank[0] - 30, ank[1] - 12], [ank[0] + 16, ank[1] - 14], [ank[0] + 50, -8], [ank[0] + 48, 2]]), { fill: PAL.boot, lw: 7 });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-62, -400], shF = [60, -400];
  const armB = P.armL || { h: [-14, 175], bend: -14 }, armF = P.armR || { h: [70, 120], bend: 40 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 40, 34), { fill: PAL.nSuit, lw: 7, shade: () => fillOnly(rect(-300, sh[1] + 70, 600, 14), PAL.refl, { boil: .3 }) });
    const ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    if (hold === 'mug') { hand(hp[0], hp[1], ang, 19, PAL.nSkin, { fist: true }); mug(hp[0] + 34, hp[1] - 8, -(P.lean ?? 0)); return; }
    if (hold === 'scope') { hand(hp[0], hp[1], ang, 19, PAL.nSkin, { fist: true }); scope(hp[0] + 10, hp[1] - 10, .55, { glow: P.glow ?? 0, a: P.scopeA ?? -.1, t }); return; }
    hand(hp[0], hp[1], ang, 19, PAL.nSkin, { fist: !!hold });
  };
  drawArm(shB, armB, P.holdL);
  // tronco do macacão
  const body = spline([[-40, -436], [-78, -410], [-84, -300], [-80, -196], [0, -184], [80, -196], [84, -300], [78, -410], [40, -436]]);
  shape(body, {
    fill: PAL.nSuit, lw: 7, shade: () => {
      fillOnly(spline([[30, -450], [100, -420], [104, -180], [40, -180], [56, -300]]), PAL.nSuitS, { boil: .4 });
      fillOnly(rect(-120, -300, 240, 18), PAL.refl, { boil: .3 });
      fillOnly(rect(-120, -250, 240, 18), PAL.refl, { boil: .3 });
    }
  });
  stroke([[0, -430], [0, -196]], 5);                       // zíper
  shape(rr(-66, -390, 40, 34, 4), { fill: PAL.nSuitS, lw: 5 });    // bolso
  shape(rr(-60, -404, 8, 26, 3), { fill: '#e8392b', lw: 4 });     // caneta
  shape(rr(24, -396, 44, 22, 4), { fill: '#ffffff', lw: 4 });      // crachá
  text('NEIDE', 46, -385, { font: '800 13px "Baloo 2"', fill: INK });
  // cabeça
  push(); translate(4, -520); rotate(P.headTilt ?? 0);
  headNeide(P, t);
  pop();
  drawArm(shF, armF, P.holdR);
  pop();
  pop();
}
function headNeide(P, t) {
  push(); scale(1.28);
  // pescoço
  shape(noodle([0, 70], [0, 100], 0, 38, 40), { fill: PAL.nSkin, lw: 6 });
  shape(ell(-64, 6, 14, 22, 16), { fill: PAL.nSkin, lw: 6 });
  // cabelo grisalho curto + coque
  shape(ell(-30, -64, 34, 26, 20), { fill: PAL.hair, lw: 6 });
  const HD = spline([[-6, -78], [46, -70], [70, -34], [72, 18], [58, 62], [10, 80], [-36, 70], [-62, 30], [-66, -24], [-48, -64]]);
  shape(HD, {
    fill: PAL.nSkin, lw: 7, shade: () => {
      fillOnly(spline([[-90, -20], [-56, -90], [-100, -100]]), PAL.nSkinS, { boil: .3 });
      fillOnly(spline([[-80, -46], [-20, -96], [60, -88], [80, -50], [20, -60], [-40, -40]]), PAL.hair, { boil: .3 });
    }
  });
  const lid = P.blink ? 1 : clamp(P.lid ?? .52, 0, 1), look = P.look || [.3, 0];
  eye(6, -6, 24, 27, { lid, look, pupil: 4.2, skin: PAL.nSkin });
  eye(46, -8, 19, 23, { lid, look, pupil: 3.8, skin: PAL.nSkin });
  for (const [ex, rx] of [[6, 20], [46, 15]]) stroke(arc(ex, 24, rx, 7, Math.PI * .15, Math.PI * .85, 10), 4);   // olheiras
  const br = P.brow ?? 0;
  stroke([[-18, -42 - br * 6], [24, -44 - br * 8]], 7); stroke([[34, -44 - br * 8], [64, -40 - br * 6]], 7);  // sobrancelhas retas
  shape(spline([[28, -6], [36, 18], [52, 30], [44, 42], [26, 38]]), { fill: PAL.nSkin, lw: 6, shade: () => fillOnly(ell(46, 36, 10, 6, 10), PAL.nSkinS, { boil: .3 }) });
  const m = P.mouth || {};
  mouth(28, 56, 46, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.15, skew: m.skew ?? .15, lw: 6 });
  // brincos de parafuso
  shape(rr(-70, 26, 12, 12, 2), { fill: PAL.steel, lw: 4 });
  pop();
  // capacete-aquário: água no fundo, peixe nadando
  const R = 122, cx = 8, cy = 0;
  fillOnly(ell(cx, cy, R, R, 60), PAL.bowl, { boil: .6 });
  fillOnly([...arc(cx, cy, R, R, Math.PI * .2, Math.PI * .8, 30), [cx - R * .97, cy + 72], [cx + R * .97, cy + 72]], PAL.bowlW, { boil: .6 });
  stroke(spline([[cx - R * .97, cy + 72], [cx - 40, cy + 66], [cx, cy + 74], [cx + 40, cy + 66], [cx + R * .97, cy + 72]], false), 4, { line: '#2f8fb8' });
  const fx = cx - 10 + Math.sin(t * 1.3) * 46, fy = cy + 86, fd = Math.cos(t * 1.3) >= 0 ? 1 : -1;
  push(); translate(fx, fy); scale(fd * .6, .6);
  shape(spline([[-26, 0], [-8, -14], [14, -10], [24, 0], [14, 10], [-8, 14]]), { fill: PAL.fish, lw: 5 });
  shape([[-24, 0], [-42, -14], [-38, 0], [-42, 14]], { fill: PAL.fish, lw: 5 });
  dot(12, -3, 3);
  pop();
  for (const [bx, by, br2] of [[cx + 52, cy + 10, 5], [cx + 60, cy - 20, 7], [cx + 48, cy - 54, 4]]) shape(ell(bx, by, br2, br2, 10), { fill: 'rgba(255,255,255,.5)', lw: 3 });
  shape(ell(cx, cy, R, R, 60), { fill: null, lw: 7 });
  stroke(arc(cx - 30, cy - 30, 60, 60, Math.PI * 1.08, Math.PI * 1.42, 8), 7, { line: 'rgba(255,255,255,.85)' });
  shape(rr(cx - 62, cy + R - 20, 124, 26, 10), { fill: PAL.bowlRim, lw: 6 });   // anel de vedação no pescoço
}

// —— 2. BOLOTA: estagiário redondo, em pânico, boias de braço ——
export function bolota(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0, t = P.t ?? 0;
  const jit = ner ? (hash(Math.floor(t * 12) * 3.3) - .5) * 8 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 30, -70], ank = [sx * 34, -20];
    shape(noodle(hip, ank, 0, 34, 30), { fill: PAL.bAll, lw: 6 });
    shape(spline([[ank[0] - 28, 0], [ank[0] - 24, ank[1] - 4], [ank[0] + 14, ank[1] - 6], [ank[0] + 40, -6], [ank[0] + 36, 2]]), { fill: '#3a3a44', lw: 6 });
  }
  const shB = [-80, -176], shF = [80, -176];
  const armB = P.armL || { h: [-40, 70], bend: -10 }, armF = P.armR || { h: [40, 70], bend: 10 };
  const drawArm = (sh, arm) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 26, 22), { fill: PAL.bSkin, lw: 6 });
    hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), 15, PAL.bSkin, { fist: arm.fist });
    // boia de braço
    const bx = sh[0] + arm.h[0] * .38, by = sh[1] + arm.h[1] * .38;
    shape(ell(bx, by, 34, 26, 26), { fill: PAL.floatie, lw: 6, shade: () => { fillOnly(ell(bx + 12, by + 8, 24, 18, 18), PAL.floatieS, { boil: .3 }); fillOnly(ell(bx - 12, by - 10, 8, 5, 10), '#ffd2a8', { boil: .2 }); } });
    stroke([[bx - 20, by - 18], [bx - 14, by - 26]], 4);   // válvula
  };
  drawArm(shB, armB);
  // corpo redondo de macacão
  const body = ell(0, -140, 100, 96, 48);
  shape(body, {
    fill: PAL.bAll, lw: 7, shade: () => {
      fillOnly(ell(40, -120, 80, 90, 30), PAL.bAllS, { boil: .4 });
      fillOnly(spline([[-56, -236], [56, -236], [44, -170], [-44, -170]]), PAL.bShirt, { boil: .3 });
    }
  });
  stroke([[-50, -232], [-40, -160]], 6); stroke([[50, -232], [40, -160]], 6);       // alças
  shape(ell(-40, -160, 9, 9, 10), { fill: '#f2c230', lw: 4 }); shape(ell(40, -160, 9, 9, 10), { fill: '#f2c230', lw: 4 });
  shape(rr(-30, -140, 60, 40, 6), { fill: PAL.bAllS, lw: 5 });      // bolso
  text('ESTAGIÁRIO', 0, -120, { font: '800 11px "Baloo 2"', fill: '#ffffff' });
  // cabeça
  push(); translate(0, -300); rotate(P.headTilt ?? 0);
  headBolota(P, ner, t);
  pop();
  drawArm(shF, armF);
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-96, -380 + u * 40, 1.1); sweat(100, -350 + ((u + .5) % 1) * 40, .9); }
  pop();
}
function headBolota(P, ner, t) {
  for (const sx of [-1, 1]) shape(ell(sx * 78, 8, 14, 20, 16), { fill: PAL.bSkin, lw: 6 });
  shape(ell(0, 0, 80, 78, 56), { fill: PAL.bSkin, lw: 7, shade: () => fillOnly(ell(44, 24, 54, 64, 28), PAL.bSkinS, { boil: .3 }) });
  // capacete pequeno demais
  const hel = [...arc(0, -64, 48, 40, Math.PI, TAU, 22), [52, -60], [-52, -60]];
  shape(hel, { fill: PAL.hat, lw: 7, shade: () => fillOnly(ell(22, -84, 26, 22, 16), PAL.hatS, { boil: .3 }) });
  shape(rr(-64, -66, 128, 14, 6), { fill: PAL.hat, lw: 6 });
  stroke([[-48, -60], [-76, 10]], 3); stroke([[48, -60], [76, 10]], 3);   // jugular
  // bochechas
  fillOnly(ell(-46, 34, 14, 9, 12), PAL.cheek, { boil: .3 }); fillOnly(ell(46, 34, 14, 9, 12), PAL.cheek, { boil: .3 });
  // sobrancelhas preocupadas (pontas internas levantadas)
  const br = P.brow ?? 1;
  stroke([[-56, -24 + br * 2], [-18, -34 - br * 8]], 7); stroke([[56, -24 + br * 2], [18, -34 - br * 8]], 7);
  const look = P.look || [0, 0], shake = ner ? (hash(Math.floor(t * 24) * 1.7) - .5) * 3 * ner : 0;
  const es = P.eyeS ?? 1;
  for (const ex of [-30, 30]) eye(ex, 4, 27 * es, 30 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 3.4, skin: PAL.bSkin, jitter: shake, lw: 6 });
  shape(ell(0, 34, 10, 8, 12), { fill: PAL.bSkinS, lw: 5 });
  const m = P.mouth || {};
  mouth(0, 54, 40, { o: m.o ?? .35, w: m.w ?? 1, sm: m.sm ?? -.6, skew: m.skew || 0, lw: 5 });
}

// —— 3. PINGO: a gota d'água que quer entrar (não fala) ——
export function pingo(P) {
  const t = P.t ?? 0, sq = P.sq ?? 1;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), (P.s ?? 1) * sq);
  const wob = Math.sin(t * 7) * 3;
  const body = spline([[0, -150 + wob], [22, -110], [52, -66], [62, -28], [44, -2], [0, 6], [-44, -2], [-62, -28], [-52, -66], [-22, -110]]);
  shape(body, {
    fill: PAL.drop, lw: 7, shade: () => {
      fillOnly(spline([[20, -120], [70, -60], [70, 0], [10, 10], [40, -40]]), PAL.dropS, { boil: .4 });
      fillOnly(spline([[-30, -78], [-16, -102], [-12, -80], [-24, -60]]), PAL.dropL, { boil: .3 });
    }
  });
  const look = P.look || [.3, 0];
  eye(-18, -46, 16, 20, { lid: P.lid ?? 0, look, pupil: 3.6, skin: PAL.drop, lw: 5 });
  eye(18, -46, 16, 20, { lid: P.lid ?? 0, look, pupil: 3.6, skin: PAL.drop, lw: 5 });
  // sobrancelhas marotas
  stroke([[-32, -72], [-6, -66]], 6); stroke([[6, -66], [32, -76]], 6);
  const m = P.mouth || {};
  mouth(2, -18, 32, { o: m.o ?? .28, sm: m.sm ?? .9, skew: m.skew ?? .25, lw: 5, teeth: true });
  // gotícula pingando
  const d = (t * .8) % 1;
  shape(spline([[30, 4 + d * 30], [36, 14 + d * 30], [30, 22 + d * 30], [24, 14 + d * 30]]), { fill: PAL.drop, lw: 4, alpha: 1 - d });
  pop();
}

// —— 4. TATUZÃO: tuneladora de lama (slurry TBM), vista lateral em corte ——
export function tbm(x, y, s = 1, { rot = 0, t = 0, cut = true, ring = 6 } = {}) {
  push(); translate(x, y); scale(s);
  // casco (escudo) com recorte mostrando o interior
  const L = 820, R = 150;
  // gantry/backup atrás
  shape(rr(L - 30, -110, 300, 220, 14), { fill: PAL.steelS, lw: 7, shade: () => fillOnly(rect(L - 40, 40, 330, 80), PAL.dark, { boil: .3 }) });
  for (const wx of [L + 30, L + 220]) { shape(ell(wx, 118, 22, 22, 18), { fill: PAL.dark, lw: 6 }); }
  stroke([[L + 20, -60], [L + 250, -60]], 6); stroke([[L + 20, -10], [L + 250, -10]], 6);
  // tubos de lama (ida e volta)
  stroke([[90, -40], [L + 260, -40]], 12, { line: '#7c5a3a' }); stroke([[90, -40], [L + 260, -40]], 5, { line: PAL.slurry });
  shape(rr(40, -R, L - 40, 2 * R, 26), {
    fill: PAL.yellow, lw: 8, shade: () => {
      fillOnly(rect(0, R * .35, L + 40, R), PAL.yellowS, { boil: .4 });
      for (let k = 1; k < 4; k++) fillOnly(rect(40 + k * (L - 40) / 4 - 5, -R - 10, 10, 2 * R + 20), PAL.yellowS, { boil: .3 });
    }
  });
  if (cut) {
    // janela de corte: câmara de lama + parede de pressão + braço montador + anéis
    const cx0 = 60, cx1 = 230;
    shape(rr(cx0, -R + 24, cx1 - cx0, 2 * R - 48, 10), { fill: PAL.slurry, lw: 6, shade: () => { for (let i = 0; i < 9; i++) dot(cx0 + 20 + hash(i * 3.1) * 140, -R + 50 + hash(i * 7.7) * 200, 6, PAL.slurryS); } });
    text('LAMA', (cx0 + cx1) / 2, 0, { font: '800 30px "Baloo 2"', fill: '#5a452c' });
    shape(rect(cx1, -R + 14, 22, 2 * R - 28), { fill: PAL.steelS, lw: 6 });   // parede de pressão
    // braço montador + anéis de aduelas
    shape(rr(cx1 + 22, -R + 24, L - cx1 - 40, 2 * R - 48, 10), { fill: '#3b3f4a', lw: 6 });
    for (let k = 0; k < ring; k++) {
      const rx = 520 + k * 46;
      shape(rect(rx, -R + 30, 40, 26), { fill: PAL.concrete, lw: 5 }); shape(rect(rx, R - 56, 40, 26), { fill: PAL.concrete, lw: 5 });
      stroke([[rx + 40, -R + 30], [rx + 40, -R + 56]], 4, { line: PAL.gasket }); stroke([[rx + 40, R - 56], [rx + 40, R - 30]], 4, { line: PAL.gasket });
    }
    // erector
    shape(rr(400, -20, 70, 40, 8), { fill: PAL.steel, lw: 6 });
    shape(noodle([435, 0], [500, -90], 10, 26, 22), { fill: PAL.steel, lw: 6 });
    shape(rr(480, -110, 50, 30, 6), { fill: PAL.concrete, lw: 5 });
    // escovas da cauda
    for (let k = 0; k < 3; k++) { const bx = L - 30 - k * 16; for (const sy of [-1, 1]) { const y0 = sy * (R - 4); stroke([[bx, y0], [bx - 8, y0 - sy * 22]], 4, { line: PAL.dark }); } }
    fillOnly(rect(L - 70, -R + 4, 50, 20), PAL.grease, { boil: .3 }); fillOnly(rect(L - 70, R - 24, 50, 20), PAL.grease, { boil: .3 });
  }
  // roda de corte (perfil) com discos
  shape(rr(10, -R - 14, 50, 2 * R + 28, 14), { fill: PAL.dark, lw: 8 });
  for (let k = -3; k <= 3; k++) { const dy = k * 42; shape(ell(4, dy, 12, 16, 14), { fill: PAL.disc, lw: 5 }); }
  pop();
}
// roda de corte vista de frente (gira)
export function cutterhead(x, y, r, { rot = 0, t = 0 } = {}) {
  push(); translate(x, y); rotate(rot);
  shape(ell(0, 0, r, r, 64), { fill: PAL.yellow, lw: 8, shade: () => fillOnly(ell(r * .2, r * .25, r * .9, r * .9, 40), PAL.yellowS, { boil: .3 }) });
  // aberturas (por onde a terra entra na câmara)
  for (let k = 0; k < 6; k++) { push(); rotate(k * TAU / 6 + TAU / 12); shape(rr(r * .3, -r * .07, r * .62, r * .14, r * .06), { fill: PAL.slurryS, lw: 5 }); pop(); }
  // raios + discos de corte
  for (let k = 0; k < 6; k++) {
    push(); rotate(k * TAU / 6);
    for (let j = 1; j <= 4; j++) { const d = r * (.2 + j * .18); shape(ell(d, 0, r * .06, r * .1, 14), { fill: PAL.disc, lw: 5 }); stroke([[d - r * .04, 0], [d + r * .04, 0]], 3); }
    pop();
  }
  shape(ell(0, 0, r * .16, r * .16, 24), { fill: PAL.dark, lw: 6 });
  shape(ell(0, 0, r * .07, r * .07, 16), { fill: PAL.disc, lw: 4 });
  pop();
}

// —— 5. CORTE-SCÓPIO: o aparelho que abre a "janela de corte" (único brilho do filme) ——
export function scope(x, y, s = 1, { glow = 1, a = 0, t = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (glow > 0) {
    fillOnly(ell(176, -6, 70 * glow, 70 * glow, 30), 'rgba(255,63,164,.22)', { boil: .5 });
    fillOnly(ell(176, -6, 44 * glow, 44 * glow, 24), 'rgba(255,63,164,.35)', { boil: .5 });
  }
  shape(rr(-40, 0, 46, 110, 14), { fill: '#5b4a8a', lw: 7 });                       // cabo
  for (let k = 0; k < 3; k++) stroke([[-34, 30 + k * 22], [0, 30 + k * 22]], 4);
  shape(rr(-70, -60, 190, 80, 24), { fill: '#d8d2e8', lw: 7, shade: () => fillOnly(rect(-80, -6, 220, 40), '#aaa2c6', { boil: .3 }) });
  shape(spline([[110, -70], [160, -96], [176, -6], [160, 84], [110, 50]]), { fill: '#d8d2e8', lw: 7 });   // prato emissor
  shape(ell(158, -6, 18, 46, 24), { fill: glow > 0 ? PAL.glow : '#8e2a62', lw: 6, shade: () => fillOnly(ell(156, -12, 6, 20, 12), PAL.glowL, { boil: .2 }) });
  shape(rr(-50, -46, 56, 30, 6), { fill: '#1d1830', lw: 5 });                       // telinha
  text('CORTE', -22, -31, { font: '20px "VT323"', fill: '#ff8fd0' });
  shape(ell(40, -60, 14, 10, 12), { fill: '#e8392b', lw: 5 });                      // botão
  stroke(spline([[16, -60], [10, -96], [30, -110], [20, -130]], false), 5);          // antena torta
  dot(20, -134, 7, PAL.glow);
  pop();
}
// janela de corte brilhante (portal do estilo)
export function cutWindow(x, y, r, { open = 1, t = 0 } = {}) {
  if (open <= 0) return;
  push(); translate(x, y); scale(open);
  const rim = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; const k = 1 + .06 * Math.sin(a * 5 + t * 3) + .03 * Math.sin(a * 11 - t * 5); rim.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); }
  shape(spline(rim), { fill: PAL.glow, lw: 8 });
  for (let k = 0; k < 4; k++) { push(); rotate(t * 2 + k * TAU / 4); stroke(spline([[0, 0], [r * .3, -r * .2], [r * .6, -r * .1], [r * .78, r * .14]], false), 6, { line: PAL.glowL }); pop(); }
  fillOnly(ell(0, 0, r * .3, r * .3, 24), PAL.glowL, { boil: .4 });
  for (let k = 0; k < 6; k++) { const a = t * 1.6 + k * TAU / 6; dot(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18, 5, PAL.glow); }
  pop();
}

// —— 6. ANEL DE ADUELAS com junta de borracha (EPDM) ——
export function segRing(x, y, r, { t = 0, sq = 0 } = {}) {
  push(); translate(x, y);
  const r0 = r * .66, n = 6;
  for (let k = 0; k < n; k++) {
    const a0 = k / n * TAU + .02, a1 = (k + 1) / n * TAU - .02 - (k === n - 1 ? .25 : 0);
    const p = [...arc(0, 0, r, r, a0, a1, 14), ...arc(0, 0, r0, r0, a1, a0, 14)];
    shape(p, { fill: PAL.concrete, lw: 6, shade: () => fillOnly(ell(r * .15, r * .2, r, r, 40), PAL.concreteS, { boil: .3 }) });
    const am = (a0 + a1) / 2; dot(Math.cos(am) * (r + r0) / 2, Math.sin(am) * (r + r0) / 2, 5, '#6a665f');   // nicho do parafuso
  }
  // aduela-chave (fecha o anel)
  const ka0 = TAU - .25 - .02 + .04, ka1 = TAU - .04;
  shape([...arc(0, 0, r, r, ka0, ka1, 6), ...arc(0, 0, r0, r0, ka1, ka0, 6)], { fill: '#d6b48a', lw: 6 });
  // juntas de borracha
  for (let k = 0; k < n + 1; k++) {
    const a = k === n ? TAU - .27 : k / n * TAU;
    stroke([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r, Math.sin(a) * r]], 9, { line: PAL.gasket });
  }
  pop();
}
// detalhe da junta: duas aduelas apertando a borracha
export function gasketDetail(x, y, s = 1, { squeeze = 1 } = {}) {
  push(); translate(x, y); scale(s);
  const gap = lerp(34, 14, squeeze);
  shape(rect(-170, -60, 170 - gap / 2, 120), { fill: PAL.concrete, lw: 7, shade: () => fillOnly(rect(-170, 20, 200, 60), PAL.concreteS, { boil: .3 }) });
  shape(rect(gap / 2, -60, 170 - gap / 2, 120), { fill: PAL.concrete, lw: 7, shade: () => fillOnly(rect(0, 20, 200, 60), PAL.concreteS, { boil: .3 }) });
  const gw = gap + 10 * squeeze;
  shape(rr(-gw / 2, -36, gw, 40, 6), { fill: PAL.gasket, lw: 5 });
  for (let k = 0; k < 2; k++) dot(-gw / 4 + k * gw / 2, -16, 4, '#5a5266');
  pop();
}

// —— 7. BOMBA DE DRENAGEM no poço ——
export function pump(x, y, s = 1, { t = 0, on = 1 } = {}) {
  push(); translate(x, y); scale(s);
  // poço
  shape(rect(-120, -40, 240, 160), { fill: '#3a4250', lw: 7 });
  fillOnly(rect(-114, 30 + Math.sin(t * 3) * 3, 228, 84), PAL.drop, { boil: .5 });
  stroke(spline([[-114, 30 + Math.sin(t * 3) * 3], [0, 26 + Math.sin(t * 3 + 1) * 4], [114, 30 + Math.sin(t * 3) * 3]], false), 4, { line: PAL.dropS });
  // corpo da bomba submersível
  shape(rr(-50, -110, 100, 200, 20), { fill: '#2f7fd0', lw: 7, shade: () => fillOnly(rect(14, -120, 50, 220), '#225ea0', { boil: .3 }) });
  for (let k = 0; k < 4; k++) stroke([[-40, -70 + k * 18], [40, -70 + k * 18]], 4);   // aletas do motor
  shape(rr(-56, 70, 112, 24, 6), { fill: PAL.steel, lw: 6 });                          // grelha de sucção
  for (let k = 0; k < 6; k++) stroke([[-44 + k * 18, 72], [-44 + k * 18, 92]], 3);
  shape(rr(-30, -140, 60, 32, 10), { fill: PAL.steelS, lw: 6 });                        // alça
  // tubo de recalque subindo
  shape(noodle([40, -96], [150, -260], -40, 34, 34), { fill: '#d0d4d8', lw: 7 });
  stroke(spline([[-50, -40], [-160, -60], [-170, -150]], false), 6);                      // cabo elétrico
  if (on) for (let k = 0; k < 3; k++) { const u = (t * 1.5 + k / 3) % 1; dot(150 + u * 40, -270 - u * 30 + u * u * 60, 8 * (1 - u), PAL.drop); }
  pop();
}

// —— 8. MANÔMETRO (3 bar) ——
export function gauge(x, y, r, { val = 3, max = 6, t = 0, shake = 0 } = {}) {
  push(); translate(x, y);
  shape(ell(0, 0, r * 1.12, r * 1.12, 48), { fill: PAL.steel, lw: 7 });
  shape(ell(0, 0, r, r, 48), { fill: '#f6f1e2', lw: 6 });
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25;
  // faixa vermelha (pressão demais) e azul (de menos)
  shape([...arc(0, 0, r * .9, r * .9, lerp(a0, a1, 4.6 / max), a1, 10), ...arc(0, 0, r * .72, r * .72, a1, lerp(a0, a1, 4.6 / max), 10)], { fill: '#e8392b', lw: 4 });
  shape([...arc(0, 0, r * .9, r * .9, a0, lerp(a0, a1, 1.4 / max), 10), ...arc(0, 0, r * .72, r * .72, lerp(a0, a1, 1.4 / max), a0, 10)], { fill: '#3f6fd1', lw: 4 });
  for (let k = 0; k <= max; k++) { const a = lerp(a0, a1, k / max); stroke([[Math.cos(a) * r * .72, Math.sin(a) * r * .72], [Math.cos(a) * r * .6, Math.sin(a) * r * .6]], 5); }
  text('bar', 0, r * .55, { font: `800 ${Math.round(r * .2)}px "Baloo 2"`, fill: '#6a665f' });
  const v = val + shake * Math.sin(t * 40) * .08, a = lerp(a0, a1, v / max);
  shape(noodle([0, 0], [Math.cos(a) * r * .78, Math.sin(a) * r * .78], 0, r * .09, r * .03), { fill: '#e8392b', lw: 5 });
  for (let k = 0; k <= max; k++) { const a = lerp(a0, a1, k / max); text(String(k), Math.cos(a) * r * .45, Math.sin(a) * r * .45, { font: `800 ${Math.round(r * .2)}px "Baloo 2"`, fill: INK, outlineW: k === Math.round(val) ? 8 : 0, outlineCol: '#f6f1e2' }); }
  shape(ell(0, 0, r * .1, r * .1, 16), { fill: INK, lw: 4 });
  pop();
}
