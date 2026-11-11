"""Mixagem: foley sintetizado (events.json) + vozes (narrador, Noé, Rex em voices/) + trilha (music/score.wav, baixa e com ducking) + ambiências → mix.wav
Música ~14 dB abaixo da voz e ducking de ~9 dB sob a fala (trilha baixa, como nos filmes anteriores).
Uso: python mix.py (rode events.mjs e music/score.py antes)"""
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, click, clack, whoosh, pop, ding, thump, compress, limit, add
from scipy.ndimage import maximum_filter1d, uniform_filter1d
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR)
rng = np.random.default_rng(5)
def brown_(d):
    w = np.cumsum(nz(d)); w -= np.linspace(w[0], w[-1], len(w)); return norm(hp(w, 20))
def nz(d): return rng.standard_normal(len(t_(d)))
sfxb, vob, amb = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2))
def sweep(f0, f1, d, curve=1.0):
    tt = t_(d); f = f0 * (f1 / f0) ** ((tt / d) ** curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def fade(x, a=.005, r=.02):
    n = len(x); x = x.copy(); A, R = min(n, int(a * SR)), min(n, int(r * SR)); x[:A] *= np.linspace(0, 1, A); x[n - R:] *= np.linspace(1, 0, R); return x
def bpsweep(x, f0, f1, q=.35):
    out = np.zeros_like(x); n = len(x)
    for i in range(0, n, 480):
        f = f0 * (f1 / f0) ** (i / n); s = bp(x[max(0, i - 2400):i + 480], f * (1 - q), min(f * (1 + q), 20000)); out[i:i + 480] = s[-len(out[i:i + 480]):]
    return out

# —— cartoon foley (all synthesized)——
def plip():
    d = .12; x = np.zeros(int(d * SR)); s = sweep(900, 2600, .05) * env_exp(.05, .02); x[:len(s)] += s; x += bp(nz(d), 2000, 6000) * env_exp(d, .01) * .2; return norm(x)
def squeak(): d = .09; tt = t_(d); return norm(np.sin(2 * np.pi * (2000 + 500 * np.sin(2 * np.pi * 30 * tt)) * tt) * np.sin(np.pi * tt / d))
def tic(): d = .04; return norm(np.sin(2 * np.pi * 3200 * t_(d)) * env_exp(d, .008))
def gulp(): d = .22; x = sweep(420, 110, d, .6) * env_exp(d, .07); x[:int(.01 * SR)] += bp(nz(.01), 500, 3000) * .8; return norm(lp(x, 1200))
def cloth(): d = .3; return norm(lp(nz(d), 1500) * np.sin(np.pi * t_(d) / d) ** 2)
def rclick(): x = click(.8); b = np.sin(2 * np.pi * 1320 * t_(.07)) * env_exp(.07, .03) * .5; y = np.zeros(int(.1 * SR)); y[:len(x)] += x; y[int(.02 * SR):int(.02 * SR) + len(b)] += b; return norm(y)
def portal_open():
    d = 1.5; tt = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-tt / .12)) / SR) * env_exp(d, .45)
    down = bpsweep(nz(d), 6000, 300, .4) * env_exp(d, .5)
    swirl = np.sin(2 * np.pi * np.cumsum(260 + 500 * (tt / d) + 120 * np.sin(2 * np.pi * 7 * tt)) / SR) * np.sin(np.pi * np.minimum(tt / d, 1)) * .35
    sp = hp(nz(d), 5000) * (rng.random(len(tt)) > .997) * 4
    return norm(boom * 1.0 + down * .7 + swirl + lp(sp, 12000) * .3)
def portal_hum(d):
    tt = t_(d); lfo = np.sin(2 * np.pi * .9 * tt)
    x = np.sin(2 * np.pi * 55 * tt + 2 * np.sin(2 * np.pi * 3 * tt)) * .6 + np.sin(2 * np.pi * 110.7 * tt) * .25 + bp(nz(d), 300, 900) * (.5 + .3 * lfo) * .5
    x += np.sin(2 * np.pi * np.cumsum(420 + 60 * lfo) / SR) * .08
    return fade(norm(x), .3, .4)
