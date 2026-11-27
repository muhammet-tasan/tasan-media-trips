#!/usr/bin/env python3
"""Fetch real driving routes (OSRM public demo server, car profile, OSM roads) for a Route Check.

Usage: python3 scripts/fetch-routes.py <slug>
Reads  src/<slug>/route-check.json  (destination + origins with coords)
Writes public/geo/<slug>-routes.geojson  (one LineString per origin, keyed by origin.key)
Run once per video and commit the result; renders never call OSRM.
Prints OSRM distance/duration per origin so you can fill the `time` labels in the config.
"""
import json, sys, time, urllib.request, datetime, pathlib

slug = sys.argv[1]
root = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((root / f"src/{slug}/route-check.json").read_text(encoding="utf-8"))
dest = cfg["destination"]["coords"]
features = []
for o in cfg["origins"]:
    url = (f"https://router.project-osrm.org/route/v1/driving/{o['coords']['lon']},{o['coords']['lat']};"
           f"{dest['lon']},{dest['lat']}?overview=full&geometries=geojson")
    req = urllib.request.Request(url, headers={"User-Agent": "tasan-trips-routecheck/1.0"})
    route = json.load(urllib.request.urlopen(req, timeout=30))["routes"][0]
    coords = route["geometry"]["coordinates"]
    kept = coords[::3] + ([coords[-1]] if (len(coords) - 1) % 3 else [])
    km, mn = round(route["distance"] / 1000, 1), round(route["duration"] / 60, 1)
    print(f"{o['key']:12s} {km:6.1f} km  {mn:5.1f} min  ({len(kept)} pts)")
    features.append({"type": "Feature",
                     "properties": {"origin": o["key"], "distance_km_osrm": km, "duration_min_osrm": mn},
                     "geometry": {"type": "LineString", "coordinates": kept}})
    time.sleep(1.1)
out = {"type": "FeatureCollection",
       "metadata": {"source": "Routed via OSRM (Project OSRM) public demo server, https://router.project-osrm.org, car profile, over OpenStreetMap road network data.",
                    "note": "OSRM durations ignore traffic; use as reference for the on-screen time labels.",
                    "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "simplification": "Every 3rd coordinate kept (plus final point)."},
       "features": features}
(root / f"public/geo/{slug}-routes.geojson").write_text(json.dumps(out), encoding="utf-8")
