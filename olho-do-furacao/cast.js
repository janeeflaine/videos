// cast.js — elenco original de "E se o avião entrar no olho?": Marlene, Juca, Olhão, Bandeja + aviões e objetos reais
// Coordenadas locais: origem nos pés (personagens) ou no centro (aviões, objetos); y para baixo.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a', gold: '#f0b934', goldS: '#c48e16',
  // Marlene
  mSkin: '#8a5a3c', mSkinS: '#6c432a', mHair: '#cfcac6', shirt: '#f6f4ee', shirtS: '#d9d6cc', uni: '#1d2236', uniS: '#121626', lens: '#1f2a36',
  // Juca
  jSkin: '#f1c7a5', jSkinS: '#d9a684', jHair: '#ff7a2f', jHairS: '#d65a17', jPants: '#2b3a67', headset: '#3a3f4a',
  // Olhão
  cloud: '#e9edf3', cloudS: '#b9c2d0', cloudD: '#8994a8', eyeSky: '#62c3ff', iris: '#2e7fd9', bolt: '#ffe04a',
  // Bandeja
  cart: '#c9ced6', cartS: '#9aa2ae', cartD: '#6d7480', screen: '#13261b', led: '#7dffb0', capRed: '#e8392b',
  // aviões
  jetW: '#f4f6f8', jetS: '#cfd5dd', teal: '#1fb5a8', tealS: '#16867c', win: '#22324a',
  hunterW: '#f2f4f0', hunterB: '#2f5fb8', hunterR: '#e8392b', grey: '#8e99a5', greyS: '#6c7684', greyL: '#b3bcc6',
  radarBg: '#0e1a14', rGreen: '#3fd16b', rYellow: '#f2d23a', rRed: '#e8392b', rMag: '#d14bd6',
};