def portal_close(): d = .5; tt = t_(d); x = bpsweep(nz(d), 300, 3000, .4)[::-1] * np.linspace(0, 1, len(tt)) ** 2; x[-int(.12 * SR):] += thump(1, 60)[:int(.12 * SR)]; return norm(np.concatenate([x, thump(1, 55) * .8]))
def portal_whoosh(): d = .4; x = bpsweep(nz(d), 400, 4000, .3) * np.sin(np.pi * t_(d) / d) ** 2; return norm(x + np.sin(2 * np.pi * np.cumsum(np.linspace(200, 900, len(x))) / SR) * np.sin(np.pi * t_(d) / d) * .3)
def suck(): d = .35; x = bpsweep(nz(d), 3000, 250, .4) * np.linspace(.3, 1, int(d * SR)); return norm(np.concatenate([x, pop(.8)[:int(.12 * SR)] * .6]))
def whoosh_big(): return whoosh(.45)
def boing(): d = .7; tt = t_(d); f = 180 * (1 + .35 * np.sin(2 * np.pi * 16 * tt) * np.exp(-tt / .25)) * (1 + .6 * np.exp(-tt / .04)); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .22))
def thud(): return norm(thump(1, 70) + np.pad(lp(nz(.15), 1200) * env_exp(.15, .03), (0, int(.2 * SR))))
def bubble(f0=300, f1=900, d=.07): return sweep(f0, f1, d, .8) * np.sin(np.pi * t_(d) / d)
def gurgle():
    out = np.zeros(int(.8 * SR))
    for k in range(9): b = bubble(150 + rng.random() * 200, 400 + rng.random() * 400, .05 + rng.random() * .05); s = int(rng.random() * .7 * SR); out[s:s + len(b)] += b[:len(out) - s]
    return norm(lp(out, 2000))
def glorp():
    d = .5; tt = t_(d); f = 260 + 500 * np.sin(np.pi * tt / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .6 * np.sin(2 * np.pi * 28 * tt)) * np.sin(np.pi * tt / d)
    return norm(lp(x, 1800) + gurgle()[:len(x)] * .5)
def slide(): d = .45; tt = t_(d); return norm(bp(nz(d), 500, 2500) * (.6 + .4 * np.sin(2 * np.pi * 22 * tt)) * np.sin(np.pi * tt / d))
def squish(): d = .18; return norm(bpsweep(nz(d), 600, 2500, .5) * env_exp(d, .05))
def wetblink(): d = .09; x = bp(nz(d), 700, 3000) * env_exp(d, .015); x[:int(.03 * SR)] += bubble(500, 1500, .03) * .6; return norm(x)
def slurp(d): tt = t_(d); am = (rng.random(len(tt)) > .9992).astype(float); am = uniform_filter1d(maximum_filter1d(am, int(.015 * SR)), int(.01 * SR)); return fade(norm(bp(nz(d), 900, 3200) * (.25 + am * 2) * np.sin(np.pi * tt / d) ** .5), .02, .05)
def page(): d = .22; tt = t_(d); return norm(hp(nz(d), 2500) * (rng.random(len(tt)) > .6) * np.sin(np.pi * tt / d))
def lick(): d = .3; return norm(bpsweep(nz(d), 1200, 400, .5) * np.sin(np.pi * t_(d) / d))
def chomp(): x = np.zeros(int(.3 * SR)); a = clack(1.4); b = clack(1.2); x[:len(a)] += a; x[int(.07 * SR):int(.07 * SR) + len(b)] += b; x[:int(.15 * SR)] += lp(nz(.15), 3000) * env_exp(.15, .03) * .5; return norm(x)
def coo():
    d = .75; tt = t_(d); f = 330 + 90 * np.sin(np.pi * np.minimum(tt / .5, 1)) - 60 * (tt > .5)
    return norm(lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .4 * np.sin(2 * np.pi * 24 * tt)) * np.sin(np.pi * tt / d), 1200))
