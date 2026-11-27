#!/usr/bin/env python3
"""Scaffold a Route Check for a new video (S6/S7 of docs/PRODUCTION_PROCESS.md).

Usage:
  python3 scripts/new-route-check.py <slug> --name "NaturOparC" --tagline "Tier- und Naturpark" \
      --place "NaturOparC Hunawihr" --heading "ANFAHRT ZUM NATURPARK" --subtitle "Hunawihr · Elsass · Frankreich" \
      --origins "Basel|CH,Freiburg|DE,Colmar|FR,Strasbourg|FR"

Needs: destination search text (--place) or --lat/--lon; origins as "Name|CountryCode" (first = emphasised,
Nominatim geocodes them; use "Name, Region|CC" if ambiguous). Optional --country FR for the destination tag.
Does: geocode -> src/<slug>/route-check.json -> fetch OSRM routes -> fill `time` with OSRM minutes rounded to 5
-> src/<slug>/<Name>RouteCheck.tsx wrapper -> prints the Root.tsx <Composition> to paste.
Never fills `infoLines` (parking/transit) — add only verified facts. Existing files are not overwritten.
Afterwards: render the final frame, fix label collisions (labelOffset, countryLabels), see BROLL_GUIDELINES §13.
"""
import argparse, json, pathlib, re, subprocess, sys, time, urllib.parse, urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("slug"); ap.add_argument("--name", required=True); ap.add_argument("--tagline", default="")
ap.add_argument("--place"); ap.add_argument("--lat", type=float); ap.add_argument("--lon", type=float)
ap.add_argument("--heading", required=True); ap.add_argument("--subtitle", required=True)
ap.add_argument("--origins", required=True); ap.add_argument("--country", default="FR")
a = ap.parse_args()

def geocode(q):
    url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + urllib.parse.quote(q)
    res = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "tasan-trips-routecheck/1.0"}), timeout=30))
    time.sleep(1.1)
    if not res: sys.exit(f"geocoding found nothing for: {q}")
    return {"lon": round(float(res[0]["lon"]), 5), "lat": round(float(res[0]["lat"]), 5)}

dest = {"lon": a.lon, "lat": a.lat} if a.lat is not None and a.lon is not None else geocode(a.place or a.name)
origins = []
for i, item in enumerate(a.origins.split(",")):
    label, _, cc = item.partition("|")
    short = label.split(",")[0].strip()
    o = {"key": re.sub(r"[^a-z0-9]", "", short.lower()), "label": short, "country": cc.strip() or None, "time": "?", "coords": geocode(label.strip())}
    if i == 0: o["emphasis"] = True
    origins.append({k: v for k, v in o.items() if v is not None})

cfgdir = root / f"src/{a.slug}"; cfgdir.mkdir(parents=True, exist_ok=True)
cfgpath = cfgdir / "route-check.json"
if cfgpath.exists(): sys.exit(f"{cfgpath} exists - not overwriting")
cfg = {"heading": a.heading, "subtitle": a.subtitle,
       "destination": {"name": a.name, "tagline": a.tagline, "country": a.country, "coords": dest},
       "origins": origins, "infoLines": [], "countryLabels": []}
cfgpath.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")

subprocess.run([sys.executable, str(root / "scripts/fetch-routes.py"), a.slug], check=True)
routes = json.loads((root / f"public/geo/{a.slug}-routes.geojson").read_text(encoding="utf-8"))
mins = {f["properties"]["origin"]: f["properties"]["duration_min_osrm"] for f in routes["features"]}
for o in origins:
    m = max(5, round(mins[o["key"]] / 5) * 5)
    o["time"] = f"{m} Min." if m < 60 else (f"{m // 60} Std." if m % 60 == 0 else f"{m // 60} Std. {m % 60} Min.")
cfgpath.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")

comp = a.name[0].upper() + re.sub(r"[^A-Za-z0-9]", "", a.name)[1:]
wrapper = cfgdir / f"{comp}RouteCheck.tsx"
if not wrapper.exists():
    wrapper.write_text(f"""import React from 'react';
import {{ RouteCheck, RouteCheckConfig, RouteCheckProps }} from '../route-check/RouteCheck';
import config from './route-check.json';

export const {comp}RouteCheck: React.FC<RouteCheckProps> = ({{ holdSeconds }}) => (
	<RouteCheck config={{config as RouteCheckConfig}} routesFile="geo/{a.slug}-routes.geojson" holdSeconds={{holdSeconds}} />
);

export const {comp.upper()}_ROUTE_CHECK_CONFIG = config as RouteCheckConfig;
""", encoding="utf-8")
print(f"""
Created {cfgpath.relative_to(root)} (times = OSRM rounded, no traffic - overwrite with researched values if you have them) and {wrapper.relative_to(root)}.
Add to src/Root.tsx (imports: {{ {comp}RouteCheck, {comp.upper()}_ROUTE_CHECK_CONFIG }} from './{a.slug}/{comp}RouteCheck'; {{ routeCheckTimeline }} from './route-check/RouteCheck'):
<Composition id="{comp}RouteCheck" component={{{comp}RouteCheck}} defaultProps={{{{ holdSeconds: 5 }}}}
  calculateMetadata={{({{ props }}) => ({{ durationInFrames: routeCheckTimeline({comp.upper()}_ROUTE_CHECK_CONFIG, props.holdSeconds).duration }})}}
  durationInFrames={{420}} fps={{30}} width={{1920}} height={{1080}} />
Then: npx remotion still src/index.ts {comp}RouteCheck out/{a.slug}/still_end.png --frame=419  -> check labels, add countryLabels/labelOffset.""")
