"""Original score synthesis → music/score.wav (48k stereo, full film length) + music/stems/*.wav
All synthesized in numpy: theremin (continuous pitch + glides + vibrato that fades in), analogue bass, square-wave arpeggios, retro drum machine,
swinging tuba for the jelly universe, brushed-drum jazz for the mug universe, elevator bossa (Karplus-Strong nylon strings), spring/room reverb.
All cue times come from events.json (exported from story.js), so the first beat of each cue lands on its cut.
Usage: python music/score.py (rode events.mjs antes)"""
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
E = json.load(open(os.path.join(ROOT, 'events.json'))); DUR = E['dur']
CUE = {e['name']: e for e in E['ev'] if e['type'] == 'cue'}
SR = 48000; N = int(DUR * SR); BEAT = .5
rng = np.random.default_rng(11)

# ———————————————— basics ————————————————
def tt(d): return np.arange(int(round(d * SR))) / SR
def mf(m): return 440 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def M(s):   # 'D5' → 74
    n, o = (s[:2], s[2:]) if len(s) > 2 and s[1] in '#b' else (s[:1], s[1:]); return 12 * (int(o) + 1) + NOTE[n]
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * .45), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def adsr(n, a=.005, d=.1, s=.6, r=.1, hold=None):
    e = np.zeros(n); A, D, R = int(a * SR), int(d * SR), int(r * SR); H = n - R if hold is None else int(hold * SR)
    H = max(H, 1); i = np.arange(n)
    e = np.where(i < A, i / max(A, 1), np.where(i < A + D, 1 - (1 - s) * (i - A) / max(D, 1), s))
    rel = np.clip(1 - (i - H) / max(R, 1), 0, 1); e = np.where(i >= H, e[min(H, n - 1)] * rel, e)
    return e
def saw(ph): return 2 * (ph % 1) - 1
def sq(ph, w=.5): return np.where(ph % 1 < w, 1., -1.)
def tri(ph): return 2 * np.abs(2 * (ph % 1) - 1) - 1

class Bus:
    def __init__(s, name): s.name = name; s.b = np.zeros((N, 2))
    def add(s, x, at, g=1., pan=0.):
        st = int(round(at * SR))
        if x.ndim == 1: l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414; x = np.stack([x * l, x * r], 1)
        if st < 0: x = x[-st:]; st = 0
        e = min(N, st + len(x));
        if e > st: s.b[st:e] += x[:e - st] * g
    def cut(s, t0, t1, fade=.008):   # silence a range (hard cut)
        a, b = int(t0 * SR), int(t1 * SR); f = int(fade * SR)
        s.b[a:b] = 0
        if a - f > 0: s.b[a - f:a] *= np.linspace(1, 0, f)[:, None]
BUS = {k: Bus(k) for k in ['drums', 'bass', 'lead', 'harm', 'fx']}

# ———————————————— instruments ————————————————
def theremin(notes, glide=.07, vib=.32, rate=5.7, bright=.14, v=1.):
    """notes: [(t, dur, midi)] played legato; returns (start, signal)"""
    t0 = notes[0][0]; t1 = max(t + d for t, d, _ in notes) + .25; n = int((t1 - t0) * SR)
    target = np.full(n, float(notes[0][2])); amp = np.zeros(n)
    for t, d, m in notes:
        a, b = int((t - t0) * SR), int((t + d - t0) * SR); target[a:] = m
        env = adsr(b - a + int(.12 * SR), .035, .08, .85, .12, hold=d); amp[a:a + len(env)] = np.maximum(amp[a:a + len(env)], env[:n - a])
    k = 1 - np.exp(-1 / (glide * SR))
    from scipy.signal import lfilter
    mid = lfilter([k], [1, -(1 - k)], target, zi=[target[0] * (1 - k)])[0]
    # vibrato fades in 150 ms after each note starts
    vib_env = np.zeros(n)
    for t, d, m in notes:
        a = int((t - t0) * SR); L = int((d + .12) * SR); w = np.clip((np.arange(L) / SR - .15) / .25, 0, 1); vib_env[a:a + L] = np.maximum(vib_env[a:a + L], w[:n - a])
    ph_v = np.arange(n) / SR * rate * 2 * np.pi
    f = mf(mid + vib * vib_env * np.sin(ph_v)); ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) + bright * np.sin(4 * np.pi * ph) + .05 * np.sin(6 * np.pi * ph)
    return t0, lp(x * amp, 5000) * v
def bass(t, d, m, v=1., cut=900):
    n = int((d + .06) * SR); ph = np.cumsum(np.full(n, mf(m))) / SR
    x = .7 * saw(ph) + .6 * np.sin(2 * np.pi * ph * .5 * 2) ; e = adsr(n, .004, .15, .55, .05, hold=d)
    fe = cut * (.35 + .65 * np.exp(-np.arange(n) / SR / .12))
    y = np.zeros(n); seg = 256
    for i in range(0, n, seg): y[i:i + seg] = lp(x[max(0, i - 2048):i + seg], fe[i])[-len(x[i:i + seg]):]
    return y * e * v