// —— rosto (gramática do estilo) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.mSkin, closed = false, lw = 6, jitter = 0 } = {}) {
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
export function hand(x, y, ang, r = 20, col = PAL.mSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// dragona (ombreira) com N faixas douradas
function epaulette(x, y, n, a = 0) {
  push(); translate(x, y); rotate(a);
  shape(rr(-30, -10, 60, 20, 6), { fill: PAL.uni, lw: 4, shade: () => { for (let k = 0; k < n; k++) fillOnly(rect(-22 + k * 12, -12, 6, 24), PAL.gold, { boil: .2 }); } });
  pop();
}

// caneca magnética: a caneca fica grudada num ímã de ferradura — o café nunca sai do lugar
export function magMug(x, y, a = 0, { tilt = 0, t = 0 } = {}) {
  push(); translate(x, y); rotate(a);
  // ímã de ferradura embaixo
  shape([...arc(0, 22, 34, 22, 0, Math.PI, 14), [-20, 22], ...arc(0, 22, 20, 10, Math.PI, 0, 10), [34, 22]], { fill: '#e8392b', lw: 5 });
  fillOnly(rect(-36, 18, 16, 8), '#d8dde2', { boil: .2 }); fillOnly(rect(20, 18, 16, 8), '#d8dde2', { boil: .2 });
  // caneca
  shape(rr(-30, -40, 60, 60, 10), { fill: '#f2c230', lw: 6, shade: () => fillOnly(rect(8, -44, 30, 70), '#cf9f18', { boil: .3 }) });
  shape(spline([[28, -28], [48, -26], [48, 4], [28, 6]], false), { fill: null, lw: 6 });
  push(); translate(0, -40); rotate(-a - tilt); shape(ell(0, 0, 28, 6, 16), { fill: '#6b3a1e', lw: 4 }); pop();
  // faíscas magnéticas
  for (let k = 0; k < 3; k++) { const ph = (t * 1.5 + k / 3) % 1; stroke([[-44 - ph * 10, 30 + k * 4], [-54 - ph * 14, 34 + k * 6]], 3, { line: '#ffe04a', alpha: 1 - ph }); }
  for (let k = 0; k < 2; k++) stroke(spline([[-8 + k * 16, -52], [-2 + k * 16, -66], [-10 + k * 16, -80]], false), 4, { line: 'rgba(255,255,255,.85)' });
  pop();
}

// —— 1. MARLENE: comandante veterana, impassível, óculos de aviador com antena ——
export function marlene(P) {
  const f = P.face ?? 1, t = P.t ?? 0;
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 34, -160], ank = [sx * 36, -24];
    shape(noodle(hip, ank, 0, 46, 40), { fill: PAL.uni, lw: 7 });
    shape(spline([[ank[0] - 32, 0], [ank[0] - 30, ank[1] - 10], [ank[0] + 14, ank[1] - 12], [ank[0] + 48, -8], [ank[0] + 46, 2]]), { fill: '#141418', lw: 7 });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-82, -386], shF = [80, -386];
  const armB = P.armL || { h: [-24, 190], bend: -14 }, armF = P.armR || { h: [60, 120], bend: 44 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]], ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    shape(noodle(sh, hp, arm.bend ?? 0, 38, 32), { fill: PAL.mSkin, lw: 7 });
    shape(noodle(sh, [sh[0] + arm.h[0] * .32, sh[1] + arm.h[1] * .32], 0, 50, 46), { fill: PAL.shirt, lw: 7 });   // manga curta
    if (hold === 'mug') { hand(hp[0], hp[1], ang, 19, PAL.mSkin, { fist: true }); magMug(hp[0] + 30, hp[1] - 30, -(P.lean ?? 0), { tilt: P.tilt ?? 0, t }); return; }
    hand(hp[0], hp[1], ang, 19, PAL.mSkin, { fist: !!hold });
  };
  drawArm(shB, armB, P.holdL);
  // tronco: camisa branca, larga; calça escura com cinto
  shape(spline([[-96, -190], [96, -190], [104, -150], [0, -140], [-104, -150]]), { fill: PAL.uni, lw: 7 });
  const body = spline([[-50, -424], [-98, -396], [-110, -280], [-100, -176], [0, -166], [100, -176], [110, -280], [98, -396], [50, -424]]);
  shape(body, {
    fill: PAL.shirt, lw: 7, shade: () => {
      fillOnly(spline([[34, -430], [120, -400], [124, -160], [56, -160], [74, -290]]), PAL.shirtS, { boil: .4 });
      fillOnly(rect(-130, -190, 260, 26), PAL.uni, { boil: .2 });
    }
  });
  shape(rr(-18, -192, 36, 22, 4), { fill: PAL.gold, lw: 4 });   // fivela
  // gravata preta
  shape([[-12, -418], [12, -418], [18, -260], [0, -236], [-18, -260]], { fill: '#141418', lw: 5 });
  shape([[-26, -428], [0, -404], [26, -428], [10, -440], [-10, -440]], { fill: PAL.shirt, lw: 5 });   // colarinho
  // asas no peito + crachá
  push(); translate(-58, -344); shape(spline([[-28, 0], [-10, -8], [0, -4], [10, -8], [28, 0], [0, 6]]), { fill: PAL.gold, lw: 4 }); pop();
  shape(rr(40, -350, 46, 16, 4), { fill: '#e6e2d8', lw: 3 });
  epaulette(shB[0] + 18, shB[1] - 18, 4, -.25); epaulette(shF[0] - 18, shF[1] - 18, 4, .25);
  push(); translate(2, -508); rotate(P.headTilt ?? 0); headMarlene(P, t); pop();
  drawArm(shF, armF, P.holdR);
  pop(); pop();
}
function headMarlene(P, t) {
  shape(noodle([0, 64], [0, 96], 0, 42, 46), { fill: PAL.mSkin, lw: 6 });
  // coque grisalho atrás
  shape(ell(-62, -26, 34, 30, 20), { fill: PAL.mHair, lw: 6, shade: () => fillOnly(ell(-50, -14, 20, 16, 12), '#b3ada8', { boil: .3 }) });
  for (const [cx, cy] of [[-64, 20], [62, 18]]) shape(ell(cx, cy, 16, 22, 14), { fill: PAL.mHair, lw: 5 });
  const HD = spline([[0, -70], [52, -60], [70, -16], [68, 32], [50, 68], [0, 82], [-50, 68], [-68, 30], [-68, -20], [-48, -62]]);
  shape(HD, { fill: PAL.mSkin, lw: 7, shade: () => fillOnly(spline([[30, -80], [90, -40], [90, 80], [20, 92], [50, 20]]), PAL.mSkinS, { boil: .3 }) });
  // óculos de aviador (lentes gota) — os olhos ficam escondidos: impassível
  const lensUp = P.glassesUp ?? 0;
  if (lensUp > .5) {
    eye(-24, -2, 22, 22, { lid: .5, look: P.look || [.3, 0], pupil: 4, skin: PAL.mSkin });
    eye(24, -2, 22, 22, { lid: .5, look: P.look || [.3, 0], pupil: 4, skin: PAL.mSkin });
  }
  push(); translate(0, lensUp > .5 ? -54 : 0);
  for (const sx of [-1, 1]) {
    const lp = spline([[sx * 6, -18], [sx * 50, -22], [sx * 54, 0], [sx * 36, 24], [sx * 14, 20], [sx * 4, 2]]);
    shape(lp, { fill: PAL.lens, lw: 6, shade: () => { stroke([[sx * 14, -10], [sx * 34, -14]], 5, { line: '#7fd0e6' }); stroke([[sx * 16, 2], [sx * 22, 0]], 4, { line: '#7fd0e6' }); } });
  }
  stroke(quad([-8, -14], [0, -20], [8, -14], 6), 5);
  // antena na haste dos óculos, com luzinha que pisca
  stroke(spline([[52, -16], [66, -50], [62, -96]], false), 4);
  const on = Math.floor(t * 2) % 2 === 0;
  shape(ell(62, -102, 9, 9, 12), { fill: on ? '#ff5a4a' : '#7a2a24', lw: 4 });
  pop();
  stroke([[-46, -40], [-8, -42]], 8); stroke([[8, -42], [46, -40]], 8);
  shape(spline([[0, 8], [10, 30], [0, 38], [-12, 32]]), { fill: PAL.mSkin, lw: 6, shade: () => fillOnly(ell(2, 34, 9, 5, 8), PAL.mSkinS, { boil: .3 }) });
  const m = P.mouth || {};
  mouth(4, 58, 42, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.1, skew: m.skew ?? .15, lw: 6 });
  // quepe de piloto: copa escura, faixa dourada, asas na frente, pala preta
  shape(spline([[-80, -56], [-74, -104], [0, -122], [78, -106], [86, -58], [0, -48]]), { fill: PAL.uni, lw: 7, shade: () => fillOnly(rect(24, -140, 90, 100), PAL.uniS, { boil: .3 }) });
  shape(rr(-78, -74, 160, 16, 4), { fill: PAL.gold, lw: 4 });
  push(); translate(2, -92); shape(spline([[-34, 2], [-12, -10], [0, -4], [12, -10], [34, 2], [0, 10]]), { fill: PAL.gold, lw: 4 }); pop();
  shape(spline([[-82, -58], [82, -58], [98, -42], [0, -32], [-88, -42]]), { fill: '#141418', lw: 6 });
}

