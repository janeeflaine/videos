// story.js — versão curta: linha do tempo única (vozes → cenas → sons → música)
export const ORDER = ['01', '02', '03', '04', '05', '06'];
const GAPB = { '02': .05, '03': .08, '04': .06, '05': .1, '06': .12 };
export const LEAD = .12;
export function build(DUR, WORDS) {
  let t = .03; const VO = {};
  for (const id of ORDER) { if (id !== '01') t += GAPB[id]; VO[id] = t; t += DUR[id]; }
  const END = +(t + .55).toFixed(2);
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  function w(id, word, n = 0, end = false) {
    const L = WORDS[id] || [], k = norm(word); let c = 0;
    for (const x of L) if (norm(x.w).startsWith(k)) { if (c++ === n) return VO[id] + (end ? x.e : x.s); }
    console.warn('palavra não achada', id, word); return VO[id];
  }
  const S = {};
  ORDER.forEach((id, i) => { S[id] = i === 0 ? 0 : VO[id] - LEAD; });
  S['03'] = VO['03'] - .02;           // o campo continua sem corte
  S['04'] = VO['04'] - .05;
  const SC = ORDER.map((id, i) => [id, S[id], i + 1 < ORDER.length ? S[ORDER[i + 1]] : END]);
  return { VO, END, w, SC };
}
