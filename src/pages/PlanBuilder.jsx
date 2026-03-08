/**
 * PlanBuilder
 *
 * UI GOAL:
 * - Route-planner style "Addresses" step
 * - Spreadsheet-like stop entry table
 * - Keep the main planning flow on one page
 *
 * PURPOSE:
 * - Build a plan with a start location + multiple stops
 * - Store structured address parts for reliable geocoding
 * - Allow quick editing of advanced route settings without leaving the page
 * - Save plan to backend API and navigate to results
 *
 * WHY THIS MATTERS:
 * - Reduces friction compared to sending the user to a separate Goals page
 * - Keeps route-building assumptions close to where the route is created
 * - Improves the overall user flow for demo and presentation
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPlan, fetchGoals, updateGoals } from "../services/api";

/**
 * formatAddress
 * - Build a display-friendly address string
 * - Example: "street, city, ST zip"
 */
function formatAddress({ street, city, state, zip }) {
  const st = state.trim().toUpperCase();
  return `${street.trim()}, ${city.trim()}, ${st} ${zip.trim()}`;
}

/**
 * Basic ZIP validation
 */
function isValidZip(zip) {
  return /^\d{5}$/.test(zip.trim());
}

/**
 * Basic state validation
 */
function isValidState(state) {
  return /^[A-Za-z]{2}$/.test(state.trim());
}

