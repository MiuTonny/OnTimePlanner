/**
 * PlanResults
 *
 * PURPOSE:
 * - Load a saved plan by URL param (:id)
 * - Fetch external API data:
 *   1) Geocode start + stops (structured geocoding with fallbacks)
 *   2) Fetch route stats (distance + duration)
 * - Compute totals:
 *   - Service time (stop minutes) + buffer per stop (Goals)
 *   - Drive time (routing API)
 *   - Miles driven (routing API)
 *   - Gas estimate (Goals: MPG + gas price)
 * - Persist computed metrics back into localStorage so the Dashboard can aggregate
 *
 * SAFETY:
 * - Uses loading/error UI
 * - Timeout prevents infinite loading
 * - cancellation flag avoids updating state after unmount/navigation
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlans, getGoals, updatePlan } from "../utils/storage";
import { geocodeStructured, geocodeAddress } from "../services/geocode";
import { getRouteStats } from "../services/routing";

/** Convert seconds → minutes (rounded). */
function minutesFromSeconds(sec) {
  return Math.round(sec / 60);
}

/** Convert meters → miles. */
function milesFromMeters(m) {
  return m * 0.000621371;
}

/** Format minutes into a readable string: 83 → "1 hr 23 min". */
function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/**
 * withTimeout
 * - Wrap a promise so it errors if it takes too long
 * - Useful because public APIs can be slow sometimes
 */
