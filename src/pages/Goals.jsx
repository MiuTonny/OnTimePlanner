/**
 * Goals
 *
 * PURPOSE:
 * - Store user preferences that influence route calculations
 * - These values are used by the backend when computing metrics
 *
 * SETTINGS:
 * - Return to start (future routing option)
 * - Buffer minutes per stop (setup/parking/etc.)
 * - Vehicle MPG
 * - Gas price per gallon
 *
 * ARCHITECTURE:
 * - Data is now stored in the backend (Flask + SQL)
 * - React loads goals via API on mount
 * - Saving sends PATCH request to backend
 *
 * WHY THIS MATTERS:
 * - client → API → database flow
 * - Shows how user preferences affect computed metrics
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGoals, updateGoals } from "../services/api";

export default function Goals() {
  /**
   * React state holds editable goal values
   */
  const [returnToStart, setReturnToStart] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [mpg, setMpg] = useState(25);
  const [gasPrice, setGasPrice] = useState(3.5);

  /**
   * UI state
   */
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * Load goals from backend on page mount
   */
  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await fetchGoals();

        setReturnToStart(Boolean(data.returnToStart));
        setBufferMinutes(Number(data.bufferMinutes || 0));
        setMpg(Number(data.mpg || 25));
        setGasPrice(Number(data.gasPrice || 3.5));
      } catch (err) {
        console.error(err);
      }
    }

    loadGoals();
  }, []);

  /**
   * Save goals to backend
   */
  async function handleSaveGoals() {
    setSaving(true);
    setMessage("Goals saved. Open a plan’s Results page to refresh route totals.");

    try {
      await updateGoals({
        returnToStart,
        bufferMinutes: Number(bufferMinutes),
        mpg: Number(mpg),
        gasPrice: Number(gasPrice),
      });

      setMessage("Goals saved.");
    } catch (err) {
      setMessage(err.message || "Failed to save goals.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1>Goals</h1>

      <p className="muted">
        Set parameters used in totals and cost estimates.
      </p>

      <div className="card">

        {/* Return to start toggle (future routing option) */}
        <label className="row">
          <input
            type="checkbox"
            checked={returnToStart}
            onChange={(e) => setReturnToStart(e.target.checked)}
          />
          <span>Return to start (future)</span>
        </label>

        {/* Buffer time */}
        <div className="field">
          <label className="label">Buffer minutes per stop</label>
          <input
            type="number"
            min="0"
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(e.target.value)}
          />
          <p className="hint">
            Extra time per stop (parking, setup, etc.).
          </p>
        </div>

        {/* Vehicle MPG */}
        <div className="field">
          <label className="label">Vehicle MPG</label>
          <input
            type="number"
            min="1"
            value={mpg}
            onChange={(e) => setMpg(e.target.value)}
          />
          <p className="hint">
            Used to estimate gallons = miles ÷ MPG.
          </p>
        </div>

        {/* Gas price */}
        <div className="field">
          <label className="label">Gas price ($/gallon)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={gasPrice}
            onChange={(e) => setGasPrice(e.target.value)}
          />
          <p className="hint">
            Used by the backend during metric calculation.
          </p>
        </div>

        <div className="actions">
          <button
            className="button primary"
            onClick={handleSaveGoals}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Goals"}
          </button>
        </div>

        {message && <p className="hint">{message}</p>}
      </div>

      <div className="actions">
        <Link className="button" to="/plan">
          Back to Addresses
        </Link>

        <Link className="button primary" to="/">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
