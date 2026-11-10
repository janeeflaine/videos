# Mixagem: 16 falas (niveladas entre si) + trilha (ducking sob as falas) + efeitos sintetizados → mix.wav
import numpy as np, wave, json, subprocess, os
P = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(f'{P}/timeline.json'))
L = TL['lines']; SR = 44100; DUR = TL['dur']; N = int(SR * DUR)
st = lambda i: L[i]['t0']; en = lambda i: L[i]['t0'] + L[i]['dur']
def dec(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1e-9
# —— vozes: cada fala no seu lugar, todas no mesmo nível (o Lorenzo um tico acima, ele é o escandaloso) ——
voice = np.zeros(N); sp = np.zeros(N, bool); REF = .08
for l in L:
    x = dec(f"{P}/voices/{l['id']}.mp3"); a = int(l['off'] * SR); x = x[a:a + int(l['dur'] * SR)]
    fade = int(.02 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    x *= REF * (1.12 if l['who'] == 'lorenzo' else 1) / rms(x)
    i = int(l['t0'] * SR); n = min(len(x), N - i); voice[i:i + n] += x[:n]; sp[i:i + n] = True
# —— trilha com ducking ——
with wave.open(f'{P}/music/score.wav') as w: mus = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float64) / 32767
mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
duck = np.where(sp, 10 ** (-9 / 20), 1.0); k = int(.15 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')
mus *= (REF * 10 ** (-13 / 20)) / rms(mus.mean(1)); mus *= duck[:, None]
# —— efeitos ——
rng = np.random.default_rng(5); fx = np.zeros(N)
EV = {'close': st(1) - .3, 'closeEnd': en(2) + 1.7, 'throwA': en(6) - .15, 'throwB': en(6) + .55, 'catJump': st(9) + 2.4,
      'crash': en(9) + .12, 'stand': en(14) + .35, 'walkA': en(14) + .8, 'walkB': st(15) - .5, 'unveil': st(11) - .1}
def put(s, t0, g=1.0):
    i = int(t0 * SR); n = min(len(s), N - i)
    if n > 0 and i >= 0: fx[i:i + n] += s[:n] * g
def envd(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def bp(x, lo, hi):  # passa-faixa simples por FFT
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def noise(d): return rng.standard_normal(int(SR * d))
def rustle(d=.6):  # jornal farfalhando
    n = int(SR * d); x = bp(noise(d), 1500, 7000); am = np.abs(np.convolve(rng.standard_normal(n), np.ones(300) / 300, 'same')) * 4
    return x * am * np.sin(np.linspace(0, np.pi, n)) ** .5
def whoosh(d):
    n = int(SR * d); x = bp(noise(d), 300, 2500); return x * np.sin(np.linspace(0, np.pi, n)) ** 2 * 1.5
def flap(): return bp(noise(.09), 200, 1800) * envd(int(SR * .09), .003, .025) * 2
def boing(t0):
    n = int(SR * .45); t = np.arange(n) / SR; f = 220 + 180 * np.sin(2 * np.pi * 6 * t) * np.exp(-t * 4) + t * 300
    put(np.sin(2 * np.pi * np.cumsum(f) / SR) * envd(n, .005, .15) * .5, t0)
def clink(g=1.0):  # louça
    n = int(SR * .5); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in [(2350, .09), (3870, .06), (5120, .05), (6900, .03)])
    return (s * .3 + bp(noise(.5), 2000, 9000) * envd(n, .0005, .03)) * g
def smash(t0):
    put(bp(noise(.6), 800, 9000) * envd(int(SR * .6), .0008, .09) * 1.6, t0)
    for j in range(7): put(clink(.6), t0 + .02 + j * rng.uniform(.03, .08) + j * .02, rng.uniform(.4, 1))
def slap():  # chinelo
    return bp(noise(.06), 900, 4000) * envd(int(SR * .06), .0008, .012) * 2.4
def creak(t0):
    n = int(SR * .5); t = np.arange(n) / SR; f = 140 + 60 * np.sin(2 * np.pi * 3 * t)
    s = (2 * ((np.cumsum(f) / SR) % 1) - 1); put(bp(s, 300, 2500) * np.sin(np.linspace(0, np.pi, n)) * .5, t0)
def tick():
    n = int(SR * .03); return bp(noise(.03), 2500, 6000) * envd(n, .0003, .004) * 1.2
put(rustle(.8), .5); put(rustle(.5), EV['close'] - .1, .8); put(rustle(.7), EV['closeEnd'] - .1)
put(whoosh(.7), EV['throwA'], .8); put(rustle(.25), EV['throwB'] - .05, .6)
for i in (5, 11, 15):
    for j in range(int(L[i]['dur'] / .16)): put(flap(), st(i) + j * .16, .7)
put(rustle(.35), EV['unveil'], .6)
boing(EV['catJump'])
put(clink(.5), EV['crash'] - .02, .6); smash(EV['crash'] + .38)
for j in range(4): put(tick(), en(9) + .9 + j * .5, .5)  # o silêncio depois do tombo: só o relógio
creak(EV['stand'])
w = EV['walkA']
while w < EV['walkB']: put(slap(), w, .9); w += .3125
fx *= (REF * 10 ** (-6 / 20)) / rms(fx)
out = np.stack([voice + fx * .9 + mus[:, 0], voice + fx + mus[:, 1]], 1)
out /= max(1.0, np.max(np.abs(out)) / .95)
with wave.open(f'{P}/mix.wav', 'wb') as wv: wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((out * 32767).astype(np.int16).tobytes())
print('mix.wav', round(DUR, 2), 's')
