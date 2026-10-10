"""Restore the selected catalogue photography using its checked-in source manifest."""
import concurrent.futures
import json
import pathlib
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
photos = json.loads((root / 'docs/photo-sources.json').read_text())
target_dir = root / 'frontend/public/images'
target_dir.mkdir(parents=True, exist_ok=True)

def fetch(photo):
    target = target_dir / photo['file']
    target.write_bytes(urllib.request.urlopen(photo['image'], timeout=30).read())
    return target.name

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    for name in executor.map(fetch, photos):
        print(name, 'downloaded')
