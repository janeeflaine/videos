"""Trilha original sintetizada → music/score.wav (48 kHz estéreo, duração do filme).
Lounge de aeroporto (vibrafone + baixo acústico + vassourinha), teremim desafinado na parede do olho, caixinha de música "filme antigo"
no flashback de 1943, pulso tenso no caso Hugo, pad calmo dentro do olho, reprise do lounge no final.
Os tempos das deixas vêm de events.json (exportado do story.js/main.js). Uso: python music/score.py (rode events.mjs antes)"""
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
E = json.load(open(os.path.join(ROOT, 'events.json'))); DUR = E['dur']
CUES = [e for e in E['ev'] if e['type'] == 'cue']
SR = 48000; N = int(DUR * SR)
rng = np.random.default_rng(23)

def tt(d): return np.arange(int(round(d * SR))) / SR
def mf(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * .45), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a=.005, r=.3):
    i = np.arange(n) / SR; return np.minimum(1, i / max(a, 1e-4)) * np.exp(-i / r)
out = np.zeros((N, 2))
def put(x, at, g=1., pan=0.):
    st = int(round(at * SR));
    if x.ndim == 1: x = np.stack([x * np.cos((pan + 1) * np.pi / 4) * 1.414, x * np.sin((pan + 1) * np.pi / 4) * 1.414], 1)
    if st < 0: x = x[-st:]; st = 0
    e = min(N, st + len(x))
    if e > st: out[st:e] += x[:e - st] * g

# —— instrumentos ——
def vibes(m, d=1.2):
    t = tt(d); f = mf(m); trem = 1 + .25 * np.sin(2 * np.pi * 5.5 * t)
    x = (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .08)) * env(len(t), .002, .7) * trem
    return x
def bass(m, d=.6):
    t = tt(d); f = mf(m); x = (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t) * np.exp(-t / .1)) * env(len(t), .01, .35)
    return lp(x, 900)
def brush(d=.25, g=1.):
    t = tt(d); return bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t / .06) * g
def kick():
    t = tt(.3); return np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t / .03)) / SR) * np.exp(-t / .12)
def snare():
    t = tt(.25); return bp(rng.standard_normal(len(t)), 1200, 6000) * np.exp(-t / .07) + np.sin(2 * np.pi * 190 * t) * np.exp(-t / .05) * .5
def musicbox(m, d=1.):
    t = tt(d); f = mf(m); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 3.01 * t)) * env(len(t), .001, .35)
def pad(ms, d):
    t = tt(d); x = sum(np.sin(2 * np.pi * mf(m) * t * (1 + .002 * k)) + .3 * np.sin(2 * np.pi * mf(m) * 2 * t) for k, m in enumerate(ms))
    a = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2); return lp(x, 2200) * a / len(ms)
def theremin(notes, d):
    # glissando contínuo entre notas + vibrato largo e "desafinado"
    t = tt(d); k = np.clip((t / d) * (len(notes) - 1), 0, len(notes) - 1.001); i = k.astype(int); u = k - i; u = u * u * (3 - 2 * u)
    m = np.array(notes)[i] * (1 - u) + np.array(notes)[i + 1] * u + .35 * np.sin(2 * np.pi * .23 * t)
    f = mf(m) * (1 + .018 * np.sin(2 * np.pi * 6.2 * t))
    ph = np.cumsum(f) / SR; x = np.sin(2 * np.pi * ph) + .15 * np.sin(4 * np.pi * ph)
    return lp(x, 1800) * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .6)

