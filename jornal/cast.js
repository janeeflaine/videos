// cast.js — elenco e cenário FIXOS da série "Jornal do Seu Chicó" (reaproveitados em todo episódio)
// Seu Chicó, Dona Zefinha, o gato magricelo, o papagaio + a sala com a cozinha ao fundo e os objetos de cena.
// Coordenadas locais: origem nos pés (ou na base do objeto), y para baixo.
import { clamp, lerp, hash, TAU } from './lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, wob } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // Seu Chicó: moreno, cabelo branco cacheado, camiseta azul "14", calça azul-marinho
  cSkin: '#b8734a', cSkinS: '#955733', cNose: '#c7764c', nail: '#e8b090', hairC: '#f2f1f4', hairCS: '#c4c2cc', stacheC: '#e6e3ea',
  shirt: '#2347c8', shirtS: '#1a369c', pants: '#2a2e4e', pantsS: '#1d2038', frame: '#2a2226',
  flip: '#2fb37a', flipS: '#1f8a5b', flipN: '#2c3050', flipNS: '#1d2038', strapN: '#4a5078', strap: '#f4f1ea', gold: '#e2b33c', goldS: '#b98a1f',
  // Dona Zefinha: pele morena clara, cabelo grisalho curtinho amarrado pra trás, vestido azul de treliça, casaco vermelho geométrico
  zSkin: '#dca78b', zSkinS: '#c38c71', zHair: '#a29fa8', zHairS: '#75727c', dressZ: '#2446b8', dressZS: '#17307f', lattice: '#a9c4ff',
  cardi: '#d8262e', cardiS: '#a51b23', cardiG: '#a9a9b0', cardiW: '#f4f1ea', cardiD: '#7a1420', frameZ: '#b77f78',
  // gato magricelo: cinza rajado
  cat: '#a19fab', catS: '#7d7b88', catStripe: '#64626e', catPink: '#f2a0b5', catBelly: '#d6d4dc',
  // papagaio (papagaio-verdadeiro): verde, testa azul, cara amarela, ombro vermelho
  pGreen: '#3cb44b', pGreenS: '#2a8a37', pBlue: '#3e7be0', pYellow: '#ffd23f', pRed: '#e5402f', beak: '#4a4550', beakS: '#2e2a33', claw: '#8e8a94',
  // a casa
  wallT: '#a8dccf', wallTS: '#93c8bb', wallB: '#3f8c7c', wallBS: '#347567', floor: '#b5462f', floorS: '#9a3826', grout: '#7e2c1d',
  kWall: '#f6dd8a', kTile: '#fbfaf3', kTileB: '#7fb4d9', kFloor: '#efe6cf', kFloorB: '#d8ccae',
  wood: '#b07a45', woodS: '#8a5c30', woodD: '#6b4423', chair: '#8e2f45', chairS: '#6e2236', doily: '#fff7e6',
  thermos: '#d9342b', thermosS: '#a82520', cup: '#fdfbf5', cupS: '#dcd8cc', cupBand: '#3e7be0', coffee: '#5a3418',
  paper: '#f3ecd9', paperS: '#ddd2b6', news: '#2b2730', clay: '#c46a3c', clayS: '#9c4f28', steel: '#c8cdd3', steelS: '#9aa1aa',
  sun1: '#ffb347', sun2: '#ff8a5c', sun3: '#e8607a', sun4: '#9a5ca8', sunD: '#ffe27a',
  chita: '#ff7a3d', chitaS: '#d9582a', chitaF: '#ffe14d', chitaL: '#2fb37a',
  rug: ['#ff8fb1', '#ffd23f', '#5ec4e8', '#9be36b'],
};

// —— gramática de rosto e mãos ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.cSkin, closed = false, lw = 6, jitter = 0 } = {}) {
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
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true, lip = null } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) {
    if (lip) shape([...quad(lc, [cx, cy - 4 + sm * k * 1.2], rc, 12), ...quad(rc, [cx, cy + 9 + sm * k * 1.2], lc, 12)], { fill: lip, lw: 4 });
    stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return;
  }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], {
    fill: PAL.mouthIn, lw: lip ? lw + 2 : lw, line: lip ?? INK, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 20, col = PAL.cSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
// tubo com contorno (rabo, alça, fio): traço preto largo + traço colorido por cima
export function tube(pts, w, col, lw = 6) { stroke(pts, w + lw * 2, { boil: .6 }); stroke(pts, w, { line: col, boil: .6 }); }
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });
// florzinhas (estampa)
function flowers(x0, y0, w, h, col, step = 46, r = 6, seed = 1) {
  for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2) * step / 2; x < x0 + w; x += step) {
    const jx = (hash(x * .3 + y * .7 + seed) - .5) * 14, jy = (hash(x * .9 + y * .2 + seed) - .5) * 14;
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; fillOnly(ell(x + jx + Math.cos(a) * r, y + jy + Math.sin(a) * r, r * .7, r * .7, 8), col, { boil: .2 }); }
  }
}

// —— chinelo de dedo azul-marinho (vista 3/4, dir = lado da ponta) ——
function chinelo(fx, dir, skin, sole = PAL.flip, soleS = PAL.flipS, strap = PAL.strapN) {
  push(); translate(fx, 0); scale(dir, 1);
  shape(spline([[-34, 3], [-38, -10], [-10, -16], [36, -16], [62, -8], [58, 4]]), { fill: sole, lw: 6, shade: () => fillOnly(rect(-60, -4, 140, 10), soleS, { boil: .2 }) });
  shape(spline([[-26, -10], [-24, -32], [6, -38], [40, -28], [50, -12], [44, -8]]), { fill: skin, lw: 6 });
  for (let k = 0; k < 3; k++) stroke(arc(30 + k * 7, -14, 4, 5, Math.PI * 1.1, Math.PI * 1.9, 5), 4);
  stroke([[-4, -12], [16, -30], [36, -14]], 13); stroke([[-4, -12], [16, -30], [36, -14]], 6, { line: strap });
  pop();
}
// braço com cotovelo: sh = ombro; arm = { e: [dx,dy] cotovelo, h: [dx,dy] mão } (relativos ao ombro) ou só { h, bend }
function limb(sh, arm, { skin, sleeve, sleeveS, sleeveTo = .4, w0 = 44, w1 = 36, r = 22, fist = false, under = null, pattern = null }) {
  const pat = pattern ? { shade: () => pattern(sh) } : {};
  const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
  if (arm.e) {
    const ep = [sh[0] + arm.e[0], sh[1] + arm.e[1]];
    shape(noodle(sh, ep, 0, w0, w0 * .92), { fill: sleeveTo >= 1 ? sleeve : skin, lw: 7, ...pat });
    shape(noodle(ep, hp, 0, w0 * .92, w1), { fill: sleeveTo >= 1 ? sleeve : skin, lw: 7, ...pat });
    if (sleeveTo < 1) shape(noodle(sh, [lerp(sh[0], ep[0], sleeveTo * 2), lerp(sh[1], ep[1], sleeveTo * 2)], 0, w0 + 22, w0 + 18), { fill: sleeve, lw: 7, shade: () => sleeveS && fillOnly(ell(sh[0] + 20, sh[1] + 30, 30, 30, 12), sleeveS, { boil: .3 }) });
  } else {
    shape(noodle(sh, hp, arm.bend ?? 0, w0, w1), { fill: sleeveTo >= 1 ? sleeve : skin, lw: 7, ...pat });
    if (sleeveTo < 1) shape(noodle(sh, [lerp(sh[0], hp[0], sleeveTo), lerp(sh[1], hp[1], sleeveTo)], (arm.bend ?? 0) * sleeveTo, w0 + 22, w0 + 18), { fill: sleeve, lw: 7 });
  }
  if (under) under(hp);
  const from = arm.e ? arm.e : [0, 0];
  hand(hp[0], hp[1] + 6, arm.ang ?? Math.atan2(arm.h[1] - from[1], arm.h[0] - from[0]) - .2, r, skin, { fist: arm.fist ?? fist });
  return hp;
}
// "14" pontilhado da camiseta (matriz de pontos 5×7)
const GLYPH = { '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'], '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'] };
function dotPrint(str, x, y, d, col) {
  [...str].forEach((ch, i) => GLYPH[ch].forEach((row, r) => [...row].forEach((c, k) => { if (c === '1') dot(x + i * d * 6.4 + k * d, y + r * d, d * .36, col); })));
}
// rugas de gente de idade
function rugas(y0, wide = 1) {
  stroke(arc(0, y0 - 64, 40 * wide, 8, Math.PI * 1.15, Math.PI * 1.85, 10), 3.5);
  stroke(arc(0, y0 - 50, 30 * wide, 6, Math.PI * 1.2, Math.PI * 1.8, 10), 3.5);
}

