#!/usr/bin/env python3
"""Tell Bing and other IndexNow engines about every URL in sitemap.xml.
Run after each deploy:  python3 scripts/indexnow.py
Pass URLs to submit only those:  python3 scripts/indexnow.py https://aismartr.com/new-page.html
"""
import json, re, sys, urllib.request
HOST = "aismartr.com"
KEY = "01d260d7aa954e409deca123ee614f12"
urls = sys.argv[1:]
if not urls:
    sm = urllib.request.urlopen(f"https://{HOST}/sitemap.xml").read().decode()
    urls = re.findall(r"<loc>([^<]+)</loc>", sm)
body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
try:
    r = urllib.request.urlopen(req)
    print("IndexNow:", r.status, "submitted", len(urls), "URLs")
except urllib.error.HTTPError as e:
    print("IndexNow error", e.code, e.read().decode()[:200])
