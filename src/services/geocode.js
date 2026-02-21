/**
 * geocode.js (Nominatim structured + fallback)
 *
 * PURPOSE:
 * - Convert a structured address into coordinates (lat/lon)
 * - Fall back when house numbers aren't present in OSM data
 *
 * STRATEGY:
 * 1) Try full structured address (street includes house number)
 * 2) If that fails, remove leading house number and try again
 * 3) If that fails, fall back to city/state/zip area lookup
 *
 * IMPORTANT (Project 1 Dev Setup):
 * - call "/nominatim/search" instead of the full domain.
 * - Vite proxy forwards this to https://nominatim.openstreetmap.org
 * - This avoids CORS issues in the browser.
 */

const NOMINATIM_BASE = "/nominatim/search";

async function nominatimSearch(paramsObj) {
  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    addressdetails: "1",
    ...paramsObj,
  });

  const url = `${NOMINATIM_BASE}?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // NOTE:
      // We do NOT set "User-Agent" here because browsers forbid it.
      // If using a backend proxy in production, User-Agent should be set there.
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed (${res.status})`);
  }

  return res.json();
}

function pickFirst(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    label: first.display_name || "",
  };
}

function removeLeadingHouseNumber(street) {
  return String(street || "").trim().replace(/^\s*\d+\s+/, "");
}

/**
 * geocodeStructured
 * - addressParts: { street, city, state, zip }
 * - returns: { lat, lon, label, usedFallback }
 */
export async function geocodeStructured(addressParts) {
  const street = String(addressParts.street || "").trim();
  const city = String(addressParts.city || "").trim();
  const state = String(addressParts.state || "").trim().toUpperCase();
  const zip = String(addressParts.zip || "").trim();

  // 1) Full structured (best accuracy)
  let data = await nominatimSearch({
    street,
    city,
    state,
    postalcode: zip,
    countrycodes: "us",
  });

  let hit = pickFirst(data);
  if (hit) return { ...hit, usedFallback: false };

  // 2) Fallback: remove house number from street (street-level geocode)
  const streetNoNumber = removeLeadingHouseNumber(street);
  if (streetNoNumber && streetNoNumber !== street) {
    data = await nominatimSearch({
      street: streetNoNumber,
      city,
      state,
      postalcode: zip,
      countrycodes: "us",
    });

    hit = pickFirst(data);
    if (hit) return { ...hit, usedFallback: true };
  }

  // 3) Fallback: area centroid using city/state/zip (route still possible)
  data = await nominatimSearch({
    city,
    state,
    postalcode: zip,
    countrycodes: "us",
  });

  hit = pickFirst(data);
  if (hit) return { ...hit, usedFallback: true };

  throw new Error(
    `No geocoding results for: "${street}, ${city}, ${state} ${zip}". Try checking spelling or using a nearby landmark.`
  );
}

/**
 * geocodeAddress
 * - Free-form fallback (string)
 * - returns: { lat, lon, label, usedFallback }
 */
export async function geocodeAddress(address) {
  const q = String(address || "").trim();
  const data = await nominatimSearch({ q, countrycodes: "us" });
  const hit = pickFirst(data);

  if (!hit) {
    throw new Error(`No geocoding results for: "${q}"`);
  }

  // Free-form geocode is considered fallback behavior
  return { ...hit, usedFallback: true };
}
