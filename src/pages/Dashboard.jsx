/**
 * Dashboard
 *
 * PURPOSE:
 * - Landing page of the app
 * - Displays saved plans from backend API (instead of localStorage)
 * - Allows the user to:
 *   - Create a new plan
 *   - Open an existing plan
 *   - Delete a saved plan
 * - Shows an aggregated summary for the last 7 days
 *
 * WHY THIS MATTERS:
 * - Demonstrates stateful UI based on backend data
 * - Demonstrates derived calculations (weekly totals) from stored metrics
 * - Shows separation of concerns (API layer vs UI)
 */

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchPlans, deletePlan } from "../services/api";

/**
 * Format minutes as "1 hr 23 min"
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
 * Check if plan is within last N days
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
   */
  const [plans, setPlans] = useState([]);

  /**
   * loading state
   */
  const [loading, setLoading] = useState(false);

  /**
   * loadPlans
   */
  async function loadPlans() {
    setLoading(true);

    try {
      const data = await fetchPlans();
      setPlans(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load plans on mount
   */
  useEffect(() => {
    loadPlans();
  }, []);

  /**
   * handleDelete
   */
  async function handleDelete(planId) {
    const confirmDelete = window.confirm("Delete this plan?");
    if (!confirmDelete) return;

    try {
      await deletePlan(planId);
      loadPlans();
    } catch (err) {
      alert(err.message || "Delete failed.");
    }
  }

  /**
   * weeklyPlans
   */
  const weeklyPlans = useMemo(() => {
    return plans.filter((p) => isWithinLastDays(p, 7));
  }, [plans]);

  /**
   * weeklyTotals
   */
  const weeklyTotals = useMemo(() => {
    const totals = {
      plansCount: weeklyPlans.length,
      miles: 0,
      driveMinutes: 0,
      totalMinutes: 0,
      gasCost: 0,
    };

    for (const p of weeklyPlans) {
      if (!p.metrics) continue;

      totals.miles += Number(p.metrics.miles || 0);
      totals.driveMinutes += Number(p.metrics.driveMinutes || 0);
      totals.totalMinutes += Number(p.metrics.totalMinutes || 0);
      totals.gasCost += Number(p.metrics.gasCost || 0);
    }

    return totals;
  }, [weeklyPlans]);

  return (
    <div className="page">
      <h1>OnTimePlanner</h1>

      <p className="muted">
        Build daily routes, estimate time, mileage, and cost.
      </p>

      <p className="hint">
        Review past routes and track your weekly performance.
      </p>

      <div className="actions">
        <Link className="button primary" to="/plan">
          Create a New Plan
        </Link>

        <Link className="button" to="/reviews">
          Reviews
        </Link>

        <button className="button" onClick={loadPlans}>
          Refresh
        </button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>Weekly Summary (Last 7 days)</h3>

        <ul>
          <li><strong>Plans:</strong> {weeklyTotals.plansCount}</li>
          <li><strong>Miles:</strong> {weeklyTotals.miles.toFixed(1)} mi</li>
          <li><strong>Drive:</strong> {formatDuration(weeklyTotals.driveMinutes)}</li>
          <li><strong>Total:</strong> {formatDuration(weeklyTotals.totalMinutes)}</li>
          <li><strong>Gas:</strong> ${weeklyTotals.gasCost.toFixed(2)}</li>
        </ul>
      </div>

      <h3 style={{ marginTop: 20 }}>Saved Plans</h3>

      {loading ? (
        <p>Loading plans...</p>
      ) : plans.length === 0 ? (
        <p>No saved plans yet.</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Stops</th>
                <th>Miles</th>
                <th>Total</th>
                <th>Gas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.stops?.length || 0}</td>
                  <td>{plan.metrics?.miles?.toFixed?.(1) || "—"}</td>
                  <td>
                    {plan.metrics?.totalMinutes
                      ? formatDuration(plan.metrics.totalMinutes)
                      : "—"}
                  </td>
                  <td>
                    {typeof plan.metrics?.gasCost === "number"
                      ? `$${plan.metrics.gasCost.toFixed(2)}`
                      : "—"}
                  </td>
                  <td>
                    <Link className="button" to={`/plan/${plan.id}`}>
                      Open
                    </Link>
                    <button
                      className="button"
                      onClick={() => handleDelete(plan.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}