// —— 2. JUCA: copiloto novato, empolgado e medroso; headset grande e pau de selfie ——
export function juca(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0, t = P.t ?? 0;
  const jit = ner ? (hash(Math.floor(t * 12) * 3.3) - .5) * 8 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  for (const sx of [-1, 1]) {
    const hip = [sx * 22, -230], ank = [sx * 28, -22];
    shape(noodle(hip, ank, sx * -6, 30, 26), { fill: PAL.jPants, lw: 6 });
    shape(spline([[ank[0] - 24, 0], [ank[0] - 22, ank[1] - 6], [ank[0] + 12, ank[1] - 8], [ank[0] + 44, -6], [ank[0] + 42, 2]]), { fill: '#7a4a2a', lw: 6 });
  }
  const shB = [-48, -436], shF = [48, -436];
  const armB = P.armL || { h: [-24, 160], bend: -16 }, armF = P.armR || { h: [40, -150], bend: 30 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]], ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    shape(noodle(sh, hp, arm.bend ?? 0, 24, 20), { fill: PAL.jSkin, lw: 6 });
    shape(noodle(sh, [sh[0] + arm.h[0] * .3, sh[1] + arm.h[1] * .3], 0, 34, 32), { fill: PAL.shirt, lw: 6 });
    if (hold === 'selfie') {
      const tip = [hp[0] + (P.stick?.[0] ?? 60), hp[1] + (P.stick?.[1] ?? -150)];
      stroke([hp, tip], 7); stroke([hp, tip], 3, { line: '#8e99a5' });
      push(); translate(tip[0], tip[1]); rotate(Math.atan2(tip[1] - hp[1], tip[0] - hp[0]) + Math.PI / 2);
      shape(rr(-30, -52, 60, 100, 10), { fill: '#22242c', lw: 5, shade: () => fillOnly(rr(-22, -44, 44, 82, 6), '#7fd0e6', { boil: .2 }) });
      dot(0, -34, 4, '#22242c'); pop();
    }
    hand(hp[0], hp[1], ang, 15, PAL.jSkin, { fist: !!hold || arm.fist });
  };
  drawArm(shB, armB, P.holdL);
  // camisa branca, magrinho, gravata vermelha torta
  shape(spline([[-50, -250], [50, -250], [54, -220], [0, -214], [-54, -220]]), { fill: PAL.jPants, lw: 6 });
  const body = spline([[0, -460], [50, -440], [58, -330], [52, -238], [0, -230], [-52, -238], [-58, -330], [-50, -440]]);
  shape(body, { fill: PAL.shirt, lw: 7, shade: () => fillOnly(spline([[20, -470], [70, -440], [70, -230], [30, -230], [40, -340]]), PAL.shirtS, { boil: .3 }) });
  push(); translate(0, -452); rotate(.18);
  shape([[-9, 0], [9, 0], [16, 150], [2, 170], [-12, 150]], { fill: '#e8392b', lw: 5 }); pop();
  shape([[-24, -464], [0, -444], [24, -464], [10, -474], [-10, -474]], { fill: PAL.shirt, lw: 5 });
  epaulette(shB[0] + 12, shB[1] - 14, 3, -.3); epaulette(shF[0] - 12, shF[1] - 14, 3, .3);
  push(); translate(0, -548); rotate(P.headTilt ?? 0); headJuca(P, ner, t); pop();
  drawArm(shF, armF, P.holdR);
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-80, -600 + u * 40, 1); sweat(84, -580 + ((u + .5) % 1) * 40, .8); }
  pop();
}
function headJuca(P, ner, t) {
  shape(noodle([0, 56], [0, 96], 0, 26, 30), { fill: PAL.jSkin, lw: 6 });
  for (const sx of [-1, 1]) shape(ell(sx * 54, 10, 14, 22, 14), { fill: PAL.jSkin, lw: 6 });
  // topete laranja (atrás da cabeça)
  for (const [cx, cy, r] of [[-30, -80, 30], [0, -96, 34], [32, -90, 30], [56, -70, 22], [-50, -62, 22]]) shape(ell(cx, cy, r, r * .85, 16), { fill: PAL.jHair, lw: 6, shade: () => fillOnly(ell(cx + r * .4, cy + r * .3, r * .6, r * .5, 12), PAL.jHairS, { boil: .3 }) });
  shape(spline([[0, -80], [42, -70], [56, -10], [48, 56], [16, 84], [-16, 84], [-48, 56], [-56, -10], [-42, -70]]), { fill: PAL.jSkin, lw: 7, shade: () => fillOnly(ell(36, 20, 36, 70, 20), PAL.jSkinS, { boil: .3 }) });
  // sardas
  for (const [x, y] of [[-34, 26], [-24, 32], [-30, 38], [30, 26], [22, 32], [28, 38]]) dot(x, y, 2.6, '#c9784a');
  const br = P.brow ?? .6;
  stroke([[-40, -36 - br * 6], [-10, -40 - br * 10]], 6); stroke([[40, -36 - br * 6], [10, -40 - br * 10]], 6);
  const look = P.look || [0, 0], shake = ner ? (hash(Math.floor(t * 24) * 1.7) - .5) * 3 * ner : 0, es = P.eyeS ?? 1;
  for (const ex of [-20, 20]) eye(ex, 0, 19 * es, 25 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 3.4, skin: PAL.jSkin, jitter: shake, lw: 5 });
  shape(spline([[0, 8], [9, 30], [0, 36], [-9, 30]]), { fill: PAL.jSkinS, lw: 5 });
  const m = P.mouth || {};
  mouth(0, 56, 44, { o: m.o ?? .45, w: m.w ?? 1, sm: m.sm ?? 1, skew: m.skew ?? 0, lw: 5 });
  // headset enorme: arco, conchas, microfone
  stroke(arc(0, -10, 66, 96, Math.PI * 1.05, Math.PI * 1.95, 22), 14);
  stroke(arc(0, -10, 66, 96, Math.PI * 1.05, Math.PI * 1.95, 22), 6, { line: PAL.headset });
  for (const sx of [-1, 1]) shape(rr(sx * 62 - 18, -16, 36, 54, 14), { fill: PAL.headset, lw: 6, shade: () => fillOnly(rect(sx * 62 - 22, 20, 44, 20), '#22252c', { boil: .2 }) });
  stroke(spline([[-62, 32], [-56, 66], [-28, 76]], false), 5);
  shape(ell(-22, 76, 9, 7, 10), { fill: '#22252c', lw: 4 });
}

