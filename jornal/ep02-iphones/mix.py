# Mixagem do ep. 02: 17 falas (niveladas entre si) + trilha (ducking sob as falas) + efeitos sintetizados → mix.wav
import numpy as np, wave, json, subprocess, os
P = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(f'{P}/timeline.json'))
L = TL['lines']; SR = 44100; DUR = TL['dur']; N = int(SR * DUR)
st = lambda i: L[i]['t0']; en = lambda i: L[i]['t0'] + L[i]['dur']
def dec(f, tempo=1.0):  # Chicó e Zefinha entram 8% mais rápidos (atempo), como em timeline.py
    af = ['-af', f'atempo={tempo}'] if tempo != 1 else []
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, *af, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1e-9
# —— vozes: cada fala no seu lugar, todas no mesmo nível (o Lorenzo um tico acima, ele é o escandaloso) ——
voice = np.zeros(N); sp = np.zeros(N, bool); REF = .08
for l in L:
    x = dec(f"{P}/voices/{l['id']}.mp3", l.get('tempo', 1.0)); a = int(l['off'] * SR); x = x[a:a + int(l['dur'] * SR)]
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
def wordT(i, w, n=0):  # mesmo cálculo de main.js
    ws = [q for q in L[i]['words'] if w in q['w'].lower()]; return (ws[n] if len(ws) > n else (ws[0] if ws else L[i]['words'][0]))['s']
crash = en(8) + .08; land = crash + .4; fix = en(9) + .25
EV = {'close': st(1) - .3, 'closeEnd': st(3) - .05, 'pull': st(5) - .15, 'lant': wordT(5, 'lanterna'), 'radio': wordT(5, 'rádio'),
      'cobra': wordT(5, 'cobrinha'), 'bat': wordT(5, 'bateria'), 'secret': wordT(3, 'secretária') - .15, 'dream': wordT(4, 'mas') - .1,
      'onTable': wordT(8, 'esse') - .1, 'catUp': st(8) + 3.6, 'crash': crash, 'land': land, 'fix': fix, 'plim': fix + 1.75,
      'stand': wordT(15, 'senado') - .55, 'walkA': wordT(15, 'senado') - .1, 'walkB': st(16) - .4}
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
def flap(): return bp(noise(.09), 200, 1800) * envd(int(SR * .09), .003, .025) * 2
def tone(f, d, a=.003, dec=.12, sq=0.0):  # bipe (sq > 0 = mais "quadrado", de joguinho)
    n = int(SR * d); t = np.arange(n) / SR; s = np.sin(2 * np.pi * f * t)
    if sq: s = np.tanh(s * (1 + sq * 8)) * .8
    return s * envd(n, a, dec)
def boing(t0, g=.5):
    n = int(SR * .45); t = np.arange(n) / SR; f = 220 + 180 * np.sin(2 * np.pi * 6 * t) * np.exp(-t * 4) + t * 300
    put(np.sin(2 * np.pi * np.cumsum(f) / SR) * envd(n, .005, .15) * g, t0)
def click(g=1.0):  # estalinho de plástico
    n = int(SR * .04); return (bp(noise(.04), 1800, 7000) * envd(n, .0003, .006) * 2.2 + tone(2600, .04, .0003, .008) * .5) * g
def clack(t0, g=1.0):  # plástico batendo no chão
    put(bp(noise(.25), 400, 6000) * envd(int(SR * .25), .0006, .035) * 1.8 * g, t0)
    for j in range(3): put(click(.8), t0 + .03 + j * rng.uniform(.04, .09), g * rng.uniform(.5, 1))
def slap():  # chinelo
    return bp(noise(.06), 900, 4000) * envd(int(SR * .06), .0008, .012) * 2.4