def swish(): d = .2; return norm(bp(nz(d), 1500, 6000) * np.sin(np.pi * t_(d) / d) ** 2)
def shopbell(): a = ding(1); y = np.zeros(len(a) + int(.14 * SR)); y[:len(a)] += a; y[int(.14 * SR):] += ding(.7); return norm(y)
def cupset(): return norm(thump(.8, 140)[:int(.15 * SR)] + np.pad(click(.6), (0, int(.15 * SR) - len(click(.6)))))
def bloop(): return norm(bubble(280, 950, .08))
def blip(): d = .05; return norm(np.sin(2 * np.pi * 1700 * t_(d)) * np.sin(np.pi * t_(d) / d))
def wheee(d):
    tt = t_(d); f = 900 + 700 * np.sin(np.pi * tt / d) + 50 * np.sin(2 * np.pi * 9 * tt)
    return fade(norm(np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * tt / d) ** .3, .02, .08)
def gulp_portal(): return norm(np.concatenate([gulp(), pop(.7)[:int(.1 * SR)]]))
def slam():
    d = 1.0; tt = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-tt / .05)) / SR) * env_exp(d, .3)
    crack = bp(nz(d), 1000, 7000) * env_exp(d, .05)
    splat = lp(nz(d), 1500) * env_exp(d, .12) * (1 + .5 * np.sin(2 * np.pi * 30 * tt))
    return norm(boom + crack * .6 + splat * .5)

def gulls(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d / 1.6)):
        dd = .35; tt = t_(dd); c = np.sin(2 * np.pi * np.cumsum(1800 - 900 * tt / dd) / SR) * np.sin(np.pi * tt / dd) * .5; s = int((k * 1.6 + rng.random() * .5) * SR); x[s:s + len(c)] += c[:len(x) - s]
    return x

# —— sons novos deste filme ——
def clunk(): return norm(thump(1, 90)[:int(.25 * SR)] + np.pad(clack(1.3), (0, int(.25 * SR) - len(clack(1.3)))) * .5)
def whistle_fall(): d = .4; tt = t_(d); return fade(norm(np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 500, len(tt))) / SR)) * .6, .01, .05)
def jitter(): d = .6; tt = t_(d); return fade(norm(np.sin(2 * np.pi * 700 * tt) * (np.sin(2 * np.pi * 24 * tt) > 0)) * .3, .01, .1)
def grind(d): tt = t_(d); x = bp(nz(d), 150, 1200) * (.7 + .3 * np.sin(2 * np.pi * 6 * tt)) + lp(brown_(d), 120) * .8; return fade(norm(x), .1, .2)
def pour(d): tt = t_(d); return fade(norm(bp(nz(d), 800, 5000) * (.6 + .4 * np.sin(2 * np.pi * 9 * tt) * np.sin(2 * np.pi * 2.3 * tt))), .1, .3)
def crumble():
    d = 1.2; x = np.zeros(int(d * SR))
    for k in range(14): c = thump(.5 + rng.random() * .5, 80 + rng.random() * 120)[:int(.2 * SR)]; s = int(rng.random() * (d - .25) * SR); x[s:s + len(c)] += c
    return norm(x + lp(nz(d), 900) * env_exp(d, .4) * .4)
def geyser():
    d = 1.6; b = thump(1, 50); x = np.zeros(int(d * SR)); x[:len(b)] += b[:len(x)]
    return norm(x + bp(nz(d), 300, 3000) * env_exp(d, .6))
def tickloop(d):
    x = np.zeros(int(d * SR))
    for k in range(int(d / .5)): c = tic(); s = int(k * .5 * SR); x[s:s + len(c)] += c[:len(x) - s] * (1 if k % 2 else .7)
    return x