// —— 3. OLHÃO: o furacão-criatura, com um olho de verdade no meio (pisca, não fala) ——
export function olhao(P) {
  const t = P.t ?? 0, s = P.s ?? 1, R = 300, spin = (P.spin ?? 1) * t * .5;
  push(); translate(P.x, P.y); scale(s * (P.face ?? 1), s * (P.sq ?? 1));
  // disco de nuvens com borda gorducha
  const rim = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; const k = 1 + .07 * Math.sin(a * 9 + spin * 2) + .04 * hash(i * 2.1); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * .92 * k]); }
  shape(spline(rim), { fill: PAL.cloud, lw: 8, shade: () => fillOnly(ell(60, 70, R * .9, R * .8, 40), PAL.cloudS, { boil: .3 }) });
  // braços espirais (bandas de chuva) girando no sentido anti-horário
  for (let k = 0; k < 4; k++) {
    const pts = []; for (let i = 0; i <= 22; i++) { const u = i / 22, a = -spin + k * TAU / 4 + u * 3.4, r = lerp(96, R * .86, u); pts.push([Math.cos(a) * r, Math.sin(a) * r * .92]); }
    stroke(spline(pts, false), 12, { line: PAL.cloudD });
    stroke(spline(pts, false), 5, { line: '#ffffff' });
  }
  // parede do olho (anel escuro) + o olho
  shape(ell(0, 0, 112, 106, 40), { fill: PAL.cloudD, lw: 7 });
  const blink = P.blink ?? 0, open = 1 - clamp(blink, 0, 1);
  shape(ell(0, 0, 92, 86 * Math.max(.06, open), 36), {
    fill: PAL.white, lw: 7, shade: () => {
      const lk = P.look || [0, 0];
      fillOnly(ell(lk[0] * 30, lk[1] * 24, 46, 46, 30), PAL.iris, { boil: .3 });
      fillOnly(ell(lk[0] * 30, lk[1] * 24, 22, 22, 20), INK, { boil: .2 });
      fillOnly(ell(lk[0] * 30 - 14, lk[1] * 24 - 16, 9, 9, 12), '#ffffff', { boil: .2 });
    }
  });
  // pálpebras de nuvem
  if (open < .98) { stroke([[-96, 0], [96, 0]], 7); }
  stroke(arc(0, -6, 104, 100, Math.PI * 1.15, Math.PI * 1.85, 18), 10, { line: PAL.cloudS });   // "sobrancelha" de nuvem
  // raio na borda
  if (P.bolt !== false) {
    const on = (Math.floor(t * 3) % 4) === 0;
    if (on) shape([[220, -170], [250, -100], [230, -100], [262, -20], [206, -112], [228, -112]], { fill: PAL.bolt, lw: 5 });
  }
  pop();
}

