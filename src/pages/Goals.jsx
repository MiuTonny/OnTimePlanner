/**
 * Goals
 * - Step 2 placeholder for route-planner style UX
 * - Stores simple settings in localStorage for Project 1 (frontend-only)
 *
 * SETTINGS:
 * - returnToStart: include return leg later (Project 2/3 optimization)
 * - bufferMinutes: extra minutes added per stop (setup, parking, etc.)
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "ontimeplanner:goals";

export default function Goals() {
  const [returnToStart, setReturnToStart] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState(0);

  // Load saved goals once
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setReturnToStart(Boolean(parsed.returnToStart));
      setBufferMinutes(Number(parsed.bufferMinutes || 0));
    } catch {
      // ignore invalid saved data
    }
  }, []);

  // Save goals on change
  useEffect(() => {
    const payload = { returnToStart, bufferMinutes };
    localStorage.setItem(KEY, JSON.stringify(payload));
  }, [returnToStart, bufferMinutes]);

  return (
    <div className="page">
      <h1>Goals</h1>
      <p className="muted">Set simple parameters for your day plan.</p>

      <div className="card">
        <label className="row">
          <input
            type="checkbox"
            checked={returnToStart}
            onChange={(e) => setReturnToStart(e.target.checked)}
          />
          <span>Return to start (include final leg)</span>
        </label>

        <div className="field">
          <label className="label">Buffer minutes per stop</label>
          <input
            type="number"
            min="0"
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(e.target.value)}
          />
          <p className="hint">
            Example: add 10 minutes per stop for parking, setup, etc.
          </p>
        </div>
      </div>

      <div className="actions">
        <Link className="button" to="/plan">
          Back to Addresses
        </Link>
        <Link className="button primary" to="/">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
