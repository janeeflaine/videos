// Prévia do ep. 02 para aprovação: index.html?previa=ep02-iphones (sala) · &close (o jornal) · &fone (o celular velho)
import { INK, init, frame, g, shape, rr, text, push, pop, translate, scale } from '../toon.js';
import { sala, chico, zefinha, gatoEmPe, papagaio, poleiro, poltrona, mesinha, garrafa, xicara, jornalClose, celularVelho, hand, PAL } from '../cast.js';
import { NEWS } from './news.js';

init(document.getElementById('c'));
const q = new URLSearchParams(location.search);
function tag(str, y) {
  g.save(); g.font = '800 34px "Baloo 2"'; const w = g.measureText(str).width + 60; g.restore();
  shape(rr(540 - w / 2, y - 30, w, 60, 30), { fill: '#2a2140', lw: 6 });
  text(str, 540, y, { font: '800 34px "Baloo 2"', fill: '#ffd23f' });
}
window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#5a3d2e'; g.fillRect(0, 0, 1080, 1920);
  if (q.has('close')) { push(); translate(540, 960); scale(q.has('selo') ? 1.3 : 1); translate(-540, q.has('selo') ? -1130 + 960 - 960 : -960); jornalClose({ t, ...NEWS }); pop(); return; }
  if (q.has('fone')) {
    g.fillStyle = '#a8dccf'; g.fillRect(0, 0, 1080, 1920);
    celularVelho({ x: 300, y: 560, s: 1.5, t, lit: 0 }); text('desligado', 300, 900, { font: '800 40px "Baloo 2"', fill: INK });
    celularVelho({ x: 780, y: 560, s: 1.5, t, lit: 1, ring: 1 }); text('tocando (Lorenzo)', 780, 900, { font: '800 40px "Baloo 2"', fill: INK });
    celularVelho({ x: 540, y: 1300, s: 1.5, t, parts: .55 }); text('o tombo: tampa, bateria e borrachinha', 540, 1720, { font: '800 40px "Baloo 2"', fill: INK });
    tag('ep. 02 · o celular do Seu Chicó · prévia', 90); return;
  }
  sala({ t }, { kitchen: () => zefinha({ x: 760, y: 1302, s: .66, t, cross: true, armL: { h: [-20, 200], bend: -10 }, look: [-.6, .1], lid: .45, brow: .4, mouth: { o: .15, sm: .2 } }) });
  poleiro({ x: 160, y: 1430, s: 1, h: 420 });
  papagaio({ x: 150, y: 996, s: .7, t, beak: .8, wing: .8, look: [.6, .3] });
  mesinha({ x: 860, y: 1770, s: .9 });
  garrafa({ x: 826, y: 1472, s: .55 });
  xicara({ x: 912, y: 1470, s: .6, t });
  poltrona({ x: 400, y: 1820, s: .95 });
  chico({ x: 400, y: 1800, s: .95, t, sit: true, look: [.5, -.3], lid: .3, brow: .4, mouth: { o: .45, sm: .9 },
    armL: { h: [-30, 220], bend: -20 }, armR: { e: [80, 170], h: [110, 40], fist: true },
    holdR: (hp) => { celularVelho({ x: hp[0] + 2, y: hp[1] - 70, s: .5, t, lit: 1 }); hand(hp[0], hp[1] + 4, -1.4, 22, PAL.cSkin, { fist: true }); } });
  gatoEmPe({ x: 1012, y: 1792, s: .75, t, face: -1, look: [.8, .5], lid: .1 });
  tag('ep. 02 · "Dura mais que mandato" · prévia', 120);
};
await document.fonts.load('92px "Titan One"'); await document.fonts.load('800 38px "Baloo 2"'); await document.fonts.load('64px "Bungee"');
window.READY = true;