// —— 1. SEU CHICÓ: cabelo branco cacheado, óculos de armação escura, bigodinho branco, camiseta azul com "14" pontilhado,
//    calça social azul-marinho e chinelo de dedo. Gesto da casa: a mão no queixo, pensando na notícia ——
// P: { x, y, s, t, face, sit, armL, armR (com e: cotovelo), mouth, look, lid, brow, tilt, paper, closed }
export function chico(P) {
  const sit = P.sit ?? false;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  const hip = sit ? -262 : -300, T = hip - 262; // T = topo dos ombros
  // pernas de calça + tornozelos + chinelos
  for (const sx of [-1, 1]) {
    const wk = P.walk != null ? Math.sin(P.walk * TAU + (sx > 0 ? 0 : Math.PI)) : 0, lift = P.walk != null ? Math.max(0, wk) * 26 : 0;
    const top = sit ? [sx * 84, hip + 46] : [sx * 46, hip + 20], ank = sit ? [sx * 96, -50] : [sx * 52 + wk * 22, -50 - lift];
    shape(noodle(top, ank, 0, 62, 54), { fill: PAL.pants, lw: 7, shade: () => fillOnly(rect(sx > 0 ? ank[0] - 4 : -600, -700, sx > 0 ? 600 : 600 + ank[0] - 30, 700), PAL.pantsS, { boil: .3, alpha: sx > 0 ? .8 : 0 }) });
    shape(noodle([ank[0], ank[1] + 8], [ank[0] + 2, -24], 0, 34, 32), { fill: PAL.cSkin, lw: 6 });
    shape(rr(ank[0] - 31, ank[1] - 6, 62, 18, 8), { fill: PAL.pants, lw: 6 }); // barra da calça
    push(); translate(0, -lift); chinelo(ank[0] + 2, sx, PAL.cSkin, PAL.flipN, PAL.flipNS); pop();
  }
  if (sit) shape(spline([[-122, hip - 24], [0, hip - 30], [122, hip - 24], [150, hip + 40], [112, hip + 70], [30, hip + 52], [-30, hip + 52], [-112, hip + 70], [-150, hip + 40]]), { fill: PAL.pants, lw: 7, shade: () => fillOnly(rect(40, hip - 60, 200, 160), PAL.pantsS, { boil: .3 }) });
  else shape(spline([[-114, hip - 20], [114, hip - 20], [110, hip + 40], [10, hip + 60], [-110, hip + 40]]), { fill: PAL.pants, lw: 7 });
  const shB = [-112, T + 16], shF = [112, T + 16];
  const opt = { skin: PAL.cSkin, sleeve: PAL.shirt, sleeveS: PAL.shirtS, w0: 40, w1: 34, r: 23 };
  const armB = P.armL || { h: [-26, 230], bend: -20 }, armF = P.armR || { h: [26, 230], bend: 20 };
  if (!P.paper) limb(shB, armB, opt);
  // camiseta azul
  shape(spline([[-108, T + 2], [-40, T - 8], [40, T - 8], [108, T + 2], [124, T + 110], [126, T + 210], [120, T + 268], [0, T + 276], [-120, T + 268], [-126, T + 210], [-124, T + 110]]), {
    fill: PAL.shirt, lw: 7, shade: () => {
      fillOnly(spline([[60, T - 10], [140, T + 80], [140, T + 290], [80, T + 290], [96, T + 120]]), PAL.shirtS, { boil: .4 });
      for (const [x, y] of [[-60, T + 230], [40, T + 250], [-20, T + 200]]) stroke(arc(x, y, 30, 8, Math.PI * .2, Math.PI * .8, 8), 3, { line: PAL.shirtS });
    }
  });
  // estampa: "STRONG AND FREE" virou uma fileira de pontinhos + o "14" pontilhado
  for (let k = 0; k < 13; k++) dot(-62 + k * 10, T + 76, 2.2, '#dfe8ff');
  push(); if ((P.face ?? 1) < 0) { translate(12, 0); scale(-1, 1); translate(-12, 0); } dotPrint('14', -54, T + 92, 9.5, '#eef3ff'); pop();
  // gola + pescoço
  push(); translate(0, T - 4); rotate(P.tilt ?? 0);
  shape(spline([[-40, 14], [-34, -40], [34, -40], [40, 14]]), { fill: PAL.cSkin, lw: 7, shade: () => fillOnly(rect(10, -50, 40, 70), PAL.cSkinS, { boil: .3 }) });
  pop();
  shape(spline([[-44, T - 6], [0, T + 18], [44, T - 6]], false, 8), { closed: false, lw: 10, line: PAL.shirtS, fill: null });
  stroke(spline([[-44, T - 6], [0, T + 18], [44, T - 6]], false, 8), 6);
  // cabeça
  push(); translate(0, T - 30); rotate(P.tilt ?? 0);
  for (const sx of [-1, 1]) shape(ell(sx * 78, -74, 17, 26, 16), { fill: PAL.cSkin, lw: 6, shade: () => stroke(arc(sx * 80, -74, 7, 12, Math.PI * .6, Math.PI * 1.4, 6), 4) });
  shape(spline([[-76, -110], [-70, -170], [0, -186], [70, -170], [76, -110], [70, -40], [44, 4], [0, 16], [-44, 4], [-70, -40]]), {
    fill: PAL.cSkin, lw: 7, shade: () => { fillOnly(ell(56, -60, 36, 90, 24), PAL.cSkinS, { boil: .4 }); }
  });
  // cabelo branco cacheado (nuvem de cachos)
  const cur = []; const N = 15;
  for (let i = 0; i <= N; i++) { const a = lerp(Math.PI * .93, Math.PI * 2.07, i / N), r = i % 2 ? 1.12 : 1; cur.push([Math.cos(a) * 92 * r, -126 + Math.sin(a) * 74 * r]); }
  shape(spline([...cur, [76, -100], [52, -136], [0, -144], [-52, -136], [-76, -100]]), {
    fill: PAL.hairC, lw: 6, shade: () => { fillOnly(ell(40, -170, 50, 40, 20), PAL.hairCS, { boil: .4 }); }
  });
  for (const [x, y] of [[-50, -170], [-12, -186], [26, -176], [58, -150], [-70, -136], [-30, -150], [10, -156]]) stroke(arc(x, y, 9, 8, Math.PI * .8, Math.PI * 2.1, 8), 3.5, { line: PAL.hairCS });
  // costeletas brancas
  for (const sx of [-1, 1]) shape(spline([[sx * 66, -114], [sx * 78, -110], [sx * 76, -76], [sx * 68, -84]]), { fill: PAL.hairC, lw: 5 });
  rugas(-74, .9);
  // sobrancelhas grisalhas
  const br = P.brow ?? 0;
  for (const sx of [-1, 1]) { push(); translate(sx * 37, -120 + br * 3); rotate(-sx * br * .22); shape(rr(-21, -6, 42, 12, 6), { fill: PAL.hairCS, lw: 5 }); pop(); }
  eye(-30, -96, 19, 21, { lid: P.lid ?? .4, look: P.look || [0, 0], skin: PAL.cSkin, closed: P.closed });
  eye(30, -96, 19, 21, { lid: P.lid ?? .4, look: P.look || [0, 0], skin: PAL.cSkin, closed: P.closed });
  for (const sx of [-1, 1]) stroke(arc(sx * 30, -68, 16, 6, Math.PI * .15, Math.PI * .85, 8), 3); // bolsinhas
  // óculos de armação escura retangular
  for (const sx of [-1, 1]) stroke(rr(sx * 30 - 30, -120, 60, 46, 14), 8, { line: PAL.frame });
  stroke([[-8, -104], [8, -104]], 7, { line: PAL.frame });
  for (const sx of [-1, 1]) stroke([[sx * 60, -108], [sx * 76, -96]], 6, { line: PAL.frame });
  // nariz
  shape(spline([[-6, -92], [14, -66], [22, -46], [6, -36], [-18, -40], [-20, -56]]), { fill: PAL.cNose, lw: 6 });
  // vincos do rosto
  for (const sx of [-1, 1]) stroke(quad([sx * 26, -44], [sx * 40, -26], [sx * 34, -6]), 3.5);
  // bigodinho branco
  shape(spline([[-40, -26], [-20, -36], [0, -32], [20, -36], [40, -26], [22, -22], [0, -24], [-22, -22]]), { fill: PAL.stacheC, lw: 5 });
  mouth(0, -12, 40, P.mouth || { o: 0, sm: -.1 });
  pop();
  if (P.paper) seguraJornal(T, hip, P.t);
  else limb(shF, armF, opt);
  pop();
}

// segurando o jornal aberto (plano geral): mangas à vista, braços atrás do papel, antebraços em pé pelas laterais,
// e do lado de cá do papel aparecem só os quatro dedos dobrados sobre a borda (o polegar fica do lado dele)
function seguraJornal(T, hip, t) {
  const yP = hip - 70, yH = yP - 60, W = 250;
  for (const sx of [-1, 1]) shape(noodle([sx * 112, T + 16], [sx * 160, T + 90], sx * 6, 64, 58), { fill: PAL.shirt, lw: 7 }); // mangas
  jornalAberto({ x: 0, y: yP, s: 1, t, w: W });
  for (const sx of [-1, 1]) {
    // só a mão: costas da mão um tiquinho pra fora da borda + quatro dedos dobrados por cima do papel
    shape(spline([[sx * (W - 2), yH - 34], [sx * (W + 22), yH - 40], [sx * (W + 38), yH - 16], [sx * (W + 36), yH + 22], [sx * (W + 18), yH + 38], [sx * (W - 2), yH + 34]]), { fill: PAL.cSkin, lw: 7, shade: () => fillOnly(ell(sx * (W + 30), yH, 10, 40, 12), PAL.cSkinS, { boil: .3, alpha: .6 }) });
    for (let k = 0; k < 4; k++) {
      const fy = yH - 26 + k * 18, len = [30, 36, 34, 26][k];
      shape(rr(sx > 0 ? W - len : -W, fy - 8, len + 6, 17, 8), { fill: PAL.cSkin, lw: 5 });
      fillOnly(ell(sx * (W - len + 7), fy, 4, 5, 8), PAL.nail, { boil: .2 });
    }
  }
}