def pipeflow(d): tt = t_(d); return fade(norm(lp(brown_(d), 400) + bp(nz(d), 200, 900) * .3 * (.6 + .4 * np.sin(2 * np.pi * 1.5 * tt))), .3, .4)
def shaker_(d): tt = t_(d); return fade(norm(bp(nz(d), 1500, 6000) * (np.sin(2 * np.pi * 20 * tt) > 0)), .1, .2)
def stamp(): return norm(thump(1, 110)[:int(.3 * SR)] + np.pad(clack(1.6), (0, int(.3 * SR) - len(clack(1.6)))))
def hydraulic(d): tt = t_(d); return fade(norm(np.sin(2 * np.pi * np.cumsum(90 + 40 * tt / d) / SR) * .6 + bp(nz(d), 400, 1800) * .4), .05, .15)
def grout(d): tt = t_(d); return fade(norm(lp(nz(d), 700) * (.5 + .5 * np.sin(2 * np.pi * 3 * tt))), .1, .2)
def drip(d):
    x = np.zeros(int(d * SR))
    for k in range(6): c = plip(); s = int((k * d / 6 + rng.random() * .1) * SR); x[s:s + len(c)] += c[:len(x) - s] * .5
    return x
def splash(): d = .6; return norm(bp(nz(d), 500, 6000) * env_exp(d, .15) + gurgle()[:int(d * SR)] * .4)
def pumprun(d): tt = t_(d); return fade(norm(np.sin(2 * np.pi * 100 * tt) * .5 + np.sin(2 * np.pi * 200 * tt) * .25 + bp(nz(d), 300, 1200) * .3), .1, .2)
def dive(): d = 1.4; return fade(norm(bpsweep(nz(d), 3000, 300, .4) * np.sin(np.pi * t_(d) / d)), .05, .2)

def thunder():
    d = 2.6; x = lp(brown_(d), 400) * env_exp(d, .9) + bp(nz(d), 60, 900) * env_exp(d, .25) * .6
    c = np.zeros_like(x); k = bp(nz(.15), 200, 3000) * env_exp(.15, .03); c[:len(k)] += k; return norm(x + c * .5)
def title_hit():
    a, b = pop(1.2), ding(1.2); x = np.zeros(max(len(a), len(b))); x[:len(a)] += a; x[:len(b)] += b * .8; return norm(x)
def foghorn(d=1.2): tt = t_(d); x = sum(np.sin(2 * np.pi * f * tt) / (i + 1) for i, f in enumerate((98, 196, 294, 392))); return fade(norm(lp(x, 900)), .08, .25)

# —— sons novos deste filme ——
def clop(): return norm(np.concatenate([clack(.7)[:int(.06 * SR)], np.zeros(int(.12 * SR)), clack(.5)[:int(.06 * SR)]]))
def rolling(d): tt = t_(d); return fade(norm(bp(nz(d), 200, 1500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 3 * tt)))), .1, .3)
def steps(d, fast=0):
    x = np.zeros(len(t_(d))); st = .16 if fast else .35
    for k in range(int(d / st)): c = thump(.9, 90 if fast else 70)[:int(.15 * SR)]; s = int(k * st * SR); x[s:s + len(c)] += c[:len(x) - s] * (1 if k % 2 else .8)
    return x
def elephant():
    d = 1.1; tt = t_(d); f = 420 + 260 * np.sin(np.pi * tt / d)
    x = (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + bp(nz(d), 300, 2000) * .5) * np.sin(np.pi * tt / d) ** .5
    return norm(lp(x, 2500))
def check(): d = .14; tt = t_(d); return norm(bp(nz(d), 2000, 6000) * np.sin(np.pi * tt / d) * (1 + np.sin(2 * np.pi * 40 * tt)))
def marker(d): tt = t_(d); return fade(norm(bp(nz(d), 1500, 5000) * (.6 + .4 * np.sin(2 * np.pi * 9 * tt))), .02, .05)
def sting(): d = .5; tt = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(600, 300, len(tt))) / SR) * (np.sin(2 * np.pi * 8 * tt) > 0) * env_exp(d, .2))
def tickd(d):
    x = np.zeros(int(d * SR))
    for k in range(int(d / .5)):
        dd = .05; c = np.sin(2 * np.pi * (2600 if k % 2 else 2000) * t_(dd)) * env_exp(dd, .01); s = int(k * .5 * SR); x[s:s + len(c)] += c[:len(x) - s]
    return x
