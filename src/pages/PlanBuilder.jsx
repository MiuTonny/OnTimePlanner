/**
 * PlanBuilder
 *
 * PURPOSE:
 * - Build a daily plan with a start location and multiple stops
 * - Save the plan to localStorage (Project 1 persistence)
 *
 * KEY UPGRADE:
 * - Store BOTH:
 *   - a formatted address string (for display)
 *   - structured address parts (for reliable geocoding)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StopForm from "../components/StopForm";
import StopList from "../components/StopList";
import { addPlan } from "../utils/storage";

/**
 * formatAddress
 * - Builds a consistent address string for display + geocoder fallback
 *   "street, city, ST zip"
 */
function formatAddress({ street, city, state, zip }) {
  const st = state.trim().toUpperCase();
  return `${street.trim()}, ${city.trim()}, ${st} ${zip.trim()}`;
}

export default function PlanBuilder() {
  // Plan name
  const [planName, setPlanName] = useState("");

  // Start location broken into parts for better geocoding
  const [startStreet, setStartStreet] = useState("");
  const [startCity, setStartCity] = useState("");
  const [startState, setStartState] = useState("");
  const [startZip, setStartZip] = useState("");

  // Stop location broken into parts for better geocoding
  const [stopStreet, setStopStreet] = useState("");
  const [stopCity, setStopCity] = useState("");
  const [stopState, setStopState] = useState("");
  const [stopZip, setStopZip] = useState("");

  // Stop minutes input
  const [stopMinutes, setStopMinutes] = useState("");

  /**
   * stops = source of truth for all stops
   * Each stop:
   * {
   *   id,
   *   address: string (formatted display),
   *   parts: { street, city, state, zip },
   *   minutes
   * }
   */
  const [stops, setStops] = useState([]);

  // Navigate after saving
  const navigate = useNavigate();

  /**
   * handleAddStop
   * - Validates address parts + minutes
   * - Stores both formatted string + structured parts
   */
  function handleAddStop() {
    if (
      !stopStreet.trim() ||
      !stopCity.trim() ||
      !stopState.trim() ||
      !stopZip.trim()
    ) {
      return;
    }

    const minutesNum = Number(stopMinutes);
    if (!Number.isFinite(minutesNum) || minutesNum <= 0) return;

    const stopParts = {
      street: stopStreet.trim(),
      city: stopCity.trim(),
      state: stopState.trim().toUpperCase(),
      zip: stopZip.trim(),
    };

    const newStop = {
      id: Date.now(),
      address: formatAddress(stopParts),
      parts: stopParts, // ✅ structured for geocoding
      minutes: minutesNum,
    };

    setStops([...stops, newStop]);

    // Clear stop inputs
    setStopStreet("");
    setStopCity("");
    setStopState("");
    setStopZip("");
    setStopMinutes("");
  }

  /**
   * handleRemoveStop
   * - Immutable remove via filter()
   */
  function handleRemoveStop(id) {
    setStops(stops.filter((s) => s.id !== id));
  }

  /**
   * handleSavePlan
   * - Validates
   * - Saves formatted + structured start address
   * - Saves plan to localStorage
   */
  function handleSavePlan() {
    if (!planName.trim()) return;

    if (
      !startStreet.trim() ||
      !startCity.trim() ||
      !startState.trim() ||
      !startZip.trim()
    ) {
      return;
    }

    if (stops.length === 0) return;

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
      startLocation: formatAddress(startParts), // display string
      startParts, // ✅ structured for geocoding
      stops,
      createdAt: new Date().toISOString(),
    };

    addPlan(plan);
    navigate(`/plan/${planId}`);
  }

  // Derived total (service time)
  const totalMinutes = stops.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="page">
      <h1>Create Day Plan</h1>

      {/* Plan Name */}
      <h3>Plan Name</h3>
      <input
        type="text"
        placeholder="e.g., Monday Cleaning Route"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
      />

      <button onClick={handleSavePlan}>Save Plan</button>

      {/* Start Location */}
      <h3>Start Location</h3>

      <input
        type="text"
        placeholder="Street address"
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
        placeholder="State (e.g., FL)"
        value={startState}
        onChange={(e) => setStartState(e.target.value)}
        maxLength={2}
      />

      <input
        type="text"
        placeholder="ZIP"
        value={startZip}
        onChange={(e) => setStartZip(e.target.value)}
      />

      {/* StopForm (structured stop address) */}
      <StopForm
        stopStreet={stopStreet}
        setStopStreet={setStopStreet}
        stopCity={stopCity}
        setStopCity={setStopCity}
        stopState={stopState}
        setStopState={setStopState}
        stopZip={stopZip}
        setStopZip={setStopZip}
        stopMinutes={stopMinutes}
        setStopMinutes={setStopMinutes}
        onAddStop={handleAddStop}
      />

      {/* StopList */}
      <StopList stops={stops} onRemove={handleRemoveStop} />

      {/* Derived totals */}
      <h3>Total Service Time: {totalMinutes} minutes</h3>
    </div>
  );
}