// jornal aberto segurado na frente do corpo (plano geral)
export function jornalAberto(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  const w = P.w ?? 300, h = 210;
  shape(spline([[-w, -h * .55], [-w * .5, -h * .62], [0, -h * .52], [w * .5, -h * .62], [w, -h * .55], [w * 1.02, h * .5], [w * .5, h * .44], [0, h * .52], [-w * .5, h * .44], [-w * 1.02, h * .5]], true, 6), {
    fill: PAL.paper, lw: 7, shade: () => {
      fillOnly(rect(0, -200, 400, 400), PAL.paperS, { boil: .3 });
      fillOnly(rect(-w + 26, -h * .44, w - 52, 30), PAL.news, { boil: .3 });
      for (let c = 0; c < 2; c++) for (let k = 0; k < 6; k++) fillOnly(rect(-w + 26 + c * (w - 26) / 2, -h * .44 + 50 + k * 22, (w - 26) / 2 - 20, 8), '#9a9180', { boil: .2 });
      fillOnly(rect(28, -h * .44, w - 54, 90), '#b9ae95', { boil: .3 });
      for (let c = 0; c < 2; c++) for (let k = 0; k < 4; k++) fillOnly(rect(28 + c * (w - 54) / 2, -h * .44 + 108 + k * 22, (w - 54) / 2 - 20, 8), '#9a9180', { boil: .2 });
    }
  });
  stroke([[0, -h * .52], [0, h * .52]], 5);
  pop();
}

// estampa do vestido: treliça de losangos com cruzinhas
function trelica(x0, y0, w, h, col, step = 34) {
  for (let k = -Math.ceil(h / step); k < Math.ceil(w / step) + 1; k++) {
    stroke([[x0 + k * step, y0], [x0 + k * step + h, y0 + h]], 2.5, { line: col, boil: .3 });
    stroke([[x0 + k * step + h, y0], [x0 + k * step, y0 + h]], 2.5, { line: col, boil: .3 });
  }
  for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y - y0) / step % 2) * step / 2; x < x0 + w; x += step) { stroke([[x - 5, y + step / 2], [x + 5, y + step / 2]], 3, { line: col, boil: .2 }); stroke([[x, y + step / 2 - 5], [x, y + step / 2 + 5]], 3, { line: col, boil: .2 }); }
}
// estampa do casaco: triângulos cinza, brancos e vinho
function geometrico(x0, y0, w, h, seed = 1) {
  const cols = [PAL.cardiG, PAL.cardiW, PAL.cardiD, PAL.cardiG];
  for (let y = y0; y < y0 + h; y += 54) for (let x = x0; x < x0 + w; x += 54) {
    const r = hash(x * .13 + y * .29 + seed); if (r < .18) continue;
    const c = cols[Math.floor(r * 4)], f = r > .7;
    fillOnly(f ? [[x, y], [x + 48, y + 24], [x, y + 48]] : [[x + 48, y], [x + 48, y + 48], [x, y + 24]], c, { boil: .3 });
  }
}

// —— 2. DONA ZEFINHA: cabelo grisalho curtinho, puxado e amarrado pra trás, óculos de aro fino, vestido azul de treliça,
//    casaco vermelho geométrico aberto, chinelo azul-marinho; braços cruzados, cara de "bem que te avisei" ——
// P: { x, y, s, t, face, armL, armR, cross (braços cruzados), mouth, look, lid, brow, tilt, spoon }
export function zefinha(P) {
  const cross = P.cross ?? !P.armR;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  // pernas firmes + chinelos
  for (const sx of [-1, 1]) {
    shape(noodle([sx * 34, -220], [sx * 38, -28], 0, 40, 32), { fill: PAL.zSkin, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 44 : -400, -260, 400, 260), PAL.zSkinS, { boil: .3, alpha: sx > 0 ? .6 : 0 }) });
    chinelo(sx * 38, sx, PAL.zSkin, PAL.flipN, PAL.flipNS);
  }
  const T = -540;
  const sleeve = { skin: PAL.zSkin, sleeve: PAL.cardi, sleeveTo: 1, w0: 54, w1: 44, r: 20, pattern: sh => geometrico(sh[0] - 220, sh[1] - 60, 440, 340, sh[0] > 0 ? 7 : 11) };
  const shB = [-104, T + 18], shF = [104, T + 18];
  if (!cross) limb(shB, P.armL || { h: [-30, 220], bend: -20 }, sleeve);
  // vestido azul de treliça (até abaixo do joelho, barra em babado)
  shape(spline([[-96, T + 4], [0, T - 6], [96, T + 4], [116, T + 160], [128, T + 300], [140, -200], [70, -186], [0, -196], [-70, -186], [-140, -200], [-128, T + 300], [-116, T + 160]]), {
    fill: PAL.dressZ, lw: 7, shade: () => { trelica(-160, T - 10, 320, 360, PAL.lattice, 30); fillOnly(rect(60, T - 20, 120, 380), PAL.dressZS, { boil: .3, alpha: .5 }); }
  });
  stroke(spline([[-140, -214], [-70, -200], [0, -210], [70, -200], [140, -214]], false, 8), 4); // babado
  // casaco vermelho aberto, comprido até a coxa
  for (const sx of [-1, 1]) {
    shape(spline([[sx * 110, T + 2], [sx * 40, T - 8], [sx * 30, T + 60], [sx * 44, T + 200], [sx * 64, -300], [sx * 150, -306], [sx * 146, T + 120], [sx * 132, T + 30]]), {
      fill: PAL.cardi, lw: 7, shade: () => { geometrico(sx > 0 ? 20 : -170, T - 20, 150, 280, sx * 3); fillOnly(rect(sx > 0 ? 110 : -160, T, 50, 280), PAL.cardiS, { boil: .3, alpha: .6 }); }
    });
    stroke(spline([[sx * 40, T - 8], [sx * 30, T + 60], [sx * 44, T + 200], [sx * 64, -300]], false, 8), 12, { line: PAL.cardiG }); stroke(spline([[sx * 40, T - 8], [sx * 30, T + 60], [sx * 44, T + 200], [sx * 64, -300]], false, 8), 5);
  }
  // cabeça
  push(); translate(0, T - 8); rotate(P.tilt ?? 0); scale(1.14);
  shape(spline([[-34, 14], [-30, -40], [30, -40], [34, 14]]), { fill: PAL.zSkin, lw: 7, shade: () => fillOnly(rect(8, -50, 40, 70), PAL.zSkinS, { boil: .3 }) });
  // rabinho curtinho amarrado atrás (só a pontinha aparece do lado da nuca) + elástico
  shape(spline([[52, -70], [76, -64], [92, -44], [84, -30], [64, -42], [50, -52]]), { fill: PAL.zHair, lw: 5, shade: () => stroke([[60, -60], [84, -40]], 3, { line: PAL.zHairS }) });
  shape(ell(56, -62, 7, 9, 10), { fill: PAL.cardiD, lw: 4 });
  for (const sx of [-1, 1]) shape(ell(sx * 78, -80, 14, 22, 14), { fill: PAL.zSkin, lw: 6 });
  // rosto redondo e largo, bochechas cheias
  shape(spline([[-76, -112], [-66, -158], [0, -174], [66, -158], [76, -112], [78, -64], [62, -22], [30, 4], [0, 10], [-30, 4], [-62, -22], [-78, -64]]), {
    fill: PAL.zSkin, lw: 7, shade: () => {
      fillOnly(ell(58, -64, 30, 92, 24), PAL.zSkinS, { boil: .4 });
      for (const [fx, fy] of [[-50, -52], [-40, -40], [-56, -36], [44, -46], [52, -34], [-20, -150], [24, -146], [8, -136]]) dot(fx, fy, 2.4, '#b9785c'); // sardinhas
    }
  });
  // cabelo grisalho repartido no meio, puxado e amarrado pra trás
  shape(spline([[-80, -100], [-76, -152], [-34, -182], [0, -186], [34, -182], [76, -152], [80, -100], [70, -112], [52, -138], [18, -150], [0, -146], [-18, -150], [-52, -138], [-70, -112]]), {
    fill: PAL.zHair, lw: 6, shade: () => {
      for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) stroke(quad([sx * 4, -150 - k * 10], [sx * (40 + k * 6), -160 - k * 8], [sx * (78 - k * 4), -116 - k * 10]), 3, { line: PAL.zHairS });
      fillOnly(ell(-40, -172, 18, 6, 10), '#d6d3da', { boil: .3 });
    }
  });
  stroke([[0, -148], [0, -186]], 3.5); // risca do meio
  rugas(-66, .9);
  for (const sx of [-1, 1]) { stroke(arc(sx * 50, -46, 16, 18, Math.PI * (sx < 0 ? .5 : .5), Math.PI * (sx < 0 ? 1.0 : 0.0), 6), 3); stroke(arc(sx * 60, -30, 10, 12, Math.PI * .6, Math.PI * 1.1, 6), 3); }
  const br = P.brow ?? .3;
  stroke(quad([-50, -124 + br * 4], [-32, -132], [-14, -124 - br * 2]), 4.5, { line: PAL.zHairS });
  stroke(quad([14, -124 - br * 2], [32, -132], [50, -124 + br * 4]), 4.5, { line: PAL.zHairS });
  eye(-30, -98, 16, 18, { lid: P.lid ?? .4, look: P.look || [0, 0], skin: PAL.zSkin, pupil: 4 });
  eye(30, -98, 16, 18, { lid: P.lid ?? .4, look: P.look || [0, 0], skin: PAL.zSkin, pupil: 4 });
  for (const sx of [-1, 1]) { stroke(arc(sx * 30, -74, 15, 6, Math.PI * .15, Math.PI * .85, 8), 3); stroke(arc(sx * 30, -66, 13, 5, Math.PI * .2, Math.PI * .8, 8), 2.5); }
  // óculos grandes, quadradões, armação rosada (lentes com reflexo)
  for (const sx of [-1, 1]) {
    shape(rr(sx * 32 - 32, -126, 64, 54, 12), { fill: '#f7eaea', alpha: .12, lw: 0, stroke: false });
    stroke(rr(sx * 32 - 32, -126, 64, 54, 12), 6.5, { line: PAL.frameZ });
    stroke([[sx * 32 - 24, -112], [sx * 32 - 16, -120]], 3, { line: '#ffffff' });
  }
  stroke(quad([-4, -112], [0, -118], [4, -112]), 5, { line: PAL.frameZ });
  for (const sx of [-1, 1]) stroke([[sx * 64, -116], [sx * 78, -100]], 5, { line: PAL.frameZ });
  // nariz e vincos
  shape(spline([[-4, -88], [14, -60], [10, -46], [-10, -48], [-18, -58]]), { fill: PAL.zSkinS, lw: 5 });
  for (const sx of [-1, 1]) stroke(quad([sx * 22, -48], [sx * 36, -32], [sx * 32, -12]), 3.5);
  mouth(0, -24, 34, P.mouth || { o: 0, sm: -.15 });
  stroke(arc(0, 0, 24, 8, Math.PI * .2, Math.PI * .8, 8), 3); // queixo
  pop();
  if (cross) {
    // braços cruzados na cintura, mangas compridas do casaco, mãos uma sobre a outra
    limb(shB, { e: [-50, 190], h: [130, 210], ang: -.1 }, sleeve);
    limb(shF, { e: [50, 190], h: [-120, 196], ang: Math.PI + .2 }, sleeve);
  } else {
    const armF = P.armR || { h: [40, 200], bend: 24 };
    limb(shF, armF, { ...sleeve, under: P.spoon ? hp => colher(hp, armF.spoonA ?? -1.9, armF.spoonL ?? 1) : null });
  }
  pop();
}
function colher(hp, a, len = 1) {
  push(); translate(hp[0], hp[1] + 6); rotate(a); scale(len, 1);
  shape(rr(-6, -14, 180, 12, 6), { fill: PAL.wood, lw: 5 });
  shape(ell(196, -8, 30, 20, 18), { fill: PAL.wood, lw: 6, shade: () => fillOnly(ell(200, -4, 18, 10, 12), PAL.woodS, { boil: .3 }) });
  pop();
}