// —— 4. BANDEJA: comissária-robô, um carrinho de serviço de bordo ——
export function bandeja(P) {
  const t = P.t ?? 0, s = P.s ?? 1, spill = P.spill ?? 0;
  push(); translate(P.x, P.y + (P.bob || 0)); scale(s * (P.face ?? 1), s);
  // rodízios
  for (const xx of [-62, 62]) { shape(ell(xx, -18, 18, 18, 14), { fill: '#2b2d33', lw: 5 }); dot(xx, -18, 5, PAL.cartS); }
  // corpo: carrinho de alumínio com gavetas
  shape(rr(-90, -320, 180, 290, 10), {
    fill: PAL.cart, lw: 7, shade: () => {
      fillOnly(rect(40, -330, 60, 310), PAL.cartS, { boil: .3 });
      for (let k = 0; k < 4; k++) fillOnly(rect(-90, -236 + k * 52, 180, 4), PAL.cartD, { boil: 0 });
    }
  });
  for (let k = 0; k < 4; k++) shape(rr(-24, -224 + k * 52, 48, 12, 6), { fill: PAL.cartD, lw: 3 });
  // trava de pé vermelha
  shape(rr(-20, -40, 40, 14, 4), { fill: PAL.capRed, lw: 4 });
  // tela-rosto no painel de cima
  shape(rr(-70, -306, 140, 70, 12), {
    fill: PAL.screen, lw: 6, shade: () => {
      const mood = P.mood ?? 0;   // 0 sorriso, 1 susto
      if (P.blink) { fillOnly(rect(-44, -274, 26, 5), PAL.led, { boil: 0 }); fillOnly(rect(18, -274, 26, 5), PAL.led, { boil: 0 }); }
      else for (const ex of [-31, 31]) fillOnly(ell(ex, -274, mood ? 12 : 8, mood ? 12 : 10, 12), PAL.led, { boil: .1 });
      if (mood) fillOnly(ell(0, -252, 10, 8, 12), PAL.led, { boil: .1 });
      else stroke(quad([-16, -256], [0, -246], [16, -256], 8), 4, { line: PAL.led });
    }
  });
  // chapeuzinho de comissária
  push(); translate(0, -326); rotate(-.12);
  shape(spline([[-46, 0], [-40, -30], [40, -30], [46, 0]]), { fill: PAL.capRed, lw: 6 });
  shape(rr(-50, -6, 100, 12, 5), { fill: '#141418', lw: 4 });
  shape(spline([[-8, -30], [0, -40], [8, -30]]), { fill: PAL.gold, lw: 3 });
  pop();
  // braços telescópicos segurando a bandeja
  const ty = -400 - Math.sin(t * 3) * 6;
  for (const sx of [-1, 1]) { stroke([[sx * 86, -260], [sx * 110, ty + 30]], 12); stroke([[sx * 86, -260], [sx * 110, ty + 30]], 5, { line: PAL.cartS }); }
  push(); translate(0, ty); rotate(spill * .35);
  shape(rr(-130, 0, 260, 18, 6), { fill: PAL.cartS, lw: 5 });
  // copinhos e bule
  const cups = [[-90, '#e8392b'], [-40, '#7fd0e6'], [10, '#f2c230']];
  cups.forEach(([cx, c], i) => {
    const fly = spill * (1 + i * .5), dx = fly * 60 * (i - 1), dy = -fly * 90 * (1 + i * .3);
    push(); translate(cx + dx, dy); rotate(fly * (i - 1) * 1.4);
    shape([[-16, 0], [16, 0], [20, -40], [-20, -40]], { fill: '#f4f1ea', lw: 4, shade: () => fillOnly(rect(-24, -38, 48, 10), c, { boil: .2 }) });
    pop();
  });
  shape(spline([[56, 0], [104, 0], [108, -40], [96, -64], [64, -64], [52, -40]]), { fill: '#d8dde2', lw: 5 });
  shape(spline([[104, -30], [130, -46], [134, -54]], false), { fill: null, lw: 5 });
  shape(ell(80, -70, 10, 8, 10), { fill: '#2b2d33', lw: 4 });
  pop();
  pop();
}

// —— 5. O JATO PT-SOH (vista lateral, nariz à direita) ——
// origem no centro da fuselagem; L = comprimento em px. pitch/roll em rad; flex = flexão das asas (efeito cartoon)
export function jet(x, y, L = 900, { pitch = 0, t = 0, flex = 0, gear = 0, lights = 1, reg = 'PT-SOH' } = {}) {
  push(); translate(x, y); rotate(pitch); scale(L / 1000);
  // asa do lado de lá (sombra)
  shape([[-40, 40], [120, 36], [40, 64 - flex * 40], [-120, 66 - flex * 40]], { fill: PAL.jetS, lw: 5 });
  // estabilizador horizontal do lado de lá
  shape([[-420, -28], [-470, -36], [-500, -26], [-450, -18]], { fill: PAL.jetS, lw: 4 });
  // fuselagem
  const F = spline([[-500, -40], [-300, -56], [300, -56], [420, -48], [488, -20], [500, 6], [480, 36], [400, 56], [-200, 56], [-360, 34], [-470, -6]]);
  shape(F, {
    fill: PAL.jetW, lw: 8, shade: () => {
      fillOnly(rect(-600, 22, 1200, 60), PAL.jetS, { boil: .2 });
      fillOnly(spline([[-520, 6], [-200, 14], [300, 14], [500, 10], [500, 28], [300, 30], [-200, 30], [-520, 22]]), PAL.teal, { boil: .2 });
    }
  });
  // cauda (deriva) com faixa teal
  shape([[-300, -54], [-420, -250], [-480, -252], [-470, -36]], { fill: PAL.jetW, lw: 7, shade: () => fillOnly([[-340, -100], [-420, -250], [-500, -252], [-500, -100]], PAL.teal, { boil: .2 }) });
  text('?', -440, -180, { font: '64px "Titan One"', fill: '#ffffff', outlineW: 8 });
  // janelas
  for (let k = 0; k < 22; k++) { const xx = -300 + k * 28; if (k === 4 || k === 18) continue; shape(rr(xx - 7, -24, 14, 18, 6), { fill: PAL.win, lw: 3 }); }
  for (const dx of [-330, 230, 370]) stroke(rr(dx - 14, -40, 28, 66, 6), 3, { line: PAL.jetS });   // portas
  // para-brisa
  shape(spline([[418, -36], [456, -34], [476, -14], [430, -14]]), { fill: PAL.win, lw: 4, shade: () => stroke([[428, -30], [440, -18]], 3, { line: '#7fd0e6' }) });
  // asa do lado de cá + motor sob a asa
  shape([[-60, 44], [140, 40], [190, 74 + flex * 50], [150, 80 + flex * 50], [-100, 70]], { fill: PAL.jetW, lw: 6, shade: () => fillOnly(rect(-120, 64, 340, 30), PAL.jetS, { boil: .2 }) });
  push(); translate(80, 108 + flex * 20);
  shape(spline([[-90, -30], [70, -36], [96, -20], [96, 22], [70, 34], [-90, 24], [-110, 0]]), { fill: PAL.jetS, lw: 6, shade: () => fillOnly(rect(-120, 8, 240, 40), '#aeb6c0', { boil: .2 }) });
  shape(ell(96, -6, 12, 30, 16), { fill: '#3a3f4a', lw: 5 });
  stroke([[56, -32], [56, 30]], 4, { line: PAL.teal });
  pop();
  // estabilizador do lado de cá
  shape([[-410, -20], [-470, -26], [-520, -6], [-450, 2]], { fill: PAL.jetW, lw: 5 });
  // trem de pouso
  if (gear > 0) {
    for (const [gx, gl] of [[400, 70], [40, 90]]) { stroke([[gx, 50], [gx, 50 + gl * gear]], 9); shape(ell(gx, 56 + gl * gear, 20, 20, 14), { fill: '#2b2d33', lw: 5 }); }
  }
  // luzes de navegação piscando
  if (lights) { const on = Math.floor(t * 2) % 2 === 0; dot(-480, -252, 8, on ? '#ff5a4a' : '#7a2a24'); dot(190, 80 + flex * 50, 7, on ? '#7dffb0' : '#2a6a40'); }
  if (reg) text(reg, -250, 40, { font: '800 30px "Baloo 2"', fill: PAL.tealS });
  pop();
}

