# Linha do tempo do ep. 02: corta o silêncio de cada fala, posiciona as 17 falas no filme (pausas das gags)
# e calcula o envelope de boca (0..1, 24 por segundo) de cada uma → timeline.json (lido por main.js e mix.py)
import numpy as np, json, subprocess, os
P = os.path.dirname(os.path.abspath(__file__)); SR = 44100; FPS = 24
LINES = ['01-chico', '02-chico', '03-chico', '04-chico', '05-zefinha', '06-chico', '07-lorenzo', '08-chico', '09-chico',
         '10-chico', '11-chico', '12-lorenzo', '13-chico', '14-zefinha', '15-chico', '16-chico', '17-lorenzo']
# pausa ANTES de cada fala (s): abertura, corte pro close, volta pra sala, gags...
GAP = [1.6, .6, .35, .8, .25, .5, .4, .3, .8, 2.0, 2.6, .3, .35, .45, .35, .5, 2.0]
TAIL = 2.2
# as vozes do v4 saem pausadas: Chicó e Zefinha 8% mais rápidos (atempo, sem mudar o tom); o Lorenzo fica como está
TEMPO = {'chico': 1.08, 'zefinha': 1.08, 'lorenzo': 1.0}
def dec(f, tempo=1.0):
    af = ['-af', f'atempo={tempo}'] if tempo != 1 else []
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, *af, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
out, t = [], 0.0
for name, gap in zip(LINES, GAP):
    who = name.split('-')[1]; k = TEMPO[who]
    x = dec(f'{P}/voices/{name}.mp3', k)
    hop = SR // 100; fr = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(fr); on = np.where(db > db.max() - 38)[0]
    a = max(0, on[0] / 100 - .06); b = min(len(x) / SR, on[-1] / 100 + .18)
    t += gap
    seg = x[int(a * SR):int(b * SR)]; n = int(len(seg) / SR * FPS) + 1
    e = np.array([np.sqrt(np.mean(seg[int(i / FPS * SR):int((i + 1) / FPS * SR)] ** 2) + 1e-12) for i in range(n)])
    e = np.nan_to_num(e)  # o último quadro pode cair depois do fim do áudio
    e = np.clip((e / (np.percentile(e, 92) + 1e-9) - .1) / .9, 0, 1.15)
    w = json.load(open(f'{P}/words/{name}.json'))['words']
    words = [{'w': q['text'], 's': round(t + q['start'] / k - a, 3), 'e': round(t + q['end'] / k - a, 3)} for q in w]
    out.append({'id': name, 'who': who, 'tempo': k, 't0': round(t, 3), 'dur': round(b - a, 3), 'off': round(a, 3),
                'env': [round(float(v), 3) for v in e], 'words': words})
    t += b - a
DUR = round(t + TAIL, 2)
json.dump({'dur': DUR, 'fps': FPS, 'lines': out}, open(f'{P}/timeline.json', 'w'), ensure_ascii=False)
for L in out: print(f"{L['id']:12s} {L['t0']:7.2f} → {L['t0'] + L['dur']:7.2f}")
print('DUR', DUR)