// jornal dobrado (deixado na poltrona)
export function jornalDobrado(x, y, s = 1, rot = 0) {
  push(); translate(x, y); rotate(rot); scale(s);
  shape([[-120, -10], [110, -22], [124, 30], [-110, 42]], { fill: PAL.paper, lw: 6, shade: () => { fillOnly(rect(-130, 14, 260, 40), PAL.paperS, { boil: .2 }); fillOnly(rect(-90, -6, 120, 10), PAL.news, { boil: .2 }); for (let k = 0; k < 2; k++) fillOnly(rect(-90, 12 + k * 12, 170, 5), '#9a9180', { boil: .2 }); } });
  stroke([[-118, 14], [118, 4]], 4);
  pop();
}

// —— 3. BITUCA, o gato magricelo: cinza rajado, costelas à mostra, orelha dobrada, rabo com dobra, olhão de aprontar ——
// P: { x, y, s, t, face, arch (0..1), look, lid, mouth, tail }
export function gato(P) {
  const t = P.t ?? 0, arch = P.arch ?? .3;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  const hip = [-120, -150 - arch * 30], sho = [70, -160 - arch * 10];
  // rabo comprido com dobra na ponta
  const tw = Math.sin(t * TAU * .5) * 14;
  tube(spline([[hip[0] + 10, hip[1]], [-200, -230], [-214 + tw, -320], [-186 + tw, -350], [-160 + tw, -336]], false, 8), 16, PAL.cat);
  // pernas de trás (fundo)
  const leg = (a, b, w, col, bend = 0) => { shape(noodle(a, b, bend, w, w * .8), { fill: col, lw: 6 }); shape(ell(b[0] + 8, b[1] - 6, 18, 10, 12), { fill: col, lw: 5 }); };
  leg([hip[0] + 20, hip[1] + 20], [-104, -6], 17, PAL.catS, 34);
  leg([sho[0] - 20, sho[1] + 20], [80, -6], 17, PAL.catS, -6);
  // corpo magrelo arqueado
  const mid = [(hip[0] + sho[0]) / 2, Math.min(hip[1], sho[1]) - 40 - arch * 50];
  shape(spline([[hip[0] - 26, hip[1] + 8], [hip[0] - 10, hip[1] - 34], [mid[0], mid[1] - 14], [sho[0] + 20, sho[1] - 34], [sho[0] + 34, sho[1] + 6], [sho[0] - 6, sho[1] + 34], [mid[0], mid[1] + 70 + arch * 10], [hip[0] + 10, hip[1] + 34]]), {
    fill: PAL.cat, lw: 7, shade: () => {
      for (let k = 0; k < 4; k++) fillOnly(spline([[-150 + k * 50, -400], [-130 + k * 50, -400], [-122 + k * 50, mid[1] + 10], [-140 + k * 50, mid[1] + 6]]), PAL.catStripe, { boil: .3 });
      fillOnly(ell(mid[0], mid[1] + 70, 120, 26, 20), PAL.catBelly, { boil: .3 });
    }
  });
  for (let k = 0; k < 3; k++) stroke(arc(mid[0] - 10 + k * 22, mid[1] + 34, 14, 22, Math.PI * .7, Math.PI * 1.3, 6), 4); // costelas
  leg([hip[0] - 4, hip[1] + 24], [-138, -4], 18, PAL.cat, 38);
  leg([sho[0] + 4, sho[1] + 24], [104, -4], 18, PAL.cat, -6);
  gatoCabeca(sho[0] + 40, sho[1] - 60, P);
  pop();
}
function gatoCabeca(x, y, P) {
  push(); translate(x, y); rotate(P.tilt ?? -.08);
  // orelhas (a da direita dobrada)
  shape(spline([[-58, -40], [-62, -108], [-16, -64]]), { fill: PAL.cat, lw: 6, shade: () => fillOnly([[-52, -50], [-56, -94], [-26, -62]], PAL.catPink, { boil: .3 }) });
  shape(spline([[16, -64], [52, -102], [78, -96], [62, -44]]), { fill: PAL.cat, lw: 6, shade: () => fillOnly([[28, -64], [56, -90], [60, -54]], PAL.catPink, { boil: .3 }) });
  stroke([[56, -100], [66, -74]], 5);
  shape(spline([[-72, -20], [-56, -64], [0, -76], [56, -64], [74, -20], [56, 26], [0, 38], [-56, 26]]), {
    fill: PAL.cat, lw: 7, shade: () => { for (let k = -1; k <= 1; k++) fillOnly(rect(k * 18 - 5, -90, 10, 34), PAL.catStripe, { boil: .3 }); fillOnly(ell(4, 18, 40, 22, 16), PAL.catBelly, { boil: .3 }); }
  });
  eye(-24, -22, 22, 25, { lid: P.lid ?? .2, look: P.look || [.5, -.2], skin: PAL.cat, pupil: 4 });
  eye(26, -22, 22, 25, { lid: P.lid ?? .2, look: P.look || [.5, -.2], skin: PAL.cat, pupil: 4 });
  shape(spline([[-8, 4], [8, 4], [0, 14]]), { fill: PAL.catPink, lw: 4 });
  mouth(0, 20, 26, P.mouth || { o: 0, sm: .8, skew: -.4, lw: 5 });
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) stroke([[sx * 22, 10 + k * 6], [sx * 74, 2 + k * 12]], 3);
  pop();
}
// Bituca em pé nas patas de trás, com as da frente apoiadas na mesa (olhando a xícara); swipe 0..1 = a pata que derruba
// origem: patas de trás no chão; +x = para a mesa (use face: -1 pra virar)
export function gatoEmPe(P) {
  const t = P.t ?? 0, sw = P.swipe ?? 0, reach = P.reach ?? [70, -416];
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  const tw = Math.sin(t * TAU * .5) * 10;
  tube(spline([[-30, -140], [-96, -80], [-120 + tw, -20], [-90 + tw, 6], [-60, 2]], false, 8), 16, PAL.cat); // rabo no chão
  const paw = (x, y, col) => shape(ell(x + 6, y - 4, 18, 10, 12), { fill: col, lw: 5 });
  // perna de trás (fundo) dobrada
  shape(noodle([-24, -150], [16, -80], -10, 30, 24), { fill: PAL.catS, lw: 6 }); shape(noodle([16, -80], [-14, -8], 0, 22, 18), { fill: PAL.catS, lw: 6 }); paw(-14, 0, PAL.catS);
  // pata da frente de trás (apoiada na mesa)
  shape(noodle([24, -320], [reach[0] - 14, reach[1] + 8], -8, 20, 16), { fill: PAL.catS, lw: 6 }); paw(reach[0] - 20, reach[1] + 8, PAL.catS);
  // corpo em pé, magrelo
  shape(spline([[-44, -130], [-46, -220], [-10, -320], [30, -352], [62, -330], [52, -260], [36, -180], [24, -128], [-10, -112]]), {
    fill: PAL.cat, lw: 7, shade: () => {
      for (let k = 0; k < 4; k++) fillOnly(spline([[-80, -170 - k * 44], [80, -190 - k * 44], [80, -180 - k * 44], [-80, -160 - k * 44]]), PAL.catStripe, { boil: .3 });
      fillOnly(ell(30, -230, 24, 90, 16), PAL.catBelly, { boil: .3 });
    }
  });
  for (let k = 0; k < 3; k++) stroke(arc(10, -270 + k * 26, 22, 10, Math.PI * .1, Math.PI * .6, 6), 4); // costelas
  // perna de trás (frente)
  shape(noodle([-10, -150], [34, -82], -14, 34, 26), { fill: PAL.cat, lw: 6 }); shape(noodle([34, -82], [6, -6], 0, 24, 20), { fill: PAL.cat, lw: 6 }); paw(6, 0, PAL.cat);
  // pata da frente (a que derruba): sai da mesa, vai pra frente e bate na xícara
  const pf = [lerp(reach[0], reach[0] + 80, Math.sin(sw * Math.PI)) + sw * 30, reach[1] - Math.sin(sw * Math.PI) * 40];
  shape(noodle([40, -316], pf, -10, 22, 18), { fill: PAL.cat, lw: 6 }); paw(pf[0], pf[1], PAL.cat);
  gatoCabeca(40, -400, { ...P, tilt: P.tilt ?? .12 });
  pop();
}

