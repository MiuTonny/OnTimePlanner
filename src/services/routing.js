/**
 * routing.js
 *
 * PURPOSE:
 * - Fetch route distance/time between coordinates
 *
 * API:
 * - OSRM Route Service
 *   /route/v1/driving/{lon,lat;lon,lat;...}
 *
 * NOTES:
 * - router.project-osrm.org is a DEMO server (ok for student demo).
 *   Not for heavy production usage.
 */

const OSRM_BASE = "https://router.project-osrm.org";

/**
 * getRouteStats
 * - coords: array of { lat, lon } in stop order
 * - returns: { distanceMeters, durationSeconds }
 */
export async function getRouteStats(coords) {
  if (!Array.isArray(coords) || coords.length < 2) {
    throw new Error("Routing requires at least 2 coordinate points.");
  }

  // OSRM expects "lon,lat;lon,lat;..."
  const coordString = coords
    .map((c) => `${c.lon},${c.lat}`)
    .join(";");

  const url = `${OSRM_BASE}/route/v1/driving/${coordString}?overview=false&steps=false`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Routing failed (${res.status}) ${text.slice(0, 120)}`.trim());
  }

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found for the provided coordinates.");
  }

  const route = data.routes[0];

  return {
    distanceMeters: Number(route.distance || 0),
    durationSeconds: Number(route.duration || 0),
  };
}