def pluck(t, d, m, v=1., w=.3, cut=3200):
    n = int((d + .15) * SR); ph = np.cumsum(np.full(n, mf(m))) / SR
    return lp(sq(ph, w) * adsr(n, .002, .09, .25, .1, hold=d), cut) * v
def pad(d, ms, v=1., cut=1600, att=.3):
    n = int((d + .6) * SR); x = np.zeros(n)
    for m in ms:
        for dt in (-.08, 0, .09):
            ph = np.cumsum(np.full(n, mf(m + dt))) / SR + rng.random(); x += saw(ph)
    return lp(x / len(ms) / 3, cut, 2) * adsr(n, att, .3, .8, .5, hold=d) * v
def rhodes(d, m, v=1.):
    n = int((d + .8) * SR); tn = np.arange(n) / SR; f = mf(m)
    x = np.sin(2 * np.pi * f * tn) * np.exp(-tn / 1.6) + .35 * np.sin(2 * np.pi * f * 2 * tn) * np.exp(-tn / .35) + .12 * np.sin(2 * np.pi * f * 7.1 * tn) * np.exp(-tn / .04)
    return x * (1 + .15 * np.sin(2 * np.pi * 4.5 * tn)) * adsr(n, .003, .2, 1, .3, hold=d) * v
def vibes(d, m, v=1.):
    n = int(1.6 * SR); tn = np.arange(n) / SR; f = mf(m)
    x = np.sin(2 * np.pi * f * tn) * np.exp(-tn / .9) + .3 * np.sin(2 * np.pi * f * 4 * tn) * np.exp(-tn / .2) + .1 * np.sin(2 * np.pi * f * 10 * tn) * np.exp(-tn / .05)
    return x * (1 + .35 * np.sin(2 * np.pi * 5.5 * tn)) * v
def xylo(m, v=1.):
    n = int(.5 * SR); tn = np.arange(n) / SR; f = mf(m)
    return (np.sin(2 * np.pi * f * tn) * np.exp(-tn / .18) + .4 * np.sin(2 * np.pi * f * 3.93 * tn) * np.exp(-tn / .05) + .2 * hp(rng.standard_normal(n), 3000) * np.exp(-tn / .004)) * v
def ks(m, d=1.2, v=1., bright=.5):   # Karplus-Strong nylon string
    n = int(d * SR); f = mf(m); L = int(SR / f); buf = lp(rng.standard_normal(L), 2000 + 4000 * bright); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % L]; buf[i % L] = .5 * (buf[i % L] + buf[(i + 1) % L]) * .996
    return out * v
def tuba(t, d, m, v=1.):
    n = int((d + .08) * SR); tn = np.arange(n) / SR; f = mf(m) * (1 - .06 * np.exp(-tn / .03))
    ph = np.cumsum(f) / SR; x = saw(ph) + .5 * np.sin(2 * np.pi * ph)
    return lp(x, 700) * adsr(n, .02, .1, .7, .06, hold=d) * v
def wobble_lead(notes, v=1.):   # jelly wobble lead: wide, fast vibrato
    return theremin(notes, glide=.04, vib=.7, rate=7.5, bright=.35, v=v)
def brass(d, ms, v=1.):
    n = int((d + .2) * SR); x = np.zeros(n)
    for m in ms:
        for dt in (-.1, .1): ph = np.cumsum(np.full(n, mf(m + dt))) / SR + rng.random(); x += saw(ph)
    e = adsr(n, .01, .15, .5, .15, hold=d); fe = 400 + 3200 * np.exp(-np.arange(n) / SR / .15)
    y = np.zeros(n)
    for i in range(0, n, 256): y[i:i + 256] = lp(x[max(0, i - 2048):i + 256], fe[i])[-len(x[i:i + 256]):]
    return y * e * v / len(ms)
def strings_trem(d, ms, v=1., rise=0):
    n = int(d * SR); x = np.zeros(n); tn = np.arange(n) / SR
    for m in ms:
        for dt in (-.12, 0, .12): ph = np.cumsum(mf(m + dt + rise * tn / d)) / SR + rng.random(); x += saw(ph)
    return lp(x, 2600) * (.55 + .45 * np.sin(2 * np.pi * 13 * tn)) * adsr(n, .08, .1, 1, .02, hold=d - .02) * v / len(ms)
# Drums
def kick(v=1.):
    n = int(.4 * SR); tn = np.arange(n) / SR; f = 45 + 95 * np.exp(-tn / .04)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tn / .18) + .3 * hp(rng.standard_normal(n), 2000) * np.exp(-tn / .003)) * v