# —— deixas ——
CH = [(62, [62, 65, 69, 72]), (67, [65, 67, 71, 74]), (60, [64, 67, 71, 72]), (57, [61, 64, 67, 69])]   # Dm7 G7 Cmaj7 A7
def lounge(t0, t1, g=1.):
    bpm = 104; b = 60 / bpm; t = t0; k = 0
    while t < t1 - .05:
        root, ch = CH[(k // 4) % 4]; beat = k % 4
        put(bass(root - 12 + [0, 7, 12, 7][beat], b * .95), t, .55 * g, -.1)
        put(brush(.2, .5 if beat % 2 else .3), t, .25 * g, .3); put(brush(.12, .25), t + b * .66, .2 * g, .3)
        if beat in (0, 2): put(vibes(ch[(k // 2) % 4] + 12, 1.4), t + (b * .5 if beat == 2 else 0), .22 * g, -.3)
        if beat == 1: put(vibes(ch[2] + 12, .9), t + b * .66, .14 * g, .35)
        t += b; k += 1
def turb(t0, t1):
    d = t1 - t0; put(theremin([69, 74, 66, 72, 63, 70, 61, 68], d), t0, .26, .15)
    t = tt(d); drone = lp(np.sin(2 * np.pi * 41.2 * t) + .5 * np.sin(2 * np.pi * 61.7 * t), 200) * (.6 + .4 * np.sin(2 * np.pi * 3 * t)) * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5)
    put(drone, t0, .35)
    for k in range(int(d / .58)): put(bass(38 + [0, 1, 0, 3][k % 4], .5), t0 + k * .58, .45)
def sepia(t0, t1):
    mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 74, 71]; b = .32; t = t0; k = 0
    while t < t1 - .05:
        put(musicbox(mel[k % 16], .9), t, .2, .2 * np.sin(k));
        if k % 2 == 0: put(bass([48, 43][(k // 8) % 2], .4), t, .3)
        t += b; k += 1
    d = t1 - t0; put(lp(rng.standard_normal(len(tt(d))), 3000) * .03 * (rng.random(len(tt(d))) > .9995) * 30, t0, .2)   # estalos de vinil
def hunt(t0, t1):
    bpm = 120; b = 60 / bpm; t = t0; k = 0; sc = [45, 45, 48, 45, 50, 48, 43, 44]
    while t < t1 - .05:
        put(bass(sc[(k // 2) % 8], b * .45), t, .5); put(bass(sc[(k // 2) % 8], b * .4), t + b * .5, .35)
        if k % 4 == 0: put(kick(), t, .45)
        if k % 4 == 2: put(snare(), t, .25, .2)
        put(brush(.06, .4), t + b * .5, .12, -.3)
        if k % 8 == 0: put(pad([57, 60, 64], b * 8), t, .16)
        t += b; k += 1
def calm(t0, t1):
    d = t1 - t0; seq = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]; L = 3.2; t = t0; k = 0
    while t < t1 - .2:
        dd = min(L + 1.2, t1 - t); put(pad(seq[k % 4], dd), t, .3)
        for j in range(4): put(vibes(seq[k % 4][j] + 12, 1.6), t + j * .8, .12, (-1) ** j * .3)
        t += L; k += 1
def final(t0, t1):
    lounge(t0, t1 - 1.2, 1.)
    for m in (72, 76, 79, 84): put(vibes(m, 2.2), t1 - 1.4, .2)
    put(bass(36, 1.2), t1 - 1.4, .5)

FN = {'lounge': lounge, 'theremin': turb, 'sepia': sepia, 'hunt': hunt, 'calm': calm, 'final': final}
for c in CUES: FN[c['name']](c['t0'], c['t1'])
# reverb de sala curto
ir = rng.standard_normal(int(1.1 * SR)) * np.exp(-np.arange(int(1.1 * SR)) / SR / .28); ir[0] = 0
wet = np.stack([fftconvolve(out[:, c], ir * (1 + .1 * c))[:N] for c in range(2)], 1) * .025
mix = out + wet
# micro-fades nas emendas das deixas
for c in CUES[1:]:
    i = int(c['t0'] * SR); w = int(.05 * SR); mix[max(0, i - w):i] *= np.linspace(1, .4, min(w, i))[:, None]
mix /= np.abs(mix).max() + 1e-9; mix *= .8
os.makedirs(HERE, exist_ok=True); sf.write(os.path.join(HERE, 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', round(DUR, 2), 's,', len(CUES), 'deixas')
