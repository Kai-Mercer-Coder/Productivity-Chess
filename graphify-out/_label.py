import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

labels = {
    0: "Chess Engine Core",
    1: "Utility Functions & UI Cards",
    2: "Game Review & Evaluation",
    3: "Chess Board UI System",
    4: "Project Configuration",
    5: "Puzzle Caching System",
    6: "App Layout & Styling",
    7: "Biome Config & Assistants",
    8: "Package Dependencies",
    9: "TypeScript Configuration",
    10: "Analysis Page UI",
    11: "Auth & API Routes",
    12: "Skills Lock Config",
    13: "OpenCode Plugin Schema",
    14: "Graphify Plugin Config",
    15: "OpenCode Dependencies",
    16: "Login Button Component",
    17: "Client Utilities",
    18: "Feedback Issue Template",
    19: "Base Logic Re-exports",
    20: "Dashboard Page",
    21: "Puzzle Shard Ranges",
    22: "Login Page",
    23: "Login Page Component",
    24: "OpenCode Package Config",
    25: "Puzzle Route Handler",
    26: "Skill Feedback Reference",
    27: "Supabase Skill",
}

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding='utf-8')
print('Report updated with community labels')
