# Linha do tempo do episódio: corta o silêncio de cada fala, posiciona as 16 falas no filme (pausas das gags)
# e calcula o envelope de boca (0..1, 24 por segundo) de cada uma → timeline.json (lido por main.js e mix.py)
import numpy as np, json, subprocess, os
P = os.path.dirname(os.path.abspath(__file__)); SR = 44100; FPS = 24
LINES = ['01-chico', '02-chico', '03-chico', '04-chico', '05-zefinha', '06-lorenzo', '07-chico', '08-chico',
         '09-zefinha', '10-chico', '11-chico', '12-lorenzo', '13-chico', '14-zefinha', '15-chico', '16-lorenzo']
# pausa ANTES de cada fala (s): abertura, corte pro close, volta pra sala, gags...
GAP = [2.0, .7, .35, .9, .2, .35, .2, 1.3, .4, .5, .75, .15, .6, .45, .5, 3.4]
TAIL = 2.4
def dec(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
out, t = [], 0.0
for name, gap in zip(LINES, GAP):
    x = dec(f'{P}/voices/{name}.mp3')
    hop = SR // 100; fr = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(fr); on = np.where(db > db.max() - 38)[0]
    a = max(0, on[0] / 100 - .06); b = min(len(x) / SR, on[-1] / 100 + .18)
    t += gap
    seg = x[int(a * SR):int(b * SR)]; n = int(len(seg) / SR * FPS) + 1
    e = np.array([np.sqrt(np.mean(seg[int(i / FPS * SR):int((i + 1) / FPS * SR)] ** 2) + 1e-12) for i in range(n)])
    e = np.clip((e / (np.percentile(e, 92) + 1e-9) - .1) / .9, 0, 1.15)
    w = json.load(open(f'{P}/words/{name}.json'))['words']
    words = [{'w': q['text'], 's': round(t + q['start'] - a, 3), 'e': round(t + q['end'] - a, 3)} for q in w]
    out.append({'id': name, 'who': name.split('-')[1], 't0': round(t, 3), 'dur': round(b - a, 3), 'off': round(a, 3),
                'env': [round(float(v), 3) for v in e], 'words': words})
    t += b - a
DUR = round(t + TAIL, 2)
json.dump({'dur': DUR, 'fps': FPS, 'lines': out}, open(f'{P}/timeline.json', 'w'), ensure_ascii=False)
for L in out: print(f"{L['id']:12s} {L['t0']:7.2f} → {L['t0'] + L['dur']:7.2f}")
print('DUR', DUR)
