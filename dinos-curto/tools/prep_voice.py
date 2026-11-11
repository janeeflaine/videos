# voices/src/<id>.mp3 → voices/<id>.wav (48 kHz mono): apara as pontas, encurta pausas longas, acelera o narrador (atempo,
# sem mudar o tom) e grava voices/dur.json + voices/env.json (envelope de boca a 24 Hz: abertura e largura, para o lip-sync).
import json, subprocess, os, sys
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lines import LINES
D = os.path.dirname(os.path.abspath(__file__)) + '/../voices'
TEMPO = {'N': 1.17, 'NOE': 1.0, 'REX': 1.08}
MAXP = {'N': .26, 'NOE': .55, 'REX': .3}
SR = 48000
def squeeze(y, maxp, keep):
    hop = int(SR * .01); n = len(y) // hop
    rms = np.array([np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms); quiet = db < db.max() - 34
    out = []; i = 0; last = 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            L = (j - i) * hop / SR
            if L > maxp and i > 0 and j < n:
                a0 = i * hop; cut = int((L - keep) * SR); mid = a0 + int(keep / 2 * SR); out.append(y[last:mid]); last = mid + cut
            i = j
        else: i += 1
    out.append(y[last:]); f = int(SR * .008); res = out[0]
    for s_ in out[1:]:
        if len(res) > f and len(s_) > f: r = np.linspace(1, 0, f); res = np.concatenate([res[:-f], res[-f:] * r + s_[:f] * (1 - r), s_[f:]])
        else: res = np.concatenate([res, s_])
    return res
dur, env = {}, {}
for k, (who, _) in LINES.items():
    tmp = f'{D}/.{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/src/{k}.mp3', '-ar', str(SR), '-ac', '1', tmp], check=True)
    y, _ = sf.read(tmp)
    a = np.abs(y) > np.abs(y).max() * .03; i0 = max(0, np.argmax(a) - int(.05 * SR)); i1 = min(len(y), len(y) - np.argmax(a[::-1]) + int(.18 * SR))
    y = squeeze(y[i0:i1], MAXP[who], MAXP[who] * .75); sf.write(tmp, y, SR)
    o = f'{D}/{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'atempo={TEMPO[who]},afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse', '-ar', str(SR), o], check=True)
    os.remove(tmp)
    y, _ = sf.read(o); dur[k] = round(len(y) / SR, 3)
    # envelope de boca: RMS (abertura) e centróide (largo × redondo) a 24 Hz
    hop = SR // 24; n = len(y) // hop + 1; op, wd = [], []
    for i in range(n):
        fr = y[i * hop:i * hop + hop * 2]
        if len(fr) < 64: op.append(0); wd.append(.5); continue
        r = np.sqrt(np.mean(fr ** 2)); sp = np.abs(np.fft.rfft(fr * np.hanning(len(fr)))); fq = np.fft.rfftfreq(len(fr), 1 / SR)
        op.append(r); wd.append(float((sp * fq).sum() / (sp.sum() + 1e-9)))
    op = np.array(op); op = np.clip((20 * np.log10(op / (op.max() + 1e-9) + 1e-6) + 32) / 32, 0, 1) ** 1.3
    wd = np.clip((np.array(wd) - 900) / 2200, 0, 1)
    env[k] = {'who': who, 'o': [round(float(v), 2) for v in op], 'w': [round(float(v), 2) for v in wd]}
    print(k, who, dur[k])
json.dump(dur, open(D + '/dur.json', 'w'), indent=1); json.dump(env, open(D + '/env.json', 'w'))
print('total fala', round(sum(dur.values()), 2))