function withTimeout(promise, ms, message = "Request timed out.") {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export default function PlanResults() {
  const { id } = useParams();

  // Plan is loaded from localStorage and stored in React state
  const [plan, setPlan] = useState(null);

  // Async UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Routing results returned from API
  const [routeStats, setRouteStats] = useState(null);

  // Notes when we approximate addresses (house number missing, etc.)
  const [geoWarnings, setGeoWarnings] = useState([]);

  /**
   * Load the plan whenever the route id changes
   * This avoids effects depending on unstable object references.
   */
  useEffect(() => {
    const plans = getPlans();
    const found = plans.find((p) => p.id === id) || null;
    setPlan(found);
  }, [id]);

  /**
   * Derived: base service minutes from stop list.
   * Not stored in state because it’s derived from plan.stops (source of truth).
   */
  const baseServiceMinutes = useMemo(() => {
    if (!plan || !Array.isArray(plan.stops)) return 0;
    return plan.stops.reduce((sum, s) => sum + Number(s.minutes || 0), 0);
  }, [plan]);

  /**
   * Fetch route stats after plan is loaded.
   */
  useEffect(() => {
    if (!plan) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");
      setRouteStats(null);
      setGeoWarnings([]);

      try {
        const stats = await withTimeout(
          (async () => {
            // 1) Geocode start (prefer structured)
            const startResult = plan.startParts
              ? await geocodeStructured(plan.startParts)
              : await geocodeAddress(plan.startLocation);

            // 2) Geocode stops in parallel
            const stopResults = await Promise.all(
              plan.stops.map((s) =>
                s.parts ? geocodeStructured(s.parts) : geocodeAddress(s.address)
              )
            );

            // Build warnings if any geocodes used fallback
            const warnings = [];
            if (startResult.usedFallback) warnings.push("Start location was approximated for routing.");
            stopResults.forEach((r, idx) => {
              if (r.usedFallback) warnings.push(`Stop ${idx + 1} was approximated for routing.`);
            });

            if (!cancelled) setGeoWarnings(warnings);

            // 3) Build coordinate list for routing API
            const coordsForRoute = [
              { lat: startResult.lat, lon: startResult.lon },
              ...stopResults.map((c) => ({ lat: c.lat, lon: c.lon })),
            ];

            // 4) Call routing API (OSRM)
            return await getRouteStats(coordsForRoute);
          })(),
          12000,
          "Route lookup timed out. Try fewer stops or try again."
        );

        // Only update state + storage if still mounted
        if (!cancelled) {
          setRouteStats(stats);

          /**
           * Compute and persist metrics for aggregation:
           * - driveMinutes, miles from API
           * - buffer/time/cost from Goals
           */
          const goals = getGoals();

          const driveMinutesNow = minutesFromSeconds(stats.durationSeconds);
          const milesNow = milesFromMeters(stats.distanceMeters);

          // Buffer time: overhead per stop (NOT drive time)
          const bufferPerStop = Number(goals.bufferMinutes) || 0;
          const bufferTotal = bufferPerStop * plan.stops.length;

          const serviceMinutesNow = baseServiceMinutes + bufferTotal;
          const totalMinutesNow = serviceMinutesNow + driveMinutesNow;

          // Gas cost estimate
          const mpg = Number(goals.mpg) || 25;
          const gasPrice = Number(goals.gasPrice) || 0;
          const gallons = mpg > 0 ? milesNow / mpg : 0;
          const gasCostNow = gallons * gasPrice;

          const updated = {
            ...plan,
            metrics: {
              miles: milesNow,
              driveMinutes: driveMinutesNow,
              serviceMinutes: serviceMinutesNow,
              totalMinutes: totalMinutesNow,
              gallons,
              gasCost: gasCostNow,
              gasPrice,
              mpg,
              bufferMinutes: bufferPerStop,
              updatedAt: new Date().toISOString(),
            },
          };

          // Persist to localStorage for Dashboard weekly totals
          updatePlan(updated);

          // Also update local state so UI can show metrics immediately
          setPlan(updated);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load route details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [plan?.id, baseServiceMinutes]);

  /**
   * If the plan doesn't exist, show a friendly message
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

  /**
   * Display values:
   * - Prefer persisted metrics if available
   * - Otherwise fall back to routeStats/baseServiceMinutes
   */
  const metrics = plan.metrics || null;

  const driveMinutes =
    metrics && typeof metrics.driveMinutes === "number"
      ? metrics.driveMinutes
      : routeStats
      ? minutesFromSeconds(routeStats.durationSeconds)
      : 0;

  const miles =
    metrics && typeof metrics.miles === "number"
      ? metrics.miles
      : routeStats
      ? milesFromMeters(routeStats.distanceMeters)
      : 0;

  const serviceMinutes =
    metrics && typeof metrics.serviceMinutes === "number"
      ? metrics.serviceMinutes
      : baseServiceMinutes;

  const totalMinutes =
    metrics && typeof metrics.totalMinutes === "number"
      ? metrics.totalMinutes
      : serviceMinutes + driveMinutes;

  const gasCost =
    metrics && typeof metrics.gasCost === "number" ? metrics.gasCost : null;

  return (
    <div className="page">
      <h1>Route Results</h1>

      <h2>{plan.name}</h2>

      <p>
        <strong>Start Location:</strong> {plan.startLocation}
      </p>

      <h3>Stops</h3>
      <ol>
        {Array.isArray(plan.stops) &&
          plan.stops.map((stop) => (
            <li key={stop.id}>
              {stop.address} — {stop.minutes} min
            </li>
          ))}
      </ol>

      <h3>Totals</h3>

      {loading && <p>Loading route details…</p>}

      {!loading && error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && geoWarnings.length > 0 && (
        <div className="warn" style={{ marginTop: 10 }}>
          <p style={{ fontWeight: 700, marginTop: 0 }}>Address notes</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {geoWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && routeStats && (
        <ul>
          <li>
            <strong>Service time:</strong> {formatDuration(serviceMinutes)}
            {metrics && metrics.bufferMinutes ? (
              <span className="muted"> (includes {metrics.bufferMinutes} min buffer/stop)</span>
            ) : null}
          </li>

          <li>
            <strong>Drive time (estimate):</strong> {formatDuration(driveMinutes)}
          </li>

          <li>
            <strong>Miles (estimate):</strong> {miles.toFixed(1)} mi
          </li>

          <li>
            <strong>Total day time:</strong> {formatDuration(totalMinutes)}
          </li>

          <li>
            <strong>Estimated gas cost:</strong>{" "}
            {gasCost !== null ? `$${gasCost.toFixed(2)}` : "—"}
            {metrics && metrics.mpg && metrics.gasPrice !== undefined ? (
              <span className="muted">
                {" "}
                (MPG {metrics.mpg}, ${Number(metrics.gasPrice).toFixed(2)}/gal)
              </span>
            ) : null}
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
