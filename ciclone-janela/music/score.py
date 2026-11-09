# Trilha sintetizada (sem samples): lounge de sitcom — baixo walking, vibrafone, escovinha, theremin nas rajadas.
# Saída: music/score.wav (44,1 kHz, estéreo). Cortes de silêncio nas piadas (tempos do filme).
import numpy as np, wave, os
SR = 44100; DUR = 107.5; BPM = 104; BEAT = 60 / BPM
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    L[i:i + n] += sig[:n] * g * (1 - pan) * .7; R[i:i + n] += sig[:n] * g * (1 + pan) * .7
def env(n, a=.005, d=.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def bass(m, dur):
    n = int(SR * dur); t = np.arange(n) / SR; f = midi(m)
    s = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .1 * np.sin(6 * np.pi * f * t)
    return s * env(n, .01, .45) * .55
def vib(m, dur=1.6):
    n = int(SR * dur); t = np.arange(n) / SR; f = midi(m)
    trem = 1 + .25 * np.sin(2 * np.pi * 5.5 * t)
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .05)
    return s * env(n, .002, .7) * trem * .18
def brush(dur=.18, g=.12):
    n = int(SR * dur); s = rng.standard_normal(n); s = np.convolve(s, np.ones(6) / 6, 'same')
    return s * env(n, .01, .06) * g
def kick():
    n = int(SR * .25); t = np.arange(n) / SR; f = 90 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .09) * .5
def theremin(m0, m1, t0, dur, g=.12):
    n = int(SR * dur); t = np.arange(n) / SR
    m = np.interp(t, [0, .25, dur], [m0, m1, m1]); f = midi(m) * (1 + .012 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / .3))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .2 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    e = np.minimum(1, t / .15) * np.minimum(1, (dur - t) / .4)
    add(s * e * g, t0, .3)
# progressão (ii-V-I-vi em Ré menor/Fá): Dm7 G7 Cmaj7 A7
CH = [([50, 53, 57, 60], [38, 41, 45, 43]), ([55, 59, 62, 65], [43, 47, 50, 49]), ([48, 52, 55, 59], [36, 40, 43, 45]), ([57, 61, 64, 67], [45, 49, 52, 44])]
# silêncios (piada / pausa morta), em tempo do filme
CUTS = [(14.4, 15.6), (54.75, 55.8), (73.4, 74.4), (76.95, 77.3)]
def muted(t): return any(a <= t < b for a, b in CUTS)
t = 0.0; bar = 0
while t < DUR - 1.5:
    vox, bl = CH[bar % 4]
    for k in range(4):
        tb = t + k * BEAT
        if muted(tb): continue
        add(bass(bl[k], BEAT * .95), tb, -.1)
        add(brush(), tb + BEAT * .5, .4, .8); add(brush(.12, .08), tb + BEAT * .83, .4)
        if k in (0, 2): add(kick(), tb, 0, .7)
    if not muted(t): [add(vib(m), t + BEAT * 1.5 * (i % 2), .2 * (i - 1.5)) for i, m in enumerate(vox)]
    t += 4 * BEAT; bar += 1
# tempestade s4/s5 (mais tensão): theremin uivando nas rajadas
for t0, m0, m1 in [(0.6, 62, 69), (29.9, 57, 64), (33.1, 64, 70), (43.8, 60, 67), (47.5, 62, 69), (77.1, 70, 63), (91.6, 62, 66)]:
    theremin(m0, m1, t0, 2.2)
# final: acorde de fanfarra no "Curioso Soh"
for m in [50, 57, 62, 65, 69]: add(vib(m, 3.5) * 1.6, 102.0, 0)
mx = np.max(np.abs(np.stack([L, R]))) or 1; out = (np.stack([L, R], 1) / mx * .8 * 32767).astype(np.int16)
p = os.path.join(os.path.dirname(__file__), 'score.wav')
with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print(p)
