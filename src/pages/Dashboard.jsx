/**
 * Dashboard
 *
 * PURPOSE:
 * - Landing page of the app
 * - Displays saved plans from localStorage
 * - Allows user to:
 *    - Create a new plan
 *    - Open an existing plan
 *    - Delete a saved plan
 *
 * ARCHITECTURE:
 * - Uses useEffect to load data on first render
 * - Uses localStorage utility functions
 * - Uses React Router for navigation
 */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlans, removePlan } from "../utils/storage";

export default function Dashboard() {
  /**
   * plans state
   * - Holds all saved plans loaded from localStorage
   */
  const [plans, setPlans] = useState([]);

  /**
   * useEffect
   * - Runs once on first render
   * - Loads saved plans from localStorage
   */
  useEffect(() => {
    const storedPlans = getPlans();
    setPlans(storedPlans);
  }, []);

  /**
   * handleDelete
   * - Removes plan from localStorage
   * - Updates local state to re-render UI
   */
  function handleDelete(planId) {
    const updated = removePlan(planId);
    setPlans(updated);
  }

  return (
    <div className="page">
      <h1>OnTimePlanner</h1>

      {/* Navigation to create new plan */}
      <Link className="button" to="/plan">
        Create a New Plan
      </Link>

      <h3 style={{ marginTop: 20 }}>Saved Plans</h3>

      {plans.length === 0 ? (
        <p>No saved plans yet. Create one to get started.</p>
      ) : (
        <ul>
          {plans.map((plan) => (
            <li key={plan.id} style={{ marginBottom: 12 }}>
              <strong>{plan.name}</strong>{" "}
              <span style={{ opacity: 0.6 }}>
                ({plan.stops.length} stops)
              </span>

              <div style={{ marginTop: 6 }}>
                {/* Open plan results */}
                <Link to={`/plan/${plan.id}`}>
                  Open
                </Link>

                {/* Delete plan */}
                <button
                  onClick={() => handleDelete(plan.id)}
                  style={{ marginLeft: 10 }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