// —— 4. LORENZO, o papagaio: verde, testa azul, cara amarela, ombro vermelho, bico curvo que abre pra gritar ——
// P: { x, y, s, t, face, beak (0..1 aberto), look, lid, wing (0..1 aberta), bob }
export function papagaio(P) {
  const t = P.t ?? 0, bk = P.beak ?? 0, wing = P.wing ?? 0;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  // cauda comprida pendurada atrás da poleira
  shape(spline([[-40, -50], [-6, -46], [-2, 60], [-22, 130], [-46, 64]]), { fill: PAL.pGreen, lw: 6, shade: () => { fillOnly(rect(-70, 70, 90, 80), PAL.pBlue, { boil: .3 }); fillOnly(rect(-70, 40, 90, 30), PAL.pRed, { boil: .3, alpha: .8 }); } });
  // asa aberta (atrás do corpo) quando grita
  if (wing > 0) { push(); translate(-30, -170); rotate(-.2 - wing * 1.1);
    shape(spline([[0, -10], [-60, -40], [-170, -30], [-200, 0], [-150, 20], [-170, 40], [-110, 44], [-20, 40]]), { fill: PAL.pGreen, lw: 6, shade: () => { fillOnly(rect(-220, -60, 70, 120), PAL.pBlue, { boil: .3 }); fillOnly(ell(-20, 0, 34, 24, 14), PAL.pRed, { boil: .3 }); } });
    pop(); }
  // corpo
  shape(spline([[0, -232], [50, -210], [64, -140], [52, -70], [24, -24], [-10, -18], [-44, -50], [-60, -120], [-52, -196]]), {
    fill: PAL.pGreen, lw: 7, shade: () => { fillOnly(ell(36, -100, 30, 90, 20), PAL.pGreenS, { boil: .4, alpha: .6 }); for (let k = 0; k < 4; k++) stroke(arc(4, -170 + k * 30, 16, 8, Math.PI * .2, Math.PI * .8, 6), 3, { line: PAL.pGreenS }); }
  });
  // asa dobrada (de frente) com ombro vermelho e pontas azuis
  shape(spline([[-58, -190], [-20, -196], [-6, -150], [-14, -70], [-34, -24], [-62, -60], [-70, -130]]), {
    fill: PAL.pGreenS, lw: 6, shade: () => { fillOnly(ell(-36, -186, 30, 18, 14), PAL.pRed, { boil: .3 }); fillOnly(rect(-90, -76, 100, 70), PAL.pBlue, { boil: .3 }); for (let k = 0; k < 3; k++) stroke([[-52 + k * 14, -130], [-48 + k * 14, -40]], 3); }
  });
  // cabeça redonda: testa azul, cara amarela
  push(); translate(10, -262 + (P.bob ?? 0)); rotate(P.tilt ?? 0);
  shape(ell(0, 0, 58, 54, 36), { fill: PAL.pGreen, lw: 7, shade: () => {
    fillOnly(spline([[-40, -40], [0, -58], [40, -44], [30, -24], [-10, -26], [-44, -20]]), PAL.pBlue, { boil: .3 });
    fillOnly(spline([[-6, -24], [40, -26], [62, 4], [50, 34], [10, 30], [-10, 6]]), PAL.pYellow, { boil: .3 });
    fillOnly(ell(-30, 22, 26, 20, 14), PAL.pGreenS, { boil: .3, alpha: .5 });
  } });
  eye(16, -6, 15, 16, { lid: P.lid ?? .1, look: P.look || [.4, 0], skin: PAL.pYellow, pupil: 4.5 });
  stroke(ell(16, -6, 20, 21, 20), 4, { line: '#f4f1ea' });
  // bico curvo: a mandíbula de baixo abre pra gritar
  push(); translate(50, 18); rotate(bk * .6);
  shape(spline([[-6, -2], [24, 2], [32, 12], [12, 22], [-8, 14]]), { fill: PAL.beakS, lw: 6 });
  pop();
  if (bk > .1) fillOnly(ell(56, 22, 10, 6 + bk * 6, 10), PAL.tongue, { boil: .2 });
  shape(spline([[38, -16], [70, -20], [92, 0], [92, 30], [80, 44], [76, 22], [58, 16], [40, 16]]), { fill: PAL.beak, lw: 6, shade: () => fillOnly(ell(64, -8, 14, 6, 10), '#7a7480', { boil: .2 }) });
  dot(68, -4, 3);
  pop();
  // pés agarrados
  for (const sx of [-1, 1]) { shape(ell(sx * 18, -6, 16, 10, 12), { fill: PAL.claw, lw: 5 }); for (let k = 0; k < 2; k++) stroke(arc(sx * 18 + (k - .5) * 14, 2, 5, 8, 0, Math.PI, 6), 4); }
  pop();
}

// poleiro de madeira em pé (com potinho de água)
export function poleiro(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  const h = P.h ?? 460;
  shape(rr(-80, -16, 160, 18, 8), { fill: PAL.wood, lw: 6 });
  shape(rr(-70, -12, 18, 10, 4), { fill: PAL.woodS, lw: 4 });
  shape(rr(-8, -h, 16, h, 6), { fill: PAL.wood, lw: 6, shade: () => fillOnly(rect(2, -h, 8, h), PAL.woodS, { boil: .2 }) });
  shape(rr(-110, -h - 14, 220, 18, 9), { fill: PAL.wood, lw: 6, shade: () => fillOnly(rect(-110, -h - 4, 220, 8), PAL.woodS, { boil: .2 }) });
  shape(spline([[70, -h - 4], [100, -h - 4], [96, -h + 26], [74, -h + 26]]), { fill: PAL.steel, lw: 5, shade: () => fillOnly(rect(70, -h - 4, 34, 10), '#9ad4e8', { boil: .2 }) });
  pop();
}