def snare(v=1.):
    n = int(.3 * SR); tn = np.arange(n) / SR
    return (bp(rng.standard_normal(n), 1200, 7000) * np.exp(-tn / .07) * .8 + np.sin(2 * np.pi * 190 * tn) * np.exp(-tn / .04) * .6) * v
def hat(v=1., open_=False):
    n = int((.25 if open_ else .06) * SR); tn = np.arange(n) / SR
    return lp(hp(rng.standard_normal(n), 6500), 12000) * np.exp(-tn / (.08 if open_ else .012)) * v
def clap(v=1.):
    n = int(.25 * SR); tn = np.arange(n) / SR; e = sum(np.exp(-np.maximum(tn - k * .011, 0) / .006) * (tn >= k * .011) for k in range(3)) + .5 * np.exp(-tn / .08)
    return bp(rng.standard_normal(n), 900, 5000) * e * v
def crash(v=1., d=2.2):
    n = int(d * SR); tn = np.arange(n) / SR
    x = lp(hp(rng.standard_normal(n), 3500), 11000) * np.exp(-tn / .7) + .25 * sum(np.sin(2 * np.pi * f * tn) for f in (2523, 3811, 5123, 6579)) / 4 * np.exp(-tn / .4)
    return hp(x, 2500) * v
def tom(m=45, v=1.):
    n = int(.5 * SR); tn = np.arange(n) / SR; f = mf(m) * (1 + .5 * np.exp(-tn / .05))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tn / .2) * v
def brush(v=1., d=.18):
    n = int(d * SR); tn = np.arange(n) / SR
    return bp(rng.standard_normal(n), 2500, 9000) * np.sin(np.pi * tn / d) ** 1.5 * v
def ride(v=1.):
    n = int(.9 * SR); tn = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 3000, 9000) * np.exp(-tn / .3) * .8 + .12 * sum(np.sin(2 * np.pi * f * tn + 3 * np.sin(2 * np.pi * f * 1.41 * tn)) for f in (3150, 4870)) / 2 * np.exp(-tn / .25) + lp(hp(rng.standard_normal(n), 5000), 10000) * np.exp(-tn / .02) * .6
    return hp(x, 2500) * v
def rim(v=1.):
    n = int(.08 * SR); tn = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1700 * tn) * np.exp(-tn / .012) + bp(rng.standard_normal(n), 2000, 6000) * np.exp(-tn / .004)) * v
def shaker(v=1.):
    n = int(.09 * SR); tn = np.arange(n) / SR
    return lp(hp(rng.standard_normal(n), 4500), 10000) * np.sin(np.pi * tn / .09) ** 2 * v
def noise_riser(d, v=1.):
    n = int(d * SR); x = rng.standard_normal(n); y = np.zeros(n)
    for i in range(0, n, 512):
        f = 300 * (8000 / 300) ** (i / n); y[i:i + 512] = bp(x[max(0, i - 4096):i + 512], f * .7, min(f * 1.4, 20000))[-len(x[i:i + 512]):]
    return y * (np.arange(n) / n) ** 2 * v
def rev_swell(d, ms, v=1.):
    x = pad(d, ms, 1, 3000, .02)[:int(d * SR)]; e = (np.arange(len(x)) / len(x)) ** 3; return x * e * v

# Beat helpers
def at(cue, beat): return CUE[cue]['t0'] + beat * BEAT
def swing(b, amt=.16): return b + (amt if (b * 2) % 2 == 1 else 0)


D, L, H, F = BUS['drums'], BUS['lead'], BUS['harm'], BUS['fx']; B = BUS['bass']
# ———————————————— trilha original "Nem uma gota?" (Mi menor, 120 bpm) ————————————————
CH = [([M('E3'), M('G3'), M('B3')], M('E2')), ([M('C3'), M('E3'), M('G3')], M('C2')), ([M('A2'), M('C3'), M('E3')], M('A1')), ([M('B2'), M('D#3'), M('F#3')], M('B1'))]
def band(t0, t1, gain=1., drums=True, arp=True, surf=False):
    bars = int((t1 - t0) / (4 * BEAT))
    for bi in range(bars):
        ch, root = CH[bi % 4]; tb = t0 + bi * 4 * BEAT
        H.add(pad(4 * BEAT, [m + 12 for m in ch], .5, 1500, .08), tb, .35 * gain)
        for k in range(8):
            m = [root, root, root + 7, root + 12, root, root + 10, root + 7, root + 3][k]
            B.add(bass(0, .2, m, 1., 1000), tb + k * BEAT / 2, .45 * gain)
        if arp:
            for k in range(8):
                m = (ch + [ch[0] + 12])[k % 4] + 24
                H.add(pluck(0, .1, m, 1., .3, 2600), tb + k * BEAT / 2, .09 * gain, pan=.3 * (1 if k % 2 else -1))
        if surf:   # guitarra surf: corda dedilhada rápida com trêmolo
            for k in range(16):
                m = ch[0] + 24 + (12 if k % 8 > 5 else 0)
                H.add(ks(m, .2, 1, .7), tb + k * BEAT / 4, .07 * gain, pan=-.35)
        if drums:
            for k in range(4):
                if k in (0, 2): D.add(kick(.9), tb + k * BEAT, .6 * gain)
                if k in (1, 3): D.add(snare(.8), tb + k * BEAT, .25 * gain)
            for k in range(8): D.add(hat(1), tb + k * BEAT / 2, (.12 if k % 2 else .08) * gain, pan=.3)
