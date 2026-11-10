# Trilha sintetizada (sem samples): forrozinho de sala — zabumba, triângulo, baixo e sanfona.
# Lê ../timeline.json para cortar no lugar certo. Saída: music/score.wav (44,1 kHz, estéreo).
import numpy as np, wave, os, json
P = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(f'{P}/../timeline.json'))
L = TL['lines']; SR = 44100; DUR = TL['dur']; N = int(SR * DUR)
st = lambda i: L[i]['t0']; en = lambda i: L[i]['t0'] + L[i]['dur']
BPM = 112; B = 60 / BPM
OUT = np.zeros((N, 2)); rng = np.random.default_rng(11)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    OUT[i:i + n, 0] += sig[:n] * g * (1 - pan) * .7; OUT[i:i + n, 1] += sig[:n] * g * (1 + pan) * .7
def env(n, a=.005, d=.3): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def zabumba(hi=False):
    n = int(SR * .35); t = np.arange(n) / SR; f = (70 if not hi else 110) * (1 + 1.2 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .14 if not hi else .06)
    return s + rng.standard_normal(n) * env(n, .001, .01) * .2
def triangulo(open_=False, g=.08):
    n = int(SR * (.5 if open_ else .07)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(5200, 1), (7400, .6), (9300, .35)])
    return s * env(n, .0005, .25 if open_ else .025) * g
def bass(m, d):
    n = int(SR * d); t = np.arange(n) / SR; f = midi(m)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * env(n, .008, .35) * .5
def sanfona(m, d, g=.09, vib=True):
    n = int(SR * d); t = np.arange(n) / SR; f = midi(m) * np.ones(n) * (1 + (.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .2) if vib else 0))
    out = 0
    for det in (1, 1.004, .996):  # palhetas levemente desafinadas = sanfona
        ph = np.cumsum(f * det) / SR; out = out + (2 * (ph % 1) - 1) * .5 + np.sign(np.sin(2 * np.pi * ph)) * .25
    out = np.convolve(out, np.ones(9) / 9, 'same')
    a = np.minimum(1, t / .03) * np.minimum(1, (d - t) / .05).clip(0)
    return out * a * g
# acordes (Sol maior, levada de baião): G D7 G C / G D7 G G
PROG = [(43, [55, 59, 62]), (38, [54, 57, 60]), (43, [55, 59, 62]), (36, [52, 55, 60])]
MEL = [67, 71, 74, 72, 71, 69, 67, 69, 71, 72, 74, 76, 74, 72, 71, 67]
CUT = [(en(9) + .05, en(10) + .05)]          # silêncio: a xícara cai, ele grita
SOFT = (L[1]['t0'] - .3, en(2) + 1.7)        # leitura do jornal: só baixo e triângulo, bem leve
GRUMP = (en(14) - .2, st(15) - .3)            # mau humor: sanfona arrastada, descendo
def cut(t): return any(a <= t < b for a, b in CUT)
t, bar = 0.0, 0
while t < st(15) - .3:
    root, ch = PROG[bar % 4]
    for k in range(4):  # semínimas
        tb = t + k * B
        if cut(tb) or GRUMP[0] <= tb: continue
        soft = SOFT[0] <= tb < SOFT[1]
        if k in (0, 2): add(bass(root if k == 0 else root + 7, B * .9), tb, -.1, .6 if soft else 1)
        if not soft:
            add(zabumba(), tb, -.05, .6 if k in (0, 2) else 0); add(zabumba(True), tb + B * .5, .05, .35) if k in (1, 3) else None
        for e8 in range(4):  # triângulo em semicolcheias, acento no contratempo
            add(triangulo(e8 == 2), tb + e8 * B / 4, .45, .5 if soft else 1)
        if not soft and k in (1, 3): [add(sanfona(m, B * .45, .05, False), tb + B * .5, .2) for m in ch]
    if not (SOFT[0] <= t < SOFT[1]) and not cut(t) and t < GRUMP[0] and bar % 2 == 0:
        for j in range(8): add(sanfona(MEL[(bar * 4 + j) % 16], B * .48, .08), t + j * B / 2, -.25)
    t += 4 * B; bar += 1
# mau humor: sanfona descendo devagar + passos do baixo
for j, m in enumerate([67, 66, 64, 62, 59, 55]): add(sanfona(m, .9, .085), GRUMP[0] + j * .62, -.2)
for j in range(10): add(bass(43 - (j % 2) * 5, .3), GRUMP[0] + j * .31, -.1, .7)
# chamada: fanfarra de sanfona + rufo de triângulo
for m in [55, 59, 62, 67, 71]: add(sanfona(m, 2.6, .07), st(15) + .05, 0)
for j in range(14): add(triangulo(j == 13), st(15) + .05 + j * .07, .4, 1.2)
OUT /= np.max(np.abs(OUT)) or 1
with wave.open(f'{P}/score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((OUT * .8 * 32767).astype(np.int16).tobytes())
print(f'{P}/score.wav')