// —— OBJETOS DE CENA ——
// poltrona de veludo vinho com paninho de crochê; part: 'back' (atrás de quem senta) | 'front' (braços e assento)
export function poltrona(P, part = 'all') {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  if (part !== 'front') {
    shape(spline([[-230, -330], [-240, -560], [-170, -680], [0, -700], [170, -680], [240, -560], [230, -330]]), {
      fill: PAL.chair, lw: 7, shade: () => {
        fillOnly(ell(150, -500, 90, 220, 20), PAL.chairS, { boil: .3 });
        for (const x of [-120, 0, 120]) for (const y of [-600, -480]) dot(x, y, 6, PAL.chairS);
      }
    });
    // paninho de crochê no encosto (bordas em leque)
    if (!P.noDoily) paninho(0, -680, 1);
  }
  if (part !== 'back') {
    // assento
    shape(rr(-210, -300, 420, 110, 30), { fill: PAL.chair, lw: 7, shade: () => fillOnly(rect(-210, -220, 420, 40), PAL.chairS, { boil: .3 }) });
    // braços estofados
    for (const sx of [-1, 1]) {
      shape(spline([[sx * 190, -420], [sx * 250, -440], [sx * 290, -410], [sx * 280, -180], [sx * 200, -170]].map(p => p)), { fill: PAL.chair, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 250 : -300, -440, 50, 280), PAL.chairS, { boil: .3 }) });
      shape(ell(sx * 244, -420, 48, 22, 20), { fill: PAL.chair, lw: 6, shade: () => fillOnly(ell(sx * 244, -416, 30, 10, 14), PAL.chairS, { boil: .3, alpha: .6 }) });
    }
    // base e pezinhos de madeira
    shape(rr(-280, -190, 560, 110, 16), { fill: PAL.chair, lw: 7, shade: () => fillOnly(rect(-280, -110, 560, 40), PAL.chairS, { boil: .3 }) });
    for (const sx of [-1, 1]) shape(spline([[sx * 250 - 18, -84], [sx * 250 + 18, -84], [sx * 252 + 8, 0], [sx * 252 - 8, 0]]), { fill: PAL.woodD, lw: 6 });
  }
  pop();
}

// paninho de crochê (solto: dá pra jogar em cima do papagaio)
export function paninho(x, y, s = 1, rot = 0) {
  push(); translate(x, y); rotate(rot); scale(s);
  const dp = []; for (let i = 0; i <= 10; i++) { const xx = lerp(-110, 110, i / 10); dp.push([xx, 40 + (i % 2 ? 22 : 10)]); }
  shape([[-110, -26], [110, -26], ...dp.reverse()], { fill: PAL.doily, lw: 5, shade: () => { for (let i = 0; i < 6; i++) stroke(ell(-80 + i * 32, 8, 8, 8, 10), 3, { line: '#d9cdb0' }); } });
  pop();
}
// mesinha redonda com toalhinha
export function mesinha(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  for (const sx of [-1, 0, 1]) shape(spline([[sx * 60 - 8, -330], [sx * 60 + 8, -330], [sx * 80 + 6, 0], [sx * 80 - 6, 0]]), { fill: sx ? PAL.woodS : PAL.wood, lw: 6 });
  shape(ell(0, -330, 130, 28, 30), { fill: PAL.wood, lw: 7, shade: () => fillOnly(ell(30, -324, 120, 20, 20), PAL.woodS, { boil: .2 }) });
  const sc = []; for (let i = 0; i <= 12; i++) { const a = lerp(Math.PI * .02, Math.PI * .98, i / 12); sc.push([Math.cos(a) * 112, -326 + Math.sin(a) * 24 + (i % 2 ? 26 : 12)]); }
  shape([...arc(0, -332, 112, 20, Math.PI, TAU, 14), ...sc], { fill: PAL.doily, lw: 5 });
  pop();
}

// garrafa térmica de bomba (vermelha florida)
export function garrafa(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  shape(spline([[-50, 0], [-54, -40], [-54, -200], [-46, -224], [46, -224], [54, -200], [54, -40], [50, 0]], true, 4), {
    fill: PAL.thermos, lw: 7, shade: () => { flowers(-70, -210, 140, 200, '#ffffff', 40, 6, 9); fillOnly(rect(22, -240, 40, 260), PAL.thermosS, { boil: .3 }); fillOnly(rect(-40, -200, 10, 170), '#ff8a80', { boil: .2 }); }
  });
  shape(rr(-58, -20, 116, 22, 8), { fill: PAL.steel, lw: 6 });
  shape(spline([[-48, -224], [-40, -262], [40, -262], [48, -224]]), { fill: PAL.steel, lw: 6, shade: () => fillOnly(rect(16, -270, 40, 50), PAL.steelS, { boil: .2 }) });
  shape(rr(-20, -282, 40, 24, 8), { fill: PAL.thermos, lw: 5 }); // botão da bomba
  shape(spline([[40, -250], [76, -258], [84, -246], [46, -236]]), { fill: PAL.steel, lw: 5 }); // bico
  stroke(spline([[-54, -190], [-90, -170], [-92, -80], [-54, -60]], false, 8), 8); stroke(spline([[-54, -190], [-90, -170], [-92, -80], [-54, -60]], false, 8), 3, { line: PAL.thermosS });
  pop();
}

// xícara com pires e fumacinha
export function xicara(P) {
  const t = P.t ?? 0;
  push(); translate(P.x, P.y); scale(P.s ?? 1); rotate(P.rot ?? 0);
  shape(ell(0, -6, 64, 14, 24), { fill: PAL.cup, lw: 6, shade: () => fillOnly(ell(10, -2, 56, 8, 18), PAL.cupS, { boil: .2 }) });
  stroke(spline([[40, -70], [70, -70], [70, -36], [38, -30]], false, 8), 9); stroke(spline([[40, -70], [70, -70], [70, -36], [38, -30]], false, 8), 3, { line: PAL.cup });
  shape(spline([[-44, -80], [44, -80], [38, -30], [22, -12], [-22, -12], [-38, -30]]), { fill: PAL.cup, lw: 6, shade: () => { fillOnly(rect(-50, -70, 100, 10), PAL.cupBand, { boil: .2 }); fillOnly(rect(16, -90, 40, 90), PAL.cupS, { boil: .2 }); } });
  shape(ell(0, -80, 44, 10, 20), { fill: PAL.coffee, lw: 6 });
  if (P.steam !== false) for (let k = 0; k < 2; k++) {
    const ph = t * 1.4 + k * .5, y0 = -100, a = (ph % 1);
    stroke(spline([[k * 22 - 10, y0], [k * 22 - 22 + Math.sin(ph * 6) * 6, y0 - 30], [k * 22 - 4, y0 - 60], [k * 22 - 16 + Math.sin(ph * 6 + 1) * 6, y0 - 90]], false, 6), 5, { line: '#ffffff', alpha: .9 - a * .5 });
  }
  pop();
}

