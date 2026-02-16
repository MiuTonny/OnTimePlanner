/**
 * Dashboard
 *
 * PURPOSE:
 * - Landing page of the app
 * - Displays saved plans from localStorage
 * - Allows the user to:
 *   - Create a new plan
 *   - Open an existing plan
 *   - Delete a saved plan
 * - Shows an aggregated summary for the last 7 days
 *
 * WHY THIS MATTERS (teacher discussion):
 * - Demonstrates stateful UI based on persisted data
 * - Demonstrates derived calculations (weekly totals) from stored metrics
 * - Keeps localStorage reads/writes in a storage utility (separation of concerns)
 */

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getPlans, removePlan } from "../utils/storage";

/**
 * Format minutes as "1 hr 23 min" (better UX than raw minutes).
 */
function formatDuration(totalMinutes) {
  const m = Number(totalMinutes) || 0;
  const h = Math.floor(m / 60);
  const r = m % 60;

  if (h === 0) return `${r} min`;
  if (r === 0) return `${h} hr`;
  return `${h} hr ${r} min`;
}

/**
 * Safe date check: "is this plan within the last N days?"
 * We use createdAt if present; otherwise, metrics.updatedAt as fallback.
 */
function isWithinLastDays(plan, days) {
  const source =
    plan?.createdAt || plan?.metrics?.updatedAt || null;

  if (!source) return false;

  const t = Date.parse(source);
  if (Number.isNaN(t)) return false;

  const now = Date.now();
  const ms = days * 24 * 60 * 60 * 1000;
  return now - t <= ms;
}

export default function Dashboard() {
  /**
   * plans state
   * - Single source of truth for what we display on screen
   * - Loaded from localStorage on mount and refreshed after delete
   */
  const [plans, setPlans] = useState([]);

  /**
   * loadPlans
   * - helper so we can reuse it on first render + after deletes + on refresh button
   */
  function loadPlans() {
    const stored = getPlans();
    setPlans(stored);
  }

  /**
   * useEffect
   * - Run once when Dashboard mounts
   * - Load stored plans from localStorage into state
   */
  useEffect(() => {
    loadPlans();
  }, []);

  /**
   * handleDelete
   * - removePlan writes to localStorage but does NOT return the updated list
   * - so we reload plans afterward to keep UI in sync
   */
  function handleDelete(planId) {
    removePlan(planId);
    loadPlans();
  }

  /**
   * weeklyPlans (last 7 days)
   * - Derived list used for the summary card
   */
  const weeklyPlans = useMemo(() => {
    return plans.filter((p) => isWithinLastDays(p, 7));
  }, [plans]);

  /**
   * weeklyTotals
   * - Derived aggregated totals from all plans in weeklyPlans
   * - Uses persisted plan.metrics when available (computed in PlanResults)
   *
   * NOTE:
   * - If a plan doesn't have metrics yet, we skip it in totals.
   *   (Metrics are created after viewing Results and completing API fetch.)
   */
  const weeklyTotals = useMemo(() => {
    const totals = {
      plansCount: weeklyPlans.length,
      plansWithMetrics: 0,
      miles: 0,
      driveMinutes: 0,
      serviceMinutes: 0,
      totalMinutes: 0,
      gasCost: 0,
    };

    for (const p of weeklyPlans) {
      if (!p.metrics) continue;

      totals.plansWithMetrics += 1;

      totals.miles += Number(p.metrics.miles || 0);
      totals.driveMinutes += Number(p.metrics.driveMinutes || 0);
      totals.serviceMinutes += Number(p.metrics.serviceMinutes || 0);
      totals.totalMinutes += Number(p.metrics.totalMinutes || 0);
      totals.gasCost += Number(p.metrics.gasCost || 0);
    }

    return totals;
  }, [weeklyPlans]);

  return (
    <div className="page">
      <h1>OnTimePlanner</h1>

      <p className="muted" style={{ marginTop: 6 }}>
        Build daily routes, estimate time, mileage, and cost.
      </p>

      <div className="actions">
        {/* Navigation to create new plan */}
        <Link className="button primary" to="/plan">
          Create a New Plan
        </Link>

        <Link className="button" to="/goals">
          Goals
        </Link>

        {/* Useful for localStorage apps while testing */}
        <button className="button" onClick={loadPlans}>
          Refresh
        </button>
      </div>

      {/* Weekly summary card */}
      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Weekly Summary (Last 7 days)</h3>

        <p className="muted" style={{ marginTop: 6 }}>
          Totals are based on plans that have route metrics calculated.
          <br />
          (Open a plan’s Results page to generate metrics.)
        </p>

        <ul style={{ marginBottom: 0 }}>
          <li>
            <strong>Plans created:</strong> {weeklyTotals.plansCount}
          </li>
          <li>
            <strong>Plans with metrics:</strong> {weeklyTotals.plansWithMetrics}
          </li>
          <li>
            <strong>Total miles:</strong> {weeklyTotals.miles.toFixed(1)} mi
          </li>
          <li>
            <strong>Total drive time:</strong>{" "}
            {formatDuration(weeklyTotals.driveMinutes)}
          </li>
          <li>
            <strong>Total service time:</strong>{" "}
            {formatDuration(weeklyTotals.serviceMinutes)}
          </li>
          <li>
            <strong>Total week time:</strong>{" "}
            {formatDuration(weeklyTotals.totalMinutes)}
          </li>
          <li>
            <strong>Estimated gas cost:</strong>{" "}
            ${weeklyTotals.gasCost.toFixed(2)}
          </li>
        </ul>
      </div>

      {/* Saved plans list */}
      <h3 style={{ marginTop: 20 }}>Saved Plans</h3>

      {plans.length === 0 ? (
        <p>No saved plans yet. Create one to get started.</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Stops</th>
                <th>Miles</th>
                <th>Total Time</th>
                <th>Gas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                const miles =
                  plan.metrics && typeof plan.metrics.miles === "number"
                    ? plan.metrics.miles.toFixed(1)
                    : "—";

                const totalTime =
                  plan.metrics && typeof plan.metrics.totalMinutes === "number"
                    ? formatDuration(plan.metrics.totalMinutes)
                    : "—";

                const gas =
                  plan.metrics && typeof plan.metrics.gasCost === "number"
                    ? `$${plan.metrics.gasCost.toFixed(2)}`
                    : "—";

                return (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.name}</strong>
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleString() : ""}
                      </div>
                    </td>
                    <td>{plan.stops?.length || 0}</td>
                    <td>{miles}</td>
                    <td>{totalTime}</td>
                    <td>{gas}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link className="button" to={`/plan/${plan.id}`}>
                          Open
                        </Link>
                        <button
                          className="button"
                          onClick={() => handleDelete(plan.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
