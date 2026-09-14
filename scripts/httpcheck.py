"""Crawl the built site over HTTP against a plain static server.

GitHub Pages is a dumb static host: no SPA fallback, no rewrite rules. A plain
`python3 -m http.server` over build/ is therefore a closer model of production
than `vite preview`, which will happily fall back to index.html.

Usage: python3 scripts/httpcheck.py [base-url]
"""
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4183').rstrip('/')


def get(path):
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as r:
            return r.status, r.headers.get('Content-Type'), r.read()
    except urllib.error.HTTPError as e:
        return e.code, None, b''
    except Exception as e:  # noqa: BLE001
        return 'ERR', str(e), b''


pages = ['/', '/api/']
seen, bad = set(), []

for page in pages:
    status, _, body = get(page)
    if status != 200:
        bad.append((page, status))
        continue
    html = body.decode('utf-8', 'replace')
    # Only marker is the inline hydration payload, where the raw content strings
    # legitimately appear. What matters is the rendered markup a visitor sees, and
    # that a reader with JS disabled gets. So strip <script> before checking.
    rendered = re.sub(r'<script\b.*?</script>', '', html, flags=re.S)
    if page == '/' and '<strong' not in rendered:
        bad.append((page, 'no rendered <strong> (segment renderer broken?)'))
    if '**' in rendered:
        bad.append((page, 'literal ** leaked into rendered markup'))
    for raw in re.findall(r'(?:href|src)="([^"]+)"', html):
        if re.match(r'^(https?:|mailto:|data:|#)', raw):
            continue
        url = raw.split('#')[0].split('?')[0]
        if not url:
            continue
        # Do not re-crawl the other page's assets twice.
        target = urllib.parse.urljoin(page, url)
        if target in seen:
            continue
        seen.add(target)
        code, content_type, _ = get(target)
        if code != 200:
            bad.append((f'{page} -> {url}', code))
        # A stylesheet served as text/plain is a silent, invisible failure.
        if url.endswith('.css') and content_type and 'css' not in content_type:
            bad.append((f'{page} -> {url}', f'wrong content-type {content_type}'))

print(f'crawled {len(seen)} local URLs over HTTP')

if bad:
    print('FAILURES:')
    for what, why in bad:
        print(f'   {what}: {why}')
    sys.exit(1)
print('   all 200 OK')

# Endpoints must be typed as JSON, not downloaded as octet-stream.
ENDPOINTS = [
    '/api/user.json',
    '/api/github.json',
    '/api/practice.json',
    '/api/code_learning/leetcode.json',
    '/api/code_learning/codewars.json',
    '/api/code_learning/cssbattle.json',
]
fails = 0
for path in ENDPOINTS:
    status, content_type, body = get(path)
    good = status == 200 and content_type == 'application/json'
    try:
        json.loads(body)
    except Exception:  # noqa: BLE001
        good = False
    if not good:
        fails += 1
    print(f'   {path:38} {status} {content_type:18} {"ok" if good else "BAD"}')
sys.exit(1 if fails else 0)