// —— CENÁRIO: sala de casa simples do interior, fim de tarde, com a cozinha ao fundo pela porta em arco ——
// sala(P, { kitchen: fn }) desenha a parede, janela, relógio, calendário, a cozinha (e chama kitchen() pra pôr quem está lá) e o piso.
export const SET = { floorY: 1350, door: { x0: 600, x1: 1000, top: 560 }, kFloor: 1262 };
export function sala(P = {}, hooks = {}) {
  const t = P.t ?? 0, D = SET.door, F = SET.floorY;
  // parede: verde-água em cima, barra pintada embaixo
  fillOnly(rect(-400, -400, 1880, 1420), PAL.wallT, { boil: 0 });
  fillOnly(rect(-400, 1000, 1880, F - 1000), PAL.wallB, { boil: 0 });
  stroke([[-400, 1000], [1480, 1000]], 6);
  // cozinha (atrás da porta em arco)
  const archPts = [[D.x0, F], [D.x0, D.top + 100], ...arc((D.x0 + D.x1) / 2, D.top + 100, (D.x1 - D.x0) / 2, 100, Math.PI, TAU, 18), [D.x1, F]];
  const arch = shape(archPts, {
    fill: PAL.kWall, lw: 0, stroke: false, shade: () => {
      fillOnly(rect(D.x0, 1010, D.x1 - D.x0, SET.kFloor - 1010), PAL.kTile, { boil: 0 });
      for (let x = D.x0; x < D.x1; x += 42) for (let y = 1010; y < SET.kFloor; y += 42) { stroke(rect(x, y, 42, 42).concat([[x, y]]), 2, { line: '#cfd9de', boil: 0 }); if ((x / 42 + y / 42) % 2 < 1) fillOnly(ell(x + 21, y + 21, 7, 7, 8), PAL.kTileB, { boil: .2 }); }
      fillOnly(rect(D.x0, SET.kFloor, D.x1 - D.x0, F - SET.kFloor), PAL.kFloor, { boil: 0 });
      for (let x = D.x0; x < D.x1; x += 50) for (let r = 0; r < 2; r++) if (((x - D.x0) / 50 + r) % 2 < 1) fillOnly(rect(x, SET.kFloor + r * 44, 50, 44), PAL.kFloorB, { boil: 0 });
      // prateleira com filtro de barro
      shape(rr(D.x0 + 10, 930, 150, 16, 6), { fill: PAL.wood, lw: 5 });
      filtro({ x: D.x0 + 85, y: 930, s: .62 });
      // janelinha da cozinha com o céu do entardecer
      shape(rr(D.x0 + 200, 740, 150, 150, 8), { fill: PAL.sun2, lw: 6, shade: () => { fillOnly(rect(D.x0 + 200, 815, 150, 80), PAL.sun3, { boil: 0 }); } });
      stroke([[D.x0 + 275, 740], [D.x0 + 275, 890]], 6); stroke([[D.x0 + 200, 815], [D.x0 + 350, 815]], 6);
      // fogão de 4 bocas com panela fumegando
      fogao({ x: D.x0 + 330, y: SET.kFloor + 20, s: .8, t });
      if (hooks.kitchen) hooks.kitchen();
      push(); translate(D.x0 + 330, SET.kFloor + 20); scale(.8); panelaFrente({ x: 0, y: 0, s: 1 }); pop();
    }
  });
  // batente da porta
  const jamb = [[D.x0 - 22, F], [D.x0 - 22, D.top + 100], ...arc((D.x0 + D.x1) / 2, D.top + 100, (D.x1 - D.x0) / 2 + 22, 122, Math.PI, TAU, 18), [D.x1 + 22, F]];
  stroke(jamb, 22, { line: PAL.wood }); stroke(jamb, 6); stroke(archPts, 6);
  // janela da sala com o pôr do sol + cortina de chita
  janelaSala({ x: 70, y: 380, w: 330, h: 420, t });
  // relógio de parede: 18h10
  shape(ell(510, 330, 64, 64, 40), { fill: PAL.wood, lw: 7 });
  shape(ell(510, 330, 50, 50, 36), { fill: '#fffbea', lw: 5 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; dot(510 + Math.cos(a) * 40, 330 + Math.sin(a) * 40, 3); }
  stroke([[510, 330], [510 + Math.cos(-Math.PI / 2 + TAU * (6 + 10 / 60) / 12) * 26, 330 + Math.sin(-Math.PI / 2 + TAU * (6 + 10 / 60) / 12) * 26]], 7);
  stroke([[510, 330], [510 + Math.cos(-Math.PI / 2 + TAU * 10 / 60) * 38, 330 + Math.sin(-Math.PI / 2 + TAU * 10 / 60) * 38]], 5);
  // calendário de parede do armazém (fictício)
  shape(rr(440, 520, 140, 200, 6), { fill: '#fffdf4', lw: 6, shade: () => { fillOnly(rect(440, 520, 140, 90), '#ffd23f', { boil: 0 }); fillOnly(rect(440, 610, 140, 22), PAL.pRed, { boil: 0 }); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) fillOnly(rect(452 + c * 21, 644 + r * 18, 12, 8), '#9a9180', { boil: 0 }); } });
  vaquinha(510, 580, .5);
  text('NOV', 510, 622, { font: '700 18px "Baloo 2"', fill: '#ffffff' });
  stroke([[510, 500], [470, 520]], 3); stroke([[510, 500], [550, 520]], 3); dot(510, 500, 5);
  // rodapé + piso de vermelhão em perspectiva
  fillOnly(rect(-400, F, 1880, 1000), PAL.floor, { boil: 0 });
  shape(rect(-400, F - 16, D.x0 - 22 + 400, 16), { fill: PAL.woodS, lw: 5 }); shape(rect(D.x1 + 22, F - 16, 500, 16), { fill: PAL.woodS, lw: 5 });
  stroke([[-400, F], [1480, F]], 6);
  for (let k = -10; k <= 10; k++) stroke([[540 + k * 70, F], [540 + k * 230 * 1.35, F + 830]], 3, { line: PAL.grout, boil: .4 });
  for (const y of [1400, 1470, 1570, 1710, 1900, 2140]) stroke([[-400, y], [1480, y]], 3, { line: PAL.grout, boil: .4 });
  // tapete de barbante redondo
  for (let k = 0; k < 4; k++) shape(ell(470, 1790, 470 - k * 80, 90 - k * 16, 60), { fill: PAL.rug[k], lw: 5, boil: .5 });
}
function janelaSala({ x, y, w, h, t }) {
  shape(rect(x, y, w, h), { fill: PAL.sun1, lw: 7, shade: () => {
    const cols = [PAL.sun4, PAL.sun3, PAL.sun2, PAL.sun1];
    cols.forEach((c, i) => fillOnly(rect(x, y + i * h * .16, w, h * .16 + 1), c, { boil: 0 }));
    shape(ell(x + w * .62, y + h * .72, 70, 70, 36), { fill: PAL.sunD, lw: 5 });
    fillOnly(spline([[x - 10, y + h * .82], [x + w * .3, y + h * .74], [x + w * .6, y + h * .8], [x + w + 10, y + h * .72], [x + w + 10, y + h + 10], [x - 10, y + h + 10]]), '#6c4a7a', { boil: .4 }); // morro
    mandacaru(x + w * .2, y + h * .82, 1); mandacaru(x + w * .86, y + h * .8, .72); xiquexique(x + w * .38, y + h * .82, .8);
    galhoSeco(x + w * .62, y + h * .84, .8);
  } });
  stroke([[x + w / 2, y], [x + w / 2, y + h]], 8); stroke([[x, y + h * .5], [x + w, y + h * .5]], 8);
  shape(rect(x - 20, y + h, w + 40, 22), { fill: PAL.wood, lw: 6 });
  // cortina de chita (laranja com flores) amarrada
  for (const sx of [0, 1]) {
    const cx = sx ? x + w + 10 : x - 10, d = sx ? -1 : 1;
    shape(spline([[cx - d * 30, y - 30], [cx + d * 60, y - 30], [cx + d * 30, y + h * .45], [cx + d * 50, y + h + 40], [cx - d * 30, y + h + 40], [cx - d * 20, y + h * .45]]), {
      fill: PAL.chita, lw: 6, shade: () => { flowers(cx - 80, y - 40, 160, h + 90, PAL.chitaF, 38, 7, sx * 5); fillOnly(rect(cx - 6, y - 40, 14, h + 100), PAL.chitaS, { boil: .3 }); }
    });
    shape(ell(cx + d * 22, y + h * .45, 20, 12, 12), { fill: PAL.chitaL, lw: 5 });
  }
  shape(rr(x - 70, y - 44, w + 140, 18, 9), { fill: PAL.woodS, lw: 6 });
}
// caatinga na janela (silhuetas contra o pôr do sol)
const CACTO = '#3d2a52';
function mandacaru(x, y, s) {
  push(); translate(x, y); scale(s);
  shape(rr(-9, -150, 18, 150, 9), { fill: CACTO, lw: 4 });
  shape(spline([[8, -70], [34, -70], [40, -78], [40, -122], [28, -122], [28, -84], [8, -84]], true, 3), { fill: CACTO, lw: 4 });
  shape(spline([[-8, -96], [-30, -96], [-36, -104], [-36, -136], [-24, -136], [-24, -110], [-8, -110]], true, 3), { fill: CACTO, lw: 4 });
  pop();
}
function xiquexique(x, y, s) {
  push(); translate(x, y); scale(s);
  for (const [dx, h, a] of [[-16, 48, -.35], [0, 64, 0], [16, 40, .4], [26, 30, .7]]) { push(); translate(dx * .4, 0); rotate(a); shape(rr(-6, -h, 12, h, 6), { fill: CACTO, lw: 4 }); pop(); }
  pop();
}
function galhoSeco(x, y, s) {
  push(); translate(x, y); scale(s);
  stroke([[0, 0], [0, -40], [-18, -64]], 4); stroke([[0, -40], [16, -70], [30, -78]], 4); stroke([[16, -70], [10, -90]], 3); stroke([[0, -20], [-20, -34]], 3);
  pop();
}
function vaquinha(x, y, s) { push(); translate(x, y); scale(s);
  shape(rr(-50, -30, 100, 56, 24), { fill: '#ffffff', lw: 5, shade: () => { fillOnly(ell(-20, -10, 16, 12, 12), INK, { boil: .3 }); fillOnly(ell(26, 8, 12, 10, 12), INK, { boil: .3 }); } });
  shape(ell(56, -26, 26, 22, 16), { fill: '#ffffff', lw: 5 }); shape(ell(66, -16, 14, 9, 10), { fill: PAL.catPink, lw: 4 });
  for (const lx of [-34, -12, 18, 38]) stroke([[lx, 24], [lx, 48]], 7);
  pop(); }
function filtro({ x, y, s }) { push(); translate(x, y); scale(s);
  shape(spline([[-60, 0], [-64, -100], [-56, -150], [56, -150], [64, -100], [60, 0]]), { fill: PAL.clay, lw: 6, shade: () => { fillOnly(rect(20, -160, 60, 170), PAL.clayS, { boil: .3 }); stroke([[-64, -100], [64, -100]], 4); } });
  shape(spline([[-56, -150], [-48, -220], [0, -236], [48, -220], [56, -150]]), { fill: PAL.clay, lw: 6, shade: () => fillOnly(rect(20, -240, 60, 100), PAL.clayS, { boil: .3 }) });
  shape(ell(0, -238, 16, 8, 10), { fill: PAL.clayS, lw: 5 });
  shape(rr(52, -40, 26, 14, 4), { fill: PAL.steel, lw: 4 });
  pop(); }