// hélice turboélice vista de lado: disco borrado + pá
function prop(x, y, h, t, rate = 9) {
  fillOnly(ell(x, y, 8, h, 18), 'rgba(220,226,232,.55)', { boil: .3 });
  const a = (t * rate) % 1; stroke([[x, y - h * Math.cos(a * TAU)], [x, y + h * Math.cos(a * TAU)]], 5, { line: '#3a3f4a' });
}
function nacelle(x, y, len, hgt, col, t, { fire = 0 } = {}) {
  shape(spline([[x - len, y - hgt * .4], [x - 10, y - hgt * .6], [x + 6, y - hgt * .3], [x + 6, y + hgt * .3], [x - 10, y + hgt * .6], [x - len, y + hgt * .5]]), { fill: col, lw: 5 });
  shape(ell(x + 18, y, 18, hgt * .34, 14), { fill: '#3a3f4a', lw: 4 });   // cone (spinner)
  prop(x + 26, y, hgt * 1.9, t);
  if (fire > 0) for (let k = 0; k < 4; k++) { const ph = (t * 2.5 + k / 4) % 1; shape(spline([[x - len * .6, y - 10], [x - len * (.8 + ph * .8), y - 30 - ph * 30], [x - len * (1 + ph), y - 6], [x - len * .7, y + 10]]), { fill: k % 2 ? '#ff8a2a' : '#ffe04a', lw: 4, alpha: fire * (1 - ph * .6) }); }
}

// —— 6. TEIMOSO: o caçador de furacões (quadrimotor turboélice, asa baixa, radomo no nariz e na barriga, ferrão na cauda) ——
export function teimoso(x, y, L = 900, { pitch = 0, t = 0, look = [.5, 0], blink = 0, fire = 0, mood = 0, sonde = 0 } = {}) {
  push(); translate(x, y); rotate(pitch); scale(L / 1000);
  // motores do lado de lá (mais altos/atrás, sombra)
  nacelle(140, 52, 110, 40, '#c9d0d6', t); nacelle(-20, 50, 110, 40, '#c9d0d6', t);
  // asa do lado de lá
  shape([[-120, 50], [160, 48], [120, 66], [-150, 68]], { fill: '#c9d0d6', lw: 5 });
  // ferrão (sonda magnética) na cauda + estabilizador de lá
  shape(spline([[-480, -10], [-600, -6], [-620, 4], [-600, 12], [-480, 14]]), { fill: '#d8dde2', lw: 5 });
  shape([[-420, -30], [-500, -40], [-520, -30], [-440, -20]], { fill: '#c9d0d6', lw: 4 });
  // fuselagem
  const F = spline([[-480, -30], [-300, -66], [300, -68], [400, -56], [470, -28], [500, 4], [484, 34], [420, 60], [-220, 62], [-380, 40], [-480, 10]]);
  shape(F, {
    fill: PAL.hunterW, lw: 8, shade: () => {
      fillOnly(rect(-600, 26, 1200, 60), '#cdd3d8', { boil: .2 });
      fillOnly(spline([[-520, -4], [-200, 2], [300, 2], [520, -2], [520, 16], [300, 18], [-200, 18], [-520, 12]]), PAL.hunterB, { boil: .2 });
    }
  });
  // radomo do nariz (preto) e da barriga (cinza)
  shape(spline([[470, -28], [520, -6], [528, 10], [500, 30], [484, 34], [500, 4]]), { fill: '#2b2d33', lw: 6 });
  shape(ell(-40, 72, 120, 30, 30), { fill: '#9aa2ae', lw: 6 });
  // deriva alta com faixa vermelha
  shape([[-300, -66], [-390, -280], [-450, -282], [-470, -30]], { fill: PAL.hunterW, lw: 7, shade: () => fillOnly([[-330, -170], [-420, -282], [-500, -282], [-500, -170]], PAL.hunterR, { boil: .2 }) });
  // antenas e sondas no dorso
  for (const ax of [-100, 60, 200]) { stroke([[ax, -66], [ax - 14, -100]], 5); dot(ax - 14, -100, 5); }
  // janelas pequenas + o "rosto" no para-brisa (olhos)
  for (let k = 0; k < 9; k++) shape(ell(-260 + k * 56, -26, 9, 9, 10), { fill: PAL.win, lw: 3 });
  for (const [ex, ey] of [[408, -36], [446, -30]]) eye(ex, ey, 20, 18, { look, pupil: 4, skin: PAL.hunterW, lw: 4, lid: blink ? 1 : (mood ? .35 : 0) });
  stroke([[392, -64], [426, -58 - (mood ? 8 : 0)]], 5); stroke([[436, -56 - (mood ? 8 : 0)], [466, -52]], 5);
  text('CAÇA-FURACÃO', -60, 46, { font: '800 30px "Baloo 2"', fill: PAL.hunterB });
  // asa do lado de cá + dois motores do lado de cá
  shape([[-120, 36], [180, 32], [150, 58], [-160, 60]], { fill: PAL.hunterW, lw: 6 });
  nacelle(170, 40, 130, 46, PAL.hunterW, t, { fire }); nacelle(-10, 38, 130, 46, PAL.hunterW, t);
  shape([[-410, -10], [-480, -18], [-540, 2], [-460, 8]], { fill: PAL.hunterW, lw: 5 });
  // sonda caindo da barriga
  if (sonde > 0) dropsonde(-40, 110 + sonde * 260, .8, { t, chute: sonde });
  pop();
}

