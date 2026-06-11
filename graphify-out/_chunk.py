import json
from collections import defaultdict
from pathlib import Path

lines = Path('graphify-out/.graphify_uncached.txt').read_text(encoding='utf-8').strip().split('\n')
scan_root = r'C:\Users\Jatin Singh\OneDrive\Documents\Random\my-app'

dirs = defaultdict(list)
for line in lines:
    rel = Path(line).relative_to(scan_root)
    parent = str(rel.parent)
    dirs[parent].append(line)

chunks = []
current = []
for dname, files in sorted(dirs.items(), key=lambda x: -len(x[1])):
    if len(current) + len(files) > 25 and len(current) >= 15:
        chunks.append(current)
        current = []
    current.extend(files)
if current:
    # merge trailing small chunk into previous if it's tiny
    if len(current) < 8 and chunks:
        chunks[-1].extend(current)
    else:
        chunks.append(current)

print(f'Chunks: {len(chunks)}, sizes: {[len(c) for c in chunks]}')
for i, chunk in enumerate(chunks):
    out = Path('graphify-out') / f'.graphify_chunk_{i:02d}_files.json'
    out.write_text(json.dumps(chunk, ensure_ascii=False), encoding='utf-8')
    dirs_in_chunk = set(str(Path(f).parent) for f in chunk)
    parts = [d.split("\\")[-1] for d in sorted(dirs_in_chunk)][:5]
    print(f'Chunk {i}: {len(chunk)} files, dirs: {parts}')
