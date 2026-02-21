/**
 * PlanBuilder
 *
 * UI GOAL:
 * - Route-planner style "Addresses" step
 * - Spreadsheet-like stop entry table (like MyRouteOnline)
 *
 * PURPOSE:
 * - Build a plan with a start location + multiple stops
 * - Store structured address parts for reliable geocoding
 * - Save plan to localStorage and navigate to results
 */

import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addPlan } from "../utils/storage";

/**
 * formatAddress
 * - "street, city, ST zip"
 * Used for display + string fallback
 */
function formatAddress({ street, city, state, zip }) {
  const st = state.trim().toUpperCase();
  return `${street.trim()}, ${city.trim()}, ${st} ${zip.trim()}`;
}

function isValidZip(zip) {
  return /^\d{5}$/.test(zip.trim());
}

function isValidState(state) {
  return /^[A-Za-z]{2}$/.test(state.trim());
}

export default function PlanBuilder() {
  const navigate = useNavigate();

  // Plan name
  const [planName, setPlanName] = useState("");

  // Start address parts
  const [startStreet, setStartStreet] = useState("");
  const [startCity, setStartCity] = useState("");
  const [startState, setStartState] = useState("");
  const [startZip, setStartZip] = useState("");

  // "New stop" row (spreadsheet-like entry)
  const [stopStreet, setStopStreet] = useState("");
  const [stopCity, setStopCity] = useState("");
  const [stopState, setStopState] = useState("");
  const [stopZip, setStopZip] = useState("");
  const [stopMinutes, setStopMinutes] = useState("");

  /**
   * Stops array is source of truth
   * stop = { id, address, parts: {street,city,state,zip}, minutes }
   */
  const [stops, setStops] = useState([]);

  // Derived: service time only (drive time is on results page)
  const serviceMinutes = useMemo(
    () => stops.reduce((sum, s) => sum + Number(s.minutes || 0), 0),
    [stops]
  );

  // Validation helpers for UX
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
      parts, // ✅ structured for geocoding
      minutes: Number(stopMinutes),
    };

    setStops([...stops, newStop]);

    // clear entry row
    setStopStreet("");
    setStopCity("");
    setStopState("");
    setStopZip("");
    setStopMinutes("");
  }

  function handleRemoveStop(id) {
    setStops(stops.filter((s) => s.id !== id));
  }

  function handleSavePlan() {
    if (!canSave) return;

    const startParts = {
      street: startStreet.trim(),
      city: startCity.trim(),
      state: startState.trim().toUpperCase(),
      zip: startZip.trim(),
    };

    const planId = String(Date.now());

    const plan = {
      id: planId,
      name: planName.trim(),
      startLocation: formatAddress(startParts),
      startParts, // ✅ structured for geocoding
      stops,
      createdAt: new Date().toISOString(),
    };

    addPlan(plan);
    navigate(`/plan/${planId}`);
  }

  // Right panel "map preview" — i’ll improve later (iframe/real map)
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
        {/* LEFT PANEL: Addresses */}
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Addresses</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Step 1: Enter your start address and stops.
          </p>

          {/* Plan Name */}
          <div className="field">
            <label className="label">Plan Name</label>
            <input
              type="text"
              placeholder="e.g., Tuesday"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          {/* Start Address */}
          <div className="field">
            <label className="label">Start Location</label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input
                type="text"
                placeholder="Street (e.g., 123456)"
                value={startStreet}
                onChange={(e) => setStartStreet(e.target.value)}
              />
              <input
                type="text"
                placeholder="City (e.g., Miami)"
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

          {/* Stops Table */}
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
                      <button className="button" onClick={() => handleRemoveStop(s.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Entry row (spreadsheet style) */}
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

            <div className="actions">
              <button className="button primary" onClick={handleSavePlan} disabled={!canSave}>
                Save Plan
              </button>

              <Link className="button" to="/goals">
                Next: Goals
              </Link>
            </div>

            <p className="hint">
              Service time total: <strong>{serviceMinutes} min</strong>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Map Preview (placeholder for now) */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Map Preview</h2>
          <p className="muted">
            i'll enhance this panel next (embed map / route preview).
          </p>

          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            {/* Quick embed (simple preview). i'll upgrade later. */}
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
