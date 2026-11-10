# Gera as falas do Seu Chicó e da Dona Zefinha no ElevenLabs (modelo v4), direto do ROTEIRO.md,
# e salva voices/NN-quem.mp3 + words/NN-quem.json (tempo de cada palavra, pela alinhamento da própria API).
# O Lorenzo é feito à mão pela autora. Uso: python3 vozes.py [números das falas, ex.: 4 9]  (sem números: todas)
# A chave da API é injetada pelo proxy do ambiente; o valor abaixo é só um marcador.
import json, os, re, sys, base64, urllib.request
P = os.path.dirname(os.path.abspath(__file__))
VOZ = {'chico': 'RGbeQtiShYRDVCrd9b9w', 'zefinha': 'FrCDCQwye0euHmliGxP9'}
MODEL = 'eleven_v4'
rows = re.findall(r'^\| (\d+) \| `(\d\d-(\w+))\.mp3` \| [^|]+ \| (.+?) \|$', open(f'{P}/ROTEIRO.md', encoding='utf-8').read(), re.M)
only = {int(a) for a in sys.argv[1:]}
os.makedirs(f'{P}/voices', exist_ok=True); os.makedirs(f'{P}/words', exist_ok=True)
for n, name, who, text in rows:
    if who not in VOZ or (only and int(n) not in only): continue
    text = text.strip()
    body = json.dumps({'text': text, 'model_id': MODEL, 'language_code': 'pt',
                       'voice_settings': {'stability': .5, 'similarity_boost': .75}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ[who]}/with-timestamps?output_format=mp3_44100_128',
                                 body, {'xi-api-key': 'injected-by-proxy', 'Content-Type': 'application/json'})
    d = json.load(urllib.request.urlopen(req, timeout=300))
    open(f'{P}/voices/{name}.mp3', 'wb').write(base64.b64decode(d['audio_base64']))
    a = d['alignment']; ch, s0, s1 = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
    words, cur, depth = [], None, 0
    for c, a0, a1 in zip(ch, s0, s1):  # palavras faladas; o que está entre colchetes (marcações de emoção) fica de fora
        if c == '[': depth += 1
        if depth or c.isspace():
            if cur: words.append(cur); cur = None
            if c == ']': depth -= 1
            continue
        if cur is None: cur = {'text': '', 'start': a0, 'end': a1}
        cur['text'] += c; cur['end'] = a1
    if cur: words.append(cur)
    words = [w for w in words if re.search(r'\w', w['text'])]
    for w in words: w['start'], w['end'] = round(w['start'], 3), round(w['end'], 3)
    spoken = re.sub(r'\[[^\]]*\]\s*', '', text).strip()
    json.dump({'text': spoken, 'words': words, 'model': MODEL, 'voice': VOZ[who]}, open(f'{P}/words/{name}.json', 'w'), ensure_ascii=False)
    print(f'{name}: {words[-1]["end"]:.2f} s, {len(words)} palavras')
