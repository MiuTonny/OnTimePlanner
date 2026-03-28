/**
 * PlanResults
 *
 * PURPOSE:
 * - Load a saved plan by URL param (:id)
 * - Fetch external API data:
 *   1) Geocode start + stops (handled in backend)
 *   2) Fetch route stats (distance + duration)
 * - Compute totals:
 *   - Service time (stop minutes) + buffer per stop (Goals)
 *   - Drive time (routing API)
 *   - Miles driven (routing API)
 *   - Gas estimate (Goals: MPG + gas price)
 *
 * SAFETY:
 * - Uses loading/error UI
 * - cancellation flag avoids updating state after unmount/navigation
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPlan, computePlanMetrics } from "../services/api";

/** Format minutes into readable string */
function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export default function PlanResults() {
  const { id } = useParams();

  /**
   * Plan state (comes from backend)
   */
  const [plan, setPlan] = useState(null);

  /**
   * Async UI states
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Load plan from backend
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      setLoading(true);
      setError("");

      try {
        const found = await fetchPlan(id);

        if (!cancelled) {
          setPlan(found);
        }

      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load plan.");
          setPlan(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlan();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /**
   * Derived: base service time from stops
   */
  const baseServiceMinutes = useMemo(() => {
    if (!plan || !Array.isArray(plan.stops)) return 0;

    return plan.stops.reduce(
      (sum, s) => sum + Number(s.minutes || 0),
      0
    );
  }, [plan]);

  /**
   * Compute metrics (ONLY if not already present)
   */
  useEffect(() => {
    if (!plan || plan.metrics) return;

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

    run();

    return () => {
      cancelled = true;
    };

  }, [plan?.id]);

  /**
   * If still loading
   */
  if (loading && !plan) {
    return (
      <div className="page">
        <h1>Route Results</h1>
        <p>Loading plan...</p>
      </div>
    );
  }

  /**
   * If no plan after loading
   */
  if (!loading && !plan) {
    return (
      <div className="page">
        <h1>Route Results</h1>
        <p>Plan not found.</p>
        <Link className="button" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  /**
   * Metrics (safe fallback)
   */
  const metrics = plan.metrics || null;

  const driveMinutes = metrics?.driveMinutes ?? 0;
  const miles = metrics?.miles ?? 0;

  const serviceMinutes =
    metrics?.serviceMinutes ?? baseServiceMinutes;

  const totalMinutes =
    metrics?.totalMinutes ?? (serviceMinutes + driveMinutes);

  const gasCost =
    typeof metrics?.gasCost === "number"
      ? metrics.gasCost
      : null;

  return (
    <div className="page">
      <h1>Route Summary</h1>

      <p className="hint">
        This summary helps you understand your full workday before starting.
      </p>

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

      {!loading && error && (
        <p style={{ color: "crimson" }}>Error: {error}</p>
      )}

      {!loading && !error && (
        <ul>
          <li>
            <strong>Service time:</strong>{" "}
            {formatDuration(serviceMinutes)}
            {metrics?.bufferMinutes ? (
              <span className="muted">
                {" "}
                (includes {metrics.bufferMinutes} min buffer/stop)
              </span>
            ) : null}
          </li>

          <li>
            <strong>Drive time:</strong>{" "}
            {formatDuration(driveMinutes)}
          </li>

          <li>
            <strong>Miles:</strong> {Number(miles || 0).toFixed(1)} mi
          </li>

          <li>
            <strong>Total day time:</strong>{" "}
            {formatDuration(totalMinutes)}
          </li>

          <li>
            <strong>Estimated gas cost:</strong>{" "}
            {gasCost !== null ? `$${gasCost.toFixed(2)}` : "—"}
            {metrics?.mpg && metrics?.gasPrice !== undefined ? (
              <span className="muted">
                {" "}
                (MPG {metrics.mpg}, $
                {Number(metrics.gasPrice).toFixed(2)}/gal)
              </span>
            ) : null}
          </li>
        </ul>
      )}

      <div style={{ marginTop: 20 }}>
        <Link className="button" to="/dashboard">
          Back to Dashboard
        </Link>

        <Link className="button primary" to="/reviews">
          Continue → Reviews
        </Link>
      </div>
    </div>
  );
}