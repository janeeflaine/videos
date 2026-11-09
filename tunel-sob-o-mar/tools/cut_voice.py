# Corta a narração única em falas, encurta pausas internas, acelera (atempo, sem mudar o tom)
# e grava voices/<id>.wav (48 kHz mono) + voices/dur.json. Rodar com o python do $LIB/.venv.
import json, subprocess, os
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)) + '/../voices'
SRC, TEMPO, MAXP, KEEP = D + "/narracao.mp3", 1.05, .32, .26
W = json.load(open(D + '/words_raw.json'))
starts = {'01': 'Trinta', '02': 'A cada', '03': 'Essa', '04': 'máquina', '05': 'Pressão de', '06': 'E a terra', '07': 'Enquanto',
          '08': 'E para', '09': 'E onde', '10a': 'Então', '10b': 'Mentira', '11': 'Ou seja', '12': 'Se você'}
seq = [w['w'] for w in W]
def find(phrase, after):
    p = phrase.split()
    for i in range(after, len(seq)):
        if all(seq[i + k].strip(',.?!').lower().startswith(p[k].lower()) for k in range(len(p))): return i
    raise SystemExit('não achei ' + phrase)
idx, a = {}, 0
for k, ph in starts.items(): a = find(ph, a); idx[k] = a; a += 1
keys = list(starts)
tmp = D + '/.full.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ar', '48000', '-ac', '1', tmp], check=True)
x, sr = sf.read(tmp); os.remove(tmp)
def squeeze(y):
    hop = int(sr * .01); n = len(y) // hop
    rms = np.array([np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms); thr = db.max() - 32
    quiet = db < thr; out = []; i = 0; last = 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            L = (j - i) * hop / sr
            if L > MAXP and i > 0 and j < n:
                a0 = i * hop; cut = int((L - KEEP) * sr); mid = a0 + int(KEEP / 2 * sr)
                out.append(y[last:mid]); last = mid + cut
            i = j
        else: i += 1
    out.append(y[last:])
    f = int(sr * .008)   # micro-crossfade nas emendas
    res = out[0]
    for seg in out[1:]:
        if len(res) > f and len(seg) > f:
            r = np.linspace(1, 0, f); res = np.concatenate([res[:-f], res[-f:] * r + seg[:f] * (1 - r), seg[f:]])
        else: res = np.concatenate([res, seg])
    return res
out = {}
for n, k in enumerate(keys):
    i0 = idx[k]; i1 = idx[keys[n + 1]] - 1 if n + 1 < len(keys) else find('sô', i0)
    t0 = max(0, W[i0]['s'] - (.3 if k == '04' else .08)); t1 = W[i1]['e'] + .22
    if n + 1 < len(keys): t1 = min(t1, W[idx[keys[n + 1]]]['s'] - (.32 if keys[n + 1] == '04' else .04))
    y = squeeze(x[int(t0 * sr):int(t1 * sr)])
    p = f'{D}/.{k}.wav'; sf.write(p, y, sr)
    o = f'{D}/{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-af', f'atempo={TEMPO},afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse', '-ar', '48000', o], check=True)
    os.remove(p)
    d = sf.info(o).duration; out[k] = round(d, 3); print(k, f'{t0:.2f}-{t1:.2f}', round(d, 2))
# falas gravadas à parte (voices/<id>_src.mp3): mesmo tratamento, aparando silêncio nas pontas
for k in ['11b']:
    src = f'{D}/{k}_src.mp3'
    if not os.path.exists(src): continue
    p = f'{D}/.{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', str(sr), '-ac', '1', p], check=True)
    y, _ = sf.read(p); os.remove(p)
    env = np.abs(y) > np.abs(y).max() * .02; i0 = max(0, np.argmax(env) - int(.06 * sr)); i1 = min(len(y), len(y) - np.argmax(env[::-1]) + int(.2 * sr))
    y = squeeze(y[i0:i1]); sf.write(p, y, sr); o = f'{D}/{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-af', f'atempo={TEMPO},afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse', '-ar', '48000', o], check=True)
    os.remove(p); d = sf.info(o).duration; out[k] = round(d, 3); print(k, 'avulsa', round(d, 2))
json.dump(out, open(D + '/dur.json', 'w'), indent=1)
print('total fala', round(sum(out.values()), 2))
