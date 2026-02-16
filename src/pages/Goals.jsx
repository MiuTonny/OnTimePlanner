/**
 * Goals
 * - Stores simple settings in localStorage (Project 1 frontend-only)
 *
 * SETTINGS:
 * - returnToStart: future feature
 * - bufferMinutes: extra minutes per stop (parking/setup)
 * - mpg: miles per gallon for cost estimate
 * - gasPrice: dollars per gallon
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "ontimeplanner:goals";

export default function Goals() {
  const [returnToStart, setReturnToStart] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [mpg, setMpg] = useState(25);
  const [gasPrice, setGasPrice] = useState(3.5);

  // Load saved goals once
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setReturnToStart(Boolean(parsed.returnToStart));
      setBufferMinutes(Number(parsed.bufferMinutes || 0));
      setMpg(Number(parsed.mpg || 25));
      setGasPrice(Number(parsed.gasPrice || 3.5));
    } catch {
      // ignore invalid saved data
    }
  }, []);

  // Save goals on change
  useEffect(() => {
    const payload = { returnToStart, bufferMinutes, mpg, gasPrice };
    localStorage.setItem(KEY, JSON.stringify(payload));
  }, [returnToStart, bufferMinutes, mpg, gasPrice]);

  return (
    <div className="page">
      <h1>Goals</h1>
      <p className="muted">Set parameters used in totals and cost estimates.</p>

      <div className="card">
        <label className="row">
          <input
            type="checkbox"
            checked={returnToStart}
            onChange={(e) => setReturnToStart(e.target.checked)}
          />
          <span>Return to start (future)</span>
        </label>

        <div className="field">
          <label className="label">Buffer minutes per stop</label>
          <input
            type="number"
            min="0"
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(e.target.value)}
          />
          <p className="hint">Extra time per stop (parking, setup, etc.).</p>
        </div>

        <div className="field">
          <label className="label">Vehicle MPG</label>
          <input
            type="number"
            min="1"
            value={mpg}
            onChange={(e) => setMpg(e.target.value)}
          />
          <p className="hint">Used to estimate gallons = miles ÷ MPG.</p>
        </div>

        <div className="field">
          <label className="label">Gas price ($/gallon)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={gasPrice}
            onChange={(e) => setGasPrice(e.target.value)}
          />
          <p className="hint">Manual for Project 1; API integration later.</p>
        </div>
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
