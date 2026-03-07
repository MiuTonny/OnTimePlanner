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
import { fetchPlan, computePlanMetrics } from "../services/api";

/** Format minutes into a readable string: 83 → "1 hr 23 min". */
function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
export default function PlanResults() {
  const { id } = useParams();

  // Plan is loaded from backend and stored in React state
  const [plan, setPlan] = useState(null);

  // Async UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Load the plan whenever the route id changes
   * This avoids effects depending on unstable object references.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      try {
        const found = await fetchPlan(id);
        if (!cancelled) setPlan(found);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load plan.");
          setPlan(null);
        }
      }
    }

    loadPlan();

    return () => {
      cancelled = true;
    };
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

      try {
        const updated = await computePlanMetrics(plan.id);

        if (!cancelled) {
          setPlan(updated);
        }

      } catch (err) {

        if (!cancelled) {
          setError(err.message || "Failed to compute route details.");
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    }

    if (!plan.metrics) {
      run();
    }

    return () => {
      cancelled = true;
    };

  }, [plan?.id, plan?.metrics]);


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
      : 0;

  const miles =
    metrics && typeof metrics.miles === "number"
      ? metrics.miles
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
    metrics && typeof metrics.gasCost === "number"
      ? metrics.gasCost
      : null;


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

      {!loading && !error && metrics && (
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
