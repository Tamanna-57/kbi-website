#!/usr/bin/env python3
"""
Sync local content/machines.json → live GCS store (test or production).
For each machine, does a PUT with all fields so blank records get filled in.

Usage:
    python migrate_machines.py https://<service-url> Kbi@Admin2026
"""
import sys, json, urllib.request, urllib.parse, http.cookiejar

BASE   = (sys.argv[1] if len(sys.argv) > 1 else
          'https://kbi-website-tamanna-test-943483190840.asia-south1.run.app').rstrip('/')
PASSWD = sys.argv[2] if len(sys.argv) > 2 else 'Kbi@Admin2026'

with open('content/machines.json') as f:
    LOCAL = json.load(f)

jar    = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
opener.addheaders = [('User-Agent', 'migrate-machines/1.0')]

def post_form(url, data):
    body = urllib.parse.urlencode(data).encode()
    opener.open(urllib.request.Request(url, data=body, method='POST'))

def api_get(url):
    with opener.open(urllib.request.Request(url)) as r:
        return json.loads(r.read())

def api_put(url, payload):
    body = json.dumps(payload).encode()
    req  = urllib.request.Request(url, data=body, method='PUT',
                                   headers={'Content-Type': 'application/json'})
    with opener.open(req) as r:
        return json.loads(r.read())

def api_post(url, payload):
    body = json.dumps(payload).encode()
    req  = urllib.request.Request(url, data=body, method='POST',
                                   headers={'Content-Type': 'application/json'})
    with opener.open(req) as r:
        return json.loads(r.read())

print("Logging in …")
post_form(f'{BASE}/admin/login', {'password': PASSWD, 'next': '/'})

print("Fetching machines from GCS …")
remote = api_get(f'{BASE}/api/machines')
remote_ids = {m['id'] for m in remote}
print(f"  found {len(remote)} machines in GCS")

ok = fail = 0
for m in LOCAL:
    mid = m['id']
    payload = {k: v for k, v in m.items() if k != 'id'}
    try:
        if mid in remote_ids:
            api_put(f'{BASE}/api/machines/{mid}', payload)
            print(f"  UPDATE {mid}")
        else:
            api_post(f'{BASE}/api/machines', m)
            print(f"  CREATE {mid}")
        ok += 1
    except Exception as e:
        print(f"  FAIL   {mid}: {e}")
        fail += 1

print(f"\nDone: {ok} synced, {fail} failed.")
