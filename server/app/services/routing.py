import requests

OSRM_BASE = "https://router.project-osrm.org"

def get_route_stats(coords):
    if not isinstance(coords, list) or len(coords) < 2:
        raise ValueError("Routing requires at least 2 coordinate points.")

    coord_string = ";".join([f'{c["lon"]},{c["lat"]}' for c in coords])
    url = f"{OSRM_BASE}/route/v1/driving/{coord_string}"
    params = {"overview": "false", "steps": "false"}

    res = requests.get(url, params=params, timeout=20)
    res.raise_for_status()
    data = res.json()

    if not data.get("routes"):
        raise ValueError("No route found for the provided coordinates.")

    route = data["routes"][0]

    return {
        "distanceMeters": float(route.get("distance", 0)),
        "durationSeconds": float(route.get("duration", 0)),
    }
