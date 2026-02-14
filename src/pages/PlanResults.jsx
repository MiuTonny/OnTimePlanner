/**
 * PlanResults
 *
 * PURPOSE:
 * - Displays a saved plan based on the route param (id)
 * - Reads plan data from localStorage
 * - Handles missing plan safely
 *
 * ARCHITECTURE:
 * - Uses useParams to read dynamic route
 * - Uses storage utility to retrieve saved plans
 * - Performs lookup by id
 */

import { useParams, Link } from "react-router-dom";
import { getPlans } from "../utils/storage";

export default function PlanResults() {
  /**
   * useParams
   * - Extracts dynamic route parameter from URL
   * - Example: /plan/123 → id = "123"
   */
  const { id } = useParams();

  /**
   * Load all saved plans from localStorage
   */
  const plans = getPlans();

  /**
   * Find the plan that matches the route id
   */
  const plan = plans.find((p) => p.id === id);

  /**
   * If plan not found, render fallback UI
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

  return (
    <div className="page">
      <h1>Route Results</h1>

      {/* Plan Name */}
      <h2>{plan.name}</h2>

      {/* Start Location */}
      <p>
        <strong>Start Location:</strong> {plan.startLocation}
      </p>

      {/* Stops List */}
      <h3>Stops</h3>
      <ol>
        {plan.stops.map((stop) => (
          <li key={stop.id}>
            {stop.address} — {stop.minutes} minutes
          </li>
        ))}
      </ol>

      {/* Back navigation */}
      <div style={{ marginTop: 20 }}>
        <Link className="button" to="/">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
