# Mixagem: narração + chamada + trilha (≥14 dB abaixo da voz, ducking 9 dB sob a fala) + efeitos sintetizados → mix.wav
import numpy as np, wave, json, subprocess, os
P = os.path.dirname(os.path.abspath(__file__)); SR = 44100; DUR = 107.5; N = int(SR * DUR); VO = 0.2; CTA = 102.0
def dec(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
voice = np.zeros(N)
nar = dec(f'{P}/voices/narracao.mp3'); i = int(VO * SR); voice[i:i + len(nar)] += nar[:N - i]
cta = dec(f'{P}/voices/cta.mp3'); i = int(CTA * SR); voice[i:i + len(cta)] += cta[:N - i]
with wave.open(f'{P}/music/score.wav') as w: mus = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float64) / 32767
mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
# trechos de fala (palavras) → envelope de ducking
sp = np.zeros(N, bool)
for w_ in json.load(open(f'{P}/words.json')):
    a, b = int((w_['s'] + VO - .1) * SR), int((w_['e'] + VO + .25) * SR); sp[max(0, a):b] = True
sp[int(CTA * SR):int((CTA + len(cta) / SR) * SR)] = True
duck = np.where(sp, 10 ** (-9 / 20), 1.0)
k = int(.12 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2))
vr = rms(voice[sp]); mr = rms(mus.mean(1))
mus *= (vr * 10 ** (-14 / 20)) / mr
mus *= duck[:, None]
# efeitos
rng = np.random.default_rng(3); fx = np.zeros(N)
def put(s, t0, g=1.0):
    i = int(t0 * SR); n = min(len(s), N - i); fx[i:i + n] += s[:n] * g
def lp(x, a):  # passa-baixa de 1 polo
    y = np.zeros_like(x); acc = 0.0
    for j in range(len(x)): acc += a * (x[j] - acc); y[j] = acc
    return y
def noise(d): return rng.standard_normal(int(SR * d))
def envd(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
thunder = lp(noise(2.5), .02) * envd(int(SR * 2.5), .02, .7) * 6
crack = noise(.15) * envd(int(SR * .15), .001, .03) * .6
for t0 in [1.4, 4.8, 29.9, 32.9, 36.5]: put(crack, t0, .5); put(thunder, t0 + .05, .55)
pop_ = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 200, int(SR * .18))) / SR) * envd(int(SR * .18), .001, .05); put(pop_, 14.45, .6); put(crack, 14.45, .6)
def whoosh(d, f0, f1):
    n = int(SR * d); x = noise(d); a = np.linspace(f0, f1, n) / SR * 2 * np.pi
    y = lp(x, .08) - lp(x, .01); return y * np.sin(np.linspace(0, np.pi, n)) * 3
for t0, d in [(41.5, .8), (43.8, 1.2), (54.7, 1.4), (77.0, 1.0)]: put(whoosh(d, 300, 1200), t0, .5)
rew = np.sin(2 * np.pi * np.cumsum(1200 + 400 * np.sin(np.linspace(0, 40, int(SR * 1.2)))) / SR) * .08; put(rew, 56.0, .6)
clic = noise(.03) * envd(int(SR * .03), .0005, .006); put(clic, 81.6, .9)
for kk in range(6):
    t = np.arange(int(SR * .3)) / SR; clank = (np.sin(2 * np.pi * 520 * t) + .6 * np.sin(2 * np.pi * 1340 * t)) * np.exp(-t / .06) * .25
    put(clank + crack[:len(clank)] * 0 if False else clank, 37.5 + kk * .5 + VO, .7)
fx *= (vr * 10 ** (-10 / 20)) / (rms(fx) or 1)
out = np.stack([voice + fx * .9 + mus[:, 0], voice + fx * 1.0 + mus[:, 1]], 1)
out /= max(1.0, np.max(np.abs(out)) / .95)
with wave.open(f'{P}/mix.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('mix.wav', 'música vs voz (dB, sem ducking):', -14)
