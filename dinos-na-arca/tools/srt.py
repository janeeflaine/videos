# Legenda à parte (o filme não tem legenda na imagem): cada fala com o tempo dela → cade-os-dinossauros.srt
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lines import LINES
P = os.path.dirname(os.path.abspath(__file__)) + '/..'
E = json.load(open(P + '/events.json')); dur = json.load(open(P + '/voices/dur.json'))
NAME = {'N': '', 'NOE': 'NOÉ: ', 'REX': 'REX: '}
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f'{int(h):02}:{int(m):02}:{int(s):02},{int(round((s % 1) * 1000)) % 1000:03}'
out = []
for i, e in enumerate([e for e in E['ev'] if e['type'] == 'vo']):
    who, txt = LINES[e['id']]; txt = re.sub(r'\[[^\]]*\]\s*', '', txt).strip()
    out.append(f"{i + 1}\n{ts(e['t'])} --> {ts(e['t'] + dur[e['id']] + .2)}\n{NAME[who]}{txt}\n")
open(P + '/cade-os-dinossauros.srt', 'w').write('\n'.join(out)); print(len(out), 'falas')
