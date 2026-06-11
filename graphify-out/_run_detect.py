import json, sys
from graphify.detect import detect
from pathlib import Path

input_path = Path(sys.argv[1])
result = detect(input_path)
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
print(f'Detected {result["total_files"]} files, ~{result["total_words"]} words')
