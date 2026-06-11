import json, glob
from pathlib import Path

chunks = sorted(glob.glob('graphify-out/.graphify_chunk_0[0-9].json'))
all_nodes, all_edges, all_hyperedges = [], [], []
total_in, total_out = 0, 0

for c in chunks:
    if not Path(c).exists():
        print(f'MISSING: {c}')
        continue
    d = json.loads(Path(c).read_text(encoding='utf-8'))
    if isinstance(d, list):
        print(f'{c}: is a LIST with {len(d)} items')
        continue
    all_nodes += d.get('nodes', [])
    all_edges += d.get('edges', [])
    all_hyperedges += d.get('hyperedges', [])
    total_in += d.get('input_tokens', 0)
    total_out += d.get('output_tokens', 0)
    dn = len(d.get("nodes",[]))
    de = len(d.get("edges",[]))
    print(f'{c}: {dn} nodes, {de} edges')

out = {
    'nodes': all_nodes, 'edges': all_edges, 'hyperedges': all_hyperedges,
    'input_tokens': total_in, 'output_tokens': total_out,
}
Path('graphify-out/.graphify_semantic_new.json').write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'Merged {len(chunks)} chunks: {len(all_nodes)} nodes, {len(all_edges)} edges, {total_in:,} in / {total_out:,} out tokens')

# Save to cache
from graphify.cache import save_semantic_cache
saved = save_semantic_cache(all_nodes, all_edges, all_hyperedges)
print(f'Cached {saved} files')

# semantic.json = new results (no cached)
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'Semantic extraction: {len(all_nodes)} nodes, {len(all_edges)} edges')