export default function PlanBuilder() {
  const navigate = useNavigate();

  /**
   * Plan identity
   */
  const [planName, setPlanName] = useState("");

  /**
   * Start address parts
   */
  const [startStreet, setStartStreet] = useState("");
  const [startCity, setStartCity] = useState("");
  const [startState, setStartState] = useState("");
  const [startZip, setStartZip] = useState("");

  /**
   * "New stop" entry row
   */
  const [stopStreet, setStopStreet] = useState("");
  const [stopCity, setStopCity] = useState("");
  const [stopState, setStopState] = useState("");
  const [stopZip, setStopZip] = useState("");
  const [stopMinutes, setStopMinutes] = useState("");

  /**
   * Advanced route settings
   * - Loaded from backend goal defaults
   * - Editable here so the user does not have to leave the Addresses page
   */
  const [returnToStart, setReturnToStart] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [mpg, setMpg] = useState(25);
  const [gasPrice, setGasPrice] = useState(3.5);

  /**
   * Stops array is the source of truth
   * stop = { id, address, parts: { street, city, state, zip }, minutes }
   */
  const [stops, setStops] = useState([]);

  /**
   * Derived service time based only on stop minutes
   * (drive time is calculated later on the Results page)
   */
  const serviceMinutes = useMemo(
    () => stops.reduce((sum, s) => sum + Number(s.minutes || 0), 0),
    [stops]
  );

  /**
   * Validation helpers for UX
   */
  const startIsValid =
    startStreet.trim() &&
    startCity.trim() &&
    isValidState(startState) &&
    isValidZip(startZip);

  const stopRowIsValid =
    stopStreet.trim() &&
    stopCity.trim() &&
    isValidState(stopState) &&
    isValidZip(stopZip) &&
    Number(stopMinutes) > 0;

  const canSave =
    planName.trim().length > 0 &&
    startIsValid &&
    stops.length > 0;

  /**
   * Load saved goal defaults from backend
   * so advanced options are pre-filled inside the plan flow.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadGoalDefaults() {
      try {
        const data = await fetchGoals();

        if (!cancelled) {
          setReturnToStart(Boolean(data.returnToStart));
          setBufferMinutes(Number(data.bufferMinutes || 0));
          setMpg(Number(data.mpg || 25));
          setGasPrice(Number(data.gasPrice || 3.5));
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadGoalDefaults();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Add a stop from the spreadsheet-like entry row
   */
  function handleAddStop() {
    if (!stopRowIsValid) return;

    const parts = {
      street: stopStreet.trim(),
      city: stopCity.trim(),
      state: stopState.trim().toUpperCase(),
      zip: stopZip.trim(),
    };

    const newStop = {
      id: Date.now(),
      address: formatAddress(parts),
      parts,
      minutes: Number(stopMinutes),
    };

    setStops([...stops, newStop]);

    // Clear entry row
    setStopStreet("");
    setStopCity("");
    setStopState("");
    setStopZip("");
    setStopMinutes("");
  }

  /**
   * Remove a stop from the current plan
   */
  function handleRemoveStop(id) {
    setStops(stops.filter((s) => s.id !== id));
  }

  /**
   * Save plan to backend
   *
   * FLOW:
   * 1) Save current advanced options as goal defaults in backend
   * 2) Save the new plan
   * 3) Navigate to Results page
   */
  async function handleSavePlan() {
    if (!canSave) return;

    const startParts = {
      street: startStreet.trim(),
      city: startCity.trim(),
      state: startState.trim().toUpperCase(),
      zip: startZip.trim(),
    };

    const planPayload = {
      name: planName.trim(),
      startLocation: formatAddress(startParts),
      startParts,
      stops,
    };

    try {
      await updateGoals({
        returnToStart,
        bufferMinutes: Number(bufferMinutes),
        mpg: Number(mpg),
        gasPrice: Number(gasPrice),
      });

      const saved = await createPlan(planPayload);
      navigate(`/plan/${saved.id}`);
    } catch (err) {
      alert(err.message || "Failed to save plan.");
    }
  }

  /**
   * Right-side map preview query
   */
  const previewQuery = encodeURIComponent(
    startIsValid
      ? formatAddress({
          street: startStreet,
          city: startCity,
          state: startState,
          zip: startZip,
        })
      : "United States"
  );

  return (
    <div className="page">
      <div className="split">
        {/* LEFT PANEL: Address + stops + advanced options */}
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Addresses</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Step 1: Enter your start address, stops, and route assumptions.
          </p>

          {/* Plan name */}
          <div className="field">
            <label className="label">Plan Name</label>
            <input
              type="text"
              placeholder="e.g., Tuesday"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          {/* Start address */}
          <div className="field">
            <label className="label">Start Location</label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <input
                type="text"
                placeholder="Street"
                value={startStreet}
                onChange={(e) => setStartStreet(e.target.value)}
              />
              <input
                type="text"
                placeholder="City"
                value={startCity}
                onChange={(e) => setStartCity(e.target.value)}
              />
              <input
                type="text"
                placeholder="State (FL)"
                value={startState}
                onChange={(e) => setStartState(e.target.value)}
                maxLength={2}
              />
              <input
                type="text"
                placeholder="ZIP (33060)"
                value={startZip}
                onChange={(e) => setStartZip(e.target.value)}
                maxLength={5}
              />
            </div>

            {!startIsValid && (
              <p className="hint">
                Tip: State must be 2 letters (FL). ZIP must be 5 digits.
              </p>
            )}
          </div>

          {/* Stops table */}
          <div className="field">
            <label className="label">Stops</label>

            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Street</th>
                  <th>City</th>
                  <th>ST</th>
                  <th>ZIP</th>
                  <th>Min</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {/* Existing stops */}
                {stops.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{s.parts?.street || "-"}</td>
                    <td>{s.parts?.city || "-"}</td>
                    <td>{s.parts?.state || "-"}</td>
                    <td>{s.parts?.zip || "-"}</td>
                    <td>{s.minutes}</td>
                    <td>
                      <button
                        className="button"
                        onClick={() => handleRemoveStop(s.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Entry row */}
                <tr>
                  <td>+</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Street"
                      value={stopStreet}
                      onChange={(e) => setStopStreet(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="City"
                      value={stopCity}
                      onChange={(e) => setStopCity(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="FL"
                      value={stopState}
                      onChange={(e) => setStopState(e.target.value)}
                      maxLength={2}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="33428"
                      value={stopZip}
                      onChange={(e) => setStopZip(e.target.value)}
                      maxLength={5}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="30"
                      value={stopMinutes}
                      onChange={(e) => setStopMinutes(e.target.value)}
                      min="1"
                    />
                  </td>
                  <td>
                    <button
                      className="button primary"
                      onClick={handleAddStop}
                      disabled={!stopRowIsValid}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Advanced options */}
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>Advanced Options</h3>
              <p className="muted" style={{ marginTop: 6 }}>
                Route assumptions used for time and cost estimates.
              </p>

              <label className="row" style={{ marginTop: 10 }}>
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
                <p className="hint">
                  Extra time for parking, setup, or transitions.
                </p>
              </div>

              <div className="field">
                <label className="label">Vehicle MPG</label>
                <input
                  type="number"
                  min="1"
                  value={mpg}
                  onChange={(e) => setMpg(e.target.value)}
                />
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
              </div>
            </div>

            <div className="actions">
              <button
                className="button primary"
                onClick={handleSavePlan}
                disabled={!canSave}
              >
                Save Plan
              </button>

              <Link className="button" to="/dashboard">
                Back to Dashboard
              </Link>
            </div>

            <p className="hint">
              Service time total: <strong>{serviceMinutes} min</strong>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Map preview */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Map Preview</h2>
          <p className="muted">
            I’ll enhance this panel later with a fuller map or route preview.
          </p>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <iframe
              title="Map Preview"
              width="100%"
              height="420"
              frameBorder="0"
              src={`https://www.openstreetmap.org/export/embed.html?search=${previewQuery}`}
            />
          </div>

          <div className="actions">
            <a
              className="button"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${previewQuery}`}
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
