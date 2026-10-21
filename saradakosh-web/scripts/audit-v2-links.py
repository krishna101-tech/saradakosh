"""Bounded recheck of only the30 adjudicated additions; never edits source data."""
import concurrent.futures
import datetime
import hashlib
import json
import re
import subprocess
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / 'docs/library-v2/adjudicated-public-links.json'
raw = MANIFEST.read_bytes()
manifest = json.loads(raw)
additions = manifest['proposed_additions']
assert len(additions) == 30
cached_bodies = {}
cache_lock = threading.Lock()


def response_body(url):
    # Fragment targets share one HTTP representation. Fetch the multi-megabyte
    # omnibus once, then independently check each approved anchor in that body.
    base = urllib.parse.urldefrag(url).url
    with cache_lock:
        future = cached_bodies.get(base)
        if future is None:
            future = concurrent.futures.Future()
            cached_bodies[base] = future
            fetch = True
        else:
            fetch = False
    if fetch:
        try:
            req = urllib.request.Request(base, headers={'User-Agent': 'SaradaKosh-Version02-Validation/1.0'})
            with urllib.request.urlopen(req, timeout=45) as response:
                future.set_result((response.status, response.url, response.headers.get('Content-Type'), response.read(12_000_000)))
        except Exception as error:
            future.set_exception(error)
    return future.result()


def audit(link):
    url = link['url']
    result = {key: link[key] for key in ('book_id', 'label', 'url')}
    try:
        status, final_url, content_type, body = response_body(url)
        if body:
            text = body.decode('utf-8', errors='replace')
            anchor = urllib.parse.unquote(urllib.parse.urlsplit(url).fragment)
            title = re.search(r'<title[^>]*>(.*?)</title>', text, re.I | re.S)
            result.update(status=status, final_url=final_url,
                          content_type=content_type, bytes_read=len(body),
                          body_sha256=hashlib.sha256(body).hexdigest(),
                          title=re.sub(r'\s+', ' ', title.group(1)).strip() if title else None,
                          anchor=anchor or None,
                          anchor_present=(bool(re.search(r'(?:id|name)\s*=\s*[\"\']' + re.escape(anchor) + r'[\"\']', text, re.I)) if anchor else None),
                          pdf_header=body.startswith(b'%PDF-'))
            result['pass'] = status == 200 and len(body) > 1000 and (not anchor or result['anchor_present'])
    except (OSError, urllib.error.URLError) as error:
        result.update(status=getattr(error, 'code', None), error=str(error), **{'pass': False})
    return result


with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(audit, additions))
report = {'observed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'source_sha': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
          'manifest_sha256': hashlib.sha256(raw).hexdigest(),
          'scope': 'Exact30 new additions, actual GET/body/anchor reachability. T1 remains authority for completeness, edition and rights; HTTP200 alone does not certify those.',
          'passed': sum(item['pass'] for item in results), 'total': len(results), 'results': results}
Path(sys.argv[1]).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'passed': report['passed'], 'total': len(results)}))
sys.exit(0 if all(item['pass'] for item in results) else 1)