function fogao({ x, y, s, t }) { push(); translate(x, y); scale(s);
  shape(rr(-120, -260, 260, 260, 10), { fill: '#fbfaf3', lw: 7, shade: () => { fillOnly(rect(80, -270, 70, 280), '#dcdcd4', { boil: .2 }); shape(rr(-90, -170, 200, 130, 10), { fill: '#3a3a44', lw: 5 }); for (let k = 0; k < 4; k++) shape(ell(-80 + k * 56, -226, 14, 14, 12), { fill: '#3a3a44', lw: 4 }); } });
  shape(rr(-130, -290, 280, 34, 8), { fill: '#e6e6de', lw: 6 });
  // panela aberta (feijão no fogo) com vapor; a frente é redesenhada depois de quem mexe (panelaFrente)
  shape(ell(-22, -380, 62, 13, 24), { fill: '#6a3a1e', lw: 6, shade: () => { for (const [bx, by] of [[-40, -380], [-6, -384], [14, -377]]) shape(ell(bx, by, 6, 3, 8), { fill: '#8a5230', lw: 2 }); } });
  panelaFrente({ x: 0, y: 0, s: 1 });
  for (let k = 0; k < 3; k++) { const ph = t * 1.2 + k * .33, a = ph % 1; stroke(spline([[-60 + k * 36, -420], [-72 + k * 36 + Math.sin(ph * 5) * 8, -460], [-56 + k * 36, -500], [-66 + k * 36, -530]], false, 6), 5, { line: '#ffffff', alpha: .9 - a * .6 }); }
  pop(); }

// corpo da panela (cobre a ponta da colher que está dentro dela)
export function panelaFrente({ x, y, s }) { push(); translate(x, y); scale(s);
  shape([[-84, -380], ...arc(-22, -380, 62, 13, Math.PI, 0, 14), [40, -380], [36, -290], [-80, -290]], { fill: PAL.steel, lw: 6, shade: () => fillOnly(rect(10, -400, 40, 120), PAL.steelS, { boil: .2 }) });
  for (const sx of [-1, 1]) shape(rr(sx > 0 ? 34 : -104, -360, 26, 14, 6), { fill: '#3a3a44', lw: 4 });
  pop(); }
// quebra de linha por largura (fonte do canvas)
export function wrap(str, font, maxW) {
  g.save(); g.font = font; const out = []; let cur = '';
  for (const w of str.split(/\s+/)) { const tryS = cur ? cur + ' ' + w : w; if (g.measureText(tryS).width > maxW && cur) { out.push(cur); cur = w; } else cur = tryS; }
  if (cur) out.push(cur); g.restore(); return out;
}
// —— CLOSE EM PRIMEIRA PESSOA: as mãos dele segurando o jornal com a notícia (momento da credibilidade) ——
// P: { t, masthead, date, kicker, headline:[linhas], resumo:[linhas], fonte:[linhas], clip: fn opcional (recorte de print) }
export function jornalClose(P) {
  const t = P.t ?? 0, sway = Math.sin(t * TAU * .25) * 6;
  push(); translate(540 + sway, 980); rotate(Math.sin(t * TAU * .2) * .01);
  const W2 = 420, H2 = 760;
  // página
  shape([[-W2, -H2], [W2, -H2 + 10], [W2 + 10, H2], [-W2 - 6, H2 - 8]], { fill: PAL.paper, lw: 7, shade: () => {
    fillOnly(rect(W2 - 60, -H2, 80, H2 * 2), PAL.paperS, { boil: .2 });
    stroke([[-W2 + 30, -H2 + 150], [W2 - 30, -H2 + 150]], 6, { line: PAL.news }); stroke([[-W2 + 30, -H2 + 196], [W2 - 30, -H2 + 196]], 3, { line: PAL.news });
  } });
  text(P.masthead ?? 'BRAZUELA', 0, -H2 + 82, { font: '92px "Titan One"', fill: PAL.news });
  text(P.date ?? 'SEGUNDA-FEIRA, 9 DE NOVEMBRO DE 2026', 0, -H2 + 174, { font: '700 26px "Baloo 2"', fill: PAL.news });
  if (P.kicker) { shape(rr(-W2 + 34, -H2 + 222, 260, 44, 8), { fill: PAL.pRed, lw: 5 }); text(P.kicker, -W2 + 164, -H2 + 245, { font: '800 28px "Baloo 2"', fill: '#ffffff' }); }
  const hl = wrap(P.headline ?? 'A MANCHETE REAL DA NOTÍCIA ENTRA AQUI, BEM GRANDE', '64px "Bungee"', W2 * 2 - 72);
  hl.forEach((l, i) => text(l, -W2 + 36, -H2 + 320 + i * 78, { font: '64px "Bungee"', fill: PAL.news, align: 'left' }));
  const y0 = -H2 + 320 + hl.length * 78 - 6;
  stroke([[-W2 + 36, y0], [W2 - 36, y0]], 3, { line: PAL.news });
  // resumo (escrito por nós) à esquerda + ilustração nossa à direita (nunca a foto da matéria)
  const iw = 230, rsW = W2 * 2 - 72 - iw - 30;
  const rs = wrap(P.resumo ?? 'Resumo curto, com as minhas palavras: o que aconteceu, onde e por quê.', '600 33px "Baloo 2"', rsW);
  rs.forEach((l, i) => text(l, -W2 + 36, y0 + 44 + i * 44, { font: '600 33px "Baloo 2"', fill: PAL.news, align: 'left' }));
  const ix = W2 - 36 - iw, iy = y0 + 26;
  if (P.clip) P.clip(ix, iy, iw, iw);
  else { shape(rr(ix, iy, iw, iw, 8), { fill: '#e9e0c8', lw: 5 }); text('ilustração', ix + iw / 2, iy + iw / 2, { font: '700 26px "Baloo 2"', fill: '#8a8070' }); }
  const fy0 = Math.max(y0 + 44 + rs.length * 44, iy + iw + 30);
  // selo de fonte, bem legível
  const fy = fy0;
  shape(rr(-W2 + 36, fy, W2 * 2 - 72, 150, 14), { fill: '#fff6c2', lw: 6, shade: () => fillOnly(rect(-W2 + 36, fy, 22, 150), PAL.pRed, { boil: 0 }) });
  const fo = P.fonte ?? ['FONTE: Nome do Veículo · 09/11/2026', 'siteoriginal.com.br/caminho-da-materia'];
  text(fo[0], -W2 + 74, fy + 50, { font: '800 34px "Baloo 2"', fill: PAL.news, align: 'left' });
  text(fo[1], -W2 + 74, fy + 104, { font: '600 30px "Baloo 2"', fill: '#4a4458', align: 'left' });
  // resto da página: outras notas (só linhas, ilegíveis de propósito)
  if (fy + 184 < H2 - 20) stroke([[-W2 + 36, fy + 184], [W2 - 36, fy + 184]], 3, { line: PAL.news });
  const cw = (W2 * 2 - 72 + 28) / 3;
  for (let c = 0; c < 3; c++) {
    if (fy + 232 < H2 - 30) fillOnly(rect(-W2 + 36 + c * cw, fy + 210, cw * .7, 22), '#6e6676', { boil: .2 });
    const rows = Math.max(0, Math.min(7, Math.floor((H2 - 40 - (fy + 254)) / 30)));
    for (let k = 0; k < rows; k++) fillOnly(rect(-W2 + 36 + c * cw, fy + 254 + k * 30, k === rows - 1 ? cw * .55 : cw - 28, 10), '#a39a88', { boil: .2 });
  }
  pop();
  // mãos do Seu Chicó segurando as laterais, vistas do lado de quem lê: polegar por cima do papel, dedos por trás,
  // a lateral da mão e do indicador por fora da borda. Longe do selo de fonte.
  for (const sx of [-1, 1]) {
    push(); translate(540 + sway + sx * (W2 + 6), 980 + 650); scale(sx, 1);
    // antebraço
    shape(noodle([200, 560], [56, 70], -16, 128, 104), { fill: PAL.cSkin, lw: 7, shade: () => fillOnly(rect(120, -100, 300, 800), PAL.cSkinS, { boil: .3, alpha: .55 }) });
    // mão: lateral do indicador dobrando atrás da borda + palma
    shape(spline([[2, -92], [36, -110], [76, -100], [100, -60], [108, 0], [96, 62], [62, 104], [20, 96], [2, 40]]), {
      fill: PAL.cSkin, lw: 7, shade: () => { fillOnly(ell(92, 10, 26, 90, 16), PAL.cSkinS, { boil: .3, alpha: .55 }); }
    });
    stroke(arc(34, -66, 22, 16, Math.PI * .15, Math.PI * .85, 8), 4);  // dobra do indicador
    stroke(arc(40, -20, 20, 12, Math.PI * .2, Math.PI * .8, 8), 4);    // dobra do médio
    // polegar: base gordinha, junta, ponta com unha
    shape(spline([[40, 40], [10, -30], [-40, -64], [-86, -82], [-104, -66], [-94, -44], [-50, -24], [-10, 20], [6, 60]]), { fill: PAL.cSkin, lw: 7, shade: () => fillOnly(ell(10, 20, 30, 40, 12), PAL.cSkinS, { boil: .3, alpha: .4 }) });
    push(); translate(-84, -66); rotate(.42);
    shape(rr(-18, -12, 32, 22, 10), { fill: PAL.nail, lw: 4 });
    pop();
    stroke(arc(-42, -44, 12, 10, Math.PI * 1.15, Math.PI * 1.75, 6), 4); // vinco da junta
    pop();
  }
}
