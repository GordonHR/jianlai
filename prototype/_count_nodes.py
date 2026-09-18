# -*- coding: utf-8 -*-
import re, os
text = open(r'C:\Users\Administrator\Desktop\jianlai\prototype\game.js', encoding='utf-8').read()
idx = text.find('const AL_NODES')
# end of AL_NODES: find "const AL_" after idx, or "/* 结局" / "function al"
ends = []
for marker in ['/* 结局', 'function al', 'const AL_INTERLUDES', '/* 问心图：id']:
    p = text.find(marker, idx + 20)
    if p > 0: ends.append(p)
idx2 = min(ends) if ends else idx + 120000
block = text[idx:idx2]
keys = re.findall(r'\n([a-z][a-z0-9_]+):\s*\{', block)
print('AL_NODES keys', len(keys))
print(keys)
imgs = re.findall(r"img:\s*'([^']+)'", block)
print('existing imgs in nodes', len(imgs))
# chapters
chs = re.findall(r"ch:\s*'([^']+)'", block)
from collections import Counter
print('chapters', Counter(chs))
# titles
titles = re.findall(r"\n[a-z][a-z0-9_]+:\s*\{[^}]*?t:\s*'([^']+)'", block)
print('sample titles:')
for k, t in zip(keys, titles[:len(keys)]):
    print(f'  {k}: {t}')
print('total titles', len(titles), 'keys', len(keys))