def jump(): d = .35; return norm(sweep(200, 900, d) * env_exp(d, .15))
def twinkle():
    x = np.zeros(int(.8 * SR))
    for j, f in enumerate([1760, 2217, 2637, 3520]): c = np.sin(2 * np.pi * f * t_(.3)) * env_exp(.3, .08); s = int(j * .07 * SR); x[s:s + len(c)] += c
    return norm(x)
def meteor(d): tt = t_(d); x = bpsweep(nz(d), 500, 3000, .5) * (tt / d) ** 1.5 + lp(brown_(d), 200) * (tt / d) * .8; return fade(norm(x), .05, .02)
def impact():
    d = 3.0; tt = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 80 * np.exp(-tt / .08)) / SR) * env_exp(d, .9)
    return norm(boom + lp(brown_(d), 600) * env_exp(d, 1.2) * .8 + bp(nz(d), 800, 6000) * env_exp(d, .1) * .5)
def fire(d):
    tt = t_(d); x = lp(brown_(d), 800) * .6
    cr = (rng.random(len(tt)) > .9985).astype(float); x += hp(uniform_filter1d(cr, 30), 1500) * 6
    return fade(norm(x), .05, .1)
def wind(d): tt = t_(d); return fade(norm(bpsweep(nz(d), 300, 900, .3) * (.6 + .4 * np.sin(2 * np.pi * .7 * tt))), .2, .2)
def brr(): d = .7; tt = t_(d); return fade(norm(np.sin(2 * np.pi * 180 * tt) * (np.sin(2 * np.pi * 28 * tt) > 0) * .6 + bp(nz(d), 400, 2000) * .3), .02, .1)
def growl(): d = 1.0; tt = t_(d); f = 70 + 25 * np.sin(2 * np.pi * 3 * tt); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .6 * np.sin(2 * np.pi * 17 * tt)); return norm(lp(x + bp(nz(d), 80, 400) * .5, 500) * np.sin(np.pi * tt / d))
def fall(): return norm(np.concatenate([whistle_fall(), thump(1, 55)[:int(.4 * SR)]]))
def zoom_(d, up=True): tt = t_(d); return fade(norm(np.sin(2 * np.pi * np.cumsum(np.geomspace(200, 1400, len(tt)) if up else np.geomspace(1400, 200, len(tt))) / SR) * .4 + bpsweep(nz(d), 400 if up else 4000, 4000 if up else 400, .3)), .05, .1)
def crowd(d): tt = t_(d); return fade(norm(bp(nz(d), 300, 2500) * (.7 + .3 * np.sin(2 * np.pi * .3 * tt)) + bp(nz(d), 600, 1200) * .3), .3, .4)
def whistle_ref():
    d = .9; tt = t_(d); trill = (np.sin(2 * np.pi * 32 * tt) > -.2).astype(float)
    x = np.sin(2 * np.pi * 2900 * tt + 3 * np.sin(2 * np.pi * 32 * tt)) * trill + bp(nz(d), 2500, 4000) * .3
    return fade(norm(x), .01, .1)
def skid(): d = .6; tt = t_(d); return fade(norm(bp(nz(d), 1500, 5000) * np.linspace(1, .2, len(tt)) + np.sin(2 * np.pi * np.cumsum(np.linspace(1400, 900, len(tt))) / SR) * .3), .01, .1)
def crickets(d):
    x = np.zeros(int(d * SR)); tt = t_(.05)
    for k in range(int(d / .9)):
        for j in range(3):
            c = np.sin(2 * np.pi * 4300 * tt) * np.sin(np.pi * tt / .05) * (np.sin(2 * np.pi * 70 * tt) > 0); s = int((k * .9 + j * .07 + .2 * (k % 2)) * SR); x[s:s + len(c)] += c[:max(0, len(x) - s)]
    return x
