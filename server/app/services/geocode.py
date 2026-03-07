import requests

NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "OnTimePlanner/0.1 (student project)",
    "Accept-Language": "en",
}

def _search(params):
    res = requests.get(NOMINATIM_BASE, params=params, headers=HEADERS, timeout=15)
    res.raise_for_status()
    return res.json()

def _pick_first(data):
    if not isinstance(data, list) or len(data) == 0:
        return None
    first = data[0]
    return {
        "lat": float(first["lat"]),
        "lon": float(first["lon"]),
        "label": first.get("display_name", ""),
    }

def _remove_leading_house_number(street):
    import re
    return re.sub(r"^\s*\d+\s+", "", str(street or "").strip())

def geocode_structured(parts):
    street = str(parts.get("street", "")).strip()
    city = str(parts.get("city", "")).strip()
    state = str(parts.get("state", "")).strip().upper()
    zip_code = str(parts.get("zip", "")).strip()

    data = _search({
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
        "street": street,
        "city": city,
        "state": state,
        "postalcode": zip_code,
        "countrycodes": "us",
    })

    hit = _pick_first(data)
    if hit:
        return {**hit, "usedFallback": False}

    street_no_number = _remove_leading_house_number(street)
    if street_no_number and street_no_number != street:
        data = _search({
            "format": "json",
            "limit": 1,
            "addressdetails": 1,
            "street": street_no_number,
            "city": city,
            "state": state,
            "postalcode": zip_code,
            "countrycodes": "us",
        })
        hit = _pick_first(data)
        if hit:
            return {**hit, "usedFallback": True}

    data = _search({
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
        "city": city,
        "state": state,
        "postalcode": zip_code,
        "countrycodes": "us",
    })
    hit = _pick_first(data)
    if hit:
        return {**hit, "usedFallback": True}

    raise ValueError(f'No geocoding results for "{street}, {city}, {state} {zip_code}"')
