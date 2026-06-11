import json, sys
from graphify.detect import detect
from pathlib import Path

input_path = Path(sys.argv[1])
result = detect(input_path)
print(json.dumps(result, ensure_ascii=False))
