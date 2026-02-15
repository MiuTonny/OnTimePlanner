/**
 * PlanResults
 *
 * PURPOSE:
 * - Display saved plan details
 * - Fetch external API data (geocoding + routing)
 * - Calculate drive time, miles, and total day duration
 *
 * FEATURES:
 * - Structured geocoding with fallback
 * - Loading and error states
 * - Graceful degradation if house-level geocode fails
 * - Derived calculations (no duplicated state)
 * - Stable effect dependencies
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlans } from "../utils/storage";
import { geocodeStructured, geocodeAddress } from "../services/geocode";
import { getRouteStats } from "../services/routing";

/**
 * Convert seconds → minutes (rounded)
 */
function minutesFromSeconds(sec) {
  return Math.round(sec / 60);
}

/**
 * Convert meters → miles
 */
function milesFromMeters(m) {
  return m * 0.000621371;
}

/**
 * Format minutes nicely:
 * 83 → "1 hr 23 min"
 */
function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/**
 * Timeout wrapper to prevent infinite loading
 */
function withTimeout(promise, ms, message = "Request timed out.") {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export default function PlanResults() {
  const { id } = useParams();

  // Stable plan state
  const [plan, setPlan] = useState(null);

  // Async states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [routeStats, setRouteStats] = useState(null);
  const [geoWarnings, setGeoWarnings] = useState([]);

  /**
   * Load saved plan once when route param changes
   */
  useEffect(() => {
    const plans = getPlans();
    const found = plans.find((p) => p.id === id) || null;
    setPlan(found);
  }, [id]);

  /**
   * Derived: total service minutes
   * Always recalculates when plan changes
   */
  const serviceMinutes = useMemo(() => {
    if (!plan) return 0;
    return plan.stops.reduce((sum, s) => sum + Number(s.minutes || 0), 0);
  }, [plan]);

  /**
   * Fetch route details after plan loads
   */
  useEffect(() => {
    if (!plan) return;

    let cancelled = false;

    async function fetchRoute() {
      setLoading(true);
      setError("");
      setRouteStats(null);
      setGeoWarnings([]);

      try {
        const stats = await withTimeout(
          (async () => {
            // 1️⃣ Geocode start (prefer structured)
            const startResult = plan.startParts
              ? await geocodeStructured(plan.startParts)
              : await geocodeAddress(plan.startLocation);

            // 2️⃣ Geocode stops (parallel)
            const stopResults = await Promise.all(
              plan.stops.map((s) =>
                s.parts
                  ? geocodeStructured(s.parts)
                  : geocodeAddress(s.address)
              )
            );

            // Build warnings if fallback used
            const warnings = [];

            if (startResult.usedFallback) {
              warnings.push("Start location was approximated for routing.");
            }

            stopResults.forEach((r, idx) => {
              if (r.usedFallback) {
                warnings.push(`Stop ${idx + 1} was approximated for routing.`);
              }
            });

            if (!cancelled) setGeoWarnings(warnings);

            // 3️⃣ Build coordinate list
            const coordsForRoute = [
              { lat: startResult.lat, lon: startResult.lon },
              ...stopResults.map((c) => ({ lat: c.lat, lon: c.lon })),
            ];

            // 4️⃣ Fetch route stats from OSRM
            return await getRouteStats(coordsForRoute);
          })(),
          12000,
          "Route lookup timed out. Try fewer stops or try again."
        );

        if (!cancelled) setRouteStats(stats);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load route details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRoute();

    return () => {
      cancelled = true;
    };
  }, [plan?.id]);

  /**
   * If plan doesn't exist
   */
  if (!plan) {
    return (
      <div className="page">
        <h1>Route Results</h1>
        <p>Plan not found.</p>
        <Link className="button" to="/">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Derived route metrics
  const driveMinutes = routeStats
    ? minutesFromSeconds(routeStats.durationSeconds)
    : 0;

  const miles = routeStats
    ? milesFromMeters(routeStats.distanceMeters)
    : 0;

  const totalMinutes = serviceMinutes + driveMinutes;

  return (
    <div className="page">
      <h1>Route Results</h1>

      <h2>{plan.name}</h2>

      <p>
        <strong>Start Location:</strong> {plan.startLocation}
      </p>

      <h3>Stops</h3>
      <ol>
        {plan.stops.map((stop) => (
          <li key={stop.id}>
            {stop.address} — {stop.minutes} min
          </li>
        ))}
      </ol>

      <h3>Totals</h3>

      {loading && <p>Loading route details…</p>}

      {!loading && error && (
        <p style={{ color: "crimson" }}>Error: {error}</p>
      )}

      {!loading && !error && geoWarnings.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontWeight: 600 }}>Address notes:</p>
          <ul>
            {geoWarnings.map((w, i) => (
              <li key={i} style={{ opacity: 0.8 }}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && routeStats && (
        <ul>
          <li>
            <strong>Service time:</strong>{" "}
            {formatDuration(serviceMinutes)}
          </li>
          <li>
            <strong>Drive time (estimate):</strong>{" "}
            {formatDuration(driveMinutes)}
          </li>
          <li>
            <strong>Miles (estimate):</strong>{" "}
            {miles.toFixed(1)} mi
          </li>
          <li>
            <strong>Total day time:</strong>{" "}
            {formatDuration(totalMinutes)}
          </li>
        </ul>
      )}

      <div style={{ marginTop: 20 }}>
        <Link className="button" to="/">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
