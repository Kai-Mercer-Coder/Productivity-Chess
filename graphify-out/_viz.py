import sys, json
from graphify.build import build_from_json
from graphify.export import to_html
from pathlib import Path

# Rebuild the graph from extraction data
extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
labels_data = json.loads(Path('graphify-out/.graphify_labels.json').read_text(encoding='utf-8'))
analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
labels = {int(k): v for k, v in labels_data.items()}
member_counts = {cid: len(members) for cid, members in communities.items()}

to_html(G, communities, output_path='graphify-out/graph.html', community_labels=labels, member_counts=member_counts)
print('HTML graph generated at graphify-out/graph.html')