def stamp_(): return norm(thump(1, 110)[:int(.3 * SR)] + np.pad(clack(1.6), (0, int(.3 * SR) - len(clack(1.6)))))
def flutter(d): tt = t_(d); return fade(norm(bp(nz(d), 400, 3000) * (np.sin(2 * np.pi * 14 * tt) > .3)), .02, .1)
def roar():
    d = 1.4; tt = t_(d); f = 90 + 40 * np.sin(np.pi * tt / d)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + bp(nz(d), 150, 1200) * (1 + .5 * np.sin(2 * np.pi * 23 * tt))
    return norm(lp(x, 1400) * np.sin(np.pi * tt / d) ** .5)
def camera(): x = np.zeros(int(.35 * SR)); a = click(1); x[:len(a)] += a; b = bp(nz(.2), 2000, 8000) * env_exp(.2, .05); x[int(.05 * SR):int(.05 * SR) + len(b)] += b * .6; return norm(x)
def caw(): d = .35; tt = t_(d); f = 700 - 200 * tt / d; x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .4 + bp(nz(d), 800, 2500) * .6; return norm(lp(x, 3000) * np.sin(np.pi * tt / d))
def volcano_():
    a = thump(1, 45); b = lp(nz(.6), 600) * env_exp(.6, .2); n = max(len(a), len(b)); return norm(np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b))))
def harp():
    x = np.zeros(int(2 * SR))
    for j, m in enumerate([62, 66, 69, 74, 78, 81, 86, 90]):
        f = 440 * 2 ** ((m - 69) / 12); c = np.sin(2 * np.pi * f * t_(1)) * env_exp(1, .35); s = int(j * .08 * SR); x[s:s + len(c)] += c
    return norm(x)

FX = {'thunder': (thunder, .5), 'pop': (lambda: pop(1), .35), 'whoosh': (lambda: whoosh(.5), .35), 'titleHit': (title_hit, .5), 'clop': (clop, .25),
      'elephant': (elephant, .3), 'check': (check, .3), 'sting': (sting, .25), 'ding': (lambda: ding(1), .3), 'cloth': (cloth, .3), 'click': (rclick, .45),
      'portalOpen': (portal_open, .5), 'suck': (suck, .45), 'portalWhoosh': (portal_whoosh, .45), 'slide': (slide, .3), 'thud': (thud, .5),
      'volcano': (volcano_, .55), 'jump': (jump, .3), 'boing': (boing, .4),
      'twinkle': (twinkle, .3), 'blip': (blip, .25), 'gulp': (gulp, .5), 'impact': (impact, .7), 'brr': (brr, .35), 'growl': (growl, .55), 'fall': (fall, .35),
      'whistle': (whistle_ref, .35), 'skid': (skid, .35), 'dive': (dive, .35), 'stamp': (stamp_, .55), 'squish': (squish, .35), 'coo': (coo, .45),
      'roar': (roar, .35), 'camera': (camera, .4), 'caw': (caw, .4), 'harp': (harp, .3)}
DFX = {'rolling': (rolling, .2), 'tick': (tickd, .3), 'portalHum': (portal_hum, .12), 'meteor': (meteor, .45), 'meteorSmall': (meteor, .3), 'fire': (fire, .35), 'wind': (wind, .3),
       'zoomOut': (lambda d: zoom_(d, False), .25), 'zoomIn': (lambda d: zoom_(d, True), .25), 'crowd': (crowd, .08), 'crickets': (crickets, .3), 'flutter': (flutter, .3), 'gulls': (gulls, .2),
       'marker': (marker, .25)}
for e in E['ev']:
    ty, t = e['type'], e['t']
    if ty in FX: f, gdb = FX[ty]; add(sfxb, f() * e.get('g', 1), t, gdb, float(rng.uniform(-.2, .2)))
    elif ty in DFX: f, gdb = DFX[ty]; add(sfxb, f(e['d']), t, gdb)
    elif ty == 'steps': add(sfxb, steps(e['d'], e.get('fast', 0)), t, .3)

