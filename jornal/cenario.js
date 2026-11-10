// Cenário fixo da série (quadro de abertura) e o close do jornal — 1080×1920
// index.html?cenario → sala com todo o elenco no lugar; index.html?cenario&close → close em primeira pessoa
import { INK, init, frame, g, shape, rr, text } from './toon.js';
import { sala, chico, zefinha, gato, papagaio, poleiro, poltrona, mesinha, garrafa, xicara, jornalClose, PAL } from './cast.js';

init(document.getElementById('c'));
const close = new URLSearchParams(location.search).has('close');
function tag(str, y) {
  g.save(); g.font = '800 34px "Baloo 2"'; const w = g.measureText(str).width + 60; g.restore();
  shape(rr(540 - w / 2, y - 30, w, 60, 30), { fill: '#2a2140', lw: 6 });
  text(str, 540, y, { font: '800 34px "Baloo 2"', fill: '#ffd23f' });
}

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#3a2f2a'; g.fillRect(0, 0, 1080, 1920);
  if (close) {
    jornalClose({ t });
    tag('close em 1ª pessoa · prévia', 90);
    return;
  }
  sala({ t }, { kitchen: () => zefinha({ x: 760, y: 1302, s: .66, t, spoon: true, armR: { e: [58, 74], h: [112, -36], spoonA: 1.3, spoonL: .55 }, armL: { h: [-20, 200], bend: -10 }, look: [.5, 0], lid: .35, brow: .3 }) });
  poleiro({ x: 160, y: 1430, s: 1, h: 420 });
  papagaio({ x: 150, y: 996, s: .7, t, look: [.6, .3] });
  mesinha({ x: 860, y: 1770, s: .9 });
  garrafa({ x: 826, y: 1472, s: .55 });
  xicara({ x: 912, y: 1470, s: .6, t });
  poltrona({ x: 400, y: 1820, s: .9 });
  chico({ x: 400, y: 1800, s: .95, t, sit: true, paper: {}, look: [0, .1], lid: .3, brow: .3, mouth: { o: .25, sm: .8 } });
  gato({ x: 690, y: 1872, s: .58, t, arch: .2, look: [.7, -.8] });
  tag('cenário · sala com a cozinha ao fundo · 18h10', 120);
};
await document.fonts.load('92px "Titan One"'); await document.fonts.load('800 38px "Baloo 2"'); await document.fonts.load('78px "Bungee"');
window.READY = true;