// —— 7. FAROLETE: o avião-guia (quadrimotor de carga, asa alta, cauda levantada com rampa) ——
export function farolete(x, y, L = 900, { pitch = 0, t = 0, look = [.5, 0], beam = 0 } = {}) {
  push(); translate(x, y); rotate(pitch); scale(L / 1000);
  // fuselagem gorda com cauda levantada
  const F = spline([[-500, -96], [-300, -80], [300, -80], [400, -70], [470, -40], [496, 0], [480, 40], [400, 66], [-180, 70], [-340, 40], [-470, -40]]);
  shape(F, {
    fill: PAL.grey, lw: 8, shade: () => {
      fillOnly(rect(-600, 30, 1200, 60), PAL.greyS, { boil: .2 });
      fillOnly(spline([[-520, -40], [-200, -10], [500, -10], [500, 4], [-200, 4], [-520, -28]]), PAL.greyL, { boil: .2 });
    }
  });
  // carenagem do trem (bolha na barriga) e rampa traseira
  shape(spline([[-100, 60], [80, 58], [110, 78], [80, 92], [-110, 92], [-130, 76]]), { fill: PAL.greyS, lw: 6 });
  stroke([[-340, 40], [-470, -40]], 4, { line: '#4a525e' });
  // deriva
  shape([[-330, -84], [-430, -300], [-490, -300], [-500, -90]], { fill: PAL.grey, lw: 7, shade: () => fillOnly([[-360, -200], [-440, -300], [-520, -300], [-520, -200]], '#f2c230', { boil: .2 }) });
  shape([[-440, -96], [-520, -110], [-560, -96], [-470, -84]], { fill: PAL.grey, lw: 5 });
  // asa alta sobre a fuselagem + motores pendurados
  shape(ell(10, -86, 200, 22, 30), { fill: PAL.greyL, lw: 6 });   // carenagem da asa no teto
  nacelle(140, -126, 120, 44, PAL.greyL, t); nacelle(-30, -126, 120, 44, PAL.greyL, t);
  shape([[-170, -132], [190, -136], [214, -116], [-180, -112]], { fill: PAL.grey, lw: 6 });
  nacelle(176, -108, 130, 48, PAL.grey, t); nacelle(6, -108, 130, 48, PAL.grey, t);
  // cabine com olhos
  for (const [ex, ey] of [[404, -48], [440, -40]]) eye(ex, ey, 18, 16, { look, pupil: 4, skin: PAL.grey, lw: 4 });
  for (let k = 0; k < 4; k++) shape(ell(-260 + k * 90, -30, 8, 8, 10), { fill: PAL.win, lw: 3 });
  // farol de busca (feixe) — ele acha a saída
  shape(rr(300, 64, 40, 20, 6), { fill: '#fff1a8', lw: 4 });
  if (beam > 0) fillOnly([[340, 74], [900, 10 - beam * 40], [900, 160 + beam * 40]], `rgba(255,241,168,${.35 * beam})`, { boil: .5 });
  pop();
}

