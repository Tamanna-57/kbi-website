#!/usr/bin/env python3
"""
One-shot migration: write the correct 'sector' field to every customer
record in the live GCS store (test or production).

Usage:
    python migrate_sectors.py https://<your-service-url> Kbi@Admin2026
"""
import sys, json, urllib.request, urllib.parse, http.cookiejar

BASE   = (sys.argv[1] if len(sys.argv) > 1 else 'https://kbi-website-tamanna-test-943483190840.asia-south1.run.app').rstrip('/')
PASSWD = sys.argv[2] if len(sys.argv) > 2 else 'Kbi@Admin2026'

SECTORS = {
    'maruti-suzuki':    'passenger',
    'caparo-maruti':    'passenger',
    'volvo-eicher':     'commercial',
    'euler-motors':     'commercial',
    'kobelco':          'offroad',
    'escorts-kubota':   'offroad',
    'new-holland':      'offroad',
    'carraro':          'offroad',
    'mahindra-defence': 'defence',
    'havells':          'power',
    'delton-cables':    'power',
    'cords-cables':     'power',
}

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
opener.addheaders = [('User-Agent', 'migrate-sectors/1.0')]

def post(url, data):
    body = urllib.parse.urlencode(data).encode()
    req  = urllib.request.Request(url, data=body, method='POST')
    return opener.open(req)

def put(url, payload):
    body = json.dumps(payload).encode()
    req  = urllib.request.Request(url, data=body, method='PUT',
                                   headers={'Content-Type': 'application/json'})
    return opener.open(req)

# 1. Log in
print("Logging in …")
post(f'{BASE}/admin/login', {'password': PASSWD, 'next': '/'})

# Verify session cookie exists
cookies = [c.name for c in jar]
if not cookies:
    print("ERROR: login may have failed — no session cookie set.")
    sys.exit(1)
print(f"  session cookies: {cookies}")

# 2. Fetch current customer list
print("Fetching customers …")
req = urllib.request.Request(f'{BASE}/api/customers')
with opener.open(req) as r:
    customers = json.loads(r.read())
print(f"  found {len(customers)} customers")

# 3. Patch each one
ok = fail = skip = 0
for c in customers:
    cid = c.get('id', '')
    sector = SECTORS.get(cid)
    if sector is None:
        print(f"  SKIP {cid!r} (not in migration map)")
        skip += 1
        continue
    if c.get('sector') == sector:
        print(f"  already {cid} = {sector}")
        skip += 1
        continue
    try:
        with put(f'{BASE}/api/customers/{cid}', {'sector': sector}) as r:
            saved = json.loads(r.read())
        print(f"  SET  {cid} -> {saved.get('sector')}")
        ok += 1
    except Exception as e:
        print(f"  FAIL {cid}: {e}")
        fail += 1

print(f"\nDone: {ok} updated, {skip} skipped, {fail} failed.")