# —— ambiências ——
def amb_rain(d): return lp(brown_(d), 500) * .04 + hp(nz(d), 2500) * .03
def amb_jungle(d):
    tt = t_(d); x = lp(brown_(d), 300) * .03 + hp(nz(d), 4000) * .004
    for k in range(int(d / 1.3)):
        dd = .25; c = np.sin(2 * np.pi * np.cumsum(np.linspace(2200, 3200, int(dd * SR))) / SR) * np.sin(np.pi * t_(dd) / dd) * .02; s = int((k * 1.3 + rng.random() * .6) * SR); x[s:s + len(c)] += c[:max(0, len(x) - s)]
    return x
def amb_field(d): return lp(brown_(d), 700) * .03
def amb_cave(d): tt = t_(d); return lp(brown_(d), 180) * .04
def amb_sea(d): tt = t_(d); return lp(brown_(d), 600) * .04 * (.7 + .3 * np.sin(2 * np.pi * .2 * tt))
AMB = {'rain': amb_rain, 'jungle': amb_jungle, 'field': amb_field, 'cave': amb_cave, 'sea': amb_sea}
for e in E['ev']:
    if e['type'] == 'amb' and e['w'] in AMB: add(amb, fade(AMB[e['w']](e['d']), .04, .06), e['t'], 1.0)

# —— vozes: narrador seco e à frente; Noé e Rex com reflexões curtas (estão "na cena") ——
from scipy.signal import fftconvolve
vn, vc = np.zeros((N, 2)), np.zeros((N, 2))
for e in E['ev']:
    if e['type'] != 'vo': continue
    p = os.path.join(HERE, 'voices', e['id'] + '.wav')
    if not os.path.exists(p): print('sem áudio para', e['id']); continue
    y, sr = sf.read(p)
    if y.ndim > 1: y = y.mean(1)
    who = e.get('who', 'N')
    if who == 'NOE': y = y + lp(y, 250) * .25                      # um pouco mais de corpo, voz de velho
    if who == 'REX': y = y + hp(y, 2500) * .25                     # presença
    y = compress(y / np.abs(y).max(), .3, 2.5)
    y = y / (np.sqrt((y ** 2).mean()) + 1e-9) * (.12 if who == 'N' else .115)
    if who == 'N': add(vn, y, e['t'], 1.0, 0)
    else: add(vc, y, e['t'], 1.0, -.08 if who == 'NOE' else .08)
er = np.zeros(int(.07 * SR)); er[0] = 1
for dly, gdb in [(.011, .14), (.023, .1), (.041, .06)]: er[int(dly * SR)] += gdb
vc = np.stack([fftconvolve(vc[:, c], er)[:N] for c in range(2)], 1)
vob = vn + vc

# —— trilha: 14 dB abaixo da voz + ducking de 9 dB sob a fala ——
mus, _ = sf.read(os.path.join(HERE, 'music', 'score.wav'))
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
act = (np.abs(vob).max(1) > .01).astype(float)
def rms(x, m=None): x = x if m is None else x[m > 0]; return np.sqrt((x ** 2).mean() + 1e-12)
v_rms = rms(vob.mean(1), act)
m_rms = rms(mus.mean(1), (np.abs(mus).max(1) > 1e-4).astype(float))
mus = mus * (v_rms / m_rms) * 10 ** (-14 / 20)
duck = 1 - (1 - 10 ** (-9 / 20)) * np.clip(uniform_filter1d(maximum_filter1d(act, int(.35 * SR)), int(.2 * SR)), 0, 1)
mix = mus * duck[:, None] + sfxb * .6 + vob + amb * .8
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
sf.write(os.path.join(HERE, 'mix.wav'), mix.astype(np.float32), SR)
def db(x): return 20 * np.log10(rms(x) + 1e-12)
print('pico %.3f | voz %.1f dB  música(sob a voz) %.1f dB  música(sem voz) %.1f dB  sfx %.1f dB' % (np.abs(mix).max(), db(vob.mean(1)[act > 0]), db((mus * duck[:, None]).mean(1)[act > 0]), db((mus * duck[:, None]).mean(1)[act == 0]), db(sfxb.mean(1))))