TH = [(0, 1, 'B4'), (1, .5, 'G4'), (1.5, .5, 'A4'), (2, 1, 'B4'), (3, 1, 'E5'), (4, 1.5, 'D5'), (5.5, .5, 'C5'), (6, 2, 'B4'),
      (8, 1, 'A4'), (9, .5, 'C5'), (9.5, .5, 'B4'), (10, 1, 'A4'), (11, 1, 'F#4'), (12, 2, 'G4'), (14, 2, 'F#4')]
def melody(t0, gain=1., oct_=0, maxb=16):
    ns = [(t0 + b * BEAT, d * BEAT - .02, M(n) + oct_) for b, d, n in TH if b < maxb]
    s0, x = theremin(ns); L.add(x, s0, .38 * gain, pan=-.1)

c = CUE['abertura']; band(c['t0'], c['t1'], .8, drums=False, surf=True); melody(c['t0'] + 2 * 4 * BEAT, .9)
c = CUE['explica']; band(c['t0'], c['t1'], .75, arp=True)
for k in range(int((c['t1'] - c['t0']) / (16 * 4 * BEAT))): melody(c['t0'] + 8 * 4 * BEAT + k * 16 * 4 * BEAT, .6, -12, 8)
for b in BUS.values(): b.cut(c['t1'], c['t1'] + 2.2, .01)      # a gota: silêncio total
c = CUE['dreno']; band(c['t0'], c['t1'] + 1, .85, surf=True); melody(c['t0'] + 4 * 4 * BEAT, .8, 0, 8)
c = CUE['final']
D.add(crash(1), c['t0'], .35); band(c['t0'], c['t1'] - 1, .9, surf=True)
hit = [e for e in E['ev'] if e['type'] == 'titleHit'][0]['t']
D.add(crash(1.2), hit, .45); D.add(kick(1.2), hit, .6)
s0, sw = theremin([(hit - .3, .1, M('E4')), (hit - .2, 1.2, M('E5'))], glide=.12, vib=.5); L.add(sw, s0, .4)
for b in BUS.values(): b.cut(c['t1'] - .02, c['t1'] + 5, .6)

# ———————————————— reverb + saída ————————————————
def ir(d=2.0, decay=.45, lpf=5000, pre=.015):
    n = int(d * SR); tn = np.arange(n) / SR
    x = np.stack([lp(rng.standard_normal(n), lpf) * np.exp(-tn / decay), lp(rng.standard_normal(n), lpf) * np.exp(-tn / decay)], 1)
    x[:int(pre * SR)] = 0; return x / np.sqrt((x ** 2).sum(0))
def spring_ir(d=1.2):
    n = int(d * SR); tn = np.arange(n) / SR; ch = np.sin(2 * np.pi * (1800 * tn - 700 * tn ** 2)) * np.exp(-tn / .05) * .3
    x = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-tn / .35)[:, None]; x[:, 0] += ch; x[:, 1] += np.roll(ch, 300)
    x = np.stack([bp(x[:, 0], 300, 4500), bp(x[:, 1], 300, 4500)], 1); x[:int(.02 * SR)] = 0; return x / np.sqrt((x ** 2).sum(0))
def conv(x, h): return np.stack([fftconvolve(x[:, c], h[:, c])[:N] for c in range(2)], 1)
room, spr = ir(), spring_ir()
send = {'drums': .08, 'bass': .0, 'lead': .28, 'harm': .2, 'fx': .2}
dry = sum(b.b for b in BUS.values())
out = dry + conv(sum(BUS[k].b * send[k] for k in ['drums', 'harm', 'fx']), room) * .9 + conv(BUS['lead'].b * send['lead'], spr) * 1.1
c = CUE['explica']; a, b = int(c['t1'] * SR), int((c['t1'] + 2.2) * SR); out[a:b] = 0      # corta a cauda do reverb também
out = np.stack([hp(out[:, c], 40) for c in range(2)], 1)
pk = np.abs(out).max(); out = out / pk * .89
sf.write(os.path.join(HERE, 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's')