def creak(t0):
    n = int(SR * .5); t = np.arange(n) / SR; f = 140 + 60 * np.sin(2 * np.pi * 3 * t)
    s = (2 * ((np.cumsum(f) / SR) % 1) - 1); put(bp(s, 300, 2500) * np.sin(np.linspace(0, np.pi, n)) * .5, t0)
def tick():
    n = int(SR * .03); return bp(noise(.03), 2500, 6000) * envd(n, .0003, .004) * 1.2
def whoosh(d):
    n = int(SR * d); x = bp(noise(d), 300, 2500); return x * np.sin(np.linspace(0, np.pi, n)) ** 2 * 1.5
def tling(t0, g=.5):  # brilhinho
    for j, f in enumerate([2093, 2637, 3136]): put(tone(f, .5, .002, .18), t0 + j * .06, g)
# jornal: abre, vira pro close, abaixa
put(rustle(.8), .4); put(rustle(.5), EV['close'] - .1, .8); put(rustle(.7), EV['closeEnd'] - .15)
# "Treze mil reais?!": o susto
boing(st(3) - .02, .45)
put(bp(noise(.12), 300, 3000) * envd(int(SR * .12), .002, .03) * 1.2, EV['secret'])  # pop do balão
tling(EV['dream'], .45)                                                                # estrelinha nos óculos da Zefinha
# o tijolão: tira do bolso, lanterna (clique), rádio (chiado), cobrinha (bipes), bateria (bipe cheio)
put(rustle(.35), EV['pull'], .7)
put(click(1.2), EV['lant'] - .05)
n = int(SR * .9); put(bp(noise(.9), 900, 5000) * (np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 7)) * .6 + .4) * np.sin(np.linspace(0, np.pi, n)) * .5, EV['radio'] - .05)
for j, f in enumerate([660, 660, 880, 660, 990, 880]): put(tone(f, .09, .001, .05, sq=1), EV['cobra'] + j * .11, .35)
put(tone(1320, .12, .001, .06, sq=1), EV['bat'] + .1, .3); put(tone(1760, .2, .001, .1, sq=1), EV['bat'] + .24, .3)
# Lorenzo bate as asas quando fala
for i in (6, 11, 16):
    for j in range(int(L[i]['dur'] / .16)): put(flap(), st(i) + j * .16, .7)
# o celular no pedestal, o gato, o tombo
put(click(.9), EV['onTable'] + .05)
for j in range(2): put(bp(noise(.05), 300, 2500) * envd(int(SR * .05), .001, .015) * 1.5, EV['catUp'] + .3 + j * .12, .7)  # patinhas na mesa
put(whoosh(.35), crash - .25, .6)
clack(land, 1.2); clack(land + .18, .7); clack(land + .35, .5)
for j in range(5): put(tick(), land + .6 + j * .5, .5)  # o silêncio depois do tombo: só o relógio
# o conserto: bateria (clique), tampa (clique), borrachinha (estalo) e o "plim" da tela acendendo
put(click(1.4), fix + .45); put(click(1.4), fix + 1.05)
n = int(SR * .18); tt = np.arange(n) / SR; put(np.sin(2 * np.pi * np.cumsum(180 + 400 * np.exp(-tt * 30)) / SR) * envd(n, .001, .05) * .6, fix + 1.55)
put(tone(1318, .16, .002, .1), EV['plim'], .5); put(tone(1760, .5, .002, .2), EV['plim'] + .13, .5)
# levanta e vai de chinelo pro quarto
creak(EV['stand'])
w = EV['walkA']
while w < EV['walkB']: put(slap(), w, .9); w += .3125
fx *= (REF * 10 ** (-6 / 20)) / rms(fx)
out = np.stack([voice + fx * .9 + mus[:, 0], voice + fx + mus[:, 1]], 1)
out /= max(1.0, np.max(np.abs(out)) / .95)
with wave.open(f'{P}/mix.wav', 'wb') as wv: wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((out * 32767).astype(np.int16).tobytes())
print('mix.wav', round(DUR, 2), 's')