// —— 8. OBJETOS ——
// radar meteorológico do painel: verde/amarelo/vermelho; o avião é o triângulo embaixo
export function radar(x, y, r = 160, { t = 0, red = 1, offset = 0 } = {}) {
  push(); translate(x, y);
  shape(rr(-r - 30, -r - 40, 2 * r + 60, 2 * r + 80, 24), { fill: '#3a3f4a', lw: 7 });
  shape([[0, r * .9], ...arc(0, r * .9, r * 1.7, r * 1.7, -Math.PI * .78, -Math.PI * .22, 30)], {
    fill: PAL.radarBg, lw: 5, shade: () => {
      for (const k of [.4, .8, 1.2, 1.6]) stroke(arc(0, r * .9, r * k, r * k, -Math.PI * .78, -Math.PI * .22, 24), 2, { line: 'rgba(63,209,107,.35)' });
      const bx = offset * r * .6, by = -r * .1;
      fillOnly(ell(bx, by, r * .62, r * .44, 30), PAL.rGreen, { boil: .6 });
      fillOnly(ell(bx + 10, by + 6, r * .4, r * .28, 24), PAL.rYellow, { boil: .6 });
      if (red > 0) fillOnly(ell(bx + 18, by + 10, r * .22 * red, r * .15 * red, 20), PAL.rRed, { boil: .6 });
      if (red > .5) fillOnly(ell(bx + 22, by + 12, r * .08, r * .06, 12), PAL.rMag, { boil: .6 });
      const sw = -Math.PI * .78 + ((t * .5) % 1) * Math.PI * .56;
      stroke([[0, r * .9], [Math.cos(sw) * r * 1.7, r * .9 + Math.sin(sw) * r * 1.7]], 3, { line: 'rgba(125,255,176,.8)' });
    }
  });
  shape([[0, r * .74], [14, r * .9], [-14, r * .9]], { fill: '#ffffff', lw: 3 });
  text('WX RADAR', 0, r + 12, { font: '26px "VT323"', fill: '#7dffb0' });
  pop();
}
// sonda lançada (tubo com paraquedinha quadrado)
export function dropsonde(x, y, s = 1, { t = 0, chute = 1 } = {}) {
  push(); translate(x, y + Math.sin(t * 2) * 6); scale(s); rotate(Math.sin(t * 2.4) * .1);
  if (chute > 0) {
    push(); scale(chute);
    shape([[-60, -150], [60, -150], [70, -120], [-70, -120]], { fill: '#ff8a2a', lw: 5, shade: () => { fillOnly(rect(-20, -160, 40, 50), '#ffffff', { boil: .2 }); } });
    for (const sx of [-1, 1]) stroke([[sx * 66, -122], [sx * 8, -50]], 3);
    pop();
  }
  shape(rr(-14, -54, 28, 120, 8), { fill: '#d8dde2', lw: 5, shade: () => fillOnly(rect(-20, 30, 40, 40), '#8e99a5', { boil: .2 }) });
  dot(0, -20, 5, '#e8392b');
  for (const sx of [-1, 1]) stroke([[sx * 10, 66], [sx * 18, 86]], 4);
  pop();
}
// medidor de "G" (mostrador com agulha e faixa vermelha)
export function gMeter(x, y, r = 120, { g: gv = 1, t = 0 } = {}) {
  push(); translate(x, y);
  shape(ell(0, 0, r + 14, r + 14, 40), { fill: '#3a3f4a', lw: 7 });
  shape(ell(0, 0, r, r, 40), {
    fill: '#f4f1ea', lw: 5, shade: () => {
      const A = v => lerp(Math.PI * .8, Math.PI * 2.2, (v + 2) / 6);   // -2 … +4
      for (let v = -2; v <= 4; v++) { const a = A(v); stroke([[Math.cos(a) * r * .78, Math.sin(a) * r * .78], [Math.cos(a) * r * .94, Math.sin(a) * r * .94]], 4); text(String(v), Math.cos(a) * r * .62, Math.sin(a) * r * .62, { font: `800 ${r * .2}px "Baloo 2"`, fill: INK }); }
      for (const [v0, v1] of [[-2, -1], [2.5, 4]]) stroke(arc(0, 0, r * .86, r * .86, A(v0), A(v1), 16), 10, { line: '#e8392b' });
      const a = A(clamp(gv, -2, 4)); stroke([[0, 0], [Math.cos(a) * r * .82, Math.sin(a) * r * .82]], 7, { line: '#e8392b' });
    }
  });
  shape(ell(0, 0, 12, 12, 12), { fill: INK, lw: 3 });
  text('G', 0, r * .42, { font: `${r * .3}px "Titan One"`, fill: INK });
  pop();
}
// aviãozinho de treino de 1943 (monomotor amarelo, hélice na frente, cabine com bolha) — para o flashback/menção
export function trainer(x, y, L = 500, { t = 0 } = {}) {
  push(); translate(x, y); scale(L / 1000);
  shape(spline([[-480, -20], [-300, -50], [200, -60], [400, -50], [460, -10], [440, 30], [200, 50], [-300, 30]]), { fill: '#f2c230', lw: 8, shade: () => fillOnly(rect(-600, 10, 1200, 60), '#cf9f18', { boil: .2 }) });
  shape(spline([[-60, -54], [40, -110], [220, -110], [260, -58]]), { fill: '#7fd0e6', lw: 6, shade: () => { for (const xx of [40, 120, 200]) fillOnly(rect(xx, -120, 6, 70), '#3a3f4a', { boil: 0 }); } });
  shape([[-300, -48], [-420, -200], [-480, -200], [-470, -20]], { fill: '#f2c230', lw: 7 });
  shape([[-60, 30], [200, 26], [180, 60], [-80, 64]], { fill: '#f2c230', lw: 6 });
  shape(ell(470, -10, 20, 46, 16), { fill: '#3a3f4a', lw: 5 });
  prop(490, -10, 160, t, 7);
  stroke([[120, 50], [100, 130]], 8); shape(ell(100, 140, 26, 26, 14), { fill: '#2b2d33', lw: 5 });
  pop();
}